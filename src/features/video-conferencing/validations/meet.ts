/**
 * Google Meet Validation Schemas
 * Zod schemas for Google Meet API v2 specific types and configurations
 */

import { z } from "zod";

// =============================================================================
// Google Meet Configuration Schemas
// =============================================================================

export const MeetVideoSpaceConfigSchema = z
  .object({
    // Basic space configuration
    displayName: z.string().max(100).optional(),
    description: z.string().max(500).optional(),

    // Access control
    accessType: z.enum(["OPEN", "TRUSTED", "RESTRICTED"]).default("TRUSTED"),
    entryPointAccess: z.enum(["ALL", "CREATOR_APP_ONLY"]).default("ALL"),

    // Moderation settings
    moderation: z.enum(["ON", "OFF"]).default("OFF"),
    chatRestriction: z
      .enum(["HOSTS_ONLY", "NO_RESTRICTION"])
      .default("NO_RESTRICTION"),
    presentRestriction: z
      .enum(["HOSTS_ONLY", "NO_RESTRICTION"])
      .default("NO_RESTRICTION"),
    defaultJoinAsViewerType: z.enum(["ON", "OFF"]).default("OFF"),

    // Recording and transcription
    autoRecordingGeneration: z.enum(["ON", "OFF"]).default("OFF"),
    recordingStorage: z
      .enum(["GOOGLE_DRIVE", "CLOUD_STORAGE"])
      .default("GOOGLE_DRIVE"),
    recordingQuality: z.enum(["HD", "SD"]).default("HD"),
    recordingLayout: z
      .enum(["SPEAKER_VIEW", "GALLERY_VIEW", "PRESENTATION"])
      .default("SPEAKER_VIEW"),

    autoTranscriptionGeneration: z.enum(["ON", "OFF"]).default("OFF"),
    transcriptionLanguage: z.string().default("en-US"),
    translationTargets: z.array(z.string()).default([]),
    speakerIdentification: z.boolean().default(false),

    // AI features
    autoSmartNotesGeneration: z.enum(["ON", "OFF"]).default("OFF"),
    summaryGeneration: z.boolean().default(false),
    actionItemsExtraction: z.boolean().default(false),
    keyTopicsIdentification: z.boolean().default(false),

    // Captions and accessibility
    autoCaptionsEnabled: z.boolean().default(false),
    captionLanguage: z.string().default("en-US"),
    translatedCaptions: z.boolean().default(false),

    // Participation settings
    allParticipantsAsHosts: z.boolean().default(false),
    breakoutRoomsEnabled: z.boolean().default(false),
    maxParticipants: z.number().int().min(1).max(500).default(100),
    requireAuthentication: z.boolean().default(false),
    allowedDomains: z
      .array(
        z
          .string()
          .regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid domain format")
      )
      .default([]),

    // Meeting features
    chatEnabled: z.boolean().default(true),
    screenSharingRestriction: z
      .enum(["ALL_PARTICIPANTS", "HOSTS_ONLY"])
      .default("ALL_PARTICIPANTS"),
    pollsEnabled: z.boolean().default(false),
    whiteboardEnabled: z.boolean().default(false),
    reactionsEnabled: z.boolean().default(true),

    // Security settings
    waitingRoom: z.boolean().default(false),
    meetingLock: z.boolean().default(false),
    attendeeReporting: z.boolean().default(false),
    endToEndEncryption: z.boolean().default(false),

    // Attendance reporting
    attendanceReportGeneration: z
      .enum(["GENERATE_REPORT", "DO_NOT_GENERATE"])
      .default("DO_NOT_GENERATE"),
  })
  .strict();

// =============================================================================
// Google Meet Request/Response Schemas
// =============================================================================

export const CreateMeetSpaceRequestSchema = z
  .object({
    name: z.string().min(1).max(100),
    config: MeetVideoSpaceConfigSchema.optional(),
    calendarIntegration: z
      .object({
        eventId: z.string().optional(),
        title: z.string().max(200).optional(),
        description: z.string().max(1000).optional(),
        startTime: z.string().datetime().optional(),
        endTime: z.string().datetime().optional(),
        attendees: z.array(z.string().email()).optional(),
      })
      .optional(),
  })
  .strict();

