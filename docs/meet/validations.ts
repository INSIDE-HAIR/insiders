/**
 * Google Meet API v2 Zod Validation Schemas
 * Extracted and enhanced from .borrar-calendar-and-meet.js reference file
 * https://developers.google.com/meet/api/
 */

import { z } from 'zod';

// =============================================================================
// Base Configuration Schema
// =============================================================================

export const configSchema = z.object({
  CLIENT_ID: z.string().optional().describe("Google OAuth2 Client ID for direct token authentication"),
  CLIENT_SECRET: z.string().optional().describe("Google OAuth2 Client Secret"),
  REFRESH_TOKEN: z.string().optional().describe("Google OAuth2 Refresh Token"),
  googleOAuthCredentials: z.string().optional().describe("Path to Google OAuth credentials JSON file (legacy)"),
  googleMeetCredentialsPath: z.string().optional().describe("Path to credentials file (legacy)"),
  googleMeetTokenPath: z.string().optional().describe("Path to token file (legacy)"),
  debug: z.boolean().default(false).describe("Enable debug logging"),
});

// =============================================================================
// Calendar API v3 Validation Schemas
// =============================================================================

export const calendarV3ListCalendarsSchema = z.object({
  // No parameters required
});

export const calendarV3ListEventsSchema = z.object({
  max_results: z.number().min(1).max(2500).optional().default(10).describe("Maximum number of results to return"),
  time_min: z.string().optional().describe("Start time in ISO format (default: now)"),
  time_max: z.string().optional().describe("End time in ISO format (optional)"),
  calendar_id: z.string().optional().default('primary').describe("Calendar ID to list events from"),
});

export const calendarV3GetEventSchema = z.object({
  event_id: z.string().min(1).describe("ID of the calendar event to retrieve"),
});

export const calendarV3CreateEventSchema = z.object({
  summary: z.string().min(1).describe("Title of the event"),
  description: z.string().optional().describe("Description for the event"),
  location: z.string().optional().describe("Location for the event"),
  start_time: z.string().datetime().describe("Start time in ISO format"),
  end_time: z.string().datetime().describe("End time in ISO format"),
  time_zone: z.string().optional().default('UTC').describe("Time zone"),
  attendees: z.array(z.string().email()).optional().describe("List of email addresses for attendees"),
  create_meet_conference: z.boolean().optional().default(false).describe("Create Google Meet conference for this event"),
  guest_can_invite_others: z.boolean().optional().default(true).describe("Allow guests to invite other people"),
  guest_can_modify: z.boolean().optional().default(false).describe("Allow guests to modify the event"),
  guest_can_see_other_guests: z.boolean().optional().default(true).describe("Allow guests to see other attendees"),
  calendar_id: z.string().optional().default('primary').describe("Calendar ID to create event in"),
}).refine(data => new Date(data.start_time) < new Date(data.end_time), {
  message: "Start time must be before end time",
  path: ["start_time"]
});

export const calendarV3UpdateEventSchema = z.object({
  event_id: z.string().min(1).describe("ID of the event to update"),
  summary: z.string().optional().describe("Updated title of the event"),
  description: z.string().optional().describe("Updated description for the event"),
  location: z.string().optional().describe("Updated location for the event"),
  start_time: z.string().datetime().optional().describe("Updated start time in ISO format"),
  end_time: z.string().datetime().optional().describe("Updated end time in ISO format"),
  time_zone: z.string().optional().describe("Updated time zone"),
  attendees: z.array(z.string().email()).optional().describe("Updated list of email addresses for attendees"),
  guest_can_invite_others: z.boolean().optional().describe("Updated guest invite permission"),
  guest_can_modify: z.boolean().optional().describe("Updated guest modify permission"),
  guest_can_see_other_guests: z.boolean().optional().describe("Updated guest visibility permission"),
}).refine(data => {
  if (data.start_time && data.end_time) {
    return new Date(data.start_time) < new Date(data.end_time);
  }
  return true;
}, {
  message: "Start time must be before end time",
  path: ["start_time"]
});

export const calendarV3DeleteEventSchema = z.object({
  event_id: z.string().min(1).describe("ID of the event to delete"),
});

export const calendarV3FreeBusyQuerySchema = z.object({
  calendar_ids: z.array(z.string().min(1)).min(1).describe("Array of calendar IDs to query"),
  time_min: z.string().datetime().describe("Start time in ISO 8601 format"),
  time_max: z.string().datetime().describe("End time in ISO 8601 format"),
}).refine(data => new Date(data.time_min) < new Date(data.time_max), {
  message: "time_min must be before time_max",
  path: ["time_min"]
});

