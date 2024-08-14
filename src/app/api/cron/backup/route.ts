import { NextRequest, NextResponse } from "next/server";
import {
  createOrUpdateDailyBackup,
  createOrUpdateMonthlyBackup,
} from "@/src/lib/utils/holdedContactsBackupUtils";

// This function will handle the cron job
export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const isLastDayOfMonth =
      new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() ===
      dayOfMonth;

    if (isLastDayOfMonth) {
      // Create or update monthly backup
      await createOrUpdateMonthlyBackup();
    }

    // Create or update daily backup regardless
    await createOrUpdateDailyBackup();

    return NextResponse.json({
      success: true,
      message: "Backup created successfully",
    });
  } catch (error: unknown) {
    console.error("Error running cron backup:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
