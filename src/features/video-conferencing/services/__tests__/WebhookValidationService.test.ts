/**
 * Tests for WebhookValidationService
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { WebhookValidationService } from "../WebhookValidationService";
import { VideoProvider } from "@prisma/client";
import crypto from "crypto";

describe("WebhookValidationService", () => {
  let validationService: WebhookValidationService;
  let mockRequest: any;

  beforeEach(() => {
    validationService = new WebhookValidationService();
    mockRequest = {
      headers: new Map(),
      body: JSON.stringify({ test: "data" }),
      method: "POST",
      url: "https://example.com/webhook",
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("validateZoomWebhook", () => {
    const zoomSecret = "test-zoom-secret";
    const zoomToken = "test-zoom-token";

    beforeEach(() => {
      process.env.ZOOM_WEBHOOK_SECRET = zoomSecret;
      process.env.ZOOM_WEBHOOK_TOKEN = zoomToken;
    });

    it("should validate Zoom webhook with correct signature", async () => {
      const timestamp = Date.now().toString();
      const payload = JSON.stringify({ event: "meeting.started" });

      // Create valid Zoom signature
      const message = `v0:${timestamp}:${payload}`;
      const signature = crypto
        .createHmac("sha256", zoomSecret)
        .update(message)
        .digest("hex");

      mockRequest.headers.set("x-zm-request-timestamp", timestamp);
      mockRequest.headers.set("x-zm-signature", `v0=${signature}`);
      mockRequest.headers.set("authorization", zoomToken);
      mockRequest.body = payload;

      const result = await validationService.validateWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.isValid).toBe(true);
      expect(result.provider).toBe("ZOOM");
      expect(result.errors).toHaveLength(0);
    });

    it("should reject Zoom webhook with invalid signature", async () => {
      const timestamp = Date.now().toString();
      const payload = JSON.stringify({ event: "meeting.started" });

      mockRequest.headers.set("x-zm-request-timestamp", timestamp);
      mockRequest.headers.set("x-zm-signature", "v0=invalid-signature");
      mockRequest.headers.set("authorization", zoomToken);
      mockRequest.body = payload;

      const result = await validationService.validateWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid signature");
    });

    it("should reject Zoom webhook with missing timestamp", async () => {
      const payload = JSON.stringify({ event: "meeting.started" });

      mockRequest.headers.set("x-zm-signature", "v0=some-signature");
      mockRequest.headers.set("authorization", zoomToken);
      mockRequest.body = payload;

      const result = await validationService.validateWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing timestamp header");
    });

    it("should reject Zoom webhook with expired timestamp", async () => {
      const expiredTimestamp = (Date.now() - 6 * 60 * 1000).toString(); // 6 minutes ago
      const payload = JSON.stringify({ event: "meeting.started" });

      const message = `v0:${expiredTimestamp}:${payload}`;
      const signature = crypto
        .createHmac("sha256", zoomSecret)
        .update(message)
        .digest("hex");

      mockRequest.headers.set("x-zm-request-timestamp", expiredTimestamp);
      mockRequest.headers.set("x-zm-signature", `v0=${signature}`);
      mockRequest.headers.set("authorization", zoomToken);
      mockRequest.body = payload;

      const result = await validationService.validateWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Request timestamp too old");
    });

    it("should reject Zoom webhook with invalid authorization token", async () => {
      const timestamp = Date.now().toString();
      const payload = JSON.stringify({ event: "meeting.started" });

      const message = `v0:${timestamp}:${payload}`;
      const signature = crypto
        .createHmac("sha256", zoomSecret)
        .update(message)
        .digest("hex");

      mockRequest.headers.set("x-zm-request-timestamp", timestamp);
      mockRequest.headers.set("x-zm-signature", `v0=${signature}`);
      mockRequest.headers.set("authorization", "invalid-token");
      mockRequest.body = payload;

      const result = await validationService.validateWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid authorization token");
    });
  });

  describe("validateGoogleMeetWebhook", () => {
    const googleSecret = "test-google-secret";

    beforeEach(() => {
      process.env.GOOGLE_WEBHOOK_SECRET = googleSecret;
    });

    it("should validate Google Meet webhook with correct signature", async () => {
      const payload = JSON.stringify({ eventType: "conferenceRecord.started" });

      // Create valid Google signature
      const signature = crypto
        .createHmac("sha256", googleSecret)
        .update(payload)
        .digest("base64");

      mockRequest.headers.set("x-goog-signature", signature);
      mockRequest.headers.set("content-type", "application/json");
      mockRequest.body = payload;

      const result = await validationService.validateWebhook(
        "MEET" as VideoProvider,
        mockRequest
      );

      expect(result.isValid).toBe(true);
      expect(result.provider).toBe("MEET");
      expect(result.errors).toHaveLength(0);
    });

    it("should reject Google Meet webhook with invalid signature", async () => {
      const payload = JSON.stringify({ eventType: "conferenceRecord.started" });

      mockRequest.headers.set("x-goog-signature", "invalid-signature");
      mockRequest.headers.set("content-type", "application/json");
      mockRequest.body = payload;

      const result = await validationService.validateWebhook(
        "MEET" as VideoProvider,
        mockRequest
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid signature");
    });

    it("should reject Google Meet webhook with missing signature", async () => {
      const payload = JSON.stringify({ eventType: "conferenceRecord.started" });

      mockRequest.headers.set("content-type", "application/json");
      mockRequest.body = payload;

      const result = await validationService.validateWebhook(
        "MEET" as VideoProvider,
        mockRequest
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing signature header");
    });
  });

  describe("validateVimeoWebhook", () => {
    const vimeoSecret = "test-vimeo-secret";

    beforeEach(() => {
      process.env.VIMEO_WEBHOOK_SECRET = vimeoSecret;
    });

    it("should validate Vimeo webhook with correct signature", async () => {
      const payload = JSON.stringify({ trigger: "video.upload" });

      // Create valid Vimeo signature
      const signature = crypto
        .createHmac("sha256", vimeoSecret)
        .update(payload)
        .digest("hex");

      mockRequest.headers.set("x-vimeo-signature", signature);
      mockRequest.headers.set("content-type", "application/json");
      mockRequest.body = payload;

      const result = await validationService.validateWebhook(
        "VIMEO" as VideoProvider,
        mockRequest
      );

      expect(result.isValid).toBe(true);
      expect(result.provider).toBe("VIMEO");
      expect(result.errors).toHaveLength(0);
    });

    it("should reject Vimeo webhook with invalid signature", async () => {
      const payload = JSON.stringify({ trigger: "video.upload" });

      mockRequest.headers.set("x-vimeo-signature", "invalid-signature");
      mockRequest.headers.set("content-type", "application/json");
      mockRequest.body = payload;

      const result = await validationService.validateWebhook(
        "VIMEO" as VideoProvider,
        mockRequest
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid signature");
    });
  });

  describe("rate limiting", () => {
    it("should track and enforce rate limits", async () => {
      const clientIp = "192.168.1.1";
      mockRequest.ip = clientIp;

      // Mock multiple requests from same IP
      for (let i = 0; i < 100; i++) {
        const result = await validationService.validateWebhook(
          "ZOOM" as VideoProvider,
          mockRequest
        );

        if (i < 50) {
          // Should allow first 50 requests
          expect(result.rateLimited).toBe(false);
        } else {
          // Should rate limit after 50 requests
          expect(result.rateLimited).toBe(true);
          break;
        }
      }
    });

    it("should reset rate limits after time window", async () => {
      const clientIp = "192.168.1.2";
      mockRequest.ip = clientIp;

      // Mock time passing
      vi.useFakeTimers();

      // Make requests to hit rate limit
      for (let i = 0; i < 51; i++) {
        await validationService.validateWebhook(
          "ZOOM" as VideoProvider,
          mockRequest
        );
      }

      // Advance time by 1 hour
      vi.advanceTimersByTime(60 * 60 * 1000);

      // Should allow requests again
      const result = await validationService.validateWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );
      expect(result.rateLimited).toBe(false);

      vi.useRealTimers();
    });
  });

  describe("payload validation", () => {
    it("should validate JSON payload structure", async () => {
      mockRequest.body = "invalid-json";

      const result = await validationService.validateWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid JSON payload");
    });

    it("should validate required fields for Zoom events", async () => {
      const payload = JSON.stringify({
        // Missing required fields like event, payload
      });

      mockRequest.body = payload;

      const result = await validationService.validateWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((error) => error.includes("Missing required field"))
      ).toBe(true);
    });

    it("should validate event types", async () => {
      const payload = JSON.stringify({
        event: "invalid.event.type",
        payload: {},
      });

      mockRequest.body = payload;

      const result = await validationService.validateWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Unsupported event type");
    });
  });

  describe("security headers", () => {
    it("should validate user agent", async () => {
      mockRequest.headers.set("user-agent", "malicious-bot");

      const result = await validationService.validateWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid user agent");
    });

    it("should validate content type", async () => {
      mockRequest.headers.set("content-type", "text/plain");

      const result = await validationService.validateWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid content type");
    });
  });

  describe("error handling", () => {
    it("should handle missing environment variables gracefully", async () => {
      delete process.env.ZOOM_WEBHOOK_SECRET;

      const result = await validationService.validateWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Webhook secret not configured");
    });

    it("should handle malformed headers gracefully", async () => {
      mockRequest.headers = null;

      const result = await validationService.validateWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle crypto errors gracefully", async () => {
      // Mock crypto to throw error
      vi.spyOn(crypto, "createHmac").mockImplementation(() => {
        throw new Error("Crypto error");
      });

      const result = await validationService.validateWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Signature validation failed");
    });
  });

  describe("logging and monitoring", () => {
    it("should log validation attempts", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await validationService.validateWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Webhook validation attempt")
      );

      consoleSpy.mockRestore();
    });

    it("should log validation failures", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      mockRequest.body = "invalid-json";
      await validationService.validateWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Webhook validation failed")
      );

      consoleSpy.mockRestore();
    });
  });

  describe("performance", () => {
    it("should validate webhooks within acceptable time limits", async () => {
      const startTime = Date.now();

      await validationService.validateWebhook(
        "ZOOM" as VideoProvider,
        mockRequest
      );

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });

    it("should handle concurrent validations", async () => {
      const promises = [];

      for (let i = 0; i < 10; i++) {
        const request = { ...mockRequest, id: i };
        promises.push(
          validationService.validateWebhook("ZOOM" as VideoProvider, request)
        );
      }

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(result).toBeDefined();
      });
    });
  });
});
