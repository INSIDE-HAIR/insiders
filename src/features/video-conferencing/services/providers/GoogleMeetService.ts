/**
 * Google Meet Service - Provider Implementation
 * Handles Google Meet API v2 integration
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
  MeetVideoSpaceConfig,
  MeetSpaceResponse,
  CreateMeetSpaceRequest,
  UpdateMeetSpaceRequest,
  MeetServiceConfig,
} from "../../types/meet";

import type { IProviderService } from "../interfaces";
import { GoogleMeetAuthProvider } from "../auth/GoogleMeetAuthProvider";
import {
  VideoConferencingError,
  RoomCreationError,
  RoomNotFoundError,
  DataSyncError,
  createProviderError,
} from "../errors";

// =============================================================================
// Google Meet Service Implementation
// =============================================================================

export class GoogleMeetService
  implements IProviderService<MeetVideoSpaceConfig, MeetSpaceResponse>
{
  public readonly provider: VideoProvider = "MEET";

  constructor(
    private config: MeetServiceConfig,
    private authProvider: GoogleMeetAuthProvider
  ) {}

  // =============================================================================
  // Authentication
  // =============================================================================

  async authenticate(
    integrationAccountId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      // This will validate the stored tokens and refresh if needed
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
    config: MeetVideoSpaceConfig,
    integrationAccountId: string
  ): Promise<ServiceResponse<MeetSpaceResponse>> {
    try {
      // Authenticate first
      const authResult = await this.authenticate(integrationAccountId);
      if (!authResult.success) {
        return authResult as ServiceResponse<MeetSpaceResponse>;
      }

      // Get authenticated client
      const client =
        await this.authProvider.getAuthenticatedClient(integrationAccountId);
      if (!client) {
        return {
          success: false,
          error: "Failed to get authenticated client",
          code: "AUTH_CLIENT_ERROR",
        };
      }

      // Create Meet Space via API
      const spaceRequest = this.buildCreateSpaceRequest(config);

      // Call Google Meet API to create space
      const createSpaceResponse = await fetch(
        "https://meet.googleapis.com/v2/spaces",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            config: {
              accessType: config.accessType || "TRUSTED",
              entryPointAccess: config.entryPointAccess || "ALL",
            },
          }),
        }
      );

      if (!createSpaceResponse.ok) {
        const errorData = await createSpaceResponse.json();
        throw new RoomCreationError(
          "MEET",
          `Failed to create Meet space: ${errorData.error?.message || "Unknown error"}`,
          undefined,
          createSpaceResponse.status
        );
      }

      const spaceData = await createSpaceResponse.json();

      // Extract meeting code from meeting URI
      const meetingCode = spaceData.meetingUri?.split("/").pop() || "";

      const response: MeetSpaceResponse = {
        spaceId: spaceData.name,
        name: config.displayName || spaceData.name || "Meeting Space",
        meetingUri: spaceData.meetingUri,
        meetingCode: meetingCode,
        config: config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      const meetError = createProviderError("MEET", error, "createRoom");
      return {
        success: false,
        error: meetError.message,
        code: meetError.code,
      };
    }
  }

  async updateRoom(
    roomId: string,
    config: Partial<MeetVideoSpaceConfig>,
    integrationAccountId: string
  ): Promise<ServiceResponse<MeetSpaceResponse>> {
    try {
      // Authenticate first
      const authResult = await this.authenticate(integrationAccountId);
      if (!authResult.success) {
        return authResult as ServiceResponse<MeetSpaceResponse>;
      }

      // Get authenticated client
      const client =
        await this.authProvider.getAuthenticatedClient(integrationAccountId);
      if (!client) {
        return {
          success: false,
          error: "Failed to get authenticated client",
          code: "AUTH_CLIENT_ERROR",
        };
      }

      // Update Meet Space via API
      const updateSpaceResponse = await fetch(
        `https://meet.googleapis.com/v2/${roomId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            config: config,
          }),
        }
      );

      if (!updateSpaceResponse.ok) {
        const errorData = await updateSpaceResponse.json();
        throw new RoomCreationError(
          "MEET",
          `Failed to update Meet space: ${errorData.error?.message || "Unknown error"}`,
          undefined,
          updateSpaceResponse.status
        );
      }

      const spaceData = await updateSpaceResponse.json();

      // Extract meeting code from meeting URI
      const meetingCode = spaceData.meetingUri?.split("/").pop() || "";

      const response: MeetSpaceResponse = {
        spaceId: spaceData.name,
        name: config.displayName || spaceData.name || "Updated Meeting Space",
        meetingUri: spaceData.meetingUri,
        meetingCode: meetingCode,
        config: config as MeetVideoSpaceConfig,
        createdAt: spaceData.createTime || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      const meetError = createProviderError("MEET", error, "updateRoom");
      return {
        success: false,
        error: meetError.message,
        code: meetError.code,
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

      // TODO: Implement actual Google Meet API delete call
      // Note: Google Meet spaces may not support explicit deletion
      // They typically expire automatically

      return {
        success: true,
      };
    } catch (error) {
      const meetError = createProviderError("MEET", error, "deleteRoom");
      return {
        success: false,
        error: meetError.message,
        code: meetError.code,
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

      // Get space details to check status
      const spaceResponse = await fetch(
        `https://meet.googleapis.com/v2/${roomId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
          },
        }
      );

      if (!spaceResponse.ok) {
        if (spaceResponse.status === 404) {
          return {
            success: true,
            data: "EXPIRED",
          };
        }

        const errorData = await spaceResponse.json();
        throw new RoomNotFoundError(
          "MEET",
          roomId,
          new Error(errorData.error?.message || "Unknown error")
        );
      }

      const spaceData = await spaceResponse.json();

      // Check if there's an active conference
      let status: VideoSpaceStatus = "INACTIVE";

      try {
        const activeConferenceResponse = await fetch(
          `https://meet.googleapis.com/v2/${roomId}/activeConference`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${client.accessToken}`,
            },
          }
        );

        if (activeConferenceResponse.ok) {
          status = "ACTIVE";
        }
      } catch (error) {
        // If we can't get active conference, space is still valid but inactive
        status = "INACTIVE";
      }

      return {
        success: true,
        data: status,
      };
    } catch (error) {
      const meetError = createProviderError("MEET", error, "getRoomStatus");
      return {
        success: false,
        error: meetError.message,
        code: meetError.code,
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

      // Get conference records for the space
      const conferenceRecordsResponse = await fetch(
        `https://meet.googleapis.com/v2/${roomId}/conferenceRecords`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
          },
        }
      );

      if (!conferenceRecordsResponse.ok) {
        const errorData = await conferenceRecordsResponse.json();
        throw new DataSyncError(
          "MEET",
          "meeting",
          `Failed to get conference records: ${errorData.error?.message || "Unknown error"}`,
          undefined,
          conferenceRecordsResponse.status
        );
      }

      const conferenceData = await conferenceRecordsResponse.json();
      const conferenceRecords = conferenceData.conferenceRecords || [];

      // Convert Google Meet conference records to our MeetingRecord format
      const meetingRecords: MeetingRecord[] = conferenceRecords
        .filter((record: any) => {
          if (!dateRange) return true;
          const startTime = new Date(record.startTime);
          return startTime >= dateRange.start && startTime <= dateRange.end;
        })
        .map((record: any) => ({
          id: "", // Will be set by the database
          videoSpaceId: "", // Will be set by the calling service
          providerMeetingId: record.name,
          title: record.name || "Google Meet Conference",
          startTime: new Date(record.startTime),
          endTime: record.endTime ? new Date(record.endTime) : undefined,
          duration: record.endTime
            ? Math.round(
                (new Date(record.endTime).getTime() -
                  new Date(record.startTime).getTime()) /
                  60000
              )
            : undefined,
          status: record.endTime ? "ENDED" : "ACTIVE",
          totalParticipants: 0, // Will be populated separately
          maxConcurrentUsers: 0, // Will be populated separately
          providerData: record,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

      return {
        success: true,
        data: meetingRecords,
      };
    } catch (error) {
      const meetError = createProviderError("MEET", error, "getMeetingRecords");
      return {
        success: false,
        error: meetError.message,
        code: meetError.code,
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

      // Get participants for the conference record
      const participantsResponse = await fetch(
        `https://meet.googleapis.com/v2/${meetingId}/participants`,
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
          "MEET",
          "participant",
          `Failed to get participants: ${errorData.error?.message || "Unknown error"}`,
          undefined,
          participantsResponse.status
        );
      }

      const participantsData = await participantsResponse.json();
      const participants = participantsData.participants || [];

      // Convert Google Meet participants to our MeetingParticipant format
      const meetingParticipants: MeetingParticipant[] = participants.map(
        (participant: any) => ({
          id: "", // Will be set by the database
          meetingRecordId: "", // Will be set by the calling service
          providerParticipantId: participant.name,
          name:
            participant.signedinUser?.displayName ||
            participant.anonymousUser?.displayName ||
            "Unknown",
          email: participant.signedinUser?.user || undefined,
          role: participant.signedinUser?.user ? "ATTENDEE" : "ATTENDEE", // Google Meet doesn't distinguish roles in API
          joinTime: new Date(participant.earliestStartTime),
          leaveTime: participant.latestEndTime
            ? new Date(participant.latestEndTime)
            : undefined,
          duration: participant.latestEndTime
            ? Math.round(
                (new Date(participant.latestEndTime).getTime() -
                  new Date(participant.earliestStartTime).getTime()) /
                  60000
              )
            : 0,
          connectionCount: 1, // Google Meet doesn't provide this info directly
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
      const meetError = createProviderError("MEET", error, "getParticipants");
      return {
        success: false,
        error: meetError.message,
        code: meetError.code,
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

      // Get transcripts for the conference record
      const transcriptsResponse = await fetch(
        `https://meet.googleapis.com/v2/${meetingId}/transcripts`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
          },
        }
      );

      if (!transcriptsResponse.ok) {
        const errorData = await transcriptsResponse.json();
        throw new DataSyncError(
          "MEET",
          "transcript",
          `Failed to get transcripts: ${errorData.error?.message || "Unknown error"}`,
          undefined,
          transcriptsResponse.status
        );
      }

      const transcriptsData = await transcriptsResponse.json();
      const transcripts = transcriptsData.transcripts || [];

      // Get transcript entries for each transcript
      const allTranscriptEntries: MeetingTranscriptEntry[] = [];

      for (const transcript of transcripts) {
        try {
          const entriesResponse = await fetch(
            `https://meet.googleapis.com/v2/${transcript.name}/entries`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${client.accessToken}`,
              },
            }
          );

          if (entriesResponse.ok) {
            const entriesData = await entriesResponse.json();
            const entries = entriesData.transcriptEntries || [];

            const transcriptEntries: MeetingTranscriptEntry[] = entries.map(
              (entry: any) => ({
                id: "", // Will be set by the database
                meetingRecordId: "", // Will be set by the calling service
                participantId: undefined, // Google Meet doesn't provide participant mapping directly
                speakerName:
                  entry.participant?.signedinUser?.displayName ||
                  entry.participant?.anonymousUser?.displayName ||
                  "Unknown",
                text: entry.text,
                timestamp: new Date(entry.startTime),
                startTime: Math.round(
                  (new Date(entry.startTime).getTime() -
                    new Date(meetingId.split("/").pop()).getTime()) /
                    1000
                ),
                endTime: Math.round(
                  (new Date(entry.endTime).getTime() -
                    new Date(meetingId.split("/").pop()).getTime()) /
                    1000
                ),
                language: entry.languageCode || "en-US",
                confidence: undefined, // Google Meet doesn't provide confidence scores
                providerData: entry,
                createdAt: new Date(),
              })
            );

            allTranscriptEntries.push(...transcriptEntries);
          }
        } catch (error) {
          console.warn(
            `Failed to get entries for transcript ${transcript.name}:`,
            error
          );
        }
      }

      return {
        success: true,
        data: allTranscriptEntries,
      };
    } catch (error) {
      const meetError = createProviderError("MEET", error, "getTranscripts");
      return {
        success: false,
        error: meetError.message,
        code: meetError.code,
      };
    }
  }

  async getChatMessages(
    meetingId: string,
    integrationAccountId: string
  ): Promise<ServiceResponse<MeetingChatMessage[]>> {
    try {
      // Note: Google Meet API v2 doesn't currently provide chat message access
      // This is a limitation of the Google Meet API
      // Chat messages are not available through the API as of the current version

      console.warn(
        "Google Meet API does not currently support chat message retrieval"
      );

      return {
        success: true,
        data: [], // Return empty array since chat messages are not available
      };
    } catch (error) {
      const meetError = createProviderError("MEET", error, "getChatMessages");
      return {
        success: false,
        error: meetError.message,
        code: meetError.code,
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

      // Get recordings for the conference record
      const recordingsResponse = await fetch(
        `https://meet.googleapis.com/v2/${meetingId}/recordings`,
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
          "MEET",
          "recording",
          `Failed to get recordings: ${errorData.error?.message || "Unknown error"}`,
          undefined,
          recordingsResponse.status
        );
      }

      const recordingsData = await recordingsResponse.json();
      const recordings = recordingsData.recordings || [];

      // Convert Google Meet recordings to our MeetingRecordingFile format
      const recordingFiles: MeetingRecordingFile[] = recordings.map(
        (recording: any) => ({
          id: "", // Will be set by the database
          meetingRecordId: "", // Will be set by the calling service
          fileName: `${recording.name.split("/").pop()}.mp4`,
          fileType: "VIDEO" as const,
          fileSize: 0, // Google Meet doesn't provide file size in API
          duration: undefined, // Duration not provided directly
          downloadUrl: recording.driveDestination?.file || "",
          expiresAt: recording.driveDestination?.exportUri
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : undefined, // 30 days
          providerFileId: recording.driveDestination?.file || recording.name,
          providerData: recording,
          createdAt: new Date(recording.startTime),
          updatedAt: new Date(),
        })
      );

      return {
        success: true,
        data: recordingFiles,
      };
    } catch (error) {
      const meetError = createProviderError("MEET", error, "getRecordings");
      return {
        success: false,
        error: meetError.message,
        code: meetError.code,
      };
    }
  }

  // =============================================================================
  // Validation and Features
  // =============================================================================

  async validateConfig(
    config: MeetVideoSpaceConfig
  ): Promise<ServiceResponse<boolean>> {
    try {
      const errors: string[] = [];

      // Validate required fields
      if (config.displayName && config.displayName.length > 100) {
        errors.push("Display name must be 100 characters or less");
      }

      // Validate domain restrictions
      if (config.allowedDomains && config.allowedDomains.length > 10) {
        errors.push("Maximum 10 allowed domains");
      }

      // Validate participant limits
      if (
        config.maxParticipants &&
        (config.maxParticipants < 1 || config.maxParticipants > 500)
      ) {
        errors.push("Max participants must be between 1 and 500");
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
      "smartNotes",
      "captions",
      "breakoutRooms",
      "polls",
      "whiteboard",
      "reactions",
      "waitingRoom",
      "meetingLock",
      "endToEndEncryption",
      "attendanceReporting",
    ];
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private buildCreateSpaceRequest(
    config: MeetVideoSpaceConfig
  ): CreateMeetSpaceRequest {
    return {
      name: config.displayName || "Meeting Space",
      config: config,
    };
  }

  private buildUpdateSpaceRequest(
    config: Partial<MeetVideoSpaceConfig>
  ): UpdateMeetSpaceRequest {
    return {
      config: config,
    };
  }
}
