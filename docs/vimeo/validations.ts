/**
 * Vimeo API v4 Zod Validation Schemas
 * Comprehensive validation schemas for all Vimeo API endpoints
 * https://developer.vimeo.com/api/
 */

import { z } from 'zod';

// =============================================================================
// Base Validation Schemas
// =============================================================================

export const vimeoPaginationSchema = z.object({
  page: z.number().min(1).optional().default(1),
  per_page: z.number().min(1).max(100).optional().default(25),
  query: z.string().optional(),
  filter: z.string().optional(),
  filter_embeddable: z.boolean().optional(),
  sort: z.enum([
    'alphabetical',
    'date',
    'default',
    'duration',
    'last_user_action_event_date',
    'likes',
    'modified_time',
    'plays'
  ]).optional(),
  direction: z.enum(['asc', 'desc']).optional().default('asc')
});

export const vimeoDateRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional()
}).refine(data => {
  if (data.from && data.to) {
    return new Date(data.from) <= new Date(data.to);
  }
  return true;
}, {
  message: 'From date must be before or equal to To date',
  path: ['from']
});

export const vimeoColorSchema = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format');

export const vimeoLanguageSchema = z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Invalid language code format');

// =============================================================================
// Authentication Schemas
// =============================================================================

export const vimeoOAuthConfigSchema = z.object({
  client_id: z.string().min(1, 'Client ID is required'),
  client_secret: z.string().min(1, 'Client secret is required'),
  access_token: z.string().optional(),
  scope: z.array(z.enum([
    'private',
    'public',
    'purchased',
    'create',
    'edit',
    'delete',
    'interact',
    'upload',
    'promo_codes',
    'video_files',
    'email',
    'stats'
  ])).optional().default(['public']),
  redirect_uri: z.string().url().optional()
});

export const vimeoAccessTokenRequestSchema = z.object({
  grant_type: z.enum(['authorization_code', 'client_credentials']),
  code: z.string().optional(),
  redirect_uri: z.string().url().optional(),
  scope: z.string().optional()
}).refine(
  data => data.grant_type === 'client_credentials' || (data.code && data.redirect_uri),
  { message: 'Code and redirect_uri required for authorization_code grant type' }
);

// =============================================================================
// Video Validation Schemas
// =============================================================================

export const vimeoPrivacySchema = z.object({
  view: z.enum(['anybody', 'contacts', 'disable', 'nobody', 'password', 'unlisted', 'users']).optional().default('anybody'),
  embed: z.enum(['private', 'public', 'whitelist']).optional().default('public'),
  download: z.boolean().optional().default(false),
  add: z.boolean().optional().default(true),
  comments: z.enum(['anybody', 'contacts', 'nobody']).optional().default('anybody')
});

export const vimeoSpatialDataSchema = z.object({
  stereo_format: z.enum(['left-right', 'mono', 'top-bottom']).optional().default('mono'),
  projection: z.enum(['cubical', 'cylindrical', 'dome', 'equirectangular', 'pyramid']).optional().default('equirectangular'),
  field_of_view: z.number().min(30).max(180).optional(),
  director_timeline: z.array(z.object({
    pitch: z.number().min(-90).max(90),
    yaw: z.number().min(-180).max(180),
    time_code: z.number().min(0),
    roll: z.number().min(-180).max(180).optional()
  })).optional()
});

export const vimeoVideoUpdateSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  description: z.string().max(5000).optional(),
  privacy: vimeoPrivacySchema.optional(),
  password: z.string().min(1).max(255).optional(),
  content_rating: z.enum(['drugs', 'language', 'nudity', 'safe', 'unrated', 'violence']).optional().default('safe'),
  license: z.enum(['by', 'by-nc', 'by-nc-nd', 'by-nc-sa', 'by-nd', 'by-sa', 'cc0']).optional(),
  spatial: vimeoSpatialDataSchema.optional(),
  comment_privacy: z.enum(['anybody', 'contacts', 'nobody']).optional(),
  review_page: z.object({
    active: z.boolean()
  }).optional()
});

