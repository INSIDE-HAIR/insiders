/**
 * CalendarIntegration Component
 * Provides calendar integration with copy buttons and manual tracking
 */
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Copy,
  Check,
  Clock,
  MapPin,
  FileText,
  Users,
  Link,
  Download,
  Plus,
  ExternalLink,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import type { VideoSpace } from "../../types";

interface CalendarIntegrationProps {
  videoSpace: VideoSpace;
  className?: string;
  onTrackingUpdate?: (isAdded: boolean) => void;
}

interface CalendarEvent {
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
  description: string;
  attendees?: string[];
}

export function CalendarIntegration({
  videoSpace,
  className,
  onTrackingUpdate,
}: CalendarIntegrationProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isAddedToCalendar, setIsAddedToCalendar] = useState(false);
  const [customDescription, setCustomDescription] = useState("");

  // Generate calendar event data
  const calendarEvent: CalendarEvent = {
    title: videoSpace.title,
    startTime: videoSpace.scheduledStartTime || new Date(),
    endTime:
      videoSpace.scheduledEndTime || new Date(Date.now() + 60 * 60 * 1000), // 1 hour default
    location: videoSpace.meetingUrl || "",
    description: generateEventDescription(videoSpace, customDescription),
    attendees:
      videoSpace.participants?.map((p) => p.email).filter(Boolean) || [],
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const handleCalendarTracking = (checked: boolean) => {
    setIsAddedToCalendar(checked);
    onTrackingUpdate?.(checked);
  };

  const generateICSFile = () => {
    const ics = generateICSContent(calendarEvent);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${videoSpace.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const generateGoogleCalendarUrl = () => {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: calendarEvent.title,
      dates: `${formatDateForGoogle(calendarEvent.startTime)}/${formatDateForGoogle(calendarEvent.endTime)}`,
      details: calendarEvent.description,
      location: calendarEvent.location,
      add: calendarEvent.attendees?.join(",") || "",
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const generateOutlookUrl = () => {
    const params = new URLSearchParams({
      subject: calendarEvent.title,
      startdt: calendarEvent.startTime.toISOString(),
      enddt: calendarEvent.endTime.toISOString(),
      body: calendarEvent.description,
      location: calendarEvent.location,
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Calendar className='h-5 w-5' />
          Calendar Integration
          {isAddedToCalendar && (
            <Badge variant='default' className='ml-2'>
              <Check className='h-3 w-3 mr-1' />
              Added
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Event Details */}
        <div className='space-y-4'>
          <div>
            <label className='text-sm font-medium mb-2 block'>
              Event Title
            </label>
            <div className='flex items-center gap-2'>
              <div className='flex-1 p-2 bg-muted rounded border text-sm'>
                {calendarEvent.title}
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => copyToClipboard(calendarEvent.title, "title")}
                className='flex items-center gap-2'
              >
                {copiedField === "title" ? (
                  <Check className='h-4 w-4' />
                ) : (
                  <Copy className='h-4 w-4' />
                )}
                Copy
              </Button>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium mb-2 block flex items-center gap-2'>
                <Clock className='h-4 w-4' />
                Start Time
              </label>
              <div className='flex items-center gap-2'>
                <div className='flex-1 p-2 bg-muted rounded border text-sm'>
                  {formatDate(calendarEvent.startTime)} at{" "}
                  {formatTime(calendarEvent.startTime)}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    copyToClipboard(
                      `${formatDate(calendarEvent.startTime)} at ${formatTime(calendarEvent.startTime)}`,
                      "startTime"
                    )
                  }
                >
                  {copiedField === "startTime" ? (
                    <Check className='h-4 w-4' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className='text-sm font-medium mb-2 block flex items-center gap-2'>
                <Clock className='h-4 w-4' />
                End Time
              </label>
              <div className='flex items-center gap-2'>
                <div className='flex-1 p-2 bg-muted rounded border text-sm'>
                  {formatDate(calendarEvent.endTime)} at{" "}
                  {formatTime(calendarEvent.endTime)}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    copyToClipboard(
                      `${formatDate(calendarEvent.endTime)} at ${formatTime(calendarEvent.endTime)}`,
                      "endTime"
                    )
                  }
                >
                  {copiedField === "endTime" ? (
                    <Check className='h-4 w-4' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div>
            <label className='text-sm font-medium mb-2 block flex items-center gap-2'>
              <MapPin className='h-4 w-4' />
              Location / Meeting URL
            </label>
            <div className='flex items-center gap-2'>
              <div className='flex-1 p-2 bg-muted rounded border text-sm break-all'>
                {calendarEvent.location}
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  copyToClipboard(calendarEvent.location, "location")
                }
                className='flex items-center gap-2'
              >
                {copiedField === "location" ? (
                  <Check className='h-4 w-4' />
                ) : (
                  <Copy className='h-4 w-4' />
                )}
                Copy Location
              </Button>
            </div>
          </div>

          <div>
            <label className='text-sm font-medium mb-2 block flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              Event Description
            </label>
            <div className='space-y-2'>
              <Textarea
                placeholder='Add custom description (optional)...'
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className='min-h-[80px]'
              />
              <div className='flex items-center gap-2'>
                <div className='flex-1 p-2 bg-muted rounded border text-sm max-h-32 overflow-y-auto'>
                  <pre className='whitespace-pre-wrap text-xs'>
                    {calendarEvent.description}
                  </pre>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    copyToClipboard(calendarEvent.description, "description")
                  }
                  className='flex items-center gap-2'
                >
                  {copiedField === "description" ? (
                    <Check className='h-4 w-4' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                  Copy Description
                </Button>
              </div>
            </div>
          </div>

          {calendarEvent.attendees && calendarEvent.attendees.length > 0 && (
            <div>
              <label className='text-sm font-medium mb-2 block flex items-center gap-2'>
                <Users className='h-4 w-4' />
                Attendees ({calendarEvent.attendees.length})
              </label>
              <div className='flex items-center gap-2'>
                <div className='flex-1 p-2 bg-muted rounded border text-sm max-h-20 overflow-y-auto'>
                  {calendarEvent.attendees.join(", ")}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    copyToClipboard(
                      calendarEvent.attendees!.join(", "),
                      "attendees"
                    )
                  }
                >
                  {copiedField === "attendees" ? (
                    <Check className='h-4 w-4' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className='space-y-4'>
          <h3 className='text-sm font-medium'>Quick Add to Calendar</h3>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
            <Button
              variant='outline'
              onClick={() => window.open(generateGoogleCalendarUrl(), "_blank")}
              className='flex items-center gap-2'
            >
              <ExternalLink className='h-4 w-4' />
              Google Calendar
            </Button>

            <Button
              variant='outline'
              onClick={() => window.open(generateOutlookUrl(), "_blank")}
              className='flex items-center gap-2'
            >
              <ExternalLink className='h-4 w-4' />
              Outlook
            </Button>

            <Button
              variant='outline'
              onClick={generateICSFile}
              className='flex items-center gap-2'
            >
              <Download className='h-4 w-4' />
              Download .ics
            </Button>
          </div>
        </div>

        <Separator />

        {/* Manual Tracking */}
        <div className='space-y-4'>
          <h3 className='text-sm font-medium'>Manual Tracking</h3>

          <div className='flex items-center space-x-2'>
            <Checkbox
              id='calendar-added'
              checked={isAddedToCalendar}
              onCheckedChange={handleCalendarTracking}
            />
            <label
              htmlFor='calendar-added'
              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              I have added this event to my calendar
            </label>
          </div>

          {isAddedToCalendar && (
            <div className='p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
              <div className='flex items-center gap-2 text-green-700 dark:text-green-300'>
                <Check className='h-4 w-4' />
                <span className='text-sm font-medium'>
                  Event tracked as added to calendar
                </span>
              </div>
              <p className='text-xs text-green-600 dark:text-green-400 mt-1'>
                You'll receive reminders based on your calendar settings.
              </p>
            </div>
          )}
        </div>

        {/* Provider Info */}
        <div className='pt-4 border-t'>
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <Badge variant='outline' className='capitalize'>
                {videoSpace.provider}
              </Badge>
              <span>Meeting Platform</span>
            </div>
            <div className='flex items-center gap-1'>
              <Link className='h-3 w-3' />
              <span>Integration Ready</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
function generateEventDescription(
  videoSpace: VideoSpace,
  customDescription: string
): string {
  const parts = [];

  if (customDescription.trim()) {
    parts.push(customDescription.trim());
    parts.push("");
  }

  parts.push(`Video Conference: ${videoSpace.title}`);

  if (videoSpace.description) {
    parts.push("");
    parts.push("Description:");
    parts.push(videoSpace.description);
  }

  parts.push("");
  parts.push("Meeting Details:");
  parts.push(`Platform: ${videoSpace.provider}`);
  parts.push(`Meeting URL: ${videoSpace.meetingUrl}`);

  if (videoSpace.meetingId) {
    parts.push(`Meeting ID: ${videoSpace.meetingId}`);
  }

  if (videoSpace.passcode) {
    parts.push(`Passcode: ${videoSpace.passcode}`);
  }

  parts.push("");
  parts.push(
    "Join the meeting using the URL above or the meeting platform app."
  );

  return parts.join("\n");
}

function generateICSContent(event: CalendarEvent): string {
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const escapeICSText = (text: string) => {
    return text.replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Video Conferencing Platform//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@videoconferencing.platform`,
    `DTSTART:${formatICSDate(event.startTime)}`,
    `DTEND:${formatICSDate(event.endTime)}`,
    `SUMMARY:${escapeICSText(event.title)}`,
    `DESCRIPTION:${escapeICSText(event.description)}`,
    `LOCATION:${escapeICSText(event.location)}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return icsContent.join("\r\n");
}

function formatDateForGoogle(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}
