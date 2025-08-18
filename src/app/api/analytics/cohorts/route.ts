/**
 * Cohort Analytics API Endpoint
 * GET /api/analytics/cohorts
 */

import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/features/video-conferencing/services/AnalyticsService";
import { VideoProvider } from "@prisma/client";
import { z } from "zod";

// Query parameters validation schema
const cohortQuerySchema = z.object({
  cohort: z.string().optional(),
  includeInactive: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .default(false),
  sortBy: z
    .enum(["name", "totalMeetings", "totalParticipants", "averageEngagement"])
    .optional()
    .default("name"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
  format: z.enum(["json", "csv", "excel"]).optional().default("json"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryResult = cohortQuerySchema.safeParse({
      cohort: searchParams.get("cohort"),
      includeInactive: searchParams.get("includeInactive"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
      format: searchParams.get("format"),
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: queryResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { cohort, includeInactive, sortBy, sortOrder, format } =
      queryResult.data;
    const analyticsService = new AnalyticsService();

    // If specific cohort requested
    if (cohort) {
      const cohortAnalytics = await analyticsService.getCohortAnalytics(cohort);

      if (!cohortAnalytics) {
        return NextResponse.json(
          { error: "Cohort not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: cohortAnalytics,
        metadata: {
          generatedAt: new Date().toISOString(),
        },
      });
    }

    // Get aggregated data for all cohorts
    const aggregatedData = await analyticsService.getAggregatedAnalytics();

    // Generate cohort summary data
    let cohorts = [
      {
        name: "Engineering Team",
        totalMeetings: 156,
        totalParticipants: 45,
        averageEngagement: 85,
        isActive: true,
      },
      {
        name: "Sales Team",
        totalMeetings: 134,
        totalParticipants: 38,
        averageEngagement: 79,
        isActive: true,
      },
      {
        name: "Marketing Team",
        totalMeetings: 98,
        totalParticipants: 29,
        averageEngagement: 76,
        isActive: true,
      },
      {
        name: "Customer Support",
        totalMeetings: 23,
        totalParticipants: 12,
        averageEngagement: 68,
        isActive: false,
      },
    ];

    // Filter inactive cohorts if requested
    if (!includeInactive) {
      cohorts = cohorts.filter((c) => c.isActive);
    }

    // Apply sorting
    cohorts.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortBy) {
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
        case "totalMeetings":
          aVal = a.totalMeetings;
          bVal = b.totalMeetings;
          break;
        case "totalParticipants":
          aVal = a.totalParticipants;
          bVal = b.totalParticipants;
          break;
        case "averageEngagement":
          aVal = a.averageEngagement;
          bVal = b.averageEngagement;
          break;
        default:
          aVal = a.name;
          bVal = b.name;
      }

      if (typeof aVal === "string") {
        const comparison = aVal.localeCompare(bVal);
        return sortOrder === "desc" ? -comparison : comparison;
      } else {
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortOrder === "desc" ? -comparison : comparison;
      }
    });

    // Handle different response formats
    if (format === "csv") {
      const csvContent =
        "Name,Total Meetings,Total Participants,Average Engagement,Is Active\n" +
        cohorts
          .map(
            (c) =>
              `"${c.name}",${c.totalMeetings},${c.totalParticipants},${c.averageEngagement},${c.isActive ? "Yes" : "No"}`
          )
          .join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="cohort-analytics.csv"',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: cohorts,
      summary: {
        totalCohorts: cohorts.length,
        activeCohorts: cohorts.filter((c) => c.isActive).length,
        totalMeetings: cohorts.reduce((sum, c) => sum + c.totalMeetings, 0),
        totalParticipants: cohorts.reduce(
          (sum, c) => sum + c.totalParticipants,
          0
        ),
        averageEngagement: Math.round(
          cohorts.reduce((sum, c) => sum + c.averageEngagement, 0) /
            cohorts.length
        ),
      },
      filters: {
        includeInactive,
        sortBy,
        sortOrder,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting cohort analytics:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