export const vimeoVideoListQuerySchema = z.object({
  query: z.string().optional(),
  filter: z.enum(['app_only', 'embeddable', 'featured', 'playable']).optional(),
  filter_embeddable: z.boolean().optional(),
  filter_playable: z.boolean().optional(),
  sort: z.enum([
    'alphabetical',
    'date',
    'default',
    'duration',
    'last_user_action_event_date',
    'likes',
    'modified_time',
    'plays'
  ]).optional().default('date'),
  direction: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.number().min(1).optional().default(1),
  per_page: z.number().min(1).max(100).optional().default(25),
  uris: z.string().optional(),
  containing_uri: z.string().optional(),
  filter_content_rating: z.array(z.enum(['drugs', 'language', 'nudity', 'safe', 'unrated', 'violence'])).optional()
});

export const vimeoVideoIdSchema = z.union([
  z.string().regex(/^\d+$/, 'Video ID must be numeric'),
  z.number().int().positive()
]).transform(val => String(val));

// =============================================================================
// Upload Validation Schemas
// =============================================================================

export const vimeoUploadApproachSchema = z.enum(['post', 'pull', 'streaming', 'tus']);

export const vimeoUploadRequestSchema = z.object({
  upload: z.object({
    approach: vimeoUploadApproachSchema,
    size: z.number().int().positive().optional()
  }),
  name: z.string().min(1).max(128).optional(),
  description: z.string().max(5000).optional(),
  privacy: vimeoPrivacySchema.optional(),
  password: z.string().min(1).max(255).optional(),
  content_rating: z.enum(['drugs', 'language', 'nudity', 'safe', 'unrated', 'violence']).optional().default('safe'),
  spatial: vimeoSpatialDataSchema.optional(),
  folder_uri: z.string().optional(),
  hide_from_vimeo: z.boolean().optional().default(false),
  embed_domains: z.array(z.string().url()).optional(),
  embed_domains_whitelist: z.array(z.string()).optional()
});

export const vimeoPullUploadSchema = z.object({
  type: z.enum(['youtube', 'stock']),
  link: z.string().url('Invalid URL for pull upload'),
  name: z.string().min(1).max(128).optional(),
  description: z.string().max(5000).optional(),
  privacy: vimeoPrivacySchema.optional(),
  password: z.string().optional()
});

export const vimeoTusUploadOptionsSchema = z.object({
  endpoint: z.string().url('Invalid TUS endpoint URL'),
  metadata: z.object({
    filename: z.string().min(1),
    filetype: z.string().regex(/^[a-zA-Z0-9]+\/[a-zA-Z0-9\-\+\.]+$/, 'Invalid MIME type')
  }),
  headers: z.record(z.string(), z.string()).optional(),
  chunkSize: z.number().int().positive().optional().default(8 * 1024 * 1024), // 8MB
  parallelUploads: z.number().int().min(1).max(10).optional().default(1),
  storeFingerprintForResuming: z.boolean().optional().default(true),
  removeFingerprintOnSuccess: z.boolean().optional().default(true),
  overridePatchMethod: z.boolean().optional().default(false)
});

// =============================================================================
// Album Validation Schemas
// =============================================================================

export const albumPrivacySchema = z.object({
  view: z.enum(['anybody', 'embed_only', 'password']).optional().default('anybody'),
  join: z.enum(['anybody', 'followers']).optional().default('anybody')
});

export const createAlbumSchema = z.object({
  name: z.string().min(1).max(128, 'Album name must be between 1 and 128 characters'),
  description: z.string().max(5000).optional(),
  privacy: albumPrivacySchema.optional(),
  password: z.string().min(1).max(255).optional(),
  sort: z.enum([
    'added_first',
    'added_last',
    'alphabetical',
    'arranged',
    'comments',
    'date',
    'default',
    'duration',
    'likes',
    'manual',
    'modified_time',
    'plays'
  ]).optional().default('manual'),
  theme: z.enum(['dark', 'standard']).optional().default('standard'),
  web_theme_id: z.string().optional()
});

export const updateAlbumSchema = createAlbumSchema.partial();

export const albumListQuerySchema = z.object({
  query: z.string().optional(),
  sort: z.enum(['alphabetical', 'date', 'duration', 'videos']).optional().default('date'),
  direction: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.number().min(1).optional().default(1),
  per_page: z.number().min(1).max(100).optional().default(25)
});

export const addVideoToAlbumSchema = z.object({
  video_uri: z.string().regex(/^\/videos\/\d+$/, 'Invalid video URI format')
});

