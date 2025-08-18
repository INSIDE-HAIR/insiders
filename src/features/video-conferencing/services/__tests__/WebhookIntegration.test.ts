/**
 * Integration Tests for Webhook Processing Flow
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { WebhookRoutingService } from "../WebhookRoutingService";
import { WebhookValidationService } from "../WebhookValidationService";
import { MeetingDataSyncService } from "../MeetingDataSyncService";
import { VideoProvider } from "@prisma/client";
import crypto from "crypto";

describe("Webhook Processing Integration", () => {
  let routingService: WebhookRoutingService;
  let validationService: WebhookValidationService;
  let syncService: MeetingDataSyncService;

  beforeEach(() => {
    // Set up environment variables
    process.env.ZOOM_WEBHOOK_SECRET = "test-zoom-secret";
    process.env.ZOOM_WEBHOOK_TOKEN = "test-zoom-token";
    process.env.GOOGLE_WEBHOOK_SECRET = "test-google-secret";
    process.env.VIMEO_WEBHOOK_SECRET = "test-vimeo-secret";

    // Initialize services
    validationService = new WebhookValidationService();
    syncService = new MeetingDataSyncService();
    routingService = new WebhookRoutingService();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clean up environment variables
    delete process.env.ZOOM_WEBHOOK_SECRET;
    delete process.env.ZOOM_WEBHOOK_TOKEN;
    delete process.env.GOOGLE_WEBHOOK_SECRET;
    delete process.env.VIMEO_WEBHOOK_SECRET;
  });

  describe("End-to-End Zoom Webhook Processing", () => {
    it("should process complete Zoom meeting lifecycle", async () => {
      const meetingId = "zoom-meeting-12345";
      const events = [
        {
          event: "meeting.started",
          payload: {
            object: {
              id: meetingId,
              uuid: "zoom-uuid-12345",
              topic: "Integration Test Meeting",
              start_time: "2024-01-01T10:00:00Z",
              host_id: "zoom-host-123",
              host_email: "host@example.com",
            },
          },
        },
        {
          event: "meeting.participant_joined",
          payload: {
            object: {
              id: meetingId,
              participant: {
                id: "participant-1",
                user_name: "John Doe",
                email: "john@example.com",
                join_time: "2024-01-01T10:01:00Z",
              },
            },
          },
        },
        {
          event: "meeting.participant_left",
          payload: {
            object: {
              id: meetingId,
              participant: {
                id: "participant-1",
                user_name: "John Doe",
                email: "john@example.com",
                leave_time: "2024-01-01T10:30:00Z",
              },
            },
          },
        },
        {
          event: "meeting.ended",
          payload: {
            object: {
              id: meetingId,
              uuid: "zoom-uuid-12345",
              topic: "Integration Test Meeting",
              end_time: "2024-01-01T10:35:00Z",
              duration: 35,
            },
          },
        },
        {
          event: "recording.completed",
          payload: {
            object: {
              id: meetingId,
              recording_files: [
                {
                  id: "recording-file-1",
                  download_url: "https://zoom.us/recording/download/123",
                  file_type: "MP4",
                  file_size: 1024000,
                },
              ],
            },
          },
        },
      ];

      const results = [];

      for (const eventData of events) {
        const request = createZoomWebhookRequest(eventData);
        const result = await routingService.processWebhook(
          "ZOOM" as VideoProvider,
          request
        );
        results.push(result);
      }

      // Verify all events were processed successfully
      expect(results.every((r) => r.success)).toBe(true);

      // Verify event types were correctly identified
      expect(results[0].eventType).toBe("meeting.started");
      expect(results[1].eventType).toBe("meeting.participant_joined");
      expect(results[2].eventType).toBe("meeting.participant_left");
      expect(results[3].eventType).toBe("meeting.ended");
      expect(results[4].eventType).toBe("recording.completed");

      // Verify meeting ID was extracted correctly
      expect(results.every((r) => r.meetingId === meetingId)).toBe(true);
    });

    it("should handle Zoom webhook with invalid signature", async () => {
      const eventData = {
        event: "meeting.started",
        payload: {
          object: {
            id: "test-meeting",
            topic: "Test Meeting",
          },
        },
      };

      const request = createZoomWebhookRequest(eventData, {
        invalidSignature: true,
      });
      const result = await routingService.processWebhook(
        "ZOOM" as VideoProvider,
        request
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Webhook validation failed");
      expect(result.validationErrors).toContain("Invalid signature");
    });

    it("should handle Zoom webhook rate limiting", async () => {
      const eventData = {
        event: "meeting.started",
        payload: { object: { id: "test-meeting" } },
      };

      const clientIp = "192.168.1.100";
      const results = [];

      // Send many requests from same IP to trigger rate limiting
      for (let i = 0; i < 60; i++) {
        const request = createZoomWebhookRequest(eventData, { clientIp });
        const result = await routingService.processWebhook(
          "ZOOM" as VideoProvider,
          request
        );
        results.push(result);
      }

      // Some requests should be rate limited
      const rateLimitedResults = results.filter((r) => r.rateLimited);
      expect(rateLimitedResults.length).toBeGreaterThan(0);
    });
  });

  describe("End-to-End Google Meet Webhook Processing", () => {
    it("should process Google Meet conference record events", async () => {
      const conferenceId = "meet-conference-12345";
      const events = [
        {
          eventType: "conferenceRecord.started",
          conferenceRecord: {
            name: `conferences/${conferenceId}`,
            startTime: "2024-01-01T10:00:00Z",
            space: {
              name: "spaces/meet-space-123",
              displayName: "Integration Test Space",
            },
          },
        },
        {
          eventType: "conferenceRecord.ended",
          conferenceRecord: {
            name: `conferences/${conferenceId}`,
            endTime: "2024-01-01T10:30:00Z",
            space: {
              name: "spaces/meet-space-123",
              displayName: "Integration Test Space",
            },
          },
        },
      ];

      const results = [];

      for (const eventData of events) {
        const request = createGoogleMeetWebhookRequest(eventData);
        const result = await routingService.processWebhook(
          "MEET" as VideoProvider,
          request
        );
        results.push(result);
      }

      // Verify all events were processed successfully
      expect(results.every((r) => r.success)).toBe(true);

      // Verify event types were correctly identified
      expect(results[0].eventType).toBe("conferenceRecord.started");
      expect(results[1].eventType).toBe("conferenceRecord.ended");

      // Verify meeting ID was extracted correctly
      expect(results.every((r) => r.meetingId === conferenceId)).toBe(true);
    });
  });

  describe("End-to-End Vimeo Webhook Processing", () => {
    it("should process Vimeo video events", async () => {
      const videoId = "vimeo-video-12345";
      const events = [
        {
          trigger: "video.upload",
          data: {
            video: {
              uri: `/videos/${videoId}`,
              name: "Integration Test Video",
              created_time: "2024-01-01T10:00:00Z",
              status: "available",
            },
          },
        },
        {
          trigger: "video.transcode.complete",
          data: {
            video: {
              uri: `/videos/${videoId}`,
              name: "Integration Test Video",
              transcode: {
                status: "complete",
                progress: 100,
              },
            },
          },
        },
      ];

      const results = [];

      for (const eventData of events) {
        const request = createVimeoWebhookRequest(eventData);
        const result = await routingService.processWebhook(
          "VIMEO" as VideoProvider,
          request
        );
        results.push(result);
      }

      // Verify all events were processed successfully
      expect(results.every((r) => r.success)).toBe(true);

      // Verify event types were correctly identified
      expect(results[0].eventType).toBe("video.upload");
      expect(results[1].eventType).toBe("video.transcode.complete");

      // Verify video ID was extracted correctly
      expect(results.every((r) => r.meetingId === videoId)).toBe(true);
    });
  });

  describe("Error Recovery and Resilience", () => {
    it("should recover from temporary sync service failures", async () => {
      // Mock sync service to fail first few times, then succeed
      let callCount = 0;
      const originalSyncFromWebhook = syncService.syncFromWebhook;

      vi.spyOn(syncService, "syncFromWebhook").mockImplementation(
        async (event, options) => {
          callCount++;
          if (callCount <= 2) {
            return {
              success: false,
              error: "Temporary database connection error",
            };
          }
          return originalSyncFromWebhook.call(syncService, event, options);
        }
      );

      const eventData = {
        event: "meeting.started",
        payload: { object: { id: "test-meeting" } },
      };

      const request = createZoomWebhookRequest(eventData);
      const result = await routingService.processWebhook(
        "ZOOM" as VideoProvider,
        request
      );

      expect(result.success).toBe(true);
      expect(result.retryCount).toBe(2);
      expect(syncService.syncFromWebhook).toHaveBeenCalledTimes(3);
    });

    it("should handle malformed webhook payloads gracefully", async () => {
      const malformedPayloads = [
        "not-json",
        '{"incomplete": json',
        "{}", // Empty object
        '{"event": null}', // Null event
        '{"event": "meeting.started"}', // Missing payload
      ];

      for (const payload of malformedPayloads) {
        const request = {
          headers: new Map([
            ["content-type", "application/json"],
            ["x-zm-request-timestamp", Date.now().toString()],
            ["x-zm-signature", "v0=invalid"],
            ["authorization", process.env.ZOOM_WEBHOOK_TOKEN],
          ]),
          body: payload,
          method: "POST",
          url: "https://example.com/webhook/zoom",
        };

        const result = await routingService.processWebhook(
          "ZOOM" as VideoProvider,
          request
        );

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      }
    });

    it("should handle concurrent webhook processing", async () => {
      const eventData = {
        event: "meeting.started",
        payload: { object: { id: "concurrent-test-meeting" } },
      };

      const promises = [];

      // Process 20 webhooks concurrently
      for (let i = 0; i < 20; i++) {
        const request = createZoomWebhookRequest({
          ...eventData,
          payload: { object: { id: `concurrent-meeting-${i}` } },
        });
        promises.push(
          routingService.processWebhook("ZOOM" as VideoProvider, request)
        );
      }

      const results = await Promise.all(promises);

      // All should succeed
      expect(results.every((r) => r.success)).toBe(true);

      // Each should have unique meeting ID
      const meetingIds = results.map((r) => r.meetingId);
      const uniqueMeetingIds = new Set(meetingIds);
      expect(uniqueMeetingIds.size).toBe(20);
    });
  });

  describe("Performance and Scalability", () => {
    it("should process webhooks within performance thresholds", async () => {
      const eventData = {
        event: "meeting.started",
        payload: { object: { id: "performance-test-meeting" } },
      };

      const request = createZoomWebhookRequest(eventData);
      const startTime = Date.now();

      const result = await routingService.processWebhook(
        "ZOOM" as VideoProvider,
        request
      );

      const processingTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(500); // Should complete within 500ms
    });

    it("should handle high-throughput webhook processing", async () => {
      const eventData = {
        event: "meeting.started",
        payload: { object: { id: "throughput-test-meeting" } },
      };

      const startTime = Date.now();
      const promises = [];

      // Process 100 webhooks
      for (let i = 0; i < 100; i++) {
        const request = createZoomWebhookRequest({
          ...eventData,
          payload: { object: { id: `throughput-meeting-${i}` } },
        });
        promises.push(
          routingService.processWebhook("ZOOM" as VideoProvider, request)
        );
      }

      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      expect(results.every((r) => r.success)).toBe(true);
      expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds

      const averageTime = totalTime / 100;
      expect(averageTime).toBeLessThan(100); // Average should be under 100ms per webhook
    });
  });

  // Helper functions
  function createZoomWebhookRequest(
    eventData: any,
    options: { invalidSignature?: boolean; clientIp?: string } = {}
  ) {
    const timestamp = Date.now().toString();
    const payload = JSON.stringify(eventData);

    let signature = "v0=invalid-signature";
    if (!options.invalidSignature) {
      const message = `v0:${timestamp}:${payload}`;
      signature = `v0=${crypto
        .createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET!)
        .update(message)
        .digest("hex")}`;
    }

    return {
      headers: new Map([
        ["content-type", "application/json"],
        ["x-zm-request-timestamp", timestamp],
        ["x-zm-signature", signature],
        ["authorization", process.env.ZOOM_WEBHOOK_TOKEN!],
        ["user-agent", "Zoom-Webhook/1.0"],
      ]),
      body: payload,
      method: "POST",
      url: "https://example.com/webhook/zoom",
      ip: options.clientIp || "192.168.1.1",
    };
  }

  function createGoogleMeetWebhookRequest(eventData: any) {
    const payload = JSON.stringify(eventData);
    const signature = crypto
      .createHmac("sha256", process.env.GOOGLE_WEBHOOK_SECRET!)
      .update(payload)
      .digest("base64");

    return {
      headers: new Map([
        ["content-type", "application/json"],
        ["x-goog-signature", signature],
        ["user-agent", "Google-Webhook/1.0"],
      ]),
      body: payload,
      method: "POST",
      url: "https://example.com/webhook/google",
      ip: "192.168.1.1",
    };
  }

  function createVimeoWebhookRequest(eventData: any) {
    const payload = JSON.stringify(eventData);
    const signature = crypto
      .createHmac("sha256", process.env.VIMEO_WEBHOOK_SECRET!)
      .update(payload)
      .digest("hex");

    return {
      headers: new Map([
        ["content-type", "application/json"],
        ["x-vimeo-signature", signature],
        ["user-agent", "Vimeo-Webhook/1.0"],
      ]),
      body: payload,
      method: "POST",
      url: "https://example.com/webhook/vimeo",
      ip: "192.168.1.1",
    };
  }
});
