import React from "react";
import { SessionAccordion, SessionData } from "../../molecules/cards/SessionAccordion";
import { cn } from "@/src/lib/utils";

export interface SessionsSectionDemoData {
  history: SessionData[];
}

export interface SessionsSectionDemoProps {
  data: SessionsSectionDemoData;
  onPlayRecording?: (sessionId: string, recordingIndex: number) => void;
  onDownloadRecording?: (sessionId: string, recordingIndex: number) => void;
  onViewTranscription?: (sessionId: string, transcriptIndex: number) => void;
  onDownloadTranscriptionPdf?: (sessionId: string, transcriptIndex: number) => void;
  onViewSmartNote?: (sessionId: string, noteIndex: number) => void;
  onExportSmartNote?: (sessionId: string, noteIndex: number) => void;
  className?: string;
}

/**
 * Sección Sessions completa usando componentes atómicos
 * Replica exactamente la funcionalidad del ResponsiveModalDemo
 * 
 * @example
 * <SessionsSectionDemo 
 *   data={modalDummyData.sessions} 
 *   onPlayRecording={(sessionId, idx) => console.log('Play', sessionId, idx)}
 *   onViewTranscription={(sessionId, idx) => console.log('View', sessionId, idx)}
 * />
 */
export const SessionsSectionDemo: React.FC<SessionsSectionDemoProps> = ({
  data,
  onPlayRecording,
  onDownloadRecording,
  onViewTranscription,
  onDownloadTranscriptionPdf,
  onViewSmartNote,
  onExportSmartNote,
  className
}) => {
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {data.history.map((session) => (
          <SessionAccordion
            key={session.id}
            session={session}
            onPlayRecording={(recordingIndex) => 
              onPlayRecording?.(session.id, recordingIndex)
            }
            onDownloadRecording={(recordingIndex) => 
              onDownloadRecording?.(session.id, recordingIndex)
            }
            onViewTranscription={(transcriptIndex) => 
              onViewTranscription?.(session.id, transcriptIndex)
            }
            onDownloadTranscriptionPdf={(transcriptIndex) => 
              onDownloadTranscriptionPdf?.(session.id, transcriptIndex)
            }
            onViewSmartNote={(noteIndex) => 
              onViewSmartNote?.(session.id, noteIndex)
            }
            onExportSmartNote={(noteIndex) => 
              onExportSmartNote?.(session.id, noteIndex)
            }
          />
        ))}
      </div>
    </div>
  );
};