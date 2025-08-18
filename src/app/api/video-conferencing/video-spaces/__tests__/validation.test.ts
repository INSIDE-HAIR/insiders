/**
 * Video Spaces Validation Tests
 * Comprehensive tests for all validation schemas
 */

import { describe, it, expect } from "vitest";
import {
  CreateVideoSpaceRequestSchema,
  UpdateVideoSpaceRequestSchema,
  VideoSpaceResponseSchema,
  ObjectIdSchema,
  VideoProviderSchema,
  VideoSpaceStatusSchema,
} from "@/features/video-conferencing/validation";

describe("Video Spaces Validation", () => {
  describe("ObjectIdSchema", () => {
    it("should validate valid ObjectId", () => {
      const validId = "507f1f77bcf86cd799439011";
      const result = ObjectIdSchema.safeParse(validId);
      expect(result.success).toBe(true);
    });

    it("should reject invalid ObjectId format", () => {
      const invalidIds = [
        "invalid-id",
        "123",
        "not-an-object-id",
        "507f1f77bcf86cd79943901", // too short
        "507f1f77bcf86cd799439011x", // too long
      ];

      invalidIds.forEach((id) => {
        const result = ObjectIdSchema.safeParse(id);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("VideoProviderSchema", () => {
    it("should validate valid providers", () => {
      const validProviders = ["MEET", "ZOOM", "VIMEO"];

      validProviders.forEach((provider) => {
        const result = VideoProviderSchema.safeParse(provider);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid providers", () => {
      const invalidProviders = ["INVALID", "TEAMS", "WEBEX", ""];

      invalidProviders.forEach((provider) => {
        const result = VideoProviderSchema.safeParse(provider);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("VideoSpaceStatusSchema", () => {
    it("should validate valid statuses", () => {
      const validStatuses = ["ACTIVE", "INACTIVE", "DISABLED", "EXPIRED"];

      validStatuses.forEach((status) => {
        const result = VideoSpaceStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid statuses", () => {
      const invalidStatuses = ["INVALID", "PENDING", "RUNNING", ""];

      invalidStatuses.forEach((status) => {
        const result = VideoSpaceStatusSchema.safeParse(status);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("CreateVideoSpaceRequestSchema", () => {
    const validBaseRequest = {
      name: "Test Meeting Room",
      provider: "ZOOM",
      config: { topic: "Test Meeting" },
      integrationAccountId: "507f1f77bcf86cd799439011",
    };

    it("should validate complete valid request", () => {
      const completeRequest = {
        ...validBaseRequest,
        description: "A test meeting room",
        cohort: "Test Cohort",
        tags: ["test", "meeting"],
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(completeRequest);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.name).toBe("Test Meeting Room");
        expect(result.data.provider).toBe("ZOOM");
        expect(result.data.tags).toEqual(["test", "meeting"]);
      }
    });

    it("should validate minimal valid request", () => {
      const result = CreateVideoSpaceRequestSchema.safeParse(validBaseRequest);
      expect(result.success).toBe(true);
    });

    it("should reject request without name", () => {
      const { name, ...requestWithoutName } = validBaseRequest;
      const result =
        CreateVideoSpaceRequestSchema.safeParse(requestWithoutName);
      expect(result.success).toBe(false);
    });

    it("should reject request without provider", () => {
      const { provider, ...requestWithoutProvider } = validBaseRequest;
      const result = CreateVideoSpaceRequestSchema.safeParse(
        requestWithoutProvider
      );
      expect(result.success).toBe(false);
    });

    it("should reject request without config", () => {
      const { config, ...requestWithoutConfig } = validBaseRequest;
      const result =
        CreateVideoSpaceRequestSchema.safeParse(requestWithoutConfig);
      expect(result.success).toBe(false);
    });

    it("should reject request without integrationAccountId", () => {
      const { integrationAccountId, ...requestWithoutAccount } =
        validBaseRequest;
      const result = CreateVideoSpaceRequestSchema.safeParse(
        requestWithoutAccount
      );
      expect(result.success).toBe(false);
    });

    it("should reject invalid provider", () => {
      const invalidRequest = {
        ...validBaseRequest,
        provider: "INVALID_PROVIDER",
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("should reject invalid ObjectId", () => {
      const invalidRequest = {
        ...validBaseRequest,
        integrationAccountId: "invalid-id",
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("should reject name that is too long", () => {
      const invalidRequest = {
        ...validBaseRequest,
        name: "a".repeat(300), // Assuming max length is 255
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("should reject empty name", () => {
      const invalidRequest = {
        ...validBaseRequest,
        name: "",
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("should validate tags array", () => {
      const requestWithTags = {
        ...validBaseRequest,
        tags: ["tag1", "tag2", "tag3"],
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(requestWithTags);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.tags).toEqual(["tag1", "tag2", "tag3"]);
      }
    });

    it("should reject non-array tags", () => {
      const invalidRequest = {
        ...validBaseRequest,
        tags: "not-an-array",
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateVideoSpaceRequestSchema", () => {
    it("should validate complete update request", () => {
      const updateRequest = {
        name: "Updated Room Name",
        description: "Updated description",
        status: "INACTIVE",
        cohort: "Updated Cohort",
        tags: ["updated", "test"],
        addedToCalendar: true,
        calendarEventId: "cal_123",
        config: { topic: "Updated Meeting" },
      };

      const result = UpdateVideoSpaceRequestSchema.safeParse(updateRequest);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.name).toBe("Updated Room Name");
        expect(result.data.status).toBe("INACTIVE");
        expect(result.data.addedToCalendar).toBe(true);
      }
    });

    it("should validate partial update request", () => {
      const partialUpdate = {
        name: "New Name Only",
      };

      const result = UpdateVideoSpaceRequestSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.name).toBe("New Name Only");
        expect(result.data.description).toBeUndefined();
      }
    });

    it("should validate empty update request", () => {
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

    it("should validate omitted optional fields", () => {
      const updateWithOmittedFields = {
        name: "Updated Name",
        // description, cohort, calendarEventId omitted
      };

      const result = UpdateVideoSpaceRequestSchema.safeParse(
        updateWithOmittedFields
      );
      expect(result.success).toBe(true);
    });
  });

  describe("VideoSpaceResponseSchema", () => {
    const validBaseResponse = {
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

    it("should validate complete response", () => {
      const result = VideoSpaceResponseSchema.safeParse(validBaseResponse);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.name).toBe("Test Room");
        expect(result.data.provider).toBe("ZOOM");
        expect(result.data.status).toBe("ACTIVE");
      }
    });

    it("should validate response with null optional fields", () => {
      const responseWithNulls = {
        ...validBaseResponse,
        description: null,
        providerData: null,
        settings: null,
        cohort: null,
        calendarEventId: null,
        lastActiveAt: null,
      };

      const result = VideoSpaceResponseSchema.safeParse(responseWithNulls);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.description).toBeNull();
        expect(result.data.lastActiveAt).toBeNull();
      }
    });

    it("should validate response with empty tags array", () => {
      const responseWithEmptyTags = {
        ...validBaseResponse,
        tags: [],
      };

      const result = VideoSpaceResponseSchema.safeParse(responseWithEmptyTags);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.tags).toEqual([]);
      }
    });

    it("should reject response with invalid ObjectId", () => {
      const invalidResponse = {
        ...validBaseResponse,
        id: "invalid-object-id",
      };

      const result = VideoSpaceResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it("should reject response with invalid provider", () => {
      const invalidResponse = {
        ...validBaseResponse,
        provider: "INVALID_PROVIDER",
      };

      const result = VideoSpaceResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it("should reject response with invalid status", () => {
      const invalidResponse = {
        ...validBaseResponse,
        status: "INVALID_STATUS",
      };

      const result = VideoSpaceResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it("should reject response with invalid date format", () => {
      const invalidResponse = {
        ...validBaseResponse,
        createdAt: "invalid-date",
      };

      const result = VideoSpaceResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it("should reject response with missing required fields", () => {
      const { name, ...incompleteResponse } = validBaseResponse;
      const result = VideoSpaceResponseSchema.safeParse(incompleteResponse);
      expect(result.success).toBe(false);
    });
  });

  describe("Complex Validation Scenarios", () => {
    it("should handle nested config objects", () => {
      const requestWithComplexConfig = {
        name: "Complex Room",
        provider: "ZOOM",
        config: {
          topic: "Complex Meeting",
          duration: 120,
          settings: {
            autoRecord: true,
            waitingRoom: true,
            participants: {
              muteOnEntry: false,
              allowScreenShare: true,
            },
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

    it("should handle large tag arrays", () => {
      const manyTags = Array.from({ length: 20 }, (_, i) => `tag${i}`);
      const requestWithManyTags = {
        name: "Room with Many Tags",
        provider: "MEET",
        config: {},
        integrationAccountId: "507f1f77bcf86cd799439011",
        tags: manyTags,
      };

      const result =
        CreateVideoSpaceRequestSchema.safeParse(requestWithManyTags);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.tags).toHaveLength(20);
      }
    });

    it("should handle unicode characters in names", () => {
      const unicodeRequest = {
        name: "Reunión de Equipo 🚀",
        description: "Descripción con acentos y emojis 📝",
        provider: "VIMEO",
        config: { title: "Título con ñ" },
        integrationAccountId: "507f1f77bcf86cd799439011",
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(unicodeRequest);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.name).toBe("Reunión de Equipo 🚀");
        expect(result.data.description).toBe(
          "Descripción con acentos y emojis 📝"
        );
      }
    });

    it("should handle edge case string lengths", () => {
      // Test exactly at the boundary (assuming 255 char limit)
      const exactLengthName = "a".repeat(255);
      const validRequest = {
        name: exactLengthName,
        provider: "ZOOM",
        config: {},
        integrationAccountId: "507f1f77bcf86cd799439011",
      };

      const result = CreateVideoSpaceRequestSchema.safeParse(validRequest);
      // This should succeed if 255 is the exact limit
      expect(result.success).toBe(true);
    });
  });
});
