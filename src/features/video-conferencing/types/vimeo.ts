/**
 * Vimeo API v4 Types for Video Conferencing Platform
 * Based on docs/vimeo/types.ts with platform-specific adaptations
 */

// Re-export core Vimeo types from documentation
export type {
  VimeoApiError,
  VimeoApiResponse,
  VimeoPagination,
  VimeoOAuthConfig,
  VimeoAccessToken,
  VimeoUser,
  VimeoConnection,
  VimeoInteraction,
  VimeoVideo,
  VimeoPrivacy,
  VimeoPictureSize,
  VimeoTag,
  VimeoVideoStats,
  VimeoCategory,
  VimeoUpload,
  VimeoTranscode,
  VimeoChapter,
  VimeoFolder,
  VimeoVideoFile,
  VimeoDownloadFile,
  VimeoSpatialData,
  VimeoLiveEvent,
  VimeoEmbedSettings,
  VimeoPlayerConfig,
  VimeoUploadRequest,
  VimeoUploadResponse,
  VimeoTusUploadOptions,
  VimeoAlbum,
  CreateAlbumRequest,
  VimeoVideoAnalytics,
  VimeoAnalyticsQuery,
  VimeoTextTrack,
  CreateTextTrackRequest,
  VimeoComment,
  CreateCommentRequest,
  VimeoTeamMember,
  VimeoTeamPermission,
  VimeoLiveStream,
  VimeoLiveEventSettings,
  VimeoApiRequestConfig,
  VimeoClientOptions,
} from "../../../docs/vimeo/types";

// =============================================================================
// Platform-Specific Vimeo Types
// =============================================================================

export interface VimeoVideoSpaceConfig {
  // Basic video configuration
  title: string;
  description?: string;

  // Privacy settings
  privacy: {
    view: "anybody" | "embed_only" | "nobody" | "password" | "unlisted";
    embed: "private" | "public" | "whitelist";
    download?: boolean;
    add?: boolean;
    comments?: "anybody" | "contacts" | "nobody";
  };
  password?: string;

  // Live event settings (for live streaming)
  liveEvent?: {
    title: string;
    description?: string;
    autoRecord?: boolean;
    dvr?: boolean;
    lowLatency?: boolean;
    chat?: {
      enabled: boolean;
    };
    schedule?: {
      type: "single_time" | "recurring" | "no_schedule";
      startsAt?: string;
      endsAt?: string;
      weekdays?: number[];
    };
    interactionTools?: {
      isAnonymousQuestionsEnabled: boolean;
      isQAndAEnabled: boolean;
      isPollsEnabled: boolean;
    };
  };

  // Content settings
  contentRating?:
    | "drugs"
    | "language"
    | "nudity"
    | "safe"
    | "unrated"
    | "violence";
  license?:
    | "by"
    | "by-nc"
    | "by-nc-nd"
    | "by-nc-sa"
    | "by-nd"
    | "by-sa"
    | "cc0";
  language?: string;

  // Upload settings
  folderUri?: string;

  // Embed settings
  embed?: {
    color?: string;
    autoplay?: boolean;
    loop?: boolean;
    title?: {
      name: "hide" | "show" | "user";
      owner: "hide" | "show" | "user";
      portrait: "hide" | "show" | "user";
    };
    playbar?: boolean;
    volume?: boolean;
    speed?: boolean;
    fullscreenButton?: boolean;
    pipButton?: boolean;
    responsive?: boolean;
  };

  // Spatial/360 video settings
  spatial?: {
    stereoFormat: "left-right" | "mono" | "top-bottom";
    projection:
      | "cubical"
      | "cylindrical"
      | "dome"
      | "equirectangular"
      | "pyramid";
    fieldOfView?: number;
    spatialNotes?: string;
  };
}

export interface VimeoRoomStatus {
  videoId: string;
  isLive: boolean;
  status:
    | "available"
    | "quota_exceeded"
    | "total_cap_exceeded"
    | "transcode_starting"
    | "transcoding"
    | "transcoding_error"
    | "unavailable"
    | "uploading"
    | "uploading_error";
  viewerCount?: number;
  startTime?: string;
  duration?: number;
}

export interface VimeoParticipantData {
  // Vimeo doesn't have traditional "participants" like Meet/Zoom
  // Instead, we track viewers and engagement metrics
  viewerId?: string;
  viewerLocation?: string;
  viewTime: number; // Total view time in seconds
  viewPercentage: number; // Percentage of video watched
  deviceType?: "desktop" | "mobile" | "tablet" | "tv";
  referrer?: string;
  timestamp: string;
}

