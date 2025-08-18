/**
 * Zoom API v2 Zod Validation Schemas
 * Comprehensive validation schemas for all Zoom API endpoints
 * https://developers.zoom.us/docs/api/
 */

import { z } from 'zod';

// =============================================================================
// Base Validation Schemas
// =============================================================================

export const zoomPaginationSchema = z.object({
  page_size: z.number().min(1).max(300).optional().default(30),
  page_number: z.number().min(1).optional().default(1),
  next_page_token: z.string().optional()
});

export const zoomDateRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
}).refine(data => new Date(data.from) <= new Date(data.to), {
  message: 'From date must be before or equal to To date',
  path: ['from']
});

export const timezoneSchema = z.string().refine(
  (tz) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid timezone identifier' }
);

// =============================================================================
// Authentication Schemas
// =============================================================================

export const zoomOAuthConfigSchema = z.object({
  client_id: z.string().min(1, 'Client ID is required'),
  client_secret: z.string().min(1, 'Client secret is required'),
  redirect_uri: z.string().url('Invalid redirect URI'),
  scope: z.string().optional().default('meeting:write meeting:read webinar:write webinar:read recording:read user:read'),
  state: z.string().optional()
});

export const zoomServerToServerConfigSchema = z.object({
  client_id: z.string().min(1, 'Client ID is required'),
  client_secret: z.string().min(1, 'Client secret is required'),
  account_id: z.string().min(1, 'Account ID is required')
});

export const zoomTokenRequestSchema = z.object({
  grant_type: z.enum(['authorization_code', 'refresh_token', 'client_credentials']),
  code: z.string().optional(),
  refresh_token: z.string().optional(),
  redirect_uri: z.string().url().optional()
}).refine(
  data => 
    (data.grant_type === 'authorization_code' && data.code && data.redirect_uri) ||
    (data.grant_type === 'refresh_token' && data.refresh_token) ||
    (data.grant_type === 'client_credentials'),
  { message: 'Invalid grant type configuration' }
);

// =============================================================================
// Meeting Validation Schemas
// =============================================================================

export const meetingTypeSchema = z.enum(['1', '2', '3', '8']).transform(Number);

export const meetingRecurrenceSchema = z.object({
  type: z.union([z.literal(1), z.literal(2), z.literal(3)]).describe('1=Daily, 2=Weekly, 3=Monthly'),
  repeat_interval: z.number().min(1).max(90),
  weekly_days: z.string().regex(/^[1-7](,[1-7])*$/).optional(),
  monthly_day: z.number().min(1).max(31).optional(),
  monthly_week: z.number().min(-1).max(4).optional(),
  monthly_week_day: z.number().min(1).max(7).optional(),
  end_times: z.number().min(1).max(365).optional(),
  end_date_time: z.string().datetime().optional()
}).refine(data => {
  if (data.type === 2 && !data.weekly_days) return false;
  if (data.type === 3 && !data.monthly_day && !data.monthly_week) return false;
  return true;
}, { message: 'Invalid recurrence configuration' });

export const meetingSettingsSchema = z.object({
  host_video: z.boolean().optional().default(false),
  participant_video: z.boolean().optional().default(false),
  cn_meeting: z.boolean().optional().default(false),
  in_meeting: z.boolean().optional().default(false),
  join_before_host: z.boolean().optional().default(false),
  jbh_time: z.union([z.literal(0), z.literal(5), z.literal(10)]).optional().default(0),
  mute_upon_entry: z.boolean().optional().default(false),
  watermark: z.boolean().optional().default(false),
  use_pmi: z.boolean().optional().default(false),
  approval_type: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional().default(2),
  registration_type: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional().default(1),
  audio: z.enum(['both', 'telephony', 'voip']).optional().default('both'),
  auto_recording: z.enum(['local', 'cloud', 'none']).optional().default('none'),
  enforce_login: z.boolean().optional().default(false),
  enforce_login_domains: z.string().optional(),
  alternative_hosts: z.string().optional(),
  alternative_host_update_polls: z.boolean().optional().default(false),
  close_registration: z.boolean().optional().default(false),
  show_share_button: z.boolean().optional().default(false),
  allow_multiple_devices: z.boolean().optional().default(false),
  registrants_confirmation_email: z.boolean().optional().default(true),
  waiting_room: z.boolean().optional().default(false),
  request_permission_to_unmute_participants: z.boolean().optional().default(false),
  global_dial_in_countries: z.array(z.string()).optional(),
  registrants_email_notification: z.boolean().optional().default(true),
  meeting_authentication: z.boolean().optional().default(false),
  authentication_option: z.string().optional(),
  authentication_domains: z.string().optional(),
  authentication_name: z.string().optional(),
  breakout_room: z.object({
    enable: z.boolean().optional().default(false),
    rooms: z.array(z.object({
      name: z.string().min(1).max(128),
      participants: z.array(z.string().email())
    })).optional()
  }).optional(),
  language_interpretation: z.object({
    enable: z.boolean().optional().default(false),
    interpreters: z.array(z.object({
      email: z.string().email(),
      languages: z.string().min(1)
    })).optional()
  }).optional()
});

