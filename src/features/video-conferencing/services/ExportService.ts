/**
 * Export Service
 * Handles data export in various formats (CSV, Excel, TXT, DOCX)
 */

import { VideoProvider, MeetingStatus } from "@prisma/client";

export interface ExportOptions {
  format: "csv" | "excel" | "txt" | "docx" | "json";
  includeHeaders?: boolean;
  dateFormat?: "iso" | "readable";
  delimiter?: string;
  encoding?: "utf8" | "utf16";
}

export interface MeetingExportData {
  meetingId: string;
  title: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  status: MeetingStatus;
  provider: VideoProvider;
  cohort: string | null;
  participants: {
    total: number;
    attended: number;
    averageEngagement: number;
  };
  engagement: {
    cameraUsageRate: number;
    micUsageRate: number;
    chatActivity: number;
    screenShareDuration: number;
  };
  content?: {
    transcription?: string;
    chatMessages?: Array<{
      timestamp: Date;
      participant: string;
      message: string;
    }>;
    summary?: string;
    actionItems?: string[];
  };
}

export interface ParticipantExportData {
  participantId: string;
  name: string;
  email: string | null;
  totalMeetings: number;
  totalDuration: number;
  averageEngagement: number;
  lastActivity: Date;
  cohorts: string[];
  preferredProvider: VideoProvider;
  metrics: {
    averageDuration: number;
    cameraUsageRate: number;
    micUsageRate: number;
    chatParticipation: number;
  };
}

export interface CohortExportData {
  name: string;
  description: string;
  totalMeetings: number;
  totalParticipants: number;
  uniqueParticipants: number;
  totalDuration: number;
  averageEngagement: number;
  lastActivity: Date;
  isActive: boolean;
  metrics: {
    cameraUsageRate: number;
    micUsageRate: number;
    chatParticipation: number;
    attendanceRate: number;
  };
}

