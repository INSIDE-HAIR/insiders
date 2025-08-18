/**
 * Meeting Analytics API Endpoint
 * GET /api/video-spaces/[id]/analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/features/video-conferencing/services/AnalyticsService';
import { z } from 'zod';

// Query parameters validation schema
const analyticsQuerySchema = z.object({
  includeContent: z
    .string()
    .optional()
    .transform(val => val === 'true')
    .default(true),
  dateRange: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return undefined;
      try {
        const [start, end] = val.split(',');
        return {
          start: new Date(start),
          end: new Date(end)
        };
      } catch {
        return undefined;
      }
    }),
  format: z
    .enum(['json', 'csv', 'excel'])
    .optional()
    .default('json')
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryResult = analyticsQuerySchema.safeParse({
      includeContent: searchParams.get('includeContent'),
      dateRange: searchParams.get('dateRange'),
      format: searchParams.get('format')
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: queryResult.error.errors
        },
        { status: 400 }
      );
    }

    const { includeContent, dateRange, format } = queryResult.data;
    const meetingId = params.id;

    // Validate meeting ID format (MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(meetingId)) {
      return NextResponse.json(
        { error: 'Invalid meeting ID format' },
        { status: 400 }
      );
    }

    const analyticsService = new AnalyticsService();
    
    // Get meeting analytics
    const analytics = await analyticsService.getMeetingAnalytics(
      meetingId,
      includeContent
    );

    if (!analytics) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Apply date range filter if provided
    if (dateRange) {
      const meetingStart = new Date(analytics.startTime);\n      if (meetingStart < dateRange.start || meetingStart > dateRange.end) {\n        return NextResponse.json(\n          { error: 'Meeting outside specified date range' },\n          { status: 404 }\n        );\n      }\n    }\n\n    // Handle different response formats\n    switch (format) {\n      case 'csv':\n        return handleCSVExport(analytics);\n      case 'excel':\n        return handleExcelExport(analytics);\n      default:\n        return NextResponse.json({\n          success: true,\n          data: analytics,\n          metadata: {\n            generatedAt: new Date().toISOString(),\n            includeContent,\n            dateRange\n          }\n        });\n    }\n\n  } catch (error) {\n    console.error('Error getting meeting analytics:', error);\n    \n    return NextResponse.json(\n      { \n        error: 'Internal server error',\n        message: error instanceof Error ? error.message : 'Unknown error'\n      },\n      { status: 500 }\n    );\n  }\n}\n\n// Helper function to handle CSV export\nfunction handleCSVExport(analytics: any) {\n  const csvData = [\n    // Header\n    [\n      'Meeting ID',\n      'Title',\n      'Start Time',\n      'Duration (minutes)',\n      'Total Participants',\n      'Attended Participants',\n      'Engagement Score',\n      'Camera Usage Rate',\n      'Mic Usage Rate',\n      'Chat Messages',\n      'Screen Share Duration (minutes)',\n      'Provider',\n      'Cohort'\n    ],\n    // Data\n    [\n      analytics.meetingId,\n      analytics.title,\n      analytics.startTime,\n      Math.round(analytics.duration / 60),\n      analytics.participants.total,\n      analytics.participants.attended,\n      analytics.participants.engagementScore,\n      Math.round(analytics.engagement.cameraUsageRate),\n      Math.round(analytics.engagement.micUsageRate),\n      analytics.engagement.chatActivity,\n      Math.round(analytics.engagement.screenShareDuration / 60),\n      analytics.videoSpace.provider,\n      analytics.videoSpace.cohort || 'N/A'\n    ]\n  ];\n\n  const csvContent = csvData.map(row => \n    row.map(cell => `\"${cell}\"`).join(',')\n  ).join('\\n');\n\n  return new NextResponse(csvContent, {\n    headers: {\n      'Content-Type': 'text/csv',\n      'Content-Disposition': `attachment; filename=\"meeting-analytics-${analytics.meetingId}.csv\"`\n    }\n  });\n}\n\n// Helper function to handle Excel export\nfunction handleExcelExport(analytics: any) {\n  // For now, return CSV format with Excel MIME type\n  // In a real implementation, you would use a library like xlsx\n  const csvContent = handleCSVExport(analytics);\n  \n  return new NextResponse(csvContent.body, {\n    headers: {\n      'Content-Type': 'application/vnd.ms-excel',\n      'Content-Disposition': `attachment; filename=\"meeting-analytics-${analytics.meetingId}.xlsx\"`\n    }\n  });\n}\n\n// Export the handler for other HTTP methods if needed\nexport async function OPTIONS(request: NextRequest) {\n  return new NextResponse(null, {\n    status: 200,\n    headers: {\n      'Access-Control-Allow-Origin': '*',\n      'Access-Control-Allow-Methods': 'GET, OPTIONS',\n      'Access-Control-Allow-Headers': 'Content-Type, Authorization'\n    }\n  });\n}"