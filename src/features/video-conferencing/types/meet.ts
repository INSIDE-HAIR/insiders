/**
 * Google Meet API v2 Types for Video Conferencing Platform
 * Based on docs/meet/types.ts with platform-specific adaptations
 */

// Re-export core Meet types from documentation
export type {
  GoogleOAuth2Client,
  GoogleTokens,
  AuthUrlOptions,
  GoogleCalendarClient,
  GoogleCalendar,
  GoogleCalendarEvent,
  ConferenceData,
  ConferenceEntryPoint,
  MeetSpace,
  SpaceConfig,
  ModerationRestrictions,
  ArtifactConfig,
  ActiveConference,
  ConferenceRecord,
  Recording,
  DriveDestination,
  Transcript,
  DocsDestination,
  TranscriptEntry,
  Participant,
  ParticipantSession,
  MeetSpaceAdvancedConfig,
  MeetSpaceCreateRequest,
  MeetSpaceUpdateRequest,
  MeetingAnalytics as MeetAnalytics,
  ParticipantAnalytics as MeetParticipantAnalytics,
  MeetingQualityMetrics,
  BulkMeetOperationRequest,
  BulkMeetOperationResponse,
  CalendarMeetIntegration,
  DriveMeetIntegration,
  GoogleApiError,
  MeetApiError,
  MeetApiClientOptions,
  MeetAuthConfig,
} from "../../../docs/meet/types";

// =============================================================================
// Platform-Specific Meet Types
// =============================================================================

export interface MeetVideoSpaceConfig {
  // Basic space configuration
  displayName?: string;
  description?: string;

  // Access control
  accessType?: "OPEN" | "TRUSTED" | "RESTRICTED";
  entryPointAccess?: "ALL" | "CREATOR_APP_ONLY";

  // Moderation settings
  moderation?: "ON" | "OFF";
  chatRestriction?: "HOSTS_ONLY" | "NO_RESTRICTION";
  presentRestriction?: "HOSTS_ONLY" | "NO_RESTRICTION";
  defaultJoinAsViewerType?: "ON" | "OFF";

  // Recording and transcription
  autoRecordingGeneration?: "ON" | "OFF";
  recordingStorage?: "GOOGLE_DRIVE" | "CLOUD_STORAGE";
  recordingQuality?: "HD" | "SD";
  recordingLayout?: "SPEAKER_VIEW" | "GALLERY_VIEW" | "PRESENTATION";

  autoTranscriptionGeneration?: "ON" | "OFF";
  transcriptionLanguage?: string;
  translationTargets?: string[];
  speakerIdentification?: boolean;

  // AI features
  autoSmartNotesGeneration?: "ON" | "OFF";
  summaryGeneration?: boolean;
  actionItemsExtraction?: boolean;
  keyTopicsIdentification?: boolean;

  // Captions and accessibility
  autoCaptionsEnabled?: boolean;
  captionLanguage?: string;
  translatedCaptions?: boolean;

  // Participation settings
  allParticipantsAsHosts?: boolean;
  breakoutRoomsEnabled?: boolean;
  maxParticipants?: number;
  requireAuthentication?: boolean;
  allowedDomains?: string[];

  // Meeting features
  chatEnabled?: boolean;
  screenSharingRestriction?: "ALL_PARTICIPANTS" | "HOSTS_ONLY";
  pollsEnabled?: boolean;
  whiteboardEnabled?: boolean;
  reactionsEnabled?: boolean;

  // Security settings
  waitingRoom?: boolean;
  meetingLock?: boolean;
  attendeeReporting?: boolean;
  endToEndEncryption?: boolean;

  // Attendance reporting
  attendanceReportGeneration?: "GENERATE_REPORT" | "DO_NOT_GENERATE";
}

export interface MeetRoomStatus {
  spaceId: string;
  isActive: boolean;
  activeConference?: {
    conferenceRecord: string;
    startTime: string;
    participantCount: number;
  };
  lastActivity?: string;
}