// =============================================================================
// Embed and Player Validation Schemas
// =============================================================================

export const vimeoPlayerConfigSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  url: z.string().url().optional(),
  width: z.number().int().min(200).max(1920).optional(),
  height: z.number().int().min(150).max(1080).optional(),
  autopause: z.boolean().optional().default(true),
  autoplay: z.boolean().optional().default(false),
  background: z.boolean().optional().default(false),
  byline: z.boolean().optional().default(true),
  color: vimeoColorSchema.optional().default('#00adef'),
  controls: z.boolean().optional().default(true),
  dnt: z.boolean().optional().default(false),
  keyboard: z.boolean().optional().default(true),
  loop: z.boolean().optional().default(false),
  maxheight: z.number().int().min(150).optional(),
  maxwidth: z.number().int().min(200).optional(),
  muted: z.boolean().optional().default(false),
  pip: z.boolean().optional().default(false),
  playsinline: z.boolean().optional().default(true),
  portrait: z.boolean().optional().default(true),
  quality: z.enum(['auto', '240p', '360p', '540p', '720p', '1080p', '2K', '4K']).optional().default('auto'),
  responsive: z.boolean().optional().default(false),
  speed: z.boolean().optional().default(false),
  texttrack: vimeoLanguageSchema.optional(),
  title: z.boolean().optional().default(true),
  transparent: z.boolean().optional().default(true)
});

export const vimeoEmbedSettingsUpdateSchema = z.object({
  badges: z.object({
    hdr: z.boolean().optional(),
    live: z.object({
      streaming: z.boolean().optional(),
      archived: z.boolean().optional()
    }).optional(),
    staff_pick: z.object({
      normal: z.boolean().optional(),
      best_of_the_month: z.boolean().optional(),
      best_of_the_year: z.boolean().optional(),
      premiere: z.boolean().optional()
    }).optional()
  }).optional(),
  logos: z.object({
    vimeo: z.boolean().optional(),
    custom: z.object({
      active: z.boolean().optional(),
      url: z.string().url().optional(),
      link: z.string().url().optional(),
      sticky: z.boolean().optional()
    }).optional()
  }).optional(),
  playbar: z.boolean().optional(),
  volume: z.boolean().optional(),
  speed: z.boolean().optional(),
  color: vimeoColorSchema.optional(),
  title: z.object({
    name: z.enum(['hide', 'show', 'user']).optional(),
    owner: z.enum(['hide', 'show', 'user']).optional(),
    portrait: z.enum(['hide', 'show', 'user']).optional()
  }).optional(),
  autoplay: z.boolean().optional(),
  autopause: z.boolean().optional(),
  loop: z.boolean().optional(),
  keyboard: z.boolean().optional(),
  fullscreen_button: z.boolean().optional(),
  pip_button: z.boolean().optional(),
  chapters: z.boolean().optional(),
  transparent: z.boolean().optional(),
  responsive: z.boolean().optional(),
  dnt: z.boolean().optional()
});

// =============================================================================
// Text Track Validation Schemas
// =============================================================================

export const createTextTrackSchema = z.object({
  type: z.enum(['captions', 'subtitles']),
  language: vimeoLanguageSchema,
  name: z.string().min(1).max(255).optional()
});

export const updateTextTrackSchema = z.object({
  active: z.boolean().optional(),
  name: z.string().min(1).max(255).optional(),
  language: vimeoLanguageSchema.optional()
});

// =============================================================================
// Comment Validation Schemas
// =============================================================================

export const createCommentSchema = z.object({
  text: z.string().min(1).max(8000, 'Comment must be between 1 and 8000 characters')
});

export const updateCommentSchema = z.object({
  text: z.string().min(1).max(8000, 'Comment must be between 1 and 8000 characters')
});

export const commentListQuerySchema = z.object({
  direction: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.number().min(1).optional().default(1),
  per_page: z.number().min(1).max(50).optional().default(25)
});

// =============================================================================
// Analytics Validation Schemas
// =============================================================================

export const vimeoAnalyticsQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  dimension: z.enum(['country', 'device_type', 'domain', 'embed_domain', 'streaming_quality', 'total']).optional(),
  filter: z.string().optional(),
  per_page: z.number().min(1).max(100).optional().default(25),
  page: z.number().min(1).optional().default(1)
}).refine(data => {
  if (data.from && data.to) {
    return new Date(data.from) <= new Date(data.to);
  }
  return true;
}, {
  message: 'From date must be before or equal to To date'
});

