/**
 * Video Space Analytics API Route
 * Handles analytics for a specific video space
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
 * GET /api/video-conferencing/spaces/[id]/analytics
 * Get analytics for a specific video space
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock analytics data for the specific space
    const mockSpaceAnalytics = {
      totalMeetings: 5,
      totalDuration: 3000, // in seconds (50 minutes)
      averageDuration: 600, // in seconds (10 minutes)
      totalParticipants: 25,
      averageParticipants: 5,
      averageEngagement: 0.87,
      microphoneUsage: 0.78,
      cameraUsage: 0.68,
      screenShareUsage: 0.42,
      chatActivity: 0.58,
      meetingsByDay: [
        { date: "2024-01-15", count: 1, duration: 600, participants: 5 },
        { date: "2024-01-16", count: 2, duration: 1200, participants: 10 },
        { date: "2024-01-17", count: 1, duration: 600, participants: 5 },
        { date: "2024-01-18", count: 1, duration: 600, participants: 5 },
      ],
      participantTrends: [
        { date: "2024-01-15", participants: 5, engagement: 0.85 },
        { date: "2024-01-16", participants: 10, engagement: 0.88 },
        { date: "2024-01-17", participants: 5, engagement: 0.9 },
        { date: "2024-01-18", participants: 5, engagement: 0.85 },
      ],
      topParticipants: [
        {
          name: "Ana Martín",
          email: "ana@example.com",
          sessions: 4,
          totalDuration: 2400,
          averageEngagement: 0.95,
        },
        {
          name: "Pedro Ruiz",
          email: "pedro@example.com",
          sessions: 3,
          totalDuration: 1800,
          averageEngagement: 0.88,
        },
        {
          name: "Laura Sánchez",
          email: "laura@example.com",
          sessions: 3,
          totalDuration: 1800,
          averageEngagement: 0.82,
        },
      ],
    };

    return NextResponse.json(mockSpaceAnalytics);
  } catch (error) {
    console.error(
      "Error in GET /api/video-conferencing/spaces/[id]/analytics:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
