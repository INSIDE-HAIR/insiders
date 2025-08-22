import React from "react";
import { LabeledSwitch } from "../../atoms/controls/LabeledSwitch";

export interface ModerationToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

/**
 * Toggle para activar/desactivar la moderación en una sala
 * Cuando está activa, el organizador puede controlar permisos de participantes
 */
export const ModerationToggle: React.FC<ModerationToggleProps> = ({
  enabled,
  onChange,
  disabled,
}) => {
  return (
    <LabeledSwitch
      id="moderation"
      label="Activar Moderación"
      description="El organizador controla permisos de los participantes"
      tooltip={
        <>
          <strong>Control del Anfitrión:</strong>
          <br />
          Permite al anfitrión y co-anfitriones controlar quién puede chatear,
          presentar, reaccionar y si los nuevos participantes entran como
          espectadores.
        </>
      }
      checked={enabled}
      onCheckedChange={onChange}
      disabled={disabled}
    />
  );
};