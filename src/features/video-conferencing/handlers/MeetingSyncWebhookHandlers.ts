/**
 * Meeting Synchronization Webhook Handlers
 * Handlers that integrate with the webhook routing system to sync meeting data
 */

import {
  WebhookHandler,
  WebhookEvent,
  WebhookHandlerResult,
} from "../services/WebhookRoutingService";
import { MeetingDataSyncService } from "../services/MeetingDataSyncService";

export class MeetingSyncWebhookHandlers {
  private syncService: MeetingDataSyncService;

  constructor() {
    this.syncService = new MeetingDataSyncService();
  }

  /**
   * Get all meeting sync handlers
   */
  getAllHandlers(): Record<string, WebhookHandler> {
    return {
      meetingLifecycleSync: this.getMeetingLifecycleHandler(),
      participantSync: this.getParticipantHandler(),
      recordingSync: this.getRecordingHandler(),
      transcriptionSync: this.getTranscriptionHandler(),
    };
  }

  /**
   * Meeting lifecycle handler (started, ended, etc.)
   */
  private getMeetingLifecycleHandler(): WebhookHandler {
    return {
      eventTypes: [
        "meeting.started",
        "meeting.ended",
        "meeting.created",
        "meeting.updated",
        "meeting.cancelled",
        "conference.started",
        "conference.ended",
        "video.upload",
        "video.available",
      ],
      priority: 200,
      handle: async (event: WebhookEvent): Promise<WebhookHandlerResult> => {
        try {
          console.log(
            `Processing meeting lifecycle event: ${event.eventType} for ${event.provider}`
          );

          const syncResult = await this.syncService.syncMeetingFromWebhook(
            event.provider,
            event.eventType,
            event.payload
          );

          if (!syncResult.success) {
            return {
              success: false,
              error: syncResult.error,
              shouldRetry: true,
            };
          }

          return {
            success: true,
            data: {
              operation: syncResult.operation,
              recordId: syncResult.recordId,
              changes: syncResult.changes,
              eventType: event.eventType,
              provider: event.provider,
            },
          };
        } catch (error) {
          console.error("Meeting lifecycle sync error:", error);

          return {
            success: false,
            error:
              error instanceof Error ? error.message : "Meeting sync failed",
            shouldRetry: true,
          };
        }
      },
    };
  }

