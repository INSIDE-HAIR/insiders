/**
 * Zoom Validation Schemas
 * Zod schemas for Zoom API v2 specific types and configurations
 */

import { z } from "zod";

// =============================================================================
// Zoom Configuration Schemas
// =============================================================================

export const ZoomVideoSpaceConfigSchema = z
  .object({
    // Basic meeting configuration
    topic: z.string().min(1).max(200),
    type: z.enum(["1", "2", "3", "8"]).default("2"), // 1=Instant, 2=Scheduled, 3=Recurring no fixed time, 8=Recurring fixed time
    startTime: z.string().datetime().optional(),
    duration: z.number().int().min(1).max(1440).optional(), // Max 24 hours
    timezone: z.string().default("UTC"),
    password: z.string().min(1).max(10).optional(),
    agenda: z.string().max(2000).optional(),

    // Meeting settings
    hostVideo: z.boolean().default(true),
    participantVideo: z.boolean().default(true),
    joinBeforeHost: z.boolean().default(false),
    muteUponEntry: z.boolean().default(false),
    watermark: z.boolean().default(false),
    usePmi: z.boolean().default(false),
    approvalType: z.enum(["0", "1", "2"]).default("2"), // 0=Automatically, 1=Manually, 2=No registration
    registrationType: z.enum(["1", "2", "3"]).default("1"), // 1=Register once, 2=Register each occurrence, 3=Register once choose occurrences
    audio: z.enum(["both", "telephony", "voip"]).default("both"),
    autoRecording: z.enum(["local", "cloud", "none"]).default("none"),
    enforceLogin: z.boolean().default(false),
    enforceLoginDomains: z.string().optional(),
    alternativeHosts: z.string().optional(),
    closeRegistration: z.boolean().default(false),
    showShareButton: z.boolean().default(false),
    allowMultipleDevices: z.boolean().default(false),
    registrantsConfirmationEmail: z.boolean().default(true),
    waitingRoom: z.boolean().default(false),
    requestPermissionToUnmuteParticipants: z.boolean().default(false),
    meetingAuthentication: z.boolean().default(false),
    authenticationOption: z.string().optional(),
    authenticationDomains: z.string().optional(),
    authenticationName: z.string().optional(),

    // Advanced features
    breakoutRoom: z
      .object({
        enable: z.boolean().default(false),
        rooms: z
          .array(
            z.object({
              name: z.string().min(1).max(50),
              participants: z.array(z.string().email()),
            })
          )
          .optional(),
      })
      .optional(),

    languageInterpretation: z
      .object({
        enable: z.boolean().default(false),
        interpreters: z
          .array(
            z.object({
              email: z.string().email(),
              languages: z.string(),
            })
          )
          .optional(),
      })
      .optional(),

    signLanguageInterpretation: z
      .object({
        enable: z.boolean().default(false),
        interpreters: z
          .array(
            z.object({
              email: z.string().email(),
              signLanguage: z.string(),
            })
          )
          .optional(),
      })
      .optional(),

    // Recurrence settings
    recurrence: z
      .object({
        type: z.enum(["1", "2", "3"]), // 1=Daily, 2=Weekly, 3=Monthly
        repeatInterval: z.number().int().min(1).max(90),
        weeklyDays: z.string().optional(), // "1,2,3,4,5" for Mon-Fri
        monthlyDay: z.number().int().min(1).max(31).optional(),
        monthlyWeek: z.number().int().min(-1).max(4).optional(),
        monthlyWeekDay: z.number().int().min(1).max(7).optional(),
        endTimes: z.number().int().min(1).max(365).optional(),
        endDateTime: z.string().datetime().optional(),
      })
      .optional(),
  })
  .strict();

// =============================================================================
// Zoom Request/Response Schemas
// =============================================================================

export const CreateZoomMeetingRequestSchema = z
  .object({
    topic: z.string().min(1).max(200),
    config: ZoomVideoSpaceConfigSchema.optional(),
    scheduleFor: z.string().email().optional(), // Email of user to schedule for
    templateId: z.string().optional(),
    trackingFields: z
      .array(
        z.object({
          field: z.string(),
          value: z.string(),
        })
      )
      .optional(),
  })
  .strict();

