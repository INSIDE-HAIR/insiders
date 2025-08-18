/**
 * Recording Download API Endpoint
 * GET /api/recordings/download/[token]
 */

import { NextRequest, NextResponse } from "next/server";
import { RecordingDownloadService } from "@/features/video-conferencing/services/RecordingDownloadService";
import { headers } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const downloadToken = params.token;
    const { searchParams } = new URL(request.url);
    const quality =
      (searchParams.get("quality") as "HD" | "SD" | "AUDIO_ONLY") || "SD";

    // Get client information
    const headersList = headers();
    const userAgent = headersList.get("user-agent") || undefined;
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0] || realIp || undefined;

    const downloadService = new RecordingDownloadService();

    // Validate token and get recording info
    const validation = await downloadService.validateAndServeDownload(
      downloadToken,
      userAgent,
      ipAddress
    );

    if (!validation.isValid || !validation.recordingInfo) {
      return NextResponse.json(
        { error: validation.error || "Invalid download token" },
        { status: 403 }
      );
    }

    const recording = validation.recordingInfo;

    // For demonstration, we'll return a redirect to the actual file
    // In a real implementation, you might:
    // 1. Stream the file directly through your server
    // 2. Generate a signed URL from cloud storage
    // 3. Proxy the download through your server for security

    // Mock file streaming response
    const mockFileContent = generateMockRecordingContent(recording, quality);
    const fileName = `recording_${recording.meetingId}_${quality.toLowerCase()}.mp4`;

    return new NextResponse(mockFileContent, {
      headers: {
        "Content-Type": quality === "AUDIO_ONLY" ? "audio/mpeg" : "video/mp4",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": mockFileContent.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Download error:", error);

    return NextResponse.json(
      {
        error: "Download failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Generate mock recording content for demonstration
function generateMockRecordingContent(recording: any, quality: string): Buffer {
  // In a real implementation, this would stream the actual recording file
  const mockContent = `Mock ${quality} recording content for meeting ${recording.meetingId}`;
  return Buffer.from(mockContent, "utf8");
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
