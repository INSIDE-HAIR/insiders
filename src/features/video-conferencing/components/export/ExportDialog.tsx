/**
 * ExportDialog Component
 * Dialog for exporting meeting data with format selection
 */
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Users,
  MessageSquare,
  Video,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { formatFileSize } from "@/lib/utils";

export interface ExportOptions {
  format: "csv" | "excel" | "pdf" | "json";
  includeAnalytics: boolean;
  includeParticipants: boolean;
  includeTranscription: boolean;
  includeChatMessages: boolean;
  includeRecordings: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (options: ExportOptions) => Promise<void>;
  meetingTitle?: string;
  availableData: {
    hasAnalytics: boolean;
    hasParticipants: boolean;
    hasTranscription: boolean;
    hasChatMessages: boolean;
    hasRecordings: boolean;
    participantCount?: number;
    messageCount?: number;
    transcriptionLength?: number;
    recordingCount?: number;
  };
  className?: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  onExport,
  meetingTitle = "Meeting Data",
  availableData,
  className,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportOptions["format"]>("csv");
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [includeParticipants, setIncludeParticipants] = useState(true);
  const [includeTranscription, setIncludeTranscription] = useState(
    availableData.hasTranscription
  );
  const [includeChatMessages, setIncludeChatMessages] = useState(
    availableData.hasChatMessages
  );
  const [includeRecordings, setIncludeRecordings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<
    "idle" | "preparing" | "exporting" | "complete" | "error"
  >("idle");

  const formatOptions = [
    {
      value: "csv" as const,
      label: "CSV",
      description: "Comma-separated values, ideal for spreadsheet applications",
      icon: FileSpreadsheet,
      estimatedSize: "2-5 MB",
      supportsAll: true,
    },
    {
      value: "excel" as const,
      label: "Excel",
      description: "Microsoft Excel format with multiple sheets",
      icon: FileSpreadsheet,
      estimatedSize: "3-8 MB",
      supportsAll: true,
    },
    {
      value: "pdf" as const,
      label: "PDF",
      description: "Formatted report, ideal for sharing and archiving",
      icon: File,
      estimatedSize: "5-15 MB",
      supportsAll: false,
    },
    {
      value: "json" as const,
      label: "JSON",
      description: "Raw data format, ideal for developers and integrations",
      icon: FileText,
      estimatedSize: "1-3 MB",
      supportsAll: true,
    },
  ];

  const selectedFormatOption = formatOptions.find(
    (opt) => opt.value === format
  );

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus("preparing");
    setExportProgress(0);

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

      setExportStatus("exporting");

      const options: ExportOptions = {
        format,
        includeAnalytics,
        includeParticipants,
        includeTranscription,
        includeChatMessages,
        includeRecordings,
      };

      await onExport(options);

      clearInterval(progressInterval);
      setExportProgress(100);
      setExportStatus("complete");

      // Auto-close after success
      setTimeout(() => {
        onOpenChange(false);
        resetState();
      }, 2000);
    } catch (error) {
      setExportStatus("error");
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const resetState = () => {
    setExportProgress(0);
    setExportStatus("idle");
    setIsExporting(false);
  };

  const getEstimatedFileSize = () => {
    let baseSize = 1; // MB

    if (includeAnalytics) baseSize += 0.5;
    if (includeParticipants)
      baseSize += (availableData.participantCount || 0) * 0.01;
    if (includeTranscription)
      baseSize += (availableData.transcriptionLength || 0) * 0.001;
    if (includeChatMessages)
      baseSize += (availableData.messageCount || 0) * 0.002;
    if (includeRecordings) baseSize += (availableData.recordingCount || 0) * 50; // Recordings are large

    // Format multipliers
    const multipliers = { csv: 1, excel: 1.5, pdf: 3, json: 0.8 };
    baseSize *= multipliers[format];

    return formatFileSize(baseSize * 1024 * 1024);
  };

  const getSelectedDataCount = () => {
    let count = 0;
    if (includeAnalytics) count++;
    if (includeParticipants) count++;
    if (includeTranscription) count++;
    if (includeChatMessages) count++;
    if (includeRecordings) count++;
    return count;
  };

  const canExport = getSelectedDataCount() > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl ${className}`}>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Download className='h-5 w-5' />
            Export Meeting Data
          </DialogTitle>
          <DialogDescription>
            Export data from "{meetingTitle}" in your preferred format
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Format Selection */}
          <div className='space-y-3'>
            <Label className='text-base font-medium'>Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(value: ExportOptions["format"]) =>
                setFormat(value)
              }
            >
              <div className='grid grid-cols-1 gap-3'>
                {formatOptions.map((option) => (
                  <div
                    key={option.value}
                    className='flex items-center space-x-3'
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className='flex-1 cursor-pointer p-3 border rounded-lg hover:bg-muted/50 transition-colors'
                    >
                      <div className='flex items-start gap-3'>
                        <option.icon className='h-5 w-5 mt-0.5 text-muted-foreground' />
                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <span className='font-medium'>{option.label}</span>
                            <Badge variant='outline' className='text-xs'>
                              {option.estimatedSize}
                            </Badge>
                          </div>
                          <p className='text-sm text-muted-foreground mt-1'>
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Data Selection */}
          <div className='space-y-4'>
            <Label className='text-base font-medium'>Include Data</Label>

            <div className='grid grid-cols-1 gap-3'>
              {/* Analytics */}
              <div className='flex items-center space-x-3'>
                <Checkbox
                  id='analytics'
                  checked={includeAnalytics}
                  onCheckedChange={setIncludeAnalytics}
                  disabled={!availableData.hasAnalytics}
                />
                <Label htmlFor='analytics' className='flex-1 cursor-pointer'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-muted-foreground' />
                      <span>Meeting Analytics</span>
                      {!availableData.hasAnalytics && (
                        <Badge variant='outline' className='text-xs'>
                          Not Available
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className='text-sm text-muted-foreground mt-1'>
                    Duration, engagement metrics, and performance data
                  </p>
                </Label>
              </div>

              {/* Participants */}
              <div className='flex items-center space-x-3'>
                <Checkbox
                  id='participants'
                  checked={includeParticipants}
                  onCheckedChange={setIncludeParticipants}
                  disabled={!availableData.hasParticipants}
                />
                <Label htmlFor='participants' className='flex-1 cursor-pointer'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Users className='h-4 w-4 text-muted-foreground' />
                      <span>Participant Data</span>
                      {availableData.participantCount && (
                        <Badge variant='secondary' className='text-xs'>
                          {availableData.participantCount} participants
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className='text-sm text-muted-foreground mt-1'>
                    Names, join times, engagement scores, and attendance data
                  </p>
                </Label>
              </div>

              {/* Transcription */}
              <div className='flex items-center space-x-3'>
                <Checkbox
                  id='transcription'
                  checked={includeTranscription}
                  onCheckedChange={setIncludeTranscription}
                  disabled={!availableData.hasTranscription}
                />
                <Label
                  htmlFor='transcription'
                  className='flex-1 cursor-pointer'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <FileText className='h-4 w-4 text-muted-foreground' />
                      <span>Transcription</span>
                      {!availableData.hasTranscription ? (
                        <Badge variant='outline' className='text-xs'>
                          Not Available
                        </Badge>
                      ) : (
                        availableData.transcriptionLength && (
                          <Badge variant='secondary' className='text-xs'>
                            {availableData.transcriptionLength} segments
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                  <p className='text-sm text-muted-foreground mt-1'>
                    Full meeting transcription with timestamps and speakers
                  </p>
                </Label>
              </div>

              {/* Chat Messages */}
              <div className='flex items-center space-x-3'>
                <Checkbox
                  id='chat'
                  checked={includeChatMessages}
                  onCheckedChange={setIncludeChatMessages}
                  disabled={!availableData.hasChatMessages}
                />
                <Label htmlFor='chat' className='flex-1 cursor-pointer'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <MessageSquare className='h-4 w-4 text-muted-foreground' />
                      <span>Chat Messages</span>
                      {availableData.messageCount ? (
                        <Badge variant='secondary' className='text-xs'>
                          {availableData.messageCount} messages
                        </Badge>
                      ) : (
                        <Badge variant='outline' className='text-xs'>
                          No Messages
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className='text-sm text-muted-foreground mt-1'>
                    All chat messages with timestamps and sender information
                  </p>
                </Label>
              </div>

              {/* Recordings */}
              <div className='flex items-center space-x-3'>
                <Checkbox
                  id='recordings'
                  checked={includeRecordings}
                  onCheckedChange={setIncludeRecordings}
                  disabled={!availableData.hasRecordings}
                />
                <Label htmlFor='recordings' className='flex-1 cursor-pointer'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Video className='h-4 w-4 text-muted-foreground' />
                      <span>Recording Links</span>
                      {availableData.recordingCount ? (
                        <Badge variant='secondary' className='text-xs'>
                          {availableData.recordingCount} recordings
                        </Badge>
                      ) : (
                        <Badge variant='outline' className='text-xs'>
                          No Recordings
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className='text-sm text-muted-foreground mt-1'>
                    Download links and metadata for meeting recordings
                  </p>
                </Label>
              </div>
            </div>
          </div>

          {/* Export Summary */}
          {canExport && (
            <>
              <Separator />
              <div className='p-4 bg-muted rounded-lg'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='font-medium'>Export Summary</span>
                  <Badge variant='outline'>
                    {getSelectedDataCount()} data types selected
                  </Badge>
                </div>
                <div className='text-sm text-muted-foreground space-y-1'>
                  <div className='flex justify-between'>
                    <span>Format:</span>
                    <span className='font-medium'>
                      {selectedFormatOption?.label}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Estimated size:</span>
                    <span className='font-medium'>
                      {getEstimatedFileSize()}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Export Progress */}
          {isExporting && (
            <>
              <Separator />
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  {exportStatus === "complete" ? (
                    <CheckCircle className='h-4 w-4 text-green-600' />
                  ) : exportStatus === "error" ? (
                    <AlertCircle className='h-4 w-4 text-red-600' />
                  ) : (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  )}
                  <span className='font-medium'>
                    {exportStatus === "preparing" && "Preparing export..."}
                    {exportStatus === "exporting" && "Exporting data..."}
                    {exportStatus === "complete" && "Export complete!"}
                    {exportStatus === "error" && "Export failed"}
                  </span>
                </div>
                <Progress value={exportProgress} className='h-2' />
                <p className='text-sm text-muted-foreground'>
                  {exportStatus === "complete"
                    ? "Your file will download automatically."
                    : `${Math.round(exportProgress)}% complete`}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={!canExport || isExporting}
            className='flex items-center gap-2'
          >
            {isExporting ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Download className='h-4 w-4' />
            )}
            {isExporting ? "Exporting..." : "Export Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
