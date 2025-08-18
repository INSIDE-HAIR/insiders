/**
 * RecordingDownloader Component
 * Handles recording downloads with proper authentication
 */
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Video,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FileVideo,
  Clock,
  HardDrive,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { formatFileSize, formatDuration, formatDate } from "@/lib/utils";

export interface Recording {
  id: string;
  title: string;
  duration: number; // in seconds
  fileSize: number; // in bytes
  format: string;
  quality: "HD" | "SD" | "4K";
  recordingType: "video" | "audio" | "screen" | "chat";
  createdAt: Date;
  downloadUrl?: string;
  streamUrl?: string;
  thumbnailUrl?: string;
  isProcessing: boolean;
  isAvailable: boolean;
  expiresAt?: Date;
  requiresAuth: boolean;
}

interface RecordingDownloaderProps {
  recordings: Recording[];
  meetingTitle: string;
  onDownload: (recordingId: string, quality?: string) => Promise<void>;
  onStream: (recordingId: string) => void;
  className?: string;
}

export function RecordingDownloader({
  recordings,
  meetingTitle,
  onDownload,
  onStream,
  className,
}: RecordingDownloaderProps) {
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [downloadProgress, setDownloadProgress] = useState<
    Record<string, number>
  >({});
  const [selectedQuality, setSelectedQuality] = useState<
    Record<string, string>
  >({});
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handleDownload = async (recording: Recording) => {
    if (downloadingIds.has(recording.id)) return;

    setDownloadingIds((prev) => new Set([...prev, recording.id]));
    setDownloadProgress((prev) => ({ ...prev, [recording.id]: 0 }));

    try {
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          const current = prev[recording.id] || 0;
          if (current >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [recording.id]: current + Math.random() * 10 };
        });
      }, 200);

      const quality = selectedQuality[recording.id];
      await onDownload(recording.id, quality);

      clearInterval(progressInterval);
      setDownloadProgress((prev) => ({ ...prev, [recording.id]: 100 }));

      // Reset after completion
      setTimeout(() => {
        setDownloadingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(recording.id);
          return newSet;
        });
        setDownloadProgress((prev) => {
          const { [recording.id]: _, ...rest } = prev;
          return rest;
        });
      }, 2000);
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(recording.id);
        return newSet;
      });
      setDownloadProgress((prev) => {
        const { [recording.id]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleStream = (recording: Recording) => {
    if (playingId === recording.id) {
      setPlayingId(null);
    } else {
      setPlayingId(recording.id);
      onStream(recording.id);
    }
  };

  const getRecordingIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className='h-4 w-4' />;
      case "audio":
        return <Volume2 className='h-4 w-4' />;
      case "screen":
        return <FileVideo className='h-4 w-4' />;
      case "chat":
        return <FileVideo className='h-4 w-4' />;
      default:
        return <Video className='h-4 w-4' />;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "4K":
        return "text-purple-600";
      case "HD":
        return "text-blue-600";
      case "SD":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBadge = (recording: Recording) => {
    if (recording.isProcessing) {
      return (
        <Badge variant='outline' className='flex items-center gap-1'>
          <Loader2 className='h-3 w-3 animate-spin' />
          Processing
        </Badge>
      );
    }

    if (!recording.isAvailable) {
      return (
        <Badge variant='destructive' className='flex items-center gap-1'>
          <AlertCircle className='h-3 w-3' />
          Unavailable
        </Badge>
      );
    }

    if (recording.expiresAt && new Date() > recording.expiresAt) {
      return (
        <Badge variant='outline' className='flex items-center gap-1'>
          <AlertCircle className='h-3 w-3' />
          Expired
        </Badge>
      );
    }

    return (
      <Badge variant='default' className='flex items-center gap-1'>
        <CheckCircle className='h-3 w-3' />
        Available
      </Badge>
    );
  };

  const availableRecordings = recordings.filter(
    (r) => r.isAvailable && !r.isProcessing
  );
  const processingRecordings = recordings.filter((r) => r.isProcessing);
  const unavailableRecordings = recordings.filter(
    (r) => !r.isAvailable && !r.isProcessing
  );

  const totalSize = recordings.reduce((sum, r) => sum + r.fileSize, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <Video className='h-5 w-5' />
            Recording Downloads
          </CardTitle>

          <div className='flex items-center gap-2'>
            <Badge variant='outline'>{recordings.length} recordings</Badge>
            <Badge variant='secondary'>{formatFileSize(totalSize)} total</Badge>
          </div>
        </div>

        <p className='text-sm text-muted-foreground'>
          Download recordings from "{meetingTitle}"
        </p>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Summary Stats */}
        <div className='grid grid-cols-3 gap-4'>
          <div className='text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
            <div className='text-lg font-semibold text-green-600'>
              {availableRecordings.length}
            </div>
            <div className='text-xs text-green-600'>Available</div>
          </div>

          <div className='text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg'>
            <div className='text-lg font-semibold text-orange-600'>
              {processingRecordings.length}
            </div>
            <div className='text-xs text-orange-600'>Processing</div>
          </div>

          <div className='text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg'>
            <div className='text-lg font-semibold text-red-600'>
              {unavailableRecordings.length}
            </div>
            <div className='text-xs text-red-600'>Unavailable</div>
          </div>
        </div>

        {/* Available Recordings */}
        {availableRecordings.length > 0 && (
          <div className='space-y-4'>
            <h3 className='font-medium flex items-center gap-2'>
              <CheckCircle className='h-4 w-4 text-green-600' />
              Available Downloads
            </h3>

            <div className='space-y-3'>
              {availableRecordings.map((recording) => (
                <div key={recording.id} className='border rounded-lg p-4'>
                  <div className='flex items-start gap-4'>
                    {/* Thumbnail */}
                    <div className='w-16 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0'>
                      {recording.thumbnailUrl ? (
                        <img
                          src={recording.thumbnailUrl}
                          alt='Recording thumbnail'
                          className='w-full h-full object-cover rounded'
                        />
                      ) : (
                        getRecordingIcon(recording.recordingType)
                      )}
                    </div>

                    {/* Recording Info */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-2'>
                        <h4 className='font-medium truncate'>
                          {recording.title}
                        </h4>
                        {getStatusBadge(recording)}
                        <Badge
                          variant='outline'
                          className={getQualityColor(recording.quality)}
                        >
                          {recording.quality}
                        </Badge>
                        {recording.requiresAuth && (
                          <Badge
                            variant='outline'
                            className='flex items-center gap-1'
                          >
                            <Shield className='h-3 w-3' />
                            Auth Required
                          </Badge>
                        )}
                      </div>

                      <div className='flex items-center gap-4 text-sm text-muted-foreground mb-3'>
                        <div className='flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          <span>{formatDuration(recording.duration)}</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <HardDrive className='h-3 w-3' />
                          <span>{formatFileSize(recording.fileSize)}</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <FileVideo className='h-3 w-3' />
                          <span className='uppercase'>{recording.format}</span>
                        </div>
                        <span>{formatDate(recording.createdAt)}</span>
                      </div>

                      {/* Download Progress */}
                      {downloadingIds.has(recording.id) && (
                        <div className='mb-3'>
                          <div className='flex items-center justify-between text-sm mb-1'>
                            <span>Downloading...</span>
                            <span>
                              {Math.round(downloadProgress[recording.id] || 0)}%
                            </span>
                          </div>
                          <Progress
                            value={downloadProgress[recording.id] || 0}
                            className='h-2'
                          />
                        </div>
                      )}

                      {/* Expiration Warning */}
                      {recording.expiresAt && (
                        <div className='mb-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm'>
                          <div className='flex items-center gap-1 text-orange-700 dark:text-orange-300'>
                            <AlertCircle className='h-3 w-3' />
                            <span>
                              Expires on {formatDate(recording.expiresAt)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className='flex items-center gap-2 flex-shrink-0'>
                      {/* Quality Selection */}
                      <Select
                        value={
                          selectedQuality[recording.id] || recording.quality
                        }
                        onValueChange={(value) =>
                          setSelectedQuality((prev) => ({
                            ...prev,
                            [recording.id]: value,
                          }))
                        }
                      >
                        <SelectTrigger className='w-20'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='4K'>4K</SelectItem>
                          <SelectItem value='HD'>HD</SelectItem>
                          <SelectItem value='SD'>SD</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Stream Button */}
                      {recording.streamUrl && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleStream(recording)}
                          className='flex items-center gap-2'
                        >
                          {playingId === recording.id ? (
                            <Pause className='h-4 w-4' />
                          ) : (
                            <Play className='h-4 w-4' />
                          )}
                        </Button>
                      )}

                      {/* Download Button */}
                      <Button
                        onClick={() => handleDownload(recording)}
                        disabled={downloadingIds.has(recording.id)}
                        className='flex items-center gap-2'
                      >
                        {downloadingIds.has(recording.id) ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <Download className='h-4 w-4' />
                        )}
                        Download
                      </Button>

                      {/* External Link */}
                      {recording.downloadUrl && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            window.open(recording.downloadUrl, "_blank")
                          }
                        >
                          <ExternalLink className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Recordings */}
        {processingRecordings.length > 0 && (
          <div className='space-y-4'>
            <h3 className='font-medium flex items-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin text-orange-600' />
              Processing Recordings
            </h3>

            <div className='space-y-3'>
              {processingRecordings.map((recording) => (
                <div
                  key={recording.id}
                  className='border rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20'
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-8 bg-muted rounded flex items-center justify-center'>
                      {getRecordingIcon(recording.recordingType)}
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-medium'>{recording.title}</h4>
                      <p className='text-sm text-muted-foreground'>
                        Recording is being processed and will be available soon
                      </p>
                    </div>
                    <Badge
                      variant='outline'
                      className='flex items-center gap-1'
                    >
                      <Loader2 className='h-3 w-3 animate-spin' />
                      Processing
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unavailable Recordings */}
        {unavailableRecordings.length > 0 && (
          <div className='space-y-4'>
            <h3 className='font-medium flex items-center gap-2'>
              <AlertCircle className='h-4 w-4 text-red-600' />
              Unavailable Recordings
            </h3>

            <div className='space-y-3'>
              {unavailableRecordings.map((recording) => (
                <div
                  key={recording.id}
                  className='border rounded-lg p-4 bg-red-50 dark:bg-red-900/20'
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-8 bg-muted rounded flex items-center justify-center opacity-50'>
                      {getRecordingIcon(recording.recordingType)}
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-medium'>{recording.title}</h4>
                      <p className='text-sm text-muted-foreground'>
                        This recording is no longer available for download
                      </p>
                    </div>
                    <Badge variant='destructive'>Unavailable</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Recordings */}
        {recordings.length === 0 && (
          <div className='text-center py-12'>
            <Video className='h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50' />
            <h3 className='text-lg font-semibold mb-2'>
              No Recordings Available
            </h3>
            <p className='text-muted-foreground'>
              No recordings were created for this meeting.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
