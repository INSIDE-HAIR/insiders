/**
 * Video Conferencing Validation Tests
 * Unit tests for Zod validation schemas
 */

import { describe, it, expect } from "vitest";
import {
  VideoProviderSchema,
  VideoSpaceStatusSchema,
  MeetingStatusSchema,
  IntegrationStatusSchema,
  ParticipantRoleSchema,
  RecordingTypeSchema,
  VideoSpaceSettingsSchema,
  CreateVideoSpaceRequestSchema,
  UpdateVideoSpaceRequestSchema,
  VideoSpaceFiltersSchema,
  AnalyticsFiltersSchema,
  DateRangeSchema,
  LinkAliasSchema,
  validateVideoSpaceSettings,
  validateCreateVideoSpaceRequest,
  validateVideoSpaceFilters,
  validateDateRange,
  validateLinkAlias,
} from "../index";

describe("Video Conferencing Core Validations", () => {
  describe("Enum Schemas", () => {
    it("should validate VideoProvider enum", () => {
      expect(VideoProviderSchema.parse("MEET")).toBe("MEET");
      expect(VideoProviderSchema.parse("ZOOM")).toBe("ZOOM");
      expect(VideoProviderSchema.parse("VIMEO")).toBe("VIMEO");

      expect(() => VideoProviderSchema.parse("INVALID")).toThrow();
    });

    it("should validate VideoSpaceStatus enum", () => {
      expect(VideoSpaceStatusSchema.parse("ACTIVE")).toBe("ACTIVE");
      expect(VideoSpaceStatusSchema.parse("INACTIVE")).toBe("INACTIVE");
      expect(VideoSpaceStatusSchema.parse("DISABLED")).toBe("DISABLED");
      expect(VideoSpaceStatusSchema.parse("EXPIRED")).toBe("EXPIRED");

      expect(() => VideoSpaceStatusSchema.parse("INVALID")).toThrow();
    });

    it("should validate MeetingStatus enum", () => {
      expect(MeetingStatusSchema.parse("SCHEDULED")).toBe("SCHEDULED");
      expect(MeetingStatusSchema.parse("ACTIVE")).toBe("ACTIVE");
      expect(MeetingStatusSchema.parse("ENDED")).toBe("ENDED");
      expect(MeetingStatusSchema.parse("CANCELLED")).toBe("CANCELLED");

      expect(() => MeetingStatusSchema.parse("INVALID")).toThrow();
    });

    it("should validate IntegrationStatus enum", () => {
      expect(IntegrationStatusSchema.parse("ACTIVE")).toBe("ACTIVE");
      expect(IntegrationStatusSchema.parse("EXPIRED")).toBe("EXPIRED");
      expect(IntegrationStatusSchema.parse("REVOKED")).toBe("REVOKED");
      expect(IntegrationStatusSchema.parse("ERROR")).toBe("ERROR");

      expect(() => IntegrationStatusSchema.parse("INVALID")).toThrow();
    });

    it("should validate ParticipantRole enum", () => {
      expect(ParticipantRoleSchema.parse("HOST")).toBe("HOST");
      expect(ParticipantRoleSchema.parse("CO_HOST")).toBe("CO_HOST");
      expect(ParticipantRoleSchema.parse("PANELIST")).toBe("PANELIST");
      expect(ParticipantRoleSchema.parse("ATTENDEE")).toBe("ATTENDEE");

      expect(() => ParticipantRoleSchema.parse("INVALID")).toThrow();
    });

    it("should validate RecordingType enum", () => {
      expect(RecordingTypeSchema.parse("VIDEO")).toBe("VIDEO");
      expect(RecordingTypeSchema.parse("AUDIO_ONLY")).toBe("AUDIO_ONLY");
      expect(RecordingTypeSchema.parse("SCREEN_SHARE")).toBe("SCREEN_SHARE");
      expect(RecordingTypeSchema.parse("CHAT")).toBe("CHAT");
      expect(RecordingTypeSchema.parse("TRANSCRIPT")).toBe("TRANSCRIPT");

      expect(() => RecordingTypeSchema.parse("INVALID")).toThrow();
    });
  });

  describe("VideoSpaceSettings Schema", () => {
    it("should validate valid settings with defaults", () => {
      const settings = {};
      const result = VideoSpaceSettingsSchema.parse(settings);

      expect(result.autoRecord).toBe(false);
      expect(result.recordingFormat).toBe("MP4");
      expect(result.enableTranscription).toBe(false);
      expect(result.transcriptionLanguage).toBe("en-US");
      expect(result.requireAuthentication).toBe(false);
      expect(result.allowedDomains).toEqual([]);
      expect(result.maxParticipants).toBe(100);
      expect(result.muteOnEntry).toBe(false);
      expect(result.enableChat).toBe(true);
      expect(result.enableScreenShare).toBe(true);
      expect(result.providerSettings).toEqual({});
    });

    it("should validate complete settings", () => {
      const settings = {
        autoRecord: true,
        recordingFormat: "AUDIO_ONLY" as const,
        enableTranscription: true,
        transcriptionLanguage: "es-ES",
        requireAuthentication: true,
        allowedDomains: ["company.com", "partner.org"],
        maxParticipants: 50,
        muteOnEntry: true,
        enableChat: false,
        enableScreenShare: false,
        providerSettings: {
          customSetting: "value",
          numericSetting: 123,
        },
      };

      const result = VideoSpaceSettingsSchema.parse(settings);
      expect(result).toEqual(settings);
    });

    it("should reject invalid settings", () => {
      expect(() =>
        VideoSpaceSettingsSchema.parse({
          maxParticipants: 0, // Below minimum
        })
      ).toThrow();

      expect(() =>
        VideoSpaceSettingsSchema.parse({
          maxParticipants: 1001, // Above maximum
        })
      ).toThrow();

      expect(() =>
        VideoSpaceSettingsSchema.parse({
          recordingFormat: "INVALID",
        })
      ).toThrow();

      expect(() =>
        VideoSpaceSettingsSchema.parse({
          allowedDomains: ["invalid-email@domain.com"], // Should be domain only
        })
      ).toThrow();
    });

    it("should validate domain formats correctly", () => {
      const settings = {
        allowedDomains: ["company.com", "partner.org", "sub.domain.co.uk"],
      };

      const result = VideoSpaceSettingsSchema.parse(settings);
      expect(result.allowedDomains).toEqual([
        "company.com",
        "partner.org",
        "sub.domain.co.uk",
      ]);
    });
  });

  describe("CreateVideoSpaceRequest Schema", () => {
    it("should validate valid request", () => {
      const request = {
        name: "Test Meeting",
        description: "A test meeting room",
        provider: "MEET" as const,
        settings: {
          autoRecord: true,
          maxParticipants: 25,
        },
        cohort: "test-cohort",
        tags: ["test", "meeting"],
        integrationAccountId: "account-123",
      };

      const result = CreateVideoSpaceRequestSchema.parse(request);
      expect(result.name).toBe("Test Meeting");
      expect(result.provider).toBe("MEET");
      expect(result.tags).toEqual(["test", "meeting"]);
    });

    it("should validate minimal request", () => {
      const request = {
        name: "Minimal Meeting",
        provider: "ZOOM" as const,
        integrationAccountId: "account-456",
      };

      const result = CreateVideoSpaceRequestSchema.parse(request);
      expect(result.name).toBe("Minimal Meeting");
      expect(result.provider).toBe("ZOOM");
      expect(result.tags).toEqual([]);
    });

    it("should reject invalid requests", () => {
      expect(() =>
        CreateVideoSpaceRequestSchema.parse({
          name: "", // Empty name
          provider: "MEET",
          integrationAccountId: "account-123",
        })
      ).toThrow();

      expect(() =>
        CreateVideoSpaceRequestSchema.parse({
          name: "Test",
          provider: "INVALID", // Invalid provider
          integrationAccountId: "account-123",
        })
      ).toThrow();

      expect(() =>
        CreateVideoSpaceRequestSchema.parse({
          name: "Test",
          provider: "MEET",
          // Missing integrationAccountId
        })
      ).toThrow();

      expect(() =>
        CreateVideoSpaceRequestSchema.parse({
          name: "A".repeat(201), // Name too long
          provider: "MEET",
          integrationAccountId: "account-123",
        })
      ).toThrow();
    });
  });

  describe("UpdateVideoSpaceRequest Schema", () => {
    it("should validate partial updates", () => {
      const request = {
        name: "Updated Name",
      };

      const result = UpdateVideoSpaceRequestSchema.parse(request);
      expect(result.name).toBe("Updated Name");
    });

    it("should validate complete updates", () => {
      const request = {
        name: "Updated Meeting",
        description: "Updated description",
        settings: {
          autoRecord: false,
          enableChat: true,
        },
        cohort: "updated-cohort",
        tags: ["updated", "tags"],
        addedToCalendar: true,
        calendarEventId: "cal-event-123",
      };

      const result = UpdateVideoSpaceRequestSchema.parse(request);
      expect(result.name).toBe("Updated Meeting");
      expect(result.description).toBe("Updated description");
      expect(result.settings?.autoRecord).toBe(false);
      expect(result.settings?.enableChat).toBe(true);
      expect(result.cohort).toBe("updated-cohort");
      expect(result.tags).toEqual(["updated", "tags"]);
      expect(result.addedToCalendar).toBe(true);
      expect(result.calendarEventId).toBe("cal-event-123");
    });

    it("should allow empty updates", () => {
      const request = {};
      const result = UpdateVideoSpaceRequestSchema.parse(request);
      expect(result).toEqual({});
    });
  });

  describe("VideoSpaceFilters Schema", () => {
    it("should validate filters with defaults", () => {
      const filters = {};
      const result = VideoSpaceFiltersSchema.parse(filters);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it("should validate complete filters", () => {
      const filters = {
        provider: "MEET" as const,
        status: "ACTIVE" as const,
        ownerId: "user-123",
        cohort: "test-cohort",
        tags: ["tag1", "tag2"],
        search: "meeting name",
        page: 2,
        limit: 50,
      };

      const result = VideoSpaceFiltersSchema.parse(filters);
      expect(result).toEqual(filters);
    });

    it("should reject invalid filters", () => {
      expect(() =>
        VideoSpaceFiltersSchema.parse({
          page: 0, // Below minimum
        })
      ).toThrow();

      expect(() =>
        VideoSpaceFiltersSchema.parse({
          limit: 0, // Below minimum
        })
      ).toThrow();

      expect(() =>
        VideoSpaceFiltersSchema.parse({
          limit: 101, // Above maximum
        })
      ).toThrow();

      expect(() =>
        VideoSpaceFiltersSchema.parse({
          search: "A".repeat(201), // Too long
        })
      ).toThrow();
    });
  });

  describe("DateRange Schema", () => {
    it("should validate valid date range", () => {
      const start = new Date("2024-01-01");
      const end = new Date("2024-01-31");

      const range = { start, end };
      const result = DateRangeSchema.parse(range);

      expect(result.start).toEqual(start);
      expect(result.end).toEqual(end);
    });

    it("should allow same start and end dates", () => {
      const date = new Date("2024-01-01");
      const range = { start: date, end: date };

      const result = DateRangeSchema.parse(range);
      expect(result.start).toEqual(date);
      expect(result.end).toEqual(date);
    });

    it("should reject invalid date ranges", () => {
      const start = new Date("2024-01-31");
      const end = new Date("2024-01-01");

      expect(() => DateRangeSchema.parse({ start, end })).toThrow();
    });
  });

  describe("LinkAlias Schema", () => {
    it("should validate valid alias", () => {
      const alias = {
        id: "alias-123",
        alias: "team-standup",
        videoSpaceId: "space-456",
        isActive: true,
        accessCount: 25,
        lastAccessedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = LinkAliasSchema.parse(alias);
      expect(result.alias).toBe("team-standup");
      expect(result.isActive).toBe(true);
    });

    it("should validate alias with defaults", () => {
      const alias = {
        id: "alias-123",
        alias: "simple-alias",
        videoSpaceId: "space-456",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = LinkAliasSchema.parse(alias);
      expect(result.isActive).toBe(true);
      expect(result.accessCount).toBe(0);
    });

    it("should reject invalid aliases", () => {
      expect(() =>
        LinkAliasSchema.parse({
          id: "alias-123",
          alias: "", // Empty alias
          videoSpaceId: "space-456",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ).toThrow();

      expect(() =>
        LinkAliasSchema.parse({
          id: "alias-123",
          alias: "invalid alias with spaces", // Invalid characters
          videoSpaceId: "space-456",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ).toThrow();

      expect(() =>
        LinkAliasSchema.parse({
          id: "alias-123",
          alias: "A".repeat(101), // Too long
          videoSpaceId: "space-456",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ).toThrow();
    });

    it("should allow valid alias characters", () => {
      const validAliases = [
        "simple",
        "with-hyphens",
        "with_underscores",
        "with123numbers",
        "MixedCase",
        "a1-b2_c3",
      ];

      validAliases.forEach((aliasName) => {
        const alias = {
          id: "alias-123",
          alias: aliasName,
          videoSpaceId: "space-456",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(() => LinkAliasSchema.parse(alias)).not.toThrow();
      });
    });
  });

  describe("Validation Utility Functions", () => {
    it("should validate video space settings", () => {
      const validSettings = { autoRecord: true };
      const result = validateVideoSpaceSettings(validSettings);

      expect(result.success).toBe(true);
      expect(result.data?.autoRecord).toBe(true);
    });

    it("should validate create video space request", () => {
      const validRequest = {
        name: "Test Meeting",
        provider: "MEET",
        integrationAccountId: "account-123",
      };

      const result = validateCreateVideoSpaceRequest(validRequest);
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe("Test Meeting");
    });

    it("should validate video space filters", () => {
      const validFilters = { provider: "ZOOM", page: 1 };
      const result = validateVideoSpaceFilters(validFilters);

      expect(result.success).toBe(true);
      expect(result.data?.provider).toBe("ZOOM");
    });

    it("should validate date range", () => {
      const validRange = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31"),
      };

      const result = validateDateRange(validRange);
      expect(result.success).toBe(true);
    });

    it("should validate link alias", () => {
      const validAlias = {
        id: "alias-123",
        alias: "test-alias",
        videoSpaceId: "space-456",
        isActive: true,
        accessCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = validateLinkAlias(validAlias);
      expect(result.success).toBe(true);
      expect(result.data?.alias).toBe("test-alias");
    });

    it("should return validation errors for invalid data", () => {
      const invalidSettings = { maxParticipants: -1 };
      const result = validateVideoSpaceSettings(invalidSettings);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
