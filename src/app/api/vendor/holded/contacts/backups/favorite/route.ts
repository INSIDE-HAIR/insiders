import { NextResponse } from "next/server";
import { getFavoriteBackups } from "@/src/lib/utils/holdedContactsFavoriteUtils";
import { ObjectId } from "mongodb";
import { PrismaClient, HoldedContactsBackupType, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const favorites = await getFavoriteBackups();
    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Error fetching favorite backups:", error);
    return NextResponse.json(
      { error: "Error fetching favorite backups" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { backupId, originalType } = await request.json();

    // Check if the backup is already in favorites
    const existingFavorite =
      await prisma.holdedContactsFavoriteBackup.findFirst({
        where: { originalId: backupId },
      });

    if (existingFavorite) {
      // If it exists, remove it from favorites
      await prisma.holdedContactsFavoriteBackup.delete({
        where: { id: existingFavorite.id },
      });
      return NextResponse.json({ message: "Backup removed from favorites" });
    } else {
      // If it doesn't exist, find the original backup
      let originalBackup;
      switch (originalType) {
        case "CURRENT":
          originalBackup = await prisma.holdedContactsCurrentBackup.findUnique({
            where: { id: backupId },
          });
          break;
        case "DAILY":
          originalBackup = await prisma.holdedContactsDailyBackup.findUnique({
            where: { id: backupId },
          });
          break;
        case "MONTHLY":
          originalBackup = await prisma.holdedContactsMonthlyBackup.findUnique({
            where: { id: backupId },
          });
          break;
        default:
          throw new Error("Invalid backup type");
      }

      if (!originalBackup) {
        return NextResponse.json(
          { error: "Original backup not found" },
          { status: 404 }
        );
      }

      // Generate a new ObjectId for the favorite
      const newFavoriteId = new ObjectId().toString();

      // Fallback value for `data` to ensure it's not null
      const backupData: Prisma.InputJsonValue = originalBackup.data ?? {};

      // Create the new favorite with the new ID and the originalId
      const newFavorite = await prisma.holdedContactsFavoriteBackup.create({
        data: {
          id: newFavoriteId,
          originalId: backupId,
          data: backupData, // Ensure that data is a valid InputJsonValue
          originalType: originalType as HoldedContactsBackupType,
          dayOfMonth: (originalBackup as any)?.dayOfMonth ?? null,
          month: (originalBackup as any)?.month ?? null,
          year: (originalBackup as any)?.year ?? null,
          length: originalBackup.length,
        },
      });

      return NextResponse.json({
        message: "Backup added to favorites",
        newFavoriteId: newFavoriteId,
        originalId: backupId,
      });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 }
    );
  }
}
