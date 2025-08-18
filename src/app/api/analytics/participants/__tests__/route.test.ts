/**
 * Participant Analytics API Endpoint Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../route";
import { AnalyticsService } from "@/features/video-conferencing/services/AnalyticsService";

// Mock the AnalyticsService
vi.mock("@/features/video-conferencing/services/AnalyticsService");

describe("/api/analytics/participants", () => {
  let mockAnalyticsService: any;

  const mockParticipantAnalytics = {
    participantId: "john.doe@example.com",
    overview: {
      name: "John Doe",
      email: "john.doe@example.com",
      totalMeetings: 45,
      totalDuration: 32400,
      averageEngagement: 85,
    },
    engagement: {
      cameraUsageRate: 90,
      micUsageRate: 95,
      chatParticipation: 78,
    },
    meetingHistory: [],
    trends: {},
    cohortComparison: {},
  };

  const mockAggregatedData = {
    summary: {
      totalMeetings: 500,
      totalParticipants: 150,
      averageEngagement: 78,
    },
    byProvider: {},
    byCohort: {},
    trends: {},
    performance: {
      queryExecutionTime: 150,
      dataPointsProcessed: 1000,
      cacheHitRate: 85,
      memoryUsage: 256,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAnalyticsService = vi.mocked(AnalyticsService).prototype;
  });

  describe("GET", () => {
    it("should return specific participant analytics when participantId provided", async () => {
      mockAnalyticsService.getParticipantAnalytics.mockResolvedValue(
        mockParticipantAnalytics
      );

      const request = new NextRequest(
        "http://localhost:3000/api/analytics/participants?participantId=john.doe@example.com"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockParticipantAnalytics);
      expect(mockAnalyticsService.getParticipantAnalytics).toHaveBeenCalledWith(
        "john.doe@example.com",
        expect.any(Object)
      );
    });

    it("should return 404 for non-existent participant", async () => {
      mockAnalyticsService.getParticipantAnalytics.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/analytics/participants?participantId=nonexistent@example.com"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Participant not found");
    });

    it("should return paginated participant list when no specific participant requested", async () => {
      mockAnalyticsService.getAggregatedAnalytics.mockResolvedValue(
        mockAggregatedData
      );

      const request = new NextRequest(
        "http://localhost:3000/api/analytics/participants"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(20);
    });

    it("should handle pagination parameters", async () => {
      mockAnalyticsService.getAggregatedAnalytics.mockResolvedValue(
        mockAggregatedData
      );

      const request = new NextRequest(
        "http://localhost:3000/api/analytics/participants?page=2&limit=10"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(10);
    });

    it("should handle service errors", async () => {
      mockAnalyticsService.getAggregatedAnalytics.mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/analytics/participants"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
      expect(data.message).toBe("Database error");
    });
  });
});
