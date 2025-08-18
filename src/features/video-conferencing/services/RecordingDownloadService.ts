/**
 * Recording Download Service
 * Handles secure download of meeting recordings with proper authentication
 */

import { VideoProvider } from "@prisma/client";

export interface RecordingInfo {
  recordingId: string;
  meetingId: string;
  provider: VideoProvider;
  recordingUrl: string;
  fileName: string;
  fileSize: number;
  duration: number;
  format: string;
  quality: "HD" | "SD" | "AUDIO_ONLY";
  createdAt: Date;
  expiresAt: Date | null;
  isPasswordProtected: boolean;
  downloadCount: number;
  maxDownloads: number | null;
}

export interface DownloadOptions {
  quality?: "HD" | "SD" | "AUDIO_ONLY";
  format?: "mp4" | "mp3" | "wav";
  includeTranscription?: boolean;
  includeChat?: boolean;
  watermark?: boolean;
}

export interface DownloadResult {
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  expiresAt: Date;
  downloadToken: string;
}

export interface DownloadPermissions {
  canDownload: boolean;
  canDownloadRecording: boolean;
  canDownloadTranscription: boolean;
  canDownloadChat: boolean;
  maxQuality: "HD" | "SD" | "AUDIO_ONLY";
  reasons?: string[];
}

export class RecordingDownloadService {
  private readonly downloadTokens = new Map<
    string,
    {
      recordingId: string;
      userId: string;
      expiresAt: Date;
      downloadCount: number;
    }
  >();

  /**
   * Check if user has permission to download recording
   */
  async checkDownloadPermissions(
    recordingId: string,
    userId: string,
    userRole: string
  ): Promise<DownloadPermissions> {
    try {
      // Get recording info
      const recording = await this.getRecordingInfo(recordingId);
      if (!recording) {
        return {
          canDownload: false,
          canDownloadRecording: false,
          canDownloadTranscription: false,
          canDownloadChat: false,
          maxQuality: "AUDIO_ONLY",
          reasons: ["Recording not found"],
        };
      }

      // Check if recording has expired
      if (recording.expiresAt && recording.expiresAt < new Date()) {
        return {
          canDownload: false,
          canDownloadRecording: false,
          canDownloadTranscription: false,
          canDownloadChat: false,
          maxQuality: "AUDIO_ONLY",
          reasons: ["Recording has expired"],
        };
      }

      // Check download limits
      if (
        recording.maxDownloads &&
        recording.downloadCount >= recording.maxDownloads
      ) {
        return {
          canDownload: false,
          canDownloadRecording: false,
          canDownloadTranscription: false,
          canDownloadChat: false,
          maxQuality: "AUDIO_ONLY",
          reasons: ["Download limit exceeded"],
        };
      }

      // Check user permissions based on role and meeting participation
      const isParticipant = await this.isUserMeetingParticipant(
        recording.meetingId,
        userId
      );
      const isAdmin = userRole === "admin" || userRole === "super_admin";
      const isModerator = userRole === "moderator";

      let canDownloadRecording = false;
      let canDownloadTranscription = false;
      let canDownloadChat = false;
      let maxQuality: "HD" | "SD" | "AUDIO_ONLY" = "AUDIO_ONLY";

      if (isAdmin) {
        canDownloadRecording = true;
        canDownloadTranscription = true;
        canDownloadChat = true;
        maxQuality = "HD";
      } else if (isModerator) {
        canDownloadRecording = true;
        canDownloadTranscription = true;
        canDownloadChat = true;
        maxQuality = "SD";
      } else if (isParticipant) {
        canDownloadRecording = true;
        canDownloadTranscription = true;
        canDownloadChat = false; // Participants can't download chat by default
        maxQuality = "SD";
      }

      const canDownload =
        canDownloadRecording || canDownloadTranscription || canDownloadChat;

      return {
        canDownload,
        canDownloadRecording,
        canDownloadTranscription,
        canDownloadChat,
        maxQuality,
        reasons: canDownload ? [] : ["Insufficient permissions"],
      };
    } catch (error) {
      console.error("Error checking download permissions:", error);
      return {
        canDownload: false,
        canDownloadRecording: false,
        canDownloadTranscription: false,
        canDownloadChat: false,
        maxQuality: "AUDIO_ONLY",
        reasons: ["Permission check failed"],
      };
    }
  }

