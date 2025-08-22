import React from "react";
import { LabeledSwitch } from "../../atoms/controls/LabeledSwitch";

export interface EntryPointsToggleProps {
  restricted: boolean;
  onChange: (restricted: boolean) => void;
  disabled?: boolean;
}

/**
 * Toggle para restringir puntos de entrada de una sala
 */
export const EntryPointsToggle: React.FC<EntryPointsToggleProps> = ({
  restricted,
  onChange,
  disabled,
}) => {
  return (
    <LabeledSwitch
      id="restrict-entry"
      label="Restringir Puntos de Entrada"
      description="Limita el acceso solo a la aplicación que creó la sala"
      tooltip={
        <>
          <strong>Control de Aplicaciones:</strong>
          <br />• <strong>Desactivado:</strong> Se puede acceder desde
          cualquier aplicación (Google Meet, Calendar, etc.)
          <br />• <strong>Activado:</strong> Solo la aplicación que creó la
          sala puede acceder (más restrictivo)
        </>
      }
      checked={restricted}
      onCheckedChange={onChange}
      disabled={disabled}
    />
  );
};