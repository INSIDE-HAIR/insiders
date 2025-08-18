/**
 * Tests for WebhookRoutingService
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { WebhookRoutingService, WebhookEvent } from "../WebhookRoutingService";
import { VideoProvider } from "@prisma/client";

// Mock the dependencies
vi.mock("../MeetingDataSyncService", () => ({
  MeetingDataSyncService: vi.fn().mockImplementation(() => ({
    syncFromWebhook: vi.fn().mockResolvedValue({
      success: true,
      meetingId: "test-meeting-123",
    }),
  })),
}));

vi.mock("../WebhookValidationService", () => ({
  WebhookValidationService: vi.fn().mockImplementation(() => ({
    validateWebhook: vi.fn().mockResolvedValue({
      isValid: true,
      provider: "ZOOM",
      errors: [],
      rateLimited: false,
    }),
  })),
}));

describe("WebhookRoutingService", () => {
  let routingService: WebhookRoutingService;
  let mockRequest: any;
  let mockWebhookEvent: WebhookEvent;

  beforeEach(() => {
    routingService = new WebhookRoutingService();

    mockRequest = {
      headers: new Map([
        ["content-type", "application/json"],
        ["user-agent", "Zoom-Webhook/1.0"],
      ]),
      body: JSON.stringify({
        event: "meeting.started",
        payload: {
          object: {
            id: "test-meeting-123",
            topic: "Test Meeting",
            start_time: new Date().toISOString(),
          },
        },
      }),
      method: "POST",
      url: "https://example.com/webhook/zoom",
    };

    mockWebhookEvent = {
      id: "test-event-1",
      provider: "ZOOM" as VideoProvider,
      eventType: "meeting.started",
      meetingId: "test-meeting-123",
      userId: "test-user-456",
      timestamp: new Date(),
      payload: {
        object: {
          id: "test-meeting-123",
          topic: "Test Meeting",
        },
      },
      processed: false,
      retryCount: 0,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("processWebhook", () => {
    it("should successfully process a valid Zoom webhook", async () => {
      const result = await routingService.processWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.success).toBe(true);
      expect(result.eventId).toBeDefined();
      expect(result.provider).toBe("ZOOM");
      expect(result.processed).toBe(true);
    });

    it("should successfully process a valid Google Meet webhook", async () => {
      const meetRequest = {
        ...mockRequest,
        body: JSON.stringify({
          eventType: "conferenceRecord.started",
          conferenceRecord: {
            name: "conferences/test-conference-123",
            startTime: new Date().toISOString(),
          },
        }),
      };

      const result = await routingService.processWebhook(
        "MEET" as VideoProvider,
        meetRequest
      );

      expect(result.success).toBe(true);
      expect(result.provider).toBe("MEET");
    });

    it("should successfully process a valid Vimeo webhook", async () => {
      const vimeoRequest = {
        ...mockRequest,
        body: JSON.stringify({
          trigger: "video.upload",
          data: {
            video: {
              uri: "/videos/123456789",
              name: "Test Video",
              created_time: new Date().toISOString(),
            },
          },
        }),
      };

      const result = await routingService.processWebhook(
        "VIMEO" as VideoProvider,
        vimeoRequest
      );

      expect(result.success).toBe(true);
      expect(result.provider).toBe("VIMEO");
    });

    it("should reject webhook with validation failure", async () => {
      // Mock validation service to return invalid
      const mockValidationService = {
        validateWebhook: vi.fn().mockResolvedValue({
          isValid: false,
          provider: "ZOOM",
          errors: ["Invalid signature"],
          rateLimited: false,
        }),
      };

      routingService = new WebhookRoutingService();
      // @ts-ignore - accessing private property for testing
      routingService.validationService = mockValidationService;

      const result = await routingService.processWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Webhook validation failed");
      expect(result.validationErrors).toContain("Invalid signature");
    });

    it("should handle rate limited requests", async () => {
      // Mock validation service to return rate limited
      const mockValidationService = {
        validateWebhook: vi.fn().mockResolvedValue({
          isValid: true,
          provider: "ZOOM",
          errors: [],
          rateLimited: true,
        }),
      };

      routingService = new WebhookRoutingService();
      // @ts-ignore - accessing private property for testing
      routingService.validationService = mockValidationService;

      const result = await routingService.processWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Rate limit exceeded");
      expect(result.rateLimited).toBe(true);
    });

    it("should handle malformed JSON payload", async () => {
      const invalidRequest = {
        ...mockRequest,
        body: "invalid-json-payload",
      };

      const result = await routingService.processWebhook(
        "ZOOM" as VideoProvider,
        invalidRequest
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid JSON payload");
    });

    it("should handle unsupported provider", async () => {
      const result = await routingService.processWebhook(
        "INVALID" as VideoProvider,
        mockRequest
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unsupported provider");
    });
  });

  describe("event routing", () => {
    it("should route meeting events correctly", async () => {
      const meetingEvents = [
        "meeting.started",
        "meeting.ended",
        "meeting.participant_joined",
        "meeting.participant_left",
      ];

      for (const eventType of meetingEvents) {
        const request = {
          ...mockRequest,
          body: JSON.stringify({
            event: eventType,
            payload: { object: { id: "test-meeting" } },
          }),
        };

        const result = await routingService.processWebhook(
          "ZOOM" as VideoProvider,
          request
        );
        expect(result.success).toBe(true);
        expect(result.eventType).toBe(eventType);
      }
    });

    it("should route recording events correctly", async () => {
      const recordingEvents = [
        "recording.completed",
        "recording.transcript_completed",
      ];

      for (const eventType of recordingEvents) {
        const request = {
          ...mockRequest,
          body: JSON.stringify({
            event: eventType,
            payload: { object: { id: "test-recording" } },
          }),
        };

        const result = await routingService.processWebhook(
          "ZOOM" as VideoProvider,
          request
        );
        expect(result.success).toBe(true);
        expect(result.eventType).toBe(eventType);
      }
    });

    it("should handle unknown event types gracefully", async () => {
      const request = {
        ...mockRequest,
        body: JSON.stringify({
          event: "unknown.event.type",
          payload: { object: { id: "test" } },
        }),
      };

      const result = await routingService.processWebhook(
        "ZOOM" as VideoProvider,
        request
      );
      expect(result.success).toBe(true);
      expect(result.eventType).toBe("unknown.event.type");
      expect(result.warnings).toContain("Unknown event type");
    });
  });

  describe("event transformation", () => {
    it("should transform Zoom events correctly", async () => {
      const zoomPayload = {
        event: "meeting.started",
        payload: {
          object: {
            id: "zoom-meeting-123",
            uuid: "zoom-uuid-456",
            topic: "Zoom Test Meeting",
            start_time: "2024-01-01T10:00:00Z",
            host_id: "zoom-host-789",
          },
        },
      };

      const request = {
        ...mockRequest,
        body: JSON.stringify(zoomPayload),
      };

      const result = await routingService.processWebhook(
        "ZOOM" as VideoProvider,
        request
      );

      expect(result.success).toBe(true);
      expect(result.meetingId).toBe("zoom-meeting-123");
      expect(result.transformedPayload).toBeDefined();
    });

    it("should transform Google Meet events correctly", async () => {
      const meetPayload = {
        eventType: "conferenceRecord.started",
        conferenceRecord: {
          name: "conferences/meet-conference-123",
          startTime: "2024-01-01T10:00:00Z",
        },
      };

      const request = {
        ...mockRequest,
        body: JSON.stringify(meetPayload),
      };

      const result = await routingService.processWebhook(
        "MEET" as VideoProvider,
        request
      );

      expect(result.success).toBe(true);
      expect(result.meetingId).toBe("meet-conference-123");
    });

    it("should transform Vimeo events correctly", async () => {
      const vimeoPayload = {
        trigger: "video.upload",
        data: {
          video: {
            uri: "/videos/vimeo-video-123",
            name: "Vimeo Test Video",
            created_time: "2024-01-01T10:00:00Z",
          },
        },
      };

      const request = {
        ...mockRequest,
        body: JSON.stringify(vimeoPayload),
      };

      const result = await routingService.processWebhook(
        "VIMEO" as VideoProvider,
        request
      );

      expect(result.success).toBe(true);
      expect(result.meetingId).toBe("vimeo-video-123");
    });
  });

  describe("retry mechanism", () => {
    it("should retry failed webhook processing", async () => {
      // Mock sync service to fail first time, succeed second time
      let callCount = 0;
      const mockSyncService = {
        syncFromWebhook: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({
              success: false,
              error: "Temporary failure",
            });
          }
          return Promise.resolve({ success: true, meetingId: "test-meeting" });
        }),
      };

      routingService = new WebhookRoutingService();
      // @ts-ignore - accessing private property for testing
      routingService.syncService = mockSyncService;

      const result = await routingService.processWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.success).toBe(true);
      expect(mockSyncService.syncFromWebhook).toHaveBeenCalledTimes(2);
      expect(result.retryCount).toBe(1);
    });

    it("should fail after maximum retry attempts", async () => {
      // Mock sync service to always fail
      const mockSyncService = {
        syncFromWebhook: vi.fn().mockResolvedValue({
          success: false,
          error: "Persistent failure",
        }),
      };

      routingService = new WebhookRoutingService();
      // @ts-ignore - accessing private property for testing
      routingService.syncService = mockSyncService;

      const result = await routingService.processWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Max retry attempts exceeded");
      expect(result.retryCount).toBe(3); // Default max retries
    });

    it("should use exponential backoff for retries", async () => {
      vi.useFakeTimers();

      let callCount = 0;
      const mockSyncService = {
        syncFromWebhook: vi.fn().mockImplementation(() => {
          callCount++;
          return Promise.resolve({
            success: false,
            error: "Temporary failure",
          });
        }),
      };

      routingService = new WebhookRoutingService();
      // @ts-ignore - accessing private property for testing
      routingService.syncService = mockSyncService;

      const processPromise = routingService.processWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      // Fast-forward through retry delays
      await vi.runAllTimersAsync();

      const result = await processPromise;

      expect(result.retryCount).toBeGreaterThan(0);

      vi.useRealTimers();
    });
  });

  describe("event queuing", () => {
    it("should queue events when processing is busy", async () => {
      // Mock sync service to be slow
      const mockSyncService = {
        syncFromWebhook: vi
          .fn()
          .mockImplementation(
            () =>
              new Promise((resolve) =>
                setTimeout(() => resolve({ success: true }), 100)
              )
          ),
      };

      routingService = new WebhookRoutingService();
      // @ts-ignore - accessing private property for testing
      routingService.syncService = mockSyncService;

      // Process multiple webhooks simultaneously
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          routingService.processWebhook("ZOOM" as VideoProvider, mockRequest)
        );
      }

      const results = await Promise.all(promises);

      expect(results.every((r) => r.success)).toBe(true);
      expect(mockSyncService.syncFromWebhook).toHaveBeenCalledTimes(5);
    });

    it("should handle queue overflow gracefully", async () => {
      // Mock sync service to be very slow
      const mockSyncService = {
        syncFromWebhook: vi
          .fn()
          .mockImplementation(
            () =>
              new Promise((resolve) =>
                setTimeout(() => resolve({ success: true }), 1000)
              )
          ),
      };

      routingService = new WebhookRoutingService();
      // @ts-ignore - accessing private property for testing
      routingService.syncService = mockSyncService;

      // Try to queue more events than the limit
      const promises = [];
      for (let i = 0; i < 1000; i++) {
        promises.push(
          routingService.processWebhook("ZOOM" as VideoProvider, mockRequest)
        );
      }

      const results = await Promise.allSettled(promises);

      // Some should succeed, some might be rejected due to queue overflow
      const successful = results.filter((r) => r.status === "fulfilled").length;
      expect(successful).toBeGreaterThan(0);
    });
  });

  describe("error handling", () => {
    it("should handle sync service errors gracefully", async () => {
      // Mock sync service to throw error
      const mockSyncService = {
        syncFromWebhook: vi
          .fn()
          .mockRejectedValue(new Error("Sync service error")),
      };

      routingService = new WebhookRoutingService();
      // @ts-ignore - accessing private property for testing
      routingService.syncService = mockSyncService;

      const result = await routingService.processWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Sync service error");
    });

    it("should handle validation service errors gracefully", async () => {
      // Mock validation service to throw error
      const mockValidationService = {
        validateWebhook: vi
          .fn()
          .mockRejectedValue(new Error("Validation service error")),
      };

      routingService = new WebhookRoutingService();
      // @ts-ignore - accessing private property for testing
      routingService.validationService = mockValidationService;

      const result = await routingService.processWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation service error");
    });

    it("should handle network timeouts", async () => {
      vi.useFakeTimers();

      // Mock sync service to timeout
      const mockSyncService = {
        syncFromWebhook: vi.fn().mockImplementation(
          () => new Promise(() => {}) // Never resolves
        ),
      };

      routingService = new WebhookRoutingService();
      // @ts-ignore - accessing private property for testing
      routingService.syncService = mockSyncService;

      const processPromise = routingService.processWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      // Fast-forward past timeout
      vi.advanceTimersByTime(30000); // 30 seconds

      const result = await processPromise;

      expect(result.success).toBe(false);
      expect(result.error).toContain("timeout");

      vi.useRealTimers();
    });
  });

  describe("monitoring and logging", () => {
    it("should log webhook processing attempts", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await routingService.processWebhook("ZOOM" as VideoProvider, mockRequest);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Processing webhook")
      );

      consoleSpy.mockRestore();
    });

    it("should log processing failures", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const invalidRequest = {
        ...mockRequest,
        body: "invalid-json",
      };

      await routingService.processWebhook(
        "ZOOM" as VideoProvider,
        invalidRequest
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Webhook processing failed")
      );

      consoleSpy.mockRestore();
    });

    it("should track processing metrics", async () => {
      await routingService.processWebhook("ZOOM" as VideoProvider, mockRequest);

      const metrics = routingService.getProcessingMetrics();

      expect(metrics.totalProcessed).toBe(1);
      expect(metrics.successfullyProcessed).toBe(1);
      expect(metrics.failedProcessed).toBe(0);
      expect(metrics.averageProcessingTime).toBeGreaterThan(0);
    });
  });

  describe("performance", () => {
    it("should process webhooks within acceptable time limits", async () => {
      const startTime = Date.now();

      await routingService.processWebhook("ZOOM" as VideoProvider, mockRequest);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it("should handle high throughput", async () => {
      const promises = [];
      const startTime = Date.now();

      // Process 100 webhooks concurrently
      for (let i = 0; i < 100; i++) {
        promises.push(
          routingService.processWebhook("ZOOM" as VideoProvider, mockRequest)
        );
      }

      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;

      expect(results.every((r) => r.success)).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});
