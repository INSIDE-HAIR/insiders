/**
 * Vimeo API v4 TypeScript Definitions
 * Based on official Vimeo API documentation and community packages
 * https://developer.vimeo.com/api/
 */

// =============================================================================
// Base Types and Authentication
// =============================================================================

export interface VimeoApiError {
  error: string;
  error_code: number;
  developer_message?: string;
  link?: string;
}

export interface VimeoApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  paging: {
    next?: string;
    previous?: string;
    first?: string;
    last?: string;
  };
}

export interface VimeoPagination {
  page?: number;
  per_page?: number;
  query?: string;
  filter?: string;
  filter_embeddable?: boolean;
  sort?: 'alphabetical' | 'date' | 'default' | 'duration' | 'last_user_action_event_date' | 'likes' | 'modified_time' | 'plays';
  direction?: 'asc' | 'desc';
}

export interface VimeoOAuthConfig {
  client_id: string;
  client_secret: string;
  access_token?: string;
  scope: string[];
  redirect_uri?: string;
}

export interface VimeoAccessToken {
  access_token: string;
  token_type: 'bearer';
  scope: string;
  app: {
    name: string;
    uri: string;
  };
  user?: VimeoUser;
}

// =============================================================================
// User Types
// =============================================================================

export interface VimeoUser {
  uri: string;
  name: string;
  link: string;
  location?: string;
  gender?: string;
  bio?: string;
  short_bio?: string;
  created_time: string;
  pictures: VimeoPictureSize;
  websites?: Array<{
    uri: string;
    name: string;
    link: string;
    type: string;
    description?: string;
  }>;
  metadata: {
    connections: {
      activities: VimeoConnection;
      albums: VimeoConnection;
      appearances: VimeoConnection;
      block: VimeoConnection;
      categories: VimeoConnection;
      channels: VimeoConnection;
      feed: VimeoConnection;
      followers: VimeoConnection;
      following: VimeoConnection;
      groups: VimeoConnection;
      likes: VimeoConnection;
      moderated_channels: VimeoConnection;
      pictures: VimeoConnection;
      portfolios: VimeoConnection;
      shared: VimeoConnection;
      videos: VimeoConnection;
      watched_videos: VimeoConnection;
      watchlater: VimeoConnection;
    };
    interactions: {
      add_privacy_user: VimeoInteraction;
      block: VimeoInteraction;
      contact: VimeoInteraction;
      follow: VimeoInteraction;
      report: VimeoInteraction;
    };
  };
  location_details?: {
    formatted_address: string;
    latitude?: number;
    longitude?: number;
    city?: string;
    state?: string;
    neighborhood?: string;
    sub_locality?: string;
    state_iso_code?: string;
    country?: string;
    country_iso_code?: string;
  };
  skills?: Array<{
    uri: string;
    name: string;
  }>;
  available_for_hire: boolean;
  can_work_remotely: boolean;
  preferences: {
    videos: {
      rating?: string[];
      privacy: {
        view: 'anybody' | 'contacts' | 'disable' | 'nobody' | 'password' | 'unlisted' | 'users';
        comments: 'anybody' | 'contacts' | 'nobody';
        embed: 'private' | 'public' | 'whitelist';
        download: boolean;
        add: boolean;
      };
    };
  };
  content_filter: 'drugs' | 'language' | 'nudity' | 'safe' | 'unrated' | 'violence';
  resource_key: string;
  account: 'basic' | 'business' | 'live_business' | 'live_premium' | 'live_pro' | 'plus' | 'pro' | 'producer' | 'standard' | 'starter';
}

export interface VimeoConnection {
  uri: string;
  options: string[];
  total: number;
}

export interface VimeoInteraction {
  added: boolean;
  added_time?: string;
  type?: string;
  title?: string;
  uri?: string;
}

// =============================================================================
// Video Types
// =============================================================================

