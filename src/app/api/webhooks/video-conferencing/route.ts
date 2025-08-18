/**
 * Video Conferencing Webhooks API Endpoint
 * POST /api/webhooks/video-conferencing
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  WebhookValidationService,
  WebhookHeaders,
} from "@/features/video-conferencing/services/WebhookValidationService";
import {
  WebhookRoutingService,
  WebhookEvent,
} from "@/features/video-conferencing/services/WebhookRoutingService";
import { VideoProvider } from "@prisma/client";

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP
const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB

// Initialize services
const validationService = new WebhookValidationService();
const routingService = new WebhookRoutingService();

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get client IP for rate limiting
    const headersList = headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const clientIp = forwardedFor?.split(",")[0] || realIp || "unknown";

    // Apply rate limiting
    const rateLimitResult = checkRateLimit(clientIp);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.resetTime - Date.now()) / 1000
            ).toString(),
            "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
            "X-RateLimit-Remaining": Math.max(
              0,
              RATE_LIMIT_MAX_REQUESTS - rateLimitResult.count
            ).toString(),
            "X-RateLimit-Reset": Math.ceil(
              rateLimitResult.resetTime / 1000
            ).toString(),
          },
        }
      );
    }

    // Check content length
    const contentLength = parseInt(
      headersList.get("content-length") || "0",
      10
    );
    if (contentLength > MAX_PAYLOAD_SIZE) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    // Get request body
    const rawBody = await request.arrayBuffer();
    const bodyBuffer = Buffer.from(rawBody);
    const payload = bodyBuffer.toString("utf8");

    // Validate payload is not empty
    if (!payload.trim()) {
      return NextResponse.json({ error: "Empty payload" }, { status: 400 });
    }

    // Extract headers for webhook validation
    const webhookHeaders: WebhookHeaders = {
      "x-zoom-signature": headersList.get("x-zoom-signature") || undefined,
      "x-zoom-timestamp": headersList.get("x-zoom-timestamp") || undefined,
      "x-goog-signature": headersList.get("x-goog-signature") || undefined,
      "x-goog-timestamp": headersList.get("x-goog-timestamp") || undefined,
      "x-vimeo-signature": headersList.get("x-vimeo-signature") || undefined,
      "x-vimeo-timestamp": headersList.get("x-vimeo-timestamp") || undefined,
      "user-agent": headersList.get("user-agent") || undefined,
      "content-type": headersList.get("content-type") || undefined,
    };

    // Validate webhook signature
    const validationResult = await validationService.validateWebhook(
      payload,
      webhookHeaders,
      bodyBuffer
    );

    if (!validationResult.isValid) {
      console.warn("Webhook validation failed:", {
        error: validationResult.error,
        provider: validationResult.provider,
        clientIp,
        userAgent: webhookHeaders["user-agent"],
      });

      return NextResponse.json(
        {
          error: "Webhook validation failed",
          details: validationResult.error,
        },
        { status: 401 }
      );
    }

    // Extract event information
    const eventInfo = validationService.extractEventInfo(
      payload,
      validationResult.provider!
    );

    // Create webhook event
    const webhookEvent: WebhookEvent = {
      id: generateEventId(),
      provider: validationResult.provider!,
      eventType: validationResult.eventType || eventInfo.eventType || "unknown",
      meetingId: eventInfo.meetingId,
      userId: eventInfo.userId,
      timestamp: eventInfo.timestamp || new Date(),
      payload: eventInfo.data || JSON.parse(payload),
      processed: false,
      retryCount: 0,
    };

    // Log webhook received
    console.log("Webhook received:", {
      id: webhookEvent.id,
      provider: webhookEvent.provider,
      eventType: webhookEvent.eventType,
      meetingId: webhookEvent.meetingId,
      clientIp,
    });

    // Queue event for processing
    await routingService.queueEvent(webhookEvent);

    // Return success response
    const processingTime = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        eventId: webhookEvent.id,
        provider: webhookEvent.provider,
        eventType: webhookEvent.eventType,
        processingTime,
      },
      {
        status: 200,
        headers: {
          "X-Event-ID": webhookEvent.id,
          "X-Processing-Time": processingTime.toString(),
        },
      }
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;

    console.error("Webhook processing error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      processingTime,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to process webhook",
      },
      {
        status: 500,
        headers: {
          "X-Processing-Time": processingTime.toString(),
        },
      }
    );
  }
}

// Handle webhook verification challenges (for some providers)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Zoom webhook verification
  const challenge = searchParams.get("challenge");
  if (challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  // Return webhook endpoint information
  return NextResponse.json({
    endpoint: "/api/webhooks/video-conferencing",
    methods: ["POST"],
    supportedProviders: validationService.getSupportedProviders(),
    rateLimit: {
      maxRequests: RATE_LIMIT_MAX_REQUESTS,
      windowMs: RATE_LIMIT_WINDOW,
    },
    maxPayloadSize: MAX_PAYLOAD_SIZE,
    status: "active",
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, X-Zoom-Signature, X-Zoom-Timestamp, X-Goog-Signature, X-Goog-Timestamp, X-Vimeo-Signature, X-Vimeo-Timestamp",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// Rate limiting implementation
function checkRateLimit(clientIp: string): {
  allowed: boolean;
  count: number;
  resetTime: number;
} {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Clean up expired entries
  for (const [ip, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(ip);
    }
  }

  // Get or create rate limit data for this IP
  let rateLimitData = rateLimitStore.get(clientIp);

  if (!rateLimitData || rateLimitData.resetTime < now) {
    rateLimitData = {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }

  rateLimitData.count++;
  rateLimitStore.set(clientIp, rateLimitData);

  return {
    allowed: rateLimitData.count <= RATE_LIMIT_MAX_REQUESTS,
    count: rateLimitData.count,
    resetTime: rateLimitData.resetTime,
  };
}

// Generate unique event ID
function generateEventId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `wh_${timestamp}_${random}`;
}

// Health check endpoint
export async function HEAD(request: NextRequest) {
  const queueStatus = routingService.getQueueStatus();

  return new NextResponse(null, {
    status: 200,
    headers: {
      "X-Queue-Length": queueStatus.queueLength.toString(),
      "X-Processing": queueStatus.processing.toString(),
      "X-Handlers": queueStatus.handlers.toString(),
      "X-Rules": queueStatus.rules.toString(),
    },
  });
}
