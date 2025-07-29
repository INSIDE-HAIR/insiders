"use client";

import React from "react";
import { 
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  VideoCameraIcon,
  PhoneIcon,
  DocumentTextIcon,
  LinkIcon,
  PaperClipIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";

interface EventDetailModalProps {
  event: GoogleCalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (eventId: string, calendarId: string) => void;
  onDelete: (eventId: string, calendarId: string) => void;
  calendars?: Array<{ 
    id: string; 
    summary: string; 
    colorId?: string; 
    backgroundColor?: string; 
    foregroundColor?: string; 
  }>;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  calendars = []
}) => {
  if (!isOpen || !event) return null;

  // Helper para obtener el color del calendario basado en el email
  const getCalendarColorByEmail = (email: string) => {
    const calendar = calendars.find(cal => cal.id === email);
    return calendar ? {
      backgroundColor: calendar.backgroundColor || '#4285f4',
      foregroundColor: calendar.foregroundColor || '#ffffff',
      colorId: calendar.colorId || 'default'
    } : null;
  };

  const formatEventDate = (dateTime: string | undefined, isAllDay: boolean = false) => {
    if (!dateTime) return 'Fecha no disponible';
    
    const date = new Date(dateTime);
    
    if (isAllDay) {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    return date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = () => {
    const now = new Date();
    const start = new Date(event.start?.dateTime || event.start?.date || '');
    const end = new Date(event.end?.dateTime || event.end?.date || '');

    if (now < start) return { status: 'upcoming', color: 'bg-blue-100 text-blue-800', label: 'Próximo' };
    if (now > end) return { status: 'past', color: 'bg-gray-100 text-gray-800', label: 'Pasado' };
    return { status: 'ongoing', color: 'bg-green-100 text-green-800', label: 'En curso' };
  };

  const getAttendeeStatusConfig = (responseStatus: string) => {
    const configs = {
      accepted: { color: 'bg-green-500', text: 'text-green-700', label: 'Aceptado', icon: '✓' },
      declined: { color: 'bg-red-500', text: 'text-red-700', label: 'Rechazado', icon: '✗' },
      tentative: { color: 'bg-yellow-500', text: 'text-yellow-700', label: 'Tentativo', icon: '?' },
      needsAction: { color: 'bg-gray-400', text: 'text-gray-600', label: 'Sin respuesta', icon: '⏳' }
    };
    return configs[responseStatus as keyof typeof configs] || configs.needsAction;
  };

  const eventStatus = getEventStatus();
  const calendarId = (event as any).calendarId;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {event.summary || 'Sin título'}
                </h2>
                <Badge className={`mt-1 ${eventStatus.color}`}>
                  {eventStatus.label}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Actions */}
              {event.htmlLink && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(event.htmlLink, '_blank')}
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  Ver en Google
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(event.id!, calendarId)}
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Editar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(event.id!, calendarId)}
                className="text-red-600 hover:text-red-700"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Información del Evento
                </h3>
                
                {/* Fechas */}
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Inicio</div>
                      <div className="text-gray-600">
                        {formatEventDate(event.start?.dateTime || event.start?.date, !!event.start?.date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Fin</div>
                      <div className="text-gray-600">
                        {formatEventDate(event.end?.dateTime || event.end?.date, !!event.end?.date)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ubicación */}
                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Ubicación</div>
                      <div className="text-gray-600">{event.location}</div>
                    </div>
                  </div>
                )}

                {/* Descripción */}
                {event.description && (
                  <div className="flex items-start gap-3">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Descripción</div>
                      <div 
                        className="text-gray-600 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: event.description }}
                      />
                    </div>
                  </div>
                )}

                {/* Organizador y Creador */}
                <div className="space-y-2">
                  {event.organizer && (
                    <div className="flex items-start gap-3">
                      <UserGroupIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Organizador</div>
                        <div className="flex items-center gap-2">
                          {/* Círculo de color si es un calendario */}
                          {(() => {
                            const organizerCalendarColor = getCalendarColorByEmail(event.organizer.email || '');
                            return organizerCalendarColor && (
                              <div 
                                className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                                style={{ 
                                  backgroundColor: organizerCalendarColor.backgroundColor,
                                  border: `1px solid ${organizerCalendarColor.foregroundColor}`
                                }}
                                title={`Calendario: ${organizerCalendarColor.colorId}`}
                              />
                            );
                          })()}
                          
                          <div className="text-gray-600">
                            <div className="font-medium text-gray-900">
                              {event.organizer.displayName || event.organizer.email?.split('@')[0] || 'Sin nombre'}
                            </div>
                            {event.organizer.email && (
                              <div className="text-xs font-mono text-gray-500">{event.organizer.email}</div>
                            )}
                            {getCalendarColorByEmail(event.organizer.email || '') && (
                              <div className="text-xs text-blue-600">
                                📅 Calendario
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {event.creator && event.creator.email !== event.organizer?.email && (
                    <div className="flex items-start gap-3">
                      <UserGroupIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Creador</div>
                        <div className="flex items-center gap-2">
                          {/* Círculo de color si es un calendario */}
                          {(() => {
                            const creatorCalendarColor = getCalendarColorByEmail(event.creator.email || '');
                            return creatorCalendarColor && (
                              <div 
                                className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                                style={{ 
                                  backgroundColor: creatorCalendarColor.backgroundColor,
                                  border: `1px solid ${creatorCalendarColor.foregroundColor}`
                                }}
                                title={`Calendario: ${creatorCalendarColor.colorId}`}
                              />
                            );
                          })()}
                          
                          <div className="text-gray-600">
                            <div className="font-medium text-gray-900">
                              {event.creator.displayName || event.creator.email?.split('@')[0] || 'Sin nombre'}
                            </div>
                            {event.creator.email && (
                              <div className="text-xs font-mono text-gray-500">{event.creator.email}</div>
                            )}
                            {getCalendarColorByEmail(event.creator.email || '') && (
                              <div className="text-xs text-blue-600">
                                📅 Calendario
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Google Meet y Invitados */}
              <div className="space-y-4">
                
                {/* Google Meet */}
                {(event.hangoutLink || event.conferenceData) && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3">
                      Google Meet
                    </h3>
                    
                    {event.hangoutLink && (
                      <div className="mb-3">
                        <Button
                          onClick={() => window.open(event.hangoutLink, '_blank')}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <VideoCameraIcon className="h-4 w-4 mr-2" />
                          Unirse a la reunión
                        </Button>
                      </div>
                    )}

                    {event.conferenceData && (
                      <div className="space-y-3">
                        {/* ID de reunión */}
                        {event.conferenceData.conferenceId && (
                          <div className="p-3 bg-gray-50 rounded">
                            <div className="text-sm font-medium text-gray-700">ID de reunión</div>
                            <div className="font-mono text-sm text-gray-900">
                              {event.conferenceData.conferenceId}
                            </div>
                          </div>
                        )}

                        {/* Acceso telefónico */}
                        {event.conferenceData.entryPoints?.filter(ep => ep.entryPointType === 'phone').map((phone, index) => (
                          <div key={index} className="p-3 bg-blue-50 rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <PhoneIcon className="h-4 w-4 text-blue-600" />
                              <div className="text-sm font-medium text-blue-900">Acceso telefónico</div>
                            </div>
                            <div className="font-mono text-sm text-blue-900">
                              {phone.label || phone.uri?.replace('tel:', '')}
                            </div>
                            {phone.pin && (
                              <div className="text-sm text-blue-700">
                                PIN: <span className="font-mono font-bold">{phone.pin}</span>
                              </div>
                            )}
                            {phone.regionCode && (
                              <div className="text-xs text-blue-600">Región: {phone.regionCode}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Invitados */}
                {event.attendees && event.attendees.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3">
                      Invitados ({event.attendees.length})
                    </h3>
                    
                    {/* Resumen de estados */}
                    <div className="flex gap-3 mb-3 p-3 bg-gray-50 rounded">
                      {['accepted', 'declined', 'tentative', 'needsAction'].map(status => {
                        const count = event.attendees!.filter(a => a.responseStatus === status).length;
                        if (count === 0) return null;
                        
                        const config = getAttendeeStatusConfig(status);
                        return (
                          <div key={status} className="flex items-center gap-1 text-sm">
                            <span className={`w-2 h-2 ${config.color} rounded-full`}></span>
                            <span className={`font-medium ${config.text}`}>
                              {count} {config.icon}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Lista de invitados */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {event.attendees.map((attendee, index) => {
                        const config = getAttendeeStatusConfig(attendee.responseStatus || 'needsAction');
                        
                        return (
                          <div key={index} className="flex items-center gap-3 p-2 bg-white border rounded">
                            <span className={`w-3 h-3 ${config.color} rounded-full flex-shrink-0`} title={config.label}></span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-900 truncate">
                                {attendee.displayName || attendee.email?.split('@')[0] || 'Sin nombre'}
                              </div>
                              <div className="text-xs text-gray-500 font-mono truncate">
                                {attendee.email}
                              </div>
                              {attendee.optional && (
                                <Badge variant="outline" className="text-xs mt-1">Opcional</Badge>
                              )}
                            </div>
                            <span className={`text-xs font-medium ${config.text}`}>
                              {config.icon}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Archivos adjuntos */}
                {event.attachments && event.attachments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3">
                      Archivos Adjuntos ({event.attachments.length})
                    </h3>
                    
                    <div className="space-y-2">
                      {event.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                          <PaperClipIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate">
                              {attachment.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {attachment.mimeType}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(attachment.fileUrl, '_blank')}
                            className="flex-shrink-0"
                          >
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metadatos adicionales */}
            <div className="mt-6 pt-4 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                {event.created && (
                  <div>
                    <div className="font-medium">Creado</div>
                    <div>{new Date(event.created).toLocaleDateString('es-ES')}</div>
                  </div>
                )}
                {event.updated && (
                  <div>
                    <div className="font-medium">Actualizado</div>
                    <div>{new Date(event.updated).toLocaleDateString('es-ES')}</div>
                  </div>
                )}
                {event.visibility && (
                  <div>
                    <div className="font-medium">Visibilidad</div>
                    <div>{event.visibility}</div>
                  </div>
                )}
                {event.eventType && (
                  <div>
                    <div className="font-medium">Tipo</div>
                    <div>{event.eventType}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};