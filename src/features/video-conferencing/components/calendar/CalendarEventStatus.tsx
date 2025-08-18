/**
 * CalendarEventStatus Component
 * Shows the status of calendar events and reminders
 */
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  Bell,
  BellOff,
  CheckCircle,
  AlertCircle,
  Users,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import type { VideoSpace } from "../../types";

interface CalendarEventStatusProps {
  videoSpace: VideoSpace;
  className?: string;
  onRefresh?: () => void;
}

interface CalendarEventInfo {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: "upcoming" | "in-progress" | "completed" | "cancelled";
  attendeeCount: number;
  confirmedAttendees: number;
  remindersSet: boolean;
  lastUpdated: Date;
}

export function CalendarEventStatus({
  videoSpace,
  className,
  onRefresh,
}: CalendarEventStatusProps) {
  const [eventInfo, setEventInfo] = useState<CalendarEventInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeUntilMeeting, setTimeUntilMeeting] = useState<string>("");

  // Mock event info - in real implementation, this would come from API
  useEffect(() => {
    const mockEventInfo: CalendarEventInfo = {
      id: `cal-${videoSpace.id}`,
      title: videoSpace.title,
      startTime: videoSpace.scheduledStartTime || new Date(),
      endTime:
        videoSpace.scheduledEndTime || new Date(Date.now() + 60 * 60 * 1000),
      status: getEventStatus(videoSpace.scheduledStartTime),
      attendeeCount: videoSpace.participants?.length || 0,
      confirmedAttendees: Math.floor(
        (videoSpace.participants?.length || 0) * 0.8
      ),
      remindersSet: true,
      lastUpdated: new Date(),
    };

    setEventInfo(mockEventInfo);
  }, [videoSpace]);

  // Update countdown timer
  useEffect(() => {
    if (!eventInfo) return;

    const updateCountdown = () => {
      const now = new Date();
      const timeDiff = eventInfo.startTime.getTime() - now.getTime();

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeUntilMeeting(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeUntilMeeting(`${hours}h ${minutes}m`);
        } else {
          setTimeUntilMeeting(`${minutes}m`);
        }
      } else {
        setTimeUntilMeeting("Meeting started");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [eventInfo]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await onRefresh?.();
      // Update last updated time
      if (eventInfo) {
        setEventInfo((prev) =>
          prev ? { ...prev, lastUpdated: new Date() } : null
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500";
      case "in-progress":
        return "bg-green-500";
      case "completed":
        return "bg-gray-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Clock className='h-4 w-4' />;
      case "in-progress":
        return <CheckCircle className='h-4 w-4' />;
      case "completed":
        return <CheckCircle className='h-4 w-4' />;
      case "cancelled":
        return <AlertCircle className='h-4 w-4' />;
      default:
        return <Clock className='h-4 w-4' />;
    }
  };

  const attendanceRate = eventInfo
    ? (eventInfo.confirmedAttendees / eventInfo.attendeeCount) * 100
    : 0;

  if (!eventInfo) {
    return (
      <Card className={className}>
        <CardContent className='p-6 text-center'>
          <Calendar className='h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50' />
          <p className='text-muted-foreground'>
            No calendar event information available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Calendar Event Status
          </CardTitle>

          <div className='flex items-center gap-2'>
            <Badge variant='outline' className='flex items-center gap-1'>
              {getStatusIcon(eventInfo.status)}
              <span className='capitalize'>{eventInfo.status}</span>
            </Badge>

            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              disabled={isLoading}
              className='flex items-center gap-2'
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Event Overview */}
        <div className='space-y-4'>
          <div>
            <h3 className='font-semibold text-lg'>{eventInfo.title}</h3>
            <div className='flex items-center gap-4 text-sm text-muted-foreground mt-1'>
              <div className='flex items-center gap-1'>
                <Clock className='h-4 w-4' />
                <span>
                  {formatDate(eventInfo.startTime)} at{" "}
                  {formatTime(eventInfo.startTime)}
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <MapPin className='h-4 w-4' />
                <span className='capitalize'>
                  {videoSpace.provider} Meeting
                </span>
              </div>
            </div>
          </div>

          {/* Countdown */}
          {eventInfo.status === "upcoming" && (
            <div className='p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium text-blue-900 dark:text-blue-100'>
                    Meeting starts in
                  </p>
                  <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                    {timeUntilMeeting}
                  </p>
                </div>
                <Clock className='h-8 w-8 text-blue-500' />
              </div>
            </div>
          )}

          {/* In Progress */}
          {eventInfo.status === "in-progress" && (
            <div className='p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
              <div className='flex items-center gap-2'>
                <div
                  className={`w-3 h-3 rounded-full ${getStatusColor(eventInfo.status)} animate-pulse`}
                />
                <p className='font-medium text-green-900 dark:text-green-100'>
                  Meeting is currently in progress
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Attendee Information */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h4 className='font-medium flex items-center gap-2'>
              <Users className='h-4 w-4' />
              Attendees
            </h4>
            <span className='text-sm text-muted-foreground'>
              {eventInfo.confirmedAttendees} of {eventInfo.attendeeCount}{" "}
              confirmed
            </span>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span>Confirmation Rate</span>
              <span className='font-medium'>{Math.round(attendanceRate)}%</span>
            </div>
            <Progress value={attendanceRate} className='h-2' />
          </div>

          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div className='text-center p-2 bg-muted rounded'>
              <div className='font-semibold text-green-600'>
                {eventInfo.confirmedAttendees}
              </div>
              <div className='text-muted-foreground'>Confirmed</div>
            </div>
            <div className='text-center p-2 bg-muted rounded'>
              <div className='font-semibold text-orange-600'>
                {eventInfo.attendeeCount - eventInfo.confirmedAttendees}
              </div>
              <div className='text-muted-foreground'>Pending</div>
            </div>
          </div>
        </div>

        {/* Reminders */}
        <div className='space-y-3'>
          <h4 className='font-medium flex items-center gap-2'>
            {eventInfo.remindersSet ? (
              <Bell className='h-4 w-4 text-green-600' />
            ) : (
              <BellOff className='h-4 w-4 text-muted-foreground' />
            )}
            Reminders
          </h4>

          {eventInfo.remindersSet ? (
            <div className='p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
              <div className='flex items-center gap-2 text-green-700 dark:text-green-300'>
                <CheckCircle className='h-4 w-4' />
                <span className='text-sm font-medium'>
                  Reminders are active
                </span>
              </div>
              <p className='text-xs text-green-600 dark:text-green-400 mt-1'>
                You'll receive notifications before the meeting starts.
              </p>
            </div>
          ) : (
            <div className='p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg'>
              <div className='flex items-center gap-2 text-orange-700 dark:text-orange-300'>
                <AlertCircle className='h-4 w-4' />
                <span className='text-sm font-medium'>No reminders set</span>
              </div>
              <p className='text-xs text-orange-600 dark:text-orange-400 mt-1'>
                Consider setting up calendar reminders for this meeting.
              </p>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className='pt-4 border-t text-xs text-muted-foreground'>
          <div className='flex items-center justify-between'>
            <span>Last updated: {formatTime(eventInfo.lastUpdated)}</span>
            <div className='flex items-center gap-1'>
              <div className='w-2 h-2 bg-green-500 rounded-full' />
              <span>Synced</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function
function getEventStatus(
  scheduledStartTime?: Date
): "upcoming" | "in-progress" | "completed" | "cancelled" {
  if (!scheduledStartTime) return "upcoming";

  const now = new Date();
  const startTime = new Date(scheduledStartTime);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Assume 1 hour duration

  if (now < startTime) {
    return "upcoming";
  } else if (now >= startTime && now <= endTime) {
    return "in-progress";
  } else {
    return "completed";
  }
}
