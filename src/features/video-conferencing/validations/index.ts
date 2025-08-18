/**
 * Video Conferencing Platform - Core Validation Schemas
 * Zod schemas for all video conferencing models and API requests
 */

import { z } from "zod";

// Re-export all provider-specific validations
export * from "./meet";
export * from "./zoom";
export * from "./vimeo";

// =============================================================================
// Core Enums
// =============================================================================

export const VideoProviderSchema = z.enum(["MEET", "ZOOM", "VIMEO"]);

export const VideoSpaceStatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "DISABLED",
  "EXPIRED",
]);

export const MeetingStatusSchema = z.enum([
  "SCHEDULED",
  "ACTIVE",
  "ENDED",
  "CANCELLED",
]);

export const IntegrationStatusSchema = z.enum([
  "ACTIVE",
  "EXPIRED",
  "REVOKED",
  "ERROR",
]);

export const ParticipantRoleSchema = z.enum([
  "HOST",
  "CO_HOST",
  "PANELIST",
  "ATTENDEE",
]);

export const RecordingTypeSchema = z.enum([
  "VIDEO",
  "AUDIO_ONLY",
  "SCREEN_SHARE",
  "CHAT",
  "TRANSCRIPT",
]);

export const ExportFormatSchema = z.enum(["CSV", "EXCEL", "JSON"]);

// =============================================================================
// Core Model Schemas
// =============================================================================

export const VideoSpaceSettingsSchema = z
  .object({
    // Recording settings
    autoRecord: z.boolean().default(false),
    recordingFormat: z.enum(["MP4", "AUDIO_ONLY"]).default("MP4"),

    // Transcription settings
    enableTranscription: z.boolean().default(false),
    transcriptionLanguage: z.string().default("en-US"),

    // Access control
    requireAuthentication: z.boolean().default(false),
    allowedDomains: z
      .array(
        z
          .string()
          .regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid domain format")
      )
      .default([]),
    maxParticipants: z.number().int().min(1).max(1000).default(100),

    // Meeting behavior
    muteOnEntry: z.boolean().default(false),
    enableChat: z.boolean().default(true),
    enableScreenShare: z.boolean().default(true),

    // Provider-specific settings
    providerSettings: z.record(z.any()).default({}),
  })
  .strict();

export const VideoSpaceSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    provider: VideoProviderSchema,
    status: VideoSpaceStatusSchema,
    providerRoomId: z.string(),
    providerJoinUri: z.string().url(),
    providerData: z.record(z.any()).optional(),
    settings: VideoSpaceSettingsSchema.optional(),
    ownerId: z.string(),
    cohort: z.string().max(100).optional(),
    tags: z.array(z.string().max(50)).default([]),
    addedToCalendar: z.boolean().default(false),
    calendarEventId: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    lastActiveAt: z.date().optional(),
    integrationAccountId: z.string(),
  })
  .strict();

