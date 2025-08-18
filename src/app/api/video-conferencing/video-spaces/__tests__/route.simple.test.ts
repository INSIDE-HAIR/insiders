/**
 * Simple Video Spaces API Tests
 * Basic tests without NextAuth dependencies
 */

import { describe, it, expect, vi } from "vitest";
import {
  CreateVideoSpaceRequestSchema,
  VideoSpaceResponseSchema,
} from "@/features/video-conferencing/validation";

describe("Video Spaces API - Basic Validation", () => {
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
      if (result.success) {
        expect(result.data.name).toBe("Test Meeting Room");
        expect(result.data.provider).toBe("ZOOM");
        expect(result.data.tags).toEqual(["test", "meeting"]);
      }
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
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
      }
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

    it("should validate tags array", () => {
      const requestWithTags = {
        name: "Test Room",
        provider: "MEET",
        config: {},
        integrationAccountId: "507f1f77bcf86cd799439011",
        tags: ["tag1", "tag2", "tag3"],
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(requestWithTags);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual(["tag1", "tag2", "tag3"]);
      }
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
      if (result.success) {
        expect(result.data.name).toBe("Test Room");
        expect(result.data.provider).toBe("ZOOM");
        expect(result.data.status).toBe("ACTIVE");
      }
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
      if (result.success) {
        expect(result.data.description).toBeNull();
        expect(result.data.lastActiveAt).toBeNull();
        expect(result.data.tags).toEqual([]);
      }
    });

    it("should reject invalid status", () => {
      const invalidResponse = {
        id: "507f1f77bcf86cd799439011",
        name: "Test Room",
        description: null,
        provider: "MEET",
        status: "INVALID_STATUS",
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

      const result = VideoSpaceResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it("should reject invalid ObjectId format", () => {
      const invalidResponse = {
        id: "invalid-object-id",
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

      const result = VideoSpaceResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it("should reject invalid ISO date format", () => {
      const invalidResponse = {
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
        createdAt: "invalid-date",
        updatedAt: "2024-01-01T00:00:00Z",
        lastActiveAt: null,
      };

      const result = VideoSpaceResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe("Edge Cases", () => {
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

    it("should validate empty config object", () => {
      const requestWithEmptyConfig = {
        name: "Test Room",
        provider: "MEET",
        config: {},
        integrationAccountId: "507f1f77bcf86cd799439011",
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(
        requestWithEmptyConfig
      );
      expect(result.success).toBe(true);
    });

    it("should validate complex config object", () => {
      const requestWithComplexConfig = {
        name: "Test Room",
        provider: "ZOOM",
        config: {
          topic: "Complex Meeting",
          duration: 120,
          startTime: "2024-01-01T10:00:00Z",
          settings: {
            autoRecord: true,
            waitingRoom: true,
            muteOnEntry: false,
          },
        },
        integrationAccountId: "507f1f77bcf86cd799439011",
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(
        requestWithComplexConfig
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.config).toEqual(requestWithComplexConfig.config);
      }
    });
  });
});