export const UpdateZoomMeetingRequestSchema = z
  .object({
    config: ZoomVideoSpaceConfigSchema.partial().optional(),
    occurrenceId: z.string().optional(), // For recurring meetings
  })
  .strict();

export const ZoomMeetingResponseSchema = z
  .object({
    meetingId: z.number().int(),
    uuid: z.string(),
    hostId: z.string(),
    hostEmail: z.string().email().optional(),
    topic: z.string(),
    type: z.enum(["1", "2", "3", "8"]),
    status: z.enum(["waiting", "started", "ended"]),
    startTime: z.string().datetime().optional(),
    duration: z.number().int().optional(),
    timezone: z.string().optional(),
    password: z.string().optional(),
    joinUrl: z.string().url(),
    startUrl: z.string().url(),
    createdAt: z.string().datetime(),
    settings: ZoomVideoSpaceConfigSchema,
  })
  .strict();

// =============================================================================
// Zoom Status and Analytics Schemas
// =============================================================================

export const ZoomRoomStatusSchema = z
  .object({
    meetingId: z.string(),
    isActive: z.boolean(),
    status: z.enum(["waiting", "started", "ended"]),
    participantCount: z.number().int().min(0).optional(),
    startTime: z.string().datetime().optional(),
    duration: z.number().int().min(0).optional(),
  })
  .strict();

export const ZoomParticipantDataSchema = z
  .object({
    participantId: z.string(),
    userId: z.string().optional(),
    name: z.string(),
    userEmail: z.string().email().optional(),
    joinTime: z.string().datetime(),
    leaveTime: z.string().datetime().optional(),
    duration: z.number().int().min(0),
    role: z.enum(["host", "co_host", "panelist", "attendee"]),
    audioQuality: z.enum(["good", "fair", "poor", "unknown"]).optional(),
    videoQuality: z.enum(["good", "fair", "poor", "unknown"]).optional(),
    screenShare: z.boolean(),
    recording: z.boolean(),
    sipPhone: z.boolean(),
    h323: z.boolean(),
    voip: z.boolean(),
    phone: z.boolean(),
    inWaitingRoom: z.boolean(),
    location: z.string().optional(),
    networkType: z.string().optional(),
    microphone: z.string().optional(),
    speaker: z.string().optional(),
    camera: z.string().optional(),
    dataCenter: z.string().optional(),
    connectionType: z.string().optional(),
    shareApplication: z.boolean(),
    shareDesktop: z.boolean(),
    shareWhiteboard: z.boolean(),
    recordingConsent: z.boolean(),
  })
  .strict();

export const ZoomRecordingDataSchema = z
  .object({
    recordingId: z.string(),
    meetingId: z.string(),
    fileName: z.string(),
    fileType: z.enum([
      "MP4",
      "M4A",
      "TIMELINE",
      "TRANSCRIPT",
      "CHAT",
      "CC",
      "CSV",
    ]),
    fileExtension: z.string(),
    fileSize: z.number().int().min(0),
    playUrl: z.string().url(),
    downloadUrl: z.string().url(),
    status: z.enum(["completed", "processing"]),
    recordingStart: z.string().datetime(),
    recordingEnd: z.string().datetime(),
    recordingType: z.enum([
      "shared_screen_with_speaker_view",
      "shared_screen_with_gallery_view",
      "speaker_view",
      "gallery_view",
      "shared_screen",
      "audio_only",
      "audio_transcript",
      "chat_file",
      "active_speaker",
    ]),
    deletedTime: z.string().datetime().optional(),
  })
  .strict();

export const ZoomWebhookPayloadSchema = z
  .object({
    event: z.enum([
      "meeting.started",
      "meeting.ended",
      "meeting.participant_joined",
      "meeting.participant_left",
      "recording.completed",
    ]),
    eventTs: z.number().int(),
    payload: z.object({
      accountId: z.string(),
      object: z.record(z.any()),
      operator: z.string().optional(),
      operatorId: z.string().optional(),
      operation: z.string().optional(),
      timeStamp: z.number().int().optional(),
    }),
    downloadToken: z.string().optional(),
  })
  .strict();

// =============================================================================
// Zoom Analytics Schemas
// =============================================================================

