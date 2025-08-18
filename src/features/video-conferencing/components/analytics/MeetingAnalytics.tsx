/**
 * MeetingAnalytics Component
 * Displays comprehensive metrics for meeting analytics
 */
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Users,
  MessageSquare,
  FileText,
  TrendingUp,
  Calendar,
  Video,
  Mic,
  MicOff,
  VideoOff,
} from "lucide-react";
import { formatDuration, formatDate } from "@/lib/utils";
import type { MeetingAnalytics as MeetingAnalyticsType } from "../../types/analytics";

interface MeetingAnalyticsProps {
  analytics: MeetingAnalyticsType;
  className?: string;
}

export function MeetingAnalytics({
  analytics,
  className,
}: MeetingAnalyticsProps) {
  const {
    meetingId,
    title,
    provider,
    startTime,
    endTime,
    duration,
    participantCount,
    maxConcurrentParticipants,
    averageParticipants,
    participantEngagement,
    chatMessages,
    transcriptionAvailable,
    recordingAvailable,
    participantStats,
    engagementMetrics,
    technicalMetrics,
  } = analytics;

  const engagementScore = Math.round(
    participantEngagement.averageEngagementScore * 100
  );
  const attendanceRate = Math.round(
    (participantCount /
      (participantStats?.expectedParticipants || participantCount)) *
      100
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Meeting Overview */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <Video className='h-5 w-5' />
              Meeting Overview
            </CardTitle>
            <Badge variant='outline' className='capitalize'>
              {provider}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <h3 className='font-semibold text-lg'>{title}</h3>
            <p className='text-sm text-muted-foreground'>ID: {meetingId}</p>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm font-medium'>{formatDate(startTime)}</p>
                <p className='text-xs text-muted-foreground'>Start Date</p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm font-medium'>
                  {formatDuration(duration)}
                </p>
                <p className='text-xs text-muted-foreground'>Duration</p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm font-medium'>{participantCount}</p>
                <p className='text-xs text-muted-foreground'>
                  Total Participants
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm font-medium'>
                  {maxConcurrentParticipants}
                </p>
                <p className='text-xs text-muted-foreground'>Peak Concurrent</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Metrics</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Overall Engagement</span>
                <span className='text-sm text-muted-foreground'>
                  {engagementScore}%
                </span>
              </div>
              <Progress value={engagementScore} className='h-2' />
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Attendance Rate</span>
                <span className='text-sm text-muted-foreground'>
                  {attendanceRate}%
                </span>
              </div>
              <Progress value={attendanceRate} className='h-2' />
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>
                  Average Participants
                </span>
                <span className='text-sm text-muted-foreground'>
                  {Math.round(averageParticipants)}
                </span>
              </div>
              <Progress
                value={(averageParticipants / maxConcurrentParticipants) * 100}
                className='h-2'
              />
            </div>
          </div>

          <Separator />

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {participantEngagement.activeParticipants}
              </div>
              <p className='text-sm text-muted-foreground'>
                Active Participants
              </p>
            </div>

            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {Math.round(participantEngagement.averageAttentionTime / 60)}m
              </div>
              <p className='text-sm text-muted-foreground'>
                Avg Attention Time
              </p>
            </div>

            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>
                {participantEngagement.interactionCount}
              </div>
              <p className='text-sm text-muted-foreground'>Interactions</p>
            </div>

            <div className='text-center'>
              <div className='text-2xl font-bold text-orange-600'>
                {chatMessages.totalMessages}
              </div>
              <p className='text-sm text-muted-foreground'>Chat Messages</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Metrics */}
      {technicalMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Technical Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='flex items-center gap-2'>
                <Mic className='h-4 w-4 text-green-600' />
                <div>
                  <p className='text-sm font-medium'>
                    {technicalMetrics.audioQuality.averageScore}%
                  </p>
                  <p className='text-xs text-muted-foreground'>Audio Quality</p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Video className='h-4 w-4 text-blue-600' />
                <div>
                  <p className='text-sm font-medium'>
                    {technicalMetrics.videoQuality.averageScore}%
                  </p>
                  <p className='text-xs text-muted-foreground'>Video Quality</p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <MicOff className='h-4 w-4 text-red-600' />
                <div>
                  <p className='text-sm font-medium'>
                    {technicalMetrics.audioIssues}
                  </p>
                  <p className='text-xs text-muted-foreground'>Audio Issues</p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <VideoOff className='h-4 w-4 text-red-600' />
                <div>
                  <p className='text-sm font-medium'>
                    {technicalMetrics.videoIssues}
                  </p>
                  <p className='text-xs text-muted-foreground'>Video Issues</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Available Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-2'>
            <Badge variant={recordingAvailable ? "default" : "secondary"}>
              <Video className='h-3 w-3 mr-1' />
              Recording {recordingAvailable ? "Available" : "Not Available"}
            </Badge>

            <Badge variant={transcriptionAvailable ? "default" : "secondary"}>
              <FileText className='h-3 w-3 mr-1' />
              Transcription{" "}
              {transcriptionAvailable ? "Available" : "Not Available"}
            </Badge>

            <Badge
              variant={chatMessages.totalMessages > 0 ? "default" : "secondary"}
            >
              <MessageSquare className='h-3 w-3 mr-1' />
              Chat Messages ({chatMessages.totalMessages})
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Participant Statistics */}
      {participantStats && (
        <Card>
          <CardHeader>
            <CardTitle>Participant Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='text-center'>
                <div className='text-lg font-semibold'>
                  {participantStats.joinedOnTime}
                </div>
                <p className='text-sm text-muted-foreground'>Joined On Time</p>
              </div>

              <div className='text-center'>
                <div className='text-lg font-semibold'>
                  {participantStats.joinedLate}
                </div>
                <p className='text-sm text-muted-foreground'>Joined Late</p>
              </div>

              <div className='text-center'>
                <div className='text-lg font-semibold'>
                  {participantStats.leftEarly}
                </div>
                <p className='text-sm text-muted-foreground'>Left Early</p>
              </div>

              <div className='text-center'>
                <div className='text-lg font-semibold'>
                  {Math.round(participantStats.averageAttendanceTime / 60)}m
                </div>
                <p className='text-sm text-muted-foreground'>Avg Attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