  /**
   * Generate secure download URL
   */
  async generateDownloadUrl(
    recordingId: string,
    userId: string,
    options: DownloadOptions = {}
  ): Promise<DownloadResult> {
    // Check permissions
    const permissions = await this.checkDownloadPermissions(
      recordingId,
      userId,
      "user"
    );
    if (!permissions.canDownload) {
      throw new Error(
        `Download not permitted: ${permissions.reasons?.join(", ")}`
      );
    }

    // Get recording info
    const recording = await this.getRecordingInfo(recordingId);
    if (!recording) {
      throw new Error("Recording not found");
    }

    // Validate quality request
    const requestedQuality = options.quality || "SD";
    const allowedQuality = this.getMaxAllowedQuality(
      requestedQuality,
      permissions.maxQuality
    );

    // Generate download token
    const downloadToken = this.generateDownloadToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token
    this.downloadTokens.set(downloadToken, {
      recordingId,
      userId,
      expiresAt,
      downloadCount: 0,
    });

    // Generate secure URL based on provider
    const downloadUrl = await this.generateProviderDownloadUrl(
      recording,
      downloadToken,
      allowedQuality,
      options
    );

    // Update download count
    await this.incrementDownloadCount(recordingId);

    return {
      downloadUrl,
      fileName: this.generateFileName(recording, allowedQuality, options),
      fileSize: this.estimateFileSize(recording, allowedQuality, options),
      expiresAt,
      downloadToken,
    };
  }

