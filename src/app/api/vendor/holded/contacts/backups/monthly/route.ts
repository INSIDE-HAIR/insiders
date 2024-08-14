// app/api/vendor/holded/contacts/backups/monthly/route.ts

import {
  createOrUpdateMonthlyBackup,
  getMonthlyBackups,
} from "@/src/lib/utils/holdedContactsBackupUtils";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const backups = await getMonthlyBackups();
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
    const backup = await createOrUpdateMonthlyBackup();
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
