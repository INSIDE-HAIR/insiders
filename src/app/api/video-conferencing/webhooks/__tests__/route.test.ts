/**
 * Tests for Webhook API Endpoints
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../route";
import crypto from "crypto";

// Mock the services
vi.mock("@/features/video-conferencing/services/WebhookRoutingService", () => ({
  WebhookRoutingService: vi.fn().mockImplementation(() => ({
    processWebhook: vi.fn().mockResolvedValue({
      success: true,
      eventId: "test-event-123",
      provider: "ZOOM",
      eventType: "meeting.started",
      meetingId: "test-meeting-456",
      processed: true,
      timestamp: new Date(),
      processingTime: 150,
    }),
    getProcessingMetrics: vi.fn().mockReturnValue({
      totalProcessed: 100,
      successfullyProcessed: 95,
      failedProcessed: 5,
      averageProcessingTime: 200,
    }),
  })),
}));

describe("/api/video-conferencing/webhooks", () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    // Set up environment variables
    process.env.ZOOM_WEBHOOK_SECRET = "test-zoom-secret";
    process.env.ZOOM_WEBHOOK_TOKEN = "test-zoom-token";
    process.env.GOOGLE_WEBHOOK_SECRET = "test-google-secret";
    process.env.VIMEO_WEBHOOK_SECRET = "test-vimeo-secret";

    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.ZOOM_WEBHOOK_SECRET;
    delete process.env.ZOOM_WEBHOOK_TOKEN;
    delete process.env.GOOGLE_WEBHOOK_SECRET;
    delete process.env.VIMEO_WEBHOOK_SECRET;
  });

  describe("POST /api/video-conferencing/webhooks/zoom", () => {
    it("should process valid Zoom webhook", async () => {
      const eventData = {
        event: "meeting.started",
        payload: {
          object: {
            id: "zoom-meeting-123",
            topic: "Test Meeting",
            start_time: "2024-01-01T10:00:00Z",
          },
        },
      };

      mockRequest = createZoomWebhookRequest(eventData);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.eventId).toBe("test-event-123");
      expect(data.data.provider).toBe("ZOOM");
      expect(data.data.eventType).toBe("meeting.started");
    });

    it("should handle Zoom webhook validation failure", async () => {
      const eventData = {
        event: "meeting.started",
        payload: { object: { id: "test-meeting" } },
      };

      // Mock routing service to return validation failure
      const mockRoutingService = {
        processWebhook: vi.fn().mockResolvedValue({
          success: false,
          error: "Webhook validation failed",
          validationErrors: ["Invalid signature"],
          rateLimited: false,
        }),
      };

      vi.doMock(
        "@/features/video-conferencing/services/WebhookRoutingService",
        () => ({
          WebhookRoutingService: vi
            .fn()
            .mockImplementation(() => mockRoutingService),
        })
      );

      mockRequest = createZoomWebhookRequest(eventData, {
        invalidSignature: true,
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Webhook validation failed");
    });

    it("should handle Zoom webhook rate limiting", async () => {
      const eventData = {
        event: "meeting.started",
        payload: { object: { id: "test-meeting" } },
      };

      // Mock routing service to return rate limited
      const mockRoutingService = {
        processWebhook: vi.fn().mockResolvedValue({
          success: false,
          error: "Rate limit exceeded",
          rateLimited: true,
        }),
      };

      vi.doMock(
        "@/features/video-conferencing/services/WebhookRoutingService",
        () => ({
          WebhookRoutingService: vi
            .fn()
            .mockImplementation(() => mockRoutingService),
        })
      );

      mockRequest = createZoomWebhookRequest(eventData);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Rate limit exceeded");
    });

    it("should handle malformed JSON payload", async () => {
      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/webhooks/zoom",
        {
          method: "POST",
          body: "invalid-json-payload",
          headers: {
            "Content-Type": "application/json",
            "x-zm-request-timestamp": Date.now().toString(),
            "x-zm-signature": "v0=invalid",
            authorization: process.env.ZOOM_WEBHOOK_TOKEN!,
          },
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Invalid JSON payload");
    });

    it("should handle missing required headers", async () => {
      const eventData = {
        event: "meeting.started",
        payload: { object: { id: "test-meeting" } },
      };

      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/webhooks/zoom",
        {
          method: "POST",
          body: JSON.stringify(eventData),
          headers: {
            "Content-Type": "application/json",
            // Missing required Zoom headers
          },
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe("POST /api/video-conferencing/webhooks/google", () => {
    it("should process valid Google Meet webhook", async () => {
      const eventData = {
        eventType: "conferenceRecord.started",
        conferenceRecord: {
          name: "conferences/meet-conference-123",
          startTime: "2024-01-01T10:00:00Z",
        },
      };

      mockRequest = createGoogleMeetWebhookRequest(eventData);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.provider).toBe("ZOOM"); // Mocked response
    });

    it("should handle Google Meet webhook validation failure", async () => {
      const eventData = {
        eventType: "conferenceRecord.started",
        conferenceRecord: { name: "conferences/test" },
      };

      mockRequest = createGoogleMeetWebhookRequest(eventData, {
        invalidSignature: true,
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe("POST /api/video-conferencing/webhooks/vimeo", () => {
    it("should process valid Vimeo webhook", async () => {
      const eventData = {
        trigger: "video.upload",
        data: {
          video: {
            uri: "/videos/vimeo-video-123",
            name: "Test Video",
            created_time: "2024-01-01T10:00:00Z",
          },
        },
      };

      mockRequest = createVimeoWebhookRequest(eventData);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.provider).toBe("ZOOM"); // Mocked response
    });

    it("should handle Vimeo webhook validation failure", async () => {
      const eventData = {
        trigger: "video.upload",
        data: { video: { uri: "/videos/test" } },
      };

      mockRequest = createVimeoWebhookRequest(eventData, {
        invalidSignature: true,
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe("Error handling", () => {
    it("should handle service errors gracefully", async () => {
      const eventData = {
        event: "meeting.started",
        payload: { object: { id: "test-meeting" } },
      };

      // Mock routing service to throw error
      const mockRoutingService = {
        processWebhook: vi.fn().mockRejectedValue(new Error("Service error")),
      };

      vi.doMock(
        "@/features/video-conferencing/services/WebhookRoutingService",
        () => ({
          WebhookRoutingService: vi
            .fn()
            .mockImplementation(() => mockRoutingService),
        })
      );

      mockRequest = createZoomWebhookRequest(eventData);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Internal server error");
    });

    it("should handle timeout errors", async () => {
      const eventData = {
        event: "meeting.started",
        payload: { object: { id: "test-meeting" } },
      };

      // Mock routing service to timeout
      const mockRoutingService = {
        processWebhook: vi
          .fn()
          .mockImplementation(
            () =>
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Request timeout")), 100)
              )
          ),
      };

      vi.doMock(
        "@/features/video-conferencing/services/WebhookRoutingService",
        () => ({
          WebhookRoutingService: vi
            .fn()
            .mockImplementation(() => mockRoutingService),
        })
      );

      mockRequest = createZoomWebhookRequest(eventData);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it("should handle unsupported HTTP methods", async () => {
      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/webhooks/zoom",
        {
          method: "GET", // Unsupported method
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Method not allowed");
    });
  });

  describe("Security", () => {
    it("should reject requests with suspicious user agents", async () => {
      const eventData = {
        event: "meeting.started",
        payload: { object: { id: "test-meeting" } },
      };

      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/webhooks/zoom",
        {
          method: "POST",
          body: JSON.stringify(eventData),
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "malicious-bot/1.0",
            "x-zm-request-timestamp": Date.now().toString(),
            "x-zm-signature": "v0=invalid",
            authorization: process.env.ZOOM_WEBHOOK_TOKEN!,
          },
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should reject requests with invalid content types", async () => {
      const eventData = {
        event: "meeting.started",
        payload: { object: { id: "test-meeting" } },
      };

      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/webhooks/zoom",
        {
          method: "POST",
          body: JSON.stringify(eventData),
          headers: {
            "Content-Type": "text/plain", // Invalid content type
            "x-zm-request-timestamp": Date.now().toString(),
            "x-zm-signature": "v0=invalid",
            authorization: process.env.ZOOM_WEBHOOK_TOKEN!,
          },
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should handle requests with missing authorization", async () => {
      const eventData = {
        event: "meeting.started",
        payload: { object: { id: "test-meeting" } },
      };

      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/webhooks/zoom",
        {
          method: "POST",
          body: JSON.stringify(eventData),
          headers: {
            "Content-Type": "application/json",
            "x-zm-request-timestamp": Date.now().toString(),
            "x-zm-signature": "v0=invalid",
            // Missing authorization header
          },
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Unauthorized");
    });
  });

  describe("Performance", () => {
    it("should process webhooks within acceptable time limits", async () => {
      const eventData = {
        event: "meeting.started",
        payload: { object: { id: "performance-test-meeting" } },
      };

      mockRequest = createZoomWebhookRequest(eventData);
      const startTime = Date.now();

      const response = await POST(mockRequest);
      const processingTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(processingTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it("should handle concurrent webhook requests", async () => {
      const eventData = {
        event: "meeting.started",
        payload: { object: { id: "concurrent-test-meeting" } },
      };

      const promises = [];

      // Process 10 webhooks concurrently
      for (let i = 0; i < 10; i++) {
        const request = createZoomWebhookRequest({
          ...eventData,
          payload: { object: { id: `concurrent-meeting-${i}` } },
        });
        promises.push(POST(request));
      }

      const responses = await Promise.all(promises);

      // All should succeed
      expect(responses.every((r) => r.status === 200)).toBe(true);
    });
  });

  describe("Monitoring and Logging", () => {
    it("should log webhook processing attempts", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const eventData = {
        event: "meeting.started",
        payload: { object: { id: "logging-test-meeting" } },
      };

      mockRequest = createZoomWebhookRequest(eventData);
      await POST(mockRequest);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Webhook received")
      );

      consoleSpy.mockRestore();
    });

    it("should log processing failures", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/webhooks/zoom",
        {
          method: "POST",
          body: "invalid-json",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      await POST(mockRequest);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Webhook processing failed")
      );

      consoleSpy.mockRestore();
    });
  });

  // Helper functions
  function createZoomWebhookRequest(
    eventData: any,
    options: { invalidSignature?: boolean } = {}
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

    return new NextRequest(
      "http://localhost:3000/api/video-conferencing/webhooks/zoom",
      {
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
          "x-zm-request-timestamp": timestamp,
          "x-zm-signature": signature,
          authorization: process.env.ZOOM_WEBHOOK_TOKEN!,
          "user-agent": "Zoom-Webhook/1.0",
        },
      }
    );
  }

  function createGoogleMeetWebhookRequest(
    eventData: any,
    options: { invalidSignature?: boolean } = {}
  ) {
    const payload = JSON.stringify(eventData);

    let signature = "invalid-signature";
    if (!options.invalidSignature) {
      signature = crypto
        .createHmac("sha256", process.env.GOOGLE_WEBHOOK_SECRET!)
        .update(payload)
        .digest("base64");
    }

    return new NextRequest(
      "http://localhost:3000/api/video-conferencing/webhooks/google",
      {
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
          "x-goog-signature": signature,
          "user-agent": "Google-Webhook/1.0",
        },
      }
    );
  }

  function createVimeoWebhookRequest(
    eventData: any,
    options: { invalidSignature?: boolean } = {}
  ) {
    const payload = JSON.stringify(eventData);

    let signature = "invalid-signature";
    if (!options.invalidSignature) {
      signature = crypto
        .createHmac("sha256", process.env.VIMEO_WEBHOOK_SECRET!)
        .update(payload)
        .digest("hex");
    }

    return new NextRequest(
      "http://localhost:3000/api/video-conferencing/webhooks/vimeo",
      {
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
          "x-vimeo-signature": signature,
          "user-agent": "Vimeo-Webhook/1.0",
        },
      }
    );
  }
});