// =============================================================================
// Folder Validation Schemas
// =============================================================================

export const folderPrivacySchema = z.object({
  view: z.enum(['anybody', 'password', 'team', 'unlisted']).optional().default('anybody'),
  join: z.enum(['anybody', 'followers']).optional().default('anybody')
});

export const createFolderSchema = z.object({
  name: z.string().min(1).max(128, 'Folder name must be between 1 and 128 characters'),
  parent_folder_uri: z.string().optional(),
  privacy: folderPrivacySchema.optional()
});

export const updateFolderSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  privacy: folderPrivacySchema.optional()
});

export const folderListQuerySchema = z.object({
  direction: z.enum(['asc', 'desc']).optional().default('asc'),
  page: z.number().min(1).optional().default(1),
  per_page: z.number().min(1).max(100).optional().default(25),
  query: z.string().optional(),
  sort: z.enum(['alphabetical', 'date', 'modified_time']).optional().default('alphabetical')
});

export const moveFolderItemSchema = z.object({
  destination_folder_uri: z.string().regex(/^\/folders\/\d+$/, 'Invalid folder URI format')
});

// =============================================================================
// Team and Collaboration Schemas
// =============================================================================

export const teamMemberRoleSchema = z.enum(['admin', 'contributor', 'owner', 'uploader', 'viewer']);

export const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: teamMemberRoleSchema,
  folder_access: z.array(z.object({
    folder_uri: z.string().regex(/^\/folders\/\d+$/, 'Invalid folder URI'),
    permission_level: z.enum(['edit', 'view'])
  })).optional()
});

export const updateTeamMemberSchema = z.object({
  role: teamMemberRoleSchema.optional(),
  folder_access: z.array(z.object({
    folder_uri: z.string().regex(/^\/folders\/\d+$/, 'Invalid folder URI'),
    permission_level: z.enum(['edit', 'view'])
  })).optional()
});

// =============================================================================
// Live Event Validation Schemas
// =============================================================================

export const liveEventScheduleSchema = z.object({
  type: z.enum(['single_time', 'recurring', 'no_schedule']).default('no_schedule'),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional(),
  weekdays: z.array(z.number().int().min(0).max(6)).optional()
}).refine(data => {
  if (data.type === 'single_time' && (!data.starts_at || !data.ends_at)) {
    return false;
  }
  if (data.starts_at && data.ends_at && new Date(data.starts_at) >= new Date(data.ends_at)) {
    return false;
  }
  return true;
}, {
  message: 'Invalid schedule configuration'
});

export const createLiveEventSchema = z.object({
  title: z.string().min(1).max(128),
  description: z.string().max(5000).optional(),
  privacy: z.object({
    view: z.enum(['anybody', 'embed_only', 'nobody', 'password', 'unlisted']).optional().default('anybody'),
    embed: z.enum(['private', 'public', 'whitelist']).optional().default('public')
  }).optional(),
  password: z.string().min(1).max(255).optional(),
  folder_uri: z.string().regex(/^\/folders\/\d+$/).optional(),
  content_rating: z.enum(['drugs', 'language', 'nudity', 'safe', 'unrated', 'violence']).optional().default('safe'),
  auto_cc_enabled: z.boolean().optional().default(false),
  auto_cc_language: vimeoLanguageSchema.optional(),
  auto_cc_keywords: z.string().max(255).optional(),
  schedule: liveEventScheduleSchema.optional(),
  interaction_tools_settings: z.object({
    is_anonymous_questions_enabled: z.boolean().optional().default(true),
    is_q_and_a_enabled: z.boolean().optional().default(false),
    is_polls_enabled: z.boolean().optional().default(false)
  }).optional(),
  chat: z.object({
    enabled: z.boolean().optional().default(true)
  }).optional(),
  dvr: z.boolean().optional().default(false),
  low_latency: z.boolean().optional().default(false),
  time_zone: z.string().optional()
});

export const updateLiveEventSchema = createLiveEventSchema.partial();

// =============================================================================
// Search Validation Schemas
// =============================================================================

