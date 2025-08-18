/**
 * Video Spaces Stats API Route
 * Handles video spaces statistics for dashboard
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
 * GET /api/video-conferencing/spaces/stats
 * Get video spaces statistics
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock stats data
    const mockStats = {
      totalSpaces: 12,
      activeSpaces: 3,
      scheduledSpaces: 5,
      completedSpaces: 4,
      totalMeetings: 36,
      totalParticipants: 248,
      averageParticipants: 6.9,
      attendanceRate: 94,
      providerBreakdown: {
        GOOGLE_MEET: 7,
        ZOOM: 3,
        VIMEO: 2,
      },
      recentActivity: [
        {
          id: "activity-1",
          type: "meeting_completed",
          spaceTitle: "Master IBM - Sesión 1",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          participants: 25,
          duration: 135, // minutes
        },
        {
          id: "activity-2",
          type: "space_created",
          spaceTitle: "Consultoría Estratégica",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          maxParticipants: 50,
        },
        {
          id: "activity-3",
          type: "integration_updated",
          provider: "VIMEO",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          status: "tokens_renewed",
        },
      ],
    };

    return NextResponse.json(mockStats);
  } catch (error) {
    console.error("Error in GET /api/video-conferencing/spaces/stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