export const UpdateMeetSpaceRequestSchema = z
  .object({
    config: MeetVideoSpaceConfigSchema.partial().optional(),
    name: z.string().min(1).max(100).optional(),
  })
  .strict();

export const MeetSpaceResponseSchema = z
  .object({
    spaceId: z.string(),
    name: z.string(),
    meetingUri: z.string().url(),
    meetingCode: z.string().optional(),
    config: MeetVideoSpaceConfigSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();

// =============================================================================
// Google Meet Status and Analytics Schemas
// =============================================================================

export const MeetRoomStatusSchema = z
  .object({
    spaceId: z.string(),
    isActive: z.boolean(),
    activeConference: z
      .object({
        conferenceRecord: z.string(),
        startTime: z.string().datetime(),
        participantCount: z.number().int().min(0),
      })
      .optional(),
    lastActivity: z.string().datetime().optional(),
  })
  .strict();

export const MeetParticipantDataSchema = z
  .object({
    participantId: z.string(),
    name: z.string(),
    email: z.string().email().optional(),
    joinTime: z.string().datetime(),
    leaveTime: z.string().datetime().optional(),
    duration: z.number().int().min(0),
    role: z.enum(["host", "participant"]),
    deviceType: z.enum(["DESKTOP", "MOBILE", "TABLET", "PHONE"]).optional(),
    connectionQuality: z.enum(["GOOD", "FAIR", "POOR"]).optional(),
    audioEnabled: z.boolean(),
    videoEnabled: z.boolean(),
    screenSharingUsed: z.boolean(),
  })
  .strict();

export const MeetRecordingDataSchema = z
  .object({
    recordingId: z.string(),
    fileName: z.string(),
    fileType: z.enum(["MP4", "AUDIO"]),
    duration: z.number().int().min(0),
    fileSize: z.number().int().min(0),
    driveFileId: z.string().optional(),
    downloadUrl: z.string().url(),
    expiresAt: z.string().datetime().optional(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
  })
  .strict();

export const MeetTranscriptDataSchema = z
  .object({
    transcriptId: z.string(),
    language: z.string(),
    entries: z.array(
      z.object({
        participantId: z.string().optional(),
        speakerName: z.string().optional(),
        text: z.string(),
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
        confidence: z.number().min(0).max(1).optional(),
      })
    ),
    docsFileId: z.string().optional(),
    downloadUrl: z.string().url().optional(),
  })
  .strict();

export const MeetWebhookPayloadSchema = z
  .object({
    eventType: z.enum([
      "conference.started",
      "conference.ended",
      "participant.joined",
      "participant.left",
    ]),
    eventTime: z.string().datetime(),
    conferenceRecord: z.string(),
    spaceId: z.string(),
    data: z.object({
      conference: z
        .object({
          startTime: z.string().datetime(),
          endTime: z.string().datetime().optional(),
        })
        .optional(),
      participant: z
        .object({
          participantId: z.string(),
          name: z.string(),
          email: z.string().email().optional(),
          joinTime: z.string().datetime().optional(),
          leaveTime: z.string().datetime().optional(),
        })
        .optional(),
    }),
  })
  .strict();

// =============================================================================
// Google Meet Analytics Schemas
// =============================================================================

export const MeetMeetingAnalyticsSchema = z
  .object({
    conferenceRecord: z.string(),
    spaceId: z.string(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime().optional(),
    duration: z.number().int().min(0),
    participantCount: z.number().int().min(0),
    maxConcurrentParticipants: z.number().int().min(0),
    totalJoinEvents: z.number().int().min(0),
    averageParticipationTime: z.number().min(0),
    recordingGenerated: z.boolean(),
    transcriptionGenerated: z.boolean(),
    smartNotesGenerated: z.boolean(),
    qualityMetrics: z
      .object({
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
      })
      .optional(),
  })
  .strict();

export const MeetEngagementMetricsSchema = z
  .object({
    spaceId: z.string(),
    totalMeetings: z.number().int().min(0),
    totalDuration: z.number().min(0),
    averageMeetingDuration: z.number().min(0),
    uniqueParticipants: z.number().int().min(0),
    averageParticipantsPerMeeting: z.number().min(0),
    participantRetentionRate: z.number().min(0).max(100),
    recordingUsageRate: z.number().min(0).max(100),
    transcriptionUsageRate: z.number().min(0).max(100),
    smartNotesUsageRate: z.number().min(0).max(100),
  })
  .strict();

// =============================================================================
// Google Meet Authentication Schemas
// =============================================================================

export const MeetServiceConfigSchema = z
  .object({
    clientId: z.string(),
    clientSecret: z.string(),
    redirectUri: z.string().url(),
    scopes: z.array(z.string()),
  })
  .strict();

export const MeetAuthResultSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.date(),
    scopes: z.array(z.string()),
    userEmail: z.string().email().optional(),
  })
  .strict();

// =============================================================================
// Google Meet Error Schemas
// =============================================================================

export const MeetServiceErrorSchema = z
  .object({
    code: z.enum([
      "MEET_AUTH_ERROR",
      "MEET_API_ERROR",
      "MEET_SPACE_ERROR",
      "MEET_WEBHOOK_ERROR",
    ]),
    message: z.string(),
    details: z
      .object({
        apiError: z.record(z.any()).optional(),
        statusCode: z.number().int().optional(),
        requestId: z.string().optional(),
      })
      .optional(),
  })
  .strict();

// =============================================================================
// Constants and Validation Utilities
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
  "ja-JP",
  "ko-KR",
  "zh-CN",
] as const;

// =============================================================================
// Validation Functions
// =============================================================================

export const validateMeetVideoSpaceConfig = (config: unknown) => {
  return MeetVideoSpaceConfigSchema.safeParse(config);
};

export const validateCreateMeetSpaceRequest = (request: unknown) => {
  return CreateMeetSpaceRequestSchema.safeParse(request);
};

export const validateUpdateMeetSpaceRequest = (request: unknown) => {
  return UpdateMeetSpaceRequestSchema.safeParse(request);
};

export const validateMeetWebhookPayload = (payload: unknown) => {
  return MeetWebhookPayloadSchema.safeParse(payload);
};

export const validateMeetServiceConfig = (config: unknown) => {
  return MeetServiceConfigSchema.safeParse(config);
};

export const validateMeetScopes = (scopes: string[]): boolean => {
  const requiredScopes = MEET_SCOPES;
  return requiredScopes.every((scope) => scopes.includes(scope));
};

export const validateMeetTranscriptionLanguage = (
  language: string
): boolean => {
  return MEET_TRANSCRIPTION_LANGUAGES.includes(language as any);
};

export const validateMeetRecordingFormat = (format: string): boolean => {
  return MEET_RECORDING_FORMATS.includes(format as any);
};

export const validateMeetWebhookEvent = (event: string): boolean => {
  return MEET_WEBHOOK_EVENTS.includes(event as any);
};

// =============================================================================
// Type Inference
// =============================================================================

export type MeetVideoSpaceConfig = z.infer<typeof MeetVideoSpaceConfigSchema>;
export type CreateMeetSpaceRequest = z.infer<
  typeof CreateMeetSpaceRequestSchema
>;
export type UpdateMeetSpaceRequest = z.infer<
  typeof UpdateMeetSpaceRequestSchema
>;
export type MeetSpaceResponse = z.infer<typeof MeetSpaceResponseSchema>;
export type MeetRoomStatus = z.infer<typeof MeetRoomStatusSchema>;
export type MeetParticipantData = z.infer<typeof MeetParticipantDataSchema>;
export type MeetRecordingData = z.infer<typeof MeetRecordingDataSchema>;
export type MeetTranscriptData = z.infer<typeof MeetTranscriptDataSchema>;
export type MeetWebhookPayload = z.infer<typeof MeetWebhookPayloadSchema>;
export type MeetMeetingAnalytics = z.infer<typeof MeetMeetingAnalyticsSchema>;
export type MeetEngagementMetrics = z.infer<typeof MeetEngagementMetricsSchema>;
export type MeetServiceConfig = z.infer<typeof MeetServiceConfigSchema>;
export type MeetAuthResult = z.infer<typeof MeetAuthResultSchema>;
export type MeetServiceError = z.infer<typeof MeetServiceErrorSchema>;
