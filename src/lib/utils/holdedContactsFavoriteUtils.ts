import { PrismaClient, HoldedContactsBackupType } from "@prisma/client";

const prisma = new PrismaClient();

let MAX_FAVORITES = 5;

export async function addToFavorites(
  backupType: HoldedContactsBackupType,
  backupId: string,
  name?: string
) {
  const favoriteCount = await prisma.holdedContactsFavoriteBackup.count();
  if (favoriteCount >= MAX_FAVORITES) {
    throw new Error(`Cannot add more than ${MAX_FAVORITES} favorites`);
  }

  let originalBackup: any;

  // Type guard to narrow down the model type
  if (backupType === HoldedContactsBackupType.CURRENT) {
    originalBackup = await prisma.holdedContactsCurrentBackup.findUnique({
      where: { id: backupId },
    });
  } else if (backupType === HoldedContactsBackupType.DAILY) {
    originalBackup = await prisma.holdedContactsDailyBackup.findUnique({
      where: { id: backupId },
    });
  } else if (backupType === HoldedContactsBackupType.MONTHLY) {
    originalBackup = await prisma.holdedContactsMonthlyBackup.findUnique({
      where: { id: backupId },
    });
  } else if (backupType === HoldedContactsBackupType.FAVORITE) {
    originalBackup = await prisma.holdedContactsFavoriteBackup.findUnique({
      where: { id: backupId },
    });
  } else {
    throw new Error(`No model found for backup type ${backupType}`);
  }

  if (!originalBackup) {
    throw new Error("Original backup not found");
  }

  return prisma.holdedContactsFavoriteBackup.create({
    data: {
      data: originalBackup.data,
      originalType: backupType,
      dayOfMonth:
        "dayOfMonth" in originalBackup ? originalBackup.dayOfMonth : null,
      month: "month" in originalBackup ? originalBackup.month : null,
      year: "year" in originalBackup ? originalBackup.year : null,
      name,
      length: originalBackup.length,
    },
  });
}

export async function deleteBackupById(type: string, id: string) {
  switch (type) {
    case "CURRENT":
      return prisma.holdedContactsCurrentBackup.delete({
        where: { id },
      });
    case "DAILY":
      return prisma.holdedContactsDailyBackup.delete({
        where: { id },
      });
    case "MONTHLY":
      return prisma.holdedContactsMonthlyBackup.delete({
        where: { id },
      });
    case "FAVORITE":
      return prisma.holdedContactsFavoriteBackup.delete({
        where: { id },
      });
    default:
      throw new Error("Invalid backup type");
  }
}

export async function removeFavorite(favoriteId: string) {
  return prisma.holdedContactsFavoriteBackup.delete({
    where: { id: favoriteId },
  });
}

export async function getFavorites() {
  try {
    const favorites = await prisma.holdedContactsFavoriteBackup.findMany();
    return favorites; // This will be an empty array if no favorites are found
  } catch (error) {
    throw error; // Re-throw the error to be handled by the API route
  }
}
//no se esta usando
export function setMaxFavorites(newMax: number) {
  MAX_FAVORITES = newMax;
}

//no se esta usando
export function getMaxFavorites() {
  return MAX_FAVORITES;
}
