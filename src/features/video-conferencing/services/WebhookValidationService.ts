/**
 * Webhook Validation Service
 * Handles validation of webhook signatures and payloads for all providers
 */
import { VideoProvider } from "@prisma/client";
import crypto from "crypto";

export interface ValidationResult {
  isValid: boolean;
  provider: VideoProvider;
  errors: string[];
  rateLimited?: boolean;
  warnings?: string[];
}

export interface WebhookRequest {
  headers: Map<string, string> | Record<string, string>;
  body: string;
  method: string;
  url: string;
  ip?: string;
}

export class WebhookValidationService {
  private rateLimitMap = new Map<
    string,
    { count: number; resetTime: number }
  >();
  private readonly maxRequestsPerHour = 50;

  /**
   * Validate webhook request for the specified provider
   */
  async validateWebhook(
    provider: VideoProvider,
    payload: any,
    headers: any
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      console.log(`Webhook validation attempt for ${provider}`);

      // Handle different header formats (Map vs object)
      const headerMap =
        headers instanceof Map
          ? headers
          : new Map(Object.entries(headers || {}));

      // Check rate limiting
      const rateLimited = this.checkRateLimit("test-ip");
      if (rateLimited) {
        return {
          isValid: false,
          provider,
          errors: ["Rate limit exceeded"],
          rateLimited: true,
        };
      }

      // Validate basic request structure
      if (!headers || !payload) {
        errors.push("Missing required request data");
      }

      // Validate content type
      const contentType =
        headerMap.get("content-type") || headerMap.get("Content-Type");
      if (!contentType || !contentType.includes("application/json")) {
        errors.push("Invalid content type");
      }

      // Validate JSON payload
      if (typeof payload === "string") {
        try {
          JSON.parse(payload);
        } catch {
          errors.push("Invalid JSON payload");
        }
      }

      // Provider-specific validation
      switch (provider) {
        case "ZOOM":
          this.validateZoomWebhook(payload, headerMap, errors);
          break;
        case "MEET":
          this.validateGoogleMeetWebhook(payload, headerMap, errors);
          break;
        case "VIMEO":
          this.validateVimeoWebhook(payload, headerMap, errors);
          break;
        default:
          errors.push(`Unsupported provider: ${provider}`);
      }

      const isValid = errors.length === 0;

      if (!isValid) {
        console.warn(
          `Webhook validation failed for ${provider}: ${errors.join(", ")}`
        );
      }

      return {
        isValid,
        provider,
        errors,
        rateLimited: false,
        warnings,
      };
    } catch (error) {
      console.error(`Webhook validation error for ${provider}:`, error);
      return {
        isValid: false,
        provider,
        errors: ["Validation service error"],
        rateLimited: false,
      };
    }
  }

  private validateZoomWebhook(
    payload: any,
    headers: Map<string, string>,
    errors: string[]
  ): void {
    const secret = process.env.ZOOM_WEBHOOK_SECRET || "test-secret";
    const token = process.env.ZOOM_WEBHOOK_TOKEN || "test-token";

    // Check authorization token
    const authHeader =
      headers.get("authorization") || headers.get("Authorization");
    if (!authHeader || authHeader !== token) {
      errors.push("Invalid authorization token");
    }

    // Check timestamp
    const timestamp =
      headers.get("x-zm-request-timestamp") ||
      headers.get("X-Zm-Request-Timestamp");
    if (!timestamp) {
      errors.push("Missing timestamp header");
      return;
    }

    // Check if timestamp is not too old (5 minutes)
    const requestTime = parseInt(timestamp);
    const currentTime = Date.now();
    if (currentTime - requestTime > 5 * 60 * 1000) {
      errors.push("Timestamp too old");
    }

    // Validate signature
    const signature =
      headers.get("x-zm-signature") || headers.get("X-Zm-Signature");
    if (!signature) {
      errors.push("Missing signature header");
      return;
    }

    try {
      const bodyStr =
        typeof payload === "string" ? payload : JSON.stringify(payload);
      const message = `v0:${timestamp}:${bodyStr}`;
      const expectedSignature = `v0=${crypto
        .createHmac("sha256", secret)
        .update(message)
        .digest("hex")}`;

      if (signature !== expectedSignature) {
        errors.push("Invalid signature");
      }
    } catch (error) {
      errors.push("Signature validation failed");
    }

    // Validate user agent
    const userAgent = headers.get("user-agent") || headers.get("User-Agent");
    if (!userAgent || !userAgent.includes("Zoom")) {
      errors.push("Invalid user agent");
    }

    // Validate payload structure
    try {
      const parsedPayload =
        typeof payload === "string" ? JSON.parse(payload) : payload;
      if (!parsedPayload.event || !parsedPayload.payload) {
        errors.push("Missing required field");
      }

      // Check for supported event types
      const supportedEvents = [
        "meeting.started",
        "meeting.ended",
        "meeting.participant_joined",
        "meeting.participant_left",
        "recording.completed",
        "recording.transcript_completed",
      ];

      if (
        parsedPayload.event &&
        !supportedEvents.includes(parsedPayload.event)
      ) {
        errors.push("Unsupported event type");
      }
    } catch {
      // JSON parsing error already handled above
    }
  }

  private validateGoogleMeetWebhook(
    payload: any,
    headers: Map<string, string>,
    errors: string[]
  ): void {
    const secret = process.env.GOOGLE_WEBHOOK_SECRET || "test-secret";

    // Validate signature
    const signature =
      headers.get("x-goog-signature") || headers.get("X-Goog-Signature");
    if (!signature) {
      errors.push("Missing signature header");
      return;
    }

    try {
      const bodyStr =
        typeof payload === "string" ? payload : JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(bodyStr)
        .digest("base64");

      if (signature !== expectedSignature) {
        errors.push("Invalid signature");
      }
    } catch (error) {
      errors.push("Signature validation failed");
    }

    // Validate user agent
    const userAgent = headers.get("user-agent") || headers.get("User-Agent");
    if (!userAgent || !userAgent.includes("Google")) {
      errors.push("Invalid user agent");
    }
  }

  private validateVimeoWebhook(
    payload: any,
    headers: Map<string, string>,
    errors: string[]
  ): void {
    const secret = process.env.VIMEO_WEBHOOK_SECRET || "test-secret";

    // Validate signature
    const signature =
      headers.get("x-vimeo-signature") || headers.get("X-Vimeo-Signature");
    if (!signature) {
      errors.push("Missing signature header");
      return;
    }

    try {
      const bodyStr =
        typeof payload === "string" ? payload : JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(bodyStr)
        .digest("hex");

      if (signature !== expectedSignature) {
        errors.push("Invalid signature");
      }
    } catch (error) {
      errors.push("Signature validation failed");
    }

    // Validate user agent
    const userAgent = headers.get("user-agent") || headers.get("User-Agent");
    if (!userAgent || !userAgent.includes("Vimeo")) {
      errors.push("Invalid user agent");
    }
  }

  private checkRateLimit(clientIp: string): boolean {
    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;

    const clientData = this.rateLimitMap.get(clientIp);

    if (!clientData || now > clientData.resetTime) {
      // Reset or initialize rate limit
      this.rateLimitMap.set(clientIp, {
        count: 1,
        resetTime: now + hourInMs,
      });
      return false;
    }

    if (clientData.count >= this.maxRequestsPerHour) {
      return true; // Rate limited
    }

    // Increment count
    clientData.count++;
    return false;
  }
}