export const createMeetingSchema = z.object({
  topic: z.string().min(1).max(200, 'Topic must be between 1 and 200 characters'),
  type: meetingTypeSchema.optional().default('2'),
  start_time: z.string().datetime().optional(),
  duration: z.number().min(1).max(1440).optional().default(60),
  schedule_for: z.string().email().optional(),
  timezone: timezoneSchema.optional().default('UTC'),
  password: z.string().min(1).max(10).optional(),
  default_password: z.boolean().optional().default(false),
  agenda: z.string().max(2000).optional(),
  tracking_fields: z.array(z.object({
    field: z.string().min(1),
    value: z.string().min(1)
  })).optional(),
  recurrence: meetingRecurrenceSchema.optional(),
  settings: meetingSettingsSchema.optional(),
  template_id: z.string().optional()
});

export const updateMeetingSchema = createMeetingSchema.partial().extend({
  occurrence_id: z.string().optional()
});

export const meetingListQuerySchema = z.object({
  user_id: z.string().optional().default('me'),
  type: z.enum(['scheduled', 'live', 'upcoming', 'upcoming_meetings', 'previous_meetings']).optional().default('scheduled'),
  page_size: z.number().min(1).max(300).optional().default(30),
  next_page_token: z.string().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export const meetingIdSchema = z.union([
  z.string().regex(/^\d+$/, 'Meeting ID must be numeric'),
  z.number().int().positive()
]).transform(val => String(val));

// =============================================================================
// Webinar Validation Schemas
// =============================================================================

export const webinarTypeSchema = z.enum(['5', '6', '9']).transform(Number);

export const webinarSettingsSchema = z.object({
  host_video: z.boolean().optional().default(false),
  panelists_video: z.boolean().optional().default(false),
  practice_session: z.boolean().optional().default(false),
  hd_video: z.boolean().optional().default(false),
  hd_video_for_attendees: z.boolean().optional().default(false),
  approval_type: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional().default(2),
  registration_type: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional().default(1),
  audio: z.enum(['both', 'telephony', 'voip']).optional().default('both'),
  auto_recording: z.enum(['local', 'cloud', 'none']).optional().default('none'),
  enforce_login: z.boolean().optional().default(false),
  enforce_login_domains: z.string().optional(),
  alternative_hosts: z.string().optional(),
  close_registration: z.boolean().optional().default(false),
  show_share_button: z.boolean().optional().default(false),
  allow_multiple_devices: z.boolean().optional().default(false),
  on_demand: z.boolean().optional().default(false),
  global_dial_in_countries: z.array(z.string()).optional(),
  contact_name: z.string().max(128).optional(),
  contact_email: z.string().email().optional(),
  registrants_confirmation_email: z.boolean().optional().default(true),
  registrants_restrict_number: z.number().min(1).optional(),
  notify_registrants: z.boolean().optional().default(true),
  post_webinar_survey: z.boolean().optional().default(false),
  survey_url: z.string().url().optional(),
  registrants_email_notification: z.boolean().optional().default(true),
  meeting_authentication: z.boolean().optional().default(false),
  authentication_option: z.string().optional(),
  authentication_domains: z.string().optional(),
  authentication_name: z.string().optional(),
  question_and_answer: z.object({
    enable: z.boolean().optional().default(false),
    allow_anonymous_questions: z.boolean().optional().default(true),
    answer_questions: z.enum(['all', 'host_only']).optional().default('all'),
    attendees_can_upvote: z.boolean().optional().default(true),
    attendees_can_comment: z.boolean().optional().default(true)
  }).optional(),
  email_language: z.string().optional().default('en-US'),
  panelist_authentication: z.boolean().optional().default(false),
  enable_session_branding: z.boolean().optional().default(false)
});

export const createWebinarSchema = z.object({
  topic: z.string().min(1).max(200),
  type: webinarTypeSchema.optional().default('5'),
  start_time: z.string().datetime().optional(),
  duration: z.number().min(1).max(1440).optional().default(60),
  timezone: timezoneSchema.optional().default('UTC'),
  password: z.string().min(1).max(10).optional(),
  agenda: z.string().max(2000).optional(),
  tracking_fields: z.array(z.object({
    field: z.string().min(1),
    value: z.string().min(1)
  })).optional(),
  recurrence: meetingRecurrenceSchema.optional(),
  settings: webinarSettingsSchema.optional(),
  template_id: z.string().optional()
});

export const updateWebinarSchema = createWebinarSchema.partial().extend({
  occurrence_id: z.string().optional()
});

// =============================================================================
// Participant Validation Schemas
// =============================================================================

export const participantQuerySchema = z.object({
  page_size: z.number().min(1).max(300).optional().default(30),
  next_page_token: z.string().optional(),
  include_fields: z.string().optional()
});

export const updateParticipantStatusSchema = z.object({
  action: z.enum(['admit', 'remove', 'approve', 'deny']),
  participants: z.array(z.object({
    id: z.string().min(1)
  })).optional()
});

export const participantSettingsSchema = z.object({
  mute: z.boolean().optional(),
  video: z.boolean().optional(),
  rename: z.string().min(1).max(128).optional(),
  spotlight: z.boolean().optional(),
  record_consent: z.boolean().optional()
});

// =============================================================================
// Recording Validation Schemas
// =============================================================================

export const recordingListQuerySchema = z.object({
  user_id: z.string().optional().default('me'),
  page_size: z.number().min(1).max(300).optional().default(30),
  next_page_token: z.string().optional(),
  mc: z.enum(['true', 'false']).optional().default('false'),
  trash: z.enum(['true', 'false']).optional().default('false'),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
}).refine(data => new Date(data.from) <= new Date(data.to), {
  message: 'From date must be before or equal to To date'
});

export const recordingSettingsSchema = z.object({
  share_recording: z.enum(['publicly', 'internally', 'none']).optional(),
  recording_authentication: z.boolean().optional(),
  authentication_option: z.string().optional(),
  authentication_domains: z.string().optional(),
  viewer_download: z.boolean().optional(),
  password: z.string().min(1).max(10).optional(),
  on_demand: z.boolean().optional(),
  approval_type: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
  send_email_to_host: z.boolean().optional(),
  show_social_share_buttons: z.boolean().optional(),
  topic: z.string().max(200).optional(),
  auto_delete_cmr: z.enum(['never', '30', '60', '90', '120']).optional(),
  auto_delete_cmr_days: z.number().min(1).max(120).optional()
});

export const recoveryRecordingSchema = z.object({
  action: z.enum(['recover', 'trash']),
  recordings: z.array(z.object({
    id: z.string().min(1),
    action: z.enum(['recover', 'trash']).optional()
  })).min(1).max(20)
});

// =============================================================================
// Registration Validation Schemas
// =============================================================================

export const createRegistrantSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(1).max(64, 'First name must be between 1 and 64 characters'),
  last_name: z.string().min(1).max(64, 'Last name must be between 1 and 64 characters'),
  address: z.string().max(255).optional(),
  city: z.string().max(128).optional(),
  country: z.string().length(2, 'Country must be a 2-letter ISO code').optional(),
  zip: z.string().max(16).optional(),
  state: z.string().max(128).optional(),
  phone: z.string().max(20).optional(),
  industry: z.string().max(128).optional(),
  org: z.string().max(128).optional(),
  job_title: z.string().max(128).optional(),
  purchasing_time_frame: z.enum([
    'Within a month',
    '1-3 months',
    '4-6 months',
    'More than 6 months',
    'No timeframe'
  ]).optional(),
  role_in_purchase_process: z.enum([
    'Decision Maker',
    'Evaluator/Recommender',
    'Influencer',
    'Not involved'
  ]).optional(),
  no_of_employees: z.enum([
    '1-20',
    '21-50',
    '51-100',
    '101-250',
    '251-500',
    '501-1,000',
    '1,001-5,000',
    '5,001-10,000',
    'More than 10,000'
  ]).optional(),
  comments: z.string().max(1024).optional(),
  custom_questions: z.array(z.object({
    title: z.string().min(1),
    value: z.string().min(1)
  })).optional(),
  language: z.string().max(5).optional().default('en-US'),
  auto_approve: z.boolean().optional().default(true),
  occurrence_ids: z.array(z.string()).optional()
});

