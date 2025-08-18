/**
 * Participant Data Processor Service
 * Handles processing and analysis of participant data
 */

import { prisma } from "@/lib/prisma";
import { VideoProvider } from "@prisma/client";

export interface ParticipantEngagementMetrics {
  participantId: string;
  name: string;
  email: string | null;
  totalMeetings: number;
  totalDuration: number; // in seconds
  averageDuration: number;
  attendanceRate: number; // percentage
  cameraUsageRate: number; // percentage of time camera was on
  micUsageRate: number; // percentage of time mic was on
  screenShareDuration: number;
  chatActivity: number; // total chat messages
  engagementScore: number; // calculated engagement score (0-100)
  lastActiveDate: Date | null;
}

export interface CohortEngagementSummary {
  cohort: string;
  totalParticipants: number;
  totalMeetings: number;
  averageAttendance: number;
  averageEngagement: number;
  topParticipants: ParticipantEngagementMetrics[];
  engagementTrends: {
    date: string;
    averageEngagement: number;
    totalParticipants: number;
  }[];
}

export interface ParticipantProcessingResult {
  success: boolean;
  participantsProcessed: number;
  metricsCalculated: number;
  errors: string[];
  processingTime: number;
}

export class ParticipantDataProcessor {
  /**
   * Process participant data for engagement metrics
   */
  async processParticipantEngagement(
    videoSpaceIds?: string[],
    dateRange?: { start: Date; end: Date }
  ): Promise<ParticipantProcessingResult> {
    const startTime = Date.now();
    const result: ParticipantProcessingResult = {
      success: false,
      participantsProcessed: 0,
      metricsCalculated: 0,
      errors: [],
      processingTime: 0,
    };

    try {
      // Build where clause for filtering
      const whereClause: any = {};

      if (videoSpaceIds && videoSpaceIds.length > 0) {
        whereClause.meetingRecord = {
          videoSpaceId: { in: videoSpaceIds },
        };
      }

      if (dateRange) {
        whereClause.joinTime = {
          gte: dateRange.start,
          lte: dateRange.end,
        };
      }

      // Get all participant records with meeting data
      const participantRecords = await prisma.participantRecord.findMany({
        where: whereClause,
        include: {
          meetingRecord: {
            include: {
              videoSpace: {
                select: {
                  id: true,
                  name: true,
                  cohort: true,
                  provider: true,
                },
              },
            },
          },
        },
      });

      // Group participants by unique identifier (email or participantId)
      const participantGroups =
        this.groupParticipantsByIdentity(participantRecords);

      // Process each participant group
      for (const [participantKey, records] of participantGroups.entries()) {
        try {
          const metrics = await this.calculateParticipantMetrics(records);
          await this.storeParticipantMetrics(participantKey, metrics);

          result.participantsProcessed++;
          result.metricsCalculated++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          result.errors.push(
            `Failed to process participant ${participantKey}: ${errorMessage}`
          );
        }
      }

      result.success = result.errors.length === 0;
      result.processingTime = Date.now() - startTime;

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`Processing failed: ${errorMessage}`);
      result.processingTime = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Calculate engagement metrics for a cohort
   */
  async calculateCohortEngagement(
    cohort: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<CohortEngagementSummary> {
    try {
      // Build where clause
      const whereClause: any = {
        meetingRecord: {
          videoSpace: {
            cohort: cohort,
          },
        },
      };

      if (dateRange) {
        whereClause.joinTime = {
          gte: dateRange.start,
          lte: dateRange.end,
        };
      }

      // Get participant records for cohort
      const participantRecords = await prisma.participantRecord.findMany({
        where: whereClause,
        include: {
          meetingRecord: {
            include: {
              videoSpace: {
                select: {
                  id: true,
                  name: true,
                  cohort: true,
                },
              },
            },
          },
        },
      });

      // Group and calculate metrics
      const participantGroups =
        this.groupParticipantsByIdentity(participantRecords);
      const participantMetrics: ParticipantEngagementMetrics[] = [];

      for (const [participantKey, records] of participantGroups.entries()) {
        const metrics = await this.calculateParticipantMetrics(records);
        participantMetrics.push(metrics);
      }

      // Calculate cohort summary
      const totalParticipants = participantMetrics.length;
      const totalMeetings = new Set(
        participantRecords.map((r) => r.meetingRecordId)
      ).size;
      const averageAttendance =
        totalParticipants > 0
          ? participantMetrics.reduce((sum, p) => sum + p.attendanceRate, 0) /
            totalParticipants
          : 0;
      const averageEngagement =
        totalParticipants > 0
          ? participantMetrics.reduce((sum, p) => sum + p.engagementScore, 0) /
            totalParticipants
          : 0;

      // Get top participants (top 5 by engagement score)
      const topParticipants = participantMetrics
        .sort((a, b) => b.engagementScore - a.engagementScore)
        .slice(0, 5);

      // Calculate engagement trends (daily averages)
      const engagementTrends = await this.calculateEngagementTrends(
        cohort,
        dateRange
      );

      return {
        cohort,
        totalParticipants,
        totalMeetings,
        averageAttendance,
        averageEngagement,
        topParticipants,
        engagementTrends,
      };
    } catch (error) {
      console.error("Error calculating cohort engagement:", error);
      throw error;
    }
  }

  /**
   * Get participant engagement metrics
   */
  async getParticipantEngagementMetrics(filters?: {
    cohort?: string;
    videoSpaceIds?: string[];
    participantEmail?: string;
    dateRange?: { start: Date; end: Date };
  }): Promise<ParticipantEngagementMetrics[]> {
    try {
      // Build where clause
      const whereClause: any = {};

      if (filters?.cohort) {
        whereClause.meetingRecord = {
          videoSpace: {
            cohort: filters.cohort,
          },
        };
      }

      if (filters?.videoSpaceIds && filters.videoSpaceIds.length > 0) {
        whereClause.meetingRecord = {
          ...whereClause.meetingRecord,
          videoSpaceId: { in: filters.videoSpaceIds },
        };
      }

      if (filters?.participantEmail) {
        whereClause.email = filters.participantEmail;
      }

      if (filters?.dateRange) {
        whereClause.joinTime = {
          gte: filters.dateRange.start,
          lte: filters.dateRange.end,
        };
      }

      // Get participant records
      const participantRecords = await prisma.participantRecord.findMany({
        where: whereClause,
        include: {
          meetingRecord: {
            include: {
              videoSpace: {
                select: {
                  id: true,
                  name: true,
                  cohort: true,
                  provider: true,
                },
              },
            },
          },
        },
      });

      // Group and calculate metrics
      const participantGroups =
        this.groupParticipantsByIdentity(participantRecords);
      const metrics: ParticipantEngagementMetrics[] = [];

      for (const [participantKey, records] of participantGroups.entries()) {
        const participantMetrics =
          await this.calculateParticipantMetrics(records);
        metrics.push(participantMetrics);
      }

      return metrics.sort((a, b) => b.engagementScore - a.engagementScore);
    } catch (error) {
      console.error("Error getting participant engagement metrics:", error);
      throw error;
    }
  }

  /**
   * Group participant records by identity (email or participantId)
   */
  private groupParticipantsByIdentity(records: any[]): Map<string, any[]> {
    const groups = new Map<string, any[]>();

    for (const record of records) {
      // Use email as primary identifier, fallback to participantId
      const key = record.email || record.participantId;

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key)!.push(record);
    }

    return groups;
  }

  /**
   * Calculate engagement metrics for a participant
   */
  private async calculateParticipantMetrics(
    records: any[]
  ): Promise<ParticipantEngagementMetrics> {
    if (records.length === 0) {
      throw new Error("No records provided for metrics calculation");
    }

    // Get participant info from first record
    const firstRecord = records[0];
    const participantId = firstRecord.email || firstRecord.participantId;
    const name = firstRecord.name;
    const email = firstRecord.email;

    // Calculate basic metrics
    const totalMeetings = records.length;
    const totalDuration = records.reduce(
      (sum, r) => sum + (r.duration || 0),
      0
    );
    const averageDuration = totalDuration / totalMeetings;

    // Calculate camera and mic usage rates
    const totalCameraOnDuration = records.reduce(
      (sum, r) => sum + (r.cameraOnDuration || 0),
      0
    );
    const totalMicOnDuration = records.reduce(
      (sum, r) => sum + (r.micOnDuration || 0),
      0
    );
    const cameraUsageRate =
      totalDuration > 0 ? (totalCameraOnDuration / totalDuration) * 100 : 0;
    const micUsageRate =
      totalDuration > 0 ? (totalMicOnDuration / totalDuration) * 100 : 0;

    // Calculate screen share and chat activity
    const screenShareDuration = records.reduce(
      (sum, r) => sum + (r.screenShareDuration || 0),
      0
    );
    const chatActivity = records.reduce(
      (sum, r) => sum + (r.chatMessageCount || 0),
      0
    );

    // Get unique video spaces to calculate attendance rate
    const uniqueVideoSpaces = new Set(
      records.map((r) => r.meetingRecord.videoSpaceId)
    );

    // For attendance rate, we need to know total meetings in those video spaces
    const totalMeetingsInSpaces = await prisma.meetingRecord.count({
      where: {
        videoSpaceId: { in: Array.from(uniqueVideoSpaces) },
      },
    });

    const attendanceRate =
      totalMeetingsInSpaces > 0
        ? (totalMeetings / totalMeetingsInSpaces) * 100
        : 0;

    // Calculate engagement score (0-100)
    const engagementScore = this.calculateEngagementScore({
      attendanceRate,
      cameraUsageRate,
      micUsageRate,
      chatActivity,
      screenShareDuration,
      averageDuration,
    });

    // Get last active date
    const lastActiveDate = records.reduce(
      (latest, r) => {
        const recordDate = new Date(r.joinTime);
        return !latest || recordDate > latest ? recordDate : latest;
      },
      null as Date | null
    );

    return {
      participantId,
      name,
      email,
      totalMeetings,
      totalDuration,
      averageDuration,
      attendanceRate,
      cameraUsageRate,
      micUsageRate,
      screenShareDuration,
      chatActivity,
      engagementScore,
      lastActiveDate,
    };
  }

  /**
   * Calculate engagement score based on various factors
   */
  private calculateEngagementScore(factors: {
    attendanceRate: number;
    cameraUsageRate: number;
    micUsageRate: number;
    chatActivity: number;
    screenShareDuration: number;
    averageDuration: number;
  }): number {
    // Weighted scoring system
    const weights = {
      attendance: 0.3, // 30% - showing up is most important
      camera: 0.2, // 20% - visual engagement
      mic: 0.15, // 15% - audio participation
      chat: 0.15, // 15% - text interaction
      screenShare: 0.1, // 10% - content sharing
      duration: 0.1, // 10% - staying for full meeting
    };

    // Normalize factors to 0-100 scale
    const normalizedFactors = {
      attendance: Math.min(factors.attendanceRate, 100),
      camera: Math.min(factors.cameraUsageRate, 100),
      mic: Math.min(factors.micUsageRate, 100),
      chat: Math.min(factors.chatActivity * 10, 100), // Scale chat messages
      screenShare: Math.min((factors.screenShareDuration / 3600) * 100, 100), // Scale screen share time
      duration: Math.min((factors.averageDuration / 3600) * 100, 100), // Scale duration
    };

    // Calculate weighted score
    const score =
      normalizedFactors.attendance * weights.attendance +
      normalizedFactors.camera * weights.camera +
      normalizedFactors.mic * weights.mic +
      normalizedFactors.chat * weights.chat +
      normalizedFactors.screenShare * weights.screenShare +
      normalizedFactors.duration * weights.duration;

    return Math.round(Math.min(score, 100));
  }

  /**
   * Store participant metrics (for caching/optimization)
   */
  private async storeParticipantMetrics(
    participantKey: string,
    metrics: ParticipantEngagementMetrics
  ): Promise<void> {
    try {
      // Store in a separate metrics table for faster access
      await prisma.participantEngagementMetrics.upsert({
        where: { participantId: participantKey },
        update: {
          name: metrics.name,
          email: metrics.email,
          totalMeetings: metrics.totalMeetings,
          totalDuration: metrics.totalDuration,
          averageDuration: metrics.averageDuration,
          attendanceRate: metrics.attendanceRate,
          cameraUsageRate: metrics.cameraUsageRate,
          micUsageRate: metrics.micUsageRate,
          screenShareDuration: metrics.screenShareDuration,
          chatActivity: metrics.chatActivity,
          engagementScore: metrics.engagementScore,
          lastActiveDate: metrics.lastActiveDate,
          updatedAt: new Date(),
        },
        create: {
          participantId: participantKey,
          name: metrics.name,
          email: metrics.email,
          totalMeetings: metrics.totalMeetings,
          totalDuration: metrics.totalDuration,
          averageDuration: metrics.averageDuration,
          attendanceRate: metrics.attendanceRate,
          cameraUsageRate: metrics.cameraUsageRate,
          micUsageRate: metrics.micUsageRate,
          screenShareDuration: metrics.screenShareDuration,
          chatActivity: metrics.chatActivity,
          engagementScore: metrics.engagementScore,
          lastActiveDate: metrics.lastActiveDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Error storing participant metrics:", error);
      // Don't throw error here to avoid breaking the main processing flow
    }
  }

  /**
   * Calculate engagement trends over time
   */
  private async calculateEngagementTrends(
    cohort: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<
    { date: string; averageEngagement: number; totalParticipants: number }[]
  > {
    try {
      // Get daily engagement data
      const whereClause: any = {
        meetingRecord: {
          videoSpace: {
            cohort: cohort,
          },
        },
      };

      if (dateRange) {
        whereClause.joinTime = {
          gte: dateRange.start,
          lte: dateRange.end,
        };
      }

      const participantRecords = await prisma.participantRecord.findMany({
        where: whereClause,
        include: {
          meetingRecord: {
            select: {
              startTime: true,
            },
          },
        },
      });

      // Group by date
      const dailyData = new Map<string, any[]>();

      for (const record of participantRecords) {
        const date = record.meetingRecord.startTime.toISOString().split("T")[0];

        if (!dailyData.has(date)) {
          dailyData.set(date, []);
        }

        dailyData.get(date)!.push(record);
      }

      // Calculate daily averages
      const trends = [];

      for (const [date, records] of dailyData.entries()) {
        const participantGroups = this.groupParticipantsByIdentity(records);
        let totalEngagement = 0;

        for (const [
          participantKey,
          participantRecords,
        ] of participantGroups.entries()) {
          const metrics =
            await this.calculateParticipantMetrics(participantRecords);
          totalEngagement += metrics.engagementScore;
        }

        const averageEngagement =
          participantGroups.size > 0
            ? totalEngagement / participantGroups.size
            : 0;

        trends.push({
          date,
          averageEngagement: Math.round(averageEngagement),
          totalParticipants: participantGroups.size,
        });
      }

      return trends.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error("Error calculating engagement trends:", error);
      return [];
    }
  }
}
