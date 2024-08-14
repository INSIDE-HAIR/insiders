// app/api/contact-backups/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getListHoldedContacts } from "@/src/lib/actions/vendors/holded/contacts";
import moment from "moment-timezone";

const prisma = new PrismaClient();
const MADRID_TIMEZONE = "Europe/Madrid";

export async function GET(request: NextRequest) {
  try {
    const [favoriteBackups, dailyBackups] = await Promise.all([
      prisma.contactBackup.findMany({
        where: { isFavorite: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.contactBackup.findMany({
        where: { isDaily: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const currentBackup = dailyBackups[0] || null; // The most recent backup is the current one

    return NextResponse.json({ favoriteBackups, dailyBackups, currentBackup });
  } catch (error) {
    console.error("Error fetching backups:", error);
    return NextResponse.json(
      { error: "Failed to fetch backups" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contactsData = await getListHoldedContacts();
    const now = moment().tz(MADRID_TIMEZONE);

    const newBackup = await prisma.contactBackup.create({
      data: {
        data: contactsData,
        isDaily: true,
        expiresAt: now.clone().add(31, "days").toDate(),
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      },
    });

    // Check and remove oldest daily backup if we have more than 31
    const dailyBackupsCount = await prisma.contactBackup.count({
      where: { isDaily: true },
    });
    if (dailyBackupsCount > 31) {
      const oldestDailyBackup = await prisma.contactBackup.findFirst({
        where: { isDaily: true, isFavorite: false },
        orderBy: { createdAt: "asc" },
      });
      if (oldestDailyBackup) {
        await prisma.contactBackup.delete({
          where: { id: oldestDailyBackup.id },
        });
      }
    }

    return NextResponse.json(newBackup);
  } catch (error) {
    console.error("Error creating backup:", error);
    return NextResponse.json(
      { error: "Failed to create backup" },
      { status: 500 }
    );
  }
}