  /**
   * Participant events handler (joined, left, etc.)
   */
  private getParticipantHandler(): WebhookHandler {
    return {
      eventTypes: [
        "meeting.participant_joined",
        "meeting.participant_left",
        "participant.joined",
        "participant.left",
        "conference.participant_joined",
        "conference.participant_left",
      ],
      priority: 180,
      handle: async (event: WebhookEvent): Promise<WebhookHandlerResult> => {
        try {
          console.log(
            `Processing participant event: ${event.eventType} for ${event.provider}`
          );

          // Extract meeting ID from event
          const meetingId = this.extractMeetingIdFromEvent(event);

          if (!meetingId) {
            return {
              success: false,
              error: "Unable to extract meeting ID from participant event",
            };
          }

          const syncResult = await this.syncService.syncParticipantFromWebhook(
            meetingId,
            event.provider,
            event.eventType,
            event.payload
          );

          if (!syncResult.success) {
            return {
              success: false,
              error: syncResult.error,
              shouldRetry: true,
            };
          }

          return {
            success: true,
            data: {
              operation: syncResult.operation,
              recordId: syncResult.recordId,
              changes: syncResult.changes,
              meetingId,
              eventType: event.eventType,
              provider: event.provider,
            },
          };
        } catch (error) {
          console.error("Participant sync error:", error);

          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Participant sync failed",
            shouldRetry: true,
          };
        }
      },
    };
  }

  /**
   * Recording events handler
   */
  private getRecordingHandler(): WebhookHandler {
    return {
      eventTypes: [
        "recording.completed",
        "recording.available",
        "recording.ready",
        "video.upload",
        "video.available",
      ],
      priority: 160,
      handle: async (event: WebhookEvent): Promise<WebhookHandlerResult> => {
        try {
          console.log(
            `Processing recording event: ${event.eventType} for ${event.provider}`
          );

          // Extract meeting ID and recording data
          const meetingId = this.extractMeetingIdFromEvent(event);
          const recordingData = this.extractRecordingData(event);

          if (!meetingId) {
            return {
              success: false,
              error: "Unable to extract meeting ID from recording event",
            };
          }

          if (!recordingData) {
            return {
              success: false,
              error: "Unable to extract recording data from event",
            };
          }

          const syncResult = await this.syncService.processRecordingFiles(
            meetingId,
            event.provider,
            recordingData
          );

          if (!syncResult.success) {
            return {
              success: false,
              error: syncResult.error,
              shouldRetry: true,
            };
          }

          return {
            success: true,
            data: {
              operation: syncResult.operation,
              recordId: syncResult.recordId,
              changes: syncResult.changes,
              meetingId,
              recordingData,
              eventType: event.eventType,
              provider: event.provider,
            },
          };
        } catch (error) {
          console.error("Recording sync error:", error);

          return {
            success: false,
            error:
              error instanceof Error ? error.message : "Recording sync failed",
            shouldRetry: true,
          };
        }
      },
    };
  }

  /**
   * Transcription events handler
   */
  private getTranscriptionHandler(): WebhookHandler {
    return {
      eventTypes: [
        "recording.transcript_completed",
        "transcription.completed",
        "transcription.available",
      ],
      priority: 140,
      handle: async (event: WebhookEvent): Promise<WebhookHandlerResult> => {
        try {
          console.log(
            `Processing transcription event: ${event.eventType} for ${event.provider}`
          );

          // Extract meeting ID and transcription data
          const meetingId = this.extractMeetingIdFromEvent(event);
          const transcriptionData = this.extractTranscriptionData(event);

          if (!meetingId) {
            return {
              success: false,
              error: "Unable to extract meeting ID from transcription event",
            };
          }

          if (!transcriptionData) {
            return {
              success: false,
              error: "Unable to extract transcription data from event",
            };
          }

          const syncResult = await this.syncService.processRecordingFiles(
            meetingId,
            event.provider,
            {
              transcriptionUrl: transcriptionData.transcriptionUrl,
              chatLogUrl: transcriptionData.chatLogUrl,
              metadata: transcriptionData.metadata,
            }
          );

          if (!syncResult.success) {
            return {
              success: false,
              error: syncResult.error,
              shouldRetry: true,
            };
          }

          return {
            success: true,
            data: {
              operation: syncResult.operation,
              recordId: syncResult.recordId,
              changes: syncResult.changes,
              meetingId,
              transcriptionData,
              eventType: event.eventType,
              provider: event.provider,
            },
          };
        } catch (error) {
          console.error("Transcription sync error:", error);

          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Transcription sync failed",
            shouldRetry: true,
          };
        }
      },
    };
  }

  /**
   * Extract meeting ID from webhook event based on provider
   */
  private extractMeetingIdFromEvent(event: WebhookEvent): string | null {
    try {
      switch (event.provider) {
        case "ZOOM":
          return (
            event.payload.object?.uuid ||
            event.payload.object?.id?.toString() ||
            event.meetingId
          );

        case "MEET":
          return (
            event.payload.conferenceId ||
            event.payload.meetingCode ||
            event.meetingId
          );

        case "VIMEO":
          return (
            event.payload.data?.uri ||
            event.payload.data?.id?.toString() ||
            event.meetingId
          );

        default:
          return event.meetingId || null;
      }
    } catch (error) {
      console.error("Error extracting meeting ID:", error);
      return null;
    }
  }

  /**
   * Extract recording data from webhook event
   */
  private extractRecordingData(event: WebhookEvent): any | null {
    try {
      switch (event.provider) {
        case "ZOOM":
          const zoomRecording = event.payload.object || event.payload;
          return {
            recordingUrl: zoomRecording.download_url || zoomRecording.play_url,
            transcriptionUrl: zoomRecording.transcript_url,
            chatLogUrl: zoomRecording.chat_file_url,
            metadata: {
              recordingId: zoomRecording.id,
              recordingType: zoomRecording.recording_type,
              fileSize: zoomRecording.file_size,
              duration: zoomRecording.duration,
              status: zoomRecording.status,
            },
          };

        case "MEET":
          const meetRecording = event.payload;
          return {
            recordingUrl:
              meetRecording.recordingUrl || meetRecording.driveFileId,
            transcriptionUrl: meetRecording.transcriptUrl,
            chatLogUrl: meetRecording.chatUrl,
            metadata: {
              driveFileId: meetRecording.driveFileId,
              duration: meetRecording.duration,
              status: meetRecording.status,
            },
          };

        case "VIMEO":
          const vimeoVideo = event.payload.data || event.payload;
          return {
            recordingUrl: vimeoVideo.link || vimeoVideo.player_embed_url,
            metadata: {
              videoId: vimeoVideo.id,
              uri: vimeoVideo.uri,
              duration: vimeoVideo.duration,
              status: vimeoVideo.status,
              privacy: vimeoVideo.privacy,
              embed: vimeoVideo.embed,
            },
          };

        default:
          return event.payload;
      }
    } catch (error) {
      console.error("Error extracting recording data:", error);
      return null;
    }
  }

  /**
   * Extract transcription data from webhook event
   */
  private extractTranscriptionData(event: WebhookEvent): any | null {
    try {
      switch (event.provider) {
        case "ZOOM":
          const zoomTranscript = event.payload.object || event.payload;
          return {
            transcriptionUrl:
              zoomTranscript.transcript_url || zoomTranscript.download_url,
            chatLogUrl: zoomTranscript.chat_file_url,
            metadata: {
              transcriptId: zoomTranscript.id,
              language: zoomTranscript.language,
              status: zoomTranscript.status,
              fileSize: zoomTranscript.file_size,
            },
          };

        case "MEET":
          const meetTranscript = event.payload;
          return {
            transcriptionUrl:
              meetTranscript.transcriptUrl || meetTranscript.transcriptFileId,
            chatLogUrl: meetTranscript.chatUrl,
            metadata: {
              transcriptFileId: meetTranscript.transcriptFileId,
              language: meetTranscript.language,
              confidence: meetTranscript.confidence,
            },
          };

        case "VIMEO":
          // Vimeo doesn't typically have separate transcription events
          return {
            transcriptionUrl: event.payload.transcript_url,
            metadata: {
              language: event.payload.language,
            },
          };

        default:
          return event.payload;
      }
    } catch (error) {
      console.error("Error extracting transcription data:", error);
      return null;
    }
  }

  /**
   * Get sync service statistics
   */
  getSyncStats() {
    return this.syncService.getSyncStats();
  }

  /**
   * Reset sync service statistics
   */
  resetSyncStats() {
    this.syncService.resetSyncStats();
  }

  /**
   * Register all handlers with the webhook routing service
   */
  registerWithRoutingService(routingService: any) {
    const handlers = this.getAllHandlers();

    for (const [name, handler] of Object.entries(handlers)) {
      routingService.registerHandler(name, handler);
      console.log(`Registered meeting sync handler: ${name}`);
    }

    // Add routing rules for the handlers
    this.addRoutingRules(routingService);
  }

  /**
   * Add routing rules for meeting sync handlers
   */
  private addRoutingRules(routingService: any) {
    const rules = [
      // Zoom meeting lifecycle
      {
        id: "zoom-meeting-lifecycle-sync",
        provider: "ZOOM",
        eventType: "meeting.*",
        handlerName: "meetingLifecycleSync",
        enabled: true,
        priority: 200,
      },

      // Zoom participant events
      {
        id: "zoom-participant-sync",
        provider: "ZOOM",
        eventType: "meeting.participant_*",
        handlerName: "participantSync",
        enabled: true,
        priority: 180,
      },

      // Zoom recording events
      {
        id: "zoom-recording-sync",
        provider: "ZOOM",
        eventType: "recording.*",
        handlerName: "recordingSync",
        enabled: true,
        priority: 160,
      },

      // Google Meet events
      {
        id: "meet-conference-sync",
        provider: "MEET",
        eventType: "conference.*",
        handlerName: "meetingLifecycleSync",
        enabled: true,
        priority: 200,
      },

      // Google Meet participant events
      {
        id: "meet-participant-sync",
        provider: "MEET",
        eventType: "participant.*",
        handlerName: "participantSync",
        enabled: true,
        priority: 180,
      },

      // Vimeo video events
      {
        id: "vimeo-video-sync",
        provider: "VIMEO",
        eventType: "video.*",
        handlerName: "recordingSync",
        enabled: true,
        priority: 160,
      },

      // Transcription events (all providers)
      {
        id: "transcription-sync",
        eventType: "*transcript*",
        handlerName: "transcriptionSync",
        enabled: true,
        priority: 140,
      },
    ];

    for (const rule of rules) {
      routingService.addRoutingRule(rule);
      console.log(`Added routing rule: ${rule.id}`);
    }
  }
}
