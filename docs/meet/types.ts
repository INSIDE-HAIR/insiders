/**
 * Google Meet API v2 TypeScript Definitions
 * Extracted from .borrar-calendar-and-meet.ts reference file
 * https://developers.google.com/meet/api/
 */

// =============================================================================
// Google OAuth2 Types
// =============================================================================

// Google OAuth2Client wrapper - maps to google.auth.OAuth2
export interface GoogleOAuth2Client {
  getAccessToken(): Promise<{ token?: string }>;
  setCredentials(tokens: GoogleTokens): void;
  generateAuthUrl(options: AuthUrlOptions): string;
  getToken(code: string): Promise<{ tokens: GoogleTokens }>;
  credentials: GoogleTokens;
  // Note: refreshToken is protected in the actual OAuth2Client
  // We'll handle this with type assertions where needed
}

export interface GoogleTokens {
  access_token?: string;
  refresh_token?: string;
  expiry_date?: number;
  token_type?: string;
  scope?: string;
}

export interface AuthUrlOptions {
  access_type: 'offline' | 'online';
  scope: string[];
  redirect_uri?: string;
}

// =============================================================================
// Google Calendar API v3 Types (Meet Integration)
// =============================================================================

// Google Calendar client wrapper - maps to google.calendar('v3')
export interface GoogleCalendarClient {
  calendars: {
    list(): Promise<CalendarListResponse>;
  };
  events: {
    list(params: EventListParams): Promise<EventListResponse>;
    get(params: EventGetParams): Promise<EventResponse>;
    insert(params: EventInsertParams): Promise<EventResponse>;
    patch(params: EventUpdateParams): Promise<EventResponse>;
    update(params: EventUpdateParams): Promise<EventResponse>;
    delete(params: EventDeleteParams): Promise<void>;
  };
}

export interface CalendarListResponse {
  data: {
    items?: GoogleCalendar[];
  };
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
  accessRole?: string;
}

export interface EventListParams {
  calendarId: string;
  maxResults?: number;
  timeMin?: string;
  timeMax?: string;
  orderBy?: 'startTime' | 'updated';
  singleEvents?: boolean;
  conferenceDataVersion?: number;
}

export interface EventListResponse {
  data: {
    items?: GoogleCalendarEvent[];
  };
}

export interface EventGetParams {
  calendarId: string;
  eventId: string;
}

export interface EventResponse {
  data: GoogleCalendarEvent;
}

export interface EventInsertParams {
  calendarId: string;
  conferenceDataVersion?: number;
  resource: GoogleCalendarEvent;
}

export interface EventUpdateParams {
  calendarId: string;
  eventId: string;
  resource: Partial<GoogleCalendarEvent>;
}

export interface EventDeleteParams {
  calendarId: string;
  eventId: string;
}

export interface GoogleCalendarEvent {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: EventDateTime;
  end?: EventDateTime;
  attendees?: EventAttendee[];
  conferenceData?: ConferenceData;
  guestsCanInviteOthers?: boolean;
  guestsCanModify?: boolean;
  guestsCanSeeOtherGuests?: boolean;
  hangoutLink?: string;
  htmlLink?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  visibility?: 'default' | 'public' | 'private' | 'confidential';
}

export interface EventDateTime {
  dateTime?: string;
  date?: string;
  timeZone?: string;
}

export interface EventAttendee {
  email: string;
  displayName?: string;
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  optional?: boolean;
}

export interface ConferenceData {
  createRequest?: {
    requestId: string;
    conferenceSolutionKey: {
      type: 'hangoutsMeet';
    };
  };
  conferenceId?: string;
  conferenceSolution?: {
    key: {
      type: string;
    };
    name: string;
    iconUri: string;
  };
  entryPoints?: ConferenceEntryPoint[];
}

export interface ConferenceEntryPoint {
  entryPointType: 'video' | 'phone' | 'sip' | 'more';
  uri: string;
  label?: string;
  pin?: string;
  accessCode?: string;
  meetingCode?: string;
  passcode?: string;
  password?: string;
}

// =============================================================================
// Google Meet API v2 Types  
// =============================================================================

export interface MeetSpace {
  name: string;
  meetingUri?: string;
  meetingCode?: string;
  config?: SpaceConfig;
  activeConference?: ActiveConference;
}

export interface SpaceConfig {
  accessType?: 'OPEN' | 'TRUSTED' | 'RESTRICTED';
  entryPointAccess?: 'ALL' | 'CREATOR_APP_ONLY';
  moderation?: 'ON' | 'OFF';
  moderationRestrictions?: ModerationRestrictions;
  artifactConfig?: ArtifactConfig;
  attendanceReportGenerationType?: 'GENERATE_REPORT' | 'DO_NOT_GENERATE';
}

