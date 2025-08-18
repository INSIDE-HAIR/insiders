/**
 * Video Spaces API Documentation Tests
 * Examples of how to use the API endpoints
 */

import { describe, it, expect } from "vitest";

describe("Video Spaces API Documentation", () => {
  describe("API Endpoint Examples", () => {
    it("should demonstrate GET /api/video-conferencing/video-spaces usage", () => {
      // Example 1: Basic listing
      const basicRequest = {
        method: "GET",
        url: "/api/video-conferencing/video-spaces",
        headers: {
          Authorization: "Bearer <session-token>",
        },
      };

      const basicResponse = {
        data: [
          {
            id: "507f1f77bcf86cd799439021",
            name: "Weekly Team Standup",
            provider: "ZOOM",
            status: "ACTIVE",
            providerJoinUri: "https://zoom.us/j/123456789",
            owner: { name: "John Doe" },
            integrationAccount: { accountName: "Zoom Pro Account" },
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
      };

      expect(basicRequest.method).toBe("GET");
      expect(basicResponse.data).toHaveLength(1);
      expect(basicResponse.pagination.totalCount).toBe(1);
    });

    it("should demonstrate GET with filtering and pagination", () => {
      // Example 2: Filtered and paginated request
      const filteredRequest = {
        method: "GET",
        url: "/api/video-conferencing/video-spaces?provider=ZOOM&status=ACTIVE&page=2&limit=10&search=standup&tags=weekly,team&cohort=Engineering&sortBy=name&sortOrder=asc",
        headers: {
          Authorization: "Bearer <session-token>",
        },
      };

      const queryParams = {
        provider: "ZOOM",
        status: "ACTIVE",
        page: 2,
        limit: 10,
        search: "standup",
        tags: "weekly,team",
        cohort: "Engineering",
        sortBy: "name",
        sortOrder: "asc",
      };

      expect(queryParams.provider).toBe("ZOOM");
      expect(queryParams.status).toBe("ACTIVE");
      expect(queryParams.page).toBe(2);
      expect(queryParams.limit).toBe(10);
    });

    it("should demonstrate POST /api/video-conferencing/video-spaces usage", () => {
      // Example 3: Creating a new video space
      const createRequest = {
        method: "POST",
        url: "/api/video-conferencing/video-spaces",
        headers: {
          Authorization: "Bearer <session-token>",
          "Content-Type": "application/json",
        },
        body: {
          name: "New Team Meeting Room",
          description: "A room for team meetings and discussions",
          provider: "ZOOM",
          config: {
            topic: "Team Meeting",
            duration: 60,
            startTime: "2024-01-15T10:00:00Z",
            hostVideo: true,
            participantVideo: true,
            waitingRoom: true,
            autoRecording: "cloud",
          },
          integrationAccountId: "507f1f77bcf86cd799439031",
          cohort: "Engineering Team",
          tags: ["meeting", "team", "recurring"],
        },
      };

      const createResponse = {
        id: "507f1f77bcf86cd799439024",
        name: "New Team Meeting Room",
        provider: "ZOOM",
        status: "ACTIVE",
        providerRoomId: "987654321",
        providerJoinUri: "https://zoom.us/j/987654321",
        createdAt: "2024-01-15T00:00:00Z",
      };

      expect(createRequest.body.name).toBe("New Team Meeting Room");
      expect(createRequest.body.provider).toBe("ZOOM");
      expect(createResponse.status).toBe("ACTIVE");
    });

    it("should demonstrate GET /api/video-conferencing/video-spaces/[id] usage", () => {
      // Example 4: Getting a specific video space
      const getByIdRequest = {
        method: "GET",
        url: "/api/video-conferencing/video-spaces/507f1f77bcf86cd799439021",
        headers: {
          Authorization: "Bearer <session-token>",
        },
      };

      const detailedResponse = {
        id: "507f1f77bcf86cd799439021",
        name: "Weekly Team Standup",
        description: "Regular team standup meeting",
        provider: "ZOOM",
        status: "ACTIVE",
        providerRoomId: "123456789",
        providerJoinUri: "https://zoom.us/j/123456789",
        owner: {
          id: "507f1f77bcf86cd799439011",
          name: "John Doe",
          email: "john@example.com",
        },
        integrationAccount: {
          id: "507f1f77bcf86cd799439031",
          provider: "ZOOM",
          accountName: "Zoom Pro Account",
          status: "ACTIVE",
        },
        aliases: [
          {
            id: "507f1f77bcf86cd799439041",
            alias: "team-standup",
            accessCount: 45,
          },
        ],
        meetingRecords: [
          {
            id: "507f1f77bcf86cd799439051",
            title: "Weekly Standup - Jan 8, 2024",
            startTime: "2024-01-08T09:00:00Z",
            endTime: "2024-01-08T09:30:00Z",
            totalParticipants: 5,
          },
        ],
        _count: {
          meetingRecords: 12,
        },
      };

      expect(getByIdRequest.method).toBe("GET");
      expect(detailedResponse.aliases).toHaveLength(1);
      expect(detailedResponse.meetingRecords).toHaveLength(1);
      expect(detailedResponse._count.meetingRecords).toBe(12);
    });

    it("should demonstrate PATCH /api/video-conferencing/video-spaces/[id] usage", () => {
      // Example 5: Updating a video space
      const updateRequest = {
        method: "PATCH",
        url: "/api/video-conferencing/video-spaces/507f1f77bcf86cd799439021",
        headers: {
          Authorization: "Bearer <session-token>",
          "Content-Type": "application/json",
        },
        body: {
          name: "Updated Team Standup",
          description: "Updated description for team standup",
          status: "ACTIVE",
          cohort: "Updated Engineering Team",
          tags: ["standup", "weekly", "updated"],
          addedToCalendar: true,
          calendarEventId: "cal_event_456",
          config: {
            topic: "Updated Team Meeting",
            duration: 45,
            waitingRoom: false,
          },
        },
      };

      const updateResponse = {
        id: "507f1f77bcf86cd799439021",
        name: "Updated Team Standup",
        description: "Updated description for team standup",
        updatedAt: "2024-01-15T10:30:00Z",
      };

      expect(updateRequest.body.name).toBe("Updated Team Standup");
      expect(updateRequest.body.tags).toContain("updated");
      expect(updateResponse.updatedAt).toBeTruthy();
    });

    it("should demonstrate DELETE /api/video-conferencing/video-spaces/[id] usage", () => {
      // Example 6: Soft delete (disable)
      const softDeleteRequest = {
        method: "DELETE",
        url: "/api/video-conferencing/video-spaces/507f1f77bcf86cd799439021",
        headers: {
          Authorization: "Bearer <session-token>",
        },
      };

      const softDeleteResponse = {
        message: "Video space disabled",
        id: "507f1f77bcf86cd799439021",
        status: "DISABLED",
      };

      // Example 7: Hard delete (permanent)
      const hardDeleteRequest = {
        method: "DELETE",
        url: "/api/video-conferencing/video-spaces/507f1f77bcf86cd799439021?permanent=true",
        headers: {
          Authorization: "Bearer <session-token>",
        },
      };

      const hardDeleteResponse = {
        message: "Video space permanently deleted",
      };

      expect(softDeleteRequest.method).toBe("DELETE");
      expect(softDeleteResponse.status).toBe("DISABLED");
      expect(hardDeleteResponse.message).toBe(
        "Video space permanently deleted"
      );
    });

    it("should demonstrate POST /api/video-conferencing/video-spaces/status usage", () => {
      // Example 8: Batch status checking
      const batchStatusRequest = {
        method: "POST",
        url: "/api/video-conferencing/video-spaces/status",
        headers: {
          Authorization: "Bearer <session-token>",
          "Content-Type": "application/json",
        },
        body: {
          videoSpaceIds: [
            "507f1f77bcf86cd799439021",
            "507f1f77bcf86cd799439022",
            "507f1f77bcf86cd799439023",
          ],
        },
      };

      const batchStatusResponse = {
        statusUpdates: [
          {
            id: "507f1f77bcf86cd799439021",
            name: "Weekly Team Standup",
            provider: "ZOOM",
            previousStatus: "INACTIVE",
            currentStatus: "ACTIVE",
            lastActiveAt: "2024-01-15T10:00:00Z",
          },
          {
            id: "507f1f77bcf86cd799439022",
            name: "Client Consultation",
            provider: "MEET",
            previousStatus: "ACTIVE",
            currentStatus: "ACTIVE",
            lastActiveAt: "2024-01-15T09:30:00Z",
          },
        ],
        summary: {
          total: 3,
          updated: 1,
          active: 2,
          inactive: 1,
          errors: 0,
        },
        timestamp: "2024-01-15T10:30:00Z",
      };

      expect(batchStatusRequest.body.videoSpaceIds).toHaveLength(3);
      expect(batchStatusResponse.statusUpdates).toHaveLength(2);
      expect(batchStatusResponse.summary.total).toBe(3);
    });

    it("should demonstrate GET /api/video-conferencing/video-spaces/status usage", () => {
      // Example 9: Status summary
      const statusSummaryRequest = {
        method: "GET",
        url: "/api/video-conferencing/video-spaces/status",
        headers: {
          Authorization: "Bearer <session-token>",
        },
      };

      const statusSummaryResponse = {
        summary: {
          byStatus: {
            ACTIVE: 5,
            INACTIVE: 3,
            DISABLED: 1,
          },
          byProvider: {
            ZOOM: 6,
            MEET: 2,
            VIMEO: 1,
          },
          byProviderAndStatus: {
            ZOOM: {
              ACTIVE: 4,
              INACTIVE: 2,
            },
            MEET: {
              ACTIVE: 1,
              INACTIVE: 1,
            },
            VIMEO: {
              DISABLED: 1,
            },
          },
          total: 9,
        },
        recentActivity: [
          {
            id: "507f1f77bcf86cd799439021",
            name: "Weekly Team Standup",
            provider: "ZOOM",
            status: "ACTIVE",
            lastActiveAt: "2024-01-15T10:00:00Z",
          },
        ],
        timestamp: "2024-01-15T10:30:00Z",
      };

      expect(statusSummaryRequest.method).toBe("GET");
      expect(statusSummaryResponse.summary.total).toBe(9);
      expect(statusSummaryResponse.recentActivity).toHaveLength(1);
    });
  });

  describe("Error Response Examples", () => {
    it("should demonstrate common error responses", () => {
      // Error 1: Unauthorized
      const unauthorizedError = {
        error: "Unauthorized",
        status: 401,
      };

      // Error 2: Invalid ObjectId
      const invalidIdError = {
        error: "Invalid video space ID format",
        status: 400,
      };

      // Error 3: Video space not found
      const notFoundError = {
        error: "Video space not found",
        status: 404,
      };

      // Error 4: Validation error
      const validationError = {
        error: "Invalid request data",
        details: [
          {
            code: "invalid_type",
            expected: "string",
            received: "undefined",
            path: ["name"],
            message: "Required",
          },
        ],
        status: 400,
      };

      // Error 5: Provider error
      const providerError = {
        error: "Failed to create room with provider",
        details: "Zoom API returned error: Invalid meeting configuration",
        status: 400,
      };

      expect(unauthorizedError.status).toBe(401);
      expect(invalidIdError.status).toBe(400);
      expect(notFoundError.status).toBe(404);
      expect(validationError.details).toHaveLength(1);
      expect(providerError.details).toContain("Zoom API");
    });
  });

  describe("Provider-Specific Configuration Examples", () => {
    it("should demonstrate Google Meet configuration", () => {
      const googleMeetConfig = {
        name: "Google Meet Room",
        provider: "MEET",
        config: {
          displayName: "Team Meeting Space",
          entryPointAccess: "ALL",
          accessType: "TRUSTED",
        },
        integrationAccountId: "507f1f77bcf86cd799439032",
      };

      expect(googleMeetConfig.provider).toBe("MEET");
      expect(googleMeetConfig.config.entryPointAccess).toBe("ALL");
    });

    it("should demonstrate Zoom configuration", () => {
      const zoomConfig = {
        name: "Zoom Meeting Room",
        provider: "ZOOM",
        config: {
          topic: "Team Weekly Meeting",
          duration: 60,
          startTime: "2024-01-15T10:00:00Z",
          timezone: "America/New_York",
          hostVideo: true,
          participantVideo: true,
          waitingRoom: true,
          autoRecording: "cloud",
          muteUponEntry: true,
          approvalType: 0,
          registrationType: 1,
        },
        integrationAccountId: "507f1f77bcf86cd799439031",
      };

      expect(zoomConfig.provider).toBe("ZOOM");
      expect(zoomConfig.config.duration).toBe(60);
      expect(zoomConfig.config.autoRecording).toBe("cloud");
    });

    it("should demonstrate Vimeo configuration", () => {
      const vimeoConfig = {
        name: "Vimeo Live Event",
        provider: "VIMEO",
        config: {
          title: "Company All-Hands Meeting",
          description: "Monthly company-wide meeting",
          privacy: "password",
          password: "secure123",
          embedSettings: {
            autoplay: false,
            loop: false,
            showTitle: true,
          },
        },
        integrationAccountId: "507f1f77bcf86cd799439033",
      };

      expect(vimeoConfig.provider).toBe("VIMEO");
      expect(vimeoConfig.config.privacy).toBe("password");
      expect(vimeoConfig.config.embedSettings.autoplay).toBe(false);
    });
  });

  describe("Query Parameter Reference", () => {
    it("should document all available query parameters", () => {
      const queryParameters = {
        // Pagination
        page: {
          type: "number",
          default: 1,
          description: "Page number for pagination",
        },
        limit: {
          type: "number",
          default: 20,
          max: 100,
          description: "Number of items per page",
        },

        // Filtering
        provider: {
          type: "enum",
          values: ["MEET", "ZOOM", "VIMEO"],
          description: "Filter by video conferencing provider",
        },
        status: {
          type: "enum",
          values: ["ACTIVE", "INACTIVE", "DISABLED", "EXPIRED"],
          description: "Filter by video space status",
        },
        cohort: {
          type: "string",
          description: "Filter by cohort/team name",
        },
        tags: {
          type: "string",
          description: "Comma-separated list of tags to filter by",
        },
        search: {
          type: "string",
          description: "Search in name and description fields",
        },

        // Sorting
        sortBy: {
          type: "enum",
          values: ["name", "createdAt", "updatedAt", "lastActiveAt", "status"],
          default: "createdAt",
          description: "Field to sort by",
        },
        sortOrder: {
          type: "enum",
          values: ["asc", "desc"],
          default: "desc",
          description: "Sort order",
        },

        // Special parameters
        permanent: {
          type: "boolean",
          description:
            "For DELETE requests: true for hard delete, false for soft delete",
        },
      };

      expect(queryParameters.page.default).toBe(1);
      expect(queryParameters.limit.max).toBe(100);
      expect(queryParameters.provider.values).toContain("ZOOM");
      expect(queryParameters.status.values).toContain("ACTIVE");
      expect(queryParameters.sortBy.values).toContain("name");
    });
  });

  describe("Response Schema Reference", () => {
    it("should document video space response schema", () => {
      const videoSpaceSchema = {
        id: "string (ObjectId)",
        name: "string",
        description: "string | null",
        provider: "MEET | ZOOM | VIMEO",
        status: "ACTIVE | INACTIVE | DISABLED | EXPIRED",
        providerRoomId: "string",
        providerJoinUri: "string",
        providerData: "object",
        settings: "object",
        ownerId: "string (ObjectId)",
        cohort: "string | null",
        tags: "string[]",
        addedToCalendar: "boolean",
        calendarEventId: "string | null",
        integrationAccountId: "string (ObjectId)",
        createdAt: "string (ISO date)",
        updatedAt: "string (ISO date)",
        lastActiveAt: "string (ISO date) | null",

        // Relations (when included)
        owner: {
          id: "string",
          name: "string",
          email: "string",
        },
        integrationAccount: {
          id: "string",
          provider: "string",
          accountName: "string",
          status: "string",
        },
        aliases: [
          {
            id: "string",
            alias: "string",
            accessCount: "number",
            lastAccessedAt: "string | null",
          },
        ],
        meetingRecords: [
          {
            id: "string",
            title: "string",
            startTime: "string",
            endTime: "string",
            totalParticipants: "number",
          },
        ],
        _count: {
          meetingRecords: "number",
        },
      };

      expect(videoSpaceSchema.id).toBe("string (ObjectId)");
      expect(videoSpaceSchema.provider).toBe("MEET | ZOOM | VIMEO");
      expect(videoSpaceSchema.status).toBe(
        "ACTIVE | INACTIVE | DISABLED | EXPIRED"
      );
    });

    it("should document pagination response schema", () => {
      const paginationSchema = {
        page: "number",
        limit: "number",
        totalCount: "number",
        totalPages: "number",
        hasNextPage: "boolean",
        hasPreviousPage: "boolean",
      };

      expect(paginationSchema.page).toBe("number");
      expect(paginationSchema.totalCount).toBe("number");
      expect(paginationSchema.hasNextPage).toBe("boolean");
    });

    it("should document status summary response schema", () => {
      const statusSummarySchema = {
        summary: {
          byStatus: "Record<string, number>",
          byProvider: "Record<string, number>",
          byProviderAndStatus: "Record<string, Record<string, number>>",
          total: "number",
        },
        recentActivity: [
          {
            id: "string",
            name: "string",
            provider: "string",
            status: "string",
            lastActiveAt: "string | null",
          },
        ],
        timestamp: "string (ISO date)",
      };

      expect(statusSummarySchema.summary.total).toBe("number");
      expect(statusSummarySchema.timestamp).toBe("string (ISO date)");
    });
  });
});
