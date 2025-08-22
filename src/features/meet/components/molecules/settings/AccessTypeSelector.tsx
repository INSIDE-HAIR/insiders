import React from "react";
import { LabeledSelect } from "../../atoms/controls/LabeledSelect";
import { AccessTypeIcon } from "../../atoms/icons/AccessTypeIcon";

export interface AccessTypeSelectorProps {
  value: "OPEN" | "TRUSTED" | "RESTRICTED";
  onChange: (value: "OPEN" | "TRUSTED" | "RESTRICTED") => void;
  disabled?: boolean;
}

/**
 * Selector para el tipo de acceso de una sala
 */
export const AccessTypeSelector: React.FC<AccessTypeSelectorProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const options = [
    {
      value: "OPEN",
      label: "Acceso Libre",
      icon: <AccessTypeIcon type="OPEN" size="sm" />,
    },
    {
      value: "TRUSTED",
      label: "Acceso Organizacional",
      icon: <AccessTypeIcon type="TRUSTED" size="sm" />,
    },
    {
      value: "RESTRICTED",
      label: "Solo Invitados",
      icon: <AccessTypeIcon type="RESTRICTED" size="sm" />,
    },
  ];

  const tooltipContent = (
    <>
      <strong>Control de Acceso a la Reunión:</strong>
      <br />• <strong>Libre:</strong> Cualquiera con el enlace entra
      directamente
      <br />• <strong>Organizacional:</strong> Tu organización entra
      directamente, otros piden permiso
      <br />• <strong>Solo Invitados:</strong> Solo invitados específicos
      entran, otros piden permiso al anfitrión
    </>
  );

  return (
    <LabeledSelect
      id="access-type"
      label="Tipo de Acceso"
      tooltip={tooltipContent}
      value={value}
      onValueChange={(v) => onChange(v as typeof value)}
      options={options}
      placeholder="Selecciona el tipo de acceso"
      disabled={disabled}
    />
  );
};