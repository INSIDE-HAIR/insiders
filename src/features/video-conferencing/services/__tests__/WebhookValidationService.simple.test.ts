/**
 * Simplified tests for WebhookValidationService
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { WebhookValidationService } from "../WebhookValidationService";
import { VideoProvider } from "@prisma/client";

describe("WebhookValidationService - Basic Functionality", () => {
  let validationService: WebhookValidationService;

  beforeEach(() => {
    validationService = new WebhookValidationService();
    // Reset rate limits before each test
    validationService.resetRateLimits();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Validation", () => {
    it("should create validation service instance", () => {
      expect(validationService).toBeInstanceOf(WebhookValidationService);
    });

    it("should handle ZOOM webhook structure", async () => {
      const payload = {
        event: "meeting.started",
        payload: {
          object: {
            uuid: "test-meeting-123",
            id: 123456789,
          },
        },
      };
      const headers = {
        "content-type": "application/json",
      };

      const result = await validationService.validateWebhook(
        "ZOOM",
        payload,
        headers
      );

      expect(result.provider).toBe("ZOOM");
      expect(result.eventType).toBe("meeting.started");
      expect(result.payload).toEqual(payload);
    });

    it("should handle Google Meet webhook structure", async () => {
      const payload = {
        eventType: "meeting.started",
        eventData: {
          meetingId: "meet-123",
          title: "Test Meeting",
        },
      };
      const headers = {
        "content-type": "application/json",
      };

      const result = await validationService.validateWebhook(
        "MEET",
        payload,
        headers
      );

      expect(result.provider).toBe("MEET");
      expect(result.eventType).toBe("meeting.started");
      expect(result.payload).toEqual(payload);
    });

    it("should handle Vimeo webhook structure", async () => {
      const payload = {
        type: "meeting.started",
        data: {
          meeting: {
            id: "vimeo-meeting-789",
          },
        },
      };
      const headers = {
        "content-type": "application/json",
      };

      const result = await validationService.validateWebhook(
        "VIMEO",
        payload,
        headers
      );

      expect(result.provider).toBe("VIMEO");
      expect(result.eventType).toBe("meeting.started");
      expect(result.payload).toEqual(payload);
    });
  });

  describe("Error Handling", () => {
    it("should handle null payload", async () => {
      const result = await validationService.validateWebhook("ZOOM", null, {});

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle undefined payload", async () => {
      const result = await validationService.validateWebhook(
        "ZOOM",
        undefined,
        {}
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle empty payload", async () => {
      const result = await validationService.validateWebhook("ZOOM", {}, {});

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing event type");
    });
  });

  describe("Rate Limiting", () => {
    it("should track rate limits", async () => {
      const payload = {
        event: "meeting.started",
        payload: { object: { uuid: "test-123" } },
      };
      const headers = {
        "x-forwarded-for": "192.168.1.1",
        "content-type": "application/json",
      };

      // First request should pass
      const result1 = await validationService.validateWebhook(
        "ZOOM",
        payload,
        headers
      );
      expect(result1.rateLimited).toBeFalsy();

      // Simulate many requests to trigger rate limit
      for (let i = 0; i < 100; i++) {
        await validationService.validateWebhook("ZOOM", payload, headers);
      }

      // Next request should be rate limited
      const result2 = await validationService.validateWebhook(
        "ZOOM",
        payload,
        headers
      );
      expect(result2.rateLimited).toBe(true);
    });

    it("should reset rate limits", () => {
      validationService.resetRateLimits();
      // Should not throw and should reset internal state
      expect(() => validationService.resetRateLimits()).not.toThrow();
    });
  });

  describe("Provider-specific methods", () => {
    it("should have validateZoomWebhook method", async () => {
      const payload = {
        event: "meeting.started",
        payload: { object: { uuid: "test" } },
      };
      const headers = { "content-type": "application/json" };

      const result = await validationService.validateZoomWebhook(
        payload,
        headers
      );
      expect(result.provider).toBe("ZOOM");
    });

    it("should have validateGoogleMeetWebhook method", async () => {
      const payload = {
        eventType: "meeting.started",
        eventData: { meetingId: "test" },
      };
      const headers = { "content-type": "application/json" };

      const result = await validationService.validateGoogleMeetWebhook(
        payload,
        headers
      );
      expect(result.provider).toBe("MEET");
    });

    it("should have validateVimeoWebhook method", async () => {
      const payload = {
        type: "meeting.started",
        data: { meeting: { id: "test" } },
      };
      const headers = { "content-type": "application/json" };

      const result = await validationService.validateVimeoWebhook(
        payload,
        headers
      );
      expect(result.provider).toBe("VIMEO");
    });
  });

  describe("Event Type Extraction", () => {
    it("should extract ZOOM event types", async () => {
      const testCases = [
        { event: "meeting.started", expected: "meeting.started" },
        { event: "meeting.ended", expected: "meeting.ended" },
        { event: "recording.completed", expected: "recording.completed" },
      ];

      for (const testCase of testCases) {
        const payload = {
          event: testCase.event,
          payload: { object: { uuid: "test" } },
        };
        const result = await validationService.validateWebhook(
          "ZOOM",
          payload,
          {}
        );
        expect(result.eventType).toBe(testCase.expected);
      }
    });

    it("should extract Google Meet event types", async () => {
      const testCases = [
        { eventType: "meeting.started", expected: "meeting.started" },
        { eventType: "participant.joined", expected: "participant.joined" },
        { eventType: "recording.completed", expected: "recording.completed" },
      ];

      for (const testCase of testCases) {
        const payload = {
          eventType: testCase.eventType,
          eventData: { meetingId: "test" },
        };
        const result = await validationService.validateWebhook(
          "MEET",
          payload,
          {}
        );
        expect(result.eventType).toBe(testCase.expected);
      }
    });

    it("should extract Vimeo event types", async () => {
      const testCases = [
        { type: "meeting.started", expected: "meeting.started" },
        { type: "participant.joined", expected: "participant.joined" },
        { type: "recording.completed", expected: "recording.completed" },
      ];

      for (const testCase of testCases) {
        const payload = {
          type: testCase.type,
          data: { meeting: { id: "test" } },
        };
        const result = await validationService.validateWebhook(
          "VIMEO",
          payload,
          {}
        );
        expect(result.eventType).toBe(testCase.expected);
      }
    });
  });

  describe("Header Processing", () => {
    it("should handle string headers", async () => {
      const payload = {
        event: "meeting.started",
        payload: { object: { uuid: "test" } },
      };
      const headers = { "content-type": "application/json" };

      const result = await validationService.validateWebhook(
        "ZOOM",
        payload,
        headers
      );
      expect(result.headers).toEqual({ "content-type": "application/json" });
    });

    it("should handle array headers", async () => {
      const payload = {
        event: "meeting.started",
        payload: { object: { uuid: "test" } },
      };
      const headers = { "content-type": ["application/json", "charset=utf-8"] };

      const result = await validationService.validateWebhook(
        "ZOOM",
        payload,
        headers
      );
      expect(result.headers["content-type"]).toBe("application/json");
    });

    it("should normalize header keys to lowercase", async () => {
      const payload = {
        event: "meeting.started",
        payload: { object: { uuid: "test" } },
      };
      const headers = {
        "Content-Type": "application/json",
        "X-Custom-Header": "value",
      };

      const result = await validationService.validateWebhook(
        "ZOOM",
        payload,
        headers
      );
      expect(result.headers["content-type"]).toBe("application/json");
      expect(result.headers["x-custom-header"]).toBe("value");
    });
  });
});
