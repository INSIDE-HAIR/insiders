/**
 * Video Conferencing Validation Schemas
 * Comprehensive Zod validation schemas for video conferencing features
 */

import { z } from "zod";

// =============================================================================
// Base Validation Schemas
// =============================================================================

export const ObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

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

// =============================================================================
// Request/Response Schemas
// =============================================================================

export const CreateVideoSpaceRequestSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  provider: VideoProviderSchema,
  config: z.record(z.any()),
  integrationAccountId: ObjectIdSchema,
  cohort: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).optional(),
});

export const UpdateVideoSpaceRequestSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  status: VideoSpaceStatusSchema.optional(),
  config: z.record(z.any()).optional(),
  cohort: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).optional(),
  addedToCalendar: z.boolean().optional(),
  calendarEventId: z.string().optional(),
});

export const VideoSpaceResponseSchema = z.object({
  id: ObjectIdSchema,
  name: z.string(),
  description: z.string().nullable(),
  provider: VideoProviderSchema,
  status: VideoSpaceStatusSchema,
  providerRoomId: z.string(),
  providerJoinUri: z.string(),
  providerData: z.record(z.any()).nullable(),
  settings: z.record(z.any()).nullable(),
  ownerId: ObjectIdSchema,
  cohort: z.string().nullable(),
  tags: z.array(z.string()),
  addedToCalendar: z.boolean(),
  calendarEventId: z.string().nullable(),
  integrationAccountId: ObjectIdSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastActiveAt: z.string().datetime().nullable(),
});

