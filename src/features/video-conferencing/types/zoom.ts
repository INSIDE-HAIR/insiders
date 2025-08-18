/**
 * Zoom API v2 Types for Video Conferencing Platform
 * Based on docs/zoom/types.ts with platform-specific adaptations
 */

// Re-export core Zoom types from documentation
export type {
  ZoomOAuthTokenResponse,
  ZoomServerToServerTokenResponse,
  ZoomApiError,
  ZoomPaginationResponse,
  MeetingType,
  MeetingStatus,
  JoinType,
  MeetingSettings,
  MeetingRecurrence,
  ZoomMeeting,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  MeetingListResponse,
  WebinarType,
  WebinarSettings,
  ZoomWebinar,
  CreateWebinarRequest,
  WebinarListResponse,
  MeetingParticipant,
  ParticipantsListResponse,
  UpdateParticipantStatusRequest,
  RecordingStatus,
  RecordingType,
  RecordingFile,
  ZoomRecording,
  RecordingListResponse,
  RecordingSettings,
  WebhookEvent,
  WebhookPayload,
  ZoomWebhook,
  WebhookSubscription,
  UserType,
  UserStatus,
  ZoomUser,
  CreateUserRequest,
  UserListResponse,
  MeetingRegistrant,
  CreateRegistrantRequest,
  RegistrantListResponse,
  MeetingReport,
  DailyUsageReport,
  ReportListResponse,
  DashboardMetrics,
  QualityOfService,
  ZoomApiResponse,
  ZoomApiListResponse,
  ZoomApiClientOptions,
  ZoomOAuthConfig,
  ZoomServerToServerConfig,
} from "../../../docs/zoom/types";

// =============================================================================
// Platform-Specific Zoom Types
// =============================================================================

export interface ZoomVideoSpaceConfig {
  // Basic meeting configuration
  topic: string;
  type?: MeetingType;
  startTime?: string;
  duration?: number;
  timezone?: string;
  password?: string;
  agenda?: string;

  // Meeting settings
  hostVideo?: boolean;
  participantVideo?: boolean;
  joinBeforeHost?: boolean;
  muteUponEntry?: boolean;
  watermark?: boolean;
  usePmi?: boolean;
  approvalType?: 0 | 1 | 2; // 0=Automatically, 1=Manually, 2=No registration
  registrationType?: 1 | 2 | 3;
  audio?: "both" | "telephony" | "voip";
  autoRecording?: "local" | "cloud" | "none";
  enforceLogin?: boolean;
  enforceLoginDomains?: string;
  alternativeHosts?: string;
  closeRegistration?: boolean;
  showShareButton?: boolean;
  allowMultipleDevices?: boolean;
  registrantsConfirmationEmail?: boolean;
  waitingRoom?: boolean;
  requestPermissionToUnmuteParticipants?: boolean;
  meetingAuthentication?: boolean;
  authenticationOption?: string;
  authenticationDomains?: string;
  authenticationName?: string;

  // Advanced features
  breakoutRoom?: {
    enable?: boolean;
    rooms?: Array<{
      name: string;
      participants: string[];
    }>;
  };
  languageInterpretation?: {
    enable?: boolean;
    interpreters?: Array<{
      email: string;
      languages: string;
    }>;
  };
  signLanguageInterpretation?: {
    enable?: boolean;
    interpreters?: Array<{
      email: string;
      signLanguage: string;
    }>;
  };

  // Recurrence settings
  recurrence?: {
    type: 1 | 2 | 3; // Daily, Weekly, Monthly
    repeatInterval: number;
    weeklyDays?: string;
    monthlyDay?: number;
    monthlyWeek?: number;
    monthlyWeekDay?: number;
    endTimes?: number;
    endDateTime?: string;
  };
}

export interface ZoomRoomStatus {
  meetingId: string;
  isActive: boolean;
  status: "waiting" | "started" | "ended";
  participantCount?: number;
  startTime?: string;
  duration?: number;
}

export interface ZoomParticipantData {
  participantId: string;
  userId?: string;
  name: string;
  userEmail?: string;
  joinTime: string;
  leaveTime?: string;
  duration: number;
  role: "host" | "co_host" | "panelist" | "attendee";
  audioQuality?: "good" | "fair" | "poor" | "unknown";
  videoQuality?: "good" | "fair" | "poor" | "unknown";
  screenShare: boolean;
  recording: boolean;
  sipPhone: boolean;
  h323: boolean;
  voip: boolean;
  phone: boolean;
  inWaitingRoom: boolean;
  location?: string;
  networkType?: string;
  microphone?: string;
  speaker?: string;
  camera?: string;
  dataCenter?: string;
  connectionType?: string;
  shareApplication: boolean;
  shareDesktop: boolean;
  shareWhiteboard: boolean;
  recordingConsent: boolean;
}

export interface ZoomRecordingData {
  recordingId: string;
  meetingId: string;
  fileName: string;
  fileType: "MP4" | "M4A" | "TIMELINE" | "TRANSCRIPT" | "CHAT" | "CC" | "CSV";
  fileExtension: string;
  fileSize: number;
  playUrl: string;
  downloadUrl: string;
  status: "completed" | "processing";
  recordingStart: string;
  recordingEnd: string;
  recordingType: RecordingType;
  deletedTime?: string;
}

