import React from "react";
import { LabeledSwitch } from "../../atoms/controls/LabeledSwitch";

export interface TranscriptionToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

/**
 * Toggle para activar/desactivar la transcripción automática
 */
export const TranscriptionToggle: React.FC<TranscriptionToggleProps> = ({
  enabled,
  onChange,
  disabled,
}) => {
  return (
    <LabeledSwitch
      id="auto-transcription"
      label="Transcripción Automática"
      description="Genera transcripciones de las conversaciones"
      tooltip={
        <>
          <strong>Transcripción Automática:</strong>
          <br />
          Convierte automáticamente el audio de la reunión en texto. El
          documento se guarda en Google Drive con marcas de tiempo y
          identificación de participantes.
        </>
      }
      checked={enabled}
      onCheckedChange={onChange}
      disabled={disabled}
    />
  );
};