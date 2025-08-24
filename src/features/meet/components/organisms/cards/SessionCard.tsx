import React from "react";
import { cn } from "@/src/lib/utils";
import { StatusBadge } from "../../atoms/badges/StatusBadge";
import { CountBadge } from "../../atoms/badges/CountBadge";
import { TypeBadge } from "../../atoms/badges/TypeBadge";
import { CopyButton } from "../../atoms/buttons/CopyButton";
import { ActionButton } from "../../atoms/buttons/ActionButton";
import { MediaButton } from "../../atoms/buttons/MediaButton";
import { 
  CalendarIcon, 
  ClockIcon, 
  UsersIcon,
  VideoCameraIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

export type SessionStatus = "active" | "completed" | "scheduled" | "cancelled";
export type SessionCardVariant = "default" | "compact" | "detailed";

export interface SessionParticipant {
  name: string;
  email: string;
  joinTime: string;
  leaveTime?: string;
  role?: "host" | "cohost" | "participant";
}

export interface SessionCardProps {
  // Core session data
  id: string;
  title?: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration: string;
  
  // Participant data
  participants: SessionParticipant[];
  maxParticipants?: number;
  hostName?: string;
  
  // Session assets
  hasRecording?: boolean;
  hasTranscription?: boolean;
  hasNotes?: boolean;
  recordingUrl?: string;
  transcriptionUrl?: string;
  notesUrl?: string;
  
  // State & behavior
  status: SessionStatus;
  variant?: SessionCardVariant;
  showActions?: boolean;
  expandedByDefault?: boolean;
  
  // Event handlers
  onView?: (sessionId: string) => void;
  onEdit?: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
  onPlayRecording?: (recordingUrl: string) => void;
  onDownloadAsset?: (assetType: "recording" | "transcription" | "notes", url: string) => void;
  
  // Styling
  className?: string;
}

/**
 * Card universal para sesiones - extraído y optimizado del ResponsiveModalDemo
 * Sigue Atomic Design con StatusBadge, CountBadge, TypeBadge, CopyButton, etc.
 * 
 * @example
 * // Session activa básica
 * <SessionCard 
 *   id="ses_123"
 *   date="23 Enero 2025"
 *   startTime="09:00"
 *   endTime="11:00"
 *   duration="2h"
 *   participants={participantsList}
 *   status="active"
 * />
 * 
 * // Session completa con assets
 * <SessionCard 
 *   id="ses_456"
 *   title="Reunión de Equipo"
 *   date="22 Enero 2025"
 *   startTime="14:00"
 *   duration="1h 30m"
 *   participants={participantsList}
 *   status="completed"
 *   hasRecording
 *   hasTranscription
 *   hasNotes
 *   recordingUrl="https://..."
 *   variant="detailed"
 *   showActions
 * />
 */
export const SessionCard: React.FC<SessionCardProps> = ({
  id,
  title,
  date,
  startTime,
  endTime,
  duration,
  participants,
  maxParticipants,
  hostName,
  hasRecording = false,
  hasTranscription = false,
  hasNotes = false,
  recordingUrl,
  transcriptionUrl,
  notesUrl,
  status,
  variant = "default",
  showActions = true,
  expandedByDefault = false,
  onView,
  onEdit,
  onDelete,
  onPlayRecording,
  onDownloadAsset,
  className
}) => {
  
  // Participant stats
  const totalParticipants = participants.length;
  const activeParticipants = participants.filter(p => !p.leaveTime).length;
  const hostParticipant = participants.find(p => p.role === "host");
  const displayHostName = hostName || hostParticipant?.name || "Sin anfitrión";
  
  // Format time display
  const timeDisplay = endTime ? `${startTime} - ${endTime}` : startTime;
  
  // Get session title or fallback
  const sessionTitle = title || `Sesión ${date}`;
  
  // Assets count
  const assetsCount = [hasRecording, hasTranscription, hasNotes].filter(Boolean).length;
  
  // Variant styles
  const variantStyles = {
    default: {
      container: "border border-border rounded-lg bg-card",
      header: "p-4",
      content: "px-4 pb-4",
      spacing: "space-y-3"
    },
    compact: {
      container: "border border-border rounded-md bg-card",
      header: "p-3", 
      content: "px-3 pb-3",
      spacing: "space-y-2"
    },
    detailed: {
      container: "border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow",
      header: "p-5",
      content: "px-5 pb-5", 
      spacing: "space-y-4"
    }
  };
  
  const styles = variantStyles[variant];

  return (
    <details 
      className={cn("group", styles.container, className)}
      open={expandedByDefault}
    >
      {/* Header - Always visible */}
      <summary className={cn(
        "flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors",
        styles.header
      )}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <CalendarIcon className={cn(
            "text-primary flex-shrink-0",
            variant === "compact" ? "h-4 w-4" : "h-5 w-5"
          )} />
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-medium truncate",
                variant === "compact" ? "text-sm" : "text-base"
              )}>
                {sessionTitle}
              </span>
              
              {/* Session ID badge */}
              <CountBadge count={id} type="sessions" variant="outline" />
              
              {/* Status badge */}
              <StatusBadge 
                status={status === "active" ? "active" : status === "completed" ? "completed" : "pending"} 
                animated={status === "active"}
              />
            </div>
            
            <div className={cn(
              "text-muted-foreground flex items-center gap-2 flex-wrap",
              variant === "compact" ? "text-xs" : "text-sm"
            )}>
              <span className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                {timeDisplay} • {duration}
              </span>
              
              <span className="flex items-center gap-1">
                <UsersIcon className="h-3 w-3" />
                {totalParticipants} participantes
              </span>
              
              {assetsCount > 0 && (
                <CountBadge count={assetsCount} label="assets" variant="solid" type="total" />
              )}
            </div>
          </div>
        </div>
        
        {/* Quick actions */}
        {showActions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <CopyButton 
              value={id}
              variant="copy"
              size="sm"
            />
            
            {onView && (
              <ActionButton 
                action="view"
                variant="secondary"
                size="sm"
                onClick={() => {
                  onView(id);
                }}
                tooltip="Ver detalles"
              />
            )}
          </div>
        )}
      </summary>
      
      {/* Expanded content */}
      <div className={cn(styles.content, styles.spacing)}>
        {/* Session info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Información de la Sesión</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div>📅 Fecha: {date}</div>
              <div>⏰ Horario: {timeDisplay}</div>
              <div>⏱️ Duración: {duration}</div>
              <div>👤 Anfitrión: {displayHostName}</div>
              {maxParticipants && (
                <div>👥 Límite: {maxParticipants} personas</div>
              )}
            </div>
          </div>
          
          {/* Assets section */}
          {assetsCount > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Assets Disponibles</h4>
              <div className="space-y-2">
                {hasRecording && (
                  <div className="flex items-center gap-2">
                    <VideoCameraIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm flex-1">Grabación</span>
                    <div className="flex gap-1">
                      {recordingUrl && onPlayRecording && (
                        <MediaButton 
                          type="play"
                          size="sm"
                          onClick={() => onPlayRecording(recordingUrl)}
                          tooltip="Reproducir grabación"
                        />
                      )}
                      {recordingUrl && onDownloadAsset && (
                        <ActionButton 
                          action="download"
                          variant="secondary"
                          size="xs"
                          onClick={() => onDownloadAsset("recording", recordingUrl)}
                          tooltip="Descargar grabación"
                        />
                      )}
                    </div>
                  </div>
                )}
                
                {hasTranscription && (
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm flex-1">Transcripción</span>
                    {transcriptionUrl && onDownloadAsset && (
                      <ActionButton 
                        action="download"
                        variant="secondary"
                        size="xs"
                        onClick={() => onDownloadAsset("transcription", transcriptionUrl)}
                        tooltip="Descargar transcripción"
                      />
                    )}
                  </div>
                )}
                
                {hasNotes && (
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm flex-1">Notas inteligentes</span>
                    {notesUrl && onDownloadAsset && (
                      <ActionButton 
                        action="download"
                        variant="secondary"
                        size="xs"
                        onClick={() => onDownloadAsset("notes", notesUrl)}
                        tooltip="Descargar notas"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Participants list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Participantes</h4>
            <CountBadge count={totalParticipants} label="total" type="total" />
          </div>
          
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {participants.map((participant, index) => (
              <div key={index} className="flex items-center justify-between py-1 px-2 bg-muted/30 rounded text-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-primary">
                      {participant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <span className="truncate">{participant.name}</span>
                  {participant.role === "host" && (
                    <TypeBadge type="host" variant="solid" className="text-xs" />
                  )}
                  {participant.role === "cohost" && (
                    <TypeBadge type="cohost" variant="solid" className="text-xs" />
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground flex-shrink-0">
                  {participant.joinTime}
                  {participant.leaveTime && ` - ${participant.leaveTime}`}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Action buttons */}
        {showActions && (onEdit || onDelete) && (
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            {onEdit && (
              <ActionButton 
                action="edit"
                variant="secondary"
                onClick={() => onEdit(id)}
                tooltip="Editar sesión"
              />
            )}
            {onDelete && (
              <ActionButton 
                action="delete"
                variant="destructive"
                onClick={() => onDelete(id)}
                tooltip="Eliminar sesión"
              />
            )}
          </div>
        )}
      </div>
    </details>
  );
};