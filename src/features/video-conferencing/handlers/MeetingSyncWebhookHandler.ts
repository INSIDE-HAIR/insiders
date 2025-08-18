/**
 * Meeting Sync Webhook Handler
 * Handles webhook events for meeting data synchronization
 */

import {
  WebhookHandler,
  WebhookEvent,
  WebhookHandlerResult,
} from "../services/WebhookRoutingService";
import {
  MeetingDataSyncService,
  SyncOptions,
} from "../services/MeetingDataSyncService";

export class MeetingSyncWebhookHandler implements WebhookHandler {
  public readonly eventTypes = [
    "meeting.started",
    "meeting.ended",
    "meeting.created",
    "meeting.finished",
    "meeting.participant_joined",
    "meeting.participant_left",
    "participant.joined",
    "participant.left",
  ];

  public readonly priority = 200; // High priority for data sync

  private syncService: MeetingDataSyncService;

  constructor(syncService?: MeetingDataSyncService) {
    this.syncService = syncService || new MeetingDataSyncService();
  }

  async handle(event: WebhookEvent): Promise<WebhookHandlerResult> {
    try {
      console.log(`Processing meeting sync for event: ${event.eventType}`, {
        eventId: event.id,
        provider: event.provider,
        meetingId: event.meetingId,
      });

      // Determine sync options based on event type
      const syncOptions: SyncOptions = this.getSyncOptions(event);

      // Perform synchronization
      const syncResult = await this.syncService.syncFromWebhook(
        event,
        syncOptions
      );

      if (!syncResult.success) {
        console.error(
          `Meeting sync failed for event ${event.id}:`,
          syncResult.error
        );
        return {
          success: false,
          error: syncResult.error,
          shouldRetry: true,
        };
      }

      // Log successful sync
      console.log(`Meeting sync completed for event ${event.id}:`, {
        meetingId: syncResult.meetingId,
        participantIds: syncResult.participantIds,
        recordingProcessed: syncResult.recordingProcessed,
        transcriptionProcessed: syncResult.transcriptionProcessed,
        warnings: syncResult.warnings,
      });

      return {
        success: true,
        data: {
          syncResult,
          eventType: event.eventType,
          provider: event.provider,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown sync error";
      console.error(
        `Meeting sync handler error for event ${event.id}:`,
        errorMessage
      );

      return {
        success: false,
        error: errorMessage,
        shouldRetry: true,
      };
    }
  }

  /**
   * Get sync options based on event type
   */
  private getSyncOptions(event: WebhookEvent): SyncOptions {
    const baseOptions: SyncOptions = {
      includeParticipants: true,
      includeRecordings: false,
      includeTranscriptions: false,
      batchSize: 50,
    };

    switch (event.eventType) {
      case "meeting.started":
      case "meeting.created":
        return {
          ...baseOptions,
          forceUpdate: false,
        };

      case "meeting.ended":
      case "meeting.finished":
        return {
          ...baseOptions,
          forceUpdate: true,
          includeRecordings: true,
          includeTranscriptions: true,
        };

      case "meeting.participant_joined":
      case "participant.joined":
        return {
          ...baseOptions,
          includeParticipants: true,
        };

      case "meeting.participant_left":
      case "participant.left":
        return {
          ...baseOptions,
          includeParticipants: true,
        };

      default:
        return baseOptions;
    }
  }

  /**
   * Get handler statistics
   */
  getStats(): {
    eventTypes: string[];
    priority: number;
    syncStats: any;
  } {
    return {
      eventTypes: this.eventTypes,
      priority: this.priority,
      syncStats: this.syncService.getSyncStats(),
    };
  }

  /**
   * Update sync service configuration
   */
  updateSyncService(syncService: MeetingDataSyncService): void {
    this.syncService = syncService;
  }
}

export class RecordingSyncWebhookHandler implements WebhookHandler {
  public readonly eventTypes = [
    "recording.completed",
    "recording.ready",
    "recording.transcript_completed",
    "transcription.completed",
  ];

  public readonly priority = 150; // Medium-high priority

  private syncService: MeetingDataSyncService;

  constructor(syncService?: MeetingDataSyncService) {
    this.syncService = syncService || new MeetingDataSyncService();
  }

  async handle(event: WebhookEvent): Promise<WebhookHandlerResult> {
    try {
      console.log(`Processing recording sync for event: ${event.eventType}`, {
        eventId: event.id,
        provider: event.provider,
        meetingId: event.meetingId,
      });

      const syncOptions: SyncOptions = {
        includeRecordings: true,
        includeTranscriptions: true,
        forceUpdate: true,
      };

      const syncResult = await this.syncService.syncFromWebhook(
        event,
        syncOptions
      );

      if (!syncResult.success) {
        console.error(
          `Recording sync failed for event ${event.id}:`,
          syncResult.error
        );
        return {
          success: false,
          error: syncResult.error,
          shouldRetry: true,
        };
      }

      console.log(`Recording sync completed for event ${event.id}:`, {
        meetingId: syncResult.meetingId,
        recordingProcessed: syncResult.recordingProcessed,
        transcriptionProcessed: syncResult.transcriptionProcessed,
      });

      return {
        success: true,
        data: {
          syncResult,
          eventType: event.eventType,
          provider: event.provider,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown recording sync error";
      console.error(
        `Recording sync handler error for event ${event.id}:`,
        errorMessage
      );

      return {
        success: false,
        error: errorMessage,
        shouldRetry: true,
      };
    }
  }
}

export class ParticipantSyncWebhookHandler implements WebhookHandler {
  public readonly eventTypes = [
    "meeting.participant_joined",
    "meeting.participant_left",
    "participant.joined",
    "participant.left",
    "participant.updated",
  ];

  public readonly priority = 180; // High priority for real-time participant updates

  private syncService: MeetingDataSyncService;

  constructor(syncService?: MeetingDataSyncService) {
    this.syncService = syncService || new MeetingDataSyncService();
  }

  async handle(event: WebhookEvent): Promise<WebhookHandlerResult> {
    try {
      console.log(`Processing participant sync for event: ${event.eventType}`, {
        eventId: event.id,
        provider: event.provider,
        meetingId: event.meetingId,
      });

      const syncOptions: SyncOptions = {
        includeParticipants: true,
        forceUpdate: true,
        batchSize: 1, // Process participants individually for real-time updates
      };

      const syncResult = await this.syncService.syncFromWebhook(
        event,
        syncOptions
      );

      if (!syncResult.success) {
        console.error(
          `Participant sync failed for event ${event.id}:`,
          syncResult.error
        );
        return {
          success: false,
          error: syncResult.error,
          shouldRetry: true,
        };
      }

      console.log(`Participant sync completed for event ${event.id}:`, {
        meetingId: syncResult.meetingId,
        participantIds: syncResult.participantIds,
      });

      return {
        success: true,
        data: {
          syncResult,
          eventType: event.eventType,
          provider: event.provider,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown participant sync error";
      console.error(
        `Participant sync handler error for event ${event.id}:`,
        errorMessage
      );

      return {
        success: false,
        error: errorMessage,
        shouldRetry: true,
      };
    }
  }
}

/**
 * Factory function to create and register all sync handlers
 */
export function createSyncHandlers(syncService?: MeetingDataSyncService): {
  meetingSync: MeetingSyncWebhookHandler;
  recordingSync: RecordingSyncWebhookHandler;
  participantSync: ParticipantSyncWebhookHandler;
} {
  const sharedSyncService = syncService || new MeetingDataSyncService();

  return {
    meetingSync: new MeetingSyncWebhookHandler(sharedSyncService),
    recordingSync: new RecordingSyncWebhookHandler(sharedSyncService),
    participantSync: new ParticipantSyncWebhookHandler(sharedSyncService),
  };
}

/**
 * Register sync handlers with routing service
 */
export function registerSyncHandlers(
  routingService: any,
  syncService?: MeetingDataSyncService
): void {
  const handlers = createSyncHandlers(syncService);

  // Register handlers
  routingService.registerHandler("meetingSync", handlers.meetingSync);
  routingService.registerHandler("recordingSync", handlers.recordingSync);
  routingService.registerHandler("participantSync", handlers.participantSync);

  // Add routing rules for sync handlers
  routingService.addRoutingRule({
    id: "meeting-sync-zoom",
    provider: "ZOOM",
    eventType: "meeting.*",
    handlerName: "meetingSync",
    enabled: true,
    priority: 200,
  });

  routingService.addRoutingRule({
    id: "meeting-sync-meet",
    provider: "MEET",
    eventType: "meeting.*",
    handlerName: "meetingSync",
    enabled: true,
    priority: 200,
  });

  routingService.addRoutingRule({
    id: "meeting-sync-vimeo",
    provider: "VIMEO",
    eventType: "meeting.*",
    handlerName: "meetingSync",
    enabled: true,
    priority: 200,
  });

  routingService.addRoutingRule({
    id: "recording-sync-all",
    eventType: "recording.*",
    handlerName: "recordingSync",
    enabled: true,
    priority: 150,
  });

  routingService.addRoutingRule({
    id: "transcription-sync-all",
    eventType: "transcription.*",
    handlerName: "recordingSync",
    enabled: true,
    priority: 150,
  });

  routingService.addRoutingRule({
    id: "participant-sync-all",
    eventType: "participant.*",
    handlerName: "participantSync",
    enabled: true,
    priority: 180,
  });

  console.log("Sync handlers registered successfully");
}
