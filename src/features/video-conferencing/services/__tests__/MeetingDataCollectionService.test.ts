/**
 * Meeting Data Collection Service Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { MeetingDataCollectionService } from "../MeetingDataCollectionService";
import { VideoConferencingService } from "../VideoConferencingService";
import { prisma } from "@/lib/prisma";
import { VideoProvider, MeetingStatus } from "@prisma/client";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    videoSpace: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    meetingRecord: {
      upsert: vi.fn(),
      count: vi.fn(),
    },
    participantRecord: {
      upsert: vi.fn(),
      findFirst: vi.fn(),
    },
    transcriptionSegment: {
      create: vi.fn(),
    },
    chatMessage: {
      create: vi.fn(),
    },
  },
}));

vi.mock("../VideoConferencingService");

describe("MeetingDataCollectionService", () => {
  let service: MeetingDataCollectionService;
  let mockVideoConferencingService: any;

  const mockVideoSpace = {
    id: "507f1f77bcf86cd799439021",
    name: "Test Room",
    provider: "ZOOM" as VideoProvider,
    providerRoomId: "123456789",
    integrationAccount: {
      id: "507f1f77bcf86cd799439031",
      provider: "ZOOM",
      accessToken: "mock-token",
      refreshToken: "mock-refresh-token",
      expiresAt: new Date(Date.now() + 3600000),
    },
  };

  const mockMeetingData = {
    uuid: "zoom_meeting_uuid_123",
    id: 123456789,
    host_id: "zoom_host_123",
    topic: "Weekly Team Standup",
    type: 2,
    start_time: "2024-01-08T09:00:00Z",
    duration: 30,
    timezone: "UTC",
    join_url: "https://zoom.us/j/123456789",
    status: "ended",
    total_size: 5,
    recording_count: 1,
    participant_count: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MeetingDataCollectionService();
    mockVideoConferencingService = vi.mocked(
      VideoConferencingService
    ).prototype;
  });

  describe("collectMeetingDataForVideoSpace", () => {
    it("should collect meeting data successfully", async () => {
      // Mock database calls
      vi.mocked(prisma.videoSpace.findUnique).mockResolvedValue(mockVideoSpace);
      vi.mocked(prisma.meetingRecord.upsert).mockResolvedValue({
        id: "507f1f77bcf86cd799439051",
        videoSpaceId: mockVideoSpace.id,
        providerMeetingId: mockMeetingData.uuid,
        title: mockMeetingData.topic,
        startTime: new Date(mockMeetingData.start_time),
        endTime: null,
        duration: mockMeetingData.duration,
        status: "ENDED" as MeetingStatus,
        totalParticipants: mockMeetingData.participant_count,
        hostId: mockMeetingData.host_id,
        recordingUrl: null,
        transcriptionUrl: null,
        chatLogUrl: null,
        providerData: mockMeetingData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock provider API response
      const mockProviderResponse = {
        success: true,
        data: [mockMeetingData],
      };

      // Mock the private method by spying on the service
      const fetchSpy = vi
        .spyOn(service as any, "fetchMeetingRecordsFromProvider")
        .mockResolvedValue(mockProviderResponse);

      const result = await service.collectMeetingDataForVideoSpace(
        mockVideoSpace.id
      );

      expect(result.success).toBe(true);
      expect(result.meetingsCollected).toBe(1);
      expect(result.errors).toHaveLength(0);
      expect(fetchSpy).toHaveBeenCalledWith(
        mockVideoSpace.provider,
        mockVideoSpace.providerRoomId,
        mockVideoSpace.integrationAccount,
        undefined
      );
    });

    it("should handle video space not found", async () => {
      vi.mocked(prisma.videoSpace.findUnique).mockResolvedValue(null);

      const result =
        await service.collectMeetingDataForVideoSpace("nonexistent-id");

      expect(result.success).toBe(false);
      expect(result.meetingsCollected).toBe(0);
      expect(result.errors).toContain("Video space not found");
    });

    it("should handle provider API errors", async () => {
      vi.mocked(prisma.videoSpace.findUnique).mockResolvedValue(mockVideoSpace);

      const mockProviderError = {
        success: false,
        error: "Provider API error",
      };

      vi.spyOn(
        service as any,
        "fetchMeetingRecordsFromProvider"
      ).mockResolvedValue(mockProviderError);

      const result = await service.collectMeetingDataForVideoSpace(
        mockVideoSpace.id
      );

      expect(result.success).toBe(false);
      expect(result.meetingsCollected).toBe(0);
      expect(result.errors).toContain("Provider API error");
    });

    it("should collect data with date range filter", async () => {
      vi.mocked(prisma.videoSpace.findUnique).mockResolvedValue(mockVideoSpace);

      const mockProviderResponse = {
        success: true,
        data: [mockMeetingData],
      };

      const fetchSpy = vi
        .spyOn(service as any, "fetchMeetingRecordsFromProvider")
        .mockResolvedValue(mockProviderResponse);

      const dateRange = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31"),
      };

      await service.collectMeetingDataForVideoSpace(
        mockVideoSpace.id,
        dateRange
      );

      expect(fetchSpy).toHaveBeenCalledWith(
        mockVideoSpace.provider,
        mockVideoSpace.providerRoomId,
        mockVideoSpace.integrationAccount,
        dateRange
      );
    });
  });

  describe("collectMeetingDataForUser", () => {
    it("should collect data for all user video spaces", async () => {
      const userId = "507f1f77bcf86cd799439011";
      const mockVideoSpaces = [
        { id: "507f1f77bcf86cd799439021" },
        { id: "507f1f77bcf86cd799439022" },
      ];

      vi.mocked(prisma.videoSpace.findMany).mockResolvedValue(mockVideoSpaces);

      // Mock collectMeetingDataForVideoSpace
      const collectSpy = vi
        .spyOn(service, "collectMeetingDataForVideoSpace")
        .mockResolvedValue({
          success: true,
          meetingsCollected: 2,
          participantsCollected: 5,
          transcriptionsCollected: 10,
          chatMessagesCollected: 15,
          errors: [],
          lastSyncTime: new Date(),
        });

      const result = await service.collectMeetingDataForUser(userId);

      expect(result.success).toBe(true);
      expect(result.meetingsCollected).toBe(4); // 2 spaces × 2 meetings each
      expect(result.participantsCollected).toBe(10);
      expect(collectSpy).toHaveBeenCalledTimes(2);
    });

    it("should handle errors from individual video spaces", async () => {
      const userId = "507f1f77bcf86cd799439011";
      const mockVideoSpaces = [
        { id: "507f1f77bcf86cd799439021" },
        { id: "507f1f77bcf86cd799439022" },
      ];

      vi.mocked(prisma.videoSpace.findMany).mockResolvedValue(mockVideoSpaces);

      const collectSpy = vi
        .spyOn(service, "collectMeetingDataForVideoSpace")
        .mockResolvedValueOnce({
          success: true,
          meetingsCollected: 2,
          participantsCollected: 5,
          transcriptionsCollected: 10,
          chatMessagesCollected: 15,
          errors: [],
          lastSyncTime: new Date(),
        })
        .mockResolvedValueOnce({
          success: false,
          meetingsCollected: 0,
          participantsCollected: 0,
          transcriptionsCollected: 0,
          chatMessagesCollected: 0,
          errors: ["Provider API error"],
          lastSyncTime: new Date(),
        });

      const result = await service.collectMeetingDataForUser(userId);

      expect(result.success).toBe(false);
      expect(result.meetingsCollected).toBe(2);
      expect(result.errors).toContain("Provider API error");
    });
  });

  describe("provider-specific data fetching", () => {
    it("should fetch Zoom meeting records", async () => {
      const fetchZoomSpy = vi
        .spyOn(service as any, "fetchZoomMeetingRecords")
        .mockResolvedValue({
          success: true,
          data: [mockMeetingData],
        });

      const result = await (service as any).fetchMeetingRecordsFromProvider(
        "ZOOM",
        "123456789",
        mockVideoSpace.integrationAccount
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(fetchZoomSpy).toHaveBeenCalledWith(
        "123456789",
        mockVideoSpace.integrationAccount,
        undefined
      );
    });

    it("should fetch Google Meet records", async () => {
      const mockMeetData = {
        name: "conferenceRecords/meet_record_123",
        startTime: "2024-01-08T09:00:00Z",
        endTime: "2024-01-08T09:30:00Z",
        space: {
          name: "spaces/abc-def-ghi",
          meetingUri: "https://meet.google.com/abc-def-ghi",
        },
        participantCount: 4,
      };

      const fetchMeetSpy = vi
        .spyOn(service as any, "fetchGoogleMeetRecords")
        .mockResolvedValue({
          success: true,
          data: [mockMeetData],
        });

      const result = await (service as any).fetchMeetingRecordsFromProvider(
        "MEET",
        "spaces/abc-def-ghi",
        mockVideoSpace.integrationAccount
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(fetchMeetSpy).toHaveBeenCalled();
    });

    it("should fetch Vimeo records", async () => {
      const mockVimeoData = {
        uri: "/videos/123456789",
        name: "Training Session Recording",
        created_time: "2024-01-06T15:30:00Z",
        modified_time: "2024-01-06T16:30:00Z",
        duration: 3600,
        status: "available",
      };

      const fetchVimeoSpy = vi
        .spyOn(service as any, "fetchVimeoRecords")
        .mockResolvedValue({
          success: true,
          data: [mockVimeoData],
        });

      const result = await (service as any).fetchMeetingRecordsFromProvider(
        "VIMEO",
        "123456789",
        mockVideoSpace.integrationAccount
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(fetchVimeoSpy).toHaveBeenCalled();
    });

    it("should handle unsupported provider", async () => {
      const result = await (service as any).fetchMeetingRecordsFromProvider(
        "UNSUPPORTED" as VideoProvider,
        "123456789",
        mockVideoSpace.integrationAccount
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unsupported provider");
    });
  });

  describe("data storage", () => {
    it("should store meeting record correctly", async () => {
      const mockStoredRecord = {
        id: "507f1f77bcf86cd799439051",
        videoSpaceId: mockVideoSpace.id,
        providerMeetingId: mockMeetingData.uuid,
        title: mockMeetingData.topic,
        startTime: new Date(mockMeetingData.start_time),
        endTime: null,
        duration: mockMeetingData.duration,
        status: "ENDED" as MeetingStatus,
        totalParticipants: mockMeetingData.participant_count,
        hostId: mockMeetingData.host_id,
        recordingUrl: null,
        transcriptionUrl: null,
        chatLogUrl: null,
        providerData: mockMeetingData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.meetingRecord.upsert).mockResolvedValue(
        mockStoredRecord
      );

      const result = await (service as any).storeMeetingRecord(
        mockVideoSpace.id,
        mockMeetingData
      );

      expect(result.id).toBe(mockStoredRecord.id);
      expect(result.title).toBe(mockMeetingData.topic);
      expect(result.status).toBe("ENDED");
      expect(prisma.meetingRecord.upsert).toHaveBeenCalledWith({
        where: {
          providerMeetingId: mockMeetingData.uuid,
        },
        update: expect.objectContaining({
          title: mockMeetingData.topic,
          totalParticipants: mockMeetingData.participant_count,
        }),
        create: expect.objectContaining({
          videoSpaceId: mockVideoSpace.id,
          providerMeetingId: mockMeetingData.uuid,
          title: mockMeetingData.topic,
        }),
      });
    });

    it("should collect and store participant data", async () => {
      const meetingRecordId = "507f1f77bcf86cd799439051";
      const mockParticipants = [
        {
          id: "participant_1",
          name: "John Doe",
          email: "john@example.com",
          join_time: "2024-01-08T09:00:00Z",
          leave_time: "2024-01-08T09:30:00Z",
          duration: 1800,
          is_host: true,
        },
      ];

      vi.spyOn(
        service as any,
        "fetchParticipantDataFromProvider"
      ).mockResolvedValue(mockParticipants);

      vi.mocked(prisma.participantRecord.upsert).mockResolvedValue({
        id: "507f1f77bcf86cd799439061",
        meetingRecordId,
        participantId: "participant_1",
        name: "John Doe",
        email: "john@example.com",
        joinTime: new Date("2024-01-08T09:00:00Z"),
        leaveTime: new Date("2024-01-08T09:30:00Z"),
        duration: 1800,
        isHost: true,
        isModerator: false,
        cameraOnDuration: null,
        micOnDuration: null,
        screenShareDuration: null,
        chatMessageCount: 0,
        providerData: mockParticipants[0],
      });

      const result = await (service as any).collectParticipantData(
        meetingRecordId,
        mockMeetingData,
        "ZOOM",
        mockVideoSpace.integrationAccount
      );

      expect(result.participantsCollected).toBe(1);
      expect(prisma.participantRecord.upsert).toHaveBeenCalledWith({
        where: {
          meetingRecordId_participantId: {
            meetingRecordId,
            participantId: "participant_1",
          },
        },
        update: expect.objectContaining({
          name: "John Doe",
          email: "john@example.com",
          isHost: true,
        }),
        create: expect.objectContaining({
          meetingRecordId,
          participantId: "participant_1",
          name: "John Doe",
          email: "john@example.com",
        }),
      });
    });
  });

  describe("status mapping", () => {
    it("should map provider statuses to meeting statuses correctly", () => {
      const mapStatus = (service as any).mapProviderStatusToMeetingStatus.bind(
        service
      );

      // Zoom statuses
      expect(mapStatus("waiting")).toBe("SCHEDULED");
      expect(mapStatus("started")).toBe("IN_PROGRESS");
      expect(mapStatus("ended")).toBe("ENDED");

      // Google Meet statuses
      expect(mapStatus("ACTIVE")).toBe("IN_PROGRESS");
      expect(mapStatus("ENDED")).toBe("ENDED");

      // Vimeo statuses
      expect(mapStatus("available")).toBe("ENDED");
      expect(mapStatus("processing")).toBe("IN_PROGRESS");

      // Generic statuses
      expect(mapStatus("scheduled")).toBe("SCHEDULED");
      expect(mapStatus("cancelled")).toBe("CANCELLED");

      // Unknown status
      expect(mapStatus("unknown")).toBe("ENDED");
    });

    it("should map provider message types correctly", () => {
      const mapMessageType = (service as any).mapProviderMessageType.bind(
        service
      );

      expect(mapMessageType("text")).toBe("TEXT");
      expect(mapMessageType("file")).toBe("FILE");
      expect(mapMessageType("emoji")).toBe("EMOJI");
      expect(mapMessageType("system")).toBe("SYSTEM");
      expect(mapMessageType("chat")).toBe("TEXT");
      expect(mapMessageType("unknown")).toBe("TEXT");
    });
  });

  describe("error handling", () => {
    it("should handle database errors gracefully", async () => {
      vi.mocked(prisma.videoSpace.findUnique).mockRejectedValue(
        new Error("Database connection error")
      );

      const result = await service.collectMeetingDataForVideoSpace("test-id");

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        "Collection failed: Database connection error"
      );
    });

    it("should handle individual meeting processing errors", async () => {
      vi.mocked(prisma.videoSpace.findUnique).mockResolvedValue(mockVideoSpace);

      const mockProviderResponse = {
        success: true,
        data: [
          mockMeetingData,
          { ...mockMeetingData, uuid: "invalid-meeting" },
        ],
      };

      vi.spyOn(
        service as any,
        "fetchMeetingRecordsFromProvider"
      ).mockResolvedValue(mockProviderResponse);

      // Mock first meeting success, second meeting failure
      vi.spyOn(service as any, "storeMeetingRecord")
        .mockResolvedValueOnce({ id: "meeting-1" })
        .mockRejectedValueOnce(new Error("Storage error"));

      const result = await service.collectMeetingDataForVideoSpace(
        mockVideoSpace.id
      );

      expect(result.success).toBe(false);
      expect(result.meetingsCollected).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("Failed to process meeting");
    });
  });
});