export interface ModerationRestrictions {
  chatRestriction?: 'HOSTS_ONLY' | 'NO_RESTRICTION';
  presentRestriction?: 'HOSTS_ONLY' | 'NO_RESTRICTION';
  defaultJoinAsViewerType?: 'ON' | 'OFF';
}

export interface ArtifactConfig {
  recordingConfig?: {
    autoRecordingGeneration: 'ON' | 'OFF';
  };
  transcriptionConfig?: {
    autoTranscriptionGeneration: 'ON' | 'OFF';
  };
  smartNotesConfig?: {
    autoSmartNotesGeneration: 'ON' | 'OFF';
  };
}

export interface ActiveConference {
  conferenceRecord?: string;
}

export interface ConferenceRecord {
  name: string;
  startTime?: string;
  endTime?: string;
  expireTime?: string;
  space?: string;
}

export interface Recording {
  name: string;
  driveDestination?: DriveDestination;
  state?: 'FILE_GENERATED' | 'GENERATING_FILE' | 'UPLOAD_IN_PROGRESS';
  startTime?: string;
  endTime?: string;
}

export interface DriveDestination {
  file?: string;
  exportUri?: string;
}

export interface Transcript {
  name: string;
  docsDestination?: DocsDestination;
  state?: 'FILE_GENERATED' | 'GENERATING_FILE' | 'UPLOAD_IN_PROGRESS';
  startTime?: string;
  endTime?: string;
}

export interface DocsDestination {
  document?: string;
  exportUri?: string;
}

export interface TranscriptEntry {
  name: string;
  participant?: string;
  text?: string;
  languageCode?: string;
  startTime?: string;
  endTime?: string;
}

export interface Participant {
  name: string;
  earliestStartTime?: string;
  latestEndTime?: string;
  signalingId?: string;
  anonymousUser?: AnonymousUser;
  phoneUser?: PhoneUser;
}

export interface AnonymousUser {
  displayName?: string;
}

export interface PhoneUser {
  displayName?: string;
}

export interface ParticipantSession {
  name: string;
  startTime?: string;
  endTime?: string;
}

// =============================================================================
// Meet API Extended Types (Enhanced Features)
// =============================================================================

export interface MeetSpaceAdvancedConfig {
  // Advanced recording settings
  recordingConfig?: {
    autoRecordingGeneration: 'ON' | 'OFF';
    recordingStorage: 'GOOGLE_DRIVE' | 'CLOUD_STORAGE';
    recordingQuality?: 'HD' | 'SD';
    recordingLayout?: 'SPEAKER_VIEW' | 'GALLERY_VIEW' | 'PRESENTATION';
  };
  
  // Advanced transcription settings
  transcriptionConfig?: {
    autoTranscriptionGeneration: 'ON' | 'OFF';
    transcriptionLanguage?: string;
    translationTargets?: string[];
    speakerIdentification?: boolean;
  };
  
  // Gemini AI features
  smartNotesConfig?: {
    autoSmartNotesGeneration: 'ON' | 'OFF';
    summaryGeneration?: boolean;
    actionItemsExtraction?: boolean;
    keyTopicsIdentification?: boolean;
  };
  
  // Captions and accessibility
  captionsConfig?: {
    autoCaptionsEnabled?: boolean;
    captionLanguage?: string;
    translatedCaptions?: boolean;
  };
  
  // Participation and moderation
  participantConfig?: {
    allParticipantsAsHosts?: boolean;
    breakoutRoomsEnabled?: boolean;
    maxParticipants?: number;
    requireAuthentication?: boolean;
    allowedDomains?: string[];
  };
  
  // Meeting features
  meetingFeatures?: {
    chatEnabled?: boolean;
    screenSharingRestriction?: 'ALL_PARTICIPANTS' | 'HOSTS_ONLY';
    pollsEnabled?: boolean;
    whiteboardEnabled?: boolean;
    reactionsCenabled?: boolean;
  };
  
  // Security settings
  securityConfig?: {
    waitingRoom?: boolean;
    meetingLock?: boolean;
    attendeeReporting?: boolean;
    endToEndEncryption?: boolean;
  };
}

export interface MeetSpaceCreateRequest {
  name?: string;
  config?: SpaceConfig & MeetSpaceAdvancedConfig;
  // Space settings from calendar integration
  calendarEvent?: {
    eventId?: string;
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    attendees?: string[];
  };
}

export interface MeetSpaceUpdateRequest {
  config?: Partial<SpaceConfig & MeetSpaceAdvancedConfig>;
  name?: string;
}

// =============================================================================
// Meet Analytics and Reporting
// =============================================================================

