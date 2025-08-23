import React from "react";
import { SessionAccordion, SessionData } from "../../molecules/cards/SessionAccordion";
import { useSessionsData } from "../../../hooks/useSessionsData";
import { adaptSessionData } from "../../../utils/sessionDataAdapter";
import { cn } from "@/src/lib/utils";
import { Skeleton } from "@/src/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export interface SessionsSectionDemoProps {
  spaceId: string | null;
  onPlayRecording?: (sessionId: string, recordingIndex: number) => void;
  onDownloadRecording?: (sessionId: string, recordingIndex: number) => void;
  onViewTranscription?: (sessionId: string, transcriptIndex: number) => void;
  onDownloadTranscriptionPdf?: (sessionId: string, transcriptIndex: number) => void;
  onViewSmartNote?: (sessionId: string, noteIndex: number) => void;
  onExportSmartNote?: (sessionId: string, noteIndex: number) => void;
  className?: string;
}

/**
 * Sección Sessions completa usando componentes atómicos con datos reales
 * Integra con la API de Meet para mostrar sesiones reales
 * 
 * @example
 * <SessionsSectionDemo 
 *   spaceId="abc123"
 *   onPlayRecording={(sessionId, idx) => console.log('Play', sessionId, idx)}
 *   onViewTranscription={(sessionId, idx) => console.log('View', sessionId, idx)}
 * />
 */
