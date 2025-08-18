/**
 * Meeting Data Collection Service
 * Handles fetching meeting records from provider APIs
 */

import { VideoConferencingService } from "./VideoConferencingService";
import { prisma } from "@/lib/prisma";
import {
  VideoProvider,
  MeetingStatus,
  IntegrationAccount,
} from "@prisma/client";

export interface MeetingRecord {
  id: string;
  videoSpaceId: string;
  providerMeetingId: string;
  title: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  status: MeetingStatus;
  totalParticipants: number;
  hostId: string | null;
  recordingUrl: string | null;
  transcriptionUrl: string | null;
  chatLogUrl: string | null;
  providerData: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParticipantRecord {
  id: string;
  meetingRecordId: string;
  participantId: string;
  name: string;
  email: string | null;
  joinTime: Date;
  leaveTime: Date | null;
  duration: number | null;
  isHost: boolean;
  isModerator: boolean;
  cameraOnDuration: number | null;
  micOnDuration: number | null;
  screenShareDuration: number | null;
  chatMessageCount: number;
  providerData: any;
}

export interface TranscriptionSegment {
  id: string;
  meetingRecordId: string;
  participantId: string | null;
  startTime: number; // seconds from meeting start
  endTime: number;
  text: string;
  confidence: number | null;
  language: string | null;
}

export interface ChatMessage {
  id: string;
  meetingRecordId: string;
  participantId: string;
  timestamp: Date;
  message: string;
  messageType: "TEXT" | "FILE" | "EMOJI" | "SYSTEM";
  isPrivate: boolean;
  recipientId: string | null;
}

export interface CollectionResult {
  success: boolean;
  meetingsCollected: number;
  participantsCollected: number;
  transcriptionsCollected: number;
  chatMessagesCollected: number;
  errors: string[];
  lastSyncTime: Date;
}

export class MeetingDataCollectionService {
  private videoConferencingService: VideoConferencingService;

  constructor() {
    this.videoConferencingService = new VideoConferencingService();
  }

  /**
   * Collect meeting data for a specific video space
   */
  async collectMeetingDataForVideoSpace(
    videoSpaceId: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<CollectionResult> {
    const result: CollectionResult = {
      success: false,
      meetingsCollected: 0,
      participantsCollected: 0,
      transcriptionsCollected: 0,
      chatMessagesCollected: 0,
      errors: [],
      lastSyncTime: new Date(),
    };

    try {
      // Get video space with integration account
      const videoSpace = await prisma.videoSpace.findUnique({
        where: { id: videoSpaceId },
        include: {
          integrationAccount: true,
        },
      });

      if (!videoSpace) {
        result.errors.push("Video space not found");
        return result;
      }

      // Fetch meeting records from provider
      const meetingRecords = await this.fetchMeetingRecordsFromProvider(
        videoSpace.provider,
        videoSpace.providerRoomId,
        videoSpace.integrationAccount,
        dateRange
      );

      if (!meetingRecords.success) {
        result.errors.push(
          meetingRecords.error || "Failed to fetch meeting records"
        );
        return result;
      }

      // Process each meeting record
      for (const meetingData of meetingRecords.data || []) {
        try {
          // Store meeting record
          const storedMeeting = await this.storeMeetingRecord(
            videoSpaceId,
            meetingData
          );
          result.meetingsCollected++;

          // Collect participant data
          const participantResult = await this.collectParticipantData(
            storedMeeting.id,
            meetingData,
            videoSpace.provider,
            videoSpace.integrationAccount
          );
          result.participantsCollected +=
            participantResult.participantsCollected;

          // Collect transcription data
          const transcriptionResult = await this.collectTranscriptionData(
            storedMeeting.id,
            meetingData,
            videoSpace.provider,
            videoSpace.integrationAccount
          );
          result.transcriptionsCollected +=
            transcriptionResult.transcriptionsCollected;

          // Collect chat messages
          const chatResult = await this.collectChatMessages(
            storedMeeting.id,
            meetingData,
            videoSpace.provider,
            videoSpace.integrationAccount
          );
          result.chatMessagesCollected += chatResult.chatMessagesCollected;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          result.errors.push(
            `Failed to process meeting ${meetingData.id}: ${errorMessage}`
          );
        }
      }

      result.success = result.errors.length === 0;
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`Collection failed: ${errorMessage}`);
      return result;
    }
  }

