import { PrismaClient, HoldedContactsBackupType } from "@prisma/client";

const prisma = new PrismaClient();

const MAX_FAVORITES = 5;

export async function getFavoriteBackups() {
  try {
    return await prisma.holdedContactsFavoriteBackup.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        originalId: true,
        originalType: true,
        dayOfMonth: true,
        month: true,
        year: true,
        length: true,
        // Exclude the `data` field
      },
    });
  } catch (error) {
    console.error("Error fetching favorite backups:", error);
    throw error;
  }
}

export async function getFavoriteBackupsData(id: string) {
  return prisma.holdedContactsFavoriteBackup.findUnique({
    where: { id },
    select: {
      data: true, // Extrae solo el campo `data`
    },
  });
}

export async function toggleFavoriteBackup(
  backupId: string,
  originalType: HoldedContactsBackupType
) {
  const existingFavorite = await prisma.holdedContactsFavoriteBackup.findFirst({
    where: { id: backupId },
  });

  if (existingFavorite) {
    return prisma.holdedContactsFavoriteBackup.delete({
      where: { id: backupId },
    });
  } else {
    const favoriteCount = await prisma.holdedContactsFavoriteBackup.count();
    if (favoriteCount >= MAX_FAVORITES) {
      throw new Error(`Cannot add more than ${MAX_FAVORITES} favorites`);
    }

    let originalBackup: any;

    switch (originalType) {
      case HoldedContactsBackupType.CURRENT:
        originalBackup = await prisma.holdedContactsCurrentBackup.findUnique({
          where: { id: backupId },
        });
        break;
      case HoldedContactsBackupType.DAILY:
        originalBackup = await prisma.holdedContactsDailyBackup.findUnique({
          where: { id: backupId },
        });
        break;
      case HoldedContactsBackupType.MONTHLY:
        originalBackup = await prisma.holdedContactsMonthlyBackup.findUnique({
          where: { id: backupId },
        });
        break;
      default:
        throw new Error(`Invalid original backup type: ${originalType}`);
    }

    if (!originalBackup) {
      throw new Error("Original backup not found");
    }

    return prisma.holdedContactsFavoriteBackup.create({
      data: {
        id: backupId,
        originalId: backupId,
        data: originalBackup.data,
        originalType,
        dayOfMonth:
          "dayOfMonth" in originalBackup ? originalBackup.dayOfMonth : null,
        month: "month" in originalBackup ? originalBackup.month : null,
        year: "year" in originalBackup ? originalBackup.year : null,
        length: originalBackup.length,
      },
    });
  }
}

export async function deleteFavoriteBackup(id: string) {
  try {
    return await prisma.holdedContactsFavoriteBackup.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting favorite backup:", error);
    throw error;
  }
}


export function getMaxFavorites() {
  return MAX_FAVORITES;
}