export class ExportService {
  /**
   * Export meeting data
   */
  async exportMeetingData(
    data: MeetingExportData[],
    options: ExportOptions = { format: "csv" }
  ): Promise<{ content: string; mimeType: string; filename: string }> {
    switch (options.format) {
      case "csv":
        return this.exportMeetingCSV(data, options);
      case "excel":
        return this.exportMeetingExcel(data, options);
      case "json":
        return this.exportMeetingJSON(data, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export participant data
   */
  async exportParticipantData(
    data: ParticipantExportData[],
    options: ExportOptions = { format: "csv" }
  ): Promise<{ content: string; mimeType: string; filename: string }> {
    switch (options.format) {
      case "csv":
        return this.exportParticipantCSV(data, options);
      case "excel":
        return this.exportParticipantExcel(data, options);
      case "json":
        return this.exportParticipantJSON(data, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export cohort data
   */
  async exportCohortData(
    data: CohortExportData[],
    options: ExportOptions = { format: "csv" }
  ): Promise<{ content: string; mimeType: string; filename: string }> {
    switch (options.format) {
      case "csv":
        return this.exportCohortCSV(data, options);
      case "excel":
        return this.exportCohortExcel(data, options);
      case "json":
        return this.exportCohortJSON(data, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export transcription data
   */
  async exportTranscription(
    meetingId: string,
    transcription: string,
    options: ExportOptions = { format: "txt" }
  ): Promise<{ content: string; mimeType: string; filename: string }> {
    switch (options.format) {
      case "txt":
        return this.exportTranscriptionTXT(meetingId, transcription, options);
      case "docx":
        return this.exportTranscriptionDOCX(meetingId, transcription, options);
      default:
        throw new Error(
          `Unsupported transcription export format: ${options.format}`
        );
    }
  }

  /**
   * Export chat messages
   */
  async exportChatMessages(
    meetingId: string,
    messages: Array<{
      timestamp: Date;
      participant: string;
      message: string;
    }>,
    options: ExportOptions = { format: "txt" }
  ): Promise<{ content: string; mimeType: string; filename: string }> {
    switch (options.format) {
      case "txt":
        return this.exportChatTXT(meetingId, messages, options);
      case "csv":
        return this.exportChatCSV(meetingId, messages, options);
      default:
        throw new Error(`Unsupported chat export format: ${options.format}`);
    }
  }

  // Private methods for different export formats

  private exportMeetingCSV(
    data: MeetingExportData[],
    options: ExportOptions
  ): { content: string; mimeType: string; filename: string } {
    const delimiter = options.delimiter || ",";
    const dateFormat = options.dateFormat || "iso";

    const headers = [
      "Meeting ID",
      "Title",
      "Start Time",
      "End Time",
      "Duration (minutes)",
      "Status",
      "Provider",
      "Cohort",
      "Total Participants",
      "Attended Participants",
      "Average Engagement (%)",
      "Camera Usage Rate (%)",
      "Mic Usage Rate (%)",
      "Chat Messages",
      "Screen Share Duration (minutes)",
    ];

    const rows = data.map((meeting) => [
      meeting.meetingId,
      meeting.title,
      this.formatDate(meeting.startTime, dateFormat),
      meeting.endTime ? this.formatDate(meeting.endTime, dateFormat) : "N/A",
      meeting.duration ? Math.round(meeting.duration / 60) : "N/A",
      meeting.status,
      meeting.provider,
      meeting.cohort || "N/A",
      meeting.participants.total,
      meeting.participants.attended,
      meeting.participants.averageEngagement,
      Math.round(meeting.engagement.cameraUsageRate),
      Math.round(meeting.engagement.micUsageRate),
      meeting.engagement.chatActivity,
      Math.round(meeting.engagement.screenShareDuration / 60),
    ]);

    const csvContent =
      options.includeHeaders !== false ? [headers, ...rows] : rows;

    const content = csvContent
      .map((row) => row.map((cell) => `\"${cell}\"`).join(delimiter))
      .join("\\n");

    return {
      content,
      mimeType: "text/csv",
      filename: `meeting-analytics-${new Date().toISOString().split("T")[0]}.csv`,
    };
  }

  private exportMeetingExcel(
    data: MeetingExportData[],
    options: ExportOptions
  ): { content: string; mimeType: string; filename: string } {
    // For now, return CSV format with Excel MIME type
    // In a real implementation, you would use a library like xlsx
    const csvResult = this.exportMeetingCSV(data, options);

    return {
      ...csvResult,
      mimeType: "application/vnd.ms-excel",
      filename: csvResult.filename.replace(".csv", ".xlsx"),
    };
  }

  private exportMeetingJSON(
    data: MeetingExportData[],
    options: ExportOptions
  ): { content: string; mimeType: string; filename: string } {
    const content = JSON.stringify(data, null, 2);

    return {
      content,
      mimeType: "application/json",
      filename: `meeting-analytics-${new Date().toISOString().split("T")[0]}.json`,
    };
  }

  private exportParticipantCSV(
    data: ParticipantExportData[],
    options: ExportOptions
  ): { content: string; mimeType: string; filename: string } {
    const delimiter = options.delimiter || ",";
    const dateFormat = options.dateFormat || "iso";

    const headers = [
      "Participant ID",
      "Name",
      "Email",
      "Total Meetings",
      "Total Duration (hours)",
      "Average Engagement (%)",
      "Last Activity",
      "Cohorts",
      "Preferred Provider",
      "Average Duration (minutes)",
      "Camera Usage Rate (%)",
      "Mic Usage Rate (%)",
      "Chat Participation (%)",
    ];

    const rows = data.map((participant) => [
      participant.participantId,
      participant.name,
      participant.email || "N/A",
      participant.totalMeetings,
      Math.round((participant.totalDuration / 3600) * 10) / 10,
      participant.averageEngagement,
      this.formatDate(participant.lastActivity, dateFormat),
      participant.cohorts.join("; "),
      participant.preferredProvider,
      Math.round((participant.metrics.averageDuration / 60) * 10) / 10,
      participant.metrics.cameraUsageRate,
      participant.metrics.micUsageRate,
      participant.metrics.chatParticipation,
    ]);

    const csvContent =
      options.includeHeaders !== false ? [headers, ...rows] : rows;

    const content = csvContent
      .map((row) => row.map((cell) => `\"${cell}\"`).join(delimiter))
      .join("\\n");

    return {
      content,
      mimeType: "text/csv",
      filename: `participant-analytics-${new Date().toISOString().split("T")[0]}.csv`,
    };
  }

  private exportParticipantExcel(
    data: ParticipantExportData[],
    options: ExportOptions
  ): { content: string; mimeType: string; filename: string } {
    const csvResult = this.exportParticipantCSV(data, options);

    return {
      ...csvResult,
      mimeType: "application/vnd.ms-excel",
      filename: csvResult.filename.replace(".csv", ".xlsx"),
    };
  }

  private exportParticipantJSON(
    data: ParticipantExportData[],
    options: ExportOptions
  ): { content: string; mimeType: string; filename: string } {
    const content = JSON.stringify(data, null, 2);

    return {
      content,
      mimeType: "application/json",
      filename: `participant-analytics-${new Date().toISOString().split("T")[0]}.json`,
    };
  }

  private exportCohortCSV(
    data: CohortExportData[],
    options: ExportOptions
  ): { content: string; mimeType: string; filename: string } {
    const delimiter = options.delimiter || ",";
    const dateFormat = options.dateFormat || "iso";

    const headers = [
      "Cohort Name",
      "Description",
      "Total Meetings",
      "Total Participants",
      "Unique Participants",
      "Total Duration (hours)",
      "Average Engagement (%)",
      "Last Activity",
      "Is Active",
      "Camera Usage Rate (%)",
      "Mic Usage Rate (%)",
      "Chat Participation (%)",
      "Attendance Rate (%)",
    ];

    const rows = data.map((cohort) => [
      cohort.name,
      cohort.description,
      cohort.totalMeetings,
      cohort.totalParticipants,
      cohort.uniqueParticipants,
      Math.round((cohort.totalDuration / 3600) * 10) / 10,
      cohort.averageEngagement,
      this.formatDate(cohort.lastActivity, dateFormat),
      cohort.isActive ? "Yes" : "No",
      cohort.metrics.cameraUsageRate,
      cohort.metrics.micUsageRate,
      cohort.metrics.chatParticipation,
      cohort.metrics.attendanceRate,
    ]);

    const csvContent =
      options.includeHeaders !== false ? [headers, ...rows] : rows;

    const content = csvContent
      .map((row) => row.map((cell) => `\"${cell}\"`).join(delimiter))
      .join("\\n");

    return {
      content,
      mimeType: "text/csv",
      filename: `cohort-analytics-${new Date().toISOString().split("T")[0]}.csv`,
    };
  }

  private exportCohortExcel(
    data: CohortExportData[],
    options: ExportOptions
  ): { content: string; mimeType: string; filename: string } {
    const csvResult = this.exportCohortCSV(data, options);

    return {
      ...csvResult,
      mimeType: "application/vnd.ms-excel",
      filename: csvResult.filename.replace(".csv", ".xlsx"),
    };
  }

  private exportCohortJSON(
    data: CohortExportData[],
    options: ExportOptions
  ): { content: string; mimeType: string; filename: string } {
    const content = JSON.stringify(data, null, 2);

    return {
      content,
      mimeType: "application/json",
      filename: `cohort-analytics-${new Date().toISOString().split("T")[0]}.json`,
    };
  }

  private exportTranscriptionTXT(
    meetingId: string,
    transcription: string,
    options: ExportOptions
  ): { content: string; mimeType: string; filename: string } {
    const header = `Meeting Transcription\\nMeeting ID: ${meetingId}\\nGenerated: ${new Date().toISOString()}\\n\\n`;
    const content = header + transcription;

    return {
      content,
      mimeType: "text/plain",
      filename: `transcription-${meetingId}.txt`,
    };
  }

  private exportTranscriptionDOCX(
    meetingId: string,
    transcription: string,
    options: ExportOptions
  ): { content: string; mimeType: string; filename: string } {
    // For now, return plain text with DOCX MIME type
    // In a real implementation, you would use a library like docx
    const txtResult = this.exportTranscriptionTXT(
      meetingId,
      transcription,
      options
    );

    return {
      ...txtResult,
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      filename: txtResult.filename.replace(".txt", ".docx"),
    };
  }

  private exportChatTXT(
    meetingId: string,
    messages: Array<{
      timestamp: Date;
      participant: string;
      message: string;
    }>,
    options: ExportOptions
  ): { content: string; mimeType: string; filename: string } {
    const dateFormat = options.dateFormat || "readable";
    const header = `Chat Messages\\nMeeting ID: ${meetingId}\\nGenerated: ${new Date().toISOString()}\\n\\n`;

    const chatContent = messages
      .map(
        (msg) =>
          `[${this.formatDate(msg.timestamp, dateFormat)}] ${msg.participant}: ${msg.message}`
      )
      .join("\\n");

    const content = header + chatContent;

    return {
      content,
      mimeType: "text/plain",
      filename: `chat-${meetingId}.txt`,
    };
  }

  private exportChatCSV(
    meetingId: string,
    messages: Array<{
      timestamp: Date;
      participant: string;
      message: string;
    }>,
    options: ExportOptions
  ): { content: string; mimeType: string; filename: string } {
    const delimiter = options.delimiter || ",";
    const dateFormat = options.dateFormat || "iso";

    const headers = ["Timestamp", "Participant", "Message"];
    const rows = messages.map((msg) => [
      this.formatDate(msg.timestamp, dateFormat),
      msg.participant,
      msg.message,
    ]);

    const csvContent =
      options.includeHeaders !== false ? [headers, ...rows] : rows;

    const content = csvContent
      .map((row) =>
        row.map((cell) => `\"${cell.replace(/\"/g, '\"\"')}\"`).join(delimiter)
      )
      .join("\\n");

    return {
      content,
      mimeType: "text/csv",
      filename: `chat-${meetingId}.csv`,
    };
  }

  private formatDate(date: Date, format: "iso" | "readable"): string {
    if (format === "readable") {
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }
    return date.toISOString();
  }

  /**
   * Get supported export formats for different data types
   */
  getSupportedFormats(
    dataType: "meeting" | "participant" | "cohort" | "transcription" | "chat"
  ): string[] {
    switch (dataType) {
      case "meeting":
      case "participant":
      case "cohort":
        return ["csv", "excel", "json"];
      case "transcription":
        return ["txt", "docx"];
      case "chat":
        return ["txt", "csv"];
      default:
        return [];
    }
  }

  /**
   * Validate export options
   */
  validateExportOptions(
    dataType: string,
    options: ExportOptions
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const supportedFormats = this.getSupportedFormats(dataType as any);

    if (!supportedFormats.includes(options.format)) {
      errors.push(
        `Format '${options.format}' is not supported for ${dataType} data. Supported formats: ${supportedFormats.join(", ")}`
      );
    }

    if (options.delimiter && options.format !== "csv") {
      errors.push("Delimiter option is only applicable for CSV format");
    }

    if (
      options.dateFormat &&
      !["iso", "readable"].includes(options.dateFormat)
    ) {
      errors.push('Date format must be either \"iso\" or \"readable\"');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
