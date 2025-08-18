/**
 * Alias Validation Tests
 * Unit tests for alias validation schemas
 */

import { describe, it, expect } from "vitest";
import {
  createLinkAliasRequestSchema,
  updateLinkAliasRequestSchema,
  linkAliasFiltersSchema,
  linkAliasResponseSchema,
  linkAliasListResponseSchema,
  aliasResolutionSchema,
  bulkUpdateAliasesRequestSchema,
  bulkUpdateAliasesResponseSchema,
} from "../alias";

describe("Alias Validation Schemas", () => {
  describe("createLinkAliasRequestSchema", () => {
    it("should validate valid create request", () => {
      const validRequest = {
        alias: "team-standup",
        videoSpaceId: "507f1f77bcf86cd799439011",
      };

      const result = createLinkAliasRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validRequest);
      }
    });

    it("should accept aliases with underscores and numbers", () => {
      const validRequest = {
        alias: "team_standup_2024",
        videoSpaceId: "507f1f77bcf86cd799439011",
      };

      const result = createLinkAliasRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it("should reject empty alias", () => {
      const invalidRequest = {
        alias: "",
        videoSpaceId: "507f1f77bcf86cd799439011",
      };

      const result = createLinkAliasRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Alias is required");
      }
    });

    it("should reject alias with invalid characters", () => {
      const invalidRequest = {
        alias: "team@standup",
        videoSpaceId: "507f1f77bcf86cd799439011",
      };

      const result = createLinkAliasRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain(
          "can only contain letters, numbers, hyphens, and underscores"
        );
      }
    });

    it("should reject alias starting with hyphen", () => {
      const invalidRequest = {
        alias: "-team-standup",
        videoSpaceId: "507f1f77bcf86cd799439011",
      };

      const result = createLinkAliasRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Alias cannot start or end with a hyphen"
        );
      }
    });

    it("should reject alias ending with hyphen", () => {
      const invalidRequest = {
        alias: "team-standup-",
        videoSpaceId: "507f1f77bcf86cd799439011",
      };

      const result = createLinkAliasRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Alias cannot start or end with a hyphen"
        );
      }
    });

    it("should reject alias starting with underscore", () => {
      const invalidRequest = {
        alias: "_team_standup",
        videoSpaceId: "507f1f77bcf86cd799439011",
      };

      const result = createLinkAliasRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Alias cannot start or end with an underscore"
        );
      }
    });

    it("should reject alias ending with underscore", () => {
      const invalidRequest = {
        alias: "team_standup_",
        videoSpaceId: "507f1f77bcf86cd799439011",
      };

      const result = createLinkAliasRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Alias cannot start or end with an underscore"
        );
      }
    });

    it("should reject alias that is too long", () => {
      const invalidRequest = {
        alias: "a".repeat(101),
        videoSpaceId: "507f1f77bcf86cd799439011",
      };

      const result = createLinkAliasRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Alias must be less than 100 characters"
        );
      }
    });

    it("should reject invalid video space ID format", () => {
      const invalidRequest = {
        alias: "team-standup",
        videoSpaceId: "invalid-id",
      };

      const result = createLinkAliasRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Invalid video space ID format"
        );
      }
    });

    it("should reject missing required fields", () => {
      const invalidRequest = {};

      const result = createLinkAliasRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors).toHaveLength(2);
      }
    });
  });

  describe("updateLinkAliasRequestSchema", () => {
    it("should validate valid update request", () => {
      const validRequest = {
        alias: "updated-standup",
        isActive: false,
      };

      const result = updateLinkAliasRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validRequest);
      }
    });

    it("should validate partial update request", () => {
      const validRequest = {
        isActive: true,
      };

      const result = updateLinkAliasRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validRequest);
      }
    });

    it("should validate empty update request", () => {
      const validRequest = {};

      const result = updateLinkAliasRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validRequest);
      }
    });

    it("should reject invalid alias format in update", () => {
      const invalidRequest = {
        alias: "invalid@alias",
      };

      const result = updateLinkAliasRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain(
          "can only contain letters, numbers, hyphens, and underscores"
        );
      }
    });
  });

  describe("linkAliasFiltersSchema", () => {
    it("should validate valid filters", () => {
      const validFilters = {
        videoSpaceId: "507f1f77bcf86cd799439011",
        isActive: "true",
        search: "standup",
        page: "2",
        limit: "10",
      };

      const result = linkAliasFiltersSchema.safeParse(validFilters);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.videoSpaceId).toBe("507f1f77bcf86cd799439011");
        expect(result.data.isActive).toBe(true);
        expect(result.data.search).toBe("standup");
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(10);
      }
    });

    it("should apply default values", () => {
      const emptyFilters = {};

      const result = linkAliasFiltersSchema.safeParse(emptyFilters);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should transform isActive string to boolean", () => {
      const filters = {
        isActive: "false",
      };

      const result = linkAliasFiltersSchema.safeParse(filters);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(false);
      }
    });

    it("should reject invalid video space ID", () => {
      const invalidFilters = {
        videoSpaceId: "invalid-id",
      };

      const result = linkAliasFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Invalid video space ID format"
        );
      }
    });

    it("should reject invalid page number", () => {
      const invalidFilters = {
        page: "0",
      };

      const result = linkAliasFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
    });

    it("should reject limit that is too high", () => {
      const invalidFilters = {
        limit: "101",
      };

      const result = linkAliasFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
    });
  });

  describe("linkAliasResponseSchema", () => {
    it("should validate valid response", () => {
      const validResponse = {
        id: "507f1f77bcf86cd799439031",
        alias: "team-standup",
        videoSpaceId: "507f1f77bcf86cd799439011",
        videoSpace: {
          id: "507f1f77bcf86cd799439011",
          name: "Team Standup",
          provider: "ZOOM",
          status: "ACTIVE",
          providerJoinUri: "https://zoom.us/j/123456789",
        },
        isActive: true,
        accessCount: 5,
        lastAccessedAt: "2024-01-15T10:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      };

      const result = linkAliasResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it("should validate response without optional videoSpace", () => {
      const validResponse = {
        id: "507f1f77bcf86cd799439031",
        alias: "team-standup",
        videoSpaceId: "507f1f77bcf86cd799439011",
        isActive: true,
        accessCount: 5,
        lastAccessedAt: null,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      };

      const result = linkAliasResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it("should reject invalid provider in videoSpace", () => {
      const invalidResponse = {
        id: "507f1f77bcf86cd799439031",
        alias: "team-standup",
        videoSpaceId: "507f1f77bcf86cd799439011",
        videoSpace: {
          id: "507f1f77bcf86cd799439011",
          name: "Team Standup",
          provider: "INVALID",
          status: "ACTIVE",
          providerJoinUri: "https://zoom.us/j/123456789",
        },
        isActive: true,
        accessCount: 5,
        lastAccessedAt: null,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      };

      const result = linkAliasResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe("linkAliasListResponseSchema", () => {
    it("should validate valid list response", () => {
      const validResponse = {
        data: [
          {
            id: "507f1f77bcf86cd799439031",
            alias: "team-standup",
            videoSpaceId: "507f1f77bcf86cd799439011",
            isActive: true,
            accessCount: 5,
            lastAccessedAt: "2024-01-15T10:00:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z",
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        filters: {
          videoSpaceId: "507f1f77bcf86cd799439011",
          isActive: true,
          search: "standup",
        },
      };

      const result = linkAliasListResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it("should validate empty list response", () => {
      const validResponse = {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        filters: {},
      };

      const result = linkAliasListResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe("aliasResolutionSchema", () => {
    it("should validate valid resolution response", () => {
      const validResponse = {
        alias: "team-standup",
        videoSpace: {
          id: "507f1f77bcf86cd799439011",
          name: "Team Standup",
          provider: "ZOOM",
          status: "ACTIVE",
          providerJoinUri: "https://zoom.us/j/123456789",
          providerRoomId: "123456789",
        },
        redirectUrl: "https://zoom.us/j/123456789",
        accessCount: 6,
        lastAccessedAt: "2024-01-15T10:00:00Z",
      };

      const result = aliasResolutionSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it("should reject invalid redirect URL", () => {
      const invalidResponse = {
        alias: "team-standup",
        videoSpace: {
          id: "507f1f77bcf86cd799439011",
          name: "Team Standup",
          provider: "ZOOM",
          status: "ACTIVE",
          providerJoinUri: "https://zoom.us/j/123456789",
          providerRoomId: "123456789",
        },
        redirectUrl: "not-a-url",
        accessCount: 6,
        lastAccessedAt: "2024-01-15T10:00:00Z",
      };

      const result = aliasResolutionSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe("bulkUpdateAliasesRequestSchema", () => {
    it("should validate valid bulk update request", () => {
      const validRequest = {
        aliasIds: ["507f1f77bcf86cd799439031", "507f1f77bcf86cd799439032"],
        updates: {
          isActive: false,
        },
      };

      const result = bulkUpdateAliasesRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it("should reject empty alias IDs array", () => {
      const invalidRequest = {
        aliasIds: [],
        updates: {
          isActive: false,
        },
      };

      const result = bulkUpdateAliasesRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "At least one alias ID is required"
        );
      }
    });

    it("should reject too many alias IDs", () => {
      const invalidRequest = {
        aliasIds: Array(51).fill("507f1f77bcf86cd799439031"),
        updates: {
          isActive: false,
        },
      };

      const result = bulkUpdateAliasesRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Cannot update more than 50 aliases at once"
        );
      }
    });

    it("should reject invalid alias ID format", () => {
      const invalidRequest = {
        aliasIds: ["invalid-id"],
        updates: {
          isActive: false,
        },
      };

      const result = bulkUpdateAliasesRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Invalid alias ID format");
      }
    });
  });

  describe("bulkUpdateAliasesResponseSchema", () => {
    it("should validate valid bulk update response", () => {
      const validResponse = {
        updated: [
          {
            id: "507f1f77bcf86cd799439031",
            alias: "team-standup",
            success: true,
          },
          {
            id: "507f1f77bcf86cd799439032",
            alias: "client-meeting",
            success: false,
            error: "Alias not found",
          },
        ],
        summary: {
          total: 2,
          successful: 1,
          failed: 1,
        },
      };

      const result = bulkUpdateAliasesResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it("should validate response with all successful updates", () => {
      const validResponse = {
        updated: [
          {
            id: "507f1f77bcf86cd799439031",
            alias: "team-standup",
            success: true,
          },
        ],
        summary: {
          total: 1,
          successful: 1,
          failed: 0,
        },
      };

      const result = bulkUpdateAliasesResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });
});
