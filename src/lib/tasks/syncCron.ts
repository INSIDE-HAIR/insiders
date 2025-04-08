import { DriveSyncService } from "../services/driveSync";
import { GoogleDriveService } from "@drive/services/drive/GoogleDriveService";
import { FileAnalyzer } from "@drive/services/analyzer/fileAnalyzer";
import { HierarchyService } from "@drive/services/hierarchy/hierarchyService";
import { PrismaClient } from "@prisma/client";
import { Logger } from "@drive/utils/logger";

const logger = new Logger("SyncCron");

export async function syncDriveRoutes() {
  try {
    logger.info("Starting scheduled drive routes sync");

    const prisma = new PrismaClient();
    const driveService = new GoogleDriveService();
    await driveService.initialize();

    const fileAnalyzer = new FileAnalyzer();
    const hierarchyService = new HierarchyService(driveService, fileAnalyzer);

    const syncService = new DriveSyncService(
      driveService,
      hierarchyService,
      prisma
    );

    const result = await syncService.syncDueRoutes();

    logger.info(
      `Sync completed: ${result.success} successful, ${result.failed} failed`
    );

    await prisma.$disconnect();
    return result;
  } catch (error: any) {
    logger.error("Error in scheduled sync", error);
    throw error;
  }
}
