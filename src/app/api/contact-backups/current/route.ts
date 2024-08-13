// app/api/contact-backups/current/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getListHoldedContacts } from "@/src/lib/actions/vendors/holded/contacts";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const contactsData = await getListHoldedContacts();

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
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days from now
          updatedAt: new Date(),
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
          expiresAt: new Date(Date.now() + 1 * 1 * 60 * 60 * 1000), // 1 hour from now
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
