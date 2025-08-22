import React from "react";
import { LabeledSwitch } from "../../atoms/controls/LabeledSwitch";

export interface DefaultViewerToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

/**
 * Toggle para configurar si nuevos participantes entran como espectadores
 */
export const DefaultViewerToggle: React.FC<DefaultViewerToggleProps> = ({
  enabled,
  onChange,
  disabled,
}) => {
  return (
    <LabeledSwitch
      id="default-viewer"
      label="Unirse como Espectador"
      description="Nuevos participantes se unen como espectadores"
      tooltip={
        <>
          <strong>Modo Espectador:</strong>
          <br />
          Los nuevos participantes entrarán solo con permisos de
          visualización. El anfitrión puede promocionarlos a participantes
          activos después.
        </>
      }
      checked={enabled}
      onCheckedChange={onChange}
      disabled={disabled}
    />
  );
};