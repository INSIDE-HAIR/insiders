/**
 * Zoom Service - Provider Implementation
 * Handles Zoom API v2 integration
 */

import type {
  VideoProvider,
  VideoSpaceStatus,
  MeetingRecord,
  MeetingParticipant,
  MeetingTranscriptEntry,
  MeetingChatMessage,
  MeetingRecordingFile,
  ServiceResponse,
  DateRange,
} from "../../types";

import type {
  ZoomVideoSpaceConfig,
  ZoomMeetingResponse,
  CreateZoomMeetingRequest,
  UpdateZoomMeetingRequest,
  ZoomServiceConfig,
} from "../../types/zoom";

import type { IProviderService } from "../interfaces";
import { ZoomAuthProvider } from "../auth/ZoomAuthProvider";
import {
  VideoConferencingError,
  RoomCreationError,
  RoomNotFoundError,
  DataSyncError,
  createProviderError,
} from "../errors";

// =============================================================================
// Zoom Service Implementation
// =============================================================================

export class ZoomService
  implements IProviderService<ZoomVideoSpaceConfig, ZoomMeetingResponse>
{
  public readonly provider: VideoProvider = "ZOOM";

  constructor(
    private config: ZoomServiceConfig,
    private authProvider: ZoomAuthProvider
  ) {}

  // =============================================================================
  // Authentication
  // =============================================================================

  async authenticate(
    integrationAccountId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const isValid =
        await this.authProvider.validateIntegrationAccount(
          integrationAccountId
        );

      return {
        success: isValid,
        data: isValid,
        error: isValid ? undefined : "Authentication failed",
        code: isValid ? undefined : "AUTH_FAILED",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication error",
        code: "AUTH_ERROR",
      };
    }
  }

  async refreshToken(
    integrationAccountId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const refreshed =
        await this.authProvider.refreshTokens(integrationAccountId);

      return {
        success: refreshed,
        data: refreshed,
        error: refreshed ? undefined : "Token refresh failed",
        code: refreshed ? undefined : "REFRESH_FAILED",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Token refresh error",
        code: "REFRESH_ERROR",
      };
    }
  }

  // =============================================================================
  // Room Management
  // =============================================================================

  async createRoom(
    config: ZoomVideoSpaceConfig,
    integrationAccountId: string
  ): Promise<ServiceResponse<ZoomMeetingResponse>> {
    try {
      // Authenticate first
      const authResult = await this.authenticate(integrationAccountId);
      if (!authResult.success) {
        return authResult as ServiceResponse<ZoomMeetingResponse>;
      }

      const client =
        await this.authProvider.getAuthenticatedClient(integrationAccountId);
      if (!client) {
        return {
          success: false,
          error: "Failed to get authenticated client",
          code: "AUTH_CLIENT_ERROR",
        };
      }

      // Create Zoom meeting via API
      const meetingRequest = this.buildCreateMeetingRequest(config);

      const createMeetingResponse = await fetch(
        "https://api.zoom.us/v2/users/me/meetings",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(meetingRequest),
        }
      );

      if (!createMeetingResponse.ok) {
        const errorData = await createMeetingResponse.json();
        throw new RoomCreationError(
          "ZOOM",
          `Failed to create Zoom meeting: ${errorData.message || "Unknown error"}`,
          undefined,
          createMeetingResponse.status
        );
      }

      const meetingData = await createMeetingResponse.json();

      const response: ZoomMeetingResponse = {
        meetingId: meetingData.id,
        uuid: meetingData.uuid,
        hostId: meetingData.host_id,
        hostEmail: meetingData.host_email,
        topic: meetingData.topic,
        type: meetingData.type.toString(),
        status: "waiting",
        startTime: meetingData.start_time,
        duration: meetingData.duration,
        timezone: meetingData.timezone,
        password: meetingData.password,
        joinUrl: meetingData.join_url,
        startUrl: meetingData.start_url,
        createdAt: meetingData.created_at,
        settings: config,
      };

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      const zoomError = createProviderError("ZOOM", error, "createRoom");
      return {
        success: false,
        error: zoomError.message,
        code: zoomError.code,
      };
    }
  }

  async updateRoom(
    roomId: string,
    config: Partial<ZoomVideoSpaceConfig>,
    integrationAccountId: string
  ): Promise<ServiceResponse<ZoomMeetingResponse>> {
    try {
      // Authenticate first
      const authResult = await this.authenticate(integrationAccountId);
      if (!authResult.success) {
        return authResult as ServiceResponse<ZoomMeetingResponse>;
      }

      const client =
        await this.authProvider.getAuthenticatedClient(integrationAccountId);
      if (!client) {
        return {
          success: false,
          error: "Failed to get authenticated client",
          code: "AUTH_CLIENT_ERROR",
        };
      }

      // Update Zoom meeting via API
      const updateMeetingResponse = await fetch(
        `https://api.zoom.us/v2/meetings/${roomId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(config),
        }
      );

      if (!updateMeetingResponse.ok) {
        const errorData = await updateMeetingResponse.json();
        throw new RoomCreationError(
          "ZOOM",
          `Failed to update Zoom meeting: ${errorData.message || "Unknown error"}`,
          undefined,
          updateMeetingResponse.status
        );
      }

      // Get updated meeting details
      const getMeetingResponse = await fetch(
        `https://api.zoom.us/v2/meetings/${roomId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
          },
        }
      );

      if (!getMeetingResponse.ok) {
        throw new RoomNotFoundError("ZOOM", roomId);
      }

      const meetingData = await getMeetingResponse.json();

      const response: ZoomMeetingResponse = {
        meetingId: meetingData.id,
        uuid: meetingData.uuid,
        hostId: meetingData.host_id,
        hostEmail: meetingData.host_email,
        topic: meetingData.topic,
        type: meetingData.type.toString(),
        status: meetingData.status,
        startTime: meetingData.start_time,
        duration: meetingData.duration,
        timezone: meetingData.timezone,
        password: meetingData.password,
        joinUrl: meetingData.join_url,
        startUrl: meetingData.start_url,
        createdAt: meetingData.created_at,
        settings: config as ZoomVideoSpaceConfig,
      };

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      const zoomError = createProviderError("ZOOM", error, "updateRoom");
      return {
        success: false,
        error: zoomError.message,
        code: zoomError.code,
      };
    }
  }

  async deleteRoom(
    roomId: string,
    integrationAccountId: string
  ): Promise<ServiceResponse<void>> {
    try {
      // Authenticate first
      const authResult = await this.authenticate(integrationAccountId);
      if (!authResult.success) {
        return authResult as ServiceResponse<void>;
      }

      const client =
        await this.authProvider.getAuthenticatedClient(integrationAccountId);
      if (!client) {
        return {
          success: false,
          error: "Failed to get authenticated client",
          code: "AUTH_CLIENT_ERROR",
        };
      }

      // Delete Zoom meeting via API
      const deleteMeetingResponse = await fetch(
        `https://api.zoom.us/v2/meetings/${roomId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
          },
        }
      );

      if (!deleteMeetingResponse.ok && deleteMeetingResponse.status !== 404) {
        const errorData = await deleteMeetingResponse.json();
        throw new VideoConferencingError(
          `Failed to delete Zoom meeting: ${errorData.message || "Unknown error"}`,
          "DELETE_ERROR",
          "ZOOM"
        );
      }

      return {
        success: true,
      };
    } catch (error) {
      const zoomError = createProviderError("ZOOM", error, "deleteRoom");
      return {
        success: false,
        error: zoomError.message,
        code: zoomError.code,
      };
    }
  }

  async getRoomStatus(
    roomId: string,
    integrationAccountId: string
  ): Promise<ServiceResponse<VideoSpaceStatus>> {
    try {
      // Authenticate first
      const authResult = await this.authenticate(integrationAccountId);
      if (!authResult.success) {
        return authResult as ServiceResponse<VideoSpaceStatus>;
      }

      const client =
        await this.authProvider.getAuthenticatedClient(integrationAccountId);
      if (!client) {
        return {
          success: false,
          error: "Failed to get authenticated client",
          code: "AUTH_CLIENT_ERROR",
        };
      }

      // Get meeting details to check status
      const meetingResponse = await fetch(
        `https://api.zoom.us/v2/meetings/${roomId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
          },
        }
      );

      if (!meetingResponse.ok) {
        if (meetingResponse.status === 404) {
          return {
            success: true,
            data: "EXPIRED",
          };
        }

        const errorData = await meetingResponse.json();
        throw new RoomNotFoundError(
          "ZOOM",
          roomId,
          new Error(errorData.message || "Unknown error")
        );
      }

      const meetingData = await meetingResponse.json();

      // Map Zoom status to our VideoSpaceStatus
      let status: VideoSpaceStatus;
      switch (meetingData.status) {
        case "waiting":
          status = "INACTIVE";
          break;
        case "started":
          status = "ACTIVE";
          break;
        case "ended":
          status = "INACTIVE";
          break;
        default:
          status = "ACTIVE";
      }

      return {
        success: true,
        data: status,
      };
    } catch (error) {
      const zoomError = createProviderError("ZOOM", error, "getRoomStatus");
      return {
        success: false,
        error: zoomError.message,
        code: zoomError.code,
      };
    }
  }

  // =============================================================================
  // Meeting Data Retrieval
  // =============================================================================

  async getMeetingRecords(
    roomId: string,
    dateRange?: DateRange,
    integrationAccountId?: string
  ): Promise<ServiceResponse<MeetingRecord[]>> {
    try {
      if (!integrationAccountId) {
        return {
          success: false,
          error: "Integration account ID is required",
          code: "MISSING_INTEGRATION_ACCOUNT",
        };
      }

      // Authenticate first
      const authResult = await this.authenticate(integrationAccountId);
      if (!authResult.success) {
        return authResult as ServiceResponse<MeetingRecord[]>;
      }

      const client =
        await this.authProvider.getAuthenticatedClient(integrationAccountId);
      if (!client) {
        return {
          success: false,
          error: "Failed to get authenticated client",
          code: "AUTH_CLIENT_ERROR",
        };
      }

      // Get past meeting instances for this meeting ID
      const instancesResponse = await fetch(
        `https://api.zoom.us/v2/past_meetings/${roomId}/instances`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
          },
        }
      );

      if (!instancesResponse.ok) {
        const errorData = await instancesResponse.json();
        throw new DataSyncError(
          "ZOOM",
          "meeting",
          `Failed to get meeting instances: ${errorData.message || "Unknown error"}`,
          undefined,
          instancesResponse.status
        );
      }

      const instancesData = await instancesResponse.json();
      const instances = instancesData.meetings || [];

      // Convert Zoom meeting instances to our MeetingRecord format
      const meetingRecords: MeetingRecord[] = instances
        .filter((instance: any) => {
          if (!dateRange) return true;
          const startTime = new Date(instance.start_time);
          return startTime >= dateRange.start && startTime <= dateRange.end;
        })
        .map((instance: any) => ({
          id: "", // Will be set by the database
          videoSpaceId: "", // Will be set by the calling service
          providerMeetingId: instance.uuid,
          title: instance.topic || "Zoom Meeting",
          startTime: new Date(instance.start_time),
          endTime: instance.end_time ? new Date(instance.end_time) : undefined,
          duration: instance.duration || 0,
          status: instance.end_time ? "ENDED" : "ACTIVE",
          totalParticipants: instance.participants_count || 0,
          maxConcurrentUsers: instance.participants_count || 0,
          providerData: instance,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

      return {
        success: true,
        data: meetingRecords,
      };
    } catch (error) {
      const zoomError = createProviderError("ZOOM", error, "getMeetingRecords");
      return {
        success: false,
        error: zoomError.message,
        code: zoomError.code,
      };
    }
  }

  async getParticipants(
    meetingId: string,
    integrationAccountId: string
  ): Promise<ServiceResponse<MeetingParticipant[]>> {
    try {
      // Authenticate first
      const authResult = await this.authenticate(integrationAccountId);
      if (!authResult.success) {
        return authResult as ServiceResponse<MeetingParticipant[]>;
      }

      const client =
        await this.authProvider.getAuthenticatedClient(integrationAccountId);
      if (!client) {
        return {
          success: false,
          error: "Failed to get authenticated client",
          code: "AUTH_CLIENT_ERROR",
        };
      }

      // Get participants for the meeting
      const participantsResponse = await fetch(
        `https://api.zoom.us/v2/past_meetings/${meetingId}/participants`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
          },
        }
      );

      if (!participantsResponse.ok) {
        const errorData = await participantsResponse.json();
        throw new DataSyncError(
          "ZOOM",
          "participant",
          `Failed to get participants: ${errorData.message || "Unknown error"}`,
          undefined,
          participantsResponse.status
        );
      }

      const participantsData = await participantsResponse.json();
      const participants = participantsData.participants || [];

      // Convert Zoom participants to our MeetingParticipant format
      const meetingParticipants: MeetingParticipant[] = participants.map(
        (participant: any) => ({
          id: "", // Will be set by the database
          meetingRecordId: "", // Will be set by the calling service
          providerParticipantId: participant.id || participant.user_id,
          name: participant.name || participant.user_name,
          email: participant.user_email,
          role: this.mapZoomRoleToParticipantRole(participant.role),
          joinTime: new Date(participant.join_time),
          leaveTime: participant.leave_time
            ? new Date(participant.leave_time)
            : undefined,
          duration: participant.duration || 0,
          connectionCount: 1, // Zoom doesn't provide reconnection count directly
          providerData: participant,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );

      return {
        success: true,
        data: meetingParticipants,
      };
    } catch (error) {
      const zoomError = createProviderError("ZOOM", error, "getParticipants");
      return {
        success: false,
        error: zoomError.message,
        code: zoomError.code,
      };
    }
  }

  async getTranscripts(
    meetingId: string,
    integrationAccountId: string
  ): Promise<ServiceResponse<MeetingTranscriptEntry[]>> {
    try {
      // Note: Zoom API doesn't provide direct access to transcript text
      // Transcripts are typically available as downloadable files
      // This method would need to be implemented based on specific Zoom plan features

      console.warn(
        "Zoom transcript text retrieval requires additional implementation based on plan features"
      );

      return {
        success: true,
        data: [], // Return empty array for now
      };
    } catch (error) {
      const zoomError = createProviderError("ZOOM", error, "getTranscripts");
      return {
        success: false,
        error: zoomError.message,
        code: zoomError.code,
      };
    }
  }

  async getChatMessages(
    meetingId: string,
    integrationAccountId: string
  ): Promise<ServiceResponse<MeetingChatMessage[]>> {
    try {
      // Note: Zoom API doesn't provide direct access to chat messages
      // Chat messages are typically available as downloadable files
      // This method would need to be implemented based on specific requirements

      console.warn(
        "Zoom chat message retrieval requires additional implementation"
      );

      return {
        success: true,
        data: [], // Return empty array for now
      };
    } catch (error) {
      const zoomError = createProviderError("ZOOM", error, "getChatMessages");
      return {
        success: false,
        error: zoomError.message,
        code: zoomError.code,
      };
    }
  }

  async getRecordings(
    meetingId: string,
    integrationAccountId: string
  ): Promise<ServiceResponse<MeetingRecordingFile[]>> {
    try {
      // Authenticate first
      const authResult = await this.authenticate(integrationAccountId);
      if (!authResult.success) {
        return authResult as ServiceResponse<MeetingRecordingFile[]>;
      }

      const client =
        await this.authProvider.getAuthenticatedClient(integrationAccountId);
      if (!client) {
        return {
          success: false,
          error: "Failed to get authenticated client",
          code: "AUTH_CLIENT_ERROR",
        };
      }

      // Get recordings for the meeting
      const recordingsResponse = await fetch(
        `https://api.zoom.us/v2/meetings/${meetingId}/recordings`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
          },
        }
      );

      if (!recordingsResponse.ok) {
        const errorData = await recordingsResponse.json();
        throw new DataSyncError(
          "ZOOM",
          "recording",
          `Failed to get recordings: ${errorData.message || "Unknown error"}`,
          undefined,
          recordingsResponse.status
        );
      }

      const recordingsData = await recordingsResponse.json();
      const recordingFiles = recordingsData.recording_files || [];

      // Convert Zoom recordings to our MeetingRecordingFile format
      const meetingRecordingFiles: MeetingRecordingFile[] = recordingFiles.map(
        (recording: any) => ({
          id: "", // Will be set by the database
          meetingRecordId: "", // Will be set by the calling service
          fileName:
            recording.file_name ||
            `${recording.recording_type}.${recording.file_extension}`,
          fileType: this.mapZoomRecordingTypeToFileType(
            recording.recording_type
          ),
          fileSize: recording.file_size || 0,
          duration: Math.round(
            (new Date(recording.recording_end).getTime() -
              new Date(recording.recording_start).getTime()) /
              1000
          ),
          downloadUrl: recording.download_url,
          expiresAt: recording.download_url
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : undefined, // 30 days
          providerFileId: recording.id,
          providerData: recording,
          createdAt: new Date(recording.recording_start),
          updatedAt: new Date(),
        })
      );

      return {
        success: true,
        data: meetingRecordingFiles,
      };
    } catch (error) {
      const zoomError = createProviderError("ZOOM", error, "getRecordings");
      return {
        success: false,
        error: zoomError.message,
        code: zoomError.code,
      };
    }
  }

  // =============================================================================
  // Validation and Features
  // =============================================================================

  async validateConfig(
    config: ZoomVideoSpaceConfig
  ): Promise<ServiceResponse<boolean>> {
    try {
      const errors: string[] = [];

      // Validate required fields
      if (!config.topic || config.topic.length === 0) {
        errors.push("Topic is required");
      }

      if (config.topic && config.topic.length > 200) {
        errors.push("Topic must be 200 characters or less");
      }

      // Validate duration
      if (config.duration && (config.duration < 1 || config.duration > 1440)) {
        errors.push("Duration must be between 1 and 1440 minutes");
      }

      // Validate password
      if (config.password && !/^[a-zA-Z0-9]{1,10}$/.test(config.password)) {
        errors.push("Password must be 1-10 alphanumeric characters");
      }

      if (errors.length > 0) {
        return {
          success: false,
          error: errors.join(", "),
          code: "VALIDATION_ERROR",
        };
      }

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Validation error",
        code: "VALIDATION_ERROR",
      };
    }
  }

  getSupportedFeatures(): string[] {
    return [
      "recording",
      "transcription",
      "chat",
      "screenShare",
      "breakoutRooms",
      "polls",
      "waitingRoom",
      "authentication",
      "webinar",
      "registration",
      "analytics",
    ];
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private buildCreateMeetingRequest(
    config: ZoomVideoSpaceConfig
  ): CreateZoomMeetingRequest {
    return {
      topic: config.topic,
      config: config,
    };
  }

  private mapZoomRoleToParticipantRole(
    zoomRole: string
  ): "HOST" | "CO_HOST" | "PANELIST" | "ATTENDEE" {
    switch (zoomRole?.toLowerCase()) {
      case "host":
        return "HOST";
      case "co-host":
        return "CO_HOST";
      case "panelist":
        return "PANELIST";
      default:
        return "ATTENDEE";
    }
  }

  private mapZoomRecordingTypeToFileType(
    zoomType: string
  ): "VIDEO" | "AUDIO_ONLY" | "SCREEN_SHARE" | "CHAT" | "TRANSCRIPT" {
    switch (zoomType?.toLowerCase()) {
      case "shared_screen_with_speaker_view":
      case "shared_screen_with_gallery_view":
      case "gallery_view":
      case "speaker_view":
        return "VIDEO";
      case "audio_only":
        return "AUDIO_ONLY";
      case "shared_screen":
        return "SCREEN_SHARE";
      case "chat_file":
        return "CHAT";
      case "audio_transcript":
        return "TRANSCRIPT";
      default:
        return "VIDEO";
    }
  }
}
