// app/api/contact-backups/current/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getListHoldedContacts } from "@/src/lib/actions/vendors/holded/contacts";
import moment from "moment-timezone";

const prisma = new PrismaClient();
const MADRID_TIMEZONE = "Europe/Madrid";

export async function POST(request: NextRequest) {
  try {
    const contactsData = await getListHoldedContacts();
    const now = moment().tz(MADRID_TIMEZONE);

    // First, find the current backup
    let currentBackup = await prisma.contactBackup.findUnique({
      where: { isCurrent: true },
    });

    if (currentBackup) {
      // If it exists, update it
      currentBackup = await prisma.contactBackup.update({
        where: { id: currentBackup.id },
        data: {
          data: contactsData,
          expiresAt: now.clone().add(1, "hour").toDate(), // 1 hour from now
          updatedAt: now.toDate(),
        },
      });
    } else {
      // If it doesn't exist, create it
      currentBackup = await prisma.contactBackup.create({
        data: {
          data: contactsData,
          isFavorite: false,
          isCurrent: true,
          isDaily: false,
          expiresAt: now.clone().add(1, "hour").toDate(), // 1 hour from now
          createdAt: now.toDate(),
          updatedAt: now.toDate(),
        },
      });
    }

    return NextResponse.json(currentBackup);
  } catch (error) {
    console.error("Error updating current backup:", error);
    return NextResponse.json(
      { error: "Failed to update current backup" },
      { status: 500 }
    );
  }
}
