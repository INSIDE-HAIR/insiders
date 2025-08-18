/**
 * Video Conferencing Seed Data
 * Creates sample data for testing video conferencing functionality
 */

import {
  PrismaClient,
  VideoProvider,
  VideoSpaceStatus,
  MeetingStatus,
  IntegrationStatus,
  ParticipantRole,
  RecordingType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding video conferencing data...");

  // Create test users if they don't exist
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@videoconf.test" },
    update: {},
    create: {
      email: "admin@videoconf.test",
      name: "Video Conference Admin",
      lastName: "Test",
      role: "ADMIN",
      terms: true,
    },
  });

  const trainerUser = await prisma.user.upsert({
    where: { email: "trainer@videoconf.test" },
    update: {},
    create: {
      email: "trainer@videoconf.test",
      name: "John",
      lastName: "Trainer",
      role: "CLIENT",
      terms: true,
    },
  });

  console.log("✅ Created test users");

  // Create integration accounts for each provider
  const meetIntegration = await prisma.integrationAccount.create({
    data: {
      provider: VideoProvider.MEET,
      accountName: "Google Meet Test Account",
      accountEmail: "admin@videoconf.test",
      accessToken: "encrypted_access_token_meet",
      refreshToken: "encrypted_refresh_token_meet",
      tokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
      scopes: [
        "https://www.googleapis.com/auth/meetings.space.created",
        "https://www.googleapis.com/auth/meetings.space.readonly",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/drive.file",
      ],
      status: IntegrationStatus.ACTIVE,
      userId: adminUser.id,
      webhookConfig: {
        webhookUrl: "https://api.videoconf.test/webhooks/meet",
        secretToken: "meet_webhook_secret",
        events: [
          "conference.started",
          "conference.ended",
          "participant.joined",
          "participant.left",
        ],
        isActive: true,
        failureCount: 0,
      },
    },
  });

  const zoomIntegration = await prisma.integrationAccount.create({
    data: {
      provider: VideoProvider.ZOOM,
      accountName: "Zoom Test Account",
      accountEmail: "admin@videoconf.test",
      accessToken: "encrypted_access_token_zoom",
      refreshToken: "encrypted_refresh_token_zoom",
      tokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
      scopes: [
        "meeting:write",
        "meeting:read",
        "recording:read",
        "report:read",
      ],
      status: IntegrationStatus.ACTIVE,
      userId: adminUser.id,
      webhookConfig: {
        webhookUrl: "https://api.videoconf.test/webhooks/zoom",
        secretToken: "zoom_webhook_secret",
        events: [
          "meeting.started",
          "meeting.ended",
          "meeting.participant_joined",
          "meeting.participant_left",
        ],
        isActive: true,
        failureCount: 0,
      },
    },
  });

  const vimeoIntegration = await prisma.integrationAccount.create({
    data: {
      provider: VideoProvider.VIMEO,
      accountName: "Vimeo Test Account",
      accountEmail: "admin@videoconf.test",
      accessToken: "encrypted_access_token_vimeo",
      scopes: ["public", "private", "create", "edit", "upload", "stats"],
      status: IntegrationStatus.ACTIVE,
      userId: adminUser.id,
      webhookConfig: {
        webhookUrl: "https://api.videoconf.test/webhooks/vimeo",
        secretToken: "vimeo_webhook_secret",
        events: ["video.available", "live_event.started", "live_event.ended"],
        isActive: true,
        failureCount: 0,
      },
    },
  });

  console.log("✅ Created integration accounts");

  // Create video spaces for each provider
  const meetSpace = await prisma.videoSpace.create({
    data: {
      name: "Weekly Team Standup (Meet)",
      description: "Our weekly team standup meeting using Google Meet",
      provider: VideoProvider.MEET,
      status: VideoSpaceStatus.ACTIVE,
      providerRoomId: "spaces/abc-defg-hij-meet",
      providerJoinUri: "https://meet.google.com/abc-defg-hij",
      providerData: {
        meetingCode: "abc-defg-hij",
        spaceId: "spaces/abc-defg-hij-meet",
        createdAt: new Date().toISOString(),
      },
      settings: {
        autoRecord: true,
        recordingFormat: "MP4",
        enableTranscription: true,
        transcriptionLanguage: "en-US",
        requireAuthentication: false,
        allowedDomains: [],
        maxParticipants: 50,
        muteOnEntry: false,
        enableChat: true,
        enableScreenShare: true,
        providerSettings: {
          autoRecordingGeneration: "ON",
          autoTranscriptionGeneration: "ON",
          waitingRoom: false,
          breakoutRoomsEnabled: false,
        },
      },
      ownerId: adminUser.id,
      cohort: "engineering-team",
      tags: ["standup", "weekly", "engineering"],
      addedToCalendar: true,
      calendarEventId: "calendar_event_123",
      integrationAccountId: meetIntegration.id,
      lastActiveAt: new Date(),
    },
  });

  const zoomSpace = await prisma.videoSpace.create({
    data: {
      name: "Client Consultation (Zoom)",
      description: "Client consultation sessions via Zoom",
      provider: VideoProvider.ZOOM,
      status: VideoSpaceStatus.ACTIVE,
      providerRoomId: "123456789",
      providerJoinUri: "https://zoom.us/j/123456789",
      providerData: {
        meetingId: 123456789,
        uuid: "zoom-uuid-123",
        joinUrl: "https://zoom.us/j/123456789",
        startUrl: "https://zoom.us/s/123456789",
        password: "zoom123",
      },
      settings: {
        autoRecord: true,
        recordingFormat: "MP4",
        enableTranscription: false,
        transcriptionLanguage: "en-US",
        requireAuthentication: true,
        allowedDomains: ["company.com"],
        maxParticipants: 10,
        muteOnEntry: true,
        enableChat: true,
        enableScreenShare: true,
        providerSettings: {
          hostVideo: true,
          participantVideo: true,
          waitingRoom: true,
          autoRecording: "cloud",
        },
      },
      ownerId: trainerUser.id,
      cohort: "client-consultations",
      tags: ["consultation", "client", "private"],
      addedToCalendar: false,
      integrationAccountId: zoomIntegration.id,
      lastActiveAt: new Date(Date.now() - 86400000), // 1 day ago
    },
  });

  const vimeoSpace = await prisma.videoSpace.create({
    data: {
      name: "Training Webinar (Vimeo)",
      description: "Monthly training webinar streamed via Vimeo",
      provider: VideoProvider.VIMEO,
      status: VideoSpaceStatus.ACTIVE,
      providerRoomId: "vimeo-live-event-456",
      providerJoinUri: "https://vimeo.com/event/456/embed",
      providerData: {
        eventId: "vimeo-live-event-456",
        embedUrl: "https://vimeo.com/event/456/embed",
        streamKey: "vimeo-stream-key-456",
        status: "idle",
      },
      settings: {
        autoRecord: true,
        recordingFormat: "MP4",
        enableTranscription: false,
        transcriptionLanguage: "en-US",
        requireAuthentication: false,
        allowedDomains: [],
        maxParticipants: 500,
        muteOnEntry: false,
        enableChat: true,
        enableScreenShare: false,
        providerSettings: {
          privacy: {
            view: "anybody",
            embed: "public",
          },
          autoRecord: true,
          dvr: true,
          chat: { enabled: true },
        },
      },
      ownerId: trainerUser.id,
      cohort: "monthly-training",
      tags: ["webinar", "training", "monthly"],
      addedToCalendar: true,
      calendarEventId: "calendar_event_456",
      integrationAccountId: vimeoIntegration.id,
      lastActiveAt: new Date(Date.now() - 172800000), // 2 days ago
    },
  });

  console.log("✅ Created video spaces");

  // Create link aliases
  await prisma.linkAlias.createMany({
    data: [
      {
        alias: "standup",
        videoSpaceId: meetSpace.id,
        isActive: true,
        accessCount: 25,
        lastAccessedAt: new Date(),
      },
      {
        alias: "team-meeting",
        videoSpaceId: meetSpace.id,
        isActive: true,
        accessCount: 15,
        lastAccessedAt: new Date(Date.now() - 86400000),
      },
      {
        alias: "consultation",
        videoSpaceId: zoomSpace.id,
        isActive: true,
        accessCount: 8,
        lastAccessedAt: new Date(Date.now() - 172800000),
      },
      {
        alias: "training",
        videoSpaceId: vimeoSpace.id,
        isActive: true,
        accessCount: 45,
        lastAccessedAt: new Date(Date.now() - 259200000), // 3 days ago
      },
    ],
  });

  console.log("✅ Created link aliases");

  // Create meeting records with sample data
  const meetingRecord1 = await prisma.meetingRecord.create({
    data: {
      videoSpaceId: meetSpace.id,
      providerMeetingId: "conference-record-meet-001",
      title: "Weekly Standup - Sprint 23",
      startTime: new Date(Date.now() - 86400000), // 1 day ago
      endTime: new Date(Date.now() - 86400000 + 1800000), // 30 minutes later
      duration: 30,
      status: MeetingStatus.ENDED,
      totalParticipants: 5,
      maxConcurrentUsers: 5,
      providerData: {
        conferenceRecord: "conference-record-meet-001",
        spaceId: "spaces/abc-defg-hij-meet",
        recordingGenerated: true,
        transcriptionGenerated: true,
      },
    },
  });

  const meetingRecord2 = await prisma.meetingRecord.create({
    data: {
      videoSpaceId: zoomSpace.id,
      providerMeetingId: "zoom-meeting-002",
      title: "Client Strategy Session",
      startTime: new Date(Date.now() - 172800000), // 2 days ago
      endTime: new Date(Date.now() - 172800000 + 3600000), // 1 hour later
      duration: 60,
      status: MeetingStatus.ENDED,
      totalParticipants: 3,
      maxConcurrentUsers: 3,
      providerData: {
        meetingId: "123456789",
        uuid: "zoom-uuid-meeting-002",
        hasRecording: true,
        hasTranscript: false,
      },
    },
  });

  console.log("✅ Created meeting records");

  // Create participants for the meetings
  await prisma.meetingParticipant.createMany({
    data: [
      // Meet meeting participants
      {
        meetingRecordId: meetingRecord1.id,
        providerParticipantId: "meet-participant-001",
        name: "John Trainer",
        email: "trainer@videoconf.test",
        role: ParticipantRole.HOST,
        joinTime: new Date(Date.now() - 86400000),
        leaveTime: new Date(Date.now() - 86400000 + 1800000),
        duration: 30,
        connectionCount: 1,
        providerData: {
          deviceType: "DESKTOP",
          audioEnabled: true,
          videoEnabled: true,
          screenSharingUsed: true,
        },
      },
      {
        meetingRecordId: meetingRecord1.id,
        providerParticipantId: "meet-participant-002",
        name: "Alice Developer",
        email: "alice@videoconf.test",
        role: ParticipantRole.ATTENDEE,
        joinTime: new Date(Date.now() - 86400000 + 120000), // 2 minutes late
        leaveTime: new Date(Date.now() - 86400000 + 1800000),
        duration: 28,
        connectionCount: 1,
        providerData: {
          deviceType: "DESKTOP",
          audioEnabled: true,
          videoEnabled: true,
          screenSharingUsed: false,
        },
      },
      // Zoom meeting participants
      {
        meetingRecordId: meetingRecord2.id,
        providerParticipantId: "zoom-participant-001",
        name: "John Trainer",
        email: "trainer@videoconf.test",
        role: ParticipantRole.HOST,
        joinTime: new Date(Date.now() - 172800000),
        leaveTime: new Date(Date.now() - 172800000 + 3600000),
        duration: 60,
        connectionCount: 1,
        providerData: {
          deviceType: "DESKTOP",
          audioEnabled: true,
          videoEnabled: true,
          screenSharingUsed: true,
          recording: true,
        },
      },
      {
        meetingRecordId: meetingRecord2.id,
        providerParticipantId: "zoom-participant-002",
        name: "Client Representative",
        email: "client@company.com",
        role: ParticipantRole.ATTENDEE,
        joinTime: new Date(Date.now() - 172800000 + 300000), // 5 minutes late
        leaveTime: new Date(Date.now() - 172800000 + 3600000),
        duration: 55,
        connectionCount: 2, // Reconnected once
        providerData: {
          deviceType: "MOBILE",
          audioEnabled: true,
          videoEnabled: false,
          screenSharingUsed: false,
          inWaitingRoom: true,
        },
      },
    ],
  });

  console.log("✅ Created meeting participants");

  // Create transcript entries
  await prisma.meetingTranscriptEntry.createMany({
    data: [
      {
        meetingRecordId: meetingRecord1.id,
        speakerName: "John Trainer",
        text: "Good morning everyone, let's start our weekly standup. Alice, would you like to go first?",
        timestamp: new Date(Date.now() - 86400000 + 60000),
        startTime: 60,
        endTime: 65,
        language: "en-US",
        confidence: 0.95,
      },
      {
        meetingRecordId: meetingRecord1.id,
        speakerName: "Alice Developer",
        text: "Sure! This week I completed the user authentication module and started working on the dashboard components.",
        timestamp: new Date(Date.now() - 86400000 + 120000),
        startTime: 120,
        endTime: 128,
        language: "en-US",
        confidence: 0.92,
      },
      {
        meetingRecordId: meetingRecord1.id,
        speakerName: "John Trainer",
        text: "Great work! Any blockers or concerns?",
        timestamp: new Date(Date.now() - 86400000 + 180000),
        startTime: 180,
        endTime: 183,
        language: "en-US",
        confidence: 0.98,
      },
    ],
  });

  console.log("✅ Created transcript entries");

  // Create chat messages
  await prisma.meetingChatMessage.createMany({
    data: [
      {
        meetingRecordId: meetingRecord1.id,
        senderName: "Alice Developer",
        senderEmail: "alice@videoconf.test",
        message: "I'll share the dashboard mockups in Slack after the meeting",
        timestamp: new Date(Date.now() - 86400000 + 300000),
        messageType: "TEXT",
      },
      {
        meetingRecordId: meetingRecord1.id,
        senderName: "John Trainer",
        senderEmail: "trainer@videoconf.test",
        message: "Perfect, thanks Alice!",
        timestamp: new Date(Date.now() - 86400000 + 310000),
        messageType: "TEXT",
      },
      {
        meetingRecordId: meetingRecord2.id,
        senderName: "Client Representative",
        senderEmail: "client@company.com",
        message: "Can you share your screen to show the proposal?",
        timestamp: new Date(Date.now() - 172800000 + 900000),
        messageType: "TEXT",
      },
    ],
  });

  console.log("✅ Created chat messages");

  // Create recording files
  await prisma.meetingRecordingFile.createMany({
    data: [
      {
        meetingRecordId: meetingRecord1.id,
        fileName: "Weekly_Standup_Sprint_23_Recording.mp4",
        fileType: RecordingType.VIDEO,
        fileSize: 157286400, // ~150MB
        duration: 1800, // 30 minutes in seconds
        downloadUrl: "https://drive.google.com/file/d/meet-recording-001/view",
        expiresAt: new Date(Date.now() + 2592000000), // 30 days from now
        providerFileId: "drive-file-meet-001",
        providerData: {
          driveFileId: "drive-file-meet-001",
          recordingType: "MP4",
          quality: "HD",
        },
      },
      {
        meetingRecordId: meetingRecord1.id,
        fileName: "Weekly_Standup_Sprint_23_Transcript.txt",
        fileType: RecordingType.TRANSCRIPT,
        fileSize: 2048, // ~2KB
        downloadUrl:
          "https://docs.google.com/document/d/meet-transcript-001/export?format=txt",
        expiresAt: new Date(Date.now() + 2592000000), // 30 days from now
        providerFileId: "docs-file-meet-001",
        providerData: {
          docsFileId: "docs-file-meet-001",
          language: "en-US",
          speakerIdentification: true,
        },
      },
      {
        meetingRecordId: meetingRecord2.id,
        fileName: "Client_Strategy_Session_Recording.mp4",
        fileType: RecordingType.VIDEO,
        fileSize: 314572800, // ~300MB
        duration: 3600, // 60 minutes in seconds
        downloadUrl: "https://zoom.us/rec/download/zoom-recording-002",
        expiresAt: new Date(Date.now() + 2592000000), // 30 days from now
        providerFileId: "zoom-recording-002",
        providerData: {
          recordingId: "zoom-recording-002",
          recordingType: "shared_screen_with_speaker_view",
          status: "completed",
        },
      },
    ],
  });

  console.log("✅ Created recording files");

  // Create sample webhook events
  await prisma.webhookEvent.createMany({
    data: [
      {
        provider: VideoProvider.MEET,
        eventType: "conference.started",
        eventId: "meet-event-001",
        payload: {
          eventType: "conference.started",
          eventTime: new Date(Date.now() - 86400000).toISOString(),
          conferenceRecord: "conference-record-meet-001",
          spaceId: "spaces/abc-defg-hij-meet",
          data: {
            conference: {
              startTime: new Date(Date.now() - 86400000).toISOString(),
            },
          },
        },
        signature: "meet-signature-001",
        processed: true,
        processedAt: new Date(Date.now() - 86400000 + 5000),
        processingAttempts: 1,
        videoSpaceId: meetSpace.id,
        meetingRecordId: meetingRecord1.id,
        eventTimestamp: new Date(Date.now() - 86400000),
      },
      {
        provider: VideoProvider.ZOOM,
        eventType: "meeting.started",
        eventId: "zoom-event-001",
        payload: {
          event: "meeting.started",
          eventTs: Math.floor((Date.now() - 172800000) / 1000),
          payload: {
            accountId: "zoom-account-123",
            object: {
              meetingId: "123456789",
              uuid: "zoom-uuid-meeting-002",
              topic: "Client Strategy Session",
            },
          },
        },
        signature: "zoom-signature-001",
        processed: true,
        processedAt: new Date(Date.now() - 172800000 + 3000),
        processingAttempts: 1,
        videoSpaceId: zoomSpace.id,
        meetingRecordId: meetingRecord2.id,
        eventTimestamp: new Date(Date.now() - 172800000),
      },
    ],
  });

  console.log("✅ Created webhook events");

  // Create sample KPI data
  await prisma.videoConferencingKPI.create({
    data: {
      periodStart: new Date(Date.now() - 604800000), // 1 week ago
      periodEnd: new Date(),
      provider: null, // All providers
      ownerId: null, // All users
      cohort: null, // All cohorts
      totalMeetings: 2,
      activeMeetings: 0,
      completedMeetings: 2,
      cancelledMeetings: 0,
      totalUniqueParticipants: 4,
      averageParticipantsPerMeeting: 2.5,
      totalParticipantMinutes: 173, // Total minutes across all participants
      totalMeetingHours: 1.5,
      averageMeetingDuration: 45,
      providerBreakdown: {
        MEET: { meetingCount: 1, participantCount: 2, totalDuration: 30 },
        ZOOM: { meetingCount: 1, participantCount: 2, totalDuration: 60 },
        VIMEO: { meetingCount: 0, participantCount: 0, totalDuration: 0 },
      },
      statusStats: {
        ENDED: 2,
        ACTIVE: 0,
        SCHEDULED: 0,
        CANCELLED: 0,
      },
      engagementStats: {
        averageEngagement: 85.5,
        dropOffRate: 5.0,
        reJoinRate: 10.0,
        recordingUsage: 100.0,
        transcriptionUsage: 50.0,
      },
      dailyMeetingStats: {
        monday: 1,
        tuesday: 0,
        wednesday: 1,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0,
      },
      hourlyDistribution: {
        "09": 1,
        "10": 0,
        "11": 0,
        "14": 1,
        "15": 0,
        "16": 0,
      },
      featureUsageStats: {
        recording: 2,
        transcription: 1,
        screenShare: 2,
        chat: 2,
        breakoutRooms: 0,
        polls: 0,
      },
      qualityMetrics: {
        averageConnectionQuality: 92.5,
        technicalIssues: 1,
        audioQuality: 95.0,
        videoQuality: 90.0,
      },
      generatedBy: adminUser.id,
      includeAllProviders: true,
    },
  });

  console.log("✅ Created KPI data");

  console.log("🎉 Video conferencing seed data completed successfully!");
  console.log("");
  console.log("📊 Summary:");
  console.log("- 2 test users created");
  console.log("- 3 integration accounts (Meet, Zoom, Vimeo)");
  console.log("- 3 video spaces (1 per provider)");
  console.log("- 4 link aliases");
  console.log("- 2 meeting records with participants");
  console.log("- 4 meeting participants");
  console.log("- 3 transcript entries");
  console.log("- 3 chat messages");
  console.log("- 3 recording files");
  console.log("- 2 webhook events");
  console.log("- 1 KPI record");
  console.log("");
  console.log("🔗 Test aliases available:");
  console.log("- /meet/standup (Google Meet)");
  console.log("- /meet/team-meeting (Google Meet)");
  console.log("- /meet/consultation (Zoom)");
  console.log("- /meet/training (Vimeo)");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding video conferencing data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
