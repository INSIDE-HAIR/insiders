/**
 * GENERALSECTION - Información general del evento de calendario
 * Sección que muestra los datos básicos del evento (título, fecha, ubicación, etc.)
 *
 * @author Claude Code
 * @version 1.0.0
 */

import React from "react";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  LinkIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

interface GeneralSectionProps {
  event: GoogleCalendarEvent;
  calendars?: Array<{
    id: string;
    summary: string;
    backgroundColor?: string;
    foregroundColor?: string;
  }>;
}

export const GeneralSection: React.FC<GeneralSectionProps> = ({
  event,
  calendars = [],
}) => {
  // Encontrar el calendario del evento
  const eventCalendar = calendars.find(
    (cal) => event.organizer?.email?.includes(cal.id) || cal.id === "primary"
  );

  // Formatear fecha y hora
  const formatDateTime = (dateTime?: string, date?: string) => {
    if (!dateTime && !date) return "No especificado";

    const eventDate = new Date(dateTime || date!);
    if (isNaN(eventDate.getTime())) return "Fecha inválida";

    if (dateTime) {
      // Evento con hora específica
      return {
        date: eventDate.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: eventDate.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } else {
      // Evento de día completo
      return {
        date: eventDate.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: null,
      };
    }
  };

  const startDateTime = formatDateTime(
    event.start?.dateTime,
    event.start?.date
  );
  const endDateTime = formatDateTime(event.end?.dateTime, event.end?.date);

  // Calcular duración
  const getDuration = () => {
    if (!event.start?.dateTime || !event.end?.dateTime) return null;

    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);
    const durationMinutes = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60)
    );

    if (durationMinutes < 60) {
      return `${durationMinutes} min`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }
  };

  const duration = getDuration();

  return (
    <div className='space-y-6'>
      {/* Información principal */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CalendarIcon className='h-5 w-5' />
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Título */}
          <div>
            <label className='text-sm font-medium text-muted-foreground'>
              Título
            </label>
            <p className='text-lg font-semibold mt-1'>
              {event.summary || "Sin título"}
            </p>
          </div>

          <Separator />

          {/* Fecha y hora */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                <CalendarIcon className='h-4 w-4' />
                Fecha de inicio
              </label>
              <p className='mt-1 capitalize'>
                {typeof startDateTime === "string"
                  ? startDateTime
                  : startDateTime.date}
              </p>
              {typeof startDateTime === "object" && startDateTime.time && (
                <p className='text-sm text-muted-foreground'>
                  {startDateTime.time}
                </p>
              )}
            </div>

            <div>
              <label className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                <CalendarIcon className='h-4 w-4' />
                Fecha de fin
              </label>
              <p className='mt-1 capitalize'>
                {typeof endDateTime === "string"
                  ? endDateTime
                  : endDateTime.date}
              </p>
              {typeof endDateTime === "object" && endDateTime.time && (
                <p className='text-sm text-muted-foreground'>
                  {endDateTime.time}
                </p>
              )}
            </div>
          </div>

          {/* Duración */}
          {duration && (
            <>
              <Separator />
              <div>
                <label className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                  <ClockIcon className='h-4 w-4' />
                  Duración
                </label>
                <p className='mt-1'>{duration}</p>
              </div>
            </>
          )}

          {/* Ubicación */}
          {event.location && (
            <>
              <Separator />
              <div>
                <label className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                  <MapPinIcon className='h-4 w-4' />
                  Ubicación
                </label>
                <p className='mt-1'>{event.location}</p>
              </div>
            </>
          )}

          {/* Enlace de Meet */}
          {event.hangoutLink && (
            <>
              <Separator />
              <div>
                <label className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                  <LinkIcon className='h-4 w-4' />
                  Enlace de videollamada
                </label>
                <a
                  href={event.hangoutLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mt-1 text-blue-600 hover:text-blue-800 hover:underline block break-all'
                >
                  {event.hangoutLink}
                </a>
              </div>
            </>
          )}

          {/* Estado */}
          <Separator />
          <div>
            <label className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <TagIcon className='h-4 w-4' />
              Estado
            </label>
            <div className='mt-1'>
              <Badge
                variant={
                  event.status === "confirmed"
                    ? "default"
                    : event.status === "tentative"
                      ? "secondary"
                      : "destructive"
                }
              >
                {event.status === "confirmed"
                  ? "Confirmado"
                  : event.status === "tentative"
                    ? "Tentativo"
                    : event.status || "Desconocido"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizador y calendario */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <UserGroupIcon className='h-5 w-5' />
            Organización
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Organizador */}
          {event.organizer && (
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Organizador
              </label>
              <p className='mt-1'>
                {event.organizer.displayName ||
                  event.organizer.email ||
                  "Desconocido"}
              </p>
              {event.organizer.displayName && event.organizer.email && (
                <p className='text-sm text-muted-foreground'>
                  {event.organizer.email}
                </p>
              )}
            </div>
          )}

          {/* Calendario */}
          {eventCalendar && (
            <>
              <Separator />
              <div>
                <label className='text-sm font-medium text-muted-foreground'>
                  Calendario
                </label>
                <div className='mt-1 flex items-center gap-2'>
                  {eventCalendar.backgroundColor && (
                    <div
                      className='w-3 h-3 rounded-full border'
                      style={{ backgroundColor: eventCalendar.backgroundColor }}
                    />
                  )}
                  <span>{eventCalendar.summary}</span>
                </div>
              </div>
            </>
          )}

          {/* Número de participantes */}
          {event.attendees && event.attendees.length > 0 && (
            <>
              <Separator />
              <div>
                <label className='text-sm font-medium text-muted-foreground'>
                  Participantes
                </label>
                <p className='mt-1'>{event.attendees.length} personas</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Descripción si existe */}
      {event.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className='prose prose-sm max-w-none'
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
