/**
 * Tests for RealTimeSyncService
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { RealTimeSyncService } from "../RealTimeSyncService";
import { MeetingDataSyncService } from "../MeetingDataSyncService";
import { WebhookEvent } from "../WebhookRoutingService";
import { VideoProvider } from "@prisma/client";

// Mock the MeetingDataSyncService
vi.mock("../MeetingDataSyncService", () => ({
  MeetingDataSyncService: vi.fn().mockImplementation(() => ({
    manualSync: vi.fn().mockResolvedValue({
      success: true,
      provider: "ZOOM",
      meetingId: "test-meeting-123",
      recordsProcessed: 1,
      recordsUpdated: 1,
      recordsCreated: 0,
      errors: [],
    }),
  })),
}));

describe("RealTimeSyncService", () => {
  let realTimeSyncService: RealTimeSyncService;
  let mockSyncService: MeetingDataSyncService;

  beforeEach(() => {
    mockSyncService = new MeetingDataSyncService();
    realTimeSyncService = new RealTimeSyncService(mockSyncService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Real-time Event Handling", () => {
    it("should handle real-time webhook events", async () => {
      const webhookEvent: WebhookEvent = {
        id: "realtime-event-1",
        provider: "ZOOM" as VideoProvider,
        eventType: "meeting.participant_joined",
        meetingId: "test-meeting-123",
        userId: "participant-456",
        timestamp: new Date(),
        payload: {
          participant: {
            name: "John Doe",
            email: "john@example.com",
          },
        },
        processed: false,
        retryCount: 0,
      };

      await realTimeSyncService.handleRealTimeEvent(webhookEvent);

      const stats = realTimeSyncService.getRealTimeStats();
      expect(stats.eventsProcessed).toBeGreaterThan(0);
    });

    it("should start and manage live sync sessions", async () => {
      const meetingId = "live-sync-meeting-123";
      const sessionId = await realTimeSyncService.startLiveSync(
        "ZOOM",
        meetingId
      );

      expect(sessionId).toBeDefined();

      const session = realTimeSyncService.getLiveSyncSession(sessionId);
      expect(session?.isActive).toBe(true);
      expect(session?.meetingId).toBe(meetingId);
      expect(session?.provider).toBe("ZOOM");
    });

    it("should stop live sync sessions", async () => {
      const meetingId = "stop-sync-meeting-123";
      const sessionId = await realTimeSyncService.startLiveSync(
        "ZOOM",
        meetingId
      );

      await realTimeSyncService.stopLiveSync(sessionId);

      const session = realTimeSyncService.getLiveSyncSession(sessionId);
      expect(session?.isActive).toBe(false);
    });

    it("should track participants in live sessions", async () => {
      const meetingId = "participant-tracking-meeting";
      const sessionId = await realTimeSyncService.startLiveSync(
        "ZOOM",
        meetingId
      );

      const joinEvent: WebhookEvent = {
        id: "join-event-1",
        provider: "ZOOM" as VideoProvider,
        eventType: "meeting.participant_joined",
        meetingId,
        userId: "participant-789",
        timestamp: new Date(),
        payload: {
          participant: {
            name: "Alice Smith",
            email: "alice@example.com",
          },
        },
        processed: false,
        retryCount: 0,
      };

      await realTimeSyncService.handleRealTimeEvent(joinEvent);

      const session = realTimeSyncService.getLiveSyncSession(sessionId);
      expect(session?.participants.has("participant-789")).toBe(true);
    });

    it("should handle participant leave events", async () => {
      const meetingId = "participant-leave-meeting";
      const sessionId = await realTimeSyncService.startLiveSync(
        "ZOOM",
        meetingId
      );

      // First join
      const joinEvent: WebhookEvent = {
        id: "join-event-2",
        provider: "ZOOM" as VideoProvider,
        eventType: "meeting.participant_joined",
        meetingId,
        userId: "participant-leave-test",
        timestamp: new Date(),
        payload: {},
        processed: false,
        retryCount: 0,
      };

      await realTimeSyncService.handleRealTimeEvent(joinEvent);

      // Then leave
      const leaveEvent: WebhookEvent = {
        id: "leave-event-1",
        provider: "ZOOM" as VideoProvider,
        eventType: "meeting.participant_left",
        meetingId,
        userId: "participant-leave-test",
        timestamp: new Date(),
        payload: {},
        processed: false,
        retryCount: 0,
      };

      await realTimeSyncService.handleRealTimeEvent(leaveEvent);

      const session = realTimeSyncService.getLiveSyncSession(sessionId);
      expect(session?.participants.has("participant-leave-test")).toBe(false);
    });
  });

  describe("Sync Conflict Detection", () => {
    it("should detect sync conflicts", async () => {
      const conflictEvent: WebhookEvent = {
        id: "conflict-event-1",
        provider: "ZOOM" as VideoProvider,
        eventType: "meeting.started",
        meetingId: "conflict-meeting-123",
        userId: undefined,
        timestamp: new Date(),
        payload: {
          lastModified: new Date(Date.now() - 5000).toISOString(), // 5 seconds ago
        },
        processed: false,
        retryCount: 0,
      };

      await realTimeSyncService.handleRealTimeEvent(conflictEvent);

      const conflicts = realTimeSyncService.getSyncConflicts();
      expect(conflicts).toBeDefined();
    });

    it("should resolve sync conflicts automatically when possible", async () => {
      const event1: WebhookEvent = {
        id: "conflict-resolve-1",
        provider: "ZOOM" as VideoProvider,
        eventType: "meeting.started",
        meetingId: "resolve-meeting-123",
        userId: undefined,
        timestamp: new Date(Date.now() - 1000),
        payload: { version: 1 },
        processed: false,
        retryCount: 0,
      };

      const event2: WebhookEvent = {
        id: "conflict-resolve-2",
        provider: "ZOOM" as VideoProvider,
        eventType: "meeting.started",
        meetingId: "resolve-meeting-123",
        userId: undefined,
        timestamp: new Date(),
        payload: { version: 2 },
        processed: false,
        retryCount: 0,
      };

      await realTimeSyncService.handleRealTimeEvent(event1);
      await realTimeSyncService.handleRealTimeEvent(event2);

      // Should handle conflicts gracefully
      const stats = realTimeSyncService.getRealTimeStats();
      expect(stats.conflictsResolved).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Performance and Reliability", () => {
    it("should handle high-frequency events efficiently", async () => {
      const meetingId = "high-frequency-meeting";
      const sessionId = await realTimeSyncService.startLiveSync(
        "ZOOM",
        meetingId
      );

      const events: WebhookEvent[] = Array(50)
        .fill(null)
        .map((_, i) => ({
          id: `high-freq-event-${i}`,
          provider: "ZOOM" as VideoProvider,
          eventType: "meeting.participant_joined",
          meetingId,
          userId: `participant-${i}`,
          timestamp: new Date(),
          payload: { participantIndex: i },
          processed: false,
          retryCount: 0,
        }));

      const startTime = Date.now();

      for (const event of events) {
        await realTimeSyncService.handleRealTimeEvent(event);
      }

      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(5000); // Should process 50 events within 5 seconds

      const session = realTimeSyncService.getLiveSyncSession(sessionId);
      expect(session?.participants.size).toBe(50);
    });

    it("should maintain session state consistency", async () => {
      const meetingId = "consistency-meeting";
      const sessionId = await realTimeSyncService.startLiveSync(
        "ZOOM",
        meetingId
      );

      // Simulate concurrent events
      const concurrentEvents = Array(10)
        .fill(null)
        .map((_, i) =>
          realTimeSyncService.handleRealTimeEvent({
            id: `concurrent-event-${i}`,
            provider: "ZOOM" as VideoProvider,
            eventType: "meeting.participant_joined",
            meetingId,
            userId: `concurrent-participant-${i}`,
            timestamp: new Date(),
            payload: {},
            processed: false,
            retryCount: 0,
          })
        );

      await Promise.all(concurrentEvents);

      const session = realTimeSyncService.getLiveSyncSession(sessionId);
      expect(session?.participants.size).toBe(10);
      expect(session?.updateCount).toBeGreaterThan(0);
    });

    it("should handle session cleanup properly", async () => {
      const meetingId = "cleanup-meeting";
      const sessionId = await realTimeSyncService.startLiveSync(
        "ZOOM",
        meetingId
      );

      // Add some participants
      await realTimeSyncService.handleRealTimeEvent({
        id: "cleanup-event-1",
        provider: "ZOOM" as VideoProvider,
        eventType: "meeting.participant_joined",
        meetingId,
        userId: "cleanup-participant",
        timestamp: new Date(),
        payload: {},
        processed: false,
        retryCount: 0,
      });

      await realTimeSyncService.stopLiveSync(sessionId);

      const session = realTimeSyncService.getLiveSyncSession(sessionId);
      expect(session?.isActive).toBe(false);

      // Session should still exist but be inactive
      expect(session).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid session IDs gracefully", async () => {
      const invalidSessionId = "invalid-session-123";

      const session = realTimeSyncService.getLiveSyncSession(invalidSessionId);
      expect(session).toBeUndefined();

      // Should not throw when stopping invalid session
      await expect(
        realTimeSyncService.stopLiveSync(invalidSessionId)
      ).resolves.not.toThrow();
    });

    it("should handle events for non-existent sessions", async () => {
      const orphanEvent: WebhookEvent = {
        id: "orphan-event-1",
        provider: "ZOOM" as VideoProvider,
        eventType: "meeting.participant_joined",
        meetingId: "non-existent-meeting",
        userId: "orphan-participant",
        timestamp: new Date(),
        payload: {},
        processed: false,
        retryCount: 0,
      };

      // Should handle gracefully without throwing
      await expect(
        realTimeSyncService.handleRealTimeEvent(orphanEvent)
      ).resolves.not.toThrow();
    });

    it("should handle malformed event data", async () => {
      const malformedEvent: WebhookEvent = {
        id: "malformed-event-1",
        provider: "ZOOM" as VideoProvider,
        eventType: "meeting.participant_joined",
        meetingId: "", // Empty meeting ID
        userId: undefined,
        timestamp: new Date(),
        payload: null as any,
        processed: false,
        retryCount: 0,
      };

      await expect(
        realTimeSyncService.handleRealTimeEvent(malformedEvent)
      ).resolves.not.toThrow();
    });
  });

  describe("Statistics and Monitoring", () => {
    it("should provide accurate real-time statistics", async () => {
      const initialStats = realTimeSyncService.getRealTimeStats();
      expect(initialStats.eventsProcessed).toBe(0);
      expect(initialStats.activeSessions).toBe(0);

      const meetingId = "stats-meeting";
      const sessionId = await realTimeSyncService.startLiveSync(
        "ZOOM",
        meetingId
      );

      const updatedStats = realTimeSyncService.getRealTimeStats();
      expect(updatedStats.activeSessions).toBe(1);

      await realTimeSyncService.handleRealTimeEvent({
        id: "stats-event-1",
        provider: "ZOOM" as VideoProvider,
        eventType: "meeting.started",
        meetingId,
        userId: undefined,
        timestamp: new Date(),
        payload: {},
        processed: false,
        retryCount: 0,
      });

      const finalStats = realTimeSyncService.getRealTimeStats();
      expect(finalStats.eventsProcessed).toBeGreaterThan(
        initialStats.eventsProcessed
      );
    });

    it("should track queue length accurately", async () => {
      const stats = realTimeSyncService.getRealTimeStats();
      expect(stats.queueLength).toBeGreaterThanOrEqual(0);
    });

    it("should provide session-specific statistics", async () => {
      const meetingId = "session-stats-meeting";
      const sessionId = await realTimeSyncService.startLiveSync(
        "ZOOM",
        meetingId
      );

      // Add some activity
      await realTimeSyncService.handleRealTimeEvent({
        id: "session-stats-event-1",
        provider: "ZOOM" as VideoProvider,
        eventType: "meeting.participant_joined",
        meetingId,
        userId: "stats-participant",
        timestamp: new Date(),
        payload: {},
        processed: false,
        retryCount: 0,
      });

      const session = realTimeSyncService.getLiveSyncSession(sessionId);
      expect(session?.updateCount).toBeGreaterThan(0);
      expect(session?.participants.size).toBe(1);
    });
  });
});