export const SessionsSectionDemo: React.FC<SessionsSectionDemoProps> = ({
  spaceId,
  onPlayRecording,
  onDownloadRecording,
  onViewTranscription,
  onDownloadTranscriptionPdf,
  onViewSmartNote,
  onExportSmartNote,
  className
}) => {
  const { data, loading, error, refetch } = useSessionsData(spaceId);

  // Loading state
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border border-border rounded-lg p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-center p-8 text-center">
          <div className="flex flex-col items-center space-y-3">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium mb-1">Error al cargar las sesiones</p>
              <p className="text-xs text-muted-foreground mb-3">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data || !data.sessions || !data.sessions.sessions || data.sessions.sessions.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-center p-8 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">No hay sesiones disponibles</p>
              <p className="text-xs text-muted-foreground">
                Las sesiones aparecerán aquí cuando se inicien reuniones en este espacio.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Adapt API data to component format
  const adaptedSessions = adaptSessionData(data);

  // Helper function to find recording URL from adapted data
  const findRecordingUrl = (sessionId: string, recordingIndex: number) => {
    const session = adaptedSessions.find(s => s.id === sessionId);
    if (!session || !session.recordings || recordingIndex >= session.recordings.length) {
      console.log('❌ Recording not found:', { sessionId, recordingIndex, session: !!session, recordingsCount: session?.recordings?.length });
      return null;
    }
    
    const recording = session.recordings[recordingIndex];
    console.log('🎬 Recording found:', { sessionId, recordingIndex, exportUri: recording.exportUri, hasLink: recording.hasLink });
    return recording.exportUri || null;
  };

  // Helper function to find transcript URL from adapted data
  const findTranscriptUrl = (sessionId: string, transcriptIndex: number) => {
    const session = adaptedSessions.find(s => s.id === sessionId);
    if (!session || !session.transcripts || transcriptIndex >= session.transcripts.length) {
      console.log('❌ Transcript not found:', { sessionId, transcriptIndex, session: !!session, transcriptsCount: session?.transcripts?.length });
      return null;
    }
    
    const transcript = session.transcripts[transcriptIndex];
    console.log('📄 Transcript found:', { sessionId, transcriptIndex, exportUri: transcript.exportUri, hasLink: transcript.hasLink });
    return transcript.exportUri || null;
  };

  // Success state with data
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {adaptedSessions.map((session) => (
          <SessionAccordion
            key={session.id}
            session={session}
            onPlayRecording={(recordingIndex) => {
              console.log('🎬 onPlayRecording clicked:', session.id, recordingIndex);
              // Abrir directamente en Drive
              const recordingUrl = findRecordingUrl(session.id, recordingIndex);
              console.log('🔗 Recording URL:', recordingUrl);
              if (recordingUrl) {
                window.open(recordingUrl, '_blank');
              }
              onPlayRecording?.(session.id, recordingIndex);
            }}
            onDownloadRecording={(recordingIndex) => {
              console.log('💾 onDownloadRecording clicked:', session.id, recordingIndex);
              // Obtener el file ID desde los datos adaptados
              const adaptedSession = adaptedSessions.find(s => s.id === session.id);
              const recording = adaptedSession?.recordings?.[recordingIndex];
              
              if (recording?.exportUri) {
                // Extraer el file ID de la URL de Drive
                let fileId = null;
                if (recording.exportUri.includes('drive.google.com/file/d/')) {
                  fileId = recording.exportUri.split('/d/')[1]?.split('/')[0];
                } else if (recording.driveFileId) {
                  fileId = recording.driveFileId;
                }
                
                if (fileId && !fileId.startsWith('demo-')) {
                  // Usar formato correcto para descarga directa de Google Drive
                  const downloadUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
                  console.log('📥 Download URL (Google Drive):', downloadUrl);
                  window.open(downloadUrl, '_blank');
                } else {
                  // Fallback para URLs demo o si no se puede extraer el ID
                  console.log('📥 Fallback - opening view URL:', recording.exportUri);
                  window.open(recording.exportUri, '_blank');
                }
              } else {
                console.log('❌ No recording URL available for download');
              }
              onDownloadRecording?.(session.id, recordingIndex);
            }}
            onViewTranscription={(transcriptIndex) => {
              console.log('📄 onViewTranscription clicked:', session.id, transcriptIndex);
              // Abrir directamente en Google Docs
              const transcriptUrl = findTranscriptUrl(session.id, transcriptIndex);
              console.log('🔗 Transcript URL:', transcriptUrl);
              if (transcriptUrl) {
                window.open(transcriptUrl, '_blank');
              }
              onViewTranscription?.(session.id, transcriptIndex);
            }}
            onDownloadTranscriptionPdf={(transcriptIndex) => {
              console.log('📄📥 onDownloadTranscriptionPdf clicked:', session.id, transcriptIndex);
              // Obtener el document ID desde los datos adaptados
              const adaptedSession = adaptedSessions.find(s => s.id === session.id);
              const transcript = adaptedSession?.transcripts?.[transcriptIndex];
              
              if (transcript?.exportUri) {
                // Extraer el document ID de la URL de Google Docs
                let documentId = null;
                if (transcript.exportUri.includes('docs.google.com/document/d/')) {
                  documentId = transcript.exportUri.split('/d/')[1]?.split('/')[0];
                } else if (transcript.documentId) {
                  documentId = transcript.documentId;
                }
                
                if (documentId && !documentId.startsWith('demo-')) {
                  // Usar formato correcto para descarga PDF de Google Docs
                  const pdfUrl = `https://docs.google.com/document/d/${documentId}/export?format=pdf`;
                  console.log('📥 PDF Download URL (Google Docs):', pdfUrl);
                  window.open(pdfUrl, '_blank');
                } else {
                  // Fallback para URLs demo
                  const fallbackPdfUrl = transcript.exportUri.replace('/edit', '/export?format=pdf');
                  console.log('📥 Fallback PDF URL:', fallbackPdfUrl);
                  window.open(fallbackPdfUrl, '_blank');
                }
              } else {
                console.log('❌ No transcript URL available for PDF download');
              }
              onDownloadTranscriptionPdf?.(session.id, transcriptIndex);
            }}
            onViewSmartNote={(noteIndex) => {
              console.log('✨ onViewSmartNote clicked:', session.id, noteIndex);
              // Para smart notes, usar la primera transcripción disponible del adaptedSession
              const adaptedSession = adaptedSessions.find(s => s.id === session.id);
              const firstTranscript = adaptedSession?.transcripts?.[0];
              console.log('🔗 Smart note transcript:', { sessionId: session.id, transcript: firstTranscript });
              
              if (firstTranscript?.exportUri) {
                console.log('🔗 Opening smart note URL:', firstTranscript.exportUri);
                window.open(firstTranscript.exportUri, '_blank');
              } else {
                console.log('❌ No transcript URL available for smart notes');
              }
              onViewSmartNote?.(session.id, noteIndex);
            }}
            onExportSmartNote={(noteIndex) => {
              console.log('📤 onExportSmartNote clicked:', session.id, noteIndex);
              // Descargar resumen como PDF de la primera transcripción
              const adaptedSession = adaptedSessions.find(s => s.id === session.id);
              const firstTranscript = adaptedSession?.transcripts?.[0];
              
              if (firstTranscript?.exportUri) {
                // Extraer el document ID de la URL de Google Docs
                let documentId = null;
                if (firstTranscript.exportUri.includes('docs.google.com/document/d/')) {
                  documentId = firstTranscript.exportUri.split('/d/')[1]?.split('/')[0];
                } else if (firstTranscript.documentId) {
                  documentId = firstTranscript.documentId;
                }
                
                if (documentId && !documentId.startsWith('demo-')) {
                  // Usar formato correcto para descarga PDF de Google Docs
                  const pdfUrl = `https://docs.google.com/document/d/${documentId}/export?format=pdf`;
                  console.log('📥 Smart note PDF URL (Google Docs):', pdfUrl);
                  window.open(pdfUrl, '_blank');
                } else {
                  // Fallback para URLs demo
                  const fallbackPdfUrl = firstTranscript.exportUri.replace('/edit', '/export?format=pdf');
                  console.log('📥 Smart note fallback PDF URL:', fallbackPdfUrl);
                  window.open(fallbackPdfUrl, '_blank');
                }
              } else {
                console.log('❌ No transcript URL available for PDF export');
              }
              onExportSmartNote?.(session.id, noteIndex);
            }}
          />
        ))}
      </div>
      
      {/* Footer info */}
      <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
        <span>{data.sessions.totalSessions} sesiones total</span>
        <span>{data.sessions.totalUniqueParticipants} participantes únicos</span>
        <span>{data.recordings.totalRecordings} grabaciones</span>
        <span>{data.transcripts.totalTranscripts} transcripciones</span>
      </div>
    </div>
  );
};