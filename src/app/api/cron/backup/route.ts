// app/api/cron/backup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, BackupType, Prisma } from "@prisma/client";
import { getListHoldedContacts } from "@/src/lib/actions/vendors/holded/contacts";
import moment from "moment-timezone";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();
const MADRID_TIMEZONE = "Europe/Madrid";

async function updateCurrentBackup() {
  const contactsData = await getListHoldedContacts();
  const now = moment().tz(MADRID_TIMEZONE);

  if (contactsData === null) {
    throw new Error("Failed to fetch contacts data");
  }

  const existingCurrentBackup = await prisma.contactBackup.findFirst({
    where: { type: BackupType.CURRENT },
  });

  if (existingCurrentBackup) {
    return await prisma.contactBackup.update({
      where: { id: existingCurrentBackup.id },
      data: {
        data: contactsData as Prisma.InputJsonValue,
        updatedAt: now.toDate(),
      },
    });
  } else {
    return await prisma.contactBackup.create({
      data: {
        type: BackupType.CURRENT,
        data: contactsData as Prisma.InputJsonValue,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      },
    });
  }
}

async function createDailyBackup(currentBackup: any) {
  const now = moment().tz(MADRID_TIMEZONE);

  const newBackup = await prisma.contactBackup.create({
    data: {
      type: BackupType.DAILY,
      data: currentBackup.data,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
      expiresAt: now.clone().add(31, "days").toDate(),
    },
  });

  // Limpieza de backups antiguos
  const dailyBackupsCount = await prisma.contactBackup.count({
    where: { type: BackupType.DAILY },
  });

  if (dailyBackupsCount > 31) {
    const backupsToDelete = await prisma.contactBackup.findMany({
      where: {
        type: BackupType.DAILY,
        FavoriteBackup: { none: {} }, // Esto reemplaza la verificación de isFavorite
      },
      orderBy: { createdAt: "asc" },
      take: dailyBackupsCount - 31,
    });

    await prisma.contactBackup.deleteMany({
      where: {
        id: {
          in: backupsToDelete.map((backup) => backup.id),
        },
      },
    });
  }

  return newBackup;
}

async function createMonthlyBackup(currentBackup: any) {
  const now = moment().tz(MADRID_TIMEZONE);

  return await prisma.contactBackup.create({
    data: {
      type: BackupType.MONTHLY,
      data: currentBackup.data,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const now = moment().tz(MADRID_TIMEZONE);
    const isFirstDayOfMonth = now.date() === 1;

    // Actualizar el backup actual
    const currentBackup = await updateCurrentBackup();

    // Crear backup diario
    const dailyBackup = await createDailyBackup(currentBackup);

    let monthlyBackup = null;
    // Crear backup mensual si es el primer día del mes
    if (isFirstDayOfMonth) {
      monthlyBackup = await createMonthlyBackup(currentBackup);
    }

    return NextResponse.json({
      currentBackup,
      dailyBackup,
      monthlyBackup,
      message: "Backup process completed successfully",
    });
  } catch (error) {
    console.error("Error in backup process:", error);
    return NextResponse.json(
      { error: "Failed to complete backup process" },
      { status: 500 }
    );
  }
}
