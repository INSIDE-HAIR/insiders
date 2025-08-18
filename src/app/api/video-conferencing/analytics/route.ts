/**
 * Video Conferencing Analytics API
 * Provides analytics data for the dashboard
 */
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createGlobalErrorHandler } from "@/src/features/video-conferencing/middleware/globalErrorHandler";
import { getCurrentUser } from "@/src/features/video-conferencing/middleware/authMiddleware";
import { AnalyticsService } from "@/src/features/video-conferencing/services/AnalyticsService";

const prisma = new PrismaClient();
const globalErrorHandler = createGlobalErrorHandler(prisma);
const analyticsService = new AnalyticsService(prisma);

/**
 * GET /api/video-conferencing/analytics
 * Get dashboard analytics
 */
export const GET = globalErrorHandler.wrapApiHandler(
  async (request: NextRequest) => {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const dateRange = searchParams.get("dateRange");
    const provider = searchParams.get("provider");

    // Calculate date range
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (dateRange) {
      const now = new Date();
      switch (dateRange) {
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      endDate = now;
    }

    // Get analytics data
    const [
      totalSpaces,
      activeSpaces,
      scheduledSpaces,
      completedSpaces,
      totalParticipants,
      totalDuration,
      averageEngagement,
      providerDistribution,
      recentActivity,
    ] = await Promise.all([
      // Total spaces
      prisma.videoSpace.count({
        where: {
          status: { not: "DELETED" },
          ...(startDate &&
            endDate && {
              createdAt: { gte: startDate, lte: endDate },
            }),
          ...(provider && { provider: provider as any }),
        },
      }),

      // Active spaces
      prisma.videoSpace.count({
        where: {
          status: "ACTIVE",
          ...(startDate &&
            endDate && {
              createdAt: { gte: startDate, lte: endDate },
            }),
          ...(provider && { provider: provider as any }),
        },
      }),

      // Scheduled spaces
      prisma.videoSpace.count({
        where: {
          status: "SCHEDULED",
          ...(startDate &&
            endDate && {
              createdAt: { gte: startDate, lte: endDate },
            }),
          ...(provider && { provider: provider as any }),
        },
      }),

      // Completed spaces
      prisma.videoSpace.count({
        where: {
          status: "COMPLETED",
          ...(startDate &&
            endDate && {
              createdAt: { gte: startDate, lte: endDate },
            }),
          ...(provider && { provider: provider as any }),
        },
      }),

      // Total participants (from analytics)
      prisma.meetingAnalytics.aggregate({
        _sum: { totalParticipants: true },
        where: {
          ...(startDate &&
            endDate && {
              createdAt: { gte: startDate, lte: endDate },
            }),
        },
      }),

      // Total duration
      prisma.meetingAnalytics.aggregate({
        _sum: { totalDuration: true },
        where: {
          ...(startDate &&
            endDate && {
              createdAt: { gte: startDate, lte: endDate },
            }),
        },
      }),

      // Average engagement
      prisma.meetingAnalytics.aggregate({
        _avg: { averageEngagement: true },
        where: {
          ...(startDate &&
            endDate && {
              createdAt: { gte: startDate, lte: endDate },
            }),
        },
      }),

      // Provider distribution
      prisma.videoSpace.groupBy({
        by: ["provider"],
        _count: { provider: true },
        where: {
          status: { not: "DELETED" },
          ...(startDate &&
            endDate && {
              createdAt: { gte: startDate, lte: endDate },
            }),
        },
      }),

      // Recent activity
      prisma.videoSpace.findMany({
        take: 10,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          provider: true,
          status: true,
          updatedAt: true,
          createdBy: {
            select: { name: true },
          },
        },
        where: {
          status: { not: "DELETED" },
          ...(startDate &&
            endDate && {
              createdAt: { gte: startDate, lte: endDate },
            }),
        },
      }),
    ]);

    // Format provider distribution
    const formattedProviderDistribution = providerDistribution.map((item) => ({
      provider: item.provider,
      count: item._count.provider,
      percentage:
        totalSpaces > 0
          ? Math.round((item._count.provider / totalSpaces) * 100)
          : 0,
    }));

    // Calculate trends (simplified - would need historical data for real trends)
    const trends = {
      totalSpaces: { value: totalSpaces, change: 12 }, // Mock trend
      participants: {
        value: totalParticipants._sum.totalParticipants || 0,
        change: 8,
      },
      duration: {
        value: Math.round((totalDuration._sum.totalDuration || 0) / 3600),
        change: 15,
      }, // Convert to hours
      engagement: {
        value: Math.round(
          (averageEngagement._avg.averageEngagement || 0) * 100
        ),
        change: 3,
      },
    };

    const analytics = {
      summary: {
        totalSpaces,
        activeSpaces,
        scheduledSpaces,
        completedSpaces,
        totalParticipants: totalParticipants._sum.totalParticipants || 0,
        totalDurationHours: Math.round(
          (totalDuration._sum.totalDuration || 0) / 3600
        ),
        averageEngagement: Math.round(
          (averageEngagement._avg.averageEngagement || 0) * 100
        ),
      },
      trends,
      providerDistribution: formattedProviderDistribution,
      recentActivity: recentActivity.map((activity) => ({
        id: activity.id,
        title: activity.title,
        provider: activity.provider,
        status: activity.status,
        updatedAt: activity.updatedAt,
        createdBy: activity.createdBy?.name || "Unknown",
      })),
    };

    return NextResponse.json(analytics);
  }
);
