/**
 * Tests for Meeting Data Synchronization API Endpoint
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST, DELETE } from "../route";

// Mock the services
vi.mock(
  "@/features/video-conferencing/services/MeetingDataSyncService",
  () => ({
    MeetingDataSyncService: vi.fn().mockImplementation(() => ({
      getSyncStats: vi.fn().mockReturnValue({
        queueLength: 0,
        processing: false,
        totalProcessed: 10,
        totalSuccessful: 8,
        totalFailed: 2,
        lastProcessedAt: new Date(),
        averageProcessingTime: 150,
      }),
      syncFromWebhook: vi.fn().mockResolvedValue({
        success: true,
        provider: "ZOOM",
        meetingId: "test-meeting-123",
        eventType: "meeting.started",
        timestamp: new Date(),
        duration: 100,
        recordsProcessed: 1,
        recordsUpdated: 1,
        recordsCreated: 0,
        errors: [],
        options: {},
      }),
      queueSync: vi.fn().mockResolvedValue(undefined),
      clearSyncQueue: vi.fn().mockReturnValue(undefined),
    })),
  })
);

describe("/api/video-conferencing/sync", () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("should return sync stats when action=stats", async () => {
      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/sync?action=stats"
      );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.queueLength).toBe(0);
      expect(data.data.totalProcessed).toBe(10);
    });

    it("should return health status when action=health", async () => {
      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/sync?action=health"
      );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.healthy).toBe(true);
      expect(data.data.status).toBe("operational");
    });

    it("should return general sync information by default", async () => {
      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/sync"
      );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.stats).toBeDefined();
      expect(data.data.supportedProviders).toEqual(["ZOOM", "MEET", "VIMEO"]);
      expect(data.data.supportedEventTypes).toContain("meeting.started");
    });

    it("should handle errors gracefully", async () => {
      // Mock an error in the service
      const mockSyncService = {
        getSyncStats: vi.fn().mockImplementation(() => {
          throw new Error("Service error");
        }),
      };

      vi.doMock(
        "@/features/video-conferencing/services/MeetingDataSyncService",
        () => ({
          MeetingDataSyncService: vi
            .fn()
            .mockImplementation(() => mockSyncService),
        })
      );

      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/sync?action=stats"
      );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to get sync information");
    });
  });

  describe("POST", () => {
    it("should handle manual sync action", async () => {
      const requestBody = {
        provider: "ZOOM",
        meetingId: "test-meeting-123",
        eventType: "meeting.started",
        payload: {
          meetingTitle: "Test Meeting",
        },
      };

      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/sync?action=manual",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.syncResult).toBeDefined();
      expect(data.data.eventId).toBeDefined();
    });

    it("should handle batch sync action", async () => {
      const requestBody = {
        events: [
          {
            provider: "ZOOM",
            meetingId: "meeting-1",
            eventType: "meeting.started",
          },
          {
            provider: "MEET",
            meetingId: "meeting-2",
            eventType: "meeting.ended",
          },
        ],
      };

      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/sync?action=batch",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalEvents).toBe(2);
      expect(data.data.results).toHaveLength(2);
    });

    it("should handle queue sync action", async () => {
      const requestBody = {
        events: [
          {
            provider: "VIMEO",
            meetingId: "meeting-1",
            eventType: "recording.completed",
          },
        ],
      };

      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/sync?action=queue",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.queuedEvents).toBe(1);
    });

    it("should validate manual sync request data", async () => {
      const invalidRequestBody = {
        provider: "INVALID_PROVIDER",
        meetingId: "",
        eventType: "",
      };

      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/sync?action=manual",
        {
          method: "POST",
          body: JSON.stringify(invalidRequestBody),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid manual sync data");
      expect(data.details).toBeDefined();
    });

    it("should validate batch sync request data", async () => {
      const invalidRequestBody = {
        events: [], // Empty events array
      };

      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/sync?action=batch",
        {
          method: "POST",
          body: JSON.stringify(invalidRequestBody),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid batch sync data");
    });

    it("should handle invalid action", async () => {
      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/sync?action=invalid",
        {
          method: "POST",
          body: JSON.stringify({}),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Invalid action");
    });

    it("should handle sync options", async () => {
      const requestBody = {
        provider: "ZOOM",
        meetingId: "test-meeting-123",
        eventType: "meeting.started",
        options: {
          forceUpdate: true,
          includeParticipants: true,
          includeRecordings: false,
        },
      };

      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/sync?action=manual",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("DELETE", () => {
    it("should clear sync queue when action=queue", async () => {
      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/sync?action=queue",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Sync queue cleared successfully");
    });

    it("should handle invalid delete action", async () => {
      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/sync?action=invalid",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Invalid action");
    });
  });

  describe("Error handling", () => {
    it("should handle malformed JSON in POST requests", async () => {
      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/sync?action=manual",
        {
          method: "POST",
          body: "invalid json",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it("should handle service errors in POST requests", async () => {
      // Mock service to throw error
      const mockSyncService = {
        syncFromWebhook: vi.fn().mockRejectedValue(new Error("Service error")),
      };

      vi.doMock(
        "@/features/video-conferencing/services/MeetingDataSyncService",
        () => ({
          MeetingDataSyncService: vi
            .fn()
            .mockImplementation(() => mockSyncService),
        })
      );

      const requestBody = {
        provider: "ZOOM",
        meetingId: "test-meeting-123",
        eventType: "meeting.started",
      };

      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/sync?action=manual",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to process sync request");
    });
  });

  describe("CORS handling", () => {
    it("should handle OPTIONS requests", async () => {
      mockRequest = new NextRequest(
        "http://localhost:3000/api/video-conferencing/sync",
        {
          method: "OPTIONS",
        }
      );

      const { OPTIONS } = await import("../route");
      const response = await OPTIONS(mockRequest);

      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(response.headers.get("Access-Control-Allow-Methods")).toContain(
        "GET"
      );
      expect(response.headers.get("Access-Control-Allow-Methods")).toContain(
        "POST"
      );
      expect(response.headers.get("Access-Control-Allow-Methods")).toContain(
        "DELETE"
      );
    });
  });
});
