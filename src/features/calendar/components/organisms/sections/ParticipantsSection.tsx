/**
 * PARTICIPANTSSECTION - Sección de participantes del evento
 * Muestra la lista de asistentes con sus estados de respuesta
 *
 * @author Claude Code
 * @version 1.0.0
 */

import React from "react";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Separator } from "@/src/components/ui/separator";
import { 
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  UserIcon,
  AtSymbolIcon
} from "@heroicons/react/24/outline";

interface ParticipantsSectionProps {
  event: GoogleCalendarEvent;
}

export const ParticipantsSection: React.FC<ParticipantsSectionProps> = ({ event }) => {
  const attendees = event.attendees || [];
  
  // Contar estados de respuesta
  const responseCounts = {
    accepted: attendees.filter(a => a.responseStatus === 'accepted').length,
    declined: attendees.filter(a => a.responseStatus === 'declined').length,
    tentative: attendees.filter(a => a.responseStatus === 'tentative').length,
    needsAction: attendees.filter(a => a.responseStatus === 'needsAction' || !a.responseStatus).length,
  };

  // Función para obtener las iniciales del nombre
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return '?';
  };

  // Función para obtener el color del badge según el estado
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'accepted':
        return { variant: 'default' as const, label: 'Confirmado', icon: CheckCircleIcon };
      case 'declined':
        return { variant: 'destructive' as const, label: 'Rechazado', icon: XCircleIcon };
      case 'tentative':
        return { variant: 'secondary' as const, label: 'Tentativo', icon: QuestionMarkCircleIcon };
      case 'needsAction':
      default:
        return { variant: 'outline' as const, label: 'Pendiente', icon: ClockIcon };
    }
  };

  // Si no hay asistentes
  if (attendees.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5" />
            Participantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <UserGroupIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay participantes invitados a este evento</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen de respuestas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5" />
            Resumen de Participantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{responseCounts.accepted}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <CheckCircleIcon className="h-4 w-4" />
                Confirmados
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{responseCounts.declined}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <XCircleIcon className="h-4 w-4" />
                Rechazados
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{responseCounts.tentative}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <QuestionMarkCircleIcon className="h-4 w-4" />
                Tentativos
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{responseCounts.needsAction}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <ClockIcon className="h-4 w-4" />
                Sin responder
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de participantes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Participantes ({attendees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendees.map((attendee, index) => {
              const statusInfo = getStatusBadge(attendee.responseStatus);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={`${attendee.email}-${index}`}>
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-xs">
                        {getInitials(attendee.displayName, attendee.email)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Información del participante */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">
                          {attendee.displayName || 'Sin nombre'}
                        </h4>
                        {attendee.optional && (
                          <Badge variant="outline" className="text-xs">
                            Opcional
                          </Badge>
                        )}
                        {attendee.organizer && (
                          <Badge variant="default" className="text-xs">
                            Organizador
                          </Badge>
                        )}
                      </div>
                      
                      {attendee.email && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <AtSymbolIcon className="h-3 w-3" />
                          <span className="truncate">{attendee.email}</span>
                        </div>
                      )}

                      {attendee.comment && (
                        <p className="text-sm text-muted-foreground mt-1 italic">
                          &quot;{attendee.comment}&quot;
                        </p>
                      )}
                    </div>

                    {/* Estado de respuesta */}
                    <div className="flex items-center gap-2">
                      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>
                  
                  {index < attendees.length - 1 && <Separator className="mt-4" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Organizador */}
      {event.organizer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Organizador del Evento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {getInitials(event.organizer.displayName, event.organizer.email)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h4 className="font-medium">
                  {event.organizer.displayName || 'Sin nombre'}
                </h4>
                {event.organizer.email && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <AtSymbolIcon className="h-3 w-3" />
                    {event.organizer.email}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};