export interface MeetingAnalytics {
  conferenceRecord: string;
  duration?: number;
  participantCount?: number;
  maxConcurrentParticipants?: number;
  totalJoinEvents?: number;
  averageParticipationTime?: number;
  recordingGenerated?: boolean;
  transcriptionGenerated?: boolean;
  smartNotesGenerated?: boolean;
}

export interface ParticipantAnalytics {
  participant: string;
  totalDuration?: number;
  joinTime?: string;
  leaveTime?: string;
  deviceType?: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'PHONE';
  connectionQuality?: 'GOOD' | 'FAIR' | 'POOR';
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  screenSharingUsed?: boolean;
}

export interface MeetingQualityMetrics {
  audioQuality?: {
    averageBitrate?: number;
    packetLossRate?: number;
    jitter?: number;
    roundTripTime?: number;
  };
  videoQuality?: {
    averageBitrate?: number;
    resolution?: string;
    frameRate?: number;
    packetLossRate?: number;
  };
  networkCondition?: {
    averageBandwidth?: number;
    connectionType?: string;
    stabilityScore?: number;
  };
}

// =============================================================================
// Bulk Operations and Management
// =============================================================================

export interface BulkMeetOperationRequest {
  operations: Array<{
    operationType: 'CREATE_SPACE' | 'UPDATE_SPACE' | 'DELETE_SPACE' | 'END_CONFERENCE';
    spaceId?: string;
    config?: MeetSpaceCreateRequest | MeetSpaceUpdateRequest;
  }>;
  batchId?: string;
}

export interface BulkMeetOperationResponse {
  batchId: string;
  results: Array<{
    operationType: string;
    success: boolean;
    spaceId?: string;
    error?: string;
    result?: MeetSpace;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// =============================================================================
// Integration Types
// =============================================================================

export interface CalendarMeetIntegration {
  eventId: string;
  calendarId: string;
  spaceId?: string;
  meetingUri?: string;
  autoCreateMeet?: boolean;
  meetConfig?: MeetSpaceAdvancedConfig;
}

export interface DriveMeetIntegration {
  recordingFolderId?: string;
  transcriptFolderId?: string;
  autoUploadRecordings?: boolean;
  autoUploadTranscripts?: boolean;
  fileNamingPattern?: string;
}

// =============================================================================
// Error Types
// =============================================================================

export interface GoogleApiError extends Error {
  response?: {
    status: number;
    statusText: string;
    data?: {
      error?: {
        code: number;
        message: string;
        status: string;
        details?: any[];
      };
    };
  };
  code?: string;
}

export interface MeetApiError extends GoogleApiError {
  meetErrorCode?: string;
  meetErrorType?: 'SPACE_NOT_FOUND' | 'CONFERENCE_ENDED' | 'PERMISSION_DENIED' | 'QUOTA_EXCEEDED';
}

export interface NodeError extends Error {
  code?: string;
  errno?: number;
  syscall?: string;
  path?: string;
}

// =============================================================================
// Utility Types
// =============================================================================

export type GoogleAuthOAuth2Instance = any; // For compatibility with google.auth.OAuth2

export type GoogleCalendarInstance = any; // For compatibility with google.calendar

export type MeetApiResponse<T> = {
  data: T;
  status: number;
  statusText: string;
};

export interface MeetApiClientOptions {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  credentials?: {
    client_email: string;
    private_key: string;
    project_id: string;
  };
}

export interface MeetAuthConfig {
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  accessToken?: string;
  serviceAccountKey?: string;
  scopes?: string[];
}

// =============================================================================
// Export Combined Types Object
// =============================================================================

export const MeetTypes = {
  // Base OAuth2
  GoogleOAuth2Client,
  GoogleTokens,
  AuthUrlOptions,
  
  // Calendar Integration
  GoogleCalendarClient,
  GoogleCalendar,
  GoogleCalendarEvent,
  ConferenceData,
  ConferenceEntryPoint,
  
  // Meet Spaces
  MeetSpace,
  SpaceConfig,
  ModerationRestrictions,
  ArtifactConfig,
  MeetSpaceAdvancedConfig,
  MeetSpaceCreateRequest,
  MeetSpaceUpdateRequest,
  
  // Conferences and Sessions
  ConferenceRecord,
  ActiveConference,
  Participant,
  ParticipantSession,
  
  // Media and Content
  Recording,
  Transcript,
  TranscriptEntry,
  DriveDestination,
  DocsDestination,
  
  // Analytics
  MeetingAnalytics,
  ParticipantAnalytics,
  MeetingQualityMetrics,
  
  // Operations
  BulkMeetOperationRequest,
  BulkMeetOperationResponse,
  
  // Integrations
  CalendarMeetIntegration,
  DriveMeetIntegration,
  
  // Errors
  GoogleApiError,
  MeetApiError,
  NodeError,
  
  // Utilities
  MeetApiClientOptions,
  MeetAuthConfig
} as const;