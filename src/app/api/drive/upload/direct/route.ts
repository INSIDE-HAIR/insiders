import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleDriveService } from "@/src/features/drive/services/drive/GoogleDriveService";

export async function POST(request: NextRequest) {
  console.log("=== DIRECT UPLOAD ENDPOINT START ===");

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

    // Parse form data instead of JSON
    console.log("2. Parsing form data...");
    const formData = await request.formData();
    const folderId = formData.get("folderId") as string;
    const file = formData.get("file") as File;
    const description =
      (formData.get("description") as string) ||
      `Uploaded via Direct Upload on ${new Date().toISOString()}`;

    console.log("Form data received:", {
      folderId,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      description: description.substring(0, 50) + "...",
    });

    if (!folderId || !file) {
      console.log("❌ Missing required fields:", {
        folderId: !!folderId,
        file: !!file,
      });
      return NextResponse.json(
        { error: "Missing required fields: folderId and file" },
        { status: 400 }
      );
    }

    // Initialize Google Drive service
    console.log("3. Initializing Google Drive service...");
    const driveService = new GoogleDriveService();

    console.log("Environment variables check:", {
      hasClientEmail: !!process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_DRIVE_PRIVATE_KEY,
      hasProjectId: !!process.env.GOOGLE_DRIVE_PROJECT_ID,
      clientEmailPrefix: process.env.GOOGLE_DRIVE_CLIENT_EMAIL?.substring(
        0,
        20
      ),
    });

    await driveService.initialize();
    console.log("✅ Google Drive service initialized");

    // Upload file directly using existing service
    console.log("4. Starting upload...");
    console.log(
      `Uploading file: ${file.name} (${file.size} bytes) to folder: ${folderId}`
    );

    const uploadedFile = await driveService.uploadFile(file, {
      parentId: folderId,
      description: description,
    });

    console.log("✅ Upload successful:", {
      id: uploadedFile.id,
      name: uploadedFile.name,
      size: uploadedFile.size,
    });
    console.log("=== DIRECT UPLOAD ENDPOINT SUCCESS ===");

    return NextResponse.json({
      success: true,
      file: {
        id: uploadedFile.id,
        name: uploadedFile.name,
        webViewLink: uploadedFile.webViewLink,
        size: uploadedFile.size,
        mimeType: uploadedFile.mimeType,
      },
    });
  } catch (error) {
    console.log("=== DIRECT UPLOAD ENDPOINT ERROR ===");
    console.error("❌ Direct upload failed:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Log additional error details
    console.error("Full error object:", JSON.stringify(error, null, 2));

    // Check if it's a Google API error
    if (error && typeof error === "object" && "code" in error) {
      console.error("Google API error code:", error.code);
      if ("message" in error) {
        console.error("Google API error message:", error.message);
      }
    }

    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
