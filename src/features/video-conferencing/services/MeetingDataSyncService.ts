/**
 * Meeting Data Synchronization Service
 * Handles automatic synchronization of meeting data from webhook events
 */

import { VideoProvider, MeetingStatus, VideoSpace } from "@prisma/client";
import { WebhookEvent } from "./WebhookRoutingService";

export interface MeetingRecord {
  id: string;
  externalId: string;
  videoSpaceId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: MeetingStatus;
  provider: VideoProvider;
  hostId?: string;
  hostName?: string;
  recordingUrl?: string;
  transcriptionUrl?: string;
  chatLogUrl?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParticipantRecord {
  id: string;
  meetingId: string;
  externalId?: string;
  name: string;
  email?: string;
  joinTime: Date;
  leaveTime?: Date;
  duration?: number;
  isHost: boolean;
  isModerator: boolean;
  cameraEnabled: boolean;
  micEnabled: boolean;
  screenShareDuration?: number;
  chatMessageCount: number;
  engagementScore?: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncResult {
  success: boolean;
  meetingId?: string;
  participantIds?: string[];
  recordingProcessed?: boolean;
  transcriptionProcessed?: boolean;
  error?: string;
  warnings?: string[];
}

export interface SyncOptions {
  forceUpdate?: boolean;
  includeParticipants?: boolean;
  includeRecordings?: boolean;
  includeTranscriptions?: boolean;
  batchSize?: number;
}

export class MeetingDataSyncService {
  private syncInProgress = new Set<string>();
  private syncQueue: Array<{ event: WebhookEvent; options: SyncOptions }> = [];
  private processing = false;

  /**
   * Synchronize meeting data from webhook event
   */
  async syncFromWebhook(
    event: WebhookEvent,
    options: SyncOptions = {}
  ): Promise<SyncResult> {
    const syncKey = `${event.provider}-${event.meetingId || event.id}`;

    // Prevent duplicate sync operations
    if (this.syncInProgress.has(syncKey)) {
      return {
        success: false,
        error: "Sync already in progress for this meeting",
      };
    }

    this.syncInProgress.add(syncKey);

    try {
      switch (event.eventType) {
        case "meeting.started":
        case "meeting.created":
          return await this.handleMeetingStarted(event, options);

        case "meeting.ended":
        case "meeting.finished":
          return await this.handleMeetingEnded(event, options);

        case "meeting.participant_joined":
        case "participant.joined":
          return await this.handleParticipantJoined(event, options);

        case "meeting.participant_left":
        case "participant.left":
          return await this.handleParticipantLeft(event, options);

        case "recording.completed":
        case "recording.ready":
          return await this.handleRecordingCompleted(event, options);

        case "recording.transcript_completed":
        case "transcription.completed":
          return await this.handleTranscriptionCompleted(event, options);

        default:
          return await this.handleGenericEvent(event, options);
      }
    } catch (error) {
      console.error(`Sync error for event ${event.id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown sync error",
      };
    } finally {
      this.syncInProgress.delete(syncKey);
    }
  }

  /**
   * Handle meeting started event
   */
  private async handleMeetingStarted(
    event: WebhookEvent,
    options: SyncOptions
  ): Promise<SyncResult> {
    if (!event.meetingId) {
      return {
        success: false,
        error: "Meeting ID is required for meeting started event",
      };
    }

    const meetingData = this.extractMeetingData(event);
    const existingMeeting = await this.findExistingMeeting(
      event.meetingId,
      event.provider
    );

    if (existingMeeting && !options.forceUpdate) {
      // Update existing meeting
      const updatedMeeting = await this.updateMeetingRecord(
        existingMeeting.id,
        {
          ...meetingData,
          status: "IN_PROGRESS" as MeetingStatus,
          updatedAt: new Date(),
        }
      );

      return {
        success: true,
        meetingId: updatedMeeting.id,
        warnings: ["Meeting already exists, updated existing record"],
      };
    }

    // Create new meeting record
    const newMeeting = await this.createMeetingRecord({
      ...meetingData,
      status: "IN_PROGRESS" as MeetingStatus,
    });

    // Process participants if included in event
    let participantIds: string[] = [];
    if (options.includeParticipants && event.payload.participants) {
      participantIds = await this.processParticipants(
        newMeeting.id,
        event.payload.participants
      );
    }

    return {
      success: true,
      meetingId: newMeeting.id,
      participantIds,
    };
  }

  /**
   * Handle meeting ended event
   */
  private async handleMeetingEnded(
    event: WebhookEvent,
    options: SyncOptions
  ): Promise<SyncResult> {
    if (!event.meetingId) {
      return {
        success: false,
        error: "Meeting ID is required for meeting ended event",
      };
    }

    const existingMeeting = await this.findExistingMeeting(
      event.meetingId,
      event.provider
    );
    if (!existingMeeting) {
      // Create meeting record if it doesn't exist
      const meetingData = this.extractMeetingData(event);
      const newMeeting = await this.createMeetingRecord({
        ...meetingData,
        status: "ENDED" as MeetingStatus,
      });

      return {
        success: true,
        meetingId: newMeeting.id,
        warnings: ["Meeting record created from end event"],
      };
    }

    // Update meeting with end data
    const endTime = new Date(event.timestamp);
    const duration = existingMeeting.startTime
      ? Math.floor(
          (endTime.getTime() - existingMeeting.startTime.getTime()) / 1000
        )
      : undefined;

    const updatedMeeting = await this.updateMeetingRecord(existingMeeting.id, {
      endTime,
      duration,
      status: "ENDED" as MeetingStatus,
      metadata: {
        ...existingMeeting.metadata,
        ...event.payload,
      },
      updatedAt: new Date(),
    });

    // Process final participant data
    let participantIds: string[] = [];
    if (options.includeParticipants && event.payload.participants) {
      participantIds = await this.processParticipants(
        updatedMeeting.id,
        event.payload.participants
      );
    }

    return {
      success: true,
      meetingId: updatedMeeting.id,
      participantIds,
    };
  }

  /**
   * Handle participant joined event
   */
  private async handleParticipantJoined(
    event: WebhookEvent,
    options: SyncOptions
  ): Promise<SyncResult> {
    if (!event.meetingId) {
      return {
        success: false,
        error: "Meeting ID is required for participant joined event",
      };
    }

    // Ensure meeting exists
    let meeting = await this.findExistingMeeting(
      event.meetingId,
      event.provider
    );
    if (!meeting) {
      const meetingData = this.extractMeetingData(event);
      meeting = await this.createMeetingRecord({
        ...meetingData,
        status: "IN_PROGRESS" as MeetingStatus,
      });
    }

    // Process participant data
    const participantData = this.extractParticipantData(event);
    const participant = await this.createOrUpdateParticipant(
      meeting.id,
      participantData
    );

    return {
      success: true,
      meetingId: meeting.id,
      participantIds: [participant.id],
    };
  }

  /**
   * Handle participant left event
   */
  private async handleParticipantLeft(
    event: WebhookEvent,
    options: SyncOptions
  ): Promise<SyncResult> {
    if (!event.meetingId) {
      return {
        success: false,
        error: "Meeting ID is required for participant left event",
      };
    }

    const meeting = await this.findExistingMeeting(
      event.meetingId,
      event.provider
    );
    if (!meeting) {
      return {
        success: false,
        error: "Meeting not found for participant left event",
      };
    }

    // Update participant with leave time
    const participantData = this.extractParticipantData(event);
    const participant = await this.updateParticipantLeaveTime(
      meeting.id,
      participantData.externalId ||
        participantData.email ||
        participantData.name,
      new Date(event.timestamp)
    );

    return {
      success: true,
      meetingId: meeting.id,
      participantIds: participant ? [participant.id] : [],
    };
  }

  /**
   * Handle recording completed event
   */
  private async handleRecordingCompleted(
    event: WebhookEvent,
    options: SyncOptions
  ): Promise<SyncResult> {
    if (!event.meetingId) {
      return {
        success: false,
        error: "Meeting ID is required for recording completed event",
      };
    }

    const meeting = await this.findExistingMeeting(
      event.meetingId,
      event.provider
    );
    if (!meeting) {
      return {
        success: false,
        error: "Meeting not found for recording completed event",
      };
    }

    // Extract recording information
    const recordingUrl =
      event.payload.download_url ||
      event.payload.recording_url ||
      event.payload.url;
    const recordingId = event.payload.recording_id || event.payload.id;

    const updatedMeeting = await this.updateMeetingRecord(meeting.id, {
      recordingUrl,
      metadata: {
        ...meeting.metadata,
        recordingId,
        recordingCompleted: true,
        recordingCompletedAt: event.timestamp,
      },
      updatedAt: new Date(),
    });

    return {
      success: true,
      meetingId: updatedMeeting.id,
      recordingProcessed: true,
    };
  }

  /**
   * Handle transcription completed event
   */
  private async handleTranscriptionCompleted(
    event: WebhookEvent,
    options: SyncOptions
  ): Promise<SyncResult> {
    if (!event.meetingId) {
      return {
        success: false,
        error: "Meeting ID is required for transcription completed event",
      };
    }

    const meeting = await this.findExistingMeeting(
      event.meetingId,
      event.provider
    );
    if (!meeting) {
      return {
        success: false,
        error: "Meeting not found for transcription completed event",
      };
    }

    // Extract transcription information
    const transcriptionUrl =
      event.payload.transcript_url ||
      event.payload.transcription_url ||
      event.payload.url;
    const transcriptionText =
      event.payload.transcript || event.payload.transcription;

    const updatedMeeting = await this.updateMeetingRecord(meeting.id, {
      transcriptionUrl,
      metadata: {
        ...meeting.metadata,
        transcriptionCompleted: true,
        transcriptionCompletedAt: event.timestamp,
        ...(transcriptionText && { transcriptionText }),
      },
      updatedAt: new Date(),
    });

    return {
      success: true,
      meetingId: updatedMeeting.id,
      transcriptionProcessed: true,
    };
  }

  /**
   * Handle generic events
   */
  private async handleGenericEvent(
    event: WebhookEvent,
    options: SyncOptions
  ): Promise<SyncResult> {
    // For unknown events, just log and return success
    console.log(`Received unknown event type: ${event.eventType}`, {
      provider: event.provider,
      meetingId: event.meetingId,
      eventId: event.id,
    });

    return {
      success: true,
      warnings: [`Unknown event type: ${event.eventType}`],
    };
  }

  /**
   * Extract meeting data from webhook event
   */
  private extractMeetingData(event: WebhookEvent): Partial<MeetingRecord> {
    const payload = event.payload;

    switch (event.provider) {
      case "ZOOM":
        return {
          externalId:
            event.meetingId || payload.object?.id || payload.object?.uuid,
          title: payload.object?.topic || payload.topic || "Zoom Meeting",
          description: payload.object?.agenda || payload.agenda,
          startTime: payload.object?.start_time
            ? new Date(payload.object.start_time)
            : event.timestamp,
          hostId: payload.object?.host_id || payload.host_id,
          hostName: payload.object?.host_email || payload.host_email,
          provider: "ZOOM",
          metadata: payload,
        };

      case "MEET":
        return {
          externalId:
            event.meetingId || payload.conferenceId || payload.meetingCode,
          title: payload.displayName || payload.title || "Google Meet",
          description: payload.description,
          startTime: payload.startTime
            ? new Date(payload.startTime)
            : event.timestamp,
          hostId: payload.organizerId || payload.creatorId,
          hostName: payload.organizerEmail || payload.creatorEmail,
          provider: "MEET",
          metadata: payload,
        };

      case "VIMEO":
        return {
          externalId: event.meetingId || payload.id || payload.video_id,
          title: payload.name || payload.title || "Vimeo Meeting",
          description: payload.description,
          startTime: payload.created_time
            ? new Date(payload.created_time)
            : event.timestamp,
          hostId: payload.user?.id || payload.user_id,
          hostName: payload.user?.name || payload.user_name,
          provider: "VIMEO",
          metadata: payload,
        };

      default:
        return {
          externalId: event.meetingId || "unknown",
          title: "Unknown Meeting",
          startTime: event.timestamp,
          provider: event.provider,
          metadata: payload,
        };
    }
  }

  /**
   * Extract participant data from webhook event
   */
  private extractParticipantData(
    event: WebhookEvent
  ): Partial<ParticipantRecord> {
    const payload = event.payload;
    const participant =
      payload.participant || payload.object?.participant || payload;

    return {
      externalId:
        participant.id || participant.user_id || participant.participant_id,
      name:
        participant.user_name ||
        participant.name ||
        participant.display_name ||
        "Unknown",
      email: participant.email || participant.user_email,
      joinTime: participant.join_time
        ? new Date(participant.join_time)
        : event.timestamp,
      isHost: participant.role === "host" || participant.is_host || false,
      isModerator:
        participant.role === "moderator" || participant.is_moderator || false,
      cameraEnabled:
        participant.video === "on" || participant.camera_enabled || false,
      micEnabled:
        participant.audio === "on" || participant.mic_enabled || false,
      chatMessageCount: 0,
      metadata: participant,
    };
  }

  /**
   * Database operations (mock implementations)
   * In a real application, these would interact with your database
   */

  private async findExistingMeeting(
    externalId: string,
    provider: VideoProvider
  ): Promise<MeetingRecord | null> {
    // Mock implementation - would query database
    console.log(`Finding meeting: ${externalId} for provider: ${provider}`);
    return null;
  }

  private async createMeetingRecord(
    data: Partial<MeetingRecord>
  ): Promise<MeetingRecord> {
    // Mock implementation - would create database record
    const meeting: MeetingRecord = {
      id: `meeting_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      externalId: data.externalId || "unknown",
      videoSpaceId: "default-space",
      title: data.title || "Unknown Meeting",
      description: data.description,
      startTime: data.startTime || new Date(),
      endTime: data.endTime,
      duration: data.duration,
      status: data.status || "SCHEDULED",
      provider: data.provider || "ZOOM",
      hostId: data.hostId,
      hostName: data.hostName,
      recordingUrl: data.recordingUrl,
      transcriptionUrl: data.transcriptionUrl,
      chatLogUrl: data.chatLogUrl,
      metadata: data.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Created meeting record:", meeting.id);
    return meeting;
  }

  private async updateMeetingRecord(
    id: string,
    data: Partial<MeetingRecord>
  ): Promise<MeetingRecord> {
    // Mock implementation - would update database record
    console.log(`Updated meeting record: ${id}`);

    // Return mock updated record
    return {
      id,
      externalId: data.externalId || "unknown",
      videoSpaceId: "default-space",
      title: data.title || "Updated Meeting",
      description: data.description,
      startTime: data.startTime || new Date(),
      endTime: data.endTime,
      duration: data.duration,
      status: data.status || "SCHEDULED",
      provider: data.provider || "ZOOM",
      hostId: data.hostId,
      hostName: data.hostName,
      recordingUrl: data.recordingUrl,
      transcriptionUrl: data.transcriptionUrl,
      chatLogUrl: data.chatLogUrl,
      metadata: data.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async processParticipants(
    meetingId: string,
    participants: any[]
  ): Promise<string[]> {
    // Mock implementation - would process participant data
    const participantIds: string[] = [];

    for (const participantData of participants) {
      const participant = await this.createOrUpdateParticipant(
        meetingId,
        participantData
      );
      participantIds.push(participant.id);
    }

    return participantIds;
  }

  private async createOrUpdateParticipant(
    meetingId: string,
    data: Partial<ParticipantRecord>
  ): Promise<ParticipantRecord> {
    // Mock implementation - would create or update participant record
    const participant: ParticipantRecord = {
      id: `participant_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      meetingId,
      externalId: data.externalId,
      name: data.name || "Unknown Participant",
      email: data.email,
      joinTime: data.joinTime || new Date(),
      leaveTime: data.leaveTime,
      duration: data.duration,
      isHost: data.isHost || false,
      isModerator: data.isModerator || false,
      cameraEnabled: data.cameraEnabled || false,
      micEnabled: data.micEnabled || false,
      screenShareDuration: data.screenShareDuration,
      chatMessageCount: data.chatMessageCount || 0,
      engagementScore: data.engagementScore,
      metadata: data.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Created/updated participant:", participant.id);
    return participant;
  }

  private async updateParticipantLeaveTime(
    meetingId: string,
    identifier: string,
    leaveTime: Date
  ): Promise<ParticipantRecord | null> {
    // Mock implementation - would update participant leave time
    console.log(
      `Updated participant leave time: ${identifier} in meeting ${meetingId}`
    );
    return null;
  }

  /**
   * Queue sync operation for batch processing
   */
  async queueSync(
    event: WebhookEvent,
    options: SyncOptions = {}
  ): Promise<void> {
    this.syncQueue.push({ event, options });

    if (!this.processing) {
      await this.processSyncQueue();
    }
  }

  /**
   * Process sync queue
   */
  private async processSyncQueue(): Promise<void> {
    if (this.processing) return;

    this.processing = true;

    try {
      while (this.syncQueue.length > 0) {
        const batch = this.syncQueue.splice(0, 10); // Process in batches of 10

        const promises = batch.map(({ event, options }) =>
          this.syncFromWebhook(event, options).catch((error) => ({
            success: false,
            error: error.message,
          }))
        );

        const results = await Promise.all(promises);

        // Log batch results
        const successful = results.filter((r) => r.success).length;
        const failed = results.length - successful;

        console.log(
          `Sync batch completed: ${successful} successful, ${failed} failed`
        );
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Get sync statistics
   */
  getSyncStats(): {
    queueLength: number;
    processing: boolean;
    inProgress: number;
  } {
    return {
      queueLength: this.syncQueue.length,
      processing: this.processing,
      inProgress: this.syncInProgress.size,
    };
  }

  /**
   * Clear sync queue
   */
  clearSyncQueue(): void {
    this.syncQueue = [];
  }
}