export interface ZoomWebhookPayload {
  event: WebhookEvent;
  eventTs: number;
  payload: {
    accountId: string;
    object:
      | ZoomMeeting
      | ZoomWebinar
      | ZoomRecording
      | MeetingParticipant
      | any;
    operator?: string;
    operatorId?: string;
    operation?: string;
    timeStamp?: number;
  };
  downloadToken?: string;
}

// =============================================================================
// Zoom Service Interfaces
// =============================================================================

export interface ZoomServiceConfig {
  clientId: string;
  clientSecret: string;
  accountId?: string; // For Server-to-Server apps
  redirectUri?: string; // For OAuth apps
  scopes?: string[];
}

export interface ZoomAuthResult {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  tokenType: "Bearer";
  scopes: string[];
  accountId?: string;
}

export interface CreateZoomMeetingRequest {
  topic: string;
  config?: ZoomVideoSpaceConfig;
  scheduleFor?: string; // Email of user to schedule for
  templateId?: string;
  trackingFields?: Array<{
    field: string;
    value: string;
  }>;
}

export interface UpdateZoomMeetingRequest {
  config?: Partial<ZoomVideoSpaceConfig>;
  occurrenceId?: string; // For recurring meetings
}

export interface ZoomMeetingResponse {
  meetingId: number;
  uuid: string;
  hostId: string;
  hostEmail?: string;
  topic: string;
  type: MeetingType;
  status: MeetingStatus;
  startTime?: string;
  duration?: number;
  timezone?: string;
  password?: string;
  joinUrl: string;
  startUrl: string;
  createdAt: string;
  settings: ZoomVideoSpaceConfig;
}

// =============================================================================
// Zoom Analytics Types
// =============================================================================

export interface ZoomMeetingAnalytics {
  meetingId: string;
  uuid: string;
  topic: string;
  startTime: string;
  endTime: string;
  duration: number;
  participantCount: number;
  uniqueViewers: number;
  totalUsers: number;
  hasRecording: boolean;
  hasTranscript: boolean;
  hasPstn: boolean;
  hasVoip: boolean;
  has3rdPartyAudio: boolean;
  hasVideo: boolean;
  hasScreenShare: boolean;
  hasSip: boolean;
  hasArchiving: boolean;
  source: string;
}

export interface ZoomParticipantAnalytics {
  participantId: string;
  name: string;
  userEmail?: string;
  totalDuration: number;
  joinTime: string;
  leaveTime?: string;
  deviceType: "DESKTOP" | "MOBILE" | "TABLET" | "PHONE";
  connectionQuality: "GOOD" | "FAIR" | "POOR";
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharingUsed: boolean;
  attentionScore?: number;
  engagementScore?: number;
}

export interface ZoomEngagementMetrics {
  meetingId: string;
  totalMeetings: number;
  totalDuration: number;
  averageMeetingDuration: number;
  uniqueParticipants: number;
  averageParticipantsPerMeeting: number;
  participantRetentionRate: number;
  recordingUsageRate: number;
  screenShareUsageRate: number;
  chatUsageRate: number;
  pollUsageRate: number;
  breakoutRoomUsageRate: number;
}

export interface ZoomQualityMetrics {
  meetingId: string;
  overallQuality: "excellent" | "good" | "fair" | "poor";
  audioQuality: {
    averageBitrate: number;
    packetLossRate: number;
    jitter: number;
    roundTripTime: number;
  };
  videoQuality: {
    averageBitrate: number;
    resolution: string;
    frameRate: number;
    packetLossRate: number;
  };
  networkCondition: {
    averageBandwidth: number;
    connectionType: string;
    stabilityScore: number;
  };
  cpuUsage: {
    zoomMinCpuUsage: number;
    zoomAvgCpuUsage: number;
    zoomMaxCpuUsage: number;
    systemMaxCpuUsage: number;
  };
}

// =============================================================================
// Error Types
// =============================================================================

export interface ZoomServiceError {
  code:
    | "ZOOM_AUTH_ERROR"
    | "ZOOM_API_ERROR"
    | "ZOOM_MEETING_ERROR"
    | "ZOOM_WEBHOOK_ERROR";
  message: string;
  details?: {
    apiError?: ZoomApiError;
    statusCode?: number;
    requestId?: string;
    zoomErrorCode?: number;
  };
}

// =============================================================================
// Constants
// =============================================================================

export const ZOOM_OAUTH_SCOPES = [
  "meeting:write",
  "meeting:read",
  "webinar:write",
  "webinar:read",
  "recording:read",
  "report:read",
  "user:read",
  "dashboard:read",
] as const;

export const ZOOM_WEBHOOK_EVENTS = [
  "meeting.started",
  "meeting.ended",
  "meeting.participant_joined",
  "meeting.participant_left",
  "meeting.registration_created",
  "meeting.registration_approved",
  "meeting.registration_cancelled",
  "meeting.registration_denied",
  "recording.completed",
  "recording.transcript_completed",
] as const;

export const ZOOM_MEETING_TYPES = {
  INSTANT: 1,
  SCHEDULED: 2,
  RECURRING_NO_FIXED_TIME: 3,
  RECURRING_FIXED_TIME: 8,
  PAC: 4,
} as const;

export const ZOOM_RECORDING_FORMATS = [
  "MP4",
  "M4A",
  "TIMELINE",
  "TRANSCRIPT",
  "CHAT",
  "CC",
  "CSV",
] as const;

export const ZOOM_AUDIO_OPTIONS = ["both", "telephony", "voip"] as const;
export const ZOOM_AUTO_RECORDING_OPTIONS = ["local", "cloud", "none"] as const;
