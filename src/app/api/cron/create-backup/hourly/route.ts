import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getListHoldedContacts } from "@/src/lib/actions/vendors/holded/contacts";
import moment from "moment-timezone";

const prisma = new PrismaClient();
const MADRID_TIMEZONE = "Europe/Madrid";

export async function GET(request: NextRequest) {
  try {
    const contactsData = await getListHoldedContacts();
    const now = moment().tz(MADRID_TIMEZONE);

    const newBackup = await prisma.contactBackup.create({
      data: {
        data: contactsData,
        isDaily: false,
        expiresAt: now.clone().add(24, "hours").toDate(),
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      },
    });

    // Limpiar los backups horarios antiguos (mantener solo las últimas 24 horas)
    const hourlyBackups = await prisma.contactBackup.findMany({
      where: { isDaily: false },
      orderBy: { createdAt: "desc" },
    });

    const oldestAllowedBackup = moment().subtract(24, "hours").toDate();
    for (const backup of hourlyBackups) {
      if (backup.createdAt < oldestAllowedBackup) {
        await prisma.contactBackup.delete({
          where: { id: backup.id },
        });
      }
    }

    return NextResponse.json(newBackup);
  } catch (error) {
    console.error("Error creating hourly backup:", error);
    return NextResponse.json(
      { error: "Failed to create hourly backup" },
      { status: 500 }
    );
  }
}
