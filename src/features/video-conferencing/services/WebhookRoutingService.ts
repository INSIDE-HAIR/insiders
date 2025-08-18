/**
 * Webhook routing and processing service
 */
import { VideoProvider } from "@prisma/client";
import { WebhookValidationService } from "./WebhookValidationService";
import { MeetingDataSyncService } from "./MeetingDataSyncService";

export interface WebhookEvent {
  id: string;
  provider: VideoProvider;
  eventType: string;
  meetingId: string;
  userId?: string;
  timestamp: Date;
  payload: Record<string, any>;
  processed: boolean;
  retryCount: number;
}

export interface WebhookRequest {
  body: any;
  headers: Record<string, string>;
  method: string;
  url: string;
}

export interface WebhookValidationResult {
  isValid: boolean;
  provider: VideoProvider;
  eventType: string;
  payload: Record<string, any>;
  headers: Record<string, string>;
  errors: string[];
  warnings: string[];
  rateLimited?: boolean;
}

export interface ProcessingMetrics {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  averageProcessingTime: number;
  lastProcessedAt?: Date;
}

export class WebhookRoutingService {
  public validationService: WebhookValidationService;
  public syncService: MeetingDataSyncService;
  private metrics: ProcessingMetrics = {
    totalProcessed: 0,
    successCount: 0,
    errorCount: 0,
    averageProcessingTime: 0,
  };

  constructor() {
    this.validationService = new WebhookValidationService();
    this.syncService = new MeetingDataSyncService();
  }

  /**
   * Process webhook request
   */
  async processWebhook(
    provider: VideoProvider,
    request: WebhookRequest
  ): Promise<{
    success: boolean;
    event?: WebhookEvent;
    error?: string;
    eventId?: string;
    provider?: VideoProvider;
    processed?: boolean;
    eventType?: string;
    meetingId?: string;
    transformed?: boolean;
    retryCount?: number;
    rateLimited?: boolean;
    validationErrors?: string[];
    warnings?: string[];
  }> {
    const startTime = Date.now();
    try {
      console.log(`Processing webhook for provider: ${provider}`);

      // Handle malformed JSON
      let parsedBody;
      try {
        parsedBody =
          typeof request.body === "string"
            ? JSON.parse(request.body)
            : request.body;
      } catch (error) {
        this.metrics.errorCount++;
        this.updateMetrics(startTime);
        return {
          success: false,
          error: `Invalid JSON payload: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }

      // Validate webhook
      const validationResult = await this.validationService.validateWebhook(
        provider,
        parsedBody,
        request.headers
      );

      if (!validationResult.isValid) {
        this.metrics.errorCount++;
        this.updateMetrics(startTime);
        return {
          success: false,
          error: `Validation failed: ${validationResult.errors.join(", ")}`,
          rateLimited: validationResult.rateLimited,
          validationErrors: validationResult.errors,
          warnings: validationResult.warnings,
        };
      }

      // Route webhook to create event
      const event = await this.routeWebhook(validationResult);

      // Process through sync service
      if (
        this.syncService &&
        typeof this.syncService.syncFromWebhook === "function"
      ) {
        await this.syncService.syncFromWebhook(event, {
          includeParticipants: true,
          includeRecordings: true,
        });
      }

      this.metrics.successCount++;
      this.updateMetrics(startTime);

      return {
        success: true,
        event,
        eventId: event.id,
        provider: event.provider,
        processed: event.processed,
        eventType: event.eventType,
        meetingId: event.meetingId,
        transformed: true,
        retryCount: event.retryCount,
        rateLimited: false,
        validationErrors: [],
        warnings: validationResult.warnings,
      };
    } catch (error) {
      console.error("Error processing webhook:", error);
      this.metrics.errorCount++;
      this.updateMetrics(startTime);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Route validated webhook to create event
   */
  async routeWebhook(
    validationResult: WebhookValidationResult
  ): Promise<WebhookEvent> {
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Extract meeting ID and user ID from payload based on provider
    const { meetingId, userId } = this.extractIdentifiers(
      validationResult.provider,
      validationResult.payload
    );

    // Normalize event type
    const normalizedEventType = this.normalizeEventType(
      validationResult.provider,
      validationResult.eventType
    );

    const event: WebhookEvent = {
      id: eventId,
      provider: validationResult.provider,
      eventType: normalizedEventType,
      meetingId: meetingId || "",
      userId,
      timestamp: new Date(),
      payload: validationResult.payload,
      processed: false,
      retryCount: 0,
    };

    console.log(
      `Routed webhook event: ${event.eventType} for meeting ${event.meetingId}`
    );
    return event;
  }

  /**
   * Get processing metrics
   */
  getProcessingMetrics(): ProcessingMetrics {
    return { ...this.metrics };
  }

  /**
   * Extract meeting ID and user ID from payload
   */
  private extractIdentifiers(
    provider: VideoProvider,
    payload: any
  ): {
    meetingId?: string;
    userId?: string;
  } {
    switch (provider) {
      case "ZOOM":
        return {
          meetingId: payload.object?.uuid || payload.object?.id?.toString(),
          userId: payload.object?.participant?.user_id,
        };
      case "MEET":
        return {
          meetingId: payload.eventData?.meetingId,
          userId: payload.eventData?.participant?.id,
        };
      case "VIMEO":
        return {
          meetingId: payload.data?.meeting?.id,
          userId: payload.data?.participant?.id,
        };
      default:
        return {};
    }
  }

  /**
   * Normalize event types across providers
   */
  private normalizeEventType(
    provider: VideoProvider,
    eventType: string
  ): string {
    const eventMappings: Record<VideoProvider, Record<string, string>> = {
      ZOOM: {
        "meeting.started": "meeting.started",
        "meeting.ended": "meeting.ended",
        "meeting.participant_joined": "meeting.participant_joined",
        "meeting.participant_left": "meeting.participant_left",
        "recording.completed": "recording.completed",
      },
      MEET: {
        "meeting.started": "meeting.started",
        "meeting.ended": "meeting.ended",
        "participant.joined": "meeting.participant_joined",
        "participant.left": "meeting.participant_left",
        "recording.completed": "recording.completed",
      },
      VIMEO: {
        "meeting.started": "meeting.started",
        "meeting.ended": "meeting.ended",
        "participant.joined": "meeting.participant_joined",
        "participant.left": "meeting.participant_left",
        "recording.completed": "recording.completed",
      },
    };

    return eventMappings[provider]?.[eventType] || eventType;
  }

  /**
   * Update processing metrics
   */
  private updateMetrics(startTime: number): void {
    const processingTime = Date.now() - startTime;
    this.metrics.totalProcessed++;
    this.metrics.lastProcessedAt = new Date();

    // Update average processing time
    this.metrics.averageProcessingTime =
      (this.metrics.averageProcessingTime * (this.metrics.totalProcessed - 1) +
        processingTime) /
      this.metrics.totalProcessed;
  }
}