  /**
   * Collect meeting data for all video spaces owned by a user
   */
  async collectMeetingDataForUser(
    userId: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<CollectionResult> {
    const aggregatedResult: CollectionResult = {
      success: true,
      meetingsCollected: 0,
      participantsCollected: 0,
      transcriptionsCollected: 0,
      chatMessagesCollected: 0,
      errors: [],
      lastSyncTime: new Date(),
    };

    try {
      // Get all video spaces for user
      const videoSpaces = await prisma.videoSpace.findMany({
        where: { ownerId: userId },
        select: { id: true },
      });

      // Process each video space
      for (const videoSpace of videoSpaces) {
        const result = await this.collectMeetingDataForVideoSpace(
          videoSpace.id,
          dateRange
        );

        aggregatedResult.meetingsCollected += result.meetingsCollected;
        aggregatedResult.participantsCollected += result.participantsCollected;
        aggregatedResult.transcriptionsCollected +=
          result.transcriptionsCollected;
        aggregatedResult.chatMessagesCollected += result.chatMessagesCollected;
        aggregatedResult.errors.push(...result.errors);
      }

      aggregatedResult.success = aggregatedResult.errors.length === 0;
      return aggregatedResult;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      aggregatedResult.errors.push(`User collection failed: ${errorMessage}`);
      aggregatedResult.success = false;
      return aggregatedResult;
    }
  }

  /**
   * Fetch meeting records from provider API
   */
  private async fetchMeetingRecordsFromProvider(
    provider: VideoProvider,
    roomId: string,
    integrationAccount: IntegrationAccount,
    dateRange?: { start: Date; end: Date }
  ): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      switch (provider) {
        case "ZOOM":
          return await this.fetchZoomMeetingRecords(
            roomId,
            integrationAccount,
            dateRange
          );
        case "MEET":
          return await this.fetchGoogleMeetRecords(
            roomId,
            integrationAccount,
            dateRange
          );
        case "VIMEO":
          return await this.fetchVimeoRecords(
            roomId,
            integrationAccount,
            dateRange
          );
        default:
          return { success: false, error: `Unsupported provider: ${provider}` };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Fetch Zoom meeting records
   */
  private async fetchZoomMeetingRecords(
    meetingId: string,
    integrationAccount: IntegrationAccount,
    dateRange?: { start: Date; end: Date }
  ): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      // Mock Zoom API call - replace with actual implementation
      const zoomApiUrl = `https://api.zoom.us/v2/meetings/${meetingId}/instances`;
      const params = new URLSearchParams();

      if (dateRange) {
        params.append("from", dateRange.start.toISOString().split("T")[0]);
        params.append("to", dateRange.end.toISOString().split("T")[0]);
      }

      // Simulate API response
      const mockResponse = {
        meetings: [
          {
            uuid: "zoom_meeting_uuid_123",
            id: parseInt(meetingId),
            host_id: "zoom_host_123",
            topic: "Weekly Team Standup",
            type: 2,
            start_time: "2024-01-08T09:00:00Z",
            duration: 30,
            timezone: "UTC",
            join_url: `https://zoom.us/j/${meetingId}`,
            status: "ended",
            total_size: 5,
            recording_count: 1,
            participant_count: 5,
          },
        ],
      };

      return { success: true, data: mockResponse.meetings };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: `Zoom API error: ${errorMessage}` };
    }
  }

