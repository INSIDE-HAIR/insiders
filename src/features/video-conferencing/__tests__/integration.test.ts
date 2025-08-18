/**
 * Integration Tests for Video Conferencing Platform
 * Tests the complete flow from API to database
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { VideoConferencingService } from "../services/VideoConferencingService";
import { GoogleMeetService } from "../services/GoogleMeetService";
import { ZoomService } from "../services/ZoomService";
import { VimeoService } from "../services/VimeoService";
import { AccessControlService } from "../services/AccessControlService";
import { LoggingService } from "../services/LoggingService";
import { ErrorHandlingService } from "../services/ErrorHandlingService";
import { MonitoringService } from "../services/MonitoringService";

// Mock external dependencies
vi.mock("@/src/config/auth/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/src/config/auth/auth";

describe("Video Conferencing Platform Integration", () => {
  let prisma: PrismaClient;
  let videoService: VideoConferencingService;
  let accessControlService: AccessControlService;
  let loggingService: LoggingService;
  let errorHandlingService: ErrorHandlingService;
  let monitoringService: MonitoringService;
  let googleMeetService: GoogleMeetService;
  let zoomService: ZoomService;
  let vimeoService: VimeoService;

  const mockAuth = auth as any;

  beforeEach(() => {
    // Create mock Prisma client
    prisma = {
      videoSpace: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      linkAlias: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      meetingAnalytics: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      participantData: {
        create: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(),
    } as unknown as PrismaClient;

    // Create mock provider services
    googleMeetService = {
      createSpace: vi.fn(),
      getSpace: vi.fn(),
      updateSpace: vi.fn(),
      deleteSpace: vi.fn(),
      listSpaces: vi.fn(),
      getSpaceAnalytics: vi.fn(),
      isAuthenticated: vi.fn().mockReturnValue(true),
    } as unknown as GoogleMeetService;

    zoomService = {
      createMeeting: vi.fn(),
      getMeeting: vi.fn(),
      updateMeeting: vi.fn(),
      deleteMeeting: vi.fn(),
      listMeetings: vi.fn(),
      getMeetingAnalytics: vi.fn(),
      isAuthenticated: vi.fn().mockReturnValue(true),
    } as unknown as ZoomService;

    vimeoService = {
      createLiveEvent: vi.fn(),
      getLiveEvent: vi.fn(),
      updateLiveEvent: vi.fn(),
      deleteLiveEvent: vi.fn(),
      listLiveEvents: vi.fn(),
      getEventAnalytics: vi.fn(),
      isAuthenticated: vi.fn().mockReturnValue(true),
    } as unknown as VimeoService;

    // Initialize services
    loggingService = new LoggingService(prisma);
    errorHandlingService = new ErrorHandlingService(loggingService);
    monitoringService = new MonitoringService(
      loggingService,
      errorHandlingService
    );
    accessControlService = new AccessControlService(prisma);
    videoService = new VideoConferencingService(
      prisma,
      googleMeetService,
      zoomService,
      vimeoService
    );

    // Mock auth
    mockAuth.mockResolvedValue({
      user: { id: "admin-123", role: "ADMIN", email: "admin@example.com" },
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Complete Video Space Creation Flow", () => {
    it("should create video space with full access control and logging", async () => {
      const userId = "admin-123";
      const spaceData = {
        title: "Integration Test Meeting",
        description: "Test meeting for integration testing",
        provider: "GOOGLE_MEET" as const,
        scheduledStartTime: new Date("2024-01-15T10:00:00Z"),
        scheduledEndTime: new Date("2024-01-15T12:00:00Z"),
        maxParticipants: 100,
        settings: { recording: true },
      };

      // Mock provider response
      (googleMeetService.createSpace as any).mockResolvedValue({
        id: "meet-123",
        meetingUri: "https://meet.google.com/abc-defg-hij",
        name: "Integration Test Meeting",
      });

      // Mock database response
      const mockCreatedSpace = {
        id: "space-123",
        ...spaceData,
        meetingId: "meet-123",
        meetingUrl: "https://meet.google.com/abc-defg-hij",
        status: "SCHEDULED",
        createdById: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.videoSpace.create as any).mockResolvedValue(mockCreatedSpace);

      // 1. Check permissions
      const canCreate = await accessControlService.canCreateVideoSpace(
        userId,
        "GOOGLE_MEET"
      );
      expect(canCreate.allowed).toBe(true);

      // 2. Create video space
      const result = await videoService.createVideoSpace(spaceData, userId);

      // 3. Verify provider was called
      expect(googleMeetService.createSpace).toHaveBeenCalledWith({
        displayName: "Integration Test Meeting",
        description: "Test meeting for integration testing",
        startTime: spaceData.scheduledStartTime,
        endTime: spaceData.scheduledEndTime,
        maxParticipants: 100,
        settings: { recording: true },
      });

      // 4. Verify database was called
      expect(prisma.videoSpace.create).toHaveBeenCalledWith({
        data: {
          title: "Integration Test Meeting",
          description: "Test meeting for integration testing",
          provider: "GOOGLE_MEET",
          meetingId: "meet-123",
          meetingUrl: "https://meet.google.com/abc-defg-hij",
          scheduledStartTime: spaceData.scheduledStartTime,
          scheduledEndTime: spaceData.scheduledEndTime,
          maxParticipants: 100,
          settings: { recording: true },
          status: "SCHEDULED",
          createdById: userId,
        },
      });

      // 5. Verify result
      expect(result).toEqual(mockCreatedSpace);

      // 6. Log the action
      await accessControlService.logUserAction(
        userId,
        "CREATE_SPACE",
        "video_space",
        result.id,
        { provider: "GOOGLE_MEET", title: spaceData.title },
        true
      );

      // 7. Verify audit logs were created
      const auditLogs = await accessControlService.getUserAuditLogs(userId, 10);
      expect(auditLogs.length).toBeGreaterThan(0);
    });

    it("should handle permission denied scenario", async () => {
      const userId = "client-123";

      // Mock client user
      mockAuth.mockResolvedValue({
        user: { id: userId, role: "CLIENT", email: "client@example.com" },
      });

      const spaceData = {
        title: "Unauthorized Meeting",
        provider: "GOOGLE_MEET" as const,
        scheduledStartTime: new Date(),
        scheduledEndTime: new Date(),
      };

      // 1. Check permissions (should fail)
      const canCreate = await accessControlService.canCreateVideoSpace(
        userId,
        "GOOGLE_MEET"
      );
      expect(canCreate.allowed).toBe(false);
      expect(canCreate.reason).toBe("User cannot create video spaces");

      // 2. Attempt to create should be blocked at application level
      // (In real implementation, this would be handled by middleware)

      // 3. Log the failed attempt
      await accessControlService.logUserAction(
        userId,
        "CREATE_SPACE_ATTEMPT",
        "video_space",
        undefined,
        { provider: "GOOGLE_MEET", reason: "Permission denied" },
        false
      );

      // 4. Verify audit log
      const auditLogs = await accessControlService.getUserAuditLogs(userId, 10);
      expect(
        auditLogs.some(
          (log) => log.action === "CREATE_SPACE_ATTEMPT" && !log.success
        )
      ).toBe(true);
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle provider API failure with proper error handling", async () => {
      const userId = "admin-123";
      const spaceData = {
        title: "Failing Meeting",
        provider: "GOOGLE_MEET" as const,
        scheduledStartTime: new Date(),
        scheduledEndTime: new Date(),
      };

      // Mock provider failure
      const providerError = new Error(
        "Google Meet API is temporarily unavailable"
      );
      (googleMeetService.createSpace as any).mockRejectedValue(providerError);

      try {
        await videoService.createVideoSpace(spaceData, userId);
        expect.fail("Should have thrown an error");
      } catch (error) {
        // 1. Verify error was thrown
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain(
          "Google Meet API is temporarily unavailable"
        );

        // 2. Handle error through error service
        const handlingResult = await errorHandlingService.handleError(
          error as Error,
          {
            userId,
            operation: "createVideoSpace",
            provider: "GOOGLE_MEET",
          }
        );

        expect(handlingResult.handled).toBe(true);
        expect(handlingResult.shouldRetry).toBe(true); // Provider errors are recoverable

        // 3. Log the error
        await accessControlService.logUserAction(
          userId,
          "CREATE_SPACE",
          "video_space",
          undefined,
          { provider: "GOOGLE_MEET", error: (error as Error).message },
          false,
          error as Error
        );

        // 4. Verify error statistics
        const errorStats = errorHandlingService.getErrorStats();
        expect(errorStats.totalErrors).toBeGreaterThan(0);
      }
    });

    it("should handle database failure with transaction rollback", async () => {
      const userId = "admin-123";
      const spaceData = {
        title: "Database Failure Meeting",
        provider: "GOOGLE_MEET" as const,
        scheduledStartTime: new Date(),
        scheduledEndTime: new Date(),
      };

      // Mock successful provider call
      (googleMeetService.createSpace as any).mockResolvedValue({
        id: "meet-123",
        meetingUri: "https://meet.google.com/abc-defg-hij",
        name: "Database Failure Meeting",
      });

      // Mock database failure
      const dbError = new Error("Database connection timeout");
      (prisma.videoSpace.create as any).mockRejectedValue(dbError);

      // Mock cleanup call
      (googleMeetService.deleteSpace as any).mockResolvedValue(true);

      try {
        await videoService.createVideoSpace(spaceData, userId);
        expect.fail("Should have thrown an error");
      } catch (error) {
        // 1. Verify error was thrown
        expect(error).toBeInstanceOf(Error);

        // 2. Verify cleanup was attempted
        expect(googleMeetService.deleteSpace).toHaveBeenCalledWith("meet-123");

        // 3. Handle error
        const vcError = errorHandlingService.createDatabaseError(
          "Failed to create video space in database",
          { userId, operation: "createVideoSpace" },
          error as Error
        );

        expect(vcError.code).toBe("DATABASE_ERROR");
        expect(vcError.severity).toBe("critical");
        expect(vcError.isRecoverable).toBe(true);
      }
    });
  });

  describe("Monitoring Integration", () => {
    it("should collect metrics and create alerts", async () => {
      // 1. Start monitoring
      monitoringService.startMonitoring(1000); // 1 second for testing

      // 2. Collect initial metrics
      const metrics = await monitoringService.collectMetrics();

      expect(metrics).toMatchObject({
        timestamp: expect.any(Date),
        cpu: expect.objectContaining({
          usage: expect.any(Number),
          loadAverage: expect.any(Array),
        }),
        memory: expect.objectContaining({
          used: expect.any(Number),
          total: expect.any(Number),
          percentage: expect.any(Number),
        }),
        providers: expect.objectContaining({
          googleMeet: expect.objectContaining({
            name: "google-meet",
            status: expect.any(String),
          }),
          zoom: expect.objectContaining({
            name: "zoom",
            status: expect.any(String),
          }),
          vimeo: expect.objectContaining({
            name: "vimeo",
            status: expect.any(String),
          }),
        }),
      });

      // 3. Create a test alert
      const alert = monitoringService.createAlert(
        "performance",
        "high",
        "Test Alert",
        "This is a test alert for integration testing",
        { testData: true },
        ["Test action"]
      );

      expect(alert).toMatchObject({
        id: expect.stringMatching(/^alert_\d+_[a-z0-9]+$/),
        type: "performance",
        severity: "high",
        title: "Test Alert",
        resolved: false,
      });

      // 4. Get system health
      const health = monitoringService.getSystemHealth();
      expect(health.overall).toMatch(/^(healthy|degraded|unhealthy)$/);
      expect(health.checks.length).toBeGreaterThan(0);

      // 5. Get monitoring stats
      const stats = monitoringService.getMonitoringStats();
      expect(stats).toMatchObject({
        uptime: expect.any(Number),
        totalAlerts: expect.any(Number),
        activeAlerts: expect.any(Number),
        healthScore: expect.any(Number),
      });

      // 6. Stop monitoring
      monitoringService.stopMonitoring();
    });
  });

  describe("Access Control Integration", () => {
    it("should enforce role-based access across services", async () => {
      const trainerId = "trainer-123";
      const adminId = "admin-123";

      // Mock trainer user
      mockAuth.mockResolvedValue({
        user: { id: trainerId, role: "TRAINER", email: "trainer@example.com" },
      });

      // 1. Test trainer permissions
      const trainerPermissions =
        await accessControlService.getUserPermissions(trainerId);
      expect(trainerPermissions).toMatchObject({
        canCreateSpaces: true,
        canDeleteSpaces: false,
        canViewAllSpaces: false,
        maxSpacesPerUser: 10,
      });

      // 2. Test API access validation
      const apiAccess = await accessControlService.validateApiAccess(
        trainerId,
        "/api/video-conferencing/spaces",
        "POST"
      );
      expect(apiAccess.allowed).toBe(true);

      const deleteAccess = await accessControlService.validateApiAccess(
        trainerId,
        "/api/video-conferencing/spaces",
        "DELETE",
        "space-123"
      );
      // This would check if trainer owns the space
      expect(deleteAccess.allowed).toBe(false);

      // 3. Switch to admin user
      mockAuth.mockResolvedValue({
        user: { id: adminId, role: "ADMIN", email: "admin@example.com" },
      });

      const adminPermissions =
        await accessControlService.getUserPermissions(adminId);
      expect(adminPermissions).toMatchObject({
        canCreateSpaces: true,
        canDeleteSpaces: true,
        canViewAllSpaces: true,
      });

      const adminDeleteAccess = await accessControlService.validateApiAccess(
        adminId,
        "/api/video-conferencing/spaces",
        "DELETE",
        "space-123"
      );
      expect(adminDeleteAccess.allowed).toBe(true);
    });
  });

  describe("Logging Integration", () => {
    it("should log activities across all services", async () => {
      const userId = "user-123";

      // 1. Log various activities
      loggingService.info("User logged in", "AUTH", { userId });
      loggingService.logUserAction(
        "CREATE_SPACE",
        "video_space",
        "space-123",
        true,
        { provider: "zoom" },
        undefined,
        userId
      );
      loggingService.logProviderCall(
        "zoom",
        "createMeeting",
        true,
        500,
        { meetingId: "zoom-123" },
        undefined,
        userId
      );
      loggingService.logApiCall(
        "POST",
        "/api/video-conferencing/spaces",
        201,
        750,
        userId
      );
      loggingService.error(
        "Test error",
        "TEST",
        new Error("Test error"),
        { context: "testing" },
        userId
      );

      // 2. Get logs with different filters
      const allLogs = loggingService.getLogs({}, 100);
      expect(allLogs.length).toBeGreaterThan(0);

      const userLogs = loggingService.getLogs({ userId }, 100);
      expect(userLogs.every((log) => log.userId === userId)).toBe(true);

      const errorLogs = loggingService.getLogs({ level: "error" }, 100);
      expect(errorLogs.every((log) => log.level === "error")).toBe(true);

      const apiLogs = loggingService.getLogs({ context: "API_CALL" }, 100);
      expect(apiLogs.every((log) => log.context === "API_CALL")).toBe(true);

      // 3. Get log statistics
      const stats = loggingService.getLogStats();
      expect(stats).toMatchObject({
        totalLogs: expect.any(Number),
        errorCount: expect.any(Number),
        warnCount: expect.any(Number),
        logsByLevel: expect.objectContaining({
          info: expect.any(Number),
          error: expect.any(Number),
        }),
      });

      // 4. Export logs
      const jsonExport = loggingService.exportLogs("json", {}, 50);
      const exportedLogs = JSON.parse(jsonExport);
      expect(Array.isArray(exportedLogs)).toBe(true);

      const csvExport = loggingService.exportLogs("csv", {}, 50);
      expect(csvExport).toContain(
        "timestamp,level,context,message,userId,error"
      );
    });
  });

  describe("End-to-End Workflow", () => {
    it("should complete full video space lifecycle with monitoring", async () => {
      const userId = "admin-123";
      let spaceId: string;

      // 1. Create video space
      const spaceData = {
        title: "E2E Test Meeting",
        description: "End-to-end test meeting",
        provider: "ZOOM" as const,
        scheduledStartTime: new Date("2024-01-15T14:00:00Z"),
        scheduledEndTime: new Date("2024-01-15T16:00:00Z"),
        maxParticipants: 50,
      };

      (zoomService.createMeeting as any).mockResolvedValue({
        id: "zoom-456",
        join_url: "https://zoom.us/j/123456789",
        topic: "E2E Test Meeting",
      });

      const mockSpace = {
        id: "space-456",
        ...spaceData,
        meetingId: "zoom-456",
        meetingUrl: "https://zoom.us/j/123456789",
        status: "SCHEDULED",
        createdById: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.videoSpace.create as any).mockResolvedValue(mockSpace);

      const createdSpace = await videoService.createVideoSpace(
        spaceData,
        userId
      );
      spaceId = createdSpace.id;

      expect(createdSpace).toEqual(mockSpace);

      // 2. Create alias
      (prisma.linkAlias.findUnique as any).mockResolvedValue(null);
      (prisma.linkAlias.create as any).mockResolvedValue({
        id: "alias-123",
        alias: "e2e-test",
        videoSpaceId: spaceId,
        isActive: true,
      });

      const alias = await videoService.createAlias(spaceId, "e2e-test", userId);
      expect(alias.alias).toBe("e2e-test");

      // 3. Update video space
      const updateData = { title: "Updated E2E Test Meeting" };

      (prisma.videoSpace.findUnique as any).mockResolvedValue(mockSpace);
      (zoomService.updateMeeting as any).mockResolvedValue({
        id: "zoom-456",
        topic: "Updated E2E Test Meeting",
      });
      (prisma.videoSpace.update as any).mockResolvedValue({
        ...mockSpace,
        ...updateData,
      });

      const updatedSpace = await videoService.updateVideoSpace(
        spaceId,
        updateData,
        userId
      );
      expect(updatedSpace.title).toBe("Updated E2E Test Meeting");

      // 4. Get analytics
      const mockAnalytics = {
        totalParticipants: 15,
        averageEngagement: 0.78,
        totalDuration: 6800,
        chatMessages: 23,
      };

      (zoomService.getMeetingAnalytics as any).mockResolvedValue(mockAnalytics);

      const analytics = await videoService.getVideoSpaceAnalytics(spaceId);
      expect(analytics).toEqual(mockAnalytics);

      // 5. List spaces with filtering
      (prisma.videoSpace.findMany as any).mockResolvedValue([updatedSpace]);
      (prisma.videoSpace.count as any).mockResolvedValue(1);

      const spacesList = await videoService.listVideoSpaces({
        page: 1,
        limit: 10,
        provider: "ZOOM",
        userId,
      });

      expect(spacesList.data).toHaveLength(1);
      expect(spacesList.data[0].provider).toBe("ZOOM");

      // 6. Delete video space
      (zoomService.deleteMeeting as any).mockResolvedValue(true);
      (prisma.videoSpace.update as any).mockResolvedValue({
        ...updatedSpace,
        status: "DELETED",
      });

      const deleted = await videoService.deleteVideoSpace(spaceId, userId);
      expect(deleted).toBe(true);

      // 7. Verify all operations were logged
      const logs = loggingService.getLogs({ userId }, 100);
      expect(logs.length).toBeGreaterThan(0);

      // 8. Check system health after operations
      const health = monitoringService.getSystemHealth();
      expect(health.overall).toMatch(/^(healthy|degraded|unhealthy)$/);
    });
  });
});
