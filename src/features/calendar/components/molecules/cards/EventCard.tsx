"use client";

import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { 
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  MapPinIcon,
  VideoCameraIcon
} from "@heroicons/react/24/outline";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import { EventStatus, ResponseStatus } from "../../atoms/badges";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface EventCardProps {
  event: GoogleCalendarEvent;
  onClick?: () => void;
  showCalendar?: boolean;
  showAttendees?: boolean;
  compact?: boolean;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onClick,
  showCalendar = true,
  showAttendees = true,
  compact = false,
  className = "",
}) => {
  const getEventDuration = () => {
    if (!event.start?.dateTime || !event.end?.dateTime) return null;
    
    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      const diffMinutes = Math.round(diffHours * 60);
      return `${diffMinutes}m`;
    }
    
    return `${diffHours}h`;
  };

  const getFormattedDate = () => {
    if (!event.start?.dateTime) return null;
    
    const date = new Date(event.start.dateTime);
    return format(date, "dd MMM yyyy, HH:mm", { locale: es });
  };

  const attendeesCount = event.attendees?.length || 0;
  const acceptedCount = event.attendees?.filter(a => a.responseStatus === 'accepted').length || 0;

  const hasVideoConference = event.conferenceData?.conferenceSolution?.name;

  return (
    <div
      className={`bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-card-foreground text-sm truncate">
            {event.summary || 'Sin título'}
          </h3>
          {event.description && !compact && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          <EventStatus 
            status={event.status as any || 'confirmed'} 
            size="sm"
            showIcon={!compact}
          />
        </div>
      </div>

      {/* Fecha y duración */}
      <div className="flex items-center gap-2 mb-2">
        <ClockIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground">
            {getFormattedDate()}
          </div>
          {getEventDuration() && (
            <div className="text-xs text-muted-foreground">
              Duración: {getEventDuration()}
            </div>
          )}
        </div>
      </div>

      {/* Ubicación */}
      {event.location && (
        <div className="flex items-center gap-2 mb-2">
          <MapPinIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            {event.location}
          </span>
        </div>
      )}

      {/* Video conferencia */}
      {hasVideoConference && (
        <div className="flex items-center gap-2 mb-2">
          <VideoCameraIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <span className="text-xs text-blue-600">
            {event.conferenceData?.conferenceSolution?.name}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        {/* Asistentes */}
        {showAttendees && attendeesCount > 0 && (
          <div className="flex items-center gap-1">
            <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {acceptedCount}/{attendeesCount}
            </span>
            {!compact && (
              <span className="text-xs text-muted-foreground">asistentes</span>
            )}
          </div>
        )}

        {/* Calendario */}
        {showCalendar && event.organizer?.email && (
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
              {event.organizer.displayName || event.organizer.email.split('@')[0]}
            </span>
          </div>
        )}
      </div>

      {/* Respuesta del usuario actual */}
      {event.attendees?.find(a => a.self) && (
        <div className="mt-2 pt-2 border-t border-border">
          <ResponseStatus
            status={event.attendees.find(a => a.self)?.responseStatus as any || 'needsAction'}
            size="sm"
            showIcon={!compact}
          />
        </div>
      )}
    </div>
  );
};

// Loading skeleton
export const EventCardSkeleton: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className="bg-card border border-border rounded-lg p-4 animate-pulse">
    {/* Header */}
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        {!compact && <div className="h-3 bg-muted rounded w-full" />}
      </div>
      <div className="h-5 w-16 bg-muted rounded ml-2" />
    </div>

    {/* Fecha */}
    <div className="flex items-center gap-2 mb-2">
      <div className="h-4 w-4 bg-muted rounded" />
      <div className="h-3 bg-muted rounded w-1/2" />
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between mt-3">
      <div className="h-3 bg-muted rounded w-1/4" />
      <div className="h-3 bg-muted rounded w-1/4" />
    </div>
  </div>
);