export const updateRegistrantStatusSchema = z.object({
  action: z.enum(['approve', 'cancel', 'deny']),
  registrants: z.array(z.object({
    id: z.string().min(1),
    email: z.string().email()
  })).min(1).max(30)
});

export const registrantListQuerySchema = z.object({
  occurrence_id: z.string().optional(),
  status: z.enum(['pending', 'approved', 'denied']).optional().default('approved'),
  tracking_source_id: z.string().optional(),
  page_size: z.number().min(1).max(300).optional().default(30),
  page_number: z.number().min(1).optional().default(1),
  next_page_token: z.string().optional()
});

// =============================================================================
// User Management Validation Schemas
// =============================================================================

export const userTypeSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]).describe('1=Basic, 2=Licensed, 3=On-prem');

export const createUserSchema = z.object({
  action: z.enum(['create', 'autoCreate', 'custCreate', 'ssoCreate']),
  user_info: z.object({
    email: z.string().email('Invalid email address'),
    type: userTypeSchema,
    first_name: z.string().min(1).max(64).optional(),
    last_name: z.string().min(1).max(64).optional(),
    display_name: z.string().max(64).optional(),
    password: z.string().min(8).max(32).regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    ).optional(),
    feature: z.object({
      zoom_phone: z.boolean().optional(),
      zoom_one_type: z.number().optional()
    }).optional()
  })
});