export const calendarV3QuickAddSchema = z.object({
  calendar_id: z.string().optional().default('primary').describe("Calendar ID to add event to"),
  text: z.string().min(1).describe("Natural language description (e.g., 'Lunch with John tomorrow at 2pm')"),
});

// =============================================================================
// Meet API v2 Validation Schemas
// =============================================================================

export const meetV2AccessTypeSchema = z.enum(['OPEN', 'TRUSTED', 'RESTRICTED']).describe("Access type for the space");
export const meetV2ModerationSchema = z.enum(['ON', 'OFF']).describe("Moderation mode");
export const meetV2ChatRestrictionSchema = z.enum(['HOSTS_ONLY', 'NO_RESTRICTION']).describe("Chat restriction level");
export const meetV2PresentRestrictionSchema = z.enum(['HOSTS_ONLY', 'NO_RESTRICTION']).describe("Presentation restriction level");
export const meetV2AttendanceReportSchema = z.enum(['GENERATE_REPORT', 'DO_NOT_GENERATE']).describe("Attendance report generation");

export const meetV2CreateSpaceSchema = z.object({
  access_type: meetV2AccessTypeSchema.optional().default('TRUSTED'),
  enable_recording: z.boolean().optional().describe("Enable automatic recording (requires Google Workspace Business Standard+)"),
  enable_transcription: z.boolean().optional().describe("Enable automatic transcription (requires Google Workspace)"),
  enable_smart_notes: z.boolean().optional().describe("Enable automatic smart notes with Gemini (requires Gemini license)"),
  attendance_report: z.boolean().optional().describe("Enable attendance report generation"),
  moderation_mode: meetV2ModerationSchema.optional().default('OFF'),
  chat_restriction: meetV2ChatRestrictionSchema.optional().default('NO_RESTRICTION'),
  present_restriction: meetV2PresentRestrictionSchema.optional().default('NO_RESTRICTION'),
  default_join_as_viewer: z.boolean().optional().default(false).describe("Join participants as viewers by default"),
  
  // Advanced features
  recording_storage: z.enum(['google_drive', 'cloud_storage']).optional().describe("Recording storage location"),
  transcript_language: z.string().optional().describe("Language for transcription"),
  caption_language: z.string().optional().describe("Language for captions"),
  translation_target: z.string().optional().describe("Target language for translation"),
  all_attendees_hosts: z.boolean().optional().default(false).describe("Make all attendees co-hosts"),
  breakout_rooms: z.boolean().optional().default(false).describe("Enable breakout rooms"),
  chat_enabled: z.boolean().optional().default(true).describe("Enable chat"),
  screen_sharing: z.enum(['all_participants', 'hosts_only']).optional().default('all_participants'),
  waiting_room: z.boolean().optional().default(false).describe("Enable waiting room"),
  meeting_lock: z.boolean().optional().default(false).describe("Lock meeting after start"),
  
  // Calendar integration
  calendar_event_id: z.string().optional().describe("Associated calendar event ID"),
  auto_start_recording: z.boolean().optional().default(false).describe("Auto-start recording when meeting begins"),
  auto_generate_captions: z.boolean().optional().default(false).describe("Auto-generate captions"),
});

export const meetV2GetSpaceSchema = z.object({
  space_name: z.string().min(1).describe("Name of the space (spaces/{space_id})"),
});

export const meetV2UpdateSpaceSchema = z.object({
  space_name: z.string().min(1).describe("Name of the space (spaces/{space_id})"),
  access_type: meetV2AccessTypeSchema.optional().describe("Updated access type for the space"),
  moderation_mode: meetV2ModerationSchema.optional().describe("Updated moderation mode"),
  chat_restriction: meetV2ChatRestrictionSchema.optional().describe("Updated chat restriction level"),
  present_restriction: meetV2PresentRestrictionSchema.optional().describe("Updated presentation restriction level"),
  enable_recording: z.boolean().optional().describe("Updated recording setting"),
  enable_transcription: z.boolean().optional().describe("Updated transcription setting"),
  enable_smart_notes: z.boolean().optional().describe("Updated smart notes setting"),
});

export const meetV2EndActiveConferenceSchema = z.object({
  space_name: z.string().min(1).describe("Name of the space (spaces/{space_id})"),
});

export const meetV2ListConferenceRecordsSchema = z.object({
  filter: z.string().optional().describe('Filter for conference records (e.g., space.name="spaces/{space_id}")'),
  page_size: z.number().min(1).max(50).optional().default(10).describe("Maximum number of results to return"),
});

export const meetV2GetConferenceRecordSchema = z.object({
  conference_record_name: z.string().min(1).describe("Name of the conference record (conferenceRecords/{record_id})"),
});

