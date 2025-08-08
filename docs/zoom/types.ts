/**
 * Zoom API v2 TypeScript Definitions
 * Generated from OpenAPI specification and official documentation
 * https://developers.zoom.us/docs/api/
 */

// =============================================================================
// Authentication & Base Types
// =============================================================================

export interface ZoomOAuthTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  refresh_token?: string;
  expires_in: number;
  scope: string;
}

export interface ZoomServerToServerTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

export interface ZoomApiError {
  code: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ZoomPaginationResponse {
  page_count: number;
  page_number: number;
  page_size: number;
  total_records: number;
  next_page_token?: string;
}

// =============================================================================
// Meeting Types
// =============================================================================

export enum MeetingType {
  INSTANT = 1,
  SCHEDULED = 2,
  RECURRING_NO_FIXED_TIME = 3,
  RECURRING_FIXED_TIME = 8,
  PAC = 4 // Personal Audio Conference
}

export enum MeetingStatus {
  WAITING = 'waiting',
  STARTED = 'started',
  ENDED = 'ended'
}

export enum JoinType {
  ZOOM_ROOM = 1,
  H323_SIP = 2
}

export interface MeetingSettings {
  host_video?: boolean;
  participant_video?: boolean;
  cn_meeting?: boolean;
  in_meeting?: boolean;
  join_before_host?: boolean;
  jbh_time?: number;
  mute_upon_entry?: boolean;
  watermark?: boolean;
  use_pmi?: boolean;
  approval_type?: 0 | 1 | 2;
  registration_type?: 1 | 2 | 3;
  audio?: 'both' | 'telephony' | 'voip';
  auto_recording?: 'local' | 'cloud' | 'none';
  enforce_login?: boolean;
  enforce_login_domains?: string;
  alternative_hosts?: string;
  alternative_host_update_polls?: boolean;
  close_registration?: boolean;
  show_share_button?: boolean;
  allow_multiple_devices?: boolean;
  registrants_confirmation_email?: boolean;
  waiting_room?: boolean;
  request_permission_to_unmute_participants?: boolean;
  global_dial_in_countries?: string[];
  global_dial_in_numbers?: Array<{
    country: string;
    country_name: string;
    city: string;
    number: string;
    type: 'toll' | 'tollfree';
  }>;
  registrants_email_notification?: boolean;
  meeting_authentication?: boolean;
  authentication_option?: string;
  authentication_domains?: string;
  authentication_name?: string;
  breakout_room?: {
    enable?: boolean;
    rooms?: Array<{
      name: string;
      participants: string[];
    }>;
  };
  language_interpretation?: {
    enable?: boolean;
    interpreters?: Array<{
      email: string;
      languages: string;
    }>;
  };
  sign_language_interpretation?: {
    enable?: boolean;
    interpreters?: Array<{
      email: string;
      sign_language: string;
    }>;
  };
}

export interface MeetingRecurrence {
  type: 1 | 2 | 3; // Daily, Weekly, Monthly
  repeat_interval: number;
  weekly_days?: string; // "1,2,3,4,5,6,7"
  monthly_day?: number;
  monthly_week?: number;
  monthly_week_day?: number;
  end_times?: number;
  end_date_time?: string;
}

export interface ZoomMeeting {
  uuid: string;
  id: number;
  host_id: string;
  host_email?: string;
  topic: string;
  type: MeetingType;
  status: MeetingStatus;
  start_time?: string; // ISO 8601
  duration?: number; // minutes
  timezone?: string;
  password?: string;
  h323_password?: string;
  pstn_password?: string;
  encrypted_password?: string;
  agenda?: string;
  created_at?: string;
  join_url?: string;
  start_url?: string;
  recurrence?: MeetingRecurrence;
  settings?: MeetingSettings;
  pre_schedule?: boolean;
}

export interface CreateMeetingRequest {
  topic: string;
  type?: MeetingType;
  start_time?: string;
  duration?: number;
  schedule_for?: string;
  timezone?: string;
  password?: string;
  default_password?: boolean;
  agenda?: string;
  tracking_fields?: Array<{
    field: string;
    value: string;
  }>;
  recurrence?: MeetingRecurrence;
  settings?: MeetingSettings;
  template_id?: string;
}

export interface UpdateMeetingRequest extends Partial<CreateMeetingRequest> {
  occurrence_id?: string;
}

export interface MeetingListResponse extends ZoomPaginationResponse {
  meetings: ZoomMeeting[];
}

// =============================================================================
// Webinar Types
// =============================================================================

export enum WebinarType {
  WEBINAR = 5,
  RECURRING_WEBINAR_NO_FIXED_TIME = 6,
  RECURRING_WEBINAR_FIXED_TIME = 9
}

export interface WebinarSettings {
  host_video?: boolean;
  panelists_video?: boolean;
  practice_session?: boolean;
  hd_video?: boolean;
  hd_video_for_attendees?: boolean;
  approval_type?: 0 | 1 | 2;
  registration_type?: 1 | 2 | 3;
  audio?: 'both' | 'telephony' | 'voip';
  auto_recording?: 'local' | 'cloud' | 'none';
  enforce_login?: boolean;
  enforce_login_domains?: string;
  alternative_hosts?: string;
  close_registration?: boolean;
  show_share_button?: boolean;
  allow_multiple_devices?: boolean;
  on_demand?: boolean;
  global_dial_in_countries?: string[];
  contact_name?: string;
  contact_email?: string;
  registrants_confirmation_email?: boolean;
  registrants_restrict_number?: number;
  notify_registrants?: boolean;
  post_webinar_survey?: boolean;
  survey_url?: string;
  registrants_email_notification?: boolean;
  meeting_authentication?: boolean;
  authentication_option?: string;
  authentication_domains?: string;
  authentication_name?: string;
  question_and_answer?: {
    enable?: boolean;
    allow_anonymous_questions?: boolean;
    answer_questions?: 'all' | 'host_only';
    attendees_can_upvote?: boolean;
    attendees_can_comment?: boolean;
  };
  email_language?: string;
  panelist_authentication?: boolean;
  enable_session_branding?: boolean;
}

export interface ZoomWebinar {
  uuid: string;
  id: number;
  host_id: string;
  host_email?: string;
  topic: string;
  type: WebinarType;
  start_time?: string;
  duration?: number;
  timezone?: string;
  password?: string;
  encrypted_password?: string;
  agenda?: string;
  created_at?: string;
  join_url?: string;
  start_url?: string;
  registration_url?: string;
  recurrence?: MeetingRecurrence;
  settings?: WebinarSettings;
}

export interface CreateWebinarRequest {
  topic: string;
  type?: WebinarType;
  start_time?: string;
  duration?: number;
  timezone?: string;
  password?: string;
  agenda?: string;
  tracking_fields?: Array<{
    field: string;
    value: string;
  }>;
  recurrence?: MeetingRecurrence;
  settings?: WebinarSettings;
  template_id?: string;
}

export interface WebinarListResponse extends ZoomPaginationResponse {
  webinars: ZoomWebinar[];
}

// =============================================================================
// Participant Types
// =============================================================================

export interface MeetingParticipant {
  id: string;
  name: string;
  user_email?: string;
  user_id?: string;
  registrant_id?: string;
  participant_uuid?: string;
  join_time: string;
  leave_time?: string;
  duration: number;
  failover?: boolean;
  status?: 'in_meeting' | 'in_waiting_room';
  audio_quality?: 'good' | 'fair' | 'poor' | 'unknown';
  video_quality?: 'good' | 'fair' | 'poor' | 'unknown';
  screen_share?: boolean;
  recording?: boolean;
  sip_phone?: boolean;
  h323?: boolean;
  voip?: boolean;
  phone?: boolean;
  role?: 'host' | 'co_host' | 'panelist' | 'attendee';
  in_waiting_room?: boolean;
  customer_key?: string;
  bo_mtg_id?: string;
  location?: string;
  network_type?: string;
  microphone?: string;
  speaker?: string;
  camera?: string;
  data_center?: string;
  connection_type?: string;
  share_application?: boolean;
  share_desktop?: boolean;
  share_whiteboard?: boolean;
  recording_consent?: boolean;
}

export interface ParticipantsListResponse extends ZoomPaginationResponse {
  participants: MeetingParticipant[];
}

export interface UpdateParticipantStatusRequest {
  action: 'admit' | 'remove' | 'approve' | 'deny';
  participants?: Array<{
    id: string;
  }>;
}

// =============================================================================
// Recording Types
// =============================================================================

export enum RecordingStatus {
  COMPLETED = 'completed',
  PROCESSING = 'processing'
}

export enum RecordingType {
  SHARED_SCREEN_WITH_SPEAKER_VIEW_CC = 'shared_screen_with_speaker_view(CC)',
  SHARED_SCREEN_WITH_SPEAKER_VIEW = 'shared_screen_with_speaker_view',
  SHARED_SCREEN_WITH_GALLERY_VIEW = 'shared_screen_with_gallery_view',
  SPEAKER_VIEW = 'speaker_view',
  GALLERY_VIEW = 'gallery_view',
  SHARED_SCREEN = 'shared_screen',
  AUDIO_ONLY = 'audio_only',
  AUDIO_TRANSCRIPT = 'audio_transcript',
  CHAT_FILE = 'chat_file',
  TIMELINE = 'timeline',
  CLOSED_CAPTION = 'closed_caption',
  POLL = 'poll',
  HOST_VIDEO = 'host_video',
  ACTIVE_SPEAKER = 'active_speaker',
  CC_TRANSCRIPT = 'cc_transcript'
}

export interface RecordingFile {
  id: string;
  meeting_id: string;
  recording_start: string;
  recording_end: string;
  file_type: 'MP4' | 'M4A' | 'TIMELINE' | 'TRANSCRIPT' | 'CHAT' | 'CC' | 'CSV';
  file_extension: string;
  file_size: number;
  play_url: string;
  download_url: string;
  status: RecordingStatus;
  deleted_time?: string;
  recording_type: RecordingType;
}

export interface ZoomRecording {
  uuid: string;
  id: number;
  account_id: string;
  host_id: string;
  host_email: string;
  topic: string;
  type: MeetingType;
  start_time: string;
  timezone: string;
  duration: number;
  total_size: number;
  recording_count: number;
  share_url?: string;
  recording_files: RecordingFile[];
  download_access_token?: string;
  password?: string;
  recording_play_passcode?: string;
}

export interface RecordingListResponse extends ZoomPaginationResponse {
  from: string;
  to: string;
  meetings: ZoomRecording[];
}

export interface RecordingSettings {
  share_recording?: 'publicly' | 'internally' | 'none';
  recording_authentication?: boolean;
  authentication_option?: string;
  authentication_domains?: string;
  viewer_download?: boolean;
  password?: string;
  on_demand?: boolean;
  approval_type?: 0 | 1 | 2;
  send_email_to_host?: boolean;
  show_social_share_buttons?: boolean;
  topic?: string;
  auto_delete_cmr?: 'never' | '30' | '60' | '90' | '120';
  auto_delete_cmr_days?: number;
}

// =============================================================================
// Webhook Types
// =============================================================================

export enum WebhookEvent {
  MEETING_STARTED = 'meeting.started',
  MEETING_ENDED = 'meeting.ended',
  MEETING_PARTICIPANT_JOINED = 'meeting.participant_joined',
  MEETING_PARTICIPANT_LEFT = 'meeting.participant_left',
  MEETING_REGISTRATION_CREATED = 'meeting.registration_created',
  MEETING_REGISTRATION_APPROVED = 'meeting.registration_approved',
  MEETING_REGISTRATION_CANCELLED = 'meeting.registration_cancelled',
  MEETING_REGISTRATION_DENIED = 'meeting.registration_denied',
  RECORDING_COMPLETED = 'recording.completed',
  RECORDING_TRANSCRIPT_COMPLETED = 'recording.transcript_completed',
  WEBINAR_STARTED = 'webinar.started',
  WEBINAR_ENDED = 'webinar.ended',
  WEBINAR_PARTICIPANT_JOINED = 'webinar.participant_joined',
  WEBINAR_PARTICIPANT_LEFT = 'webinar.participant_left',
  WEBINAR_REGISTRATION_CREATED = 'webinar.registration_created',
  WEBINAR_REGISTRATION_APPROVED = 'webinar.registration_approved',
  WEBINAR_REGISTRATION_CANCELLED = 'webinar.registration_cancelled',
  WEBINAR_REGISTRATION_DENIED = 'webinar.registration_denied'
}

export interface WebhookPayload {
  account_id: string;
  object: ZoomMeeting | ZoomWebinar | ZoomRecording | MeetingParticipant | any;
  operator?: string;
  operator_id?: string;
  operation?: string;
  time_stamp?: number;
}

export interface ZoomWebhook {
  event: WebhookEvent;
  event_ts: number;
  payload: WebhookPayload;
  download_token?: string;
}

export interface WebhookSubscription {
  url: string;
  auth_user?: string;
  auth_password?: string;
  events: WebhookEvent[];
}

// =============================================================================
// User & Account Types
// =============================================================================

export enum UserType {
  BASIC = 1,
  LICENSED = 2,
  ON_PREM = 3
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

export interface ZoomUser {
  id: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  email: string;
  type: UserType;
  role_name?: string;
  pmi: number;
  use_pmi: boolean;
  personal_meeting_url: string;
  timezone: string;
  verified: number;
  dept?: string;
  created_at: string;
  last_login_time?: string;
  last_client_version?: string;
  pic_url?: string;
  host_key?: string;
  jid?: string;
  group_ids?: string[];
  im_group_ids?: string[];
  account_id: string;
  language?: string;
  phone_country?: string;
  phone_number?: string;
  status: UserStatus;
  job_title?: string;
  location?: string;
  login_types?: number[];
  role_id?: string;
  user_created_at?: string;
}

export interface CreateUserRequest {
  action: 'create' | 'autoCreate' | 'custCreate' | 'ssoCreate';
  user_info: {
    email: string;
    type: UserType;
    first_name?: string;
    last_name?: string;
    display_name?: string;
    password?: string;
    feature?: {
      zoom_phone?: boolean;
      zoom_one_type?: number;
    };
  };
}

export interface UserListResponse extends ZoomPaginationResponse {
  users: ZoomUser[];
}

// =============================================================================
// Registration Types
// =============================================================================

export interface MeetingRegistrant {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  address?: string;
  city?: string;
  country?: string;
  zip?: string;
  state?: string;
  phone?: string;
  industry?: string;
  org?: string;
  job_title?: string;
  purchasing_time_frame?: string;
  role_in_purchase_process?: string;
  no_of_employees?: string;
  comments?: string;
  custom_questions?: Array<{
    title: string;
    value: string;
  }>;
  status: 'approved' | 'pending' | 'denied';
  create_time: string;
  join_url: string;
  registrant_uuid?: string;
  occurrence_ids?: string[];
}

export interface CreateRegistrantRequest {
  email: string;
  first_name: string;
  last_name: string;
  address?: string;
  city?: string;
  country?: string;
  zip?: string;
  state?: string;
  phone?: string;
  industry?: string;
  org?: string;
  job_title?: string;
  purchasing_time_frame?: string;
  role_in_purchase_process?: string;
  no_of_employees?: string;
  comments?: string;
  custom_questions?: Array<{
    title: string;
    value: string;
  }>;
  language?: string;
  auto_approve?: boolean;
  occurrence_ids?: string[];
}

export interface RegistrantListResponse extends ZoomPaginationResponse {
  registrants: MeetingRegistrant[];
}

// =============================================================================
// Report Types
// =============================================================================

export interface MeetingReport {
  uuid: string;
  id: number;
  type: MeetingType;
  topic: string;
  user_name: string;
  user_email: string;
  start_time: string;
  end_time: string;
  duration: number;
  participants: number;
  has_pstn: boolean;
  has_voip: boolean;
  has_3rd_party_audio: boolean;
  has_video: boolean;
  has_screen_share: boolean;
  has_recording: boolean;
  has_sip: boolean;
  has_archiving: boolean;
  source: string;
}

export interface DailyUsageReport {
  year: number;
  month: number;
  date: string;
  meetings: number;
  participants: number;
  meeting_minutes: number;
}

export interface ReportListResponse extends ZoomPaginationResponse {
  from: string;
  to: string;
  meetings: MeetingReport[];
}

// =============================================================================
// Dashboard Types
// =============================================================================

export interface DashboardMetrics {
  meetings: number;
  participants: number;
  meeting_minutes: number;
  emails_sent: number;
}

export interface QualityOfService {
  date_time: string;
  audio_input: {
    bitrate: string;
    latency: string;
    jitter: string;
    avg_loss: string;
    max_loss: string;
  };
  audio_output: {
    bitrate: string;
    latency: string;
    jitter: string;
    avg_loss: string;
    max_loss: string;
  };
  video_input: {
    bitrate: string;
    latency: string;
    jitter: string;
    avg_loss: string;
    max_loss: string;
    resolution: string;
    frame_rate: string;
  };
  video_output: {
    bitrate: string;
    latency: string;
    jitter: string;
    avg_loss: string;
    max_loss: string;
    resolution: string;
    frame_rate: string;
  };
  as_input: {
    bitrate: string;
    latency: string;
    jitter: string;
    avg_loss: string;
    max_loss: string;
    resolution: string;
    frame_rate: string;
  };
  as_output: {
    bitrate: string;
    latency: string;
    jitter: string;
    avg_loss: string;
    max_loss: string;
    resolution: string;
    frame_rate: string;
  };
  cpu_usage: {
    zoom_min_cpu_usage: string;
    zoom_avg_cpu_usage: string;
    zoom_max_cpu_usage: string;
    system_max_cpu_usage: string;
  };
}

// =============================================================================
// Utility Types
// =============================================================================

export type ZoomApiResponse<T> = {
  data: T;
  status: number;
  statusText: string;
};

export type ZoomApiListResponse<T> = ZoomApiResponse<T & ZoomPaginationResponse>;

export interface ZoomApiClientOptions {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ZoomOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface ZoomServerToServerConfig {
  clientId: string;
  clientSecret: string;
  accountId: string;
}