export const updateUserSchema = z.object({
  first_name: z.string().min(1).max(64).optional(),
  last_name: z.string().min(1).max(64).optional(),
  display_name: z.string().max(64).optional(),
  type: userTypeSchema.optional(),
  pmi: z.number().int().min(1000000000).max(9999999999).optional(),
  use_pmi: z.boolean().optional(),
  timezone: timezoneSchema.optional(),
  language: z.string().max(5).optional(),
  dept: z.string().max(128).optional(),
  vanity_name: z.string().max(64).optional(),
  host_key: z.string().regex(/^\d{6,10}$/, 'Host key must be 6-10 digits').optional(),
  cms_user_id: z.string().max(128).optional(),
  job_title: z.string().max(128).optional(),
  company: z.string().max(128).optional(),
  location: z.string().max(128).optional(),
  phone_number: z.string().max(20).optional(),
  phone_country: z.string().length(2).optional(),
  manager: z.string().max(128).optional(),
  group_id: z.string().optional()
});

export const userListQuerySchema = z.object({
  status: z.enum(['active', 'inactive', 'pending']).optional().default('active'),
  page_size: z.number().min(1).max(300).optional().default(30),
  role_id: z.string().optional(),
  page_number: z.number().min(1).optional().default(1),
  next_page_token: z.string().optional(),
  include_fields: z.string().optional()
});

// =============================================================================
// Webhook Validation Schemas
// =============================================================================

export const webhookEventSchema = z.enum([
  'meeting.started',
  'meeting.ended',
  'meeting.participant_joined',
  'meeting.participant_left',
  'meeting.registration_created',
  'meeting.registration_approved',
  'meeting.registration_cancelled',
  'meeting.registration_denied',
  'recording.completed',
  'recording.transcript_completed',
  'webinar.started',
  'webinar.ended',
  'webinar.participant_joined',
  'webinar.participant_left',
  'webinar.registration_created',
  'webinar.registration_approved',
  'webinar.registration_cancelled',
  'webinar.registration_denied'
]);

