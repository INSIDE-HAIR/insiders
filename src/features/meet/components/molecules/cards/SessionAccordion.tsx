import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { UsersIcon, VideoCameraIcon, DocumentTextIcon, SparklesIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { SessionBadge } from "../../atoms/badges/SessionBadge";
import { SessionSummaryCard } from "./SessionSummaryCard";
import { ParticipantDetailCard } from "./ParticipantDetailCard";
import { RecordingCard } from "./RecordingCard";
import { TranscriptionCard } from "./TranscriptionCard";
import { SmartNoteCard } from "./SmartNoteCard";
import { cn } from "@/src/lib/utils";

export interface SessionData {
  id: string;
  date: string;
  duration: string;
  participants: number;
  isActive: boolean;
  recordings: Array<{
    state: "Disponible" | "Procesando" | "Grabando";
    time: string;
    hasLink: boolean;
    quality: string;
    calculatedSize: string;
    exportUri?: string;
    driveFileId?: string;
    recordingIndex?: number;
  }>;
  transcripts: Array<{
    state: "Disponible" | "Procesando" | "Transcribiendo";
    preview: string | null;
    hasLink: boolean;
    wordCount: number;
    exportUri?: string;
    documentId?: string;
    transcriptIndex?: number;
  }>;
  smartNotes: Array<{
    title: string;
    preview: string;
    hasLink: boolean;
    pointCount: number;
  }>;
  participantsList: Array<{
    name: string;
    type: "signed_in" | "anonymous" | "phone";
    joinTime: string;
    leaveTime: string;
    duration: number;
    participation: number;
    totalSessions: number;
    isTopParticipant: boolean;
  }>;
  summary: {
    generalInfo: {
      duration: string;
      participants: number;
      status: string;
    };
    analytics: {
      averageAttendance: string;
      averageTime: string;
      topParticipant: string;
    };
  };
}

export interface SessionAccordionProps {
  session: SessionData;
  onPlayRecording?: (recordingIndex: number) => void;
  onDownloadRecording?: (recordingIndex: number) => void;
  onViewTranscription?: (transcriptIndex: number) => void;
  onDownloadTranscriptionPdf?: (transcriptIndex: number) => void;
  onViewSmartNote?: (noteIndex: number) => void;
  onExportSmartNote?: (noteIndex: number) => void;
  className?: string;
}

/**
 * Accordion molecular completo de sesión con todos los sub-acordeones
 * Combina todos los components moleculares de sesión
 * 
 * @example
 * <SessionAccordion 
 *   session={sessionData}
 *   onPlayRecording={(idx) => console.log('Play', idx)}
 *   onViewTranscription={(idx) => console.log('View transcript', idx)}
 * />
 */
export const SessionAccordion: React.FC<SessionAccordionProps> = ({
  session,
  onPlayRecording,
  onDownloadRecording,
  onViewTranscription,
  onDownloadTranscriptionPdf,
  onViewSmartNote,
  onExportSmartNote,
  className
}) => {
  
  return (
    <details key={session.id} className={cn("group border border-border rounded-lg", className)}>
      
      {/* Header principal de sesión */}
      <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
        <div className="flex items-center gap-3">
          <InformationCircleIcon className="h-5 w-5 text-primary" />
          <div>
            <span className="font-medium">Sesión {session.date}</span>
            <div className="text-sm text-muted-foreground">
              {session.duration} • {session.participants} participantes • ID: {session.id}
            </div>
          </div>
          {session.isActive && (
            <SessionBadge variant="active" animated>
              <span className="mr-1">●</span>
              Activa
            </SessionBadge>
          )}
        </div>
        <svg className="h-4 w-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </summary>
      
      {/* Contenido de la sesión con sub-accordions */}
      <div className="px-4 pb-4 space-y-3">

        {/* Resumen de Sesión */}
        <SessionSummaryCard 
          sessionId={session.id}
          data={session.summary}
        />

        {/* Participantes Detallados */}
        <details className="group border border-border rounded-lg" open>
          <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-primary" />
              <span className="font-medium">Participantes Detallados</span>
              <Badge variant="outline">{session.participants}</Badge>
            </div>
            <svg className="h-3 w-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </summary>
          
          <div className="px-3 pb-3 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {session.participantsList.slice(0, session.participants).map((participant, partIndex) => (
                <ParticipantDetailCard 
                  key={partIndex}
                  participant={participant}
                />
              ))}
            </div>
          </div>
        </details>

        {/* Grabaciones */}
        <details className="group border border-border rounded-lg">
          <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <VideoCameraIcon className="h-4 w-4 text-primary" />
              <span className="font-medium">Grabaciones</span>
              <Badge variant="outline">{session.recordings.length}</Badge>
            </div>
            <svg className="h-3 w-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </summary>
          
          <div className="px-3 pb-3">
            {session.recordings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay grabaciones disponibles</p>
            ) : (
              <div className="space-y-2">
                {session.recordings.map((recording, recIndex) => (
                  <RecordingCard
                    key={recIndex}
                    recording={recording}
                    sessionDuration={session.duration}
                    onPlay={() => onPlayRecording?.(recIndex)}
                    onDownload={() => onDownloadRecording?.(recIndex)}
                  />
                ))}
              </div>
            )}
          </div>
        </details>

        {/* Transcripciones */}
        <details className="group border border-border rounded-lg">
          <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="h-4 w-4 text-primary" />
              <span className="font-medium">Transcripciones</span>
              <Badge variant="outline">{session.transcripts.length}</Badge>
            </div>
            <svg className="h-3 w-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </summary>
          
          <div className="px-3 pb-3">
            {session.transcripts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay transcripciones disponibles</p>
            ) : (
              <div className="space-y-2">
                {session.transcripts.map((transcript, transIndex) => (
                  <TranscriptionCard
                    key={transIndex}
                    transcription={transcript}
                    sessionDuration={session.duration}
                    onViewComplete={() => onViewTranscription?.(transIndex)}
                    onDownloadPdf={() => onDownloadTranscriptionPdf?.(transIndex)}
                  />
                ))}
              </div>
            )}
          </div>
        </details>

        {/* Notas Inteligentes */}
        {session.smartNotes.length > 0 && (
          <details className="group border border-border rounded-lg">
            <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-primary" />
                <span className="font-medium">Notas Inteligentes</span>
                <Badge variant="outline">{session.smartNotes.length}</Badge>
              </div>
              <svg className="h-3 w-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </summary>
            
            <div className="px-3 pb-3">
              <div className="space-y-2">
                {session.smartNotes.map((note, noteIndex) => (
                  <SmartNoteCard
                    key={noteIndex}
                    note={note}
                    onViewComplete={() => onViewSmartNote?.(noteIndex)}
                    onExport={() => onExportSmartNote?.(noteIndex)}
                  />
                ))}
              </div>
            </div>
          </details>
        )}

      </div>
    </details>
  );
};