export const vimeoSearchQuerySchema = z.object({
  query: z.string().min(1).max(500, 'Search query must be between 1 and 500 characters'),
  sort: z.enum(['alphabetical', 'comments', 'date', 'duration', 'likes', 'plays', 'relevant']).optional().default('relevant'),
  direction: z.enum(['asc', 'desc']).optional().default('desc'),
  filter: z.enum([
    'CC',
    'CC-BY',
    'CC-BY-SA',
    'CC-BY-ND',
    'CC-BY-NC',
    'CC-BY-NC-SA',
    'CC-BY-NC-ND',
    'duration',
    'in-progress',
    'minimum_likes',
    'trending',
    'upload_date'
  ]).optional(),
  filter_category: z.string().optional(),
  filter_content_rating: z.array(z.enum(['drugs', 'language', 'nudity', 'safe', 'unrated', 'violence'])).optional(),
  filter_duration: z.enum(['long', 'medium', 'short']).optional(),
  filter_type: z.enum(['live', 'stock', 'video']).optional(),
  per_page: z.number().min(1).max(100).optional().default(25),
  page: z.number().min(1).optional().default(1),
  uris: z.string().optional()
});

// =============================================================================
// User Management Schemas
// =============================================================================

export const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  location: z.string().max(255).optional(),
  bio: z.string().max(500).optional(),
  link: z.string().url().optional(),
  available_for_hire: z.boolean().optional(),
  can_work_remotely: z.boolean().optional(),
  gender: z.string().max(255).optional(),
  content_filter: z.enum(['drugs', 'language', 'nudity', 'safe', 'unrated', 'violence']).optional(),
  videos: z.object({
    privacy: vimeoPrivacySchema.optional()
  }).optional()
});

// =============================================================================
// Export Combined Schema Object
// =============================================================================

export const vimeoValidationSchemas = {
  // Base
  pagination: vimeoPaginationSchema,
  dateRange: vimeoDateRangeSchema,
  color: vimeoColorSchema,
  language: vimeoLanguageSchema,
  
  // Auth
  oauthConfig: vimeoOAuthConfigSchema,
  accessTokenRequest: vimeoAccessTokenRequestSchema,
  
  // Video
  privacy: vimeoPrivacySchema,
  spatialData: vimeoSpatialDataSchema,
  videoUpdate: vimeoVideoUpdateSchema,
  videoListQuery: vimeoVideoListQuerySchema,
  videoId: vimeoVideoIdSchema,
  
  // Upload
  uploadApproach: vimeoUploadApproachSchema,
  uploadRequest: vimeoUploadRequestSchema,
  pullUpload: vimeoPullUploadSchema,
  tusUploadOptions: vimeoTusUploadOptionsSchema,
  
  // Album
  albumPrivacy: albumPrivacySchema,
  createAlbum: createAlbumSchema,
  updateAlbum: updateAlbumSchema,
  albumListQuery: albumListQuerySchema,
  addVideoToAlbum: addVideoToAlbumSchema,
  
  // Player
  playerConfig: vimeoPlayerConfigSchema,
  embedSettingsUpdate: vimeoEmbedSettingsUpdateSchema,
  
  // Text Tracks
  createTextTrack: createTextTrackSchema,
  updateTextTrack: updateTextTrackSchema,
  
  // Comments
  createComment: createCommentSchema,
  updateComment: updateCommentSchema,
  commentListQuery: commentListQuerySchema,
  
  // Analytics
  analyticsQuery: vimeoAnalyticsQuerySchema,
  
  // Folders
  folderPrivacy: folderPrivacySchema,
  createFolder: createFolderSchema,
  updateFolder: updateFolderSchema,
  folderListQuery: folderListQuerySchema,
  moveFolderItem: moveFolderItemSchema,
  
  // Team
  teamMemberRole: teamMemberRoleSchema,
  inviteTeamMember: inviteTeamMemberSchema,
  updateTeamMember: updateTeamMemberSchema,
  
  // Live Events
  liveEventSchedule: liveEventScheduleSchema,
  createLiveEvent: createLiveEventSchema,
  updateLiveEvent: updateLiveEventSchema,
  
  // Search
  searchQuery: vimeoSearchQuerySchema,
  
  // User
  updateUser: updateUserSchema
} as const;

export default vimeoValidationSchemas;