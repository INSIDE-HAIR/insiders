/**
 * Video Conferencing Platform - Core Types
 * Unified types for Google Meet, Zoom, and Vimeo integrations
 */

// Re-export all provider-specific types
export * from "./meet";
export * from "./zoom";
export * from "./vimeo";

// =============================================================================
// Core Enums
// =============================================================================

export enum VideoProvider {
  MEET = "MEET",
  ZOOM = "ZOOM",
  VIMEO = "VIMEO",
}

export enum VideoSpaceStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DISABLED = "DISABLED",
  EXPIRED = "EXPIRED",
}

export enum MeetingStatus {
  SCHEDULED = "SCHEDULED",
  ACTIVE = "ACTIVE",
  ENDED = "ENDED",
  CANCELLED = "CANCELLED",
}

export enum IntegrationStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  REVOKED = "REVOKED",
  ERROR = "ERROR",
}

export enum ParticipantRole {
  HOST = "HOST",
  CO_HOST = "CO_HOST",
  PANELIST = "PANELIST",
  ATTENDEE = "ATTENDEE",
}

export enum RecordingType {
  VIDEO = "VIDEO",
  AUDIO_ONLY = "AUDIO_ONLY",
  SCREEN_SHARE = "SCREEN_SHARE",
  CHAT = "CHAT",
  TRANSCRIPT = "TRANSCRIPT",
}

// =============================================================================
// Core Interfaces
// =============================================================================

export interface VideoSpace {
  id: string;
  name: string;
  description?: string;
  provider: VideoProvider;
  status: VideoSpaceStatus;
  providerRoomId: string;
  providerJoinUri: string;
  providerData?: Record<string, any>;
  settings?: VideoSpaceSettings;
  ownerId: string;
  cohort?: string;
  tags: string[];
  addedToCalendar: boolean;
  calendarEventId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
  integrationAccountId: string;
}

export interface VideoSpaceSettings {
  // Recording settings
  autoRecord: boolean;
  recordingFormat: "MP4" | "AUDIO_ONLY";

  // Transcription settings
  enableTranscription: boolean;
  transcriptionLanguage: string;

  // Access control
  requireAuthentication: boolean;
  allowedDomains: string[];
  maxParticipants: number;

  // Meeting behavior
  muteOnEntry: boolean;
  enableChat: boolean;
  enableScreenShare: boolean;

  // Provider-specific settings
  providerSettings: Record<string, any>;
}

