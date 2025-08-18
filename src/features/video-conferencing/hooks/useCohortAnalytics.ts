/**
 * Custom hooks for cohort analytics functionality
 */
"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CohortAnalytics,
  EngagementTrendPoint,
  AnalyticsFilter,
} from "../types/analytics";
import type { InstructorMetrics } from "../components/cohorts/InstructorPerformance";

export interface CohortComparison {
  cohortId: string;
  name: string;
  metrics: {
    engagement: number;
    attendance: number;
    completion: number;
    retention: number;
  };
  trend: "up" | "down" | "stable";
  trendValue: number;
}

export interface AggregatedStats {
  totalCohorts: number;
  totalParticipants: number;
  totalSessions: number;
  averageEngagement: number;
  averageAttendance: number;
  averageCompletion: number;
  topPerformingCohort: string;
  improvementOpportunities: string[];
}

// API functions (these would be implemented in your API layer)
const cohortApi = {
  getCohortAnalytics: async (
    cohortId: string,
    filter?: AnalyticsFilter
  ): Promise<CohortAnalytics> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, JSON.stringify(value));
        }
      });
    }

    const response = await fetch(
      `/api/analytics/cohorts/${cohortId}?${params}`
    );
    if (!response.ok) throw new Error("Failed to fetch cohort analytics");
    return response.json();
  },

  getAllCohorts: async (
    filter?: AnalyticsFilter
  ): Promise<CohortAnalytics[]> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, JSON.stringify(value));
        }
      });
    }

    const response = await fetch(`/api/analytics/cohorts?${params}`);
    if (!response.ok) throw new Error("Failed to fetch cohorts");
    return response.json();
  },

  getInstructorMetrics: async (
    filter?: AnalyticsFilter
  ): Promise<InstructorMetrics[]> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, JSON.stringify(value));
        }
      });
    }

    const response = await fetch(`/api/analytics/instructors?${params}`);
    if (!response.ok) throw new Error("Failed to fetch instructor metrics");
    return response.json();
  },

  getAggregatedStats: async (
    filter?: AnalyticsFilter
  ): Promise<AggregatedStats> => {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, JSON.stringify(value));
        }
      });
    }

    const response = await fetch(`/api/analytics/aggregated?${params}`);
    if (!response.ok) throw new Error("Failed to fetch aggregated stats");
    return response.json();
  },

  exportCohortReport: async (
    cohortId: string,
    format: "pdf" | "excel"
  ): Promise<Blob> => {
    const response = await fetch(`/api/analytics/cohorts/${cohortId}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format }),
    });
    if (!response.ok) throw new Error("Failed to export cohort report");
    return response.blob();
  },
};

/**
 * Hook for single cohort analytics
 */
export function useCohortAnalytics(cohortId: string, filter?: AnalyticsFilter) {
  const {
    data: cohortData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["cohort-analytics", cohortId, filter],
    queryFn: () => cohortApi.getCohortAnalytics(cohortId, filter),
    enabled: !!cohortId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  return {
    cohortData,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for multiple cohorts comparison
 */
export function useCohortsComparison(filter?: AnalyticsFilter) {
  const {
    data: cohorts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["cohorts-comparison", filter],
    queryFn: () => cohortApi.getAllCohorts(filter),
    staleTime: 5 * 60 * 1000,
  });

  const cohortComparisons = useMemo((): CohortComparison[] => {
    return cohorts.map((cohort) => ({
      cohortId: cohort.cohortId,
      name: cohort.name,
      metrics: {
        engagement: cohort.performanceMetrics.averageEngagement,
        attendance: cohort.attendanceRate,
        completion: cohort.completionRate,
        retention: cohort.performanceMetrics.retentionRate,
      },
      trend: "stable", // This would be calculated based on historical data
      trendValue: 0,
    }));
  }, [cohorts]);

  const topPerformingCohorts = useMemo(() => {
    return [...cohortComparisons]
      .sort((a, b) => b.metrics.engagement - a.metrics.engagement)
      .slice(0, 5);
  }, [cohortComparisons]);

  const underperformingCohorts = useMemo(() => {
    return [...cohortComparisons]
      .sort((a, b) => a.metrics.engagement - b.metrics.engagement)
      .slice(0, 3);
  }, [cohortComparisons]);

  return {
    cohorts,
    cohortComparisons,
    topPerformingCohorts,
    underperformingCohorts,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for instructor performance analytics
 */
export function useInstructorAnalytics(filter?: AnalyticsFilter) {
  const {
    data: instructors = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["instructor-analytics", filter],
    queryFn: () => cohortApi.getInstructorMetrics(filter),
    staleTime: 5 * 60 * 1000,
  });

  const topInstructors = useMemo(() => {
    return [...instructors]
      .sort((a, b) => b.averageEngagement - a.averageEngagement)
      .slice(0, 5);
  }, [instructors]);

  const instructorsByMetric = useCallback(
    (metric: keyof InstructorMetrics) => {
      return [...instructors].sort((a, b) => {
        const aValue = typeof a[metric] === "number" ? a[metric] : 0;
        const bValue = typeof b[metric] === "number" ? b[metric] : 0;
        return (bValue as number) - (aValue as number);
      });
    },
    [instructors]
  );

  const averageMetrics = useMemo(() => {
    if (instructors.length === 0) return null;

    return {
      engagement:
        instructors.reduce((sum, i) => sum + i.averageEngagement, 0) /
        instructors.length,
      attendance:
        instructors.reduce((sum, i) => sum + i.averageAttendance, 0) /
        instructors.length,
      satisfaction:
        instructors.reduce((sum, i) => sum + (i.satisfactionScore || 0), 0) /
        instructors.length,
      onTimeRate:
        instructors.reduce((sum, i) => sum + i.onTimeRate, 0) /
        instructors.length,
      responseRate:
        instructors.reduce((sum, i) => sum + i.responseRate, 0) /
        instructors.length,
    };
  }, [instructors]);

  return {
    instructors,
    topInstructors,
    instructorsByMetric,
    averageMetrics,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for aggregated statistics
 */
export function useAggregatedStats(filter?: AnalyticsFilter) {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["aggregated-stats", filter],
    queryFn: () => cohortApi.getAggregatedStats(filter),
    staleTime: 5 * 60 * 1000,
  });

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for exporting cohort reports
 */
export function useCohortExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportCohortReport = useCallback(
    async (cohortId: string, format: "pdf" | "excel") => {
      setIsExporting(true);
      setExportError(null);

      try {
        const blob = await cohortApi.exportCohortReport(cohortId, format);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `cohort-report-${cohortId}.${format === "excel" ? "xlsx" : "pdf"}`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        setExportError(
          error instanceof Error ? error.message : "Export failed"
        );
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return {
    exportCohortReport,
    isExporting,
    exportError,
  };
}

/**
 * Hook for trend analysis
 */
export function useTrendAnalysis(engagementTrend: EngagementTrendPoint[]) {
  const trendAnalysis = useMemo(() => {
    if (engagementTrend.length < 2) {
      return {
        direction: "stable" as const,
        strength: 0,
        prediction: "insufficient data",
      };
    }

    // Calculate linear regression for trend
    const n = engagementTrend.length;
    const xValues = engagementTrend.map((_, index) => index);
    const yValues = engagementTrend.map((point) => point.engagementScore);

    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = yValues.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Determine trend direction and strength
    const direction = slope > 1 ? "up" : slope < -1 ? "down" : "stable";
    const strength = Math.abs(slope);

    // Simple prediction for next period
    const nextValue = slope * n + intercept;
    const prediction =
      nextValue > yValues[yValues.length - 1]
        ? "improving"
        : nextValue < yValues[yValues.length - 1]
          ? "declining"
          : "stable";

    return {
      direction,
      strength,
      prediction,
      slope,
      nextPredictedValue: Math.max(0, Math.min(100, nextValue)),
    };
  }, [engagementTrend]);

  return trendAnalysis;
}

/**
 * Hook for performance benchmarking
 */
export function usePerformanceBenchmarks() {
  const benchmarks = useMemo(
    () => ({
      engagement: {
        excellent: 85,
        good: 70,
        fair: 55,
        poor: 40,
      },
      attendance: {
        excellent: 90,
        good: 80,
        fair: 70,
        poor: 60,
      },
      completion: {
        excellent: 95,
        good: 85,
        fair: 75,
        poor: 65,
      },
      retention: {
        excellent: 90,
        good: 80,
        fair: 70,
        poor: 60,
      },
    }),
    []
  );

  const getBenchmarkLevel = useCallback(
    (metric: keyof typeof benchmarks, value: number) => {
      const thresholds = benchmarks[metric];
      if (value >= thresholds.excellent) return "excellent";
      if (value >= thresholds.good) return "good";
      if (value >= thresholds.fair) return "fair";
      return "poor";
    },
    [benchmarks]
  );

  const getBenchmarkColor = useCallback((level: string) => {
    switch (level) {
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "fair":
        return "text-yellow-600";
      case "poor":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  }, []);

  return {
    benchmarks,
    getBenchmarkLevel,
    getBenchmarkColor,
  };
}

/**
 * Hook for cohort filtering and search
 */
export function useCohortFilters() {
  const [filters, setFilters] = useState<AnalyticsFilter>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "engagement" | "attendance" | "completion"
  >("engagement");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const updateFilter = useCallback((key: keyof AnalyticsFilter, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery("");
  }, []);

  const appliedFiltersCount = useMemo(() => {
    return Object.keys(filters).length + (searchQuery ? 1 : 0);
  }, [filters, searchQuery]);

  return {
    filters,
    searchQuery,
    sortBy,
    sortOrder,
    appliedFiltersCount,
    updateFilter,
    clearFilters,
    setSearchQuery,
    setSortBy,
    setSortOrder,
  };
}
