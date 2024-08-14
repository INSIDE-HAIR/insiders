// app/api/vendor/holded/contacts/backups/daily/route.ts

import {
  createOrUpdateDailyBackup,
  getDailyBackups,
} from "@/src/lib/utils/holdedContactsBackupUtils";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const backups = await getDailyBackups();
    return NextResponse.json(backups);
  } catch (error: unknown) {
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

export async function POST() {
  try {
    const backup = await createOrUpdateDailyBackup();
    return NextResponse.json(backup);
  } catch (error: unknown) {
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