export interface VimeoVideo {
  uri: string;
  name: string;
  description?: string;
  type: 'live' | 'stock' | 'video';
  link: string;
  player_embed_url: string;
  duration: number;
  width: number;
  height: number;
  language?: string;
  license: 'by' | 'by-nc' | 'by-nc-nd' | 'by-nc-sa' | 'by-nd' | 'by-sa' | 'cc0';
  privacy: VimeoPrivacy;
  pictures: VimeoPictureSize;
  tags: VimeoTag[];
  stats: VimeoVideoStats;
  categories: VimeoCategory[];
  uploader?: {
    pictures: VimeoPictureSize;
  };
  metadata: {
    connections: {
      comments: VimeoConnection;
      credits: VimeoConnection;
      likes: VimeoConnection;
      pictures: VimeoConnection;
      texttracks: VimeoConnection;
      related?: VimeoConnection;
      recommendations?: VimeoConnection;
      albums: VimeoConnection;
      available_albums: VimeoConnection;
      available_channels: VimeoConnection;
    };
    interactions: {
      watchlater: VimeoInteraction;
      like: VimeoInteraction;
      report: VimeoInteraction;
      can_update_privacy_to_public: VimeoInteraction;
    };
  };
  user: VimeoUser;
  play?: {
    status: 'playable' | 'purchase_required' | 'restricted' | 'unavailable';
  };
  app?: {
    name: string;
    uri: string;
  };
  status: 'available' | 'quota_exceeded' | 'total_cap_exceeded' | 'transcode_starting' | 'transcoding' | 'transcoding_error' | 'unavailable' | 'uploading' | 'uploading_error';
  resource_key: string;
  upload?: VimeoUpload;
  transcode?: VimeoTranscode;
  is_playable: boolean;
  has_audio: boolean;
  content_rating: 'drugs' | 'language' | 'nudity' | 'safe' | 'unrated' | 'violence';
  content_rating_class: 'drugs' | 'language' | 'nudity' | 'safe' | 'unrated' | 'violence';
  rating_mod_locked: boolean;
  created_time: string;
  modified_time: string;
  release_time: string;
  available_pictures: VimeoPictureSize;
  chapters?: VimeoChapter[];
  parent_folder?: VimeoFolder;
  last_user_action_event_date?: string;
  files?: VimeoVideoFile[];
  download?: VimeoDownloadFile[];
  embed?: VimeoEmbedSettings;
  review_page?: {
    active: boolean;
    link: string;
  };
  spatial?: VimeoSpatialData;
  password?: string;
  live_event?: VimeoLiveEvent;
}

export interface VimeoPrivacy {
  view: 'anybody' | 'contacts' | 'disable' | 'nobody' | 'password' | 'unlisted' | 'users';
  embed: 'private' | 'public' | 'whitelist';
  download: boolean;
  add: boolean;
  comments: 'anybody' | 'contacts' | 'nobody';
}

export interface VimeoPictureSize {
  uri?: string;
  active: boolean;
  type: 'caution' | 'custom' | 'default';
  base_link: string;
  sizes: Array<{
    width: number;
    height: number;
    link: string;
    link_with_play_button?: string;
  }>;
  resource_key: string;
}

export interface VimeoTag {
  uri: string;
  name: string;
  tag: string;
  canonical: string;
  metadata: {
    connections: {
      videos: VimeoConnection;
    };
  };
  resource_key: string;
}

export interface VimeoVideoStats {
  plays: number;
}

export interface VimeoCategory {
  uri: string;
  name: string;
  link: string;
  top_level: boolean;
  is_deprecated: boolean;
  pictures: VimeoPictureSize;
  last_video_featured_time?: string;
  parent?: VimeoCategory;
  metadata: {
    connections: {
      channels: VimeoConnection;
      groups: VimeoConnection;
      users: VimeoConnection;
      videos: VimeoConnection;
    };
    interactions: {
      follow: VimeoInteraction;
    };
  };
  subcategories?: VimeoCategory[];
  icon: {
    uri: string;
    active: boolean;
    type: string;
    base_link: string;
    sizes: Array<{
      width: number;
      height: number;
      link: string;
    }>;
  };
  resource_key: string;
}

export interface VimeoUpload {
  status: 'complete' | 'error' | 'in_progress';
  link?: string;
  upload_link?: string;
  complete_uri?: string;
  form?: string;
  approach?: 'post' | 'pull' | 'streaming' | 'tus';
  size?: number;
  redirect_url?: string;
}

export interface VimeoTranscode {
  status: 'complete' | 'error' | 'in_progress';
}

export interface VimeoChapter {
  uri: string;
  title: string;
  active_thumbnail_uri?: string;
  timecode: number;
  thumbnails: VimeoPictureSize;
}

