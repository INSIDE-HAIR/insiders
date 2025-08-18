/**
 * Meeting Analytics API Route
 * Handles meeting analytics data
 */
import { NextRequest, NextResponse } from "next/server";

// Mock user for development
const getCurrentUser = async (request: NextRequest) => {
  return {
    id: "admin-user-1",
    email: "admin@example.com",
    role: "ADMIN",
    name: "Admin User",
  };
};

/**
 * GET /api/video-conferencing/analytics/meetings
 * Get meeting analytics
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock analytics data
    const mockAnalytics = {
      totalMeetings: 25,
      totalDuration: 15000, // in seconds
      averageDuration: 600, // in seconds
      totalParticipants: 150,
      averageParticipants: 6,
      averageEngagement: 0.85,
      microphoneUsage: 0.75,
      cameraUsage: 0.65,
      screenShareUsage: 0.45,
      chatActivity: 0.55,
      meetingsByDay: [
        { date: "2024-01-15", count: 3, duration: 1800, participants: 18 },
        { date: "2024-01-16", count: 5, duration: 3000, participants: 30 },
        { date: "2024-01-17", count: 2, duration: 1200, participants: 12 },
        { date: "2024-01-18", count: 4, duration: 2400, participants: 24 },
        { date: "2024-01-19", count: 6, duration: 3600, participants: 36 },
      ],
      meetingsByHour: [
        { hour: 9, count: 5, averageDuration: 600 },
        { hour: 10, count: 8, averageDuration: 720 },
        { hour: 11, count: 6, averageDuration: 540 },
        { hour: 14, count: 4, averageDuration: 480 },
        { hour: 15, count: 2, averageDuration: 360 },
      ],
      providerStats: [
        {
          provider: "GOOGLE_MEET",
          count: 12,
          duration: 7200,
          participants: 72,
        },
        { provider: "ZOOM", count: 8, duration: 4800, participants: 48 },
        { provider: "VIMEO", count: 5, duration: 3000, participants: 30 },
      ],
    };

    return NextResponse.json(mockAnalytics);
  } catch (error) {
    console.error(
      "Error in GET /api/video-conferencing/analytics/meetings:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