export const meetV2ListRecordingsSchema = z.object({
  conference_record_name: z.string().min(1).describe("Name of the conference record (conferenceRecords/{record_id})"),
});

export const meetV2GetRecordingSchema = z.object({
  recording_name: z.string().min(1).describe("Name of the recording (conferenceRecords/{record_id}/recordings/{recording_id})"),
});

export const meetV2ListTranscriptsSchema = z.object({
  conference_record_name: z.string().min(1).describe("Name of the conference record (conferenceRecords/{record_id})"),
});

export const meetV2GetTranscriptSchema = z.object({
  transcript_name: z.string().min(1).describe("Name of the transcript (conferenceRecords/{record_id}/transcripts/{transcript_id})"),
});

export const meetV2ListTranscriptEntriesSchema = z.object({
  transcript_name: z.string().min(1).describe("Name of the transcript (conferenceRecords/{record_id}/transcripts/{transcript_id})"),
  page_size: z.number().min(1).max(1000).optional().default(100).describe("Maximum number of entries to return"),
});

export const meetV2GetParticipantSchema = z.object({
  participant_name: z.string().min(1).describe("Name of the participant (conferenceRecords/{record_id}/participants/{participant_id})"),
});

export const meetV2ListParticipantsSchema = z.object({
  conference_record_name: z.string().min(1).describe("Name of the conference record (conferenceRecords/{record_id})"),
  page_size: z.number().min(1).max(100).optional().default(10).describe("Maximum number of participants to return"),
});

export const meetV2GetParticipantSessionSchema = z.object({
  participant_session_name: z.string().min(1).describe("Name of the participant session (conferenceRecords/{record_id}/participants/{participant_id}/sessions/{session_id})"),
});

export const meetV2ListParticipantSessionsSchema = z.object({
  participant_name: z.string().min(1).describe("Name of the participant (conferenceRecords/{record_id}/participants/{participant_id})"),
  page_size: z.number().min(1).max(100).optional().default(10).describe("Maximum number of sessions to return"),
});

// =============================================================================
// Enhanced Meet Operations Schemas
// =============================================================================

export const bulkMeetOperationSchema = z.object({
  operations: z.array(z.object({
    operation_type: z.enum(['CREATE_SPACE', 'UPDATE_SPACE', 'DELETE_SPACE', 'END_CONFERENCE']),
    space_id: z.string().optional(),
    config: z.union([
      meetV2CreateSpaceSchema,
      meetV2UpdateSpaceSchema
    ]).optional()
  })).min(1).max(50),
  batch_id: z.string().optional(),
  fail_fast: z.boolean().optional().default(false).describe("Stop on first error"),
});

export const meetAnalyticsQuerySchema = z.object({
  space_name: z.string().min(1).describe("Space identifier"),
  conference_record_name: z.string().optional().describe("Specific conference record"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Start date (YYYY-MM-DD)"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("End date (YYYY-MM-DD)"),
  metrics: z.array(z.enum([
    'participants_count',
    'duration',
    'recording_generated',
    'transcription_generated',
    'smart_notes_generated',
    'quality_metrics'
  ])).optional().describe("Metrics to include")
}).refine(data => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: "Start date must be before or equal to end date"
});

export const meetIntegrationConfigSchema = z.object({
  calendar_integration: z.object({
    auto_create_meet: z.boolean().optional().default(true),
    sync_attendees: z.boolean().optional().default(true),
    update_event_description: z.boolean().optional().default(true),
    send_notifications: z.boolean().optional().default(true)
  }).optional(),
  
  drive_integration: z.object({
    auto_upload_recordings: z.boolean().optional().default(true),
    auto_upload_transcripts: z.boolean().optional().default(true),
    recordings_folder_id: z.string().optional(),
    transcripts_folder_id: z.string().optional(),
    file_naming_pattern: z.string().optional().default('${eventTitle}_${date}')
  }).optional(),
  
  notification_settings: z.object({
    send_recording_ready: z.boolean().optional().default(true),
    send_transcript_ready: z.boolean().optional().default(true),
    send_meeting_summary: z.boolean().optional().default(false),
    notification_recipients: z.array(z.string().email()).optional()
  }).optional(),
});

// =============================================================================
// Advanced Feature Schemas
// =============================================================================