export interface VimeoFolder {
  uri: string;
  name: string;
  created_time: string;
  modified_time: string;
  resource_key: string;
  privacy: {
    view: 'anybody' | 'password' | 'team' | 'unlisted';
    join: 'anybody' | 'followers';
  };
  pictures: VimeoPictureSize;
  metadata: {
    connections: {
      ancestor_path: VimeoConnection;
      items: VimeoConnection;
      parent_folder: VimeoConnection;
      personal_subfolder_items: VimeoConnection;
      subfolder_items: VimeoConnection;
      subfolders: VimeoConnection;
      videos: VimeoConnection;
    };
    interactions: {
      can_create_collaborations: VimeoInteraction;
      can_create_folder: VimeoInteraction;
      can_create_videos: VimeoInteraction;
      can_delete: VimeoInteraction;
      can_edit: VimeoInteraction;
    };
  };
  user: VimeoUser;
  parent_folder?: VimeoFolder;
  pinned_on?: string;
  subfolder_depth: number;
  type: 'folder' | 'showcase';
  access_grant?: {
    role: 'editor' | 'viewer';
  };
  team_entity_permission: {
    can_add_to: boolean;
    can_create_subfolders: boolean;
    can_delete: boolean;
    can_download: boolean;
    can_edit: boolean;
    can_invite: boolean;
    can_move: boolean;
    can_remove: boolean;
    can_rename: boolean;
  };
}

export interface VimeoVideoFile {
  quality: 'hd' | 'hls' | 'mobile' | 'sd' | 'source';
  type: 'source' | 'video/mp4' | 'video/webm' | 'vp6/x-video';
  width: number;
  height: number;
  link: string;
  created_time: string;
  fps: number;
  size: number;
  md5: string;
  public_name: string;
  size_short: string;
}

export interface VimeoDownloadFile {
  quality: 'hd' | 'sd' | 'source';
  type: 'source' | 'video/mp4';
  width: number;
  height: number;
  expires: string;
  link: string;
  created_time: string;
  fps: number;
  size: number;
  md5: string;
  public_name: string;
  size_short: string;
}

export interface VimeoSpatialData {
  stereo_format: 'left-right' | 'mono' | 'top-bottom';
  spatial_notes?: string;
  projection: 'cubical' | 'cylindrical' | 'dome' | 'equirectangular' | 'pyramid';
  field_of_view?: number;
  director_timeline?: Array<{
    pitch: number;
    yaw: number;
    time_code: number;
    roll?: number;
  }>;
}

export interface VimeoLiveEvent {
  type: 'live';
  ingest?: {
    scheduled_start_time?: string;
    scheduled_end_time?: string;
    status: 'idle' | 'receiving' | 'interrupted';
  };
  archive?: {
    status: 'done' | 'pending';
    uri?: string;
  };
  interactive?: boolean;
  recurring?: boolean;
  chat?: {
    enabled: boolean;
  };
  embed?: VimeoEmbedSettings;
  low_latency?: boolean;
  simulcast_destinations?: Array<{
    service: 'custom_rtmp' | 'facebook' | 'linkedin' | 'youtube';
    stream_key?: string;
    stream_url?: string;
    scheduled_start_time?: string;
  }>;
}

// =============================================================================
// Embed and Player Types
// =============================================================================

export interface VimeoEmbedSettings {
  html: string;
  badges: {
    hdr: boolean;
    live: {
      streaming: boolean;
      archived: boolean;
    };
    staff_pick: {
      normal: boolean;
      best_of_the_month: boolean;
      best_of_the_year: boolean;
      premiere: boolean;
    };
    vod: {
      is_trailer: boolean;
      is_climax_excerpt: boolean;
    };
    weekend_challenge: boolean;
  };
  interactive: boolean;
  logos: {
    vimeo: boolean;
    custom: {
      active: boolean;
      url?: string;
      link?: string;
      sticky: boolean;
    };
  };
  playbar: boolean;
  volume: boolean;
  speed: boolean;
  color: string;
  uri?: string;
  title: {
    name: 'hide' | 'show' | 'user';
    owner: 'hide' | 'show' | 'user';
    portrait: 'hide' | 'show' | 'user';
  };
  autoplay: boolean;
  autopause: boolean;
  loop: boolean;
  keyboard: boolean;
  fullscreen_button: boolean;
  pip_button: boolean;
  chapters: boolean;
  transparent: boolean;
  responsive: boolean;
  dnt: boolean;
  event_schedule: boolean;
}

