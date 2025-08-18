/**
 * Cohort Analytics API Endpoint Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../route";
import { AnalyticsService } from "@/features/video-conferencing/services/AnalyticsService";

// Mock the AnalyticsService
vi.mock("@/features/video-conferencing/services/AnalyticsService");

describe("/api/analytics/cohorts", () => {
  let mockAnalyticsService: any;

  const mockCohortAnalytics = {
    cohort: "Engineering Team",
    timeRange: {
      start: new Date("2024-01-01"),
      end: new Date("2024-01-31"),
    },
    overview: {
      totalMeetings: 156,
      totalParticipants: 45,
      uniqueParticipants: 38,
      totalDuration: 89280,
      averageEngagement: 85,
    },
    engagement: {
      cameraUsageRate: 88,
      micUsageRate: 92,
      chatParticipation: 76,
    },
    trends: {},
    topPerformers: [],
    contentInsights: {},
  };

  const mockAggregatedData = {
    summary: {
      totalMeetings: 500,
      totalParticipants: 150,
      averageEngagement: 78,
    },
    byProvider: {},
    byCohort: {
      "Engineering Team": {
        meetingCount: 156,
        participantCount: 45,
        averageEngagement: 85,
      },
      "Sales Team": {
        meetingCount: 134,
        participantCount: 38,
        averageEngagement: 79,
      },
    },
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
    it("should return specific cohort analytics when cohort parameter provided", async () => {
      mockAnalyticsService.getCohortAnalytics.mockResolvedValue(
        mockCohortAnalytics
      );

      const request = new NextRequest(
        "http://localhost:3000/api/analytics/cohorts?cohort=Engineering Team"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockCohortAnalytics);
      expect(mockAnalyticsService.getCohortAnalytics).toHaveBeenCalledWith(
        "Engineering Team",
        expect.any(Object)
      );
    });

    it("should return 404 for non-existent cohort", async () => {
      mockAnalyticsService.getCohortAnalytics.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/analytics/cohorts?cohort=Nonexistent Team"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Cohort not found");
    });

    it("should return all cohorts summary when no specific cohort requested", async () => {
      mockAnalyticsService.getAggregatedAnalytics.mockResolvedValue(
        mockAggregatedData
      );

      const request = new NextRequest(
        "http://localhost:3000/api/analytics/cohorts"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.summary).toBeDefined();
      expect(data.summary.totalCohorts).toBeGreaterThan(0);
    });

    it("should handle service errors", async () => {
      mockAnalyticsService.getAggregatedAnalytics.mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/analytics/cohorts"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
      expect(data.message).toBe("Database error");
    });
  });
});
