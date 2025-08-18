/**
 * Vimeo Validation Schemas
 * Zod schemas for Vimeo API v4 specific types and configurations
 */

import { z } from "zod";

// =============================================================================
// Vimeo Configuration Schemas
// =============================================================================

export const VimeoVideoSpaceConfigSchema = z
  .object({
    // Basic video configuration
    title: z.string().min(1).max(128),
    description: z.string().max(5000).optional(),

    // Privacy settings
    privacy: z.object({
      view: z.enum(["anybody", "embed_only", "nobody", "password", "unlisted"]),
      embed: z.enum(["private", "public", "whitelist"]),
      download: z.boolean().optional(),
      add: z.boolean().optional(),
      comments: z.enum(["anybody", "contacts", "nobody"]).optional(),
    }),
    password: z.string().min(1).max(32).optional(),

    // Live event settings (for live streaming)
    liveEvent: z
      .object({
        title: z.string().min(1).max(128),
        description: z.string().max(5000).optional(),
        autoRecord: z.boolean().default(false),
        dvr: z.boolean().default(false),
        lowLatency: z.boolean().default(false),
        chat: z.object({
          enabled: z.boolean().default(true),
        }),
        schedule: z.object({
          type: z.enum(["single_time", "recurring", "no_schedule"]),
          startsAt: z.string().datetime().optional(),
          endsAt: z.string().datetime().optional(),
          weekdays: z.array(z.number().int().min(0).max(6)).optional(), // 0=Sunday, 6=Saturday
        }),
        interactionTools: z.object({
          isAnonymousQuestionsEnabled: z.boolean().default(false),
          isQAndAEnabled: z.boolean().default(false),
          isPollsEnabled: z.boolean().default(false),
        }),
      })
      .optional(),

    // Content settings
    contentRating: z
      .enum(["drugs", "language", "nudity", "safe", "unrated", "violence"])
      .default("safe"),
    license: z
      .enum(["by", "by-nc", "by-nc-nd", "by-nc-sa", "by-nd", "by-sa", "cc0"])
      .optional(),
    language: z.string().default("en"),

    // Upload settings
    folderUri: z.string().optional(),

    // Embed settings
    embed: z
      .object({
        color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
          .optional(),
        autoplay: z.boolean().default(false),
        loop: z.boolean().default(false),
        title: z
          .object({
            name: z.enum(["hide", "show", "user"]).default("show"),
            owner: z.enum(["hide", "show", "user"]).default("show"),
            portrait: z.enum(["hide", "show", "user"]).default("show"),
          })
          .optional(),
        playbar: z.boolean().default(true),
        volume: z.boolean().default(true),
        speed: z.boolean().default(false),
        fullscreenButton: z.boolean().default(true),
        pipButton: z.boolean().default(true),
        responsive: z.boolean().default(false),
      })
      .optional(),

    // Spatial/360 video settings
    spatial: z
      .object({
        stereoFormat: z.enum(["left-right", "mono", "top-bottom"]),
        projection: z.enum([
          "cubical",
          "cylindrical",
          "dome",
          "equirectangular",
          "pyramid",
        ]),
        fieldOfView: z.number().min(30).max(360).optional(),
        spatialNotes: z.string().max(255).optional(),
      })
      .optional(),
  })
  .strict();

// =============================================================================
// Vimeo Request/Response Schemas
// =============================================================================

export const CreateVimeoVideoRequestSchema = z
  .object({
    name: z.string().min(1).max(128),
    config: VimeoVideoSpaceConfigSchema.optional(),
    upload: z
      .object({
        approach: z.enum(["post", "pull", "streaming", "tus"]),
        size: z.number().int().min(1).optional(),
      })
      .optional(),
  })
  .strict();

export const CreateVimeoLiveEventRequestSchema = z
  .object({
    title: z.string().min(1).max(128),
    config: VimeoVideoSpaceConfigSchema.optional(),
    settings: z.record(z.any()).optional(), // VimeoLiveEventSettings
  })
  .strict();

export const UpdateVimeoVideoRequestSchema = z
  .object({
    name: z.string().min(1).max(128).optional(),
    config: VimeoVideoSpaceConfigSchema.partial().optional(),
  })
  .strict();

export const VimeoVideoResponseSchema = z
  .object({
    videoId: z.string(),
    uri: z.string(),
    name: z.string(),
    description: z.string().optional(),
    link: z.string().url(),
    playerEmbedUrl: z.string().url(),
    duration: z.number().int().min(0),
    width: z.number().int().min(0),
    height: z.number().int().min(0),
    status: z.string(),
    privacy: z.object({
      view: z.string(),
      embed: z.string(),
      download: z.boolean().optional(),
      add: z.boolean().optional(),
      comments: z.string().optional(),
    }),
    createdTime: z.string().datetime(),
    modifiedTime: z.string().datetime(),
    upload: z.record(z.any()).optional(),
  })
  .strict();

