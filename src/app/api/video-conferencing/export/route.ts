/**
 * Export API Endpoint
 * POST /api/video-conferencing/export
 */

import { NextRequest, NextResponse } from "next/server";
import {
  ExportService,
  ExportOptions,
} from "@/features/video-conferencing/services/ExportService";
import { AnalyticsService } from "@/features/video-conferencing/services/AnalyticsService";
import { z } from "zod";

// Request body validation schema
const exportRequestSchema = z.object({
  dataType: z.enum([
    "meeting",
    "participant",
    "cohort",
    "transcription",
    "chat",
  ]),
  format: z.enum(["csv", "excel", "txt", "docx", "json"]),
  filters: z
    .object({
      dateRange: z
        .object({
          start: z.string().datetime(),
          end: z.string().datetime(),
        })
        .optional(),
      cohorts: z.array(z.string()).optional(),
      providers: z.array(z.enum(["ZOOM", "MEET", "VIMEO"])).optional(),
      meetingIds: z.array(z.string()).optional(),
      participantIds: z.array(z.string()).optional(),
    })
    .optional(),
  options: z
    .object({
      includeHeaders: z.boolean().optional(),
      dateFormat: z.enum(["iso", "readable"]).optional(),
      delimiter: z.string().optional(),
      encoding: z.enum(["utf8", "utf16"]).optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = exportRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const {
      dataType,
      format,
      filters = {},
      options = {},
    } = validationResult.data;

    const exportService = new ExportService();
    const analyticsService = new AnalyticsService();

    // Validate export options
    const validation = exportService.validateExportOptions(dataType, {
      format,
      ...options,
    });
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Invalid export options",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    let exportResult;

    switch (dataType) {
      case "meeting":
        const meetingData = await getMeetingExportData(
          analyticsService,
          filters
        );
        exportResult = await exportService.exportMeetingData(meetingData, {
          format,
          ...options,
        });
        break;

      case "participant":
        const participantData = await getParticipantExportData(
          analyticsService,
          filters
        );
        exportResult = await exportService.exportParticipantData(
          participantData,
          { format, ...options }
        );
        break;

      case "cohort":
        const cohortData = await getCohortExportData(analyticsService, filters);
        exportResult = await exportService.exportCohortData(cohortData, {
          format,
          ...options,
        });
        break;

      case "transcription":
        if (!filters.meetingIds || filters.meetingIds.length !== 1) {
          return NextResponse.json(
            { error: "Transcription export requires exactly one meeting ID" },
            { status: 400 }
          );
        }
        const transcriptionData = await getTranscriptionData(
          filters.meetingIds[0]
        );
        exportResult = await exportService.exportTranscription(
          filters.meetingIds[0],
          transcriptionData,
          { format, ...options }
        );
        break;

      case "chat":
        if (!filters.meetingIds || filters.meetingIds.length !== 1) {
          return NextResponse.json(
            { error: "Chat export requires exactly one meeting ID" },
            { status: 400 }
          );
        }
        const chatData = await getChatData(filters.meetingIds[0]);
        exportResult = await exportService.exportChatMessages(
          filters.meetingIds[0],
          chatData,
          { format, ...options }
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unsupported data type: ${dataType}` },
          { status: 400 }
        );
    }

    // Return file as download
    return new NextResponse(exportResult.content, {
      headers: {
        "Content-Type": exportResult.mimeType,
        "Content-Disposition": `attachment; filename="${exportResult.filename}"`,
        "Content-Length": exportResult.content.length.toString(),
      },
    });
  } catch (error) {
    console.error("Export error:", error);

    return NextResponse.json(
      {
        error: "Export failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper functions to get data for export

async function getMeetingExportData(
  analyticsService: AnalyticsService,
  filters: any
) {
  // Mock implementation - in real app, this would query the database
  return [
    {
      meetingId: "meeting-123",
      title: "Weekly Team Standup",
      startTime: new Date("2024-01-08T09:00:00Z"),
      endTime: new Date("2024-01-08T09:30:00Z"),
      duration: 1800,
      status: "ENDED" as const,
      provider: "ZOOM" as const,
      cohort: "Engineering Team",
      participants: {
        total: 5,
        attended: 4,
        averageEngagement: 85,
      },
      engagement: {
        cameraUsageRate: 88,
        micUsageRate: 92,
        chatActivity: 12,
        screenShareDuration: 300,
      },
    },
  ];
}

async function getParticipantExportData(
  analyticsService: AnalyticsService,
  filters: any
) {
  // Mock implementation
  return [
    {
      participantId: "john.doe@example.com",
      name: "John Doe",
      email: "john.doe@example.com",
      totalMeetings: 45,
      totalDuration: 32400,
      averageEngagement: 85,
      lastActivity: new Date("2024-01-08T10:30:00Z"),
      cohorts: ["Engineering Team"],
      preferredProvider: "ZOOM" as const,
      metrics: {
        averageDuration: 720,
        cameraUsageRate: 90,
        micUsageRate: 95,
        chatParticipation: 78,
      },
    },
  ];
}

async function getCohortExportData(
  analyticsService: AnalyticsService,
  filters: any
) {
  // Mock implementation
  return [
    {
      name: "Engineering Team",
      description: "Software development and technical teams",
      totalMeetings: 156,
      totalParticipants: 45,
      uniqueParticipants: 38,
      totalDuration: 89280,
      averageEngagement: 85,
      lastActivity: new Date("2024-01-08T16:30:00Z"),
      isActive: true,
      metrics: {
        cameraUsageRate: 88,
        micUsageRate: 92,
        chatParticipation: 76,
        attendanceRate: 84,
      },
    },
  ];
}

async function getTranscriptionData(meetingId: string): Promise<string> {
  // Mock implementation
  return `This is a sample transcription for meeting ${meetingId}.

[00:00:00] John Doe: Good morning everyone, let's start our weekly standup.

[00:00:15] Jane Smith: Thanks John. I'll start with my updates from last week.

[00:00:30] Jane Smith: I completed the user authentication feature and deployed it to staging.

[00:01:00] Mike Johnson: Great work Jane. I've been working on the API documentation.

[00:01:30] Sarah Wilson: I've finished the UI mockups for the new dashboard.

[00:02:00] John Doe: Excellent progress everyone. Any blockers or concerns?

[00:02:30] Mike Johnson: No blockers on my end. The API is ready for testing.

[00:03:00] John Doe: Perfect. Let's wrap up here. Same time next week?

[00:03:15] All: Sounds good!

[00:03:30] John Doe: Meeting ended.`;
}

async function getChatData(meetingId: string) {
  // Mock implementation
  return [
    {
      timestamp: new Date("2024-01-08T09:05:00Z"),
      participant: "Jane Smith",
      message:
        "Here is the link to the staging environment: https://staging.example.com",
    },
    {
      timestamp: new Date("2024-01-08T09:10:00Z"),
      participant: "Mike Johnson",
      message: "Thanks! I will test the API endpoints today.",
    },
    {
      timestamp: new Date("2024-01-08T09:15:00Z"),
      participant: "Sarah Wilson",
      message: "The mockups are in the shared drive folder",
    },
    {
      timestamp: new Date("2024-01-08T09:20:00Z"),
      participant: "John Doe",
      message: "Great work everyone! 👏",
    },
  ];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dataType = searchParams.get("dataType");

  if (!dataType) {
    return NextResponse.json(
      { error: "dataType parameter is required" },
      { status: 400 }
    );
  }

  const exportService = new ExportService();
  const supportedFormats = exportService.getSupportedFormats(dataType as any);

  return NextResponse.json({
    dataType,
    supportedFormats,
    options: {
      dateFormats: ["iso", "readable"],
      encodings: ["utf8", "utf16"],
      csvDelimiters: [",", ";", "\t"],
    },
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
