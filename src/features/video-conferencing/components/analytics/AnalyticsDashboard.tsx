/**
 * AnalyticsDashboard Component
 * Main dashboard that combines all analytics components
 */
"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  MessageSquare,
  FileText,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  TrendingUp,
} from "lucide-react";
import { MeetingAnalytics } from "./MeetingAnalytics";
import { ParticipantList } from "./ParticipantList";
import { TranscriptionViewer } from "./TranscriptionViewer";
import { ChatViewer } from "./ChatViewer";
import { formatDuration, formatDate } from "@/lib/utils";
import type {
  MeetingAnalytics as MeetingAnalyticsType,
  ParticipantData,
  TranscriptionSegment,
  ChatMessage,
  AnalyticsExportOptions,
} from "../../types/analytics";

interface AnalyticsDashboardProps {
  meetingId: string;
  analytics: MeetingAnalyticsType;
  participants: ParticipantData[];
  transcription: TranscriptionSegment[];
  chatMessages: ChatMessage[];
  onRefresh?: () => void;
  onExport?: (options: AnalyticsExportOptions) => void;
  className?: string;
}

export function AnalyticsDashboard({
  meetingId,
  analytics,
  participants,
  transcription,
  chatMessages,
  onRefresh,
  onExport,
  className,
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (!onExport) return;

    const options: AnalyticsExportOptions = {
      format,
      includeTranscription: transcription.length > 0,
      includeChatMessages: chatMessages.length > 0,
      includeParticipantDetails: true,
    };

    onExport(options);
  };

  const handleTranscriptionExport = (format: "txt" | "docx") => {
    if (!onExport) return;

    const options: AnalyticsExportOptions = {
      format: format === "txt" ? "csv" : "excel", // Map to available formats
      includeTranscription: true,
      includeChatMessages: false,
      includeParticipantDetails: false,
    };

    onExport(options);
  };

  const handleChatExport = (format: "txt" | "csv") => {
    if (!onExport) return;

    const options: AnalyticsExportOptions = {
      format: format === "txt" ? "csv" : "csv",
      includeTranscription: false,
      includeChatMessages: true,
      includeParticipantDetails: false,
    };

    onExport(options);
  };

  const quickStats = {
    totalParticipants: participants.length,
    activeParticipants: participants.filter((p) => p.isActive).length,
    averageEngagement: Math.round(
      participants.reduce((sum, p) => sum + p.engagementScore, 0) /
        participants.length
    ),
    totalMessages: chatMessages.length,
    transcriptionSegments: transcription.length,
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Meeting Analytics</h1>
          <p className='text-muted-foreground'>
            {analytics.title} • {formatDate(analytics.startTime)}
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={isRefreshing}
            className='flex items-center gap-2'
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          {onExport && (
            <div className='flex gap-1'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleExport("csv")}
                className='flex items-center gap-2'
              >
                <Download className='h-4 w-4' />
                CSV
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleExport("excel")}
                className='flex items-center gap-2'
              >
                <Download className='h-4 w-4' />
                Excel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm font-medium'>
                  {formatDuration(analytics.duration)}
                </p>
                <p className='text-xs text-muted-foreground'>Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm font-medium'>
                  {quickStats.activeParticipants}/{quickStats.totalParticipants}
                </p>
                <p className='text-xs text-muted-foreground'>Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm font-medium'>
                  {quickStats.averageEngagement}%
                </p>
                <p className='text-xs text-muted-foreground'>Engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <MessageSquare className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm font-medium'>
                  {quickStats.totalMessages}
                </p>
                <p className='text-xs text-muted-foreground'>Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <FileText className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm font-medium'>
                  {quickStats.transcriptionSegments}
                </p>
                <p className='text-xs text-muted-foreground'>Transcription</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'
      >
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview' className='flex items-center gap-2'>
            <BarChart3 className='h-4 w-4' />
            Overview
          </TabsTrigger>
          <TabsTrigger value='participants' className='flex items-center gap-2'>
            <Users className='h-4 w-4' />
            Participants
            <Badge variant='secondary' className='ml-1'>
              {participants.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value='transcription'
            className='flex items-center gap-2'
          >
            <FileText className='h-4 w-4' />
            Transcription
            {transcription.length === 0 && (
              <Badge variant='outline' className='ml-1'>
                N/A
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value='chat' className='flex items-center gap-2'>
            <MessageSquare className='h-4 w-4' />
            Chat
            <Badge variant='secondary' className='ml-1'>
              {chatMessages.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <MeetingAnalytics analytics={analytics} />
        </TabsContent>

        <TabsContent value='participants' className='space-y-6'>
          <ParticipantList
            participants={participants}
            showFilters={true}
            maxHeight='700px'
          />
        </TabsContent>

        <TabsContent value='transcription' className='space-y-6'>
          {transcription.length > 0 ? (
            <TranscriptionViewer
              transcription={transcription}
              meetingTitle={analytics.title}
              onExport={handleTranscriptionExport}
              searchable={true}
              showTimestamps={true}
              showSpeakers={true}
            />
          ) : (
            <Card>
              <CardContent className='p-12 text-center'>
                <FileText className='h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50' />
                <h3 className='text-lg font-semibold mb-2'>
                  No Transcription Available
                </h3>
                <p className='text-muted-foreground mb-4'>
                  Transcription was not enabled or available for this meeting.
                </p>
                <Badge variant='outline'>Provider: {analytics.provider}</Badge>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='chat' className='space-y-6'>
          {chatMessages.length > 0 ? (
            <ChatViewer
              messages={chatMessages}
              onExport={handleChatExport}
              searchable={true}
              showTimestamps={true}
              maxHeight='700px'
            />
          ) : (
            <Card>
              <CardContent className='p-12 text-center'>
                <MessageSquare className='h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50' />
                <h3 className='text-lg font-semibold mb-2'>No Chat Messages</h3>
                <p className='text-muted-foreground mb-4'>
                  No chat messages were sent during this meeting.
                </p>
                <Badge variant='outline'>
                  Duration: {formatDuration(analytics.duration)}
                </Badge>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