  /**
   * Fetch Google Meet records
   */
  private async fetchGoogleMeetRecords(
    spaceId: string,
    integrationAccount: IntegrationAccount,
    dateRange?: { start: Date; end: Date }
  ): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      // Mock Google Meet API call - replace with actual implementation
      const mockResponse = {
        conferenceRecords: [
          {
            name: "conferenceRecords/meet_record_123",
            startTime: "2024-01-08T09:00:00Z",
            endTime: "2024-01-08T09:30:00Z",
            space: {
              name: spaceId,
              meetingUri: `https://meet.google.com/${spaceId.split("/").pop()}`,
            },
            participantCount: 4,
          },
        ],
      };

      return { success: true, data: mockResponse.conferenceRecords };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Google Meet API error: ${errorMessage}`,
      };
    }
  }

  /**
   * Fetch Vimeo records
   */
  private async fetchVimeoRecords(
    videoId: string,
    integrationAccount: IntegrationAccount,
    dateRange?: { start: Date; end: Date }
  ): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      // Mock Vimeo API call - replace with actual implementation
      const mockResponse = {
        data: [
          {
            uri: `/videos/${videoId}`,
            name: "Training Session Recording",
            created_time: "2024-01-06T15:30:00Z",
            modified_time: "2024-01-06T16:30:00Z",
            duration: 3600,
            status: "available",
            stats: {
              plays: 25,
            },
            privacy: {
              view: "password",
            },
          },
        ],
      };

      return { success: true, data: mockResponse.data };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: `Vimeo API error: ${errorMessage}` };
    }
  }

  /**
   * Store meeting record in database
   */
  private async storeMeetingRecord(
    videoSpaceId: string,
    meetingData: any
  ): Promise<MeetingRecord> {
    const meetingRecord = await prisma.meetingRecord.upsert({
      where: {
        providerMeetingId:
          meetingData.uuid || meetingData.name || meetingData.uri,
      },
      update: {
        title: meetingData.topic || meetingData.name || "Untitled Meeting",
        startTime: new Date(
          meetingData.start_time ||
            meetingData.startTime ||
            meetingData.created_time
        ),
        endTime: meetingData.end_time
          ? new Date(meetingData.end_time)
          : meetingData.endTime
            ? new Date(meetingData.endTime)
            : null,
        duration: meetingData.duration || null,
        status: this.mapProviderStatusToMeetingStatus(meetingData.status),
        totalParticipants:
          meetingData.participant_count || meetingData.participantCount || 0,
        hostId: meetingData.host_id || null,
        providerData: meetingData,
        updatedAt: new Date(),
      },
      create: {
        videoSpaceId,
        providerMeetingId:
          meetingData.uuid || meetingData.name || meetingData.uri,
        title: meetingData.topic || meetingData.name || "Untitled Meeting",
        startTime: new Date(
          meetingData.start_time ||
            meetingData.startTime ||
            meetingData.created_time
        ),
        endTime: meetingData.end_time
          ? new Date(meetingData.end_time)
          : meetingData.endTime
            ? new Date(meetingData.endTime)
            : null,
        duration: meetingData.duration || null,
        status: this.mapProviderStatusToMeetingStatus(meetingData.status),
        totalParticipants:
          meetingData.participant_count || meetingData.participantCount || 0,
        hostId: meetingData.host_id || null,
        recordingUrl: null,
        transcriptionUrl: null,
        chatLogUrl: null,
        providerData: meetingData,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return meetingRecord as MeetingRecord;
  }

  /**
   * Collect participant data for a meeting
   */
  private async collectParticipantData(
    meetingRecordId: string,
    meetingData: any,
    provider: VideoProvider,
    integrationAccount: IntegrationAccount
  ): Promise<{ participantsCollected: number }> {
    try {
      // Fetch participant data from provider
      const participantData = await this.fetchParticipantDataFromProvider(
        meetingData,
        provider,
        integrationAccount
      );

      let participantsCollected = 0;

      for (const participant of participantData) {
        await prisma.participantRecord.upsert({
          where: {
            meetingRecordId_participantId: {
              meetingRecordId,
              participantId:
                participant.id ||
                participant.user_id ||
                participant.participantId,
            },
          },
          update: {
            name: participant.name || participant.user_name || "Unknown",
            email: participant.email || participant.user_email || null,
            joinTime: new Date(participant.join_time || participant.joinTime),
            leaveTime: participant.leave_time
              ? new Date(participant.leave_time)
              : participant.leaveTime
                ? new Date(participant.leaveTime)
                : null,
            duration: participant.duration || null,
            isHost: participant.is_host || participant.isHost || false,
            isModerator:
              participant.is_moderator || participant.isModerator || false,
            cameraOnDuration: participant.camera_on_duration || null,
            micOnDuration: participant.mic_on_duration || null,
            screenShareDuration: participant.screen_share_duration || null,
            chatMessageCount: participant.chat_message_count || 0,
            providerData: participant,
          },
          create: {
            meetingRecordId,
            participantId:
              participant.id ||
              participant.user_id ||
              participant.participantId,
            name: participant.name || participant.user_name || "Unknown",
            email: participant.email || participant.user_email || null,
            joinTime: new Date(participant.join_time || participant.joinTime),
            leaveTime: participant.leave_time
              ? new Date(participant.leave_time)
              : participant.leaveTime
                ? new Date(participant.leaveTime)
                : null,
            duration: participant.duration || null,
            isHost: participant.is_host || participant.isHost || false,
            isModerator:
              participant.is_moderator || participant.isModerator || false,
            cameraOnDuration: participant.camera_on_duration || null,
            micOnDuration: participant.mic_on_duration || null,
            screenShareDuration: participant.screen_share_duration || null,
            chatMessageCount: participant.chat_message_count || 0,
            providerData: participant,
          },
        });

        participantsCollected++;
      }

      return { participantsCollected };
    } catch (error) {
      console.error("Error collecting participant data:", error);
      return { participantsCollected: 0 };
    }
  }

  /**
   * Collect transcription data for a meeting
   */
  private async collectTranscriptionData(
    meetingRecordId: string,
    meetingData: any,
    provider: VideoProvider,
    integrationAccount: IntegrationAccount
  ): Promise<{ transcriptionsCollected: number }> {
    try {
      // Fetch transcription data from provider
      const transcriptionData = await this.fetchTranscriptionDataFromProvider(
        meetingData,
        provider,
        integrationAccount
      );

      let transcriptionsCollected = 0;

      for (const segment of transcriptionData) {
        await prisma.transcriptionSegment.create({
          data: {
            meetingRecordId,
            participantId: segment.participantId || null,
            startTime: segment.startTime || 0,
            endTime: segment.endTime || 0,
            text: segment.text || "",
            confidence: segment.confidence || null,
            language: segment.language || null,
          },
        });

        transcriptionsCollected++;
      }

      return { transcriptionsCollected };
    } catch (error) {
      console.error("Error collecting transcription data:", error);
      return { transcriptionsCollected: 0 };
    }
  }

  /**
   * Collect chat messages for a meeting
   */
  private async collectChatMessages(
    meetingRecordId: string,
    meetingData: any,
    provider: VideoProvider,
    integrationAccount: IntegrationAccount
  ): Promise<{ chatMessagesCollected: number }> {
    try {
      // Fetch chat messages from provider
      const chatData = await this.fetchChatMessagesFromProvider(
        meetingData,
        provider,
        integrationAccount
      );

      let chatMessagesCollected = 0;

      for (const message of chatData) {
        await prisma.chatMessage.create({
          data: {
            meetingRecordId,
            participantId: message.participantId || message.user_id,
            timestamp: new Date(message.timestamp || message.time),
            message: message.message || message.text || "",
            messageType: this.mapProviderMessageType(message.type),
            isPrivate: message.is_private || message.isPrivate || false,
            recipientId: message.recipient_id || message.recipientId || null,
          },
        });

        chatMessagesCollected++;
      }

      return { chatMessagesCollected };
    } catch (error) {
      console.error("Error collecting chat messages:", error);
      return { chatMessagesCollected: 0 };
    }
  }

  /**
   * Fetch participant data from provider
   */
  private async fetchParticipantDataFromProvider(
    meetingData: any,
    provider: VideoProvider,
    integrationAccount: IntegrationAccount
  ): Promise<any[]> {
    // Mock implementation - replace with actual provider API calls
    const mockParticipants = [
      {
        id: "participant_1",
        name: "John Doe",
        email: "john@example.com",
        join_time: "2024-01-08T09:00:00Z",
        leave_time: "2024-01-08T09:30:00Z",
        duration: 1800,
        is_host: true,
        camera_on_duration: 1800,
        mic_on_duration: 1800,
        chat_message_count: 3,
      },
      {
        id: "participant_2",
        name: "Jane Smith",
        email: "jane@example.com",
        join_time: "2024-01-08T09:02:00Z",
        leave_time: "2024-01-08T09:30:00Z",
        duration: 1680,
        is_host: false,
        camera_on_duration: 1200,
        mic_on_duration: 1680,
        chat_message_count: 1,
      },
    ];

    return mockParticipants;
  }

  /**
   * Fetch transcription data from provider
   */
  private async fetchTranscriptionDataFromProvider(
    meetingData: any,
    provider: VideoProvider,
    integrationAccount: IntegrationAccount
  ): Promise<any[]> {
    // Mock implementation - replace with actual provider API calls
    const mockTranscription = [
      {
        participantId: "participant_1",
        startTime: 0,
        endTime: 5,
        text: "Good morning everyone, let's start our weekly standup.",
        confidence: 0.95,
        language: "en",
      },
      {
        participantId: "participant_2",
        startTime: 5,
        endTime: 10,
        text: "Good morning! I'll go first with my updates.",
        confidence: 0.92,
        language: "en",
      },
    ];

    return mockTranscription;
  }

  /**
   * Fetch chat messages from provider
   */
  private async fetchChatMessagesFromProvider(
    meetingData: any,
    provider: VideoProvider,
    integrationAccount: IntegrationAccount
  ): Promise<any[]> {
    // Mock implementation - replace with actual provider API calls
    const mockChatMessages = [
      {
        user_id: "participant_1",
        timestamp: "2024-01-08T09:05:00Z",
        message: "Please share your screen when you present",
        type: "TEXT",
        is_private: false,
      },
      {
        user_id: "participant_2",
        timestamp: "2024-01-08T09:15:00Z",
        message: "Thanks for the update!",
        type: "TEXT",
        is_private: false,
      },
    ];

    return mockChatMessages;
  }

  /**
   * Map provider status to meeting status
   */
  private mapProviderStatusToMeetingStatus(
    providerStatus: string
  ): MeetingStatus {
    const statusMap: Record<string, MeetingStatus> = {
      // Zoom
      waiting: "SCHEDULED",
      started: "IN_PROGRESS",
      ended: "ENDED",

      // Google Meet (case sensitive)
      ACTIVE: "IN_PROGRESS",
      ENDED: "ENDED",

      // Vimeo
      available: "ENDED",
      processing: "IN_PROGRESS",

      // Generic
      scheduled: "SCHEDULED",
      in_progress: "IN_PROGRESS",
      cancelled: "CANCELLED",
    };

    // Check case-sensitive first for Google Meet
    if (statusMap[providerStatus]) {
      return statusMap[providerStatus];
    }

    // Then check lowercase for other providers
    return statusMap[providerStatus?.toLowerCase()] || "ENDED";
  }

  /**
   * Map provider message type to chat message type
   */
  private mapProviderMessageType(
    providerType: string
  ): "TEXT" | "FILE" | "EMOJI" | "SYSTEM" {
    const typeMap: Record<string, "TEXT" | "FILE" | "EMOJI" | "SYSTEM"> = {
      text: "TEXT",
      file: "FILE",
      emoji: "EMOJI",
      system: "SYSTEM",
      chat: "TEXT",
    };

    return typeMap[providerType?.toLowerCase()] || "TEXT";
  }
}
