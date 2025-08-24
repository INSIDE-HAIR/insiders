import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { StatusDot } from "../../atoms/indicators/StatusDot";
import { ActionButton } from "../../atoms/buttons/ActionButton";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";

export interface TranscriptionData {
  state: "Disponible" | "Procesando" | "Transcribiendo";
  preview: string | null;
  hasLink: boolean;
  wordCount: number;
}

export interface TranscriptionCardProps {
  transcription: TranscriptionData;
  sessionDuration: string;
  onViewComplete?: () => void;
  onDownloadPdf?: () => void;
  className?: string;
}

/**
 * Tarjeta molecular para transcripciones con preview y acciones
 * Combina StatusDot, ActionButton y preview de contenido
 * 
 * @example
 * <TranscriptionCard 
 *   transcription={transcriptData}
 *   sessionDuration="90 min"
 *   onViewComplete={() => alert('Opening...')}
 *   onDownloadPdf={() => alert('Downloading PDF...')}
 * />
 */
export const TranscriptionCard: React.FC<TranscriptionCardProps> = ({
  transcription,
  sessionDuration,
  onViewComplete,
  onDownloadPdf,
  className
}) => {
  
  const isAvailable = transcription.state === "Disponible";
  const isProcessing = transcription.state === "Procesando";
  const isTranscribing = transcription.state === "Transcribiendo";
  const estimatedWords = transcription.wordCount || Math.round(parseInt(sessionDuration) * 150);
  
  return (
    <div className={cn("p-3 bg-muted/50 border rounded-lg", className)}>
      
      {/* Header con estado y contador */}
      <div className="text-sm font-medium mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1">
          Estado: 
          {isAvailable ? (
            <>
              <StatusDot variant="available" size="sm" />
              Disponible
            </>
          ) : isTranscribing ? (
            <>
              <StatusDot variant="active" size="sm" />
              Transcribiendo
            </>
          ) : (
            <>
              <ArrowPathIcon className="h-3 w-3 animate-spin text-primary" />
              Procesando
            </>
          )}
        </span>
        
        {transcription.hasLink && (
          <Badge variant="outline" className="text-xs">
            ~{estimatedWords} palabras
          </Badge>
        )}
      </div>
      
      {/* Preview del contenido */}
      {transcription.preview && (
        <div className="text-xs text-muted-foreground mb-2 italic border-l-2 border-muted pl-2">
          &ldquo;{transcription.preview}&rdquo;
        </div>
      )}
      
      {/* Acciones de transcripción - mostrar siempre para debugging */}
      <div className="flex gap-1">
        <ActionButton
          action="external"
          onClick={() => onViewComplete?.()}
          size="sm"
          tooltip={transcription.hasLink ? "Ver en Google Docs" : "Vista previa (demo)"}
          disabled={!transcription.hasLink && transcription.state === "Procesando"}
        />
        <ActionButton
          action="download"
          onClick={() => onDownloadPdf?.()}
          size="sm"
          tooltip={transcription.hasLink ? "Descargar PDF" : "Descarga PDF (demo)"}
          disabled={!transcription.hasLink && transcription.state === "Procesando"}
        />
      </div>
    </div>
  );
};