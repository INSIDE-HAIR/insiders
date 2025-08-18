/**
 * Participant Analytics API Route
 * Handles participant analytics data
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
 * GET /api/video-conferencing/analytics/participants
 * Get participant analytics
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock participant analytics data
    const mockParticipantAnalytics = {
      totalParticipants: 150,
      uniqueParticipants: 85,
      averageSessionDuration: 1200, // in seconds
      topParticipants: [
        {
          name: "Juan Pérez",
          email: "juan@example.com",
          meetingCount: 12,
          totalDuration: 14400,
          averageEngagement: 0.92,
        },
        {
          name: "María García",
          email: "maria@example.com",
          meetingCount: 10,
          totalDuration: 12000,
          averageEngagement: 0.88,
        },
        {
          name: "Carlos López",
          email: "carlos@example.com",
          meetingCount: 8,
          totalDuration: 9600,
          averageEngagement: 0.85,
        },
      ],
      participationByDay: [
        { date: "2024-01-15", uniqueParticipants: 15, totalSessions: 18 },
        { date: "2024-01-16", uniqueParticipants: 25, totalSessions: 30 },
        { date: "2024-01-17", uniqueParticipants: 10, totalSessions: 12 },
        { date: "2024-01-18", uniqueParticipants: 20, totalSessions: 24 },
        { date: "2024-01-19", uniqueParticipants: 30, totalSessions: 36 },
      ],
      deviceStats: [
        { device: "Desktop", count: 95, percentage: 63.3 },
        { device: "Mobile", count: 35, percentage: 23.3 },
        { device: "Tablet", count: 20, percentage: 13.3 },
      ],
      locationStats: [
        { location: "Madrid", count: 45, percentage: 30.0 },
        { location: "Barcelona", count: 35, percentage: 23.3 },
        { location: "Valencia", count: 25, percentage: 16.7 },
        { location: "Sevilla", count: 20, percentage: 13.3 },
        { location: "Otros", count: 25, percentage: 16.7 },
      ],
    };

    return NextResponse.json(mockParticipantAnalytics);
  } catch (error) {
    console.error(
      "Error in GET /api/video-conferencing/analytics/participants:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
