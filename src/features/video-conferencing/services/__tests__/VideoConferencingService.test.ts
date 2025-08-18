/**
 * VideoConferencingService Tests
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { VideoConferencingService } from "../VideoConferencingService";
import { GoogleMeetService } from "../GoogleMeetService";
import { ZoomService } from "../ZoomService";
import { VimeoService } from "../VimeoService";

// Mock provider services
const mockGoogleMeetService = {
  createSpace: vi.fn(),
  getSpace: vi.fn(),
  updateSpace: vi.fn(),
  deleteSpace: vi.fn(),
  listSpaces: vi.fn(),
  getSpaceAnalytics: vi.fn(),
  isAuthenticated: vi.fn().mockReturnValue(true),
} as unknown as GoogleMeetService;

const mockZoomService = {
  createMeeting: vi.fn(),
  getMeeting: vi.fn(),
  updateMeeting: vi.fn(),
  deleteMeeting: vi.fn(),
  listMeetings: vi.fn(),
  getMeetingAnalytics: vi.fn(),
  isAuthenticated: vi.fn().mockReturnValue(true),
} as unknown as ZoomService;

const mockVimeoService = {
  createLiveEvent: vi.fn(),
  getLiveEvent: vi.fn(),
  updateLiveEvent: vi.fn(),
  deleteLiveEvent: vi.fn(),
  listLiveEvents: vi.fn(),
  getEventAnalytics: vi.fn(),
  isAuthenticated: vi.fn().mockReturnValue(true),
} as unknown as VimeoService;

// Mock Prisma Client
const mockPrisma = {
  videoSpace: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  linkAlias: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(),
} as unknown as PrismaClient;

describe("VideoConferencingService", () => {
  let service: VideoConferencingService;

  beforeEach(() => {
    service = new VideoConferencingService(
      mockPrisma,
      mockGoogleMeetService,
      mockZoomService,
      mockVimeoService
    );
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createVideoSpace", () => {
    const mockSpaceData = {
      title: "Test Meeting",
      description: "Test Description",
      provider: "GOOGLE_MEET" as const,
      scheduledStartTime: new Date("2024-01-15T10:00:00Z"),
      scheduledEndTime: new Date("2024-01-15T12:00:00Z"),
      maxParticipants: 100,
      settings: { recording: true },
    };

    const mockCreatedSpace = {
      id: "space-123",
      ...mockSpaceData,
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      meetingId: "meet-123",
      status: "SCHEDULED",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should create video space with Google Meet", async () => {
      const userId = "user-123";

      (mockGoogleMeetService.createSpace as any).mockResolvedValue({
        id: "meet-123",
        meetingUri: "https://meet.google.com/abc-defg-hij",
        name: "Test Meeting",
      });

      (mockPrisma.videoSpace.create as any).mockResolvedValue(mockCreatedSpace);

      const result = await service.createVideoSpace(mockSpaceData, userId);

      expect(mockGoogleMeetService.createSpace).toHaveBeenCalledWith({
        displayName: "Test Meeting",
        description: "Test Description",
        startTime: mockSpaceData.scheduledStartTime,
        endTime: mockSpaceData.scheduledEndTime,
        maxParticipants: 100,
        settings: { recording: true },
      });

      expect(mockPrisma.videoSpace.create).toHaveBeenCalledWith({
        data: {
          title: "Test Meeting",
          description: "Test Description",
          provider: "GOOGLE_MEET",
          meetingId: "meet-123",
          meetingUrl: "https://meet.google.com/abc-defg-hij",
          scheduledStartTime: mockSpaceData.scheduledStartTime,
          scheduledEndTime: mockSpaceData.scheduledEndTime,
          maxParticipants: 100,
          settings: { recording: true },
          status: "SCHEDULED",
          createdById: userId,
        },
      });

      expect(result).toEqual(mockCreatedSpace);
    });

    it("should create video space with Zoom", async () => {
      const zoomSpaceData = { ...mockSpaceData, provider: "ZOOM" as const };
      const userId = "user-123";

      (mockZoomService.createMeeting as any).mockResolvedValue({
        id: "zoom-123",
        join_url: "https://zoom.us/j/123456789",
        topic: "Test Meeting",
      });

      (mockPrisma.videoSpace.create as any).mockResolvedValue({
        ...mockCreatedSpace,
        provider: "ZOOM",
        meetingId: "zoom-123",
        meetingUrl: "https://zoom.us/j/123456789",
      });

      const result = await service.createVideoSpace(zoomSpaceData, userId);

      expect(mockZoomService.createMeeting).toHaveBeenCalledWith({
        topic: "Test Meeting",
        agenda: "Test Description",
        start_time: mockSpaceData.scheduledStartTime,
        duration: 120, // 2 hours in minutes
        settings: {
          host_video: true,
          participant_video: true,
          auto_recording: "cloud",
        },
      });

      expect(result.provider).toBe("ZOOM");
    });

    it("should create video space with Vimeo", async () => {
      const vimeoSpaceData = { ...mockSpaceData, provider: "VIMEO" as const };
      const userId = "user-123";

      (mockVimeoService.createLiveEvent as any).mockResolvedValue({
        uri: "/live_events/vimeo-123",
        embed: {
          html: '<iframe src="https://vimeo.com/event/123456"></iframe>',
        },
        name: "Test Meeting",
      });

      (mockPrisma.videoSpace.create as any).mockResolvedValue({
        ...mockCreatedSpace,
        provider: "VIMEO",
        meetingId: "vimeo-123",
        meetingUrl: "https://vimeo.com/event/123456",
      });

      const result = await service.createVideoSpace(vimeoSpaceData, userId);

      expect(mockVimeoService.createLiveEvent).toHaveBeenCalledWith({
        title: "Test Meeting",
        description: "Test Description",
        scheduled_start_time: mockSpaceData.scheduledStartTime,
        folder_uri: null,
        privacy: { view: "unlisted" },
      });

      expect(result.provider).toBe("VIMEO");
    });

    it("should handle provider authentication error", async () => {
      const userId = "user-123";
      (mockGoogleMeetService.isAuthenticated as any).mockReturnValue(false);

      await expect(
        service.createVideoSpace(mockSpaceData, userId)
      ).rejects.toThrow("Google Meet service is not authenticated");
    });

    it("should handle provider API error", async () => {
      const userId = "user-123";
      (mockGoogleMeetService.createSpace as any).mockRejectedValue(
        new Error("Google Meet API error")
      );

      await expect(
        service.createVideoSpace(mockSpaceData, userId)
      ).rejects.toThrow("Google Meet API error");
    });

    it("should handle database error", async () => {
      const userId = "user-123";

      (mockGoogleMeetService.createSpace as any).mockResolvedValue({
        id: "meet-123",
        meetingUri: "https://meet.google.com/abc-defg-hij",
        name: "Test Meeting",
      });

      (mockPrisma.videoSpace.create as any).mockRejectedValue(
        new Error("Database connection error")
      );

      await expect(
        service.createVideoSpace(mockSpaceData, userId)
      ).rejects.toThrow("Database connection error");
    });
  });

  describe("getVideoSpace", () => {
    const mockVideoSpace = {
      id: "space-123",
      title: "Test Meeting",
      provider: "GOOGLE_MEET",
      meetingId: "meet-123",
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      status: "ACTIVE",
      createdById: "user-123",
    };

    it("should get video space by ID", async () => {
      (mockPrisma.videoSpace.findUnique as any).mockResolvedValue(
        mockVideoSpace
      );

      const result = await service.getVideoSpace("space-123");

      expect(mockPrisma.videoSpace.findUnique).toHaveBeenCalledWith({
        where: { id: "space-123" },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          analytics: true,
          participants: true,
        },
      });

      expect(result).toEqual(mockVideoSpace);
    });

    it("should return null for non-existent space", async () => {
      (mockPrisma.videoSpace.findUnique as any).mockResolvedValue(null);

      const result = await service.getVideoSpace("non-existent");

      expect(result).toBeNull();
    });

    it("should handle database error", async () => {
      (mockPrisma.videoSpace.findUnique as any).mockRejectedValue(
        new Error("Database error")
      );

      await expect(service.getVideoSpace("space-123")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("updateVideoSpace", () => {
    const mockUpdateData = {
      title: "Updated Meeting",
      description: "Updated Description",
      maxParticipants: 150,
    };

    const mockExistingSpace = {
      id: "space-123",
      provider: "GOOGLE_MEET",
      meetingId: "meet-123",
      title: "Original Meeting",
      createdById: "user-123",
    };

    const mockUpdatedSpace = {
      ...mockExistingSpace,
      ...mockUpdateData,
      updatedAt: new Date(),
    };

    it("should update video space", async () => {
      (mockPrisma.videoSpace.findUnique as any).mockResolvedValue(
        mockExistingSpace
      );
      (mockGoogleMeetService.updateSpace as any).mockResolvedValue({
        id: "meet-123",
        name: "Updated Meeting",
      });
      (mockPrisma.videoSpace.update as any).mockResolvedValue(mockUpdatedSpace);

      const result = await service.updateVideoSpace(
        "space-123",
        mockUpdateData,
        "user-123"
      );

      expect(mockGoogleMeetService.updateSpace).toHaveBeenCalledWith(
        "meet-123",
        {
          displayName: "Updated Meeting",
          description: "Updated Description",
        }
      );

      expect(mockPrisma.videoSpace.update).toHaveBeenCalledWith({
        where: { id: "space-123" },
        data: {
          title: "Updated Meeting",
          description: "Updated Description",
          maxParticipants: 150,
          updatedAt: expect.any(Date),
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          analytics: true,
          participants: true,
        },
      });

      expect(result).toEqual(mockUpdatedSpace);
    });

    it("should throw error for non-existent space", async () => {
      (mockPrisma.videoSpace.findUnique as any).mockResolvedValue(null);

      await expect(
        service.updateVideoSpace("non-existent", mockUpdateData, "user-123")
      ).rejects.toThrow("Video space not found");
    });

    it("should handle provider update error", async () => {
      (mockPrisma.videoSpace.findUnique as any).mockResolvedValue(
        mockExistingSpace
      );
      (mockGoogleMeetService.updateSpace as any).mockRejectedValue(
        new Error("Provider API error")
      );

      await expect(
        service.updateVideoSpace("space-123", mockUpdateData, "user-123")
      ).rejects.toThrow("Provider API error");
    });
  });

  describe("deleteVideoSpace", () => {
    const mockExistingSpace = {
      id: "space-123",
      provider: "GOOGLE_MEET",
      meetingId: "meet-123",
      createdById: "user-123",
    };

    it("should delete video space", async () => {
      (mockPrisma.videoSpace.findUnique as any).mockResolvedValue(
        mockExistingSpace
      );
      (mockGoogleMeetService.deleteSpace as any).mockResolvedValue(true);
      (mockPrisma.videoSpace.update as any).mockResolvedValue({
        ...mockExistingSpace,
        status: "DELETED",
      });

      const result = await service.deleteVideoSpace("space-123", "user-123");

      expect(mockGoogleMeetService.deleteSpace).toHaveBeenCalledWith(
        "meet-123"
      );
      expect(mockPrisma.videoSpace.update).toHaveBeenCalledWith({
        where: { id: "space-123" },
        data: {
          status: "DELETED",
          deletedAt: expect.any(Date),
        },
      });

      expect(result).toBe(true);
    });

    it("should throw error for non-existent space", async () => {
      (mockPrisma.videoSpace.findUnique as any).mockResolvedValue(null);

      await expect(
        service.deleteVideoSpace("non-existent", "user-123")
      ).rejects.toThrow("Video space not found");
    });

    it("should handle provider deletion error gracefully", async () => {
      (mockPrisma.videoSpace.findUnique as any).mockResolvedValue(
        mockExistingSpace
      );
      (mockGoogleMeetService.deleteSpace as any).mockRejectedValue(
        new Error("Provider API error")
      );
      (mockPrisma.videoSpace.update as any).mockResolvedValue({
        ...mockExistingSpace,
        status: "DELETED",
      });

      // Should still mark as deleted in database even if provider fails
      const result = await service.deleteVideoSpace("space-123", "user-123");
      expect(result).toBe(true);
    });
  });

  describe("listVideoSpaces", () => {
    const mockSpaces = [
      {
        id: "space-1",
        title: "Meeting 1",
        provider: "GOOGLE_MEET",
        status: "ACTIVE",
      },
      {
        id: "space-2",
        title: "Meeting 2",
        provider: "ZOOM",
        status: "SCHEDULED",
      },
    ];

    it("should list video spaces with pagination", async () => {
      (mockPrisma.videoSpace.findMany as any).mockResolvedValue(mockSpaces);
      (mockPrisma.videoSpace.count as any).mockResolvedValue(2);

      const result = await service.listVideoSpaces({
        page: 1,
        limit: 10,
        userId: "user-123",
      });

      expect(mockPrisma.videoSpace.findMany).toHaveBeenCalledWith({
        where: {
          createdById: "user-123",
          status: { not: "DELETED" },
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              participants: true,
              analytics: true,
            },
          },
        },
        orderBy: [{ scheduledStartTime: "desc" }, { createdAt: "desc" }],
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        data: mockSpaces,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it("should filter by provider", async () => {
      (mockPrisma.videoSpace.findMany as any).mockResolvedValue([
        mockSpaces[0],
      ]);
      (mockPrisma.videoSpace.count as any).mockResolvedValue(1);

      await service.listVideoSpaces({
        page: 1,
        limit: 10,
        provider: "GOOGLE_MEET",
        userId: "user-123",
      });

      expect(mockPrisma.videoSpace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            provider: "GOOGLE_MEET",
          }),
        })
      );
    });

    it("should filter by status", async () => {
      (mockPrisma.videoSpace.findMany as any).mockResolvedValue([
        mockSpaces[0],
      ]);
      (mockPrisma.videoSpace.count as any).mockResolvedValue(1);

      await service.listVideoSpaces({
        page: 1,
        limit: 10,
        status: "ACTIVE",
        userId: "user-123",
      });

      expect(mockPrisma.videoSpace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "ACTIVE",
          }),
        })
      );
    });

    it("should search by title and description", async () => {
      (mockPrisma.videoSpace.findMany as any).mockResolvedValue([
        mockSpaces[0],
      ]);
      (mockPrisma.videoSpace.count as any).mockResolvedValue(1);

      await service.listVideoSpaces({
        page: 1,
        limit: 10,
        search: "Meeting",
        userId: "user-123",
      });

      expect(mockPrisma.videoSpace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: "Meeting", mode: "insensitive" } },
              { description: { contains: "Meeting", mode: "insensitive" } },
            ],
          }),
        })
      );
    });
  });

  describe("getVideoSpaceAnalytics", () => {
    const mockAnalytics = {
      totalParticipants: 25,
      averageEngagement: 0.85,
      totalDuration: 7200,
      chatMessages: 45,
      recordings: ["recording1.mp4"],
    };

    it("should get analytics for Google Meet space", async () => {
      const mockSpace = {
        id: "space-123",
        provider: "GOOGLE_MEET",
        meetingId: "meet-123",
      };

      (mockPrisma.videoSpace.findUnique as any).mockResolvedValue(mockSpace);
      (mockGoogleMeetService.getSpaceAnalytics as any).mockResolvedValue(
        mockAnalytics
      );

      const result = await service.getVideoSpaceAnalytics("space-123");

      expect(mockGoogleMeetService.getSpaceAnalytics).toHaveBeenCalledWith(
        "meet-123"
      );
      expect(result).toEqual(mockAnalytics);
    });

    it("should get analytics for Zoom meeting", async () => {
      const mockSpace = {
        id: "space-123",
        provider: "ZOOM",
        meetingId: "zoom-123",
      };

      (mockPrisma.videoSpace.findUnique as any).mockResolvedValue(mockSpace);
      (mockZoomService.getMeetingAnalytics as any).mockResolvedValue(
        mockAnalytics
      );

      const result = await service.getVideoSpaceAnalytics("space-123");

      expect(mockZoomService.getMeetingAnalytics).toHaveBeenCalledWith(
        "zoom-123"
      );
      expect(result).toEqual(mockAnalytics);
    });

    it("should throw error for non-existent space", async () => {
      (mockPrisma.videoSpace.findUnique as any).mockResolvedValue(null);

      await expect(
        service.getVideoSpaceAnalytics("non-existent")
      ).rejects.toThrow("Video space not found");
    });
  });

  describe("alias management", () => {
    it("should create alias for video space", async () => {
      const mockSpace = { id: "space-123", title: "Test Meeting" };
      const mockAlias = {
        id: "alias-123",
        alias: "test-meeting",
        videoSpaceId: "space-123",
        isActive: true,
      };

      (mockPrisma.videoSpace.findUnique as any).mockResolvedValue(mockSpace);
      (mockPrisma.linkAlias.findUnique as any).mockResolvedValue(null);
      (mockPrisma.linkAlias.create as any).mockResolvedValue(mockAlias);

      const result = await service.createAlias(
        "space-123",
        "test-meeting",
        "user-123"
      );

      expect(mockPrisma.linkAlias.findUnique).toHaveBeenCalledWith({
        where: { alias: "test-meeting" },
      });

      expect(mockPrisma.linkAlias.create).toHaveBeenCalledWith({
        data: {
          alias: "test-meeting",
          videoSpaceId: "space-123",
          createdById: "user-123",
          isActive: true,
        },
      });

      expect(result).toEqual(mockAlias);
    });

    it("should throw error for duplicate alias", async () => {
      const mockSpace = { id: "space-123", title: "Test Meeting" };
      const existingAlias = { id: "alias-456", alias: "test-meeting" };

      (mockPrisma.videoSpace.findUnique as any).mockResolvedValue(mockSpace);
      (mockPrisma.linkAlias.findUnique as any).mockResolvedValue(existingAlias);

      await expect(
        service.createAlias("space-123", "test-meeting", "user-123")
      ).rejects.toThrow("Alias already exists");
    });

    it("should resolve alias to video space", async () => {
      const mockAlias = {
        id: "alias-123",
        alias: "test-meeting",
        videoSpace: {
          id: "space-123",
          title: "Test Meeting",
          meetingUrl: "https://meet.google.com/abc-defg-hij",
        },
      };

      (mockPrisma.linkAlias.findUnique as any).mockResolvedValue(mockAlias);

      const result = await service.resolveAlias("test-meeting");

      expect(mockPrisma.linkAlias.findUnique).toHaveBeenCalledWith({
        where: { alias: "test-meeting", isActive: true },
        include: { videoSpace: true },
      });

      expect(result).toEqual(mockAlias.videoSpace);
    });

    it("should return null for non-existent alias", async () => {
      (mockPrisma.linkAlias.findUnique as any).mockResolvedValue(null);

      const result = await service.resolveAlias("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("provider service selection", () => {
    it("should get correct provider service for Google Meet", () => {
      const providerService = (service as any).getProviderService(
        "GOOGLE_MEET"
      );
      expect(providerService).toBe(mockGoogleMeetService);
    });

    it("should get correct provider service for Zoom", () => {
      const providerService = (service as any).getProviderService("ZOOM");
      expect(providerService).toBe(mockZoomService);
    });

    it("should get correct provider service for Vimeo", () => {
      const providerService = (service as any).getProviderService("VIMEO");
      expect(providerService).toBe(mockVimeoService);
    });

    it("should throw error for unsupported provider", () => {
      expect(() => {
        (service as any).getProviderService("UNSUPPORTED");
      }).toThrow("Unsupported video provider: UNSUPPORTED");
    });
  });

  describe("error handling", () => {
    it("should handle transaction rollback on provider failure", async () => {
      const mockSpaceData = {
        title: "Test Meeting",
        provider: "GOOGLE_MEET" as const,
        scheduledStartTime: new Date(),
        scheduledEndTime: new Date(),
      };

      (mockGoogleMeetService.createSpace as any).mockResolvedValue({
        id: "meet-123",
        meetingUri: "https://meet.google.com/abc-defg-hij",
      });

      (mockPrisma.videoSpace.create as any).mockRejectedValue(
        new Error("Database constraint violation")
      );

      // Should attempt to clean up provider resource
      (mockGoogleMeetService.deleteSpace as any).mockResolvedValue(true);

      await expect(
        service.createVideoSpace(mockSpaceData, "user-123")
      ).rejects.toThrow("Database constraint violation");

      // Verify cleanup was attempted
      expect(mockGoogleMeetService.deleteSpace).toHaveBeenCalledWith(
        "meet-123"
      );
    });
  });
});