export const ZoomMeetingAnalyticsSchema = z
  .object({
    meetingId: z.string(),
    uuid: z.string(),
    topic: z.string(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    duration: z.number().int().min(0),
    participantCount: z.number().int().min(0),
    uniqueViewers: z.number().int().min(0),
    totalUsers: z.number().int().min(0),
    hasRecording: z.boolean(),
    hasTranscript: z.boolean(),
    hasPstn: z.boolean(),
    hasVoip: z.boolean(),
    has3rdPartyAudio: z.boolean(),
    hasVideo: z.boolean(),
    hasScreenShare: z.boolean(),
    hasSip: z.boolean(),
    hasArchiving: z.boolean(),
    source: z.string(),
  })
  .strict();

export const ZoomParticipantAnalyticsSchema = z
  .object({
    participantId: z.string(),
    name: z.string(),
    userEmail: z.string().email().optional(),
    totalDuration: z.number().int().min(0),
    joinTime: z.string().datetime(),
    leaveTime: z.string().datetime().optional(),
    deviceType: z.enum(["DESKTOP", "MOBILE", "TABLET", "PHONE"]),
    connectionQuality: z.enum(["GOOD", "FAIR", "POOR"]),
    audioEnabled: z.boolean(),
    videoEnabled: z.boolean(),
    screenSharingUsed: z.boolean(),
    attentionScore: z.number().min(0).max(100).optional(),
    engagementScore: z.number().min(0).max(100).optional(),
  })
  .strict();

export const ZoomEngagementMetricsSchema = z
  .object({
    meetingId: z.string(),
    totalMeetings: z.number().int().min(0),
    totalDuration: z.number().min(0),
    averageMeetingDuration: z.number().min(0),
    uniqueParticipants: z.number().int().min(0),
    averageParticipantsPerMeeting: z.number().min(0),
    participantRetentionRate: z.number().min(0).max(100),
    recordingUsageRate: z.number().min(0).max(100),
    screenShareUsageRate: z.number().min(0).max(100),
    chatUsageRate: z.number().min(0).max(100),
    pollUsageRate: z.number().min(0).max(100),
    breakoutRoomUsageRate: z.number().min(0).max(100),
  })
  .strict();

export const ZoomQualityMetricsSchema = z
  .object({
    meetingId: z.string(),
    overallQuality: z.enum(["excellent", "good", "fair", "poor"]),
    audioQuality: z.object({
      averageBitrate: z.number().min(0),
      packetLossRate: z.number().min(0).max(100),
      jitter: z.number().min(0),
      roundTripTime: z.number().min(0),
    }),
    videoQuality: z.object({
      averageBitrate: z.number().min(0),
      resolution: z.string(),
      frameRate: z.number().min(0),
      packetLossRate: z.number().min(0).max(100),
    }),
    networkCondition: z.object({
      averageBandwidth: z.number().min(0),
      connectionType: z.string(),
      stabilityScore: z.number().min(0).max(100),
    }),
    cpuUsage: z.object({
      zoomMinCpuUsage: z.number().min(0).max(100),
      zoomAvgCpuUsage: z.number().min(0).max(100),
      zoomMaxCpuUsage: z.number().min(0).max(100),
      systemMaxCpuUsage: z.number().min(0).max(100),
    }),
  })
  .strict();

// =============================================================================
// Zoom Authentication Schemas
// =============================================================================

export const ZoomServiceConfigSchema = z
  .object({
    clientId: z.string(),
    clientSecret: z.string(),
    accountId: z.string().optional(), // For Server-to-Server apps
    redirectUri: z.string().url().optional(), // For OAuth apps
    scopes: z.array(z.string()).optional(),
  })
  .strict();

export const ZoomAuthResultSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.date(),
    tokenType: z.literal("Bearer"),
    scopes: z.array(z.string()),
    accountId: z.string().optional(),
  })
  .strict();

// =============================================================================
// Zoom Error Schemas
// =============================================================================

export const ZoomServiceErrorSchema = z
  .object({
    code: z.enum([
      "ZOOM_AUTH_ERROR",
      "ZOOM_API_ERROR",
      "ZOOM_MEETING_ERROR",
      "ZOOM_WEBHOOK_ERROR",
    ]),
    message: z.string(),
    details: z
      .object({
        apiError: z.record(z.any()).optional(),
        statusCode: z.number().int().optional(),
        requestId: z.string().optional(),
        zoomErrorCode: z.number().int().optional(),
      })
      .optional(),
  })
  .strict();