export const MeetingRecordSchema = z
  .object({
    id: z.string(),
    videoSpaceId: z.string(),
    providerMeetingId: z.string(),
    title: z.string().max(200).optional(),
    startTime: z.date(),
    endTime: z.date().optional(),
    duration: z.number().int().min(0).optional(), // Duration in minutes
    status: MeetingStatusSchema,
    totalParticipants: z.number().int().min(0).default(0),
    maxConcurrentUsers: z.number().int().min(0).default(0),
    providerData: z.record(z.any()).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict();

export const MeetingParticipantSchema = z
  .object({
    id: z.string(),
    meetingRecordId: z.string(),
    providerParticipantId: z.string(),
    name: z.string().min(1).max(200),
    email: z.string().email().optional(),
    role: ParticipantRoleSchema,
    joinTime: z.date(),
    leaveTime: z.date().optional(),
    duration: z.number().int().min(0).default(0), // Duration in minutes
    connectionCount: z.number().int().min(1).default(1),
    providerData: z.record(z.any()).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict();

export const ParticipantSessionSchema = z
  .object({
    id: z.string(),
    participantId: z.string(),
    sessionStart: z.date(),
    sessionEnd: z.date().optional(),
    duration: z.number().int().min(0).optional(), // Duration in minutes
    deviceType: z.enum(["DESKTOP", "MOBILE", "TABLET", "PHONE"]).optional(),
    connectionQuality: z.enum(["GOOD", "FAIR", "POOR"]).optional(),
    audioEnabled: z.boolean().default(true),
    videoEnabled: z.boolean().default(true),
    screenSharingUsed: z.boolean().default(false),
    providerData: z.record(z.any()).optional(),
    createdAt: z.date(),
  })
  .strict();

export const MeetingTranscriptEntrySchema = z
  .object({
    id: z.string(),
    meetingRecordId: z.string(),
    participantId: z.string().optional(),
    speakerName: z.string().max(200).optional(),
    text: z.string().min(1),
    timestamp: z.date(),
    startTime: z.number().int().min(0), // Seconds from meeting start
    endTime: z.number().int().min(0), // Seconds from meeting start
    language: z.string().default("en-US"),
    confidence: z.number().min(0).max(1).optional(),
    providerData: z.record(z.any()).optional(),
    createdAt: z.date(),
  })
  .strict();

export const MeetingChatMessageSchema = z
  .object({
    id: z.string(),
    meetingRecordId: z.string(),
    participantId: z.string().optional(),
    senderName: z.string().min(1).max(200),
    senderEmail: z.string().email().optional(),
    message: z.string().min(1),
    timestamp: z.date(),
    messageType: z.enum(["TEXT", "FILE", "SYSTEM"]).default("TEXT"),
    providerData: z.record(z.any()).optional(),
    createdAt: z.date(),
  })
  .strict();

export const MeetingRecordingFileSchema = z
  .object({
    id: z.string(),
    meetingRecordId: z.string(),
    fileName: z.string().min(1).max(255),
    fileType: RecordingTypeSchema,
    fileSize: z.number().int().min(0).default(0), // Size in bytes
    duration: z.number().int().min(0).optional(), // Duration in seconds
    downloadUrl: z.string().url(),
    expiresAt: z.date().optional(),
    providerFileId: z.string(),
    providerData: z.record(z.any()).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict();

export const IntegrationAccountSchema = z
  .object({
    id: z.string(),
    provider: VideoProviderSchema,
    accountName: z.string().min(1).max(200),
    accountEmail: z.string().email().optional(),
    accessToken: z.string(), // Will be encrypted
    refreshToken: z.string().optional(), // Will be encrypted
    tokenExpiry: z.date().optional(),
    scopes: z.array(z.string()),
    status: IntegrationStatusSchema,
    lastSyncAt: z.date().optional(),
    userId: z.string(),
    webhookConfig: z.record(z.any()).optional(), // ProviderWebhookConfig as JSON
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict();

export const LinkAliasSchema = z
  .object({
    id: z.string(),
    alias: z
      .string()
      .min(1)
      .max(100)
      .regex(
        /^[a-zA-Z0-9-_]+$/,
        "Alias can only contain letters, numbers, hyphens, and underscores"
      ),
    videoSpaceId: z.string(),
    isActive: z.boolean().default(true),
    accessCount: z.number().int().min(0).default(0),
    lastAccessedAt: z.date().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict();

// =============================================================================
// Request/Response Schemas
// =============================================================================

export const CreateVideoSpaceRequestSchema = z
  .object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    provider: VideoProviderSchema,
    settings: VideoSpaceSettingsSchema.optional(),
    cohort: z.string().max(100).optional(),
    tags: z.array(z.string().max(50)).default([]),
    integrationAccountId: z.string(),
  })
  .strict();

export const UpdateVideoSpaceRequestSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    settings: VideoSpaceSettingsSchema.optional(),
    cohort: z.string().max(100).optional(),
    tags: z.array(z.string().max(50)).optional(),
    addedToCalendar: z.boolean().optional(),
    calendarEventId: z.string().optional(),
  })
  .strict();

export const VideoSpaceFiltersSchema = z
  .object({
    provider: VideoProviderSchema.optional(),
    status: VideoSpaceStatusSchema.optional(),
    ownerId: z.string().optional(),
    cohort: z.string().optional(),
    tags: z.array(z.string()).optional(),
    search: z.string().max(200).optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  })
  .strict();

export const AnalyticsFiltersSchema = z
  .object({
    videoSpaceId: z.string().optional(),
    cohort: z.string().optional(),
    ownerId: z.string().optional(),
    provider: VideoProviderSchema.optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    participantEmail: z.string().email().optional(),
    participantName: z.string().max(200).optional(),
  })
  .strict();

export const ReportFiltersSchema = AnalyticsFiltersSchema.extend({
  includeTranscripts: z.boolean().default(false),
  includeChatMessages: z.boolean().default(false),
  includeRecordings: z.boolean().default(false),
}).strict();

export const DateRangeSchema = z
  .object({
    start: z.date(),
    end: z.date(),
  })
  .refine((data) => data.start <= data.end, {
    message: "Start date must be before or equal to end date",
  });

// =============================================================================
// Analytics Schemas
// =============================================================================

export const MeetingAnalyticsSchema = z
  .object({
    meetingRecord: MeetingRecordSchema,
    participantCount: z.number().int().min(0),
    averageDuration: z.number().min(0),
    engagementScore: z.number().min(0).max(100),
    transcriptionAvailable: z.boolean(),
    recordingAvailable: z.boolean(),
    chatMessageCount: z.number().int().min(0),
  })
  .strict();

export const ParticipantAnalyticsSchema = z
  .object({
    participant: MeetingParticipantSchema,
    totalMeetings: z.number().int().min(0),
    totalDuration: z.number().min(0),
    averageEngagement: z.number().min(0).max(100),
    lastActivity: z.date(),
  })
  .strict();

export const CohortStatsSchema = z
  .object({
    cohort: z.string(),
    totalMeetings: z.number().int().min(0),
    totalParticipants: z.number().int().min(0),
    averageDuration: z.number().min(0),
    totalDuration: z.number().min(0),
    engagementTrends: z.array(
      z.object({
        date: z.date(),
        averageEngagement: z.number().min(0).max(100),
        participantCount: z.number().int().min(0),
      })
    ),
  })
  .strict();

export const EngagementMetricsSchema = z
  .object({
    totalDuration: z.number().min(0),
    averageParticipation: z.number().min(0).max(100),
    peakConcurrentUsers: z.number().int().min(0),
    dropOffRate: z.number().min(0).max(100),
    reJoinRate: z.number().min(0).max(100),
  })
  .strict();

// =============================================================================
// Service Response Schemas
// =============================================================================

export const ServiceResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z
    .object({
      success: z.boolean(),
      data: dataSchema.optional(),
      error: z.string().optional(),
      code: z.string().optional(),
    })
    .strict();

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T
) =>
  z
    .object({
      data: z.array(itemSchema),
      total: z.number().int().min(0),
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    })
    .strict();

export const RealTimeStatusSchema = z
  .object({
    videoSpaceId: z.string(),
    status: VideoSpaceStatusSchema,
    isLive: z.boolean(),
    currentParticipants: z.number().int().min(0),
    lastChecked: z.date(),
  })
  .strict();

export const CalendarIntegrationDataSchema = z
  .object({
    location: z.string().url(),
    description: z.string(),
    formattedDescription: z.string(),
  })
  .strict();

// =============================================================================
// Webhook Schemas
// =============================================================================

export const WebhookEventSchema = z
  .object({
    id: z.string(),
    provider: VideoProviderSchema,
    eventType: z.string(),
    eventId: z.string(),
    payload: z.record(z.any()),
    signature: z.string().optional(),
    processed: z.boolean().default(false),
    processedAt: z.date().optional(),
    processingAttempts: z.number().int().min(0).default(0),
    lastProcessingError: z.string().optional(),
    videoSpaceId: z.string().optional(),
    meetingRecordId: z.string().optional(),
    receivedAt: z.date(),
    eventTimestamp: z.date().optional(),
  })
  .strict();

export const ProviderWebhookConfigSchema = z
  .object({
    webhookUrl: z.string().url(),
    secretToken: z.string(),
    events: z.array(z.string()),
    isActive: z.boolean().default(true),
    lastDeliveryAt: z.date().optional(),
    failureCount: z.number().int().min(0).default(0),
  })
  .strict();

// =============================================================================
// KPI Schemas
// =============================================================================

export const VideoConferencingKPISchema = z
  .object({
    id: z.string(),
    calculatedAt: z.date(),
    lastUpdatedAt: z.date(),
    periodStart: z.date(),
    periodEnd: z.date(),
    provider: VideoProviderSchema.optional(),
    ownerId: z.string().optional(),
    cohort: z.string().optional(),
    totalMeetings: z.number().int().min(0),
    activeMeetings: z.number().int().min(0),
    completedMeetings: z.number().int().min(0),
    cancelledMeetings: z.number().int().min(0),
    totalUniqueParticipants: z.number().int().min(0),
    averageParticipantsPerMeeting: z.number().min(0),
    totalParticipantMinutes: z.number().int().min(0),
    totalMeetingHours: z.number().min(0),
    averageMeetingDuration: z.number().min(0),
    providerBreakdown: z.record(z.any()),
    statusStats: z.record(z.any()),
    engagementStats: z.record(z.any()),
    dailyMeetingStats: z.record(z.any()),
    hourlyDistribution: z.record(z.any()),
    featureUsageStats: z.record(z.any()),
    qualityMetrics: z.record(z.any()).optional(),
    version: z.number().int().default(1),
    generatedBy: z.string().optional(),
    includeAllProviders: z.boolean().default(true),
  })
  .strict();

// =============================================================================
// Validation Utilities
// =============================================================================

export const validateVideoSpaceSettings = (settings: unknown) => {
  return VideoSpaceSettingsSchema.safeParse(settings);
};

export const validateCreateVideoSpaceRequest = (request: unknown) => {
  return CreateVideoSpaceRequestSchema.safeParse(request);
};

export const validateUpdateVideoSpaceRequest = (request: unknown) => {
  return UpdateVideoSpaceRequestSchema.safeParse(request);
};

export const validateVideoSpaceFilters = (filters: unknown) => {
  return VideoSpaceFiltersSchema.safeParse(filters);
};

export const validateAnalyticsFilters = (filters: unknown) => {
  return AnalyticsFiltersSchema.safeParse(filters);
};

export const validateReportFilters = (filters: unknown) => {
  return ReportFiltersSchema.safeParse(filters);
};

export const validateDateRange = (range: unknown) => {
  return DateRangeSchema.safeParse(range);
};

export const validateLinkAlias = (alias: unknown) => {
  return LinkAliasSchema.safeParse(alias);
};

export const validateWebhookEvent = (event: unknown) => {
  return WebhookEventSchema.safeParse(event);
};

// =============================================================================
// Type Inference
// =============================================================================

export type VideoSpaceSettings = z.infer<typeof VideoSpaceSettingsSchema>;
export type VideoSpace = z.infer<typeof VideoSpaceSchema>;
export type MeetingRecord = z.infer<typeof MeetingRecordSchema>;
export type MeetingParticipant = z.infer<typeof MeetingParticipantSchema>;
export type ParticipantSession = z.infer<typeof ParticipantSessionSchema>;
export type MeetingTranscriptEntry = z.infer<
  typeof MeetingTranscriptEntrySchema
>;
export type MeetingChatMessage = z.infer<typeof MeetingChatMessageSchema>;
export type MeetingRecordingFile = z.infer<typeof MeetingRecordingFileSchema>;
export type IntegrationAccount = z.infer<typeof IntegrationAccountSchema>;
export type LinkAlias = z.infer<typeof LinkAliasSchema>;
export type CreateVideoSpaceRequest = z.infer<
  typeof CreateVideoSpaceRequestSchema
>;
export type UpdateVideoSpaceRequest = z.infer<
  typeof UpdateVideoSpaceRequestSchema
>;
export type VideoSpaceFilters = z.infer<typeof VideoSpaceFiltersSchema>;
export type AnalyticsFilters = z.infer<typeof AnalyticsFiltersSchema>;
export type ReportFilters = z.infer<typeof ReportFiltersSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;
export type MeetingAnalytics = z.infer<typeof MeetingAnalyticsSchema>;
export type ParticipantAnalytics = z.infer<typeof ParticipantAnalyticsSchema>;
export type CohortStats = z.infer<typeof CohortStatsSchema>;
export type EngagementMetrics = z.infer<typeof EngagementMetricsSchema>;
export type RealTimeStatus = z.infer<typeof RealTimeStatusSchema>;
export type CalendarIntegrationData = z.infer<
  typeof CalendarIntegrationDataSchema
>;
export type WebhookEvent = z.infer<typeof WebhookEventSchema>;
export type ProviderWebhookConfig = z.infer<typeof ProviderWebhookConfigSchema>;
export type VideoConferencingKPI = z.infer<typeof VideoConferencingKPISchema>;
// Re-export alias validation schemas
export * from "./alias";
