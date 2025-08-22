import React from "react";
import { LabeledSwitch } from "../../atoms/controls/LabeledSwitch";

export interface SmartNotesToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

/**
 * Toggle para activar/desactivar las notas inteligentes
 */
export const SmartNotesToggle: React.FC<SmartNotesToggleProps> = ({
  enabled,
  onChange,
  disabled,
}) => {
  return (
    <LabeledSwitch
      id="auto-smart-notes"
      label="Notas Inteligentes"
      description="Genera resúmenes y puntos clave automáticamente"
      tooltip={
        <>
          <strong>Notas Inteligentes:</strong>
          <br />
          Genera automáticamente resúmenes, puntos clave, acciones y decisiones
          de la reunión usando IA. Se guarda como documento de Google Docs.
        </>
      }
      checked={enabled}
      onCheckedChange={onChange}
      disabled={disabled}
    />
  );
};