export interface VimeoRecordingData {
  videoId: string;
  title: string;
  description?: string;
  duration: number;
  width: number;
  height: number;
  fileSize?: number;
  quality: "hd" | "sd" | "source";
  downloadUrl?: string;
  embedUrl: string;
  playerEmbedUrl: string;
  thumbnailUrl?: string;
  createdTime: string;
  modifiedTime: string;
  status: "available" | "transcoding" | "uploading" | "error";
}

export interface VimeoAnalyticsData {
  videoId: string;
  plays: number;
  impressions: number;
  finishes: number;
  likes: number;
  comments: number;
  downloads: number;
  totalSecondsPlayed: number;
  averagePercentPlayed: number;
  averageSecondsPlayed: number;

  // Geographic data
  countries: Array<{
    country: string;
    plays: number;
    impressions: number;
  }>;

  // Domain data
  domains: Array<{
    domain: string;
    plays: number;
    impressions: number;
  }>;

  // Device data
  deviceTypes: Array<{
    deviceType: string;
    plays: number;
    impressions: number;
  }>;

  // Quality data
  streamingQualities: Array<{
    quality: string;
    plays: number;
    impressions: number;
  }>;
}

export interface VimeoWebhookPayload {
  type: "video" | "live_event";
  action:
    | "upload"
    | "available"
    | "transcode_complete"
    | "live_started"
    | "live_ended";
  data: {
    video?: VimeoVideo;
    liveEvent?: VimeoLiveEvent;
    user: VimeoUser;
  };
  timestamp: string;
}

// =============================================================================
// Vimeo Service Interfaces
// =============================================================================

export interface VimeoServiceConfig {
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  redirectUri?: string;
  scopes: string[];
}

export interface VimeoAuthResult {
  accessToken: string;
  tokenType: "bearer";
  scopes: string[];
  userUri?: string;
  userName?: string;
}

export interface CreateVimeoVideoRequest {
  name: string;
  config?: VimeoVideoSpaceConfig;
  upload?: {
    approach: "post" | "pull" | "streaming" | "tus";
    size?: number;
  };
}

export interface CreateVimeoLiveEventRequest {
  title: string;
  config?: VimeoVideoSpaceConfig;
  settings?: VimeoLiveEventSettings;
}

export interface UpdateVimeoVideoRequest {
  name?: string;
  config?: Partial<VimeoVideoSpaceConfig>;
}

export interface VimeoVideoResponse {
  videoId: string;
  uri: string;
  name: string;
  description?: string;
  link: string;
  playerEmbedUrl: string;
  duration: number;
  width: number;
  height: number;
  status: string;
  privacy: VimeoPrivacy;
  createdTime: string;
  modifiedTime: string;
  upload?: VimeoUpload;
}

export interface VimeoLiveEventResponse {
  eventId: string;
  uri: string;
  title: string;
  description?: string;
  link: string;
  embedUrl: string;
  status: "idle" | "live" | "ended";
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  streamKey?: string;
  streamUrl?: string;
  settings: VimeoLiveEventSettings;
}

// =============================================================================
// Vimeo Analytics Types
// =============================================================================

export interface VimeoVideoAnalyticsExtended {
  videoId: string;
  title: string;
  totalViews: number;
  uniqueViewers: number;
  totalWatchTime: number; // in seconds
  averageWatchTime: number;
  completionRate: number;
  engagementScore: number;

  // Time-based analytics
  viewsByDay: Array<{
    date: string;
    views: number;
    watchTime: number;
  }>;

  // Geographic analytics
  topCountries: Array<{
    country: string;
    views: number;
    percentage: number;
  }>;

  // Device analytics
  deviceBreakdown: Array<{
    device: string;
    views: number;
    percentage: number;
  }>;

  // Referrer analytics
  topReferrers: Array<{
    referrer: string;
    views: number;
    percentage: number;
  }>;

  // Quality analytics
  qualityBreakdown: Array<{
    quality: string;
    views: number;
    percentage: number;
  }>;
}

export interface VimeoEngagementMetrics {
  videoId: string;
  totalVideos: number;
  totalViews: number;
  totalWatchTime: number;
  averageEngagement: number;
  viewerRetentionRate: number;
  socialEngagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  conversionMetrics: {
    clickThroughRate: number;
    callToActionClicks: number;
  };
}

// =============================================================================
// Error Types
// =============================================================================

export interface VimeoServiceError {
  code:
    | "VIMEO_AUTH_ERROR"
    | "VIMEO_API_ERROR"
    | "VIMEO_UPLOAD_ERROR"
    | "VIMEO_WEBHOOK_ERROR";
  message: string;
  details?: {
    apiError?: VimeoApiError;
    statusCode?: number;
    requestId?: string;
    vimeoErrorCode?: number;
  };
}

// =============================================================================
// Constants
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