export const VimeoLiveEventResponseSchema = z
  .object({
    eventId: z.string(),
    uri: z.string(),
    title: z.string(),
    description: z.string().optional(),
    link: z.string().url(),
    embedUrl: z.string().url(),
    status: z.enum(["idle", "live", "ended"]),
    scheduledStartTime: z.string().datetime().optional(),
    scheduledEndTime: z.string().datetime().optional(),
    actualStartTime: z.string().datetime().optional(),
    actualEndTime: z.string().datetime().optional(),
    streamKey: z.string().optional(),
    streamUrl: z.string().url().optional(),
    settings: z.record(z.any()),
  })
  .strict();

// =============================================================================
// Vimeo Status and Analytics Schemas
// =============================================================================

export const VimeoRoomStatusSchema = z
  .object({
    videoId: z.string(),
    isLive: z.boolean(),
    status: z.enum([
      "available",
      "quota_exceeded",
      "total_cap_exceeded",
      "transcode_starting",
      "transcoding",
      "transcoding_error",
      "unavailable",
      "uploading",
      "uploading_error",
    ]),
    viewerCount: z.number().int().min(0).optional(),
    startTime: z.string().datetime().optional(),
    duration: z.number().int().min(0).optional(),
  })
  .strict();

export const VimeoParticipantDataSchema = z
  .object({
    // Vimeo doesn't have traditional "participants" like Meet/Zoom
    // Instead, we track viewers and engagement metrics
    viewerId: z.string().optional(),
    viewerLocation: z.string().optional(),
    viewTime: z.number().int().min(0), // Total view time in seconds
    viewPercentage: z.number().min(0).max(100), // Percentage of video watched
    deviceType: z.enum(["desktop", "mobile", "tablet", "tv"]).optional(),
    referrer: z.string().url().optional(),
    timestamp: z.string().datetime(),
  })
  .strict();

export const VimeoRecordingDataSchema = z
  .object({
    videoId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    duration: z.number().int().min(0),
    width: z.number().int().min(0),
    height: z.number().int().min(0),
    fileSize: z.number().int().min(0).optional(),
    quality: z.enum(["hd", "sd", "source"]),
    downloadUrl: z.string().url().optional(),
    embedUrl: z.string().url(),
    playerEmbedUrl: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
    createdTime: z.string().datetime(),
    modifiedTime: z.string().datetime(),
    status: z.enum(["available", "transcoding", "uploading", "error"]),
  })
  .strict();

export const VimeoAnalyticsDataSchema = z
  .object({
    videoId: z.string(),
    plays: z.number().int().min(0),
    impressions: z.number().int().min(0),
    finishes: z.number().int().min(0),
    likes: z.number().int().min(0),
    comments: z.number().int().min(0),
    downloads: z.number().int().min(0),
    totalSecondsPlayed: z.number().int().min(0),
    averagePercentPlayed: z.number().min(0).max(100),
    averageSecondsPlayed: z.number().min(0),

    // Geographic data
    countries: z.array(
      z.object({
        country: z.string(),
        plays: z.number().int().min(0),
        impressions: z.number().int().min(0),
      })
    ),

    // Domain data
    domains: z.array(
      z.object({
        domain: z.string(),
        plays: z.number().int().min(0),
        impressions: z.number().int().min(0),
      })
    ),

    // Device data
    deviceTypes: z.array(
      z.object({
        deviceType: z.string(),
        plays: z.number().int().min(0),
        impressions: z.number().int().min(0),
      })
    ),

    // Quality data
    streamingQualities: z.array(
      z.object({
        quality: z.string(),
        plays: z.number().int().min(0),
        impressions: z.number().int().min(0),
      })
    ),
  })
  .strict();

export const VimeoWebhookPayloadSchema = z
  .object({
    type: z.enum(["video", "live_event"]),
    action: z.enum([
      "upload",
      "available",
      "transcode_complete",
      "live_started",
      "live_ended",
    ]),
    data: z.object({
      video: z.record(z.any()).optional(),
      liveEvent: z.record(z.any()).optional(),
      user: z.record(z.any()),
    }),
    timestamp: z.string().datetime(),
  })
  .strict();

// =============================================================================
// Vimeo Analytics Extended Schemas
// =============================================================================

