import React from "react";
import { StatusDot } from "../../atoms/indicators/StatusDot";
import { ActionButton } from "../../atoms/buttons/ActionButton";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";

export interface RecordingData {
  state: "Disponible" | "Procesando" | "Grabando";
  time: string;
  hasLink: boolean;
  quality: string;
  calculatedSize: string;
}

export interface RecordingCardProps {
  recording: RecordingData;
  sessionDuration: string;
  onPlay?: () => void;
  onDownload?: () => void;
  className?: string;
}

/**
 * Tarjeta molecular para grabaciones con estado y acciones
 * Combina StatusDot y ActionButton para manejo de grabaciones
 * 
 * @example
 * <RecordingCard 
 *   recording={recordingData}
 *   sessionDuration="90 min"
 *   onPlay={() => alert('Playing...')}
 *   onDownload={() => alert('Downloading...')}
 * />
 */
export const RecordingCard: React.FC<RecordingCardProps> = ({
  recording,
  sessionDuration,
  onPlay,
  onDownload,
  className
}) => {
  
  const isAvailable = recording.state === "Disponible";
  const isProcessing = recording.state === "Procesando";
  const isRecording = recording.state === "Grabando";
  
  return (
    <div className={cn("p-3 bg-muted/50 border rounded-lg", className)}>
      
      {/* Header con estado */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm font-medium flex items-center gap-1">
            Estado: 
            <span className="flex items-center gap-1">
              {isAvailable ? (
                <>
                  <StatusDot variant="available" size="sm" />
                  Disponible
                </>
              ) : isRecording ? (
                <>
                  <StatusDot variant="active" size="sm" />
                  Grabando
                </>
              ) : (
                <>
                  <ArrowPathIcon className="h-3 w-3 animate-spin text-primary" />
                  Procesando
                </>
              )}
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Iniciada: {recording.time} • Duración: {sessionDuration}
          </div>
        </div>
        
        {/* Acciones de grabación - mostrar siempre para debugging */}
        <div className="flex gap-1">
          <ActionButton
            action="play"
            onClick={() => onPlay?.()}
            size="sm"
            tooltip={recording.hasLink ? "Ver en Drive" : "Vista previa (demo)"}
            disabled={!recording.hasLink && recording.state === "Procesando"}
          />
          <ActionButton
            action="download"
            onClick={() => onDownload?.()}
            size="sm"
            tooltip={recording.hasLink ? "Descargar MP4" : "Descarga (demo)"}
            disabled={!recording.hasLink && recording.state === "Procesando"}
          />
        </div>
      </div>
      
      {/* Metadata de archivo */}
      <div className="text-xs text-muted-foreground">
        Calidad: {recording.quality} • Tamaño: ~{recording.calculatedSize}
      </div>
    </div>
  );
};