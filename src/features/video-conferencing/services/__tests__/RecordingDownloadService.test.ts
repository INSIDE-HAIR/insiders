/**
 * Recording Download Service Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { RecordingDownloadService } from "../RecordingDownloadService";

describe("RecordingDownloadService", () => {
  let downloadService: RecordingDownloadService;

  beforeEach(() => {
    downloadService = new RecordingDownloadService();
    vi.clearAllMocks();
  });

  describe("checkDownloadPermissions", () => {
    it("should allow admin to download with full permissions", async () => {
      const permissions = await downloadService.checkDownloadPermissions(
        "recording-123",
        "admin-user",
        "admin"
      );

      expect(permissions.canDownload).toBe(true);
      expect(permissions.canDownloadRecording).toBe(true);
      expect(permissions.canDownloadTranscription).toBe(true);
      expect(permissions.canDownloadChat).toBe(true);
      expect(permissions.maxQuality).toBe("HD");
      expect(permissions.reasons).toHaveLength(0);
    });

    it("should allow moderator to download with limited permissions", async () => {
      const permissions = await downloadService.checkDownloadPermissions(
        "recording-123",
        "moderator-user",
        "moderator"
      );

      expect(permissions.canDownload).toBe(true);
      expect(permissions.canDownloadRecording).toBe(true);
      expect(permissions.canDownloadTranscription).toBe(true);
      expect(permissions.canDownloadChat).toBe(true);
      expect(permissions.maxQuality).toBe("SD");
    });

    it("should allow participant to download with basic permissions", async () => {
      const permissions = await downloadService.checkDownloadPermissions(
        "recording-123",
        "participant-user",
        "user"
      );

      expect(permissions.canDownload).toBe(true);
      expect(permissions.canDownloadRecording).toBe(true);
      expect(permissions.canDownloadTranscription).toBe(true);
      expect(permissions.canDownloadChat).toBe(false); // Participants can't download chat
      expect(permissions.maxQuality).toBe("SD");
    });

    it("should deny download for non-existent recording", async () => {
      // Mock the getRecordingInfo to return null
      const originalMethod = (downloadService as any).getRecordingInfo;
      (downloadService as any).getRecordingInfo = vi
        .fn()
        .mockResolvedValue(null);

      const permissions = await downloadService.checkDownloadPermissions(
        "non-existent",
        "user-123",
        "user"
      );

      expect(permissions.canDownload).toBe(false);
      expect(permissions.reasons).toContain("Recording not found");

      // Restore original method
      (downloadService as any).getRecordingInfo = originalMethod;
    });
  });

  describe("generateDownloadUrl", () => {
    it("should generate download URL for valid request", async () => {
      const result = await downloadService.generateDownloadUrl(
        "recording-123",
        "user-123",
        { quality: "SD" }
      );

      expect(result.downloadUrl).toContain("/api/recordings/download/");
      expect(result.fileName).toContain("recording_meeting-123");
      expect(result.fileName).toContain("_sd.mp4");
      expect(result.fileSize).toBeGreaterThan(0);
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.downloadToken).toMatch(/^dl_\d+_[a-z0-9]+$/);
    });

    it("should respect quality limitations", async () => {
      // Mock permissions to limit quality to SD
      const originalCheckPermissions = downloadService.checkDownloadPermissions;
      downloadService.checkDownloadPermissions = vi.fn().mockResolvedValue({
        canDownload: true,
        canDownloadRecording: true,
        canDownloadTranscription: true,
        canDownloadChat: false,
        maxQuality: "SD",
      });

      const result = await downloadService.generateDownloadUrl(
        "recording-123",
        "user-123",
        { quality: "HD" } // Request HD but should get SD
      );

      expect(result.fileName).toContain("_sd."); // Should be downgraded to SD

      // Restore original method
      downloadService.checkDownloadPermissions = originalCheckPermissions;
    });

    it("should throw error for insufficient permissions", async () => {
      // Mock permissions to deny download
      const originalCheckPermissions = downloadService.checkDownloadPermissions;
      downloadService.checkDownloadPermissions = vi.fn().mockResolvedValue({
        canDownload: false,
        canDownloadRecording: false,
        canDownloadTranscription: false,
        canDownloadChat: false,
        maxQuality: "AUDIO_ONLY",
        reasons: ["Insufficient permissions"],
      });

      await expect(
        downloadService.generateDownloadUrl("recording-123", "user-123")
      ).rejects.toThrow("Download not permitted: Insufficient permissions");

      // Restore original method
      downloadService.checkDownloadPermissions = originalCheckPermissions;
    });

    it("should generate appropriate filename for audio-only", async () => {
      const result = await downloadService.generateDownloadUrl(
        "recording-123",
        "user-123",
        { quality: "AUDIO_ONLY", format: "mp3" }
      );

      expect(result.fileName).toContain("_audio.mp3");
    });
  });

  describe("validateAndServeDownload", () => {
    it("should validate valid token", async () => {
      // First generate a download URL to create a token
      const downloadResult = await downloadService.generateDownloadUrl(
        "recording-123",
        "user-123"
      );

      const validation = await downloadService.validateAndServeDownload(
        downloadResult.downloadToken,
        "Mozilla/5.0",
        "192.168.1.1"
      );

      expect(validation.isValid).toBe(true);
      expect(validation.recordingInfo).toBeDefined();
      expect(validation.error).toBeUndefined();
    });

    it("should reject invalid token", async () => {
      const validation = await downloadService.validateAndServeDownload(
        "invalid-token",
        "Mozilla/5.0",
        "192.168.1.1"
      );

      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe("Invalid download token");
    });

    it("should reject expired token", async () => {
      // Generate a token and manually expire it
      const downloadResult = await downloadService.generateDownloadUrl(
        "recording-123",
        "user-123"
      );

      // Manually set expiration to past
      const tokenInfo = (downloadService as any).downloadTokens.get(
        downloadResult.downloadToken
      );
      tokenInfo.expiresAt = new Date(Date.now() - 1000); // 1 second ago

      const validation = await downloadService.validateAndServeDownload(
        downloadResult.downloadToken,
        "Mozilla/5.0",
        "192.168.1.1"
      );

      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe("Download token has expired");
    });
  });

  describe("getDownloadStats", () => {
    it("should return download statistics", async () => {
      const stats = await downloadService.getDownloadStats("recording-123");

      expect(stats.totalDownloads).toBeDefined();
      expect(stats.remainingDownloads).toBeDefined();
      expect(stats.lastDownload).toBeDefined();
      expect(stats.activeTokens).toBeDefined();
    });
  });

  describe("revokeDownloadToken", () => {
    it("should revoke valid token", async () => {
      // Generate a token first
      const downloadResult = await downloadService.generateDownloadUrl(
        "recording-123",
        "user-123"
      );

      const revoked = downloadService.revokeDownloadToken(
        downloadResult.downloadToken
      );
      expect(revoked).toBe(true);

      // Token should no longer be valid
      const validation = await downloadService.validateAndServeDownload(
        downloadResult.downloadToken
      );
      expect(validation.isValid).toBe(false);
    });

    it("should return false for non-existent token", () => {
      const revoked = downloadService.revokeDownloadToken("non-existent-token");
      expect(revoked).toBe(false);
    });
  });

  describe("getUserActiveTokens", () => {
    it("should return active tokens for user", async () => {
      const userId = "user-123";

      // Generate multiple tokens
      await downloadService.generateDownloadUrl("recording-1", userId);
      await downloadService.generateDownloadUrl("recording-2", userId);

      const activeTokens = downloadService.getUserActiveTokens(userId);

      expect(activeTokens).toHaveLength(2);
      expect(activeTokens[0].recordingId).toBeDefined();
      expect(activeTokens[0].expiresAt).toBeInstanceOf(Date);
      expect(activeTokens[0].downloadCount).toBe(0);
    });

    it("should not return expired tokens", async () => {
      const userId = "user-123";

      // Generate a token and expire it
      const downloadResult = await downloadService.generateDownloadUrl(
        "recording-1",
        userId
      );
      const tokenInfo = (downloadService as any).downloadTokens.get(
        downloadResult.downloadToken
      );
      tokenInfo.expiresAt = new Date(Date.now() - 1000); // Expired

      const activeTokens = downloadService.getUserActiveTokens(userId);
      expect(activeTokens).toHaveLength(0);
    });
  });

  describe("cleanupExpiredTokens", () => {
    it("should remove expired tokens", async () => {
      // Generate a token and expire it
      const downloadResult = await downloadService.generateDownloadUrl(
        "recording-123",
        "user-123"
      );

      const tokenInfo = (downloadService as any).downloadTokens.get(
        downloadResult.downloadToken
      );
      tokenInfo.expiresAt = new Date(Date.now() - 1000); // Expired

      // Verify token exists before cleanup
      expect(
        (downloadService as any).downloadTokens.has(
          downloadResult.downloadToken
        )
      ).toBe(true);

      downloadService.cleanupExpiredTokens();

      // Token should be removed after cleanup
      expect(
        (downloadService as any).downloadTokens.has(
          downloadResult.downloadToken
        )
      ).toBe(false);
    });

    it("should keep valid tokens", async () => {
      const downloadResult = await downloadService.generateDownloadUrl(
        "recording-123",
        "user-123"
      );

      downloadService.cleanupExpiredTokens();

      // Valid token should still exist
      expect(
        (downloadService as any).downloadTokens.has(
          downloadResult.downloadToken
        )
      ).toBe(true);
    });
  });
});