export const VimeoVideoAnalyticsExtendedSchema = z
  .object({
    videoId: z.string(),
    title: z.string(),
    totalViews: z.number().int().min(0),
    uniqueViewers: z.number().int().min(0),
    totalWatchTime: z.number().int().min(0), // in seconds
    averageWatchTime: z.number().min(0),
    completionRate: z.number().min(0).max(100),
    engagementScore: z.number().min(0).max(100),

    // Time-based analytics
    viewsByDay: z.array(
      z.object({
        date: z.string().date(),
        views: z.number().int().min(0),
        watchTime: z.number().int().min(0),
      })
    ),

    // Geographic analytics
    topCountries: z.array(
      z.object({
        country: z.string(),
        views: z.number().int().min(0),
        percentage: z.number().min(0).max(100),
      })
    ),

    // Device analytics
    deviceBreakdown: z.array(
      z.object({
        device: z.string(),
        views: z.number().int().min(0),
        percentage: z.number().min(0).max(100),
      })
    ),

    // Referrer analytics
    topReferrers: z.array(
      z.object({
        referrer: z.string(),
        views: z.number().int().min(0),
        percentage: z.number().min(0).max(100),
      })
    ),

    // Quality analytics
    qualityBreakdown: z.array(
      z.object({
        quality: z.string(),
        views: z.number().int().min(0),
        percentage: z.number().min(0).max(100),
      })
    ),
  })
  .strict();

export const VimeoEngagementMetricsSchema = z
  .object({
    videoId: z.string(),
    totalVideos: z.number().int().min(0),
    totalViews: z.number().int().min(0),
    totalWatchTime: z.number().int().min(0),
    averageEngagement: z.number().min(0).max(100),
    viewerRetentionRate: z.number().min(0).max(100),
    socialEngagement: z.object({
      likes: z.number().int().min(0),
      comments: z.number().int().min(0),
      shares: z.number().int().min(0),
    }),
    conversionMetrics: z.object({
      clickThroughRate: z.number().min(0).max(100),
      callToActionClicks: z.number().int().min(0),
    }),
  })
  .strict();

// =============================================================================
// Vimeo Authentication Schemas
// =============================================================================

export const VimeoServiceConfigSchema = z
  .object({
    clientId: z.string(),
    clientSecret: z.string(),
    accessToken: z.string().optional(),
    redirectUri: z.string().url().optional(),
    scopes: z.array(z.string()),
  })
  .strict();

export const VimeoAuthResultSchema = z
  .object({
    accessToken: z.string(),
    tokenType: z.literal("bearer"),
    scopes: z.array(z.string()),
    userUri: z.string().optional(),
    userName: z.string().optional(),
  })
  .strict();

// =============================================================================
// Vimeo Error Schemas
// =============================================================================

export const VimeoServiceErrorSchema = z
  .object({
    code: z.enum([
      "VIMEO_AUTH_ERROR",
      "VIMEO_API_ERROR",
      "VIMEO_UPLOAD_ERROR",
      "VIMEO_WEBHOOK_ERROR",
    ]),
    message: z.string(),
    details: z
      .object({
        apiError: z.record(z.any()).optional(),
        statusCode: z.number().int().optional(),
        requestId: z.string().optional(),
        vimeoErrorCode: z.number().int().optional(),
      })
      .optional(),
  })
  .strict();

// =============================================================================
// Constants and Validation Utilities
// =============================================================================

export const VIMEO_SCOPES = [
  "public",
  "private",
  "purchased",
  "create",
  "edit",
  "delete",
  "interact",
  "upload",
  "stats",
] as const;

export const VIMEO_WEBHOOK_EVENTS = [
  "video.upload",
  "video.available",
  "video.transcode_complete",
  "live_event.started",
  "live_event.ended",
  "live_event.archive_complete",
] as const;

export const VIMEO_PRIVACY_OPTIONS = {
  VIEW: ["anybody", "embed_only", "nobody", "password", "unlisted"],
  EMBED: ["private", "public", "whitelist"],
  COMMENTS: ["anybody", "contacts", "nobody"],
} as const;

export const VIMEO_CONTENT_RATINGS = [
  "drugs",
  "language",
  "nudity",
  "safe",
  "unrated",
  "violence",
] as const;

export const VIMEO_UPLOAD_APPROACHES = [
  "post",
  "pull",
  "streaming",
  "tus",
] as const;

export const VIMEO_VIDEO_QUALITIES = [
  "240p",
  "360p",
  "540p",
  "720p",
  "1080p",
  "2K",
  "4K",
] as const;

