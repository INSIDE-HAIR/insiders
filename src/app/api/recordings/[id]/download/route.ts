/**
 * Recording Download URL Generation API Endpoint
 * POST /api/recordings/[id]/download
 */

import { NextRequest, NextResponse } from "next/server";
import {
  RecordingDownloadService,
  DownloadOptions,
} from "@/features/video-conferencing/services/RecordingDownloadService";
import { z } from "zod";

// Request body validation schema
const downloadRequestSchema = z.object({
  quality: z.enum(["HD", "SD", "AUDIO_ONLY"]).optional().default("SD"),
  format: z.enum(["mp4", "mp3", "wav"]).optional(),
  includeTranscription: z.boolean().optional().default(false),
  includeChat: z.boolean().optional().default(false),
  watermark: z.boolean().optional().default(false),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordingId = params.id;
    const body = await request.json();

    // Validate request body
    const validationResult = downloadRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const options: DownloadOptions = validationResult.data;

    // Get user information (in a real app, this would come from authentication)
    const userId = "user-123"; // Mock user ID
    const userRole = "user"; // Mock user role

    const downloadService = new RecordingDownloadService();

    // Check permissions first
    const permissions = await downloadService.checkDownloadPermissions(
      recordingId,
      userId,
      userRole
    );

    if (!permissions.canDownload) {
      return NextResponse.json(
        {
          error: "Download not permitted",
          reasons: permissions.reasons,
        },
        { status: 403 }
      );
    }

    // Validate specific permissions
    if (options.includeTranscription && !permissions.canDownloadTranscription) {
      return NextResponse.json(
        {
          error: "Transcription download not permitted",
        },
        { status: 403 }
      );
    }

    if (options.includeChat && !permissions.canDownloadChat) {
      return NextResponse.json(
        {
          error: "Chat download not permitted",
        },
        { status: 403 }
      );
    }

    // Generate download URL
    const downloadResult = await downloadService.generateDownloadUrl(
      recordingId,
      userId,
      options
    );

    return NextResponse.json({
      success: true,
      download: downloadResult,
      permissions: {
        maxQuality: permissions.maxQuality,
        canDownloadRecording: permissions.canDownloadRecording,
        canDownloadTranscription: permissions.canDownloadTranscription,
        canDownloadChat: permissions.canDownloadChat,
      },
    });
  } catch (error) {
    console.error("Download URL generation error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate download URL",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordingId = params.id;

    // Get user information (in a real app, this would come from authentication)
    const userId = "user-123"; // Mock user ID
    const userRole = "user"; // Mock user role

    const downloadService = new RecordingDownloadService();

    // Get permissions and download stats
    const [permissions, stats] = await Promise.all([
      downloadService.checkDownloadPermissions(recordingId, userId, userRole),
      downloadService.getDownloadStats(recordingId),
    ]);

    return NextResponse.json({
      recordingId,
      permissions,
      stats,
      supportedQualities: ["HD", "SD", "AUDIO_ONLY"],
      supportedFormats: ["mp4", "mp3", "wav"],
    });
  } catch (error) {
    console.error("Download info error:", error);

    return NextResponse.json(
      {
        error: "Failed to get download information",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const downloadToken = searchParams.get("token");

    if (!downloadToken) {
      return NextResponse.json(
        { error: "Download token is required" },
        { status: 400 }
      );
    }

    const downloadService = new RecordingDownloadService();
    const revoked = downloadService.revokeDownloadToken(downloadToken);

    if (!revoked) {
      return NextResponse.json(
        { error: "Token not found or already expired" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Download token revoked successfully",
    });
  } catch (error) {
    console.error("Token revocation error:", error);

    return NextResponse.json(
      {
        error: "Failed to revoke download token",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
