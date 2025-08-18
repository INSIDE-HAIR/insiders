/**
 * Status Monitoring Service Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { StatusMonitoringService } from "../StatusMonitoringService";
import { VideoConferencingService } from "../VideoConferencingService";
import { prisma } from "@/lib/prisma";
import { VideoProvider, VideoSpaceStatus } from "@prisma/client";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    videoSpace: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

vi.mock("../VideoConferencingService");

describe("StatusMonitoringService", () => {
  let statusMonitoringService: StatusMonitoringService;
  let mockVideoConferencingService: any;

  const mockVideoSpace = {
    id: "507f1f77bcf86cd799439021",
    name: "Test Room",
    provider: "ZOOM" as VideoProvider,
    status: "INACTIVE" as VideoSpaceStatus,
    providerRoomId: "123456789",
    lastActiveAt: new Date("2024-01-01T10:00:00Z"),
    integrationAccount: {
      id: "507f1f77bcf86cd799439031",
      provider: "ZOOM",
      accountName: "Test Account",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    statusMonitoringService = new StatusMonitoringService();
    mockVideoConferencingService = vi.mocked(
      VideoConferencingService
    ).prototype;
  });

  afterEach(() => {
    statusMonitoringService.stopAllMonitoring();
  });

  describe("checkVideoSpaceStatus", () => {
    it("should check status and update database when status changes", async () => {
      // Mock database calls
      vi.mocked(prisma.videoSpace.findUnique).mockResolvedValue(mockVideoSpace);
      vi.mocked(prisma.videoSpace.update).mockResolvedValue({
        ...mockVideoSpace,
        status: "ACTIVE" as VideoSpaceStatus,
      });

      // Mock provider service
      mockVideoConferencingService.getRoomStatus.mockResolvedValue({
        success: true,
        status: "started",
      });

      const result = await statusMonitoringService.checkVideoSpaceStatus(
        "507f1f77bcf86cd799439021"
      );

      expect(result).toEqual({
        id: "507f1f77bcf86cd799439021",
        name: "Test Room",
        provider: "ZOOM",
        previousStatus: "INACTIVE",
        currentStatus: "ACTIVE",
        lastActiveAt: "2024-01-01T10:00:00.000Z",
      });

      expect(prisma.videoSpace.update).toHaveBeenCalledWith({
        where: { id: "507f1f77bcf86cd799439021" },
        data: {
          status: "ACTIVE",
          updatedAt: expect.any(Date),
          lastActiveAt: expect.any(Date),
        },
      });
    });

    it("should not update database when status unchanged", async () => {
      vi.mocked(prisma.videoSpace.findUnique).mockResolvedValue(mockVideoSpace);

      mockVideoConferencingService.getRoomStatus.mockResolvedValue({
        success: true,
        status: "waiting", // Maps to INACTIVE, same as current
      });

      const result = await statusMonitoringService.checkVideoSpaceStatus(
        "507f1f77bcf86cd799439021"
      );

      expect(result.previousStatus).toBe("INACTIVE");
      expect(result.currentStatus).toBe("INACTIVE");
      expect(prisma.videoSpace.update).not.toHaveBeenCalled();
    });

    it("should handle provider errors gracefully", async () => {
      vi.mocked(prisma.videoSpace.findUnique).mockResolvedValue(mockVideoSpace);

      mockVideoConferencingService.getRoomStatus.mockResolvedValue({
        success: false,
        error: "Provider API error",
      });

      const result = await statusMonitoringService.checkVideoSpaceStatus(
        "507f1f77bcf86cd799439021"
      );

      expect(result.error).toBe("Provider API error");
      expect(result.previousStatus).toBe("INACTIVE");
      expect(result.currentStatus).toBe("INACTIVE");
    });

    it("should throw error for non-existent video space", async () => {
      vi.mocked(prisma.videoSpace.findUnique).mockResolvedValue(null);

      await expect(
        statusMonitoringService.checkVideoSpaceStatus(
          "507f1f77bcf86cd799439999"
        )
      ).rejects.toThrow("Video space not found");
    });
  });

  describe("checkMultipleVideoSpacesStatus", () => {
    it("should process multiple video spaces in batches", async () => {
      const videoSpaceIds = [
        "507f1f77bcf86cd799439021",
        "507f1f77bcf86cd799439022",
        "507f1f77bcf86cd799439023",
      ];

      // Mock successful status checks
      vi.spyOn(statusMonitoringService, "checkVideoSpaceStatus")
        .mockResolvedValueOnce({
          id: "507f1f77bcf86cd799439021",
          name: "Room 1",
          provider: "ZOOM",
          previousStatus: "INACTIVE",
          currentStatus: "ACTIVE",
          lastActiveAt: null,
        })
        .mockResolvedValueOnce({
          id: "507f1f77bcf86cd799439022",
          name: "Room 2",
          provider: "MEET",
          previousStatus: "ACTIVE",
          currentStatus: "ACTIVE",
          lastActiveAt: "2024-01-01T10:00:00.000Z",
        })
        .mockResolvedValueOnce({
          id: "507f1f77bcf86cd799439023",
          name: "Room 3",
          provider: "VIMEO",
          previousStatus: "ACTIVE",
          currentStatus: "INACTIVE",
          lastActiveAt: "2024-01-01T09:00:00.000Z",
        });

      const result =
        await statusMonitoringService.checkMultipleVideoSpacesStatus(
          videoSpaceIds
        );

      expect(result.statusUpdates).toHaveLength(3);
      expect(result.summary).toEqual({
        total: 3,
        updated: 2, // Room 1 and Room 3 changed status
        active: 2, // Room 1 (INACTIVE->ACTIVE) and Room 2 (ACTIVE->ACTIVE)
        inactive: 1, // Room 3 (ACTIVE->INACTIVE)
        errors: 0,
      });
      expect(result.timestamp).toBeTruthy();
    });

    it("should handle errors in batch processing", async () => {
      const videoSpaceIds = [
        "507f1f77bcf86cd799439021",
        "507f1f77bcf86cd799439999",
      ];

      vi.spyOn(statusMonitoringService, "checkVideoSpaceStatus")
        .mockResolvedValueOnce({
          id: "507f1f77bcf86cd799439021",
          name: "Room 1",
          provider: "ZOOM",
          previousStatus: "INACTIVE",
          currentStatus: "ACTIVE",
          lastActiveAt: null,
        })
        .mockRejectedValueOnce(new Error("Video space not found"));

      const result =
        await statusMonitoringService.checkMultipleVideoSpacesStatus(
          videoSpaceIds
        );

      expect(result.statusUpdates).toHaveLength(2);
      expect(result.statusUpdates[1].error).toBe("Video space not found");
      expect(result.summary.errors).toBe(1);
    });
  });

  describe("checkUserVideoSpacesStatus", () => {
    it("should check status for all user video spaces", async () => {
      const userId = "507f1f77bcf86cd799439011";

      vi.mocked(prisma.videoSpace.findMany).mockResolvedValue([
        { id: "507f1f77bcf86cd799439021" },
        { id: "507f1f77bcf86cd799439022" },
      ]);

      vi.spyOn(
        statusMonitoringService,
        "checkMultipleVideoSpacesStatus"
      ).mockResolvedValue({
        statusUpdates: [],
        summary: { total: 2, updated: 0, active: 1, inactive: 1, errors: 0 },
        timestamp: "2024-01-01T12:00:00.000Z",
      });

      const result =
        await statusMonitoringService.checkUserVideoSpacesStatus(userId);

      expect(prisma.videoSpace.findMany).toHaveBeenCalledWith({
        where: {
          ownerId: userId,
          status: { not: "DISABLED" },
        },
        select: { id: true },
      });

      expect(result.summary.total).toBe(2);
    });
  });

  describe("monitoring control", () => {
    it("should start and stop monitoring", () => {
      const videoSpaceId = "507f1f77bcf86cd799439021";

      // Start monitoring
      statusMonitoringService.startMonitoring(videoSpaceId, 1000);

      let status = statusMonitoringService.getMonitoringStatus();
      expect(
        status.find((s) => s.videoSpaceId === videoSpaceId)?.isMonitoring
      ).toBe(true);

      // Stop monitoring
      statusMonitoringService.stopMonitoring(videoSpaceId);

      status = statusMonitoringService.getMonitoringStatus();
      expect(
        status.find((s) => s.videoSpaceId === videoSpaceId)
      ).toBeUndefined();
    });

    it("should stop all monitoring", () => {
      const videoSpaceIds = [
        "507f1f77bcf86cd799439021",
        "507f1f77bcf86cd799439022",
      ];

      // Start monitoring for multiple spaces
      videoSpaceIds.forEach((id) => {
        statusMonitoringService.startMonitoring(id, 1000);
      });

      let status = statusMonitoringService.getMonitoringStatus();
      expect(status).toHaveLength(2);

      // Stop all monitoring
      statusMonitoringService.stopAllMonitoring();

      status = statusMonitoringService.getMonitoringStatus();
      expect(status).toHaveLength(0);
    });
  });

  describe("getStatusSummary", () => {
    it("should return status summary with recent activity", async () => {
      const mockStatusData = [
        { status: "ACTIVE", provider: "ZOOM", _count: { id: 3 } },
        { status: "INACTIVE", provider: "ZOOM", _count: { id: 2 } },
        { status: "ACTIVE", provider: "MEET", _count: { id: 1 } },
      ];

      const mockRecentActivity = [
        {
          id: "507f1f77bcf86cd799439021",
          name: "Recent Room",
          provider: "ZOOM" as VideoProvider,
          status: "ACTIVE" as VideoSpaceStatus,
          lastActiveAt: new Date("2024-01-01T10:00:00Z"),
        },
      ];

      vi.mocked(prisma.videoSpace.groupBy).mockResolvedValue(
        mockStatusData as any
      );
      vi.mocked(prisma.videoSpace.findMany).mockResolvedValue(
        mockRecentActivity as any
      );

      const result = await statusMonitoringService.getStatusSummary();

      expect(result.summary).toEqual({
        byStatus: {
          ACTIVE: 4,
          INACTIVE: 2,
        },
        byProvider: {
          ZOOM: 5,
          MEET: 1,
        },
        byProviderAndStatus: {
          ZOOM: {
            ACTIVE: 3,
            INACTIVE: 2,
          },
          MEET: {
            ACTIVE: 1,
          },
        },
        total: 6,
      });

      expect(result.recentActivity).toHaveLength(1);
      expect(result.recentActivity[0].lastActiveAt).toBe(
        "2024-01-01T10:00:00.000Z"
      );
    });

    it("should filter by user when userId provided", async () => {
      const userId = "507f1f77bcf86cd799439011";

      vi.mocked(prisma.videoSpace.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.videoSpace.findMany).mockResolvedValue([]);

      await statusMonitoringService.getStatusSummary(userId);

      expect(prisma.videoSpace.groupBy).toHaveBeenCalledWith({
        by: ["status", "provider"],
        where: { ownerId: userId },
        _count: { id: true },
      });

      expect(prisma.videoSpace.findMany).toHaveBeenCalledWith({
        where: {
          ownerId: userId,
          lastActiveAt: { not: null },
        },
        select: {
          id: true,
          name: true,
          provider: true,
          status: true,
          lastActiveAt: true,
        },
        orderBy: { lastActiveAt: "desc" },
        take: 10,
      });
    });
  });

  describe("mapProviderStatusToVideoSpaceStatus", () => {
    it("should map provider statuses correctly", () => {
      const service = statusMonitoringService as any;

      // Google Meet
      expect(service.mapProviderStatusToVideoSpaceStatus("ACTIVE")).toBe(
        "ACTIVE"
      );
      expect(service.mapProviderStatusToVideoSpaceStatus("ENDED")).toBe(
        "INACTIVE"
      );

      // Zoom
      expect(service.mapProviderStatusToVideoSpaceStatus("waiting")).toBe(
        "INACTIVE"
      );
      expect(service.mapProviderStatusToVideoSpaceStatus("started")).toBe(
        "ACTIVE"
      );
      expect(service.mapProviderStatusToVideoSpaceStatus("ended")).toBe(
        "INACTIVE"
      );

      // Vimeo
      expect(service.mapProviderStatusToVideoSpaceStatus("ready")).toBe(
        "INACTIVE"
      );
      expect(service.mapProviderStatusToVideoSpaceStatus("streaming")).toBe(
        "ACTIVE"
      );
      expect(service.mapProviderStatusToVideoSpaceStatus("archived")).toBe(
        "INACTIVE"
      );

      // Generic
      expect(service.mapProviderStatusToVideoSpaceStatus("active")).toBe(
        "ACTIVE"
      );
      expect(service.mapProviderStatusToVideoSpaceStatus("inactive")).toBe(
        "INACTIVE"
      );
      expect(service.mapProviderStatusToVideoSpaceStatus("disabled")).toBe(
        "DISABLED"
      );
      expect(service.mapProviderStatusToVideoSpaceStatus("expired")).toBe(
        "EXPIRED"
      );

      // Unknown status defaults to INACTIVE
      expect(service.mapProviderStatusToVideoSpaceStatus("unknown")).toBe(
        "INACTIVE"
      );
    });
  });
});
