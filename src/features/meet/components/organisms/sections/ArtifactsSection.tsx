import React from "react";
import {
  RecordingToggle,
  TranscriptionToggle,
  SmartNotesToggle,
} from "../../molecules/settings";
import { cn } from "@/src/lib/utils";

export interface ArtifactsSectionProps {
  autoRecording: boolean;
  autoTranscription: boolean;
  autoSmartNotes: boolean;
  onRecordingChange: (enabled: boolean) => void;
  onTranscriptionChange: (enabled: boolean) => void;
  onSmartNotesChange: (enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Sección de configuración de artefactos automáticos
 * Agrupa las opciones de grabación, transcripción y notas inteligentes
 */
export const ArtifactsSection: React.FC<ArtifactsSectionProps> = ({
  autoRecording,
  autoTranscription,
  autoSmartNotes,
  onRecordingChange,
  onTranscriptionChange,
  onSmartNotesChange,
  disabled,
  className,
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-medium">Artefactos Automáticos</h4>
      
      <RecordingToggle
        enabled={autoRecording}
        onChange={onRecordingChange}
        disabled={disabled}
      />
      
      <TranscriptionToggle
        enabled={autoTranscription}
        onChange={onTranscriptionChange}
        disabled={disabled}
      />
      
      <SmartNotesToggle
        enabled={autoSmartNotes}
        onChange={onSmartNotesChange}
        disabled={disabled}
      />
    </div>
  );
};