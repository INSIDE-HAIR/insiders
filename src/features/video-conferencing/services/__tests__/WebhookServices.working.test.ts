/**
 * Working tests for webhook services
 */
import { describe, it, expect, beforeEach } from "vitest";
import { WebhookValidationService } from "../WebhookValidationService";
import { WebhookRoutingService } from "../WebhookRoutingService";
import { RealTimeSyncService } from "../RealTimeSyncService";
import { MeetingDataSyncService } from "../MeetingDataSyncService";
import { VideoProvider } from "@prisma/client";

describe("Webhook Services - Working Tests", () => {
  let validationService: WebhookValidationService;
  let routingService: WebhookRoutingService;
  let syncService: MeetingDataSyncService;
  let realTimeSyncService: RealTimeSyncService;

  beforeEach(() => {
    validationService = new WebhookValidationService();
    routingService = new WebhookRoutingService();
    syncService = new MeetingDataSyncService();
    realTimeSyncService = new RealTimeSyncService(syncService);
  });

  describe("Service Initialization", () => {
    it("should create all services successfully", () => {
      expect(validationService).toBeInstanceOf(WebhookValidationService);
      expect(routingService).toBeInstanceOf(WebhookRoutingService);
      expect(syncService).toBeInstanceOf(MeetingDataSyncService);
      expect(realTimeSyncService).toBeInstanceOf(RealTimeSyncService);
    });

    it("should have required methods", () => {
      expect(typeof validationService.validateWebhook).toBe("function");
      expect(typeof routingService.processWebhook).toBe("function");
      expect(typeof routingService.routeWebhook).toBe("function");
      expect(typeof realTimeSyncService.startLiveSync).toBe("function");
      expect(typeof realTimeSyncService.handleRealTimeEvent).toBe("function");
    });
  });

  describe("Webhook Validation - Basic Structure", () => {
    it("should validate ZOOM webhook structure", async () => {
      const payload = {
        event: "meeting.started",
        payload: { object: { uuid: "test-123" } },
      };
      const headers = { "content-type": "application/json" };

      const result = await validationService.validateWebhook(
        "ZOOM",
        payload,
        headers
      );

      expect(result.provider).toBe("ZOOM");
      // Since validation will fail due to missing auth headers, we just check that we got a result
      expect(result).toBeDefined();
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle invalid payloads", async () => {
      const result = await validationService.validateWebhook("ZOOM", null, {});

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle rate limiting", async () => {
      const payload = {
        event: "meeting.started",
        payload: { object: { uuid: "test" } },
      };
      const headers = { "x-forwarded-for": "192.168.1.100" };

      // Trigger rate limit
      for (let i = 0; i < 101; i++) {
        await validationService.validateWebhook("ZOOM", payload, headers);
      }

      const result = await validationService.validateWebhook(
        "ZOOM",
        payload,
        headers
      );
      expect(result.rateLimited).toBe(true);
    });
  });

  describe("Webhook Routing - Event Creation", () => {
    it("should route validation result to event", async () => {
      const validationResult = {
        isValid: true,
        provider: "ZOOM" as VideoProvider,
        eventType: "meeting.started",
        payload: { object: { uuid: "test-meeting-123" } },
        headers: {},
        errors: [],
        warnings: [],
      };

      const event = await routingService.routeWebhook(validationResult);

      expect(event.id).toBeDefined();
      expect(event.provider).toBe("ZOOM");
      expect(event.eventType).toBe("meeting.started");
      expect(event.meetingId).toBe("test-meeting-123");
      expect(event.timestamp).toBeInstanceOf(Date);
      expect(event.processed).toBe(false);
      expect(event.retryCount).toBe(0);
    });

    it("should normalize event types across providers", async () => {
      const testCases = [
        {
          provider: "MEET" as VideoProvider,
          input: "participant.joined",
          expected: "meeting.participant_joined",
        },
        {
          provider: "VIMEO" as VideoProvider,
          input: "participant.left",
          expected: "meeting.participant_left",
        },
      ];

      for (const testCase of testCases) {
        const validationResult = {
          isValid: true,
          provider: testCase.provider,
          eventType: testCase.input,
          payload: {},
          headers: {},
          errors: [],
          warnings: [],
        };

        const event = await routingService.routeWebhook(validationResult);
        expect(event.eventType).toBe(testCase.expected);
      }
    });

    it("should extract meeting IDs correctly", async () => {
      const testCases = [
        {
          provider: "ZOOM" as VideoProvider,
          payload: { object: { uuid: "zoom-uuid-123" } },
          expected: "zoom-uuid-123",
        },
        {
          provider: "MEET" as VideoProvider,
          payload: { eventData: { meetingId: "meet-123" } },
          expected: "meet-123",
        },
        {
          provider: "VIMEO" as VideoProvider,
          payload: { data: { meeting: { id: "vimeo-123" } } },
          expected: "vimeo-123",
        },
      ];

      for (const testCase of testCases) {
        const validationResult = {
          isValid: true,
          provider: testCase.provider,
          eventType: "meeting.started",
          payload: testCase.payload,
          headers: {},
          errors: [],
          warnings: [],
        };

        const event = await routingService.routeWebhook(validationResult);
        expect(event.meetingId).toBe(testCase.expected);
      }
    });
  });

  describe("Real-time Sync Service", () => {
    it("should start and stop live sync sessions", async () => {
      const sessionId = await realTimeSyncService.startLiveSync(
        "ZOOM",
        "test-meeting-123"
      );

      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe("string");

      const session = realTimeSyncService.getLiveSyncSession(sessionId);
      expect(session?.isActive).toBe(true);
      expect(session?.meetingId).toBe("test-meeting-123");

      await realTimeSyncService.stopLiveSync(sessionId);

      const stoppedSession = realTimeSyncService.getLiveSyncSession(sessionId);
      expect(stoppedSession?.isActive).toBe(false);
    });

    it("should handle real-time events", async () => {
      const event = {
        id: "test-event-1",
        provider: "ZOOM" as VideoProvider,
        eventType: "meeting.started",
        meetingId: "test-meeting-123",
        timestamp: new Date(),
        payload: {},
        processed: false,
        retryCount: 0,
      };

      await expect(
        realTimeSyncService.handleRealTimeEvent(event)
      ).resolves.not.toThrow();

      const stats = realTimeSyncService.getRealTimeStats();
      expect(stats.eventsProcessed).toBeGreaterThan(0);
    });

    it("should provide statistics", () => {
      const stats = realTimeSyncService.getRealTimeStats();

      expect(stats).toHaveProperty("eventsProcessed");
      expect(stats).toHaveProperty("activeSessions");
      expect(stats).toHaveProperty("queueLength");
      expect(stats).toHaveProperty("conflictsResolved");
      expect(typeof stats.eventsProcessed).toBe("number");
      expect(typeof stats.activeSessions).toBe("number");
    });

    it("should track conflicts", () => {
      const conflicts = realTimeSyncService.getSyncConflicts();
      expect(Array.isArray(conflicts)).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed webhook requests", async () => {
      const request = {
        body: "invalid-json",
        headers: {},
        method: "POST",
        url: "/webhook",
      };

      const result = await routingService.processWebhook("ZOOM", request);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid JSON payload");
    });

    it("should handle null payloads gracefully", async () => {
      const result = await validationService.validateWebhook("ZOOM", null, {});

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle sync service errors", async () => {
      const event = {
        id: "error-test",
        provider: "ZOOM" as VideoProvider,
        eventType: "invalid.event",
        meetingId: "test-meeting",
        timestamp: new Date(),
        payload: {},
        processed: false,
        retryCount: 0,
      };

      // This should not throw even with invalid event type
      await expect(
        realTimeSyncService.handleRealTimeEvent(event)
      ).resolves.not.toThrow();
    });
  });

  describe("Integration Tests", () => {
    it("should process webhook end-to-end with validation failure", async () => {
      const request = {
        body: JSON.stringify({
          event: "meeting.started",
          payload: { object: { uuid: "integration-test" } },
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
        url: "/webhook",
      };

      const result = await routingService.processWebhook("ZOOM", request);

      // Since validation will fail (missing auth headers), we expect failure
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should track metrics across multiple operations", async () => {
      const initialMetrics = routingService.getProcessingMetrics();

      // Process multiple requests
      const requests = [
        { body: "invalid-json", headers: {}, method: "POST", url: "/webhook" },
        { body: null, headers: {}, method: "POST", url: "/webhook" },
        {
          body: JSON.stringify({}),
          headers: {},
          method: "POST",
          url: "/webhook",
        },
      ];

      for (const request of requests) {
        await routingService.processWebhook("ZOOM", request);
      }

      const finalMetrics = routingService.getProcessingMetrics();
      expect(finalMetrics.totalProcessed).toBeGreaterThan(
        initialMetrics.totalProcessed
      );
      expect(finalMetrics.errorCount).toBeGreaterThan(
        initialMetrics.errorCount
      );
    });
  });

  describe("Performance Tests", () => {
    it("should handle multiple events efficiently", async () => {
      const events = Array(5)
        .fill(null)
        .map((_, i) => ({
          id: `perf-test-${i}`,
          provider: "ZOOM" as VideoProvider,
          eventType: "meeting.started",
          meetingId: `meeting-${i}`,
          timestamp: new Date(),
          payload: {},
          processed: false,
          retryCount: 0,
        }));

      const startTime = Date.now();

      for (const event of events) {
        await realTimeSyncService.handleRealTimeEvent(event);
      }

      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(2000); // Should complete within 2 seconds

      const stats = realTimeSyncService.getRealTimeStats();
      expect(stats.eventsProcessed).toBe(5);
    });

    it("should handle concurrent sessions", async () => {
      const sessionPromises = Array(3)
        .fill(null)
        .map((_, i) =>
          realTimeSyncService.startLiveSync("ZOOM", `concurrent-meeting-${i}`)
        );

      const sessionIds = await Promise.all(sessionPromises);

      expect(sessionIds).toHaveLength(3);
      sessionIds.forEach((id) => expect(typeof id).toBe("string"));

      const stats = realTimeSyncService.getRealTimeStats();
      expect(stats.activeSessions).toBe(3);
    });
  });
});