  /**
   * Validate download token and serve file
   */
  async validateAndServeDownload(
    downloadToken: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{
    isValid: boolean;
    recordingInfo?: RecordingInfo;
    error?: string;
  }> {
    const tokenInfo = this.downloadTokens.get(downloadToken);

    if (!tokenInfo) {
      return {
        isValid: false,
        error: "Invalid download token",
      };
    }

    if (tokenInfo.expiresAt < new Date()) {
      this.downloadTokens.delete(downloadToken);
      return {
        isValid: false,
        error: "Download token has expired",
      };
    }

    // Get recording info
    const recording = await this.getRecordingInfo(tokenInfo.recordingId);
    if (!recording) {
      return {
        isValid: false,
        error: "Recording not found",
      };
    }

    // Log download attempt
    await this.logDownloadAttempt(tokenInfo.recordingId, tokenInfo.userId, {
      userAgent,
      ipAddress,
      downloadToken,
      timestamp: new Date(),
    });

    // Increment token usage
    tokenInfo.downloadCount++;

    return {
      isValid: true,
      recordingInfo: recording,
    };
  }

  /**
   * Get recording information
   */
  private async getRecordingInfo(
    recordingId: string
  ): Promise<RecordingInfo | null> {
    // Mock implementation - in real app, this would query the database
    return {
      recordingId,
      meetingId: "meeting-123",
      provider: "ZOOM",
      recordingUrl: `https://recordings.example.com/${recordingId}`,
      fileName: `recording-${recordingId}.mp4`,
      fileSize: 1024 * 1024 * 100, // 100MB
      duration: 3600, // 1 hour
      format: "mp4",
      quality: "HD",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isPasswordProtected: false,
      downloadCount: 0,
      maxDownloads: 10,
    };
  }

  /**
   * Check if user was a participant in the meeting
   */
  private async isUserMeetingParticipant(
    meetingId: string,
    userId: string
  ): Promise<boolean> {
    // Mock implementation - in real app, this would query the database
    return true;
  }

  /**
   * Generate download token
   */
  private generateDownloadToken(): string {
    return `dl_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get maximum allowed quality based on permissions
   */
  private getMaxAllowedQuality(
    requested: "HD" | "SD" | "AUDIO_ONLY",
    maxAllowed: "HD" | "SD" | "AUDIO_ONLY"
  ): "HD" | "SD" | "AUDIO_ONLY" {
    const qualityLevels = { AUDIO_ONLY: 0, SD: 1, HD: 2 };
    const requestedLevel = qualityLevels[requested];
    const maxLevel = qualityLevels[maxAllowed];

    if (requestedLevel <= maxLevel) {
      return requested;
    }
    return maxAllowed;
  }

  /**
   * Generate provider-specific download URL
   */
  private async generateProviderDownloadUrl(
    recording: RecordingInfo,
    downloadToken: string,
    quality: "HD" | "SD" | "AUDIO_ONLY",
    options: DownloadOptions
  ): Promise<string> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    switch (recording.provider) {
      case "ZOOM":
        return `${baseUrl}/api/recordings/download/zoom/${downloadToken}?quality=${quality}`;
      case "MEET":
        return `${baseUrl}/api/recordings/download/meet/${downloadToken}?quality=${quality}`;
      case "VIMEO":
        return `${baseUrl}/api/recordings/download/vimeo/${downloadToken}?quality=${quality}`;
      default:
        return `${baseUrl}/api/recordings/download/${downloadToken}?quality=${quality}`;
    }
  }

  /**
   * Generate appropriate filename
   */
  private generateFileName(
    recording: RecordingInfo,
    quality: "HD" | "SD" | "AUDIO_ONLY",
    options: DownloadOptions
  ): string {
    const timestamp = recording.createdAt.toISOString().split("T")[0];
    const qualitySuffix =
      quality === "AUDIO_ONLY" ? "_audio" : `_${quality.toLowerCase()}`;
    const extension =
      options.format || (quality === "AUDIO_ONLY" ? "mp3" : "mp4");

    return `recording_${recording.meetingId}_${timestamp}${qualitySuffix}.${extension}`;
  }

  /**
   * Estimate file size based on quality and options
   */
  private estimateFileSize(
    recording: RecordingInfo,
    quality: "HD" | "SD" | "AUDIO_ONLY",
    options: DownloadOptions
  ): number {
    let baseSize = recording.fileSize;

    // Adjust size based on quality
    switch (quality) {
      case "HD":
        baseSize = recording.fileSize;
        break;
      case "SD":
        baseSize = Math.round(recording.fileSize * 0.6);
        break;
      case "AUDIO_ONLY":
        baseSize = Math.round(recording.fileSize * 0.1);
        break;
    }

    // Add size for additional content
    if (options.includeTranscription) {
      baseSize += 1024 * 50; // ~50KB for transcription
    }
    if (options.includeChat) {
      baseSize += 1024 * 10; // ~10KB for chat
    }

    return baseSize;
  }

  /**
   * Increment download count
   */
  private async incrementDownloadCount(recordingId: string): Promise<void> {
    // Mock implementation - in real app, this would update the database
    console.log(`Incrementing download count for recording ${recordingId}`);
  }

  /**
   * Log download attempt
   */
  private async logDownloadAttempt(
    recordingId: string,
    userId: string,
    metadata: {
      userAgent?: string;
      ipAddress?: string;
      downloadToken: string;
      timestamp: Date;
    }
  ): Promise<void> {
    // Mock implementation - in real app, this would log to database
    console.log(`Download attempt logged:`, {
      recordingId,
      userId,
      ...metadata,
    });
  }

  /**
   * Clean up expired tokens
   */
  cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [token, info] of this.downloadTokens.entries()) {
      if (info.expiresAt < now) {
        this.downloadTokens.delete(token);
      }
    }
  }

  /**
   * Get download statistics
   */
  async getDownloadStats(recordingId: string): Promise<{
    totalDownloads: number;
    remainingDownloads: number | null;
    lastDownload: Date | null;
    activeTokens: number;
  }> {
    const recording = await this.getRecordingInfo(recordingId);
    if (!recording) {
      throw new Error("Recording not found");
    }

    const activeTokens = Array.from(this.downloadTokens.values()).filter(
      (token) =>
        token.recordingId === recordingId && token.expiresAt > new Date()
    ).length;

    return {
      totalDownloads: recording.downloadCount,
      remainingDownloads: recording.maxDownloads
        ? recording.maxDownloads - recording.downloadCount
        : null,
      lastDownload: null, // Would come from database in real implementation
      activeTokens,
    };
  }

  /**
   * Revoke download token
   */
  revokeDownloadToken(downloadToken: string): boolean {
    return this.downloadTokens.delete(downloadToken);
  }

  /**
   * Get all active tokens for a user
   */
  getUserActiveTokens(userId: string): Array<{
    token: string;
    recordingId: string;
    expiresAt: Date;
    downloadCount: number;
  }> {
    const now = new Date();
    const userTokens: Array<{
      token: string;
      recordingId: string;
      expiresAt: Date;
      downloadCount: number;
    }> = [];

    for (const [token, info] of this.downloadTokens.entries()) {
      if (info.userId === userId && info.expiresAt > now) {
        userTokens.push({
          token,
          recordingId: info.recordingId,
          expiresAt: info.expiresAt,
          downloadCount: info.downloadCount,
        });
      }
    }

    return userTokens;
  }
}
