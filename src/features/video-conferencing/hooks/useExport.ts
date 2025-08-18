/**
 * Custom hooks for export and download functionality
 */
"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { ExportOptions } from "../components/export/ExportDialog";
import type { Recording } from "../components/export/RecordingDownloader";

export interface ExportHistory {
  id: string;
  meetingId: string;
  format: string;
  options: ExportOptions;
  fileSize: number;
  downloadUrl: string;
  createdAt: Date;
  expiresAt: Date;
  downloadCount: number;
}

export interface DownloadProgress {
  recordingId: string;
  progress: number;
  status: "downloading" | "complete" | "error";
  error?: string;
}

// API functions (these would be implemented in your API layer)
const exportApi = {
  exportMeetingData: async (
    meetingId: string,
    options: ExportOptions
  ): Promise<Blob> => {
    const response = await fetch(`/api/video-spaces/${meetingId}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    if (!response.ok) throw new Error("Failed to export meeting data");
    return response.blob();
  },

  exportTranscription: async (
    meetingId: string,
    format: "txt" | "docx",
    options: any
  ): Promise<Blob> => {
    const response = await fetch(
      `/api/video-spaces/${meetingId}/transcription/export`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, ...options }),
      }
    );
    if (!response.ok) throw new Error("Failed to export transcription");
    return response.blob();
  },

  downloadRecording: async (
    recordingId: string,
    quality?: string
  ): Promise<Blob> => {
    const params = new URLSearchParams();
    if (quality) params.append("quality", quality);

    const response = await fetch(
      `/api/recordings/${recordingId}/download?${params}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) throw new Error("Failed to download recording");
    return response.blob();
  },

  getRecordings: async (meetingId: string): Promise<Recording[]> => {
    const response = await fetch(`/api/video-spaces/${meetingId}/recordings`);
    if (!response.ok) throw new Error("Failed to fetch recordings");
    return response.json();
  },

  getExportHistory: async (meetingId: string): Promise<ExportHistory[]> => {
    const response = await fetch(`/api/video-spaces/${meetingId}/exports`);
    if (!response.ok) throw new Error("Failed to fetch export history");
    return response.json();
  },

  deleteExport: async (exportId: string): Promise<void> => {
    const response = await fetch(`/api/exports/${exportId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete export");
  },
};

/**
 * Hook for exporting meeting data
 */
export function useMeetingExport(meetingId: string) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportMeetingData = useCallback(
    async (options: ExportOptions) => {
      setIsExporting(true);
      setExportProgress(0);
      setExportError(null);

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setExportProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + Math.random() * 20;
          });
        }, 500);

        const blob = await exportApi.exportMeetingData(meetingId, options);

        clearInterval(progressInterval);
        setExportProgress(100);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        const extension = options.format === "excel" ? "xlsx" : options.format;
        link.download = `meeting-export-${meetingId}.${extension}`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        setExportError(
          error instanceof Error ? error.message : "Export failed"
        );
      } finally {
        setIsExporting(false);
        // Reset progress after a delay
        setTimeout(() => setExportProgress(0), 2000);
      }
    },
    [meetingId]
  );

  return {
    exportMeetingData,
    isExporting,
    exportProgress,
    exportError,
  };
}

/**
 * Hook for exporting transcriptions
 */
export function useTranscriptionExport(meetingId: string) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportTranscription = useCallback(
    async (format: "txt" | "docx", options: any) => {
      setIsExporting(true);
      setExportError(null);

      try {
        const blob = await exportApi.exportTranscription(
          meetingId,
          format,
          options
        );

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `transcription-${meetingId}.${format}`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        setExportError(
          error instanceof Error ? error.message : "Export failed"
        );
      } finally {
        setIsExporting(false);
      }
    },
    [meetingId]
  );

  return {
    exportTranscription,
    isExporting,
    exportError,
  };
}

/**
 * Hook for downloading recordings
 */
export function useRecordingDownload() {
  const [downloadProgress, setDownloadProgress] = useState<
    Record<string, DownloadProgress>
  >({});

  const downloadRecording = useCallback(
    async (recordingId: string, quality?: string) => {
      // Initialize progress
      setDownloadProgress((prev) => ({
        ...prev,
        [recordingId]: {
          recordingId,
          progress: 0,
          status: "downloading",
        },
      }));

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setDownloadProgress((prev) => {
            const current = prev[recordingId];
            if (!current || current.progress >= 95) {
              clearInterval(progressInterval);
              return prev;
            }
            return {
              ...prev,
              [recordingId]: {
                ...current,
                progress: current.progress + Math.random() * 15,
              },
            };
          });
        }, 300);

        const blob = await exportApi.downloadRecording(recordingId, quality);

        clearInterval(progressInterval);

        // Update to complete
        setDownloadProgress((prev) => ({
          ...prev,
          [recordingId]: {
            recordingId,
            progress: 100,
            status: "complete",
          },
        }));

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `recording-${recordingId}.mp4`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Clean up progress after delay
        setTimeout(() => {
          setDownloadProgress((prev) => {
            const { [recordingId]: _, ...rest } = prev;
            return rest;
          });
        }, 3000);
      } catch (error) {
        setDownloadProgress((prev) => ({
          ...prev,
          [recordingId]: {
            recordingId,
            progress: 0,
            status: "error",
            error: error instanceof Error ? error.message : "Download failed",
          },
        }));

        // Clean up error after delay
        setTimeout(() => {
          setDownloadProgress((prev) => {
            const { [recordingId]: _, ...rest } = prev;
            return rest;
          });
        }, 5000);
      }
    },
    []
  );

  const getDownloadProgress = useCallback(
    (recordingId: string) => {
      return downloadProgress[recordingId];
    },
    [downloadProgress]
  );

  const isDownloading = useCallback(
    (recordingId: string) => {
      const progress = downloadProgress[recordingId];
      return progress?.status === "downloading";
    },
    [downloadProgress]
  );

  return {
    downloadRecording,
    downloadProgress,
    getDownloadProgress,
    isDownloading,
  };
}

/**
 * Hook for managing recordings
 */
export function useRecordings(meetingId: string) {
  const {
    data: recordings = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["recordings", meetingId],
    queryFn: () => exportApi.getRecordings(meetingId),
    enabled: !!meetingId,
    refetchInterval: 30000, // Refetch every 30 seconds to check processing status
  });

  const availableRecordings = recordings.filter(
    (r) => r.isAvailable && !r.isProcessing
  );
  const processingRecordings = recordings.filter((r) => r.isProcessing);
  const unavailableRecordings = recordings.filter(
    (r) => !r.isAvailable && !r.isProcessing
  );

  const totalSize = recordings.reduce((sum, r) => sum + r.fileSize, 0);

  return {
    recordings,
    availableRecordings,
    processingRecordings,
    unavailableRecordings,
    totalSize,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for export history
 */
export function useExportHistory(meetingId: string) {
  const {
    data: exportHistory = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["export-history", meetingId],
    queryFn: () => exportApi.getExportHistory(meetingId),
    enabled: !!meetingId,
  });

  const deleteMutation = useMutation({
    mutationFn: exportApi.deleteExport,
    onSuccess: () => {
      refetch();
    },
  });

  const deleteExport = useCallback(
    (exportId: string) => {
      return deleteMutation.mutateAsync(exportId);
    },
    [deleteMutation]
  );

  const recentExports = exportHistory
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10);

  const totalExports = exportHistory.length;
  const totalDownloads = exportHistory.reduce(
    (sum, exp) => sum + exp.downloadCount,
    0
  );

  return {
    exportHistory,
    recentExports,
    totalExports,
    totalDownloads,
    isLoading,
    error,
    refetch,
    deleteExport,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for streaming recordings
 */
export function useRecordingStream() {
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);

  const startStream = useCallback((recordingId: string) => {
    setStreamingId(recordingId);
    setStreamError(null);

    // In a real implementation, this would initialize video streaming
    console.log(`Starting stream for recording: ${recordingId}`);
  }, []);

  const stopStream = useCallback(() => {
    setStreamingId(null);
    setStreamError(null);

    // In a real implementation, this would stop video streaming
    console.log("Stopping stream");
  }, []);

  const isStreaming = useCallback(
    (recordingId: string) => {
      return streamingId === recordingId;
    },
    [streamingId]
  );

  return {
    streamingId,
    streamError,
    startStream,
    stopStream,
    isStreaming,
  };
}

/**
 * Hook for bulk export operations
 */
export function useBulkExport() {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isBulkExporting, setIsBulkExporting] = useState(false);
  const [bulkExportError, setBulkExportError] = useState<string | null>(null);

  const selectItem = useCallback((itemId: string) => {
    setSelectedItems((prev) => new Set([...prev, itemId]));
  }, []);

  const deselectItem = useCallback((itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  }, []);

  const toggleItem = useCallback((itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((itemIds: string[]) => {
    setSelectedItems(new Set(itemIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const bulkExport = useCallback(
    async (exportFn: (itemIds: string[]) => Promise<void>) => {
      if (selectedItems.size === 0) return;

      setIsBulkExporting(true);
      setBulkExportError(null);

      try {
        await exportFn(Array.from(selectedItems));
        clearSelection();
      } catch (error) {
        setBulkExportError(
          error instanceof Error ? error.message : "Bulk export failed"
        );
      } finally {
        setIsBulkExporting(false);
      }
    },
    [selectedItems, clearSelection]
  );

  return {
    selectedItems: Array.from(selectedItems),
    selectedCount: selectedItems.size,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    clearSelection,
    bulkExport,
    isBulkExporting,
    bulkExportError,
  };
}
