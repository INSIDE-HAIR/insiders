/**
 * ExportManager Component
 * Main component that manages all export and download functionality
 */
"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileText,
  Video,
  FileSpreadsheet,
  Package,
  Clock,
  Users,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { ExportDialog, type ExportOptions } from "./ExportDialog";
import { RecordingDownloader, type Recording } from "./RecordingDownloader";
import { TranscriptionExporter } from "./TranscriptionExporter";
import { formatFileSize } from "@/lib/utils";
import type {
  MeetingAnalytics,
  ParticipantData,
  TranscriptionSegment,
  ChatMessage,
} from "../../types/analytics";

interface ExportManagerProps {
  meetingId: string;
  meetingTitle: string;
  analytics?: MeetingAnalytics;
  participants: ParticipantData[];
  transcription: TranscriptionSegment[];
  chatMessages: ChatMessage[];
  recordings: Recording[];
  onExportData: (options: ExportOptions) => Promise<void>;
  onDownloadRecording: (recordingId: string, quality?: string) => Promise<void>;
  onStreamRecording: (recordingId: string) => void;
  onExportTranscription: (
    format: "txt" | "docx",
    options: any
  ) => Promise<void>;
  className?: string;
}

export function ExportManager({
  meetingId,
  meetingTitle,
  analytics,
  participants,
  transcription,
  chatMessages,
  recordings,
  onExportData,
  onDownloadRecording,
  onStreamRecording,
  onExportTranscription,
  className,
}: ExportManagerProps) {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const availableData = {
    hasAnalytics: !!analytics,
    hasParticipants: participants.length > 0,
    hasTranscription: transcription.length > 0,
    hasChatMessages: chatMessages.length > 0,
    hasRecordings: recordings.length > 0,
    participantCount: participants.length,
    messageCount: chatMessages.length,
    transcriptionLength: transcription.length,
    recordingCount: recordings.length,
  };

  const exportStats = {
    totalDataTypes: Object.values(availableData).filter(
      (v) => typeof v === "boolean" && v
    ).length,
    totalRecordings: recordings.filter((r) => r.isAvailable).length,
    totalRecordingSize: recordings.reduce((sum, r) => sum + r.fileSize, 0),
    processingRecordings: recordings.filter((r) => r.isProcessing).length,
  };

  const quickExportOptions = [
    {
      id: "complete",
      title: "Complete Export",
      description: "All available data in Excel format",
      icon: Package,
      format: "excel" as const,
      options: {
        format: "excel" as const,
        includeAnalytics: availableData.hasAnalytics,
        includeParticipants: availableData.hasParticipants,
        includeTranscription: availableData.hasTranscription,
        includeChatMessages: availableData.hasChatMessages,
        includeRecordings: false,
      },
    },
    {
      id: "analytics",
      title: "Analytics Only",
      description: "Meeting metrics and performance data",
      icon: BarChart3,
      format: "csv" as const,
      options: {
        format: "csv" as const,
        includeAnalytics: true,
        includeParticipants: true,
        includeTranscription: false,
        includeChatMessages: false,
        includeRecordings: false,
      },
    },
    {
      id: "transcription",
      title: "Transcription Only",
      description: "Meeting transcription in text format",
      icon: FileText,
      format: "txt" as const,
      options: {
        format: "csv" as const,
        includeAnalytics: false,
        includeParticipants: false,
        includeTranscription: true,
        includeChatMessages: false,
        includeRecordings: false,
      },
    },
  ];

  const handleQuickExport = async (optionId: string) => {
    const option = quickExportOptions.find((opt) => opt.id === optionId);
    if (option) {
      await onExportData(option.options);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold flex items-center gap-2'>
            <Download className='h-6 w-6' />
            Export & Downloads
          </h2>
          <p className='text-muted-foreground'>
            Export meeting data and download recordings from "{meetingTitle}"
          </p>
        </div>

        <Button
          onClick={() => setShowExportDialog(true)}
          className='flex items-center gap-2'
        >
          <Download className='h-4 w-4' />
          Custom Export
        </Button>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-blue-600'>
              {exportStats.totalDataTypes}
            </div>
            <div className='text-sm text-muted-foreground'>Data Types</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {exportStats.totalRecordings}
            </div>
            <div className='text-sm text-muted-foreground'>
              Available Recordings
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-purple-600'>
              {formatFileSize(exportStats.totalRecordingSize)}
            </div>
            <div className='text-sm text-muted-foreground'>Total Size</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-orange-600'>
              {exportStats.processingRecordings}
            </div>
            <div className='text-sm text-muted-foreground'>Processing</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {quickExportOptions.map((option) => (
              <div
                key={option.id}
                className='border rounded-lg p-4 hover:bg-muted/50 transition-colors'
              >
                <div className='flex items-start gap-3 mb-3'>
                  <option.icon className='h-5 w-5 text-muted-foreground mt-0.5' />
                  <div className='flex-1'>
                    <h3 className='font-medium'>{option.title}</h3>
                    <p className='text-sm text-muted-foreground'>
                      {option.description}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => handleQuickExport(option.id)}
                  className='w-full'
                  variant='outline'
                >
                  <Download className='h-4 w-4 mr-2' />
                  Export {option.format.toUpperCase()}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview' className='flex items-center gap-2'>
            <Package className='h-4 w-4' />
            Overview
          </TabsTrigger>
          <TabsTrigger value='recordings' className='flex items-center gap-2'>
            <Video className='h-4 w-4' />
            Recordings
            <Badge variant='secondary' className='ml-1'>
              {recordings.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value='transcription'
            className='flex items-center gap-2'
          >
            <FileText className='h-4 w-4' />
            Transcription
            {!availableData.hasTranscription && (
              <Badge variant='outline' className='ml-1'>
                N/A
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value='data' className='flex items-center gap-2'>
            <FileSpreadsheet className='h-4 w-4' />
            Data Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Available Data */}
            <Card>
              <CardHeader>
                <CardTitle>Available Data</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <BarChart3 className='h-4 w-4 text-muted-foreground' />
                    <span>Meeting Analytics</span>
                  </div>
                  <Badge
                    variant={availableData.hasAnalytics ? "default" : "outline"}
                  >
                    {availableData.hasAnalytics ? "Available" : "N/A"}
                  </Badge>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Users className='h-4 w-4 text-muted-foreground' />
                    <span>Participant Data</span>
                  </div>
                  <Badge
                    variant={
                      availableData.hasParticipants ? "default" : "outline"
                    }
                  >
                    {availableData.hasParticipants
                      ? `${participants.length} participants`
                      : "N/A"}
                  </Badge>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <FileText className='h-4 w-4 text-muted-foreground' />
                    <span>Transcription</span>
                  </div>
                  <Badge
                    variant={
                      availableData.hasTranscription ? "default" : "outline"
                    }
                  >
                    {availableData.hasTranscription
                      ? `${transcription.length} segments`
                      : "N/A"}
                  </Badge>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <MessageSquare className='h-4 w-4 text-muted-foreground' />
                    <span>Chat Messages</span>
                  </div>
                  <Badge
                    variant={
                      availableData.hasChatMessages ? "default" : "outline"
                    }
                  >
                    {availableData.hasChatMessages
                      ? `${chatMessages.length} messages`
                      : "N/A"}
                  </Badge>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Video className='h-4 w-4 text-muted-foreground' />
                    <span>Recordings</span>
                  </div>
                  <Badge
                    variant={
                      availableData.hasRecordings ? "default" : "outline"
                    }
                  >
                    {availableData.hasRecordings
                      ? `${recordings.length} recordings`
                      : "N/A"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Export History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Exports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-center py-8'>
                  <Clock className='h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50' />
                  <p className='text-muted-foreground'>No recent exports</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='recordings' className='space-y-6'>
          <RecordingDownloader
            recordings={recordings}
            meetingTitle={meetingTitle}
            onDownload={onDownloadRecording}
            onStream={onStreamRecording}
          />
        </TabsContent>

        <TabsContent value='transcription' className='space-y-6'>
          <TranscriptionExporter
            transcription={transcription}
            meetingTitle={meetingTitle}
            onExport={onExportTranscription}
          />
        </TabsContent>

        <TabsContent value='data' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Data Export Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8'>
                <FileSpreadsheet className='h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50' />
                <h3 className='text-lg font-semibold mb-2'>
                  Custom Data Export
                </h3>
                <p className='text-muted-foreground mb-4'>
                  Use the Custom Export button to configure your data export
                  options.
                </p>
                <Button
                  onClick={() => setShowExportDialog(true)}
                  className='flex items-center gap-2'
                >
                  <Download className='h-4 w-4' />
                  Open Custom Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onExport={onExportData}
        meetingTitle={meetingTitle}
        availableData={availableData}
      />
    </div>
  );
}