export const VIMEO_SPATIAL_PROJECTIONS = [
  "cubical",
  "cylindrical",
  "dome",
  "equirectangular",
  "pyramid",
] as const;

// =============================================================================
// Validation Functions
// =============================================================================

export const validateVimeoVideoSpaceConfig = (config: unknown) => {
  return VimeoVideoSpaceConfigSchema.safeParse(config);
};

export const validateCreateVimeoVideoRequest = (request: unknown) => {
  return CreateVimeoVideoRequestSchema.safeParse(request);
};

export const validateCreateVimeoLiveEventRequest = (request: unknown) => {
  return CreateVimeoLiveEventRequestSchema.safeParse(request);
};

export const validateUpdateVimeoVideoRequest = (request: unknown) => {
  return UpdateVimeoVideoRequestSchema.safeParse(request);
};

export const validateVimeoWebhookPayload = (payload: unknown) => {
  return VimeoWebhookPayloadSchema.safeParse(payload);
};

export const validateVimeoServiceConfig = (config: unknown) => {
  return VimeoServiceConfigSchema.safeParse(config);
};

export const validateVimeoScopes = (scopes: string[]): boolean => {
  const validScopes = VIMEO_SCOPES;
  return scopes.every((scope) => validScopes.includes(scope as any));
};

export const validateVimeoPrivacyView = (view: string): boolean => {
  return VIMEO_PRIVACY_OPTIONS.VIEW.includes(view as any);
};

export const validateVimeoPrivacyEmbed = (embed: string): boolean => {
  return VIMEO_PRIVACY_OPTIONS.EMBED.includes(embed as any);
};

export const validateVimeoPrivacyComments = (comments: string): boolean => {
  return VIMEO_PRIVACY_OPTIONS.COMMENTS.includes(comments as any);
};

export const validateVimeoContentRating = (rating: string): boolean => {
  return VIMEO_CONTENT_RATINGS.includes(rating as any);
};

export const validateVimeoUploadApproach = (approach: string): boolean => {
  return VIMEO_UPLOAD_APPROACHES.includes(approach as any);
};

export const validateVimeoVideoQuality = (quality: string): boolean => {
  return VIMEO_VIDEO_QUALITIES.includes(quality as any);
};

export const validateVimeoSpatialProjection = (projection: string): boolean => {
  return VIMEO_SPATIAL_PROJECTIONS.includes(projection as any);
};

export const validateVimeoWebhookEvent = (event: string): boolean => {
  return VIMEO_WEBHOOK_EVENTS.includes(event as any);
};

export const validateVimeoTitle = (title: string): boolean => {
  return title.length >= 1 && title.length <= 128;
};

export const validateVimeoDescription = (description: string): boolean => {
  return description.length <= 5000;
};

export const validateVimeoPassword = (password: string): boolean => {
  return password.length >= 1 && password.length <= 32;
};

export const validateVimeoHexColor = (color: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

// =============================================================================
// Type Inference
// =============================================================================

export type VimeoVideoSpaceConfig = z.infer<typeof VimeoVideoSpaceConfigSchema>;
export type CreateVimeoVideoRequest = z.infer<
  typeof CreateVimeoVideoRequestSchema
>;
export type CreateVimeoLiveEventRequest = z.infer<
  typeof CreateVimeoLiveEventRequestSchema
>;
export type UpdateVimeoVideoRequest = z.infer<
  typeof UpdateVimeoVideoRequestSchema
>;
export type VimeoVideoResponse = z.infer<typeof VimeoVideoResponseSchema>;
export type VimeoLiveEventResponse = z.infer<
  typeof VimeoLiveEventResponseSchema
>;
export type VimeoRoomStatus = z.infer<typeof VimeoRoomStatusSchema>;
export type VimeoParticipantData = z.infer<typeof VimeoParticipantDataSchema>;
export type VimeoRecordingData = z.infer<typeof VimeoRecordingDataSchema>;
export type VimeoAnalyticsData = z.infer<typeof VimeoAnalyticsDataSchema>;
export type VimeoWebhookPayload = z.infer<typeof VimeoWebhookPayloadSchema>;
export type VimeoVideoAnalyticsExtended = z.infer<
  typeof VimeoVideoAnalyticsExtendedSchema
>;
export type VimeoEngagementMetrics = z.infer<
  typeof VimeoEngagementMetricsSchema
>;
export type VimeoServiceConfig = z.infer<typeof VimeoServiceConfigSchema>;
export type VimeoAuthResult = z.infer<typeof VimeoAuthResultSchema>;
export type VimeoServiceError = z.infer<typeof VimeoServiceErrorSchema>;