// =============================================================================
// Constants and Validation Utilities
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
  INSTANT: "1",
  SCHEDULED: "2",
  RECURRING_NO_FIXED_TIME: "3",
  RECURRING_FIXED_TIME: "8",
  PAC: "4",
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

// =============================================================================
// Validation Functions
// =============================================================================

export const validateZoomVideoSpaceConfig = (config: unknown) => {
  return ZoomVideoSpaceConfigSchema.safeParse(config);
};

export const validateCreateZoomMeetingRequest = (request: unknown) => {
  return CreateZoomMeetingRequestSchema.safeParse(request);
};

export const validateUpdateZoomMeetingRequest = (request: unknown) => {
  return UpdateZoomMeetingRequestSchema.safeParse(request);
};

export const validateZoomWebhookPayload = (payload: unknown) => {
  return ZoomWebhookPayloadSchema.safeParse(payload);
};

export const validateZoomServiceConfig = (config: unknown) => {
  return ZoomServiceConfigSchema.safeParse(config);
};

export const validateZoomScopes = (scopes: string[]): boolean => {
  const requiredScopes = ZOOM_OAUTH_SCOPES;
  return requiredScopes.every((scope) => scopes.includes(scope));
};

export const validateZoomMeetingType = (type: string): boolean => {
  return Object.values(ZOOM_MEETING_TYPES).includes(type as any);
};

export const validateZoomRecordingFormat = (format: string): boolean => {
  return ZOOM_RECORDING_FORMATS.includes(format as any);
};

export const validateZoomAudioOption = (audio: string): boolean => {
  return ZOOM_AUDIO_OPTIONS.includes(audio as any);
};

export const validateZoomAutoRecordingOption = (recording: string): boolean => {
  return ZOOM_AUTO_RECORDING_OPTIONS.includes(recording as any);
};

export const validateZoomWebhookEvent = (event: string): boolean => {
  return ZOOM_WEBHOOK_EVENTS.includes(event as any);
};

export const validateZoomPassword = (password: string): boolean => {
  // Zoom password requirements: 1-10 characters, alphanumeric
  return /^[a-zA-Z0-9]{1,10}$/.test(password);
};

export const validateZoomTopic = (topic: string): boolean => {
  return topic.length >= 1 && topic.length <= 200;
};

export const validateZoomDuration = (duration: number): boolean => {
  return duration >= 1 && duration <= 1440; // Max 24 hours
};

// =============================================================================
// Type Inference
// =============================================================================

export type ZoomVideoSpaceConfig = z.infer<typeof ZoomVideoSpaceConfigSchema>;
export type CreateZoomMeetingRequest = z.infer<
  typeof CreateZoomMeetingRequestSchema
>;
export type UpdateZoomMeetingRequest = z.infer<
  typeof UpdateZoomMeetingRequestSchema
>;
export type ZoomMeetingResponse = z.infer<typeof ZoomMeetingResponseSchema>;
export type ZoomRoomStatus = z.infer<typeof ZoomRoomStatusSchema>;
export type ZoomParticipantData = z.infer<typeof ZoomParticipantDataSchema>;
export type ZoomRecordingData = z.infer<typeof ZoomRecordingDataSchema>;
export type ZoomWebhookPayload = z.infer<typeof ZoomWebhookPayloadSchema>;
export type ZoomMeetingAnalytics = z.infer<typeof ZoomMeetingAnalyticsSchema>;
export type ZoomParticipantAnalytics = z.infer<
  typeof ZoomParticipantAnalyticsSchema
>;
export type ZoomEngagementMetrics = z.infer<typeof ZoomEngagementMetricsSchema>;
export type ZoomQualityMetrics = z.infer<typeof ZoomQualityMetricsSchema>;
export type ZoomServiceConfig = z.infer<typeof ZoomServiceConfigSchema>;
export type ZoomAuthResult = z.infer<typeof ZoomAuthResultSchema>;
export type ZoomServiceError = z.infer<typeof ZoomServiceErrorSchema>;
