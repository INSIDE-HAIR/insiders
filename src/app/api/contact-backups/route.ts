// app/api/contact-backups/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getListHoldedContacts } from "@/src/lib/actions/vendors/holded/contacts";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const [favoriteBackups, dailyBackups, currentBackup] = await Promise.all([
      prisma.contactBackup.findMany({
        where: { isFavorite: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.contactBackup.findMany({
        where: { isDaily: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.contactBackup.findUnique({
        where: { isCurrent: true },
      }),
    ]);

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

    // Delete oldest daily backup if we have more than 31
    const dailyBackupsCount = await prisma.contactBackup.count({
      where: { isDaily: true },
    });
    if (dailyBackupsCount >= 31) {
      const oldestDailyBackup = await prisma.contactBackup.findFirst({
        where: { isDaily: true },
        orderBy: { createdAt: "asc" },
      });
      if (oldestDailyBackup) {
        await prisma.contactBackup.delete({
          where: { id: oldestDailyBackup.id },
        });
      }
    }

    const newBackup = await prisma.contactBackup.create({
      data: {
        data: contactsData,
        isDaily: true,
        expiresAt: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000), // 31 days from now
      },
    });

    return NextResponse.json(newBackup);
  } catch (error) {
    console.error("Error creating backup:", error);
    return NextResponse.json(
      { error: "Failed to create backup" },
      { status: 500 }
    );
  }
}
