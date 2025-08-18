/**
 * Video Conferencing Validation Tests
 * Tests for Zod validation schemas
 */

import { describe, it, expect } from "vitest";
import {
  CreateVideoSpaceRequestSchema,
  UpdateVideoSpaceRequestSchema,
  VideoSpaceResponseSchema,
  MeetingRecordSchema,
  MeetingParticipantSchema,
  IntegrationAccountSchema,
  LinkAliasSchema,
  VideoConferencingKPISchema,
  // Provider-specific schemas
  GoogleMeetVideoSpaceConfigSchema,
  ZoomVideoSpaceConfigSchema,
  VimeoVideoSpaceConfigSchema,
  // Response schemas
  MeetSpaceResponseSchema,
  ZoomMeetingResponseSchema,
  VimeoVideoResponseSchema,
} from "../index";

describe("Video Conferencing Validation Schemas", () => {
  describe("CreateVideoSpaceRequestSchema", () => {
    it("should validate valid create request", () => {
      const validRequest = {
        name: "Test Meeting Room",
        description: "A test meeting room",
        provider: "ZOOM",
        config: {
          topic: "Test Meeting",
          duration: 60,
          startTime: "2024-01-01T10:00:00Z",
        },
        integrationAccountId: "507f1f77bcf86cd799439011",
        cohort: "Test Cohort",
        tags: ["test", "meeting"],
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it("should reject invalid provider", () => {
      const invalidRequest = {
        name: "Test Meeting Room",
        provider: "INVALID_PROVIDER",
        config: {},
        integrationAccountId: "507f1f77bcf86cd799439011",
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("should reject missing required fields", () => {
      const invalidRequest = {
        description: "Missing name and provider",
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("should validate with minimal required fields", () => {
      const minimalRequest = {
        name: "Minimal Room",
        provider: "MEET",
        config: {},
        integrationAccountId: "507f1f77bcf86cd799439011",
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(minimalRequest);
      expect(result.success).toBe(true);
    });
  });

  describe("UpdateVideoSpaceRequestSchema", () => {
    it("should validate partial update", () => {
      const updateRequest = {
        name: "Updated Room Name",
        description: "Updated description",
      };

      const result = UpdateVideoSpaceRequestSchema.safeParse(updateRequest);
      expect(result.success).toBe(true);
    });

    it("should validate empty update", () => {
      const emptyUpdate = {};

      const result = UpdateVideoSpaceRequestSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const invalidUpdate = {
        status: "INVALID_STATUS",
      };

      const result = UpdateVideoSpaceRequestSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe("VideoSpaceResponseSchema", () => {
    it("should validate complete video space response", () => {
      const videoSpaceResponse = {
        id: "507f1f77bcf86cd799439011",
        name: "Test Room",
        description: "Test Description",
        provider: "ZOOM",
        status: "ACTIVE",
        providerRoomId: "123456789",
        providerJoinUri: "https://zoom.us/j/123456789",
        providerData: { meetingId: 123456789 },
        settings: { autoRecord: true },
        ownerId: "507f1f77bcf86cd799439012",
        cohort: "Test Cohort",
        tags: ["test"],
        addedToCalendar: false,
        calendarEventId: null,
        integrationAccountId: "507f1f77bcf86cd799439013",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        lastActiveAt: "2024-01-01T00:00:00Z",
      };

      const result = VideoSpaceResponseSchema.safeParse(videoSpaceResponse);
      expect(result.success).toBe(true);
    });

    it("should validate with null optional fields", () => {
      const videoSpaceResponse = {
        id: "507f1f77bcf86cd799439011",
        name: "Test Room",
        description: null,
        provider: "MEET",
        status: "ACTIVE",
        providerRoomId: "spaces/abc123",
        providerJoinUri: "https://meet.google.com/abc-def-ghi",
        providerData: null,
        settings: null,
        ownerId: "507f1f77bcf86cd799439012",
        cohort: null,
        tags: [],
        addedToCalendar: false,
        calendarEventId: null,
        integrationAccountId: "507f1f77bcf86cd799439013",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        lastActiveAt: null,
      };

      const result = VideoSpaceResponseSchema.safeParse(videoSpaceResponse);
      expect(result.success).toBe(true);
    });
  });

  describe("MeetingRecordSchema", () => {
    it("should validate complete meeting record", () => {
      const meetingRecord = {
        id: "507f1f77bcf86cd799439011",
        videoSpaceId: "507f1f77bcf86cd799439012",
        providerMeetingId: "meeting_123",
        title: "Test Meeting",
        startTime: "2024-01-01T10:00:00Z",
        endTime: "2024-01-01T11:00:00Z",
        duration: 60,
        status: "ENDED",
        totalParticipants: 5,
        maxConcurrentUsers: 4,
        providerData: { uuid: "uuid_123" },
        createdAt: "2024-01-01T10:00:00Z",
        updatedAt: "2024-01-01T11:00:00Z",
      };

      const result = MeetingRecordSchema.safeParse(meetingRecord);
      expect(result.success).toBe(true);
    });

    it("should validate ongoing meeting", () => {
      const ongoingMeeting = {
        id: "507f1f77bcf86cd799439011",
        videoSpaceId: "507f1f77bcf86cd799439012",
        providerMeetingId: "meeting_123",
        title: "Ongoing Meeting",
        startTime: "2024-01-01T10:00:00Z",
        endTime: null,
        duration: null,
        status: "ACTIVE",
        totalParticipants: 3,
        maxConcurrentUsers: 3,
        providerData: null,
        createdAt: "2024-01-01T10:00:00Z",
        updatedAt: "2024-01-01T10:30:00Z",
      };

      const result = MeetingRecordSchema.safeParse(ongoingMeeting);
      expect(result.success).toBe(true);
    });
  });

  describe("MeetingParticipantSchema", () => {
    it("should validate participant with complete data", () => {
      const participant = {
        id: "507f1f77bcf86cd799439011",
        meetingRecordId: "507f1f77bcf86cd799439012",
        providerParticipantId: "participant_123",
        name: "John Doe",
        email: "john@example.com",
        role: "ATTENDEE",
        joinTime: "2024-01-01T10:05:00Z",
        leaveTime: "2024-01-01T10:55:00Z",
        duration: 50,
        connectionCount: 1,
        providerData: { device: "desktop" },
        createdAt: "2024-01-01T10:05:00Z",
        updatedAt: "2024-01-01T10:55:00Z",
      };

      const result = MeetingParticipantSchema.safeParse(participant);
      expect(result.success).toBe(true);
    });

    it("should validate participant still in meeting", () => {
      const activeParticipant = {
        id: "507f1f77bcf86cd799439011",
        meetingRecordId: "507f1f77bcf86cd799439012",
        providerParticipantId: "participant_123",
        name: "Jane Doe",
        email: null,
        role: "HOST",
        joinTime: "2024-01-01T10:00:00Z",
        leaveTime: null,
        duration: 0,
        connectionCount: 1,
        providerData: null,
        createdAt: "2024-01-01T10:00:00Z",
        updatedAt: "2024-01-01T10:30:00Z",
      };

      const result = MeetingParticipantSchema.safeParse(activeParticipant);
      expect(result.success).toBe(true);
    });
  });

  describe("IntegrationAccountSchema", () => {
    it("should validate integration account", () => {
      const integrationAccount = {
        id: "507f1f77bcf86cd799439011",
        provider: "ZOOM",
        accountName: "Zoom Account",
        accountEmail: "user@example.com",
        accessToken: "encrypted_token",
        refreshToken: "encrypted_refresh_token",
        tokenExpiry: "2024-01-01T12:00:00Z",
        scopes: ["meeting:write", "meeting:read"],
        status: "ACTIVE",
        lastSyncAt: "2024-01-01T10:00:00Z",
        userId: "507f1f77bcf86cd799439012",
        webhookConfig: { enabled: true },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T10:00:00Z",
      };

      const result = IntegrationAccountSchema.safeParse(integrationAccount);
      expect(result.success).toBe(true);
    });

    it("should validate account without refresh token (Vimeo)", () => {
      const vimeoAccount = {
        id: "507f1f77bcf86cd799439011",
        provider: "VIMEO",
        accountName: "Vimeo Account",
        accountEmail: "user@example.com",
        accessToken: "encrypted_token",
        refreshToken: null,
        tokenExpiry: null,
        scopes: ["create", "edit"],
        status: "ACTIVE",
        lastSyncAt: null,
        userId: "507f1f77bcf86cd799439012",
        webhookConfig: null,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const result = IntegrationAccountSchema.safeParse(vimeoAccount);
      expect(result.success).toBe(true);
    });
  });

  describe("Provider-specific Config Schemas", () => {
    describe("GoogleMeetVideoSpaceConfigSchema", () => {
      it("should validate minimal Google Meet config", () => {
        const config = {
          displayName: "Test Meeting",
        };

        const result = GoogleMeetVideoSpaceConfigSchema.safeParse(config);
        expect(result.success).toBe(true);
      });

      it("should validate complete Google Meet config", () => {
        const config = {
          displayName: "Test Meeting",
          entryPointAccess: "ALL",
          accessType: "TRUSTED",
        };

        const result = GoogleMeetVideoSpaceConfigSchema.safeParse(config);
        expect(result.success).toBe(true);
      });
    });

    describe("ZoomVideoSpaceConfigSchema", () => {
      it("should validate minimal Zoom config", () => {
        const config = {
          topic: "Test Meeting",
        };

        const result = ZoomVideoSpaceConfigSchema.safeParse(config);
        expect(result.success).toBe(true);
      });

      it("should validate complete Zoom config", () => {
        const config = {
          topic: "Test Meeting",
          type: "2",
          startTime: "2024-01-01T10:00:00Z",
          duration: 60,
          timezone: "UTC",
          password: "test123",
          agenda: "Meeting agenda",
          hostVideo: true,
          participantVideo: true,
          joinBeforeHost: false,
          muteOnEntry: true,
          waitingRoom: true,
          autoRecording: "cloud",
        };

        const result = ZoomVideoSpaceConfigSchema.safeParse(config);
        expect(result.success).toBe(true);
      });

      it("should reject invalid password", () => {
        const config = {
          topic: "Test Meeting",
          password: "invalid-password-with-special-chars!",
        };

        const result = ZoomVideoSpaceConfigSchema.safeParse(config);
        expect(result.success).toBe(false);
      });
    });

    describe("VimeoVideoSpaceConfigSchema", () => {
      it("should validate minimal Vimeo config", () => {
        const config = {
          title: "Test Video",
        };

        const result = VimeoVideoSpaceConfigSchema.safeParse(config);
        expect(result.success).toBe(true);
      });

      it("should validate complete Vimeo config", () => {
        const config = {
          title: "Test Video",
          description: "Test video description",
          privacy: {
            view: "anybody",
            embed: "public",
          },
          password: "test123",
          embed: {
            buttons: {
              like: true,
              watchlater: true,
              share: true,
            },
          },
          spatial: false,
          contentRating: ["safe"],
          license: "by",
          language: "en-US",
        };

        const result = VimeoVideoSpaceConfigSchema.safeParse(config);
        expect(result.success).toBe(true);
      });

      it("should validate live event config", () => {
        const config = {
          title: "Test Live Event",
          liveEvent: {
            title: "Live Event Title",
            description: "Live event description",
            autoRecord: true,
            dvr: true,
            lowLatency: false,
            chat: {
              enabled: true,
            },
            schedule: {
              startTime: "2024-01-01T10:00:00Z",
              endTime: "2024-01-01T11:00:00Z",
            },
          },
        };

        const result = VimeoVideoSpaceConfigSchema.safeParse(config);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Provider Response Schemas", () => {
    describe("MeetSpaceResponseSchema", () => {
      it("should validate Google Meet space response", () => {
        const response = {
          spaceId: "spaces/abc123",
          name: "Test Space",
          meetingUri: "https://meet.google.com/abc-def-ghi",
          meetingCode: "abc-def-ghi",
          config: {
            displayName: "Test Meeting",
          },
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        };

        const result = MeetSpaceResponseSchema.safeParse(response);
        expect(result.success).toBe(true);
      });
    });

    describe("ZoomMeetingResponseSchema", () => {
      it("should validate Zoom meeting response", () => {
        const response = {
          meetingId: 123456789,
          uuid: "uuid_123",
          hostId: "host_123",
          hostEmail: "host@example.com",
          topic: "Test Meeting",
          type: "2",
          status: "waiting",
          startTime: "2024-01-01T10:00:00Z",
          duration: 60,
          timezone: "UTC",
          password: "test123",
          joinUrl: "https://zoom.us/j/123456789",
          startUrl: "https://zoom.us/s/123456789",
          createdAt: "2024-01-01T00:00:00Z",
          settings: {
            topic: "Test Meeting",
          },
        };

        const result = ZoomMeetingResponseSchema.safeParse(response);
        expect(result.success).toBe(true);
      });
    });

    describe("VimeoVideoResponseSchema", () => {
      it("should validate Vimeo video response", () => {
        const response = {
          videoId: "123456789",
          uri: "/videos/123456789",
          name: "Test Video",
          description: "Test description",
          link: "https://vimeo.com/123456789",
          playerEmbedUrl: "https://player.vimeo.com/video/123456789",
          duration: 3600,
          width: 1920,
          height: 1080,
          status: "available",
          privacy: {
            view: "anybody",
          },
          createdTime: "2024-01-01T00:00:00Z",
          modifiedTime: "2024-01-01T00:00:00Z",
          upload: {
            status: "complete",
          },
        };

        const result = VimeoVideoResponseSchema.safeParse(response);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("LinkAliasSchema", () => {
    it("should validate link alias", () => {
      const linkAlias = {
        id: "507f1f77bcf86cd799439011",
        alias: "team-standup",
        videoSpaceId: "507f1f77bcf86cd799439012",
        isActive: true,
        accessCount: 25,
        lastAccessedAt: "2024-01-01T10:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T10:00:00Z",
      };

      const result = LinkAliasSchema.safeParse(linkAlias);
      expect(result.success).toBe(true);
    });

    it("should validate alias with null lastAccessedAt", () => {
      const linkAlias = {
        id: "507f1f77bcf86cd799439011",
        alias: "new-alias",
        videoSpaceId: "507f1f77bcf86cd799439012",
        isActive: true,
        accessCount: 0,
        lastAccessedAt: null,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const result = LinkAliasSchema.safeParse(linkAlias);
      expect(result.success).toBe(true);
    });
  });

  describe("VideoConferencingKPISchema", () => {
    it("should validate complete KPI record", () => {
      const kpi = {
        id: "507f1f77bcf86cd799439011",
        calculatedAt: "2024-01-01T00:00:00Z",
        lastUpdatedAt: "2024-01-01T00:00:00Z",
        periodStart: "2024-01-01T00:00:00Z",
        periodEnd: "2024-01-07T23:59:59Z",
        provider: "ZOOM",
        ownerId: "507f1f77bcf86cd799439012",
        cohort: "Test Cohort",
        totalMeetings: 10,
        activeMeetings: 2,
        completedMeetings: 8,
        cancelledMeetings: 0,
        totalUniqueParticipants: 25,
        averageParticipantsPerMeeting: 5.5,
        totalParticipantMinutes: 1200,
        totalMeetingHours: 20.5,
        averageMeetingDuration: 75.5,
        providerBreakdown: {
          ZOOM: { meetingCount: 10, participantCount: 25 },
        },
        statusStats: {
          COMPLETED: 8,
          ACTIVE: 2,
          CANCELLED: 0,
        },
        engagementStats: {
          averageEngagement: 85,
          dropOffRate: 15,
        },
        dailyMeetingStats: {
          monday: 2,
          tuesday: 1,
          wednesday: 3,
          thursday: 2,
          friday: 2,
          saturday: 0,
          sunday: 0,
        },
        hourlyDistribution: {
          "09": 2,
          "10": 3,
          "14": 3,
          "15": 2,
        },
        featureUsageStats: {
          recording: 8,
          transcription: 5,
          screenShare: 6,
        },
        qualityMetrics: {
          averageConnectionQuality: 4.2,
          technicalIssues: 1,
        },
        version: 1,
        generatedBy: "507f1f77bcf86cd799439013",
        includeAllProviders: false,
      };

      const result = VideoConferencingKPISchema.safeParse(kpi);
      expect(result.success).toBe(true);
    });

    it("should validate KPI with null optional fields", () => {
      const kpi = {
        id: "507f1f77bcf86cd799439011",
        calculatedAt: "2024-01-01T00:00:00Z",
        lastUpdatedAt: "2024-01-01T00:00:00Z",
        periodStart: "2024-01-01T00:00:00Z",
        periodEnd: "2024-01-07T23:59:59Z",
        provider: null,
        ownerId: null,
        cohort: null,
        totalMeetings: 15,
        activeMeetings: 3,
        completedMeetings: 12,
        cancelledMeetings: 0,
        totalUniqueParticipants: 40,
        averageParticipantsPerMeeting: 6.2,
        totalParticipantMinutes: 1800,
        totalMeetingHours: 30.0,
        averageMeetingDuration: 80.0,
        providerBreakdown: {
          MEET: { meetingCount: 5, participantCount: 15 },
          ZOOM: { meetingCount: 7, participantCount: 20 },
          VIMEO: { meetingCount: 3, participantCount: 5 },
        },
        statusStats: {
          COMPLETED: 12,
          ACTIVE: 3,
        },
        engagementStats: {
          averageEngagement: 90,
        },
        dailyMeetingStats: {},
        hourlyDistribution: {},
        featureUsageStats: {},
        qualityMetrics: null,
        version: 1,
        generatedBy: null,
        includeAllProviders: true,
      };

      const result = VideoConferencingKPISchema.safeParse(kpi);
      expect(result.success).toBe(true);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should reject invalid ObjectId format", () => {
      const invalidRequest = {
        name: "Test Room",
        provider: "ZOOM",
        config: {},
        integrationAccountId: "invalid-object-id",
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("should reject invalid email format", () => {
      const invalidParticipant = {
        id: "507f1f77bcf86cd799439011",
        meetingRecordId: "507f1f77bcf86cd799439012",
        providerParticipantId: "participant_123",
        name: "John Doe",
        email: "invalid-email",
        role: "ATTENDEE",
        joinTime: "2024-01-01T10:05:00Z",
        leaveTime: null,
        duration: 0,
        connectionCount: 1,
        providerData: null,
        createdAt: "2024-01-01T10:05:00Z",
        updatedAt: "2024-01-01T10:05:00Z",
      };

      const result = MeetingParticipantSchema.safeParse(invalidParticipant);
      expect(result.success).toBe(false);
    });

    it("should reject invalid ISO date format", () => {
      const invalidMeeting = {
        id: "507f1f77bcf86cd799439011",
        videoSpaceId: "507f1f77bcf86cd799439012",
        providerMeetingId: "meeting_123",
        title: "Test Meeting",
        startTime: "invalid-date",
        endTime: null,
        duration: null,
        status: "ACTIVE",
        totalParticipants: 0,
        maxConcurrentUsers: 0,
        providerData: null,
        createdAt: "2024-01-01T10:00:00Z",
        updatedAt: "2024-01-01T10:00:00Z",
      };

      const result = MeetingRecordSchema.safeParse(invalidMeeting);
      expect(result.success).toBe(false);
    });

    it("should handle very long strings appropriately", () => {
      const longString = "a".repeat(1000);

      const requestWithLongName = {
        name: longString,
        provider: "ZOOM",
        config: {},
        integrationAccountId: "507f1f77bcf86cd799439011",
      };

      const result =
        CreateVideoSpaceRequestSchema.safeParse(requestWithLongName);
      // Should fail due to string length validation
      expect(result.success).toBe(false);
    });

    it("should validate arrays correctly", () => {
      const requestWithTags = {
        name: "Test Room",
        provider: "MEET",
        config: {},
        integrationAccountId: "507f1f77bcf86cd799439011",
        tags: ["tag1", "tag2", "tag3"],
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(requestWithTags);
      expect(result.success).toBe(true);
    });

    it("should reject non-array for tags field", () => {
      const requestWithInvalidTags = {
        name: "Test Room",
        provider: "MEET",
        config: {},
        integrationAccountId: "507f1f77bcf86cd799439011",
        tags: "not-an-array",
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(
        requestWithInvalidTags
      );
      expect(result.success).toBe(false);
    });
  });
});
