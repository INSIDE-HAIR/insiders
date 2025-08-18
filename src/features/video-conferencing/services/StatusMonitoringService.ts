/**
 * Status Monitoring Service
 * Handles real-time status monitoring for video spaces
 */

import { VideoConferencingService } from "./VideoConferencingService";
import { prisma } from "@/lib/prisma";
import { VideoProvider, VideoSpaceStatus } from "@prisma/client";

export interface StatusUpdate {
  id: string;
  name: string;
  provider: VideoProvider;
  previousStatus: VideoSpaceStatus;
  currentStatus: VideoSpaceStatus;
  lastActiveAt: string | null;
  error?: string;
}

export interface StatusMonitoringResult {
  statusUpdates: StatusUpdate[];
  summary: {
    total: number;
    updated: number;
    active: number;
    inactive: number;
    errors: number;
  };
  timestamp: string;
}

export class StatusMonitoringService {
  private videoConferencingService: VideoConferencingService;
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.videoConferencingService = new VideoConferencingService();
  }

  /**
   * Check status for a single video space
   */
  async checkVideoSpaceStatus(videoSpaceId: string): Promise<StatusUpdate> {
    const videoSpace = await prisma.videoSpace.findUnique({
      where: { id: videoSpaceId },
      include: {
        integrationAccount: true,
      },
    });

    if (!videoSpace) {
      throw new Error("Video space not found");
    }

    const previousStatus = videoSpace.status;
    let currentStatus = previousStatus;
    let error: string | undefined;

    try {
      // Get current status from provider
      const statusResult = await this.videoConferencingService.getRoomStatus(
        videoSpace.provider,
        videoSpace.providerRoomId,
        videoSpace.integrationAccount
      );

      if (statusResult.success && statusResult.status) {
        currentStatus = this.mapProviderStatusToVideoSpaceStatus(
          statusResult.status
        );

        // Update database if status changed
        if (currentStatus !== previousStatus) {
          const updateData: any = {
            status: currentStatus,
            updatedAt: new Date(),
          };

          // Update lastActiveAt if room became active
          if (currentStatus === "ACTIVE") {
            updateData.lastActiveAt = new Date();
          }

          await prisma.videoSpace.update({
            where: { id: videoSpaceId },
            data: updateData,
          });
        }
      } else {
        error = statusResult.error || "Failed to get status from provider";
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown error occurred";
    }

    return {
      id: videoSpace.id,
      name: videoSpace.name,
      provider: videoSpace.provider,
      previousStatus,
      currentStatus,
      lastActiveAt: videoSpace.lastActiveAt?.toISOString() || null,
      error,
    };
  }

  /**
   * Check status for multiple video spaces
   */
  async checkMultipleVideoSpacesStatus(
    videoSpaceIds: string[]
  ): Promise<StatusMonitoringResult> {
    const statusUpdates: StatusUpdate[] = [];
    const timestamp = new Date().toISOString();

    // Process in batches to avoid overwhelming provider APIs
    const batchSize = 10;
    for (let i = 0; i < videoSpaceIds.length; i += batchSize) {
      const batch = videoSpaceIds.slice(i, i + batchSize);
      const batchPromises = batch.map((id) =>
        this.checkVideoSpaceStatus(id).catch((error) => ({
          id,
          name: "Unknown",
          provider: "ZOOM" as VideoProvider,
          previousStatus: "INACTIVE" as VideoSpaceStatus,
          currentStatus: "INACTIVE" as VideoSpaceStatus,
          lastActiveAt: null,
          error: error.message,
        }))
      );

      const batchResults = await Promise.all(batchPromises);
      statusUpdates.push(...batchResults);

      // Add small delay between batches to respect rate limits
      if (i + batchSize < videoSpaceIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Calculate summary
    const summary = {
      total: statusUpdates.length,
      updated: statusUpdates.filter(
        (update) => update.previousStatus !== update.currentStatus
      ).length,
      active: statusUpdates.filter(
        (update) => update.currentStatus === "ACTIVE"
      ).length,
      inactive: statusUpdates.filter(
        (update) => update.currentStatus === "INACTIVE"
      ).length,
      errors: statusUpdates.filter((update) => update.error !== undefined)
        .length,
    };

    return {
      statusUpdates,
      summary,
      timestamp,
    };
  }

  /**
   * Check status for all video spaces owned by a user
   */
  async checkUserVideoSpacesStatus(
    userId: string
  ): Promise<StatusMonitoringResult> {
    const videoSpaces = await prisma.videoSpace.findMany({
      where: {
        ownerId: userId,
        status: { not: "DISABLED" }, // Skip disabled spaces
      },
      select: { id: true },
    });

    const videoSpaceIds = videoSpaces.map((space) => space.id);
    return this.checkMultipleVideoSpacesStatus(videoSpaceIds);
  }

  /**
   * Start continuous monitoring for a video space
   */
  startMonitoring(videoSpaceId: string, intervalMs: number = 300000): void {
    // Default 5 minutes
    // Stop existing monitoring if any
    this.stopMonitoring(videoSpaceId);

    const interval = setInterval(async () => {
      try {
        await this.checkVideoSpaceStatus(videoSpaceId);
      } catch (error) {
        console.error(
          `Status monitoring error for video space ${videoSpaceId}:`,
          error
        );
      }
    }, intervalMs);

    this.monitoringIntervals.set(videoSpaceId, interval);
  }

  /**
   * Stop monitoring for a video space
   */
  stopMonitoring(videoSpaceId: string): void {
    const interval = this.monitoringIntervals.get(videoSpaceId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(videoSpaceId);
    }
  }

  /**
   * Stop all monitoring
   */
  stopAllMonitoring(): void {
    for (const [videoSpaceId] of this.monitoringIntervals) {
      this.stopMonitoring(videoSpaceId);
    }
  }

  /**
   * Get monitoring status
   */
  getMonitoringStatus(): { videoSpaceId: string; isMonitoring: boolean }[] {
    const allVideoSpaces = Array.from(this.monitoringIntervals.keys());
    return allVideoSpaces.map((videoSpaceId) => ({
      videoSpaceId,
      isMonitoring: this.monitoringIntervals.has(videoSpaceId),
    }));
  }

  /**
   * Get status summary for all video spaces
   */
  async getStatusSummary(userId?: string): Promise<{
    summary: {
      byStatus: Record<string, number>;
      byProvider: Record<string, number>;
      byProviderAndStatus: Record<string, Record<string, number>>;
      total: number;
    };
    recentActivity: Array<{
      id: string;
      name: string;
      provider: VideoProvider;
      status: VideoSpaceStatus;
      lastActiveAt: string | null;
    }>;
    timestamp: string;
  }> {
    const whereClause = userId ? { ownerId: userId } : {};

    // Get status summary
    const statusData = await prisma.videoSpace.groupBy({
      by: ["status", "provider"],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    // Build summary
    const summary = {
      byStatus: {} as Record<string, number>,
      byProvider: {} as Record<string, number>,
      byProviderAndStatus: {} as Record<string, Record<string, number>>,
      total: 0,
    };

    statusData.forEach((item) => {
      const { status, provider, _count } = item;
      const count = _count.id;

      // By status
      summary.byStatus[status] = (summary.byStatus[status] || 0) + count;

      // By provider
      summary.byProvider[provider] =
        (summary.byProvider[provider] || 0) + count;

      // By provider and status
      if (!summary.byProviderAndStatus[provider]) {
        summary.byProviderAndStatus[provider] = {};
      }
      summary.byProviderAndStatus[provider][status] = count;

      summary.total += count;
    });

    // Get recent activity (last 10 active spaces)
    const recentActivity = await prisma.videoSpace.findMany({
      where: {
        ...whereClause,
        lastActiveAt: { not: null },
      },
      select: {
        id: true,
        name: true,
        provider: true,
        status: true,
        lastActiveAt: true,
      },
      orderBy: {
        lastActiveAt: "desc",
      },
      take: 10,
    });

    return {
      summary,
      recentActivity: recentActivity.map((space) => ({
        ...space,
        lastActiveAt: space.lastActiveAt?.toISOString() || null,
      })),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Map provider-specific status to VideoSpaceStatus
   */
  private mapProviderStatusToVideoSpaceStatus(
    providerStatus: string
  ): VideoSpaceStatus {
    const statusMap: Record<string, VideoSpaceStatus> = {
      // Google Meet
      ACTIVE: "ACTIVE",
      ENDED: "INACTIVE",

      // Zoom
      waiting: "INACTIVE",
      started: "ACTIVE",
      ended: "INACTIVE",

      // Vimeo
      ready: "INACTIVE",
      streaming: "ACTIVE",
      archived: "INACTIVE",

      // Generic
      active: "ACTIVE",
      inactive: "INACTIVE",
      disabled: "DISABLED",
      expired: "EXPIRED",
    };

    return statusMap[providerStatus.toLowerCase()] || "INACTIVE";
  }
}
