/**
 * Simplified tests for WebhookRoutingService
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { WebhookRoutingService } from "../WebhookRoutingService";
import { VideoProvider } from "@prisma/client";

describe("WebhookRoutingService - Basic Tests", () => {
  let routingService: WebhookRoutingService;

  beforeEach(() => {
    routingService = new WebhookRoutingService();
  });

  describe("Service Initialization", () => {
    it("should create WebhookRoutingService instance", () => {
      expect(routingService).toBeInstanceOf(WebhookRoutingService);
      expect(routingService.validationService).toBeDefined();
      expect(routingService.syncService).toBeDefined();
    });

    it("should initialize with default metrics", () => {
      const metrics = routingService.getProcessingMetrics();
      expect(metrics.totalProcessed).toBe(0);
      expect(metrics.successCount).toBe(0);
      expect(metrics.errorCount).toBe(0);
    });
  });

  describe("Basic Webhook Processing", () => {
    it("should process valid ZOOM webhook", async () => {
      const request = {
        body: JSON.stringify({
          event: "meeting.started",
          payload: {
            object: {
              uuid: "zoom-meeting-123",
              id: 123456789,
            },
          },
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
        url: "/webhook",
      };

      const result = await routingService.processWebhook("ZOOM", request);

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.eventType).toBeDefined();
    });

    it("should process valid Google Meet webhook", async () => {
      const request = {
        body: JSON.stringify({
          eventType: "meeting.started",
          eventData: {
            meetingId: "meet-conference-123",
          },
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
        url: "/webhook",
      };

      const result = await routingService.processWebhook("MEET", request);

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.eventType).toBeDefined();
    });

    it("should process valid Vimeo webhook", async () => {
      const request = {
        body: JSON.stringify({
          type: "meeting.started",
          data: {
            meeting: {
              id: "vimeo-video-123",
            },
          },
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
        url: "/webhook",
      };

      const result = await routingService.processWebhook("VIMEO", request);

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.eventType).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed JSON", async () => {
      const request = {
        body: "invalid-json-payload",
        headers: {},
        method: "POST",
        url: "/webhook",
      };

      const result = await routingService.processWebhook("ZOOM", request);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid JSON payload");
    });

    it("should handle null payload", async () => {
      const request = {
        body: null,
        headers: {},
        method: "POST",
        url: "/webhook",
      };

      const result = await routingService.processWebhook("ZOOM", request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle empty payload", async () => {
      const request = {
        body: JSON.stringify({}),
        headers: {},
        method: "POST",
        url: "/webhook",
      };

      const result = await routingService.processWebhook("ZOOM", request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("Event Routing", () => {
    it("should route webhook to create event", async () => {
      const validationResult = {
        isValid: true,
        provider: "ZOOM" as VideoProvider,
        eventType: "meeting.started",
        payload: {
          object: { uuid: "test-meeting-123" },
        },
        headers: {},
        errors: [],
        warnings: [],
      };

      const event = await routingService.routeWebhook(validationResult);

      expect(event.provider).toBe("ZOOM");
      expect(event.eventType).toBe("meeting.started");
      expect(event.meetingId).toBe("test-meeting-123");
      expect(event.id).toBeDefined();
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it("should normalize event types", async () => {
      const validationResult = {
        isValid: true,
        provider: "MEET" as VideoProvider,
        eventType: "participant.joined",
        payload: {
          eventData: { meetingId: "meet-123" },
        },
        headers: {},
        errors: [],
        warnings: [],
      };

      const event = await routingService.routeWebhook(validationResult);

      expect(event.eventType).toBe("meeting.participant_joined");
    });
  });

  describe("Metrics Tracking", () => {
    it("should track processing metrics", async () => {
      const request = {
        body: JSON.stringify({
          event: "meeting.started",
          payload: { object: { uuid: "test-123" } },
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
        url: "/webhook",
      };

      await routingService.processWebhook("ZOOM", request);

      const metrics = routingService.getProcessingMetrics();
      expect(metrics.totalProcessed).toBeGreaterThan(0);
    });

    it("should track success and error counts", async () => {
      // Process a successful request
      const validRequest = {
        body: JSON.stringify({
          event: "meeting.started",
          payload: { object: { uuid: "test-123" } },
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
        url: "/webhook",
      };

      await routingService.processWebhook("ZOOM", validRequest);

      // Process an invalid request
      const invalidRequest = {
        body: "invalid-json",
        headers: {},
        method: "POST",
        url: "/webhook",
      };

      await routingService.processWebhook("ZOOM", invalidRequest);

      const metrics = routingService.getProcessingMetrics();
      expect(metrics.totalProcessed).toBe(2);
      expect(metrics.errorCount).toBeGreaterThan(0);
    });
  });

  describe("Provider-specific Processing", () => {
    it("should extract ZOOM meeting ID correctly", async () => {
      const validationResult = {
        isValid: true,
        provider: "ZOOM" as VideoProvider,
        eventType: "meeting.started",
        payload: {
          object: {
            uuid: "zoom-uuid-123",
            id: 987654321,
          },
        },
        headers: {},
        errors: [],
        warnings: [],
      };

      const event = await routingService.routeWebhook(validationResult);
      expect(event.meetingId).toBe("zoom-uuid-123");
    });

    it("should extract Google Meet meeting ID correctly", async () => {
      const validationResult = {
        isValid: true,
        provider: "MEET" as VideoProvider,
        eventType: "meeting.started",
        payload: {
          eventData: {
            meetingId: "meet-conference-456",
          },
        },
        headers: {},
        errors: [],
        warnings: [],
      };

      const event = await routingService.routeWebhook(validationResult);
      expect(event.meetingId).toBe("meet-conference-456");
    });

    it("should extract Vimeo meeting ID correctly", async () => {
      const validationResult = {
        isValid: true,
        provider: "VIMEO" as VideoProvider,
        eventType: "meeting.started",
        payload: {
          data: {
            meeting: { id: "vimeo-video-789" },
          },
        },
        headers: {},
        errors: [],
        warnings: [],
      };

      const event = await routingService.routeWebhook(validationResult);
      expect(event.meetingId).toBe("vimeo-video-789");
    });
  });
});