export interface VimeoPlayerConfig {
  id?: number | string;
  url?: string;
  width?: number;
  height?: number;
  autopause?: boolean;
  autoplay?: boolean;
  background?: boolean;
  byline?: boolean;
  color?: string;
  controls?: boolean;
  dnt?: boolean;
  keyboard?: boolean;
  loop?: boolean;
  maxheight?: number;
  maxwidth?: number;
  muted?: boolean;
  pip?: boolean;
  playsinline?: boolean;
  portrait?: boolean;
  quality?: 'auto' | '240p' | '360p' | '540p' | '720p' | '1080p' | '2K' | '4K';
  responsive?: boolean;
  speed?: boolean;
  texttrack?: string;
  title?: boolean;
  transparent?: boolean;
}

// =============================================================================
// Upload Types
// =============================================================================

export interface VimeoUploadRequest {
  upload: {
    approach: 'post' | 'pull' | 'streaming' | 'tus';
    size?: number;
  };
  name?: string;
  description?: string;
  privacy?: Partial<VimeoPrivacy>;
  password?: string;
  content_rating?: 'drugs' | 'language' | 'nudity' | 'safe' | 'unrated' | 'violence';
  spatial?: Partial<VimeoSpatialData>;
  folder_uri?: string;
}

export interface VimeoUploadResponse {
  uri: string;
  upload: {
    upload_link: string;
    complete_uri: string;
    form?: string;
    approach: string;
    size: number;
    redirect_url?: string;
    link?: string;
  };
}

export interface VimeoTusUploadOptions {
  endpoint: string;
  metadata: {
    filename: string;
    filetype: string;
  };
  headers: {
    [key: string]: string;
  };
  chunkSize?: number;
  parallelUploads?: number;
  storeFingerprintForResuming?: boolean;
  removeFingerprintOnSuccess?: boolean;
  overridePatchMethod?: boolean;
}

// =============================================================================
// Album Types
// =============================================================================

export interface VimeoAlbum {
  uri: string;
  name: string;
  description?: string;
  link: string;
  duration: number;
  created_time: string;
  modified_time: string;
  user: VimeoUser;
  pictures: VimeoPictureSize;
  privacy: {
    view: 'anybody' | 'embed_only' | 'password';
    join: 'anybody' | 'followers';
  };
  sort: 'added_first' | 'added_last' | 'alphabetical' | 'arranged' | 'comments' | 'date' | 'default' | 'duration' | 'likes' | 'manual' | 'modified_time' | 'plays';
  theme: 'dark' | 'standard';
  web_theme_id?: string;
  embed: {
    html: string;
    color: string;
  };
  custom_logo?: {
    active: boolean;
    link?: string;
    sticky: boolean;
  };
  metadata: {
    connections: {
      videos: VimeoConnection;
    };
    interactions: {
      add_logos: VimeoInteraction;
      add_to: VimeoInteraction;
      add_videos: VimeoInteraction;
    };
  };
  embed_brand_color: boolean;
  use_custom_domain: boolean;
  hide_nav: boolean;
  resource_key: string;
  review_mode: boolean;
}

export interface CreateAlbumRequest {
  name: string;
  description?: string;
  privacy?: {
    view: 'anybody' | 'embed_only' | 'password';
    join: 'anybody' | 'followers';
  };
  password?: string;
  sort?: 'added_first' | 'added_last' | 'alphabetical' | 'arranged' | 'comments' | 'date' | 'default' | 'duration' | 'likes' | 'manual' | 'modified_time' | 'plays';
  theme?: 'dark' | 'standard';
  web_theme_id?: string;
}

// =============================================================================
// Analytics Types
// =============================================================================

export interface VimeoVideoAnalytics {
  plays: number;
  impressions: number;
  finishes: number;
  likes: number;
  comments: number;
  downloads: number;
  countries: Array<{
    country: string;
    plays: number;
    impressions: number;
  }>;
  domains: Array<{
    domain: string;
    plays: number;
    impressions: number;
  }>;
  embed_domains: Array<{
    domain: string;
    plays: number;
    impressions: number;
  }>;
  cities: Array<{
    city: string;
    plays: number;
    impressions: number;
  }>;
  device_types: Array<{
    device_type: string;
    plays: number;
    impressions: number;
  }>;
  streaming_qualities: Array<{
    quality: string;
    plays: number;
    impressions: number;
  }>;
  total_seconds_played: number;
  average_percent_played: number;
  average_seconds_played: number;
}