export interface MeetingRecord {
  id: string;
  videoSpaceId: string;
  providerMeetingId: string;
  title?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // Duration in minutes
  status: MeetingStatus;
  totalParticipants: number;
  maxConcurrentUsers: number;
  providerData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeetingParticipant {
  id: string;
  meetingRecordId: string;
  providerParticipantId: string;
  name: string;
  email?: string;
  role: ParticipantRole;
  joinTime: Date;
  leaveTime?: Date;
  duration: number; // Duration in minutes
  connectionCount: number;
  providerData?: Record<string, any>;
}

export interface MeetingTranscriptEntry {
  id: string;
  meetingRecordId: string;
  participantId?: string;
  speakerName?: string;
  text: string;
  timestamp: Date;
  startTime: number; // Seconds from meeting start
  endTime: number; // Seconds from meeting start
  language?: string;
  confidence?: number;
}

export interface MeetingChatMessage {
  id: string;
  meetingRecordId: string;
  participantId?: string;
  senderName: string;
  senderEmail?: string;
  message: string;
  timestamp: Date;
  messageType: "TEXT" | "FILE" | "SYSTEM";
  providerData?: Record<string, any>;
}

export interface MeetingRecordingFile {
  id: string;
  meetingRecordId: string;
  fileName: string;
  fileType: RecordingType;
  fileSize: number;
  duration?: number; // Duration in seconds
  downloadUrl: string;
  expiresAt?: Date;
  providerFileId: string;
  providerData?: Record<string, any>;
  createdAt: Date;
}

export interface IntegrationAccount {
  id: string;
  provider: VideoProvider;
  accountName: string;
  accountEmail?: string;
  accessToken: string; // Encrypted
  refreshToken?: string; // Encrypted
  tokenExpiry?: Date;
  scopes: string[];
  status: IntegrationStatus;
  lastSyncAt?: Date;
  userId: string;
  webhookConfig?: ProviderWebhookConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderWebhookConfig {
  webhookUrl: string;
  secretToken: string;
  events: string[];
  isActive: boolean;
  lastDeliveryAt?: Date;
  failureCount: number;
}

export interface LinkAlias {
  id: string;
  alias: string;
  videoSpaceId: string;
  videoSpace?: VideoSpace;
  isActive: boolean;
  accessCount: number;
  lastAccessedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// Request/Response Types
// =============================================================================

export interface CreateVideoSpaceRequest {
  name: string;
  description?: string;
  provider: VideoProvider;
  settings?: Partial<VideoSpaceSettings>;
  cohort?: string;
  tags?: string[];
  integrationAccountId: string;
}

export interface UpdateVideoSpaceRequest {
  name?: string;
  description?: string;
  settings?: Partial<VideoSpaceSettings>;
  cohort?: string;
  tags?: string[];
  addedToCalendar?: boolean;
  calendarEventId?: string;
}

export interface CreateLinkAliasRequest {
  alias: string;
  videoSpaceId: string;
}

export interface UpdateLinkAliasRequest {
  alias?: string;
  isActive?: boolean;
}

export interface LinkAliasFilters {
  videoSpaceId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface VideoSpaceFilters {
  provider?: VideoProvider;
  status?: VideoSpaceStatus;
  ownerId?: string;
  cohort?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface MeetingAnalytics {
  meetingRecord: MeetingRecord;
  participantCount: number;
  averageDuration: number;
  engagementScore: number;
  transcriptionAvailable: boolean;
  recordingAvailable: boolean;
  chatMessageCount: number;
}

export interface ParticipantAnalytics {
  participant: MeetingParticipant;
  totalMeetings: number;
  totalDuration: number;
  averageEngagement: number;
  lastActivity: Date;
}

export interface CohortStats {
  cohort: string;
  totalMeetings: number;
  totalParticipants: number;
  averageDuration: number;
  totalDuration: number;
  engagementTrends: Array<{
    date: Date;
    averageEngagement: number;
    participantCount: number;
  }>;
}

export interface AnalyticsFilters {
  videoSpaceId?: string;
  cohort?: string;
  ownerId?: string;
  provider?: VideoProvider;
  startDate?: Date;
  endDate?: Date;
  participantEmail?: string;
  participantName?: string;
}

export interface ReportFilters extends AnalyticsFilters {
  includeTranscripts?: boolean;
  includeChatMessages?: boolean;
  includeRecordings?: boolean;
}

export type ExportFormat = "CSV" | "EXCEL" | "JSON";

// =============================================================================
// Service Response Types
// =============================================================================

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface RealTimeStatus {
  videoSpaceId: string;
  status: VideoSpaceStatus;
  isLive: boolean;
  currentParticipants: number;
  lastChecked: Date;
}

// =============================================================================
// Error Types
// =============================================================================

export interface VideoConferencingError {
  message: string;
  code: string;
  provider?: VideoProvider;
  originalError?: Error;
}

export interface ProviderAuthError extends VideoConferencingError {
  code: "AUTH_ERROR";
}

export interface RoomCreationError extends VideoConferencingError {
  code: "ROOM_CREATION_ERROR";
}

export interface WebhookValidationError extends VideoConferencingError {
  code: "WEBHOOK_VALIDATION_ERROR";
}

// =============================================================================
// Utility Types
// =============================================================================

export type DateRange = {
  start: Date;
  end: Date;
};

export type EngagementMetrics = {
  totalDuration: number;
  averageParticipation: number;
  peakConcurrentUsers: number;
  dropOffRate: number;
  reJoinRate: number;
};

export type CalendarIntegrationData = {
  location: string;
  description: string;
  formattedDescription: string;
};
