/**
 * Participant Analytics API Endpoint
 * GET /api/analytics/participants
 */

import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/features/video-conferencing/services/AnalyticsService";
import { VideoProvider } from "@prisma/client";
import { z } from "zod";

// Query parameters validation schema
const participantQuerySchema = z.object({
  participantId: z.string().optional(),
  email: z.string().email().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, "Page must be positive"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),
  format: z.enum(["json", "csv", "excel"]).optional().default("json"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryResult = participantQuerySchema.safeParse({
      participantId: searchParams.get("participantId"),
      email: searchParams.get("email"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
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

    const { participantId, email, page, limit, format } = queryResult.data;
    const analyticsService = new AnalyticsService();

    // If specific participant requested
    if (participantId || email) {
      const identifier = participantId || email!;
      const participantAnalytics =
        await analyticsService.getParticipantAnalytics(identifier);

      if (!participantAnalytics) {
        return NextResponse.json(
          { error: "Participant not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: participantAnalytics,
        metadata: {
          generatedAt: new Date().toISOString(),
        },
      });
    }

    // Get aggregated participant data
    const aggregatedData = await analyticsService.getAggregatedAnalytics();

    // Mock participant list for demonstration
    const participants = [
      {
        participantId: "john.doe@example.com",
        name: "John Doe",
        email: "john.doe@example.com",
        totalMeetings: 45,
        averageEngagement: 85,
      },
      {
        participantId: "jane.smith@example.com",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        totalMeetings: 38,
        averageEngagement: 79,
      },
    ];

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedParticipants = participants.slice(startIndex, endIndex);

    const totalCount = participants.length;
    const totalPages = Math.ceil(totalCount / limit);

    // Handle different response formats
    if (format === "csv") {
      const csvContent =
        "Name,Email,Total Meetings,Average Engagement\n" +
        participants
          .map(
            (p) =>
              `"${p.name}","${p.email}",${p.totalMeetings},${p.averageEngagement}`
          )
          .join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition":
            'attachment; filename="participant-analytics.csv"',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: paginatedParticipants,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting participant analytics:", error);

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