export interface VimeoAnalyticsQuery {
  from?: string; // YYYY-MM-DD format
  to?: string; // YYYY-MM-DD format
  dimension?: 'country' | 'device_type' | 'domain' | 'embed_domain' | 'streaming_quality' | 'total';
  filter?: string;
  per_page?: number;
  page?: number;
}

// =============================================================================
// Text Track (Subtitles/Captions) Types
// =============================================================================

export interface VimeoTextTrack {
  uri: string;
  active: boolean;
  type: 'captions' | 'chapters' | 'descriptions' | 'metadata' | 'subtitles';
  language: string;
  name: string;
  link: string;
  hls_link: string;
  hls_link_expires_time: string;
}

export interface CreateTextTrackRequest {
  type: 'captions' | 'subtitles';
  language: string;
  name?: string;
}

// =============================================================================
// Comments Types
// =============================================================================

export interface VimeoComment {
  uri: string;
  type: 'comment';
  text: string;
  created_on: string;
  user: VimeoUser;
  metadata: {
    connections: {
      replies: VimeoConnection;
    };
  };
  resource_key: string;
}

export interface CreateCommentRequest {
  text: string;
}

// =============================================================================
// Team and Collaboration Types
// =============================================================================

export interface VimeoTeamMember {
  uri: string;
  name: string;
  email: string;
  role: 'admin' | 'contributor' | 'owner' | 'uploader' | 'viewer';
  created_time: string;
  modified_time: string;
  resource_key: string;
  folder_access: Array<{
    folder_uri: string;
    permission_level: 'edit' | 'view';
  }>;
}

export interface VimeoTeamPermission {
  policies: Array<{
    name: string;
    list: string[];
  }>;
}

// =============================================================================
// Live Streaming Types
// =============================================================================

export interface VimeoLiveStream {
  key: string;
  active_time?: string;
  ended_time?: string;
  streaming_start_requested?: boolean;
}

export interface VimeoLiveEventSettings {
  title: string;
  description?: string;
  privacy: {
    view: 'anybody' | 'embed_only' | 'nobody' | 'password' | 'unlisted';
    embed: 'private' | 'public' | 'whitelist';
  };
  password?: string;
  folder_uri?: string;
  content_rating?: 'drugs' | 'language' | 'nudity' | 'safe' | 'unrated' | 'violence';
  auto_cc_enabled?: boolean;
  auto_cc_language?: string;
  auto_cc_keywords?: string;
  schedule?: {
    type: 'single_time' | 'recurring' | 'no_schedule';
    starts_at?: string;
    ends_at?: string;
    weekdays?: number[];
  };
  interaction_tools_settings?: {
    is_anonymous_questions_enabled: boolean;
    is_q_and_a_enabled: boolean;
    is_polls_enabled: boolean;
  };
  chat?: {
    enabled: boolean;
  };
  dvr?: boolean;
  low_latency?: boolean;
  time_zone?: string;
}

// =============================================================================
// Utility Types
// =============================================================================

export type VimeoApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface VimeoApiRequestConfig {
  method: VimeoApiMethod;
  uri: string;
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, any>;
}

export interface VimeoClientOptions {
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  baseUrl?: string;
  apiVersion?: string;
  timeout?: number;
  userAgent?: string;
}

// =============================================================================
// Export Main Types Object
// =============================================================================

export const VimeoTypes = {
  // Base
  VimeoApiError,
  VimeoApiResponse,
  VimeoPagination,
  VimeoOAuthConfig,
  VimeoAccessToken,
  
  // User
  VimeoUser,
  VimeoConnection,
  VimeoInteraction,
  
  // Video
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
  
  // Embed & Player
  VimeoEmbedSettings,
  VimeoPlayerConfig,
  
  // Upload
  VimeoUploadRequest,
  VimeoUploadResponse,
  VimeoTusUploadOptions,
  
  // Album
  VimeoAlbum,
  CreateAlbumRequest,
  
  // Analytics
  VimeoVideoAnalytics,
  VimeoAnalyticsQuery,
  
  // Text Tracks
  VimeoTextTrack,
  CreateTextTrackRequest,
  
  // Comments
  VimeoComment,
  CreateCommentRequest,
  
  // Team
  VimeoTeamMember,
  VimeoTeamPermission,
  
  // Live
  VimeoLiveStream,
  VimeoLiveEventSettings,
  
  // Utility
  VimeoApiRequestConfig,
  VimeoClientOptions
} as const;