import React from "react";
import { LabeledSwitch } from "../../atoms/controls/LabeledSwitch";

export interface RecordingToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

/**
 * Toggle para activar/desactivar la grabación automática
 */
export const RecordingToggle: React.FC<RecordingToggleProps> = ({
  enabled,
  onChange,
  disabled,
}) => {
  return (
    <LabeledSwitch
      id="auto-recording"
      label="Grabación Automática"
      description="Las reuniones se grabarán automáticamente al iniciar"
      tooltip={
        <>
          <strong>Grabación Automática:</strong>
          <br />
          La reunión se grabará automáticamente cuando comience. Los archivos
          se guardan en Google Drive del organizador. Los participantes serán
          notificados.
        </>
      }
      checked={enabled}
      onCheckedChange={onChange}
      disabled={disabled}
    />
  );
};