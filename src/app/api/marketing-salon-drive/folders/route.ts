import { NextResponse } from "next/server";
import { GoogleDriveService } from "@/src/features/marketing-salon-drive/services/drive/GoogleDriveService";

export async function GET() {
  try {
    const driveService = new GoogleDriveService();
    const folders = await driveService.listAvailableFolders();

    return NextResponse.json({
      success: true,
      data: folders,
      metadata: {
        count: folders.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error listing folders:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to list folders",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
