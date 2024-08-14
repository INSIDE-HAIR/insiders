// app/api/vendor/holded/contacts/backups/current/route.ts

import {
  createOrUpdateCurrentBackup,
  getCurrentBackup,
} from "@/src/lib/utils/holdedContactsBackupUtils";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Handle GET requests
export async function GET() {
  try {
    const backup = await getCurrentBackup();
    return NextResponse.json(backup);
  } catch (error: unknown) {
    console.error("Error fetching current backup:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}

// Handle POST requests
export async function POST(req: NextRequest) {
  try {
    const backup = await createOrUpdateCurrentBackup(); // Pass the data to the utility function
    return NextResponse.json(backup);
  } catch (error: unknown) {
    console.error("Error creating or updating current backup:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