export interface MeetParticipantData {
  participantId: string;
  name: string;
  email?: string;
  joinTime: string;
  leaveTime?: string;
  duration: number;
  role: "host" | "participant";
  deviceType?: "DESKTOP" | "MOBILE" | "TABLET" | "PHONE";
  connectionQuality?: "GOOD" | "FAIR" | "POOR";
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharingUsed: boolean;
}

export interface MeetRecordingData {
  recordingId: string;
  fileName: string;
  fileType: "MP4" | "AUDIO";
  duration: number;
  fileSize: number;
  driveFileId?: string;
  downloadUrl: string;
  expiresAt?: string;
  startTime: string;
  endTime: string;
}

export interface MeetTranscriptData {
  transcriptId: string;
  language: string;
  entries: Array<{
    participantId?: string;
    speakerName?: string;
    text: string;
    startTime: string;
    endTime: string;
    confidence?: number;
  }>;
  docsFileId?: string;
  downloadUrl?: string;
}

export interface MeetWebhookPayload {
  eventType:
    | "conference.started"
    | "conference.ended"
    | "participant.joined"
    | "participant.left";
  eventTime: string;
  conferenceRecord: string;
  spaceId: string;
  data: {
    conference?: {
      startTime: string;
      endTime?: string;
    };
    participant?: {
      participantId: string;
      name: string;
      email?: string;
      joinTime?: string;
      leaveTime?: string;
    };
  };
}

// =============================================================================
// Meet Service Interfaces
// =============================================================================

export interface MeetServiceConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface MeetAuthResult {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scopes: string[];
  userEmail?: string;
}

export interface CreateMeetSpaceRequest {
  name: string;
  config?: MeetVideoSpaceConfig;
  calendarIntegration?: {
    eventId?: string;
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    attendees?: string[];
  };
}

export interface UpdateMeetSpaceRequest {
  config?: Partial<MeetVideoSpaceConfig>;
  name?: string;
}

export interface MeetSpaceResponse {
  spaceId: string;
  name: string;
  meetingUri: string;
  meetingCode?: string;
  config: MeetVideoSpaceConfig;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Meet Analytics Types
// =============================================================================

export interface MeetMeetingAnalytics {
  conferenceRecord: string;
  spaceId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  participantCount: number;
  maxConcurrentParticipants: number;
  totalJoinEvents: number;
  averageParticipationTime: number;
  recordingGenerated: boolean;
  transcriptionGenerated: boolean;
  smartNotesGenerated: boolean;
  qualityMetrics?: {
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
  };
}

export interface MeetEngagementMetrics {
  spaceId: string;
  totalMeetings: number;
  totalDuration: number;
  averageMeetingDuration: number;
  uniqueParticipants: number;
  averageParticipantsPerMeeting: number;
  participantRetentionRate: number;
  recordingUsageRate: number;
  transcriptionUsageRate: number;
  smartNotesUsageRate: number;
}

// =============================================================================
// Error Types
// =============================================================================

export interface MeetServiceError {
  code:
    | "MEET_AUTH_ERROR"
    | "MEET_API_ERROR"
    | "MEET_SPACE_ERROR"
    | "MEET_WEBHOOK_ERROR";
  message: string;
  details?: {
    apiError?: GoogleApiError;
    statusCode?: number;
    requestId?: string;
  };
}

// =============================================================================
// Constants
// =============================================================================

export const MEET_SCOPES = [
  "https://www.googleapis.com/auth/meetings.space.created",
  "https://www.googleapis.com/auth/meetings.space.readonly",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/drive.file",
] as const;

export const MEET_WEBHOOK_EVENTS = [
  "conference.started",
  "conference.ended",
  "participant.joined",
  "participant.left",
  "recording.completed",
  "transcript.completed",
] as const;

export const MEET_RECORDING_FORMATS = ["MP4", "AUDIO_ONLY"] as const;
export const MEET_TRANSCRIPTION_LANGUAGES = [
  "en-US",
  "es-ES",
  "fr-FR",
  "de-DE",
  "it-IT",
  "pt-BR",
] as const;