export const meetAdvancedFeaturesSchema = z.object({
  // AI and ML features
  gemini_integration: z.object({
    enabled: z.boolean().default(false),
    features: z.array(z.enum([
      'smart_notes',
      'meeting_summary',
      'action_items',
      'key_topics',
      'sentiment_analysis'
    ])).optional(),
    language: z.string().optional().default('en')
  }).optional(),
  
  // Live streaming and broadcasting
  streaming_config: z.object({
    enabled: z.boolean().default(false),
    streaming_key: z.string().optional(),
    rtmp_url: z.string().url().optional(),
    stream_title: z.string().max(100).optional(),
    stream_description: z.string().max(500).optional()
  }).optional(),
  
  // Breakout rooms
  breakout_rooms: z.object({
    enabled: z.boolean().default(false),
    auto_assign: z.boolean().default(false),
    room_count: z.number().min(2).max(20).optional(),
    duration_minutes: z.number().min(1).max(120).optional(),
    allow_participants_choose: z.boolean().default(true)
  }).optional(),
  
  // Polls and Q&A
  interactive_features: z.object({
    polls_enabled: z.boolean().default(false),
    qa_enabled: z.boolean().default(false),
    anonymous_questions: z.boolean().default(true),
    live_captions: z.boolean().default(false),
    live_translate: z.boolean().default(false),
    translate_to: z.array(z.string()).optional()
  }).optional(),
  
  // Security and compliance
  security_settings: z.object({
    require_authentication: z.boolean().default(false),
    allowed_domains: z.array(z.string()).optional(),
    ip_whitelist: z.array(z.string().ip()).optional(),
    end_to_end_encryption: z.boolean().default(false),
    data_region: z.enum(['US', 'EU', 'APAC']).optional()
  }).optional()
});

export const meetWebhookConfigSchema = z.object({
  webhook_url: z.string().url().describe("Webhook endpoint URL"),
  events: z.array(z.enum([
    'space.created',
    'space.updated',
    'conference.started',
    'conference.ended',
    'participant.joined',
    'participant.left',
    'recording.completed',
    'transcript.completed',
    'smart_notes.completed'
  ])).min(1).describe("Events to subscribe to"),
  secret: z.string().min(10).optional().describe("Webhook secret for verification"),
  retry_config: z.object({
    max_retries: z.number().min(0).max(10).default(3),
    retry_delay_seconds: z.number().min(1).max(3600).default(60)
  }).optional()
});

// =============================================================================
// Utility Schemas
// =============================================================================

export const getCurrentTimeSchema = z.object({
  timeZone: z.string().optional().describe("IANA timezone identifier"),
});

export const healthCheckSchema = z.object({
  // No parameters required
});

// =============================================================================
// Export Combined Schema Object
// =============================================================================

export const meetValidationSchemas = {
  // Base configuration
  config: configSchema,
  
  // Calendar API v3
  calendarV3ListCalendars: calendarV3ListCalendarsSchema,
  calendarV3ListEvents: calendarV3ListEventsSchema,
  calendarV3GetEvent: calendarV3GetEventSchema,
  calendarV3CreateEvent: calendarV3CreateEventSchema,
  calendarV3UpdateEvent: calendarV3UpdateEventSchema,
  calendarV3DeleteEvent: calendarV3DeleteEventSchema,
  calendarV3FreeBusyQuery: calendarV3FreeBusyQuerySchema,
  calendarV3QuickAdd: calendarV3QuickAddSchema,
  
  // Meet API v2 basic
  meetV2CreateSpace: meetV2CreateSpaceSchema,
  meetV2GetSpace: meetV2GetSpaceSchema,
  meetV2UpdateSpace: meetV2UpdateSpaceSchema,
  meetV2EndActiveConference: meetV2EndActiveConferenceSchema,
  meetV2ListConferenceRecords: meetV2ListConferenceRecordsSchema,
  meetV2GetConferenceRecord: meetV2GetConferenceRecordSchema,
  meetV2ListRecordings: meetV2ListRecordingsSchema,
  meetV2GetRecording: meetV2GetRecordingSchema,
  meetV2ListTranscripts: meetV2ListTranscriptsSchema,
  meetV2GetTranscript: meetV2GetTranscriptSchema,
  meetV2ListTranscriptEntries: meetV2ListTranscriptEntriesSchema,
  meetV2GetParticipant: meetV2GetParticipantSchema,
  meetV2ListParticipants: meetV2ListParticipantsSchema,
  meetV2GetParticipantSession: meetV2GetParticipantSessionSchema,
  meetV2ListParticipantSessions: meetV2ListParticipantSessionsSchema,
  
  // Enhanced operations
  bulkMeetOperation: bulkMeetOperationSchema,
  meetAnalyticsQuery: meetAnalyticsQuerySchema,
  meetIntegrationConfig: meetIntegrationConfigSchema,
  meetAdvancedFeatures: meetAdvancedFeaturesSchema,
  meetWebhookConfig: meetWebhookConfigSchema,
  
  // Utilities
  getCurrentTime: getCurrentTimeSchema,
  healthCheck: healthCheckSchema
} as const;

export default meetValidationSchemas;