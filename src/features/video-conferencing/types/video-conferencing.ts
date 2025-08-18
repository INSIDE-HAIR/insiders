import {
  VideoProvider,
  VideoSpaceStatus,
  MeetingStatus,
  IntegrationStatus,
} from "@prisma/client";

// Core Video Space interface
export interface VideoSpace {
  id: string;
  name: string;
  description?: string;
  provider: VideoProvider;
  status: VideoSpaceStatus;

  // Provider-specific identifiers
  providerRoomId: string;
  providerJoinUri?: string;
  providerData?: any;

  // Room configuration
  maxParticipants?: number;
  duration?: number;
  requiresAuth: boolean;
  recordingEnabled: boolean;
  chatEnabled: boolean;
  screenShareEnabled: boolean;
  waitingRoomEnabled: boolean;

  // Scheduling
  scheduledStartTime?: Date;
  scheduledEndTime?: Date;

  // Alias and routing
  alias?: string;

  // Integration
  integrationAccountId: string;
  integrationAccount?: IntegrationAccount;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastActivity?: Date;
  lastError?: string;

  // Related data
  meetingRecords?: MeetingRecord[];
  _count?: {
    meetingRecords: number;
  };
}

// Meeting Record interface
export interface MeetingRecord {
  id: string;
  videoSpaceId: string;
  videoSpace?: VideoSpace;

  // Provider-specific data
  providerMeetingId: string;
  meetingNumber?: string;

  // Meeting details
  title: string;
  description?: string;
  status: MeetingStatus;

  // Timing
  scheduledStartTime?: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  duration?: number;

  // Participants
  hostId?: string;
  hostName?: string;
  participantCount: number;
  maxParticipants?: number;

  // Features
  recordingEnabled: boolean;
  chatEnabled: boolean;
  screenShareEnabled: boolean;

  // Content
  recordingUrl?: string;
  recordingSize?: number;
  transcriptionText?: string;
  chatMessages?: ChatMessage[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Related data
  participants?: Participant[];
  _count?: {
    participants: number;
    chatMessages: number;
  };
}

// Participant interface
export interface Participant {
  id: string;
  meetingRecordId: string;
  meetingRecord?: MeetingRecord;

  // Participant details
  participantId: string;
  name: string;
  email?: string;
  role: "HOST" | "PARTICIPANT" | "MODERATOR";

  // Timing
  joinTime?: Date;
  leaveTime?: Date;
  duration?: number;

  // Engagement metrics
  microphoneTime?: number;
  cameraTime?: number;
  screenShareTime?: number;
  chatMessageCount: number;

  // Technical details
  device?: string;
  location?: string;
  ipAddress?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Chat Message interface
export interface ChatMessage {
  id: string;
  meetingRecordId: string;
  meetingRecord?: MeetingRecord;

  // Message details
  senderId: string;
  senderName: string;
  message: string;
  messageType: "TEXT" | "FILE" | "SYSTEM";

  // Timing
  timestamp: Date;

  // File details (if applicable)
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;

  // Metadata
  createdAt: Date;
}

// Integration Account interface
export interface IntegrationAccount {
  id: string;
  provider: VideoProvider;

  // Account details
  accountName: string;
  accountEmail: string;
  accountId: string;

  // OAuth tokens (encrypted)
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresAt?: Date;

  // Permissions
  scopes: string[];

  // Status
  status: IntegrationStatus;
  lastSyncAt?: Date;
  lastError?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Related data
  videoSpaces?: VideoSpace[];
  _count?: {
    videoSpaces: number;
  };
}

// Link Alias interface
export interface LinkAlias {
  id: string;
  alias: string;
  videoSpaceId: string;
  videoSpace?: VideoSpace;

  // Usage tracking
  clickCount: number;
  lastAccessedAt?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface VideoSpacesResponse {
  videoSpaces: VideoSpace[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface MeetingRecordsResponse {
  meetingRecords: MeetingRecord[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ParticipantsResponse {
  participants: Participant[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Analytics types
export interface MeetingAnalytics {
  totalMeetings: number;
  totalDuration: number;
  averageDuration: number;
  totalParticipants: number;
  averageParticipants: number;

  // Engagement metrics
  averageEngagement: number;
  microphoneUsage: number;
  cameraUsage: number;
  screenShareUsage: number;
  chatActivity: number;

  // Time-based analytics
  meetingsByDay: Array<{
    date: string;
    count: number;
    duration: number;
    participants: number;
  }>;

  meetingsByHour: Array<{
    hour: number;
    count: number;
    averageDuration: number;
  }>;

  // Provider breakdown
  providerStats: Array<{
    provider: VideoProvider;
    count: number;
    duration: number;
    participants: number;
  }>;
}

export interface ParticipantAnalytics {
  totalParticipants: number;
  uniqueParticipants: number;
  averageSessionDuration: number;

  // Engagement metrics
  topParticipants: Array<{
    name: string;
    email?: string;
    meetingCount: number;
    totalDuration: number;
    averageEngagement: number;
  }>;

  // Participation patterns
  participationByDay: Array<{
    date: string;
    uniqueParticipants: number;
    totalSessions: number;
  }>;

  // Device and location stats
  deviceStats: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;

  locationStats: Array<{
    location: string;
    count: number;
    percentage: number;
  }>;
}

export interface CohortAnalytics {
  cohortSize: number;
  retentionRate: number;
  averageLifetime: number;

  // Cohort data by time period
  cohortData: Array<{
    period: string;
    newParticipants: number;
    returningParticipants: number;
    retentionRate: number;
  }>;

  // Engagement trends
  engagementTrends: Array<{
    period: string;
    averageEngagement: number;
    activeSessions: number;
  }>;
}

// Export and download types
export interface ExportRequest {
  format: "CSV" | "EXCEL" | "PDF";
  type: "MEETINGS" | "PARTICIPANTS" | "ANALYTICS";
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    provider?: VideoProvider;
    videoSpaceIds?: string[];
  };
  includeDetails?: boolean;
}

export interface DownloadToken {
  token: string;
  expiresAt: Date;
  downloadUrl: string;
}

// Webhook types
export interface WebhookEvent {
  id: string;
  provider: VideoProvider;
  eventType: string;
  meetingId?: string;
  userId?: string;
  timestamp: Date;
  payload: Record<string, any>;
  processed: boolean;
  retryCount: number;
}

// Status monitoring types
export interface StatusCheck {
  videoSpaceId: string;
  status: VideoSpaceStatus;
  lastChecked: Date;
  responseTime?: number;
  participantCount?: number;
  isLive?: boolean;
  error?: string;
}

// Form types for UI components
export interface VideoSpaceFormData {
  title: string;
  description?: string;
  provider: VideoProvider;
  alias?: string;
  maxParticipants?: number;
  duration?: number;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  requiresAuth: boolean;
  recordingEnabled: boolean;
  chatEnabled: boolean;
  screenShareEnabled: boolean;
  waitingRoomEnabled: boolean;
  integrationAccountId: string;
}

export interface FilterOptions {
  provider?: VideoProvider | "ALL";
  status?: VideoSpaceStatus | "ALL";
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Error types
export interface VideoConferencingError {
  code: string;
  message: string;
  details?: Record<string, any>;
  provider?: VideoProvider;
  videoSpaceId?: string;
  timestamp: Date;
}
