/**
 * Export Service Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  ExportService,
  MeetingExportData,
  ParticipantExportData,
  CohortExportData,
} from "../ExportService";
import { VideoProvider, MeetingStatus } from "@prisma/client";

describe("ExportService", () => {
  let exportService: ExportService;

  beforeEach(() => {
    exportService = new ExportService();
  });

  const mockMeetingData: MeetingExportData[] = [
    {
      meetingId: "meeting-123",
      title: "Weekly Team Standup",
      startTime: new Date("2024-01-08T09:00:00Z"),
      endTime: new Date("2024-01-08T09:30:00Z"),
      duration: 1800,
      status: MeetingStatus.ENDED,
      provider: VideoProvider.ZOOM,
      cohort: "Engineering Team",
      participants: {
        total: 5,
        attended: 4,
        averageEngagement: 85,
      },
      engagement: {
        cameraUsageRate: 88,
        micUsageRate: 92,
        chatActivity: 12,
        screenShareDuration: 300,
      },
    },
  ];

  const mockParticipantData: ParticipantExportData[] = [
    {
      participantId: "john.doe@example.com",
      name: "John Doe",
      email: "john.doe@example.com",
      totalMeetings: 45,
      totalDuration: 32400,
      averageEngagement: 85,
      lastActivity: new Date("2024-01-08T10:30:00Z"),
      cohorts: ["Engineering Team"],
      preferredProvider: VideoProvider.ZOOM,
      metrics: {
        averageDuration: 720,
        cameraUsageRate: 90,
        micUsageRate: 95,
        chatParticipation: 78,
      },
    },
  ];

  const mockCohortData: CohortExportData[] = [
    {
      name: "Engineering Team",
      description: "Software development and technical teams",
      totalMeetings: 156,
      totalParticipants: 45,
      uniqueParticipants: 38,
      totalDuration: 89280,
      averageEngagement: 85,
      lastActivity: new Date("2024-01-08T16:30:00Z"),
      isActive: true,
      metrics: {
        cameraUsageRate: 88,
        micUsageRate: 92,
        chatParticipation: 76,
        attendanceRate: 84,
      },
    },
  ];

  describe("exportMeetingData", () => {
    it("should export meeting data as CSV", async () => {
      const result = await exportService.exportMeetingData(mockMeetingData, {
        format: "csv",
      });

      expect(result.mimeType).toBe("text/csv");
      expect(result.filename).toContain("meeting-analytics");
      expect(result.filename).toContain(".csv");
      expect(result.content).toContain("Meeting ID");
      expect(result.content).toContain("meeting-123");
      expect(result.content).toContain("Weekly Team Standup");
    });

    it("should export meeting data as Excel", async () => {
      const result = await exportService.exportMeetingData(mockMeetingData, {
        format: "excel",
      });

      expect(result.mimeType).toBe("application/vnd.ms-excel");
      expect(result.filename).toContain(".xlsx");
    });

    it("should export meeting data as JSON", async () => {
      const result = await exportService.exportMeetingData(mockMeetingData, {
        format: "json",
      });

      expect(result.mimeType).toBe("application/json");
      expect(result.filename).toContain(".json");
      expect(() => JSON.parse(result.content)).not.toThrow();
    });

    it("should handle custom CSV options", async () => {
      const result = await exportService.exportMeetingData(mockMeetingData, {
        format: "csv",
        delimiter: ";",
        dateFormat: "readable",
        includeHeaders: false,
      });

      expect(result.content).toContain(";");
      expect(result.content).not.toContain("Meeting ID"); // No headers
    });

    it("should throw error for unsupported format", async () => {
      await expect(
        exportService.exportMeetingData(mockMeetingData, {
          format: "pdf" as any,
        })
      ).rejects.toThrow("Unsupported export format: pdf");
    });
  });

  describe("exportParticipantData", () => {
    it("should export participant data as CSV", async () => {
      const result = await exportService.exportParticipantData(
        mockParticipantData,
        { format: "csv" }
      );

      expect(result.mimeType).toBe("text/csv");
      expect(result.filename).toContain("participant-analytics");
      expect(result.content).toContain("Participant ID");
      expect(result.content).toContain("john.doe@example.com");
      expect(result.content).toContain("John Doe");
    });

    it("should export participant data as JSON", async () => {
      const result = await exportService.exportParticipantData(
        mockParticipantData,
        { format: "json" }
      );

      expect(result.mimeType).toBe("application/json");
      const parsed = JSON.parse(result.content);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].participantId).toBe("john.doe@example.com");
    });
  });

  describe("exportCohortData", () => {
    it("should export cohort data as CSV", async () => {
      const result = await exportService.exportCohortData(mockCohortData, {
        format: "csv",
      });

      expect(result.mimeType).toBe("text/csv");
      expect(result.filename).toContain("cohort-analytics");
      expect(result.content).toContain("Cohort Name");
      expect(result.content).toContain("Engineering Team");
    });

    it("should export cohort data as Excel", async () => {
      const result = await exportService.exportCohortData(mockCohortData, {
        format: "excel",
      });

      expect(result.mimeType).toBe("application/vnd.ms-excel");
      expect(result.filename).toContain(".xlsx");
    });
  });

  describe("exportTranscription", () => {
    const mockTranscription = "This is a sample transcription of the meeting.";

    it("should export transcription as TXT", async () => {
      const result = await exportService.exportTranscription(
        "meeting-123",
        mockTranscription,
        { format: "txt" }
      );

      expect(result.mimeType).toBe("text/plain");
      expect(result.filename).toBe("transcription-meeting-123.txt");
      expect(result.content).toContain("Meeting Transcription");
      expect(result.content).toContain("Meeting ID: meeting-123");
      expect(result.content).toContain(mockTranscription);
    });

    it("should export transcription as DOCX", async () => {
      const result = await exportService.exportTranscription(
        "meeting-123",
        mockTranscription,
        { format: "docx" }
      );

      expect(result.mimeType).toBe(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      expect(result.filename).toBe("transcription-meeting-123.docx");
    });

    it("should throw error for unsupported transcription format", async () => {
      await expect(
        exportService.exportTranscription("meeting-123", mockTranscription, {
          format: "csv" as any,
        })
      ).rejects.toThrow("Unsupported transcription export format: csv");
    });
  });

  describe("exportChatMessages", () => {
    const mockMessages = [
      {
        timestamp: new Date("2024-01-08T09:05:00Z"),
        participant: "John Doe",
        message: "Hello everyone!",
      },
      {
        timestamp: new Date("2024-01-08T09:06:00Z"),
        participant: "Jane Smith",
        message: "Hi John, how are you?",
      },
    ];

    it("should export chat messages as TXT", async () => {
      const result = await exportService.exportChatMessages(
        "meeting-123",
        mockMessages,
        { format: "txt" }
      );

      expect(result.mimeType).toBe("text/plain");
      expect(result.filename).toBe("chat-meeting-123.txt");
      expect(result.content).toContain("Chat Messages");
      expect(result.content).toContain("John Doe: Hello everyone!");
      expect(result.content).toContain("Jane Smith: Hi John, how are you?");
    });

    it("should export chat messages as CSV", async () => {
      const result = await exportService.exportChatMessages(
        "meeting-123",
        mockMessages,
        { format: "csv" }
      );

      expect(result.mimeType).toBe("text/csv");
      expect(result.filename).toBe("chat-meeting-123.csv");
      expect(result.content).toContain('"Timestamp","Participant","Message"');
      expect(result.content).toContain("John Doe");
      expect(result.content).toContain("Jane Smith");
    });

    it("should handle messages with quotes in CSV export", async () => {
      const messagesWithQuotes = [
        {
          timestamp: new Date("2024-01-08T09:05:00Z"),
          participant: "John Doe",
          message: 'He said "Hello world" to everyone',
        },
      ];

      const result = await exportService.exportChatMessages(
        "meeting-123",
        messagesWithQuotes,
        { format: "csv" }
      );

      expect(result.content).toContain('""Hello world""'); // Escaped quotes
    });
  });

  describe("getSupportedFormats", () => {
    it("should return correct formats for meeting data", () => {
      const formats = exportService.getSupportedFormats("meeting");
      expect(formats).toEqual(["csv", "excel", "json"]);
    });

    it("should return correct formats for transcription data", () => {
      const formats = exportService.getSupportedFormats("transcription");
      expect(formats).toEqual(["txt", "docx"]);
    });

    it("should return correct formats for chat data", () => {
      const formats = exportService.getSupportedFormats("chat");
      expect(formats).toEqual(["txt", "csv"]);
    });

    it("should return empty array for unsupported data type", () => {
      const formats = exportService.getSupportedFormats("unsupported" as any);
      expect(formats).toEqual([]);
    });
  });

  describe("validateExportOptions", () => {
    it("should validate correct options", () => {
      const validation = exportService.validateExportOptions("meeting", {
        format: "csv",
      });
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should reject unsupported format", () => {
      const validation = exportService.validateExportOptions("meeting", {
        format: "txt" as any,
      });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain(
        "Format 'txt' is not supported for meeting data. Supported formats: csv, excel, json"
      );
    });

    it("should reject delimiter for non-CSV format", () => {
      const validation = exportService.validateExportOptions("meeting", {
        format: "json",
        delimiter: ";",
      });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain(
        "Delimiter option is only applicable for CSV format"
      );
    });

    it("should reject invalid date format", () => {
      const validation = exportService.validateExportOptions("meeting", {
        format: "csv",
        dateFormat: "invalid" as any,
      });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain(
        'Date format must be either "iso" or "readable"'
      );
    });
  });
});