export const webhookSubscriptionSchema = z.object({
  url: z.string().url('Invalid webhook URL'),
  auth_user: z.string().optional(),
  auth_password: z.string().optional(),
  events: z.array(webhookEventSchema).min(1, 'At least one event must be selected'),
  deactivate_url_verification: z.boolean().optional().default(false)
});

export const webhookVerificationSchema = z.object({
  challenge: z.string().min(1)
});

export const webhookPayloadSchema = z.object({
  event: webhookEventSchema,
  event_ts: z.number(),
  payload: z.object({
    account_id: z.string(),
    object: z.any(),
    operator: z.string().optional(),
    operator_id: z.string().optional(),
    operation: z.string().optional(),
    time_stamp: z.number().optional()
  }),
  download_token: z.string().optional()
});

// =============================================================================
// Report Validation Schemas
// =============================================================================

export const reportTypeSchema = z.enum([
  'daily',
  'weekly',
  'monthly'
]);

export const dailyReportQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  type: reportTypeSchema.optional().default('daily'),
  page_size: z.number().min(1).max(300).optional().default(30),
  next_page_token: z.string().optional(),
  group_id: z.string().optional()
}).refine(data => new Date(data.from) <= new Date(data.to), {
  message: 'From date must be before or equal to To date'
});

export const meetingReportQuerySchema = z.object({
  meeting_id: meetingIdSchema,
  include_fields: z.enum(['registrant_id', 'occurrence_id']).optional()
});

export const participantReportQuerySchema = z.object({
  meeting_uuid: z.string().min(1),
  page_size: z.number().min(1).max(300).optional().default(30),
  next_page_token: z.string().optional(),
  include_fields: z.string().optional()
});

// =============================================================================
// Export Combined Schema Object
// =============================================================================

export const zoomValidationSchemas = {
  // Base
  pagination: zoomPaginationSchema,
  dateRange: zoomDateRangeSchema,
  timezone: timezoneSchema,
  
  // Auth
  oauthConfig: zoomOAuthConfigSchema,
  serverToServerConfig: zoomServerToServerConfigSchema,
  tokenRequest: zoomTokenRequestSchema,
  
  // Meetings
  meetingType: meetingTypeSchema,
  meetingRecurrence: meetingRecurrenceSchema,
  meetingSettings: meetingSettingsSchema,
  createMeeting: createMeetingSchema,
  updateMeeting: updateMeetingSchema,
  meetingListQuery: meetingListQuerySchema,
  meetingId: meetingIdSchema,
  
  // Webinars
  webinarType: webinarTypeSchema,
  webinarSettings: webinarSettingsSchema,
  createWebinar: createWebinarSchema,
  updateWebinar: updateWebinarSchema,
  
  // Participants
  participantQuery: participantQuerySchema,
  updateParticipantStatus: updateParticipantStatusSchema,
  participantSettings: participantSettingsSchema,
  
  // Recordings
  recordingListQuery: recordingListQuerySchema,
  recordingSettings: recordingSettingsSchema,
  recoveryRecording: recoveryRecordingSchema,
  
  // Registration
  createRegistrant: createRegistrantSchema,
  updateRegistrantStatus: updateRegistrantStatusSchema,
  registrantListQuery: registrantListQuerySchema,
  
  // Users
  userType: userTypeSchema,
  createUser: createUserSchema,
  updateUser: updateUserSchema,
  userListQuery: userListQuerySchema,
  
  // Webhooks
  webhookEvent: webhookEventSchema,
  webhookSubscription: webhookSubscriptionSchema,
  webhookVerification: webhookVerificationSchema,
  webhookPayload: webhookPayloadSchema,
  
  // Reports
  reportType: reportTypeSchema,
  dailyReportQuery: dailyReportQuerySchema,
  meetingReportQuery: meetingReportQuerySchema,
  participantReportQuery: participantReportQuerySchema
} as const;

export default zoomValidationSchemas;