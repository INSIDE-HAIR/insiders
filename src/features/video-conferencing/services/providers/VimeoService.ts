/**
 * Vimeo Service - Provider Implementation
 * Handles Vimeo API v4 integration
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
  VimeoVideoSpaceConfig,
  VimeoVideoResponse,
  VimeoLiveEventResponse,
  CreateVimeoVideoRequest,
  CreateVimeoLiveEventRequest,
  UpdateVimeoVideoRequest,
  VimeoServiceConfig,
} from "../../types/vimeo";

import type { IProviderService } from "../interfaces";
import { VimeoAuthProvider } from "../auth/VimeoAuthProvider";
import {
  VideoConferencingError,
  RoomCreationError,
  RoomNotFoundError,
  DataSyncError,
  createProviderError,
} from "../errors";

// =============================================================================
// Vimeo Service Implementation
// =============================================================================

export class VimeoService
  implements
    IProviderService<
      VimeoVideoSpaceConfig,
      VimeoVideoResponse | VimeoLiveEventResponse
    >
{
  public readonly provider: VideoProvider = "VIMEO";

  constructor(
    private config: VimeoServiceConfig,
    private authProvider: VimeoAuthProvider
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
      // Vimeo tokens are long-lived, so we just validate them
      const refreshed =
        await this.authProvider.refreshTokens(integrationAccountId);

      return {
        success: refreshed,
        data: refreshed,
        error: refreshed ? undefined : "Token validation failed",
        code: refreshed ? undefined : "REFRESH_FAILED",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Token validation error",
        code: "REFRESH_ERROR",
      };
    }
  }

  // =============================================================================
  // Room Management
  // =============================================================================

  async createRoom(
    config: VimeoVideoSpaceConfig,
    integrationAccountId: string
  ): Promise<ServiceResponse<VimeoVideoResponse | VimeoLiveEventResponse>> {
    try {
      // Authenticate first
      const authResult = await this.authenticate(integrationAccountId);
      if (!authResult.success) {
        return authResult as ServiceResponse<
          VimeoVideoResponse | VimeoLiveEventResponse
        >;
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

      // Check if this is a live event or regular video
      if (config.liveEvent) {
        return this.createLiveEvent(config, client.accessToken);
      } else {
        return this.createVideo(config, client.accessToken);
      }
    } catch (error) {
      const vimeoError = createProviderError("VIMEO", error, "createRoom");
      return {
        success: false,
        error: vimeoError.message,
        code: vimeoError.code,
      };
    }
  }

  private async createVideo(
    config: VimeoVideoSpaceConfig,
    accessToken: string
  ): Promise<ServiceResponse<VimeoVideoResponse>> {
    try {
      // Create video via Vimeo API
      const createVideoResponse = await fetch(
        "https://api.vimeo.com/me/videos",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: config.title,
            description: config.description,
            privacy: config.privacy,
            password: config.password,
            embed: config.embed,
            spatial: config.spatial,
            content_rating: config.contentRating,
            license: config.license,
            locale: config.language,
          }),
        }
      );

      if (!createVideoResponse.ok) {
        const errorData = await createVideoResponse.json();
        throw new RoomCreationError(
          "VIMEO",
          `Failed to create Vimeo video: ${errorData.error || "Unknown error"}`,
          undefined,
          createVideoResponse.status
        );
      }

      const videoData = await createVideoResponse.json();

      const response: VimeoVideoResponse = {
        videoId: videoData.uri.split("/").pop(),
        uri: videoData.uri,
        name: videoData.name,
        description: videoData.description,
        link: videoData.link,
        playerEmbedUrl: videoData.player_embed_url,
        duration: videoData.duration || 0,
        width: videoData.width || 0,
        height: videoData.height || 0,
        status: videoData.status,
        privacy: videoData.privacy,
        createdTime: videoData.created_time,
        modifiedTime: videoData.modified_time,
        upload: videoData.upload,
      };

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      throw error;
    }
  }

  private async createLiveEvent(
    config: VimeoVideoSpaceConfig,
    accessToken: string
  ): Promise<ServiceResponse<VimeoLiveEventResponse>> {
    try {
      // Create live event via Vimeo API
      const createLiveEventResponse = await fetch(
        "https://api.vimeo.com/me/live_events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: config.liveEvent!.title,
            description: config.liveEvent!.description,
            auto_record: config.liveEvent!.autoRecord,
            dvr: config.liveEvent!.dvr,
            low_latency: config.liveEvent!.lowLatency,
            chat: config.liveEvent!.chat,
            schedule: config.liveEvent!.schedule,
            interaction_tools: config.liveEvent!.interactionTools,
          }),
        }
      );

      if (!createLiveEventResponse.ok) {
        const errorData = await createLiveEventResponse.json();
        throw new RoomCreationError(
          "VIMEO",
          `Failed to create Vimeo live event: ${errorData.error || "Unknown error"}`,
          undefined,
          createLiveEventResponse.status
        );
      }

      const liveEventData = await createLiveEventResponse.json();

      const response: VimeoLiveEventResponse = {
        eventId: liveEventData.uri.split("/").pop(),
        uri: liveEventData.uri,
        title: liveEventData.title,
        description: liveEventData.description,
        link: liveEventData.link,
        embedUrl: liveEventData.embed_url,
        status: liveEventData.status,
        scheduledStartTime: liveEventData.scheduled_start_time,
        scheduledEndTime: liveEventData.scheduled_end_time,
        actualStartTime: liveEventData.actual_start_time,
        actualEndTime: liveEventData.actual_end_time,
        streamKey: liveEventData.stream_key,
        streamUrl: liveEventData.stream_url,
        settings: liveEventData,
      };

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateRoom(
    roomId: string,
    config: Partial<VimeoVideoSpaceConfig>,
    integrationAccountId: string
  ): Promise<ServiceResponse<VimeoVideoResponse | VimeoLiveEventResponse>> {
    try {
      // Authenticate first
      const authResult = await this.authenticate(integrationAccountId);
      if (!authResult.success) {
        return authResult as ServiceResponse<
          VimeoVideoResponse | VimeoLiveEventResponse
        >;
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

      // Update video/live event via Vimeo API
      const updateResponse = await fetch(
        `https://api.vimeo.com/videos/${roomId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: config.title,
            description: config.description,
            privacy: config.privacy,
            password: config.password,
            embed: config.embed,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new RoomCreationError(
          "VIMEO",
          `Failed to update Vimeo video: ${errorData.error || "Unknown error"}`,
          undefined,
          updateResponse.status
        );
      }

      const videoData = await updateResponse.json();

      const response: VimeoVideoResponse = {
        videoId: videoData.uri.split("/").pop(),
        uri: videoData.uri,
        name: videoData.name,
        description: videoData.description,
        link: videoData.link,
        playerEmbedUrl: videoData.player_embed_url,
        duration: videoData.duration || 0,
        width: videoData.width || 0,
        height: videoData.height || 0,
        status: videoData.status,
        privacy: videoData.privacy,
        createdTime: videoData.created_time,
        modifiedTime: videoData.modified_time,
      };

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      const vimeoError = createProviderError("VIMEO", error, "updateRoom");
      return {
        success: false,
        error: vimeoError.message,
        code: vimeoError.code,
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

      // Delete video via Vimeo API
      const deleteResponse = await fetch(
        `https://api.vimeo.com/videos/${roomId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
          },
        }
      );

      if (!deleteResponse.ok && deleteResponse.status !== 404) {
        const errorData = await deleteResponse.json();
        throw new VideoConferencingError(
          `Failed to delete Vimeo video: ${errorData.error || "Unknown error"}`,
          "DELETE_ERROR",
          "VIMEO"
        );
      }

      return {
        success: true,
      };
    } catch (error) {
      const vimeoError = createProviderError("VIMEO", error, "deleteRoom");
      return {
        success: false,
        error: vimeoError.message,
        code: vimeoError.code,
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

      // Get video details to check status
      const videoResponse = await fetch(
        `https://api.vimeo.com/videos/${roomId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
          },
        }
      );

      if (!videoResponse.ok) {
        if (videoResponse.status === 404) {
          return {
            success: true,
            data: "EXPIRED",
          };
        }

        const errorData = await videoResponse.json();
        throw new RoomNotFoundError(
          "VIMEO",
          roomId,
          new Error(errorData.error || "Unknown error")
        );
      }

      const videoData = await videoResponse.json();

      // Map Vimeo status to our VideoSpaceStatus
      let status: VideoSpaceStatus;
      switch (videoData.status) {
        case "available":
          status = "ACTIVE";
          break;
        case "uploading":
        case "transcoding":
        case "transcode_starting":
          status = "INACTIVE";
          break;
        case "quota_exceeded":
        case "total_cap_exceeded":
        case "transcoding_error":
        case "uploading_error":
        case "unavailable":
          status = "DISABLED";
          break;
        default:
          status = "ACTIVE";
      }

      return {
        success: true,
        data: status,
      };
    } catch (error) {
      const vimeoError = createProviderError("VIMEO", error, "getRoomStatus");
      return {
        success: false,
        error: vimeoError.message,
        code: vimeoError.code,
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

      // Get video details
      const videoResponse = await fetch(
        `https://api.vimeo.com/videos/${roomId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
          },
        }
      );

      if (!videoResponse.ok) {
        const errorData = await videoResponse.json();
        throw new DataSyncError(
          "VIMEO",
          "meeting",
          `Failed to get video details: ${errorData.error || "Unknown error"}`,
          undefined,
          videoResponse.status
        );
      }

      const videoData = await videoResponse.json();

      // For Vimeo, we treat each video as a "meeting record"
      // Filter by date range if provided
      const createdTime = new Date(videoData.created_time);
      if (
        dateRange &&
        (createdTime < dateRange.start || createdTime > dateRange.end)
      ) {
        return {
          success: true,
          data: [],
        };
      }

      const meetingRecord: MeetingRecord = {
        id: "", // Will be set by the database
        videoSpaceId: "", // Will be set by the calling service
        providerMeetingId: videoData.uri,
        title: videoData.name || "Vimeo Video",
        startTime: new Date(videoData.created_time),
        endTime: videoData.modified_time
          ? new Date(videoData.modified_time)
          : undefined,
        duration: videoData.duration
          ? Math.round(videoData.duration / 60)
          : undefined, // Convert seconds to minutes
        status: videoData.status === "available" ? "ENDED" : "ACTIVE",
        totalParticipants: 0, // Vimeo doesn't track participants in the same way
        maxConcurrentUsers: 0, // Vimeo doesn't provide this data
        providerData: videoData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return {
        success: true,
        data: [meetingRecord],
      };
    } catch (error) {
      const vimeoError = createProviderError(
        "VIMEO",
        error,
        "getMeetingRecords"
      );
      return {
        success: false,
        error: vimeoError.message,
        code: vimeoError.code,
      };
    }
  }

  async getParticipants(
    meetingId: string,
    integrationAccountId: string
  ): Promise<ServiceResponse<MeetingParticipant[]>> {
    try {
      // Note: Vimeo doesn't have traditional "participants" like Meet/Zoom
      // Instead, we could potentially get viewer analytics data
      // This would require additional implementation based on specific requirements

      console.warn(
        "Vimeo does not provide traditional participant data - consider using analytics data instead"
      );

      return {
        success: true,
        data: [], // Return empty array for now
      };
    } catch (error) {
      const vimeoError = createProviderError("VIMEO", error, "getParticipants");
      return {
        success: false,
        error: vimeoError.message,
        code: vimeoError.code,
      };
    }
  }

  async getTranscripts(
    meetingId: string,
    integrationAccountId: string
  ): Promise<ServiceResponse<MeetingTranscriptEntry[]>> {
    try {
      // Authenticate first
      const authResult = await this.authenticate(integrationAccountId);
      if (!authResult.success) {
        return authResult as ServiceResponse<MeetingTranscriptEntry[]>;
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

      // Get text tracks (captions/subtitles) for the video
      const textTracksResponse = await fetch(
        `https://api.vimeo.com/videos/${meetingId}/texttracks`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
          },
        }
      );

      if (!textTracksResponse.ok) {
        const errorData = await textTracksResponse.json();
        throw new DataSyncError(
          "VIMEO",
          "transcript",
          `Failed to get text tracks: ${errorData.error || "Unknown error"}`,
          undefined,
          textTracksResponse.status
        );
      }

      const textTracksData = await textTracksResponse.json();
      const textTracks = textTracksData.data || [];

      // Convert text tracks to transcript entries
      // Note: This is a simplified implementation - actual transcript parsing would be more complex
      const transcriptEntries: MeetingTranscriptEntry[] = [];

      for (const track of textTracks) {
        if (track.type === "captions" || track.type === "subtitles") {
          // In a real implementation, you would fetch and parse the actual caption file
          // For now, we create a placeholder entry
          transcriptEntries.push({
            id: "", // Will be set by the database
            meetingRecordId: "", // Will be set by the calling service
            participantId: undefined,
            speakerName: "Speaker",
            text: `Caption track: ${track.name}`,
            timestamp: new Date(),
            startTime: 0,
            endTime: 0,
            language: track.language,
            confidence: undefined,
            providerData: track,
            createdAt: new Date(),
          });
        }
      }

      return {
        success: true,
        data: transcriptEntries,
      };
    } catch (error) {
      const vimeoError = createProviderError("VIMEO", error, "getTranscripts");
      return {
        success: false,
        error: vimeoError.message,
        code: vimeoError.code,
      };
    }
  }

  async getChatMessages(
    meetingId: string,
    integrationAccountId: string
  ): Promise<ServiceResponse<MeetingChatMessage[]>> {
    try {
      // Note: Vimeo doesn't have traditional chat messages like Meet/Zoom
      // Comments could be considered similar, but they're not real-time chat

      console.warn(
        "Vimeo does not provide traditional chat messages - consider using comments instead"
      );

      return {
        success: true,
        data: [], // Return empty array for now
      };
    } catch (error) {
      const vimeoError = createProviderError("VIMEO", error, "getChatMessages");
      return {
        success: false,
        error: vimeoError.message,
        code: vimeoError.code,
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

      // Get video details and files
      const videoResponse = await fetch(
        `https://api.vimeo.com/videos/${meetingId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
          },
        }
      );

      if (!videoResponse.ok) {
        const errorData = await videoResponse.json();
        throw new DataSyncError(
          "VIMEO",
          "recording",
          `Failed to get video details: ${errorData.error || "Unknown error"}`,
          undefined,
          videoResponse.status
        );
      }

      const videoData = await videoResponse.json();

      // For Vimeo, the video itself is the "recording"
      const recordingFile: MeetingRecordingFile = {
        id: "", // Will be set by the database
        meetingRecordId: "", // Will be set by the calling service
        fileName: `${videoData.name || "vimeo-video"}.mp4`,
        fileType: "VIDEO",
        fileSize: videoData.size || 0,
        duration: videoData.duration || 0,
        downloadUrl: videoData.download?.[0]?.link || videoData.link,
        expiresAt: undefined, // Vimeo videos don't typically expire
        providerFileId: videoData.uri,
        providerData: videoData,
        createdAt: new Date(videoData.created_time),
        updatedAt: new Date(videoData.modified_time),
      };

      return {
        success: true,
        data: [recordingFile],
      };
    } catch (error) {
      const vimeoError = createProviderError("VIMEO", error, "getRecordings");
      return {
        success: false,
        error: vimeoError.message,
        code: vimeoError.code,
      };
    }
  }

  // =============================================================================
  // Validation and Features
  // =============================================================================

  async validateConfig(
    config: VimeoVideoSpaceConfig
  ): Promise<ServiceResponse<boolean>> {
    try {
      const errors: string[] = [];

      // Validate required fields
      if (!config.title || config.title.length === 0) {
        errors.push("Title is required");
      }

      if (config.title && config.title.length > 128) {
        errors.push("Title must be 128 characters or less");
      }

      // Validate description
      if (config.description && config.description.length > 5000) {
        errors.push("Description must be 5000 characters or less");
      }

      // Validate password
      if (
        config.password &&
        (config.password.length < 1 || config.password.length > 32)
      ) {
        errors.push("Password must be between 1 and 32 characters");
      }

      // Validate privacy settings
      if (
        config.privacy &&
        !["anybody", "embed_only", "nobody", "password", "unlisted"].includes(
          config.privacy.view
        )
      ) {
        errors.push("Invalid privacy view setting");
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
      "liveStreaming",
      "analytics",
      "customPlayer",
      "privacy",
      "embedding",
      "captions",
      "chapters",
      "teamCollaboration",
      "videoManagement",
    ];
  }
}
