"use client";

import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { Icons } from "@/src/components/shared/icons";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";

interface SelectionIndicatorProps {
  selectedEvents: GoogleCalendarEvent[];
  onClearSelection: () => void;
}

export const SelectionIndicator: React.FC<SelectionIndicatorProps> = ({
  selectedEvents,
  onClearSelection,
}) => {
  if (selectedEvents.length === 0) return null;

  // Analizar los eventos seleccionados
  const stats = {
    total: selectedEvents.length,
    withMeet: selectedEvents.filter((e) => e.hangoutLink || e.conferenceData)
      .length,
    withLocation: selectedEvents.filter((e) => e.location).length,
    withAttendees: selectedEvents.filter(
      (e) => e.attendees && e.attendees.length > 0
    ).length,
    withDescription: selectedEvents.filter((e) => e.description).length,
    upcoming: selectedEvents.filter((e) => {
      const start = new Date(e.start?.dateTime || e.start?.date || "");
      return start > new Date();
    }).length,
  };

  return (
    <div className='bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        {/* Selection Info */}
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <Badge
              variant='default'
              className='bg-primary text-primary-foreground'
            >
              {selectedEvents.length} evento
              {selectedEvents.length !== 1 ? "s" : ""} seleccionado
              {selectedEvents.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {/* Stats */}
          <div className='flex flex-wrap items-center gap-2'>
            {stats.upcoming > 0 && (
              <Badge variant='secondary' className='bg-primary/10 text-primary'>
                <Icons.Clock className='h-3 w-3 mr-1' />
                {stats.upcoming} próximos
              </Badge>
            )}

            {stats.withMeet > 0 && (
              <Badge variant='secondary' className='bg-primary/10 text-primary'>
                <Icons.Video className='h-3 w-3 mr-1' />
                {stats.withMeet} con Meet
              </Badge>
            )}

            {stats.withLocation > 0 && (
              <Badge variant='secondary' className='bg-primary/10 text-primary'>
                <Icons.MapPin className='h-3 w-3 mr-1' />
                {stats.withLocation} con ubicación
              </Badge>
            )}

            {stats.withAttendees > 0 && (
              <Badge variant='secondary' className='bg-primary/10 text-primary'>
                <Icons.Users className='h-3 w-3 mr-1' />
                {stats.withAttendees} con invitados
              </Badge>
            )}

            {stats.withDescription > 0 && (
              <Badge variant='secondary' className='bg-primary/10 text-primary'>
                <Icons.FileText className='h-3 w-3 mr-1' />
                {stats.withDescription} con descripción
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className='flex items-center gap-2'>
          <button
            onClick={onClearSelection}
            className='text-sm text-primary hover:text-primary/80 underline'
          >
            Deseleccionar todo
          </button>
        </div>
      </div>

      {/* Event Preview */}
      {selectedEvents.length <= 3 && (
        <div className='mt-3 pt-3 border-t border-primary/20'>
          <div className='flex flex-wrap gap-2'>
            {selectedEvents.map((event, index) => (
              <div
                key={`${event.id}-${(event as any).calendarId || "default"}`}
                className='flex items-center gap-2 bg-background rounded-md px-3 py-1.5 text-sm border border-primary/20'
              >
                <Icons.Calendar className='h-3 w-3 text-primary' />
                <span className='font-medium text-foreground truncate max-w-32'>
                  {event.summary}
                </span>
                {event.hangoutLink && (
                  <Icons.Video className='h-3 w-3 text-primary' />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