export const MeetingRecordSchema = z.object({
  id: ObjectIdSchema,
  videoSpaceId: ObjectIdSchema,
  providerMeetingId: z.string(),
  title: z.string().nullable(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().nullable(),
  duration: z.number().nullable(),
  status: MeetingStatusSchema,
  totalParticipants: z.number(),
  maxConcurrentUsers: z.number(),
  providerData: z.record(z.any()).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const MeetingParticipantSchema = z.object({
  id: ObjectIdSchema,
  meetingRecordId: ObjectIdSchema,
  providerParticipantId: z.string(),
  name: z.string(),
  email: z.string().email().nullable(),
  role: ParticipantRoleSchema,
  joinTime: z.string().datetime(),
  leaveTime: z.string().datetime().nullable(),
  duration: z.number(),
  connectionCount: z.number(),
  providerData: z.record(z.any()).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const IntegrationAccountSchema = z.object({
  id: ObjectIdSchema,
  provider: VideoProviderSchema,
  accountName: z.string(),
  accountEmail: z.string().email().nullable(),
  accessToken: z.string(),
  refreshToken: z.string().nullable(),
  tokenExpiry: z.string().datetime().nullable(),
  scopes: z.array(z.string()),
  status: IntegrationStatusSchema,
  lastSyncAt: z.string().datetime().nullable(),
  userId: ObjectIdSchema,
  webhookConfig: z.record(z.any()).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const LinkAliasSchema = z.object({
  id: ObjectIdSchema,
  alias: z.string(),
  videoSpaceId: ObjectIdSchema,
  isActive: z.boolean(),
  accessCount: z.number(),
  lastAccessedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const VideoConferencingKPISchema = z.object({
  id: ObjectIdSchema,
  calculatedAt: z.string().datetime(),
  lastUpdatedAt: z.string().datetime(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  provider: VideoProviderSchema.nullable(),
  ownerId: ObjectIdSchema.nullable(),
  cohort: z.string().nullable(),
  totalMeetings: z.number(),
  activeMeetings: z.number(),
  completedMeetings: z.number(),
  cancelledMeetings: z.number(),
  totalUniqueParticipants: z.number(),
  averageParticipantsPerMeeting: z.number(),
  totalParticipantMinutes: z.number(),
  totalMeetingHours: z.number(),
  averageMeetingDuration: z.number(),
  providerBreakdown: z.record(z.any()),
  statusStats: z.record(z.any()),
  engagementStats: z.record(z.any()),
  dailyMeetingStats: z.record(z.any()),
  hourlyDistribution: z.record(z.any()),
  featureUsageStats: z.record(z.any()),
  qualityMetrics: z.record(z.any()).nullable(),
  version: z.number(),
  generatedBy: ObjectIdSchema.nullable(),
  includeAllProviders: z.boolean().nullable(),
});

// =============================================================================
// Provider-specific Config Schemas
// =============================================================================

export const GoogleMeetVideoSpaceConfigSchema = z.object({
  displayName: z.string().optional(),
  entryPointAccess: z.enum(["ALL", "TRUSTED"]).optional(),
  accessType: z.enum(["TRUSTED", "OPEN"]).optional(),
});

export const ZoomVideoSpaceConfigSchema = z.object({
  topic: z.string().min(1).max(200),
  type: z.string().optional(),
  startTime: z.string().datetime().optional(),
  duration: z.number().min(1).max(1440).optional(),
  timezone: z.string().optional(),
  password: z
    .string()
    .regex(/^[a-zA-Z0-9]{1,10}$/)
    .optional(),
  agenda: z.string().max(2000).optional(),
  hostVideo: z.boolean().optional(),
  participantVideo: z.boolean().optional(),
  joinBeforeHost: z.boolean().optional(),
  muteOnEntry: z.boolean().optional(),
  watermark: z.boolean().optional(),
  usePmi: z.boolean().optional(),
  approvalType: z.string().optional(),
  audio: z.enum(["both", "telephony", "voip"]).optional(),
  autoRecording: z.enum(["local", "cloud", "none"]).optional(),
  enforceLogin: z.boolean().optional(),
  enforceLoginDomains: z.string().optional(),
  alternativeHosts: z.string().optional(),
  closeRegistration: z.boolean().optional(),
  showShareButton: z.boolean().optional(),
  allowMultipleDevices: z.boolean().optional(),
  registrantsConfirmationEmail: z.boolean().optional(),
  waitingRoom: z.boolean().optional(),
  requestPermissionToUnmuteParticipants: z.boolean().optional(),
  meetingAuthentication: z.boolean().optional(),
  authenticationOption: z.string().optional(),
  authenticationDomains: z.string().optional(),
  authenticationName: z.string().optional(),
  recurrence: z
    .object({
      type: z.string(),
      repeatInterval: z.number().optional(),
      weeklyDays: z.string().optional(),
      monthlyDay: z.number().optional(),
      monthlyWeek: z.number().optional(),
      monthlyWeekDay: z.number().optional(),
      endTimes: z.number().optional(),
      endDateTime: z.string().datetime().optional(),
    })
    .optional(),
});

export const VimeoVideoSpaceConfigSchema = z.object({
  title: z.string().min(1).max(128),
  description: z.string().max(5000).optional(),
  privacy: z
    .object({
      view: z.enum(["anybody", "embed_only", "nobody", "password", "unlisted"]),
      embed: z.enum(["public", "private"]).optional(),
    })
    .optional(),
  password: z.string().min(1).max(32).optional(),
  embed: z
    .object({
      buttons: z
        .object({
          like: z.boolean().optional(),
          watchlater: z.boolean().optional(),
          share: z.boolean().optional(),
          embed: z.boolean().optional(),
          hd: z.boolean().optional(),
          fullscreen: z.boolean().optional(),
          scaling: z.boolean().optional(),
        })
        .optional(),
      logos: z
        .object({
          vimeo: z.boolean().optional(),
          custom: z
            .object({
              active: z.boolean().optional(),
              link: z.string().url().optional(),
              sticky: z.boolean().optional(),
            })
            .optional(),
        })
        .optional(),
      title: z
        .object({
          name: z.enum(["show", "hide"]).optional(),
          owner: z.enum(["show", "hide"]).optional(),
          portrait: z.enum(["show", "hide"]).optional(),
        })
        .optional(),
    })
    .optional(),
  spatial: z.boolean().optional(),
  contentRating: z.array(z.string()).optional(),
  license: z
    .enum(["by", "by-sa", "by-nd", "by-nc", "by-nc-sa", "by-nc-nd", "cc0"])
    .optional(),
  language: z.string().optional(),
  liveEvent: z
    .object({
      title: z.string().min(1).max(128),
      description: z.string().max(5000).optional(),
      autoRecord: z.boolean().optional(),
      dvr: z.boolean().optional(),
      lowLatency: z.boolean().optional(),
      chat: z
        .object({
          enabled: z.boolean().optional(),
        })
        .optional(),
      schedule: z
        .object({
          startTime: z.string().datetime().optional(),
          endTime: z.string().datetime().optional(),
        })
        .optional(),
      interactionTools: z
        .object({
          polls: z.boolean().optional(),
          qa: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
});

// =============================================================================
// Provider Response Schemas
// =============================================================================

export const MeetSpaceResponseSchema = z.object({
  spaceId: z.string(),
  name: z.string(),
  meetingUri: z.string(),
  meetingCode: z.string(),
  config: GoogleMeetVideoSpaceConfigSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ZoomMeetingResponseSchema = z.object({
  meetingId: z.number(),
  uuid: z.string(),
  hostId: z.string(),
  hostEmail: z.string(),
  topic: z.string(),
  type: z.string(),
  status: z.string(),
  startTime: z.string().datetime(),
  duration: z.number(),
  timezone: z.string(),
  password: z.string().optional(),
  joinUrl: z.string(),
  startUrl: z.string(),
  createdAt: z.string().datetime(),
  settings: ZoomVideoSpaceConfigSchema,
});

export const VimeoVideoResponseSchema = z.object({
  videoId: z.string(),
  uri: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  link: z.string(),
  playerEmbedUrl: z.string(),
  duration: z.number(),
  width: z.number(),
  height: z.number(),
  status: z.string(),
  privacy: z.object({
    view: z.string(),
  }),
  createdTime: z.string().datetime(),
  modifiedTime: z.string().datetime(),
  upload: z
    .object({
      status: z.string(),
    })
    .optional(),
});

// =============================================================================
// Export all schemas
// =============================================================================

export const videoConferencingSchemas = {
  // Base schemas
  ObjectId: ObjectIdSchema,
  VideoProvider: VideoProviderSchema,
  VideoSpaceStatus: VideoSpaceStatusSchema,
  MeetingStatus: MeetingStatusSchema,
  IntegrationStatus: IntegrationStatusSchema,
  ParticipantRole: ParticipantRoleSchema,
  RecordingType: RecordingTypeSchema,

  // Request/Response schemas
  CreateVideoSpaceRequest: CreateVideoSpaceRequestSchema,
  UpdateVideoSpaceRequest: UpdateVideoSpaceRequestSchema,
  VideoSpaceResponse: VideoSpaceResponseSchema,
  MeetingRecord: MeetingRecordSchema,
  MeetingParticipant: MeetingParticipantSchema,
  IntegrationAccount: IntegrationAccountSchema,
  LinkAlias: LinkAliasSchema,
  VideoConferencingKPI: VideoConferencingKPISchema,

  // Provider-specific config schemas
  GoogleMeetVideoSpaceConfig: GoogleMeetVideoSpaceConfigSchema,
  ZoomVideoSpaceConfig: ZoomVideoSpaceConfigSchema,
  VimeoVideoSpaceConfig: VimeoVideoSpaceConfigSchema,

  // Provider response schemas
  MeetSpaceResponse: MeetSpaceResponseSchema,
  ZoomMeetingResponse: ZoomMeetingResponseSchema,
  VimeoVideoResponse: VimeoVideoResponseSchema,
} as const;

export default videoConferencingSchemas;
