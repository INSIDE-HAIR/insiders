/**
 * DatabaseOptimizationService Tests
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { DatabaseOptimizationService } from "../DatabaseOptimizationService";

// Mock Prisma Client
const mockPrisma = {
  videoSpace: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  participantData: {
    update: vi.fn(),
  },
  $transaction: vi.fn(),
  $queryRawUnsafe: vi.fn(),
} as unknown as PrismaClient;

describe("DatabaseOptimizationService", () => {
  let service: DatabaseOptimizationService;

  beforeEach(() => {
    service = new DatabaseOptimizationService(mockPrisma);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getOptimizedVideoSpaces", () => {
    it("should return paginated video spaces with performance metrics", async () => {
      const mockVideoSpaces = [
        {
          id: "1",
          title: "Test Meeting",
          provider: "GOOGLE_MEET",
          status: "active",
          createdBy: { id: "1", name: "Test User", email: "test@example.com" },
          _count: { participants: 5, analytics: 2 },
        },
      ];

      const mockCount = 1;

      (mockPrisma.$transaction as any).mockResolvedValue([
        mockVideoSpaces,
        mockCount,
      ]);

      const result = await service.getOptimizedVideoSpaces({
        page: 1,
        limit: 20,
        provider: "GOOGLE_MEET",
      });

      expect(result).toEqual({
        data: mockVideoSpaces,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
        performance: {
          executionTime: expect.any(Number),
          recordsReturned: 1,
        },
      });

      expect(mockPrisma.$transaction).toHaveBeenCalledWith([
        expect.objectContaining({
          where: { provider: "GOOGLE_MEET" },
          skip: 0,
          take: 20,
        }),
        expect.objectContaining({
          where: { provider: "GOOGLE_MEET" },
        }),
      ]);
    });

    it("should handle search filters correctly", async () => {
      const mockVideoSpaces = [];
      const mockCount = 0;

      (mockPrisma.$transaction as any).mockResolvedValue([
        mockVideoSpaces,
        mockCount,
      ]);

      await service.getOptimizedVideoSpaces({
        page: 1,
        limit: 20,
        search: "test meeting",
      });

      expect(mockPrisma.$transaction).toHaveBeenCalledWith([
        expect.objectContaining({
          where: {
            OR: [
              { title: { contains: "test meeting", mode: "insensitive" } },
              {
                description: { contains: "test meeting", mode: "insensitive" },
              },
            ],
          },
        }),
        expect.any(Object),
      ]);
    });

    it("should record performance metrics", async () => {
      (mockPrisma.$transaction as any).mockResolvedValue([[], 0]);

      await service.getOptimizedVideoSpaces({ page: 1, limit: 20 });

      const metrics = service.getPerformanceMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        queryType: "getOptimizedVideoSpaces",
        executionTime: expect.any(Number),
        recordsAffected: 0,
        timestamp: expect.any(Date),
        optimizationApplied: [
          "pagination",
          "selective_fields",
          "indexed_search",
        ],
      });
    });
  });

  describe("getOptimizedAnalytics", () => {
    it("should execute raw query for analytics aggregation", async () => {
      const mockResults = [
        {
          meetingId: "meeting1",
          provider: "GOOGLE_MEET",
          participant_count: 5,
          avg_engagement: 0.85,
          total_duration: 3600,
        },
      ];

      (mockPrisma.$queryRawUnsafe as any).mockResolvedValue(mockResults);

      const result = await service.getOptimizedAnalytics({
        meetingIds: ["meeting1"],
        includeParticipants: true,
      });

      expect(result).toEqual({
        data: mockResults,
        performance: {
          executionTime: expect.any(Number),
          recordsReturned: 1,
        },
      });

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        ["meeting1"],
        null,
        null
      );
    });

    it("should handle date range filters", async () => {
      const mockResults = [];
      (mockPrisma.$queryRawUnsafe as any).mockResolvedValue(mockResults);

      const dateRange = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31"),
      };

      await service.getOptimizedAnalytics({ dateRange });

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        null,
        dateRange.start,
        dateRange.end
      );
    });
  });

  describe("batchUpdateParticipants", () => {
    it("should process updates in batches", async () => {
      const updates = Array.from({ length: 250 }, (_, i) => ({
        id: `participant${i}`,
        engagementScore: 0.8,
        totalDuration: 1800,
      }));

      (mockPrisma.participantData.update as any).mockResolvedValue({});

      const result = await service.batchUpdateParticipants(updates);

      expect(result).toEqual({
        updated: 250,
        performance: {
          executionTime: expect.any(Number),
          batchesProcessed: 3, // 250 / 100 = 3 batches
        },
      });

      // Should be called 250 times (once per update)
      expect(mockPrisma.participantData.update).toHaveBeenCalledTimes(250);
    });

    it("should handle batch processing correctly", async () => {
      const updates = [
        { id: "1", engagementScore: 0.9 },
        { id: "2", totalDuration: 1200 },
        { id: "3", isActive: false },
      ];

      (mockPrisma.participantData.update as any).mockResolvedValue({});

      await service.batchUpdateParticipants(updates);

      expect(mockPrisma.participantData.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: {
          engagementScore: 0.9,
          updatedAt: expect.any(Date),
        },
      });

      expect(mockPrisma.participantData.update).toHaveBeenCalledWith({
        where: { id: "2" },
        data: {
          totalDuration: 1200,
          updatedAt: expect.any(Date),
        },
      });

      expect(mockPrisma.participantData.update).toHaveBeenCalledWith({
        where: { id: "3" },
        data: {
          isActive: false,
          updatedAt: expect.any(Date),
        },
      });
    });
  });

  describe("optimizedSearch", () => {
    it("should perform full-text search with relevance ranking", async () => {
      const mockResults = [
        {
          id: "1",
          title: "Test Meeting",
          relevance_score: 0.95,
        },
      ];

      (mockPrisma.$queryRawUnsafe as any).mockResolvedValue(mockResults);

      const result = await service.optimizedSearch({
        query: "test meeting",
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual({
        data: mockResults,
        performance: {
          executionTime: expect.any(Number),
          recordsReturned: 1,
        },
      });

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining("ts_rank"),
        "test meeting",
        "10",
        "0"
      );
    });

    it("should apply filters in search query", async () => {
      (mockPrisma.$queryRawUnsafe as any).mockResolvedValue([]);

      await service.optimizedSearch({
        query: "meeting",
        filters: {
          provider: "GOOGLE_MEET",
          status: "active",
        },
      });

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining("AND vs.provider = $2"),
        "meeting",
        "GOOGLE_MEET",
        "active",
        "20",
        "0"
      );
    });
  });

  describe("getIndexRecommendations", () => {
    it("should return index recommendations based on query patterns", () => {
      // Simulate some query metrics
      service["performanceMetrics"] = [
        {
          queryType: "getOptimizedVideoSpaces",
          executionTime: 500,
          recordsAffected: 10,
          timestamp: new Date(),
        },
        // Add more to trigger recommendations
        ...Array.from({ length: 15 }, () => ({
          queryType: "getOptimizedVideoSpaces",
          executionTime: 800,
          recordsAffected: 20,
          timestamp: new Date(),
        })),
      ];

      const recommendations = service.getIndexRecommendations();

      expect(recommendations).toContainEqual({
        table: "VideoSpace",
        columns: ["provider", "status", "scheduledStartTime"],
        reason: "Frequent filtering and sorting on these columns",
        estimatedImprovement: 40,
        priority: "high",
      });
    });
  });

  describe("generateOptimizationReport", () => {
    it("should generate comprehensive optimization report", () => {
      // Add some test metrics
      service["performanceMetrics"] = [
        {
          queryType: "getOptimizedVideoSpaces",
          executionTime: 1500, // Slow query
          recordsAffected: 10,
          timestamp: new Date(),
        },
        {
          queryType: "getOptimizedAnalytics",
          executionTime: 500,
          recordsAffected: 5,
          timestamp: new Date(),
        },
      ];

      const report = service.generateOptimizationReport();

      expect(report).toMatchObject({
        performanceSummary: {
          totalQueries: 2,
          averageExecutionTime: 1000,
          slowQueryCount: 1,
          mostFrequentQueryType: expect.any(String),
        },
        indexRecommendations: expect.any(Array),
        slowQueries: expect.arrayContaining([
          expect.objectContaining({
            executionTime: 1500,
          }),
        ]),
        cacheHitRates: {},
      });
    });
  });

  describe("clearOldMetrics", () => {
    it("should remove metrics older than specified hours", () => {
      const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      const recentDate = new Date();

      service["performanceMetrics"] = [
        {
          queryType: "old_query",
          executionTime: 500,
          recordsAffected: 10,
          timestamp: oldDate,
        },
        {
          queryType: "recent_query",
          executionTime: 300,
          recordsAffected: 5,
          timestamp: recentDate,
        },
      ];

      service.clearOldMetrics(24); // Clear metrics older than 24 hours

      const metrics = service.getPerformanceMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].queryType).toBe("recent_query");
    });
  });
});
