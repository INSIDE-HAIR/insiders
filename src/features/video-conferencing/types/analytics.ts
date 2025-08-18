/**
 * Analytics types for video conferencing
 */
import { VideoProvider } from "@prisma/client";

export interface MeetingAnalytics {
  meetingId: string;
  title: string;
  provider: VideoProvider;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  participantCount: number;
  maxConcurrentParticipants: number;
  averageParticipants: number;
  participantEngagement: ParticipantEngagement;
  chatMessages: ChatMessageStats;
  transcriptionAvailable: boolean;
  recordingAvailable: boolean;
  participantStats?: ParticipantStats;
  engagementMetrics?: EngagementMetrics;
  technicalMetrics?: TechnicalMetrics;
}

export interface ParticipantEngagement {
  averageEngagementScore: number; // 0-1
  activeParticipants: number;
  averageAttentionTime: number; // in seconds
  interactionCount: number;
}

export interface ChatMessageStats {
  totalMessages: number;
  uniqueParticipants: number;
  averageMessagesPerParticipant: number;
  messageTypes: {
    text: number;
    file: number;
    link: number;
    image: number;
  };
}

export interface ParticipantStats {
  expectedParticipants: number;
  joinedOnTime: number;
  joinedLate: number;
  leftEarly: number;
  averageAttendanceTime: number; // in seconds
}

export interface EngagementMetrics {
  speakingTime: Record<string, number>; // participant ID -> seconds
  questionCount: number;
  pollResponses: number;
  screenShareTime: number;
  breakoutRoomUsage: number;
}

export interface TechnicalMetrics {
  audioQuality: {
    averageScore: number; // 0-100
    issueCount: number;
  };
  videoQuality: {
    averageScore: number; // 0-100
    issueCount: number;
  };
  connectionIssues: number;
  audioIssues: number;
  videoIssues: number;
  networkLatency: number; // in ms
}

export interface ParticipantData {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role: "host" | "co-host" | "participant";
  joinTime: Date;
  leaveTime?: Date;
  totalDuration: number; // in seconds
  isActive: boolean;
  engagementScore: number; // 0-100
  chatMessages: number;
  speakingTime: number; // in seconds
  hadAudioIssues: boolean;
  hadVideoIssues: boolean;
  leftEarly: boolean;
  joinedLate: boolean;
  attentionScore?: number; // 0-100
  interactionCount?: number;
}

export interface TranscriptionSegment {
  id: string;
  timestamp: Date;
  speaker: string;
  speakerAvatar?: string;
  text: string;
  confidence?: number; // 0-1
  language?: string;
  isQuestion?: boolean;
  keywords?: string[];
}

export interface ChatMessage {
  id: string;
  timestamp: Date;
  sender: string;
  senderAvatar?: string;
  content: string;
  type: "text" | "file" | "link" | "image";
  fileName?: string;
  fileSize?: string;
  isPrivate: boolean;
  replyTo?: string;
  reactions?: ChatReaction[];
}

export interface ChatReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface AnalyticsFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  providers?: VideoProvider[];
  participants?: string[];
  minDuration?: number;
  maxDuration?: number;
  hasRecording?: boolean;
  hasTranscription?: boolean;
  minParticipants?: number;
  maxParticipants?: number;
}

export interface AnalyticsExportOptions {
  format: "csv" | "excel" | "pdf";
  includeTranscription?: boolean;
  includeChatMessages?: boolean;
  includeParticipantDetails?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface CohortAnalytics {
  cohortId: string;
  name: string;
  description?: string;
  participantCount: number;
  meetingCount: number;
  totalDuration: number;
  averageMeetingDuration: number;
  averageParticipants: number;
  engagementTrend: EngagementTrendPoint[];
  attendanceRate: number;
  completionRate: number;
  topParticipants: ParticipantSummary[];
  performanceMetrics: CohortPerformanceMetrics;
}

export interface EngagementTrendPoint {
  date: Date;
  engagementScore: number;
  participantCount: number;
  meetingCount: number;
}

export interface ParticipantSummary {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  meetingsAttended: number;
  totalDuration: number;
  averageEngagement: number;
  lastActivity: Date;
}

export interface CohortPerformanceMetrics {
  averageEngagement: number;
  retentionRate: number;
  progressionRate: number;
  satisfactionScore?: number;
  knowledgeRetention?: number;
}

export interface AnalyticsDashboardData {
  overview: {
    totalMeetings: number;
    totalParticipants: number;
    totalDuration: number;
    averageEngagement: number;
  };
  recentMeetings: MeetingAnalytics[];
  topPerformers: ParticipantSummary[];
  engagementTrend: EngagementTrendPoint[];
  providerUsage: Record<VideoProvider, number>;
  alerts: AnalyticsAlert[];
}

export interface AnalyticsAlert {
  id: string;
  type: "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: Date;
  meetingId?: string;
  participantId?: string;
  resolved: boolean;
}
