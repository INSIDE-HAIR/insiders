import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleDriveService } from "@/src/features/drive/services/drive/GoogleDriveService";
import { google } from "googleapis";

export async function POST(request: NextRequest) {
  console.log("=== INIT RESUMABLE UPLOAD START ===");

  try {
    console.log("1. Checking authentication...");
    const session = await auth();
    if (!session?.user) {
      console.log("❌ Authentication failed - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ User authenticated:", {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    // Only admins can use direct upload
    if (session.user.role !== "ADMIN") {
      console.log("❌ Permission denied - user is not admin");
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    console.log("✅ Admin permission confirmed");

    // Parse request body
    console.log("2. Parsing request body...");
    const body = await request.json();
    const { fileName, fileSize, mimeType, folderId, description } = body;

    console.log("Request data:", {
      fileName,
      fileSize,
      mimeType,
      folderId,
      description: description?.substring(0, 50) + "...",
    });

    if (!fileName || !fileSize || !folderId) {
      console.log("❌ Missing required fields:", {
        fileName: !!fileName,
        fileSize: !!fileSize,
        folderId: !!folderId,
      });
      return NextResponse.json(
        { error: "Missing required fields: fileName, fileSize, folderId" },
        { status: 400 }
      );
    }

    // Initialize Google Drive service
    console.log("3. Initializing Google Drive service...");

    const googleAuth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
        project_id: process.env.GOOGLE_DRIVE_PROJECT_ID,
      },
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const authClient = await googleAuth.getClient();
    const accessTokenResponse = await authClient.getAccessToken();

    if (!accessTokenResponse.token) {
      throw new Error("Failed to get access token");
    }

    console.log("✅ Access token obtained");

    // Prepare metadata for Google Drive
    const metadata = {
      name: fileName,
      parents: [folderId],
      description:
        description ||
        `Uploaded via True Direct Upload on ${new Date().toISOString()}`,
    };

    console.log(
      "4. Initializing resumable upload session with Google Drive..."
    );

    // Initialize resumable upload session
    const initResponse = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessTokenResponse.token}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": mimeType || "application/octet-stream",
          "X-Upload-Content-Length": fileSize.toString(),
        },
        body: JSON.stringify(metadata),
      }
    );

    console.log("Google Drive init response:", {
      status: initResponse.status,
      statusText: initResponse.statusText,
      ok: initResponse.ok,
    });

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      console.log("❌ Failed to initialize upload session:", errorText);
      throw new Error(`Failed to initialize upload: ${errorText}`);
    }

    const resumableURI = initResponse.headers.get("Location");
    if (!resumableURI) {
      console.log("❌ No resumable URI returned");
      throw new Error("No resumable URI returned from Google Drive");
    }

    console.log("✅ Resumable upload session initialized successfully");
    console.log("Resumable URI:", resumableURI.substring(0, 100) + "...");
    console.log("=== INIT RESUMABLE UPLOAD SUCCESS ===");

    return NextResponse.json({
      success: true,
      resumableURI,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days (Google's limit)
    });
  } catch (error) {
    console.log("=== INIT RESUMABLE UPLOAD ERROR ===");
    console.error("❌ Failed to initialize resumable upload:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Log additional error details
    console.error("Full error object:", JSON.stringify(error, null, 2));

    return NextResponse.json(
      {
        error: "Failed to initialize resumable upload",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
