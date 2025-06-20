import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";

// Configuración de la ruta como dinámica para evitar la generación estática
export const dynamic = "force-dynamic";
// Aumentar el límite de tiempo de respuesta para archivos grandes
export const maxDuration = 60;
// Configurar para manejar payloads grandes via streaming
export const preferredRegion = "auto";

export async function PUT(request: NextRequest) {
  console.log("=== RESUMABLE CHUNK PROXY START ===");

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

    // Get query parameters
    const url = new URL(request.url);
    const resumableURI = url.searchParams.get("resumableURI");
    const contentRange = request.headers.get("content-range");

    console.log("2. Processing chunk upload:", {
      resumableURI: resumableURI?.substring(0, 100) + "...",
      contentRange,
      contentLength: request.headers.get("content-length"),
      contentType: request.headers.get("content-type"),
    });

    if (!resumableURI) {
      console.log("❌ Missing resumableURI parameter");
      return NextResponse.json(
        { error: "Missing resumableURI parameter" },
        { status: 400 }
      );
    }

    // Stream the chunk data without loading into memory
    console.log("3. Setting up streaming proxy...");

    // Get content length from headers
    const contentLength = request.headers.get("content-length");
    console.log(`✅ Content-Length: ${contentLength} bytes`);

    // Prepare headers for Google Drive (forward from original request)
    const headers: Record<string, string> = {
      "Content-Type":
        request.headers.get("content-type") || "application/octet-stream",
    };

    if (contentLength) {
      headers["Content-Length"] = contentLength;
    }

    if (contentRange) {
      headers["Content-Range"] = contentRange;
    }

    console.log("4. Forwarding stream to Google Drive...");
    console.log("Headers to send:", headers);

    // Forward the stream directly to Google Drive without loading into memory
    const response = await fetch(resumableURI, {
      method: "PUT",
      headers,
      body: request.body, // Stream the body directly
      // @ts-ignore - duplex is required for streaming but not yet in TypeScript types
      duplex: "half",
    });

    console.log("Google Drive response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    // Log response headers for debugging
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    console.log("Google Drive response headers:", responseHeaders);

    // Read response body
    const responseBody = await response.text();
    console.log("Google Drive response body:", responseBody.substring(0, 500));

    // Status 308 "Resume Incomplete" is EXPECTED for chunked uploads
    // Status 200/201 means upload completed successfully
    if (!response.ok && response.status !== 308) {
      console.log("❌ Google Drive upload failed");
      throw new Error(
        `Google Drive upload failed: ${response.status} ${response.statusText}`
      );
    }

    if (response.status === 308) {
      console.log(
        "✅ Chunk uploaded - more chunks expected (308 Resume Incomplete)"
      );
    } else {
      console.log("✅ Upload completed successfully");
    }
    console.log("=== RESUMABLE CHUNK PROXY SUCCESS ===");

    // Return the response from Google Drive to the client
    const result = {
      success: true,
      status: response.status,
      statusText: response.statusText,
      body: responseBody,
      headers: responseHeaders,
    };

    return NextResponse.json(result, {
      status: response.status,
      headers: {
        // Forward important headers from Google Drive
        ...(responseHeaders.range && { Range: responseHeaders.range }),
        ...(responseHeaders["x-guploader-uploadid"] && {
          "X-GUploader-UploadId": responseHeaders["x-guploader-uploadid"],
        }),
      },
    });
  } catch (error) {
    console.log("=== RESUMABLE CHUNK PROXY ERROR ===");
    console.error("❌ Failed to proxy chunk upload:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        error: "Failed to proxy chunk upload",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
