/**
 * Analytics Service Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { AnalyticsService } from "../AnalyticsService";
import { MeetingDataCollectionService } from "../MeetingDataCollectionService";
import { ParticipantDataProcessor } from "../ParticipantDataProcessor";
import { TranscriptionChatProcessor } from "../TranscriptionChatProcessor";
import { prisma } from "@/lib/prisma";
import { VideoProvider, MeetingStatus } from "@prisma/client";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    meetingRecord: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    videoSpace: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("../MeetingDataCollectionService");
vi.mock("../ParticipantDataProcessor");
vi.mock("../TranscriptionChatProcessor");

describe("AnalyticsService", () => {
  let service: AnalyticsService;
  let mockMeetingDataCollectionService: any;
  let mockParticipantDataProcessor: any;
  let mockTranscriptionChatProcessor: any;

  const mockMeetingRecord = {
    id: "507f1f77bcf86cd799439051",
    title: "Weekly Team Standup",
    startTime: new Date("2024-01-08T09:00:00Z"),
    endTime: new Date("2024-01-08T09:30:00Z"),
    duration: 1800,
    status: "ENDED" as MeetingStatus,
    totalParticipants: 5,
    recordingUrl: "https://example.com/recording.mp4",
    transcriptionUrl: null,
    chatLogUrl: null,
    videoSpace: {
      id: "507f1f77bcf86cd799439021",
      name: "Test Room",
      provider: "ZOOM" as VideoProvider,
      cohort: "Engineering Team",
    },
    participantRecords: [
      {
        id: "507f1f77bcf86cd799439061",
        participantId: "participant_1",
        name: "John Doe",
        email: "john@example.com",
        duration: 1800,
        isHost: true,
        cameraOnDuration: 1800,
        micOnDuration: 1800,
        chatMessageCount: 3,
        screenShareDuration: 300,
      },
      {
        id: "507f1f77bcf86cd799439062",
        participantId: "participant_2",
        name: "Jane Smith",
        email: "jane@example.com",
        duration: 1680,
        isHost: false,
        cameraOnDuration: 1200,
        micOnDuration: 1680,
        chatMessageCount: 1,
        screenShareDuration: 0,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AnalyticsService();
    mockMeetingDataCollectionService = vi.mocked(
      MeetingDataCollectionService
    ).prototype;
    mockParticipantDataProcessor = vi.mocked(
      ParticipantDataProcessor
    ).prototype;
    mockTranscriptionChatProcessor = vi.mocked(
      TranscriptionChatProcessor
    ).prototype;
  });

  describe("getMeetingAnalytics", () => {
    it("should return comprehensive meeting analytics", async () => {
      // Mock database call
      vi.mocked(prisma.meetingRecord.findUnique).mockResolvedValue(
        mockMeetingRecord
      );

      // Mock transcription and chat analysis
      mockTranscriptionChatProcessor.getTranscriptionAnalysis.mockResolvedValue(
        {
          meetingRecordId: mockMeetingRecord.id,
          keyTopics: ["standup", "updates", "blockers"],
          sentiment: "POSITIVE",
          actionItems: ["Update documentation", "Schedule follow-up"],
          summary: "Team discussed weekly updates and identified action items.",
        }
      );

      mockTranscriptionChatProcessor.getChatAnalysis.mockResolvedValue({
        meetingRecordId: mockMeetingRecord.id,
        totalMessages: 4,
        totalParticipants: 2,
      });

      const result = await service.getMeetingAnalytics(mockMeetingRecord.id);

      expect(result).toBeDefined();
      expect(result?.meetingId).toBe(mockMeetingRecord.id);
      expect(result?.title).toBe("Weekly Team Standup");
      expect(result?.videoSpace.name).toBe("Test Room");
      expect(result?.participants.total).toBe(2);
      expect(result?.participants.attended).toBe(2);
      expect(result?.content.hasTranscription).toBe(true);
      expect(result?.content.keyTopics).toEqual([
        "standup",
        "updates",
        "blockers",
      ]);
      expect(result?.recordings.hasRecording).toBe(true);
    });

    it("should return null for non-existent meeting", async () => {
      vi.mocked(prisma.meetingRecord.findUnique).mockResolvedValue(null);

      const result = await service.getMeetingAnalytics("nonexistent-id");

      expect(result).toBeNull();
    });

    it("should handle meetings without content analysis", async () => {
      vi.mocked(prisma.meetingRecord.findUnique).mockResolvedValue(
        mockMeetingRecord
      );

      mockTranscriptionChatProcessor.getTranscriptionAnalysis.mockResolvedValue(
        null
      );
      mockTranscriptionChatProcessor.getChatAnalysis.mockResolvedValue(null);

      const result = await service.getMeetingAnalytics(
        mockMeetingRecord.id,
        false
      );

      expect(result).toBeDefined();
      expect(result?.content.hasTranscription).toBe(false);
      expect(result?.content.hasChatMessages).toBe(false);
      expect(result?.content.keyTopics).toEqual([]);
    });

    it("should calculate participant engagement metrics correctly", async () => {
      vi.mocked(prisma.meetingRecord.findUnique).mockResolvedValue(
        mockMeetingRecord
      );

      const result = await service.getMeetingAnalytics(mockMeetingRecord.id);

      expect(result?.participants.total).toBe(2);
      expect(result?.participants.attended).toBe(2);
      expect(result?.participants.averageDuration).toBe(1740); // (1800 + 1680) / 2
      expect(result?.participants.topParticipants).toHaveLength(2);
      expect(result?.participants.topParticipants[0].name).toBe("John Doe");
    });

    it("should calculate engagement metrics correctly", async () => {
      vi.mocked(prisma.meetingRecord.findUnique).mockResolvedValue(
        mockMeetingRecord
      );

      const result = await service.getMeetingAnalytics(mockMeetingRecord.id);

      expect(result?.engagement).toBeDefined();
      expect(result?.engagement.cameraUsageRate).toBeGreaterThan(0);
      expect(result?.engagement.micUsageRate).toBeGreaterThan(0);
      expect(result?.engagement.chatActivity).toBe(4); // 3 + 1 messages
      expect(result?.engagement.screenShareDuration).toBe(300);
    });
  });

  describe("getCohortAnalytics", () => {
    it("should return cohort analytics with default date range", async () => {
      const cohort = "Engineering Team";

      const result = await service.getCohortAnalytics(cohort);

      expect(result).toBeDefined();
      expect(result.cohort).toBe(cohort);
      expect(result.timeRange).toBeDefined();
      expect(result.overview).toBeDefined();
      expect(result.engagement).toBeDefined();
      expect(result.trends).toBeDefined();
      expect(result.topPerformers).toBeDefined();
      expect(result.contentInsights).toBeDefined();
    });

    it("should use custom date range when provided", async () => {
      const cohort = "Engineering Team";
      const dateRange = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31"),
      };

      const result = await service.getCohortAnalytics(cohort, { dateRange });

      expect(result.timeRange.start).toEqual(dateRange.start);
      expect(result.timeRange.end).toEqual(dateRange.end);
    });

    it("should handle cohort with no data", async () => {
      const cohort = "Empty Cohort";

      const result = await service.getCohortAnalytics(cohort);

      expect(result).toBeDefined();
      expect(result.cohort).toBe(cohort);
      expect(result.overview.totalMeetings).toBe(0);
      expect(result.overview.totalParticipants).toBe(0);
    });
  });

  describe("getParticipantAnalytics", () => {
    it("should return participant analytics", async () => {
      const participantId = "john@example.com";

      const result = await service.getParticipantAnalytics(participantId);

      expect(result).toBeDefined();
      expect(result?.participantId).toBe(participantId);
      expect(result?.overview).toBeDefined();
      expect(result?.engagement).toBeDefined();
      expect(result?.meetingHistory).toBeDefined();
      expect(result?.trends).toBeDefined();
      expect(result?.cohortComparison).toBeDefined();
    });

    it("should return null for non-existent participant", async () => {
      const participantId = "nonexistent@example.com";

      const result = await service.getParticipantAnalytics(participantId);

      expect(result).toBeNull();
    });

    it("should apply filters correctly", async () => {
      const participantId = "john@example.com";
      const filters = {
        dateRange: {
          start: new Date("2024-01-01"),
          end: new Date("2024-01-31"),
        },
        cohorts: ["Engineering Team"],
      };

      const result = await service.getParticipantAnalytics(
        participantId,
        filters
      );

      // The result should be filtered based on the provided filters
      expect(result).toBeDefined();
    });
  });

  describe("getAggregatedAnalytics", () => {
    it("should return aggregated analytics across all dimensions", async () => {
      const result = await service.getAggregatedAnalytics();

      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.byProvider).toBeDefined();
      expect(result.byCohort).toBeDefined();
      expect(result.trends).toBeDefined();
      expect(result.performance).toBeDefined();

      // Check performance metrics
      expect(result.performance.queryExecutionTime).toBeGreaterThanOrEqual(0);
      expect(result.performance.dataPointsProcessed).toBeGreaterThanOrEqual(0);
      expect(result.performance.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(result.performance.memoryUsage).toBeGreaterThanOrEqual(0);
    });

    it("should apply filters to aggregated analytics", async () => {
      const filters = {
        dateRange: {
          start: new Date("2024-01-01"),
          end: new Date("2024-01-31"),
        },
        providers: ["ZOOM" as VideoProvider],
        cohorts: ["Engineering Team"],
      };

      const result = await service.getAggregatedAnalytics(filters);

      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it("should include performance metrics", async () => {
      const result = await service.getAggregatedAnalytics();

      expect(result.performance).toBeDefined();
      expect(typeof result.performance.queryExecutionTime).toBe("number");
      expect(typeof result.performance.dataPointsProcessed).toBe("number");
      expect(typeof result.performance.cacheHitRate).toBe("number");
      expect(typeof result.performance.memoryUsage).toBe("number");
    });
  });

  describe("refreshAnalyticsData", () => {
    it("should refresh data for specific video spaces", async () => {
      const videoSpaceIds = [
        "507f1f77bcf86cd799439021",
        "507f1f77bcf86cd799439022",
      ];

      // Mock collection service
      mockMeetingDataCollectionService.collectMeetingDataForVideoSpace.mockResolvedValue(
        {
          success: true,
          meetingsCollected: 2,
          participantsCollected: 5,
          transcriptionsCollected: 10,
          chatMessagesCollected: 15,
          errors: [],
          lastSyncTime: new Date(),
        }
      );

      // Mock processing services
      mockParticipantDataProcessor.processParticipantEngagement.mockResolvedValue(
        {
          success: true,
          participantsProcessed: 5,
          metricsCalculated: 5,
          errors: [],
          processingTime: 1000,
        }
      );

      mockTranscriptionChatProcessor.processTranscriptions.mockResolvedValue({
        success: true,
        transcriptionsProcessed: 10,
        chatMessagesProcessed: 0,
        analysisGenerated: 2,
        errors: [],
        processingTime: 2000,
      });

      mockTranscriptionChatProcessor.processChatMessages.mockResolvedValue({
        success: true,
        transcriptionsProcessed: 0,
        chatMessagesProcessed: 15,
        analysisGenerated: 2,
        errors: [],
        processingTime: 1500,
      });

      // Mock meeting records query
      vi.mocked(prisma.meetingRecord.findMany).mockResolvedValue([
        { id: "meeting1" },
        { id: "meeting2" },
      ]);

      const result = await service.refreshAnalyticsData(videoSpaceIds);

      expect(result.success).toBe(true);
      expect(result.meetingsProcessed).toBe(4); // 2 spaces × 2 meetings each
      expect(result.participantsProcessed).toBe(10);
      expect(result.errors).toHaveLength(0);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);

      expect(
        mockMeetingDataCollectionService.collectMeetingDataForVideoSpace
      ).toHaveBeenCalledTimes(2);
      expect(
        mockParticipantDataProcessor.processParticipantEngagement
      ).toHaveBeenCalledWith(videoSpaceIds, undefined);
    });

    it("should refresh all video spaces when none specified", async () => {
      // Mock video spaces query
      vi.mocked(prisma.videoSpace.findMany).mockResolvedValue([
        { id: "507f1f77bcf86cd799439021" },
        { id: "507f1f77bcf86cd799439022" },
      ]);

      // Mock collection service
      mockMeetingDataCollectionService.collectMeetingDataForVideoSpace.mockResolvedValue(
        {
          success: true,
          meetingsCollected: 1,
          participantsCollected: 3,
          transcriptionsCollected: 5,
          chatMessagesCollected: 8,
          errors: [],
          lastSyncTime: new Date(),
        }
      );

      // Mock meeting records query
      vi.mocked(prisma.meetingRecord.findMany).mockResolvedValue([]);

      const result = await service.refreshAnalyticsData();

      expect(result.success).toBe(true);
      expect(result.meetingsProcessed).toBe(2); // 2 spaces × 1 meeting each
      expect(
        mockMeetingDataCollectionService.collectMeetingDataForVideoSpace
      ).toHaveBeenCalledTimes(2);
    });

    it("should handle errors during refresh", async () => {
      const videoSpaceIds = ["507f1f77bcf86cd799439021"];

      // Mock collection service error
      mockMeetingDataCollectionService.collectMeetingDataForVideoSpace.mockRejectedValue(
        new Error("Collection failed")
      );

      const result = await service.refreshAnalyticsData(videoSpaceIds);

      expect(result.success).toBe(false);
      expect(result.meetingsProcessed).toBe(0);
      expect(result.errors).toContain(
        "Failed to refresh 507f1f77bcf86cd799439021: Collection failed"
      );
    });

    it("should apply date range filter", async () => {
      const videoSpaceIds = ["507f1f77bcf86cd799439021"];
      const dateRange = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31"),
      };

      mockMeetingDataCollectionService.collectMeetingDataForVideoSpace.mockResolvedValue(
        {
          success: true,
          meetingsCollected: 1,
          participantsCollected: 2,
          transcriptionsCollected: 3,
          chatMessagesCollected: 4,
          errors: [],
          lastSyncTime: new Date(),
        }
      );

      vi.mocked(prisma.meetingRecord.findMany).mockResolvedValue([]);

      await service.refreshAnalyticsData(videoSpaceIds, dateRange);

      expect(
        mockMeetingDataCollectionService.collectMeetingDataForVideoSpace
      ).toHaveBeenCalledWith(videoSpaceIds[0], dateRange);
    });
  });

  describe("caching", () => {
    it("should cache meeting analytics results", async () => {
      vi.mocked(prisma.meetingRecord.findUnique).mockResolvedValue(
        mockMeetingRecord
      );

      // First call
      const result1 = await service.getMeetingAnalytics(mockMeetingRecord.id);

      // Second call should use cache
      const result2 = await service.getMeetingAnalytics(mockMeetingRecord.id);

      expect(result1).toEqual(result2);
      expect(prisma.meetingRecord.findUnique).toHaveBeenCalledTimes(1);
    });

    it("should cache cohort analytics results", async () => {
      const cohort = "Engineering Team";

      // First call
      const result1 = await service.getCohortAnalytics(cohort);

      // Second call should use cache
      const result2 = await service.getCohortAnalytics(cohort);

      expect(result1).toEqual(result2);
    });

    it("should cache aggregated analytics results", async () => {
      // First call
      const result1 = await service.getAggregatedAnalytics();

      // Second call should use cache
      const result2 = await service.getAggregatedAnalytics();

      expect(result1).toEqual(result2);
    });
  });

  describe("error handling", () => {
    it("should handle database errors in getMeetingAnalytics", async () => {
      vi.mocked(prisma.meetingRecord.findUnique).mockRejectedValue(
        new Error("Database connection error")
      );

      await expect(service.getMeetingAnalytics("test-id")).rejects.toThrow(
        "Database connection error"
      );
    });

    it("should handle errors in getCohortAnalytics", async () => {
      // Mock a method that throws an error
      vi.spyOn(service as any, "getCohortOverview").mockRejectedValue(
        new Error("Cohort analysis error")
      );

      await expect(service.getCohortAnalytics("test-cohort")).rejects.toThrow(
        "Cohort analysis error"
      );
    });

    it("should handle errors in getAggregatedAnalytics", async () => {
      // Mock a method that throws an error
      vi.spyOn(service as any, "getAggregatedSummary").mockRejectedValue(
        new Error("Aggregation error")
      );

      await expect(service.getAggregatedAnalytics()).rejects.toThrow(
        "Aggregation error"
      );
    });
  });

  describe("engagement score calculation", () => {
    it("should calculate participant engagement score correctly", () => {
      const participant = {
        duration: 3600, // 1 hour
        cameraOnDuration: 1800, // 30 minutes
        micOnDuration: 2700, // 45 minutes
        chatMessageCount: 3,
      };

      const score = (service as any).calculateParticipantEngagementScore(
        participant
      );

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should return 0 for participant with no duration", () => {
      const participant = {
        duration: 0,
        cameraOnDuration: 0,
        micOnDuration: 0,
        chatMessageCount: 0,
      };

      const score = (service as any).calculateParticipantEngagementScore(
        participant
      );

      expect(score).toBe(0);
    });

    it("should handle missing engagement data", () => {
      const participant = {
        duration: 1800,
        cameraOnDuration: null,
        micOnDuration: null,
        chatMessageCount: null,
      };

      const score = (service as any).calculateParticipantEngagementScore(
        participant
      );

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
