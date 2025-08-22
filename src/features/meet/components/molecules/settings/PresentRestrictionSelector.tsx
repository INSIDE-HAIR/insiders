import React from "react";
import { LabeledSelect } from "../../atoms/controls/LabeledSelect";

export interface PresentRestrictionSelectorProps {
  value: "NO_RESTRICTION" | "HOSTS_ONLY";
  onChange: (value: "NO_RESTRICTION" | "HOSTS_ONLY") => void;
  disabled?: boolean;
}

/**
 * Selector para restricciones de presentación en una sala
 */
export const PresentRestrictionSelector: React.FC<PresentRestrictionSelectorProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const options = [
    {
      value: "NO_RESTRICTION",
      label: "Todos pueden presentar",
    },
    {
      value: "HOSTS_ONLY",
      label: "Solo organizadores",
    },
  ];

  const tooltipContent = (
    <>
      <strong>Control de Pantalla:</strong>
      <br />
      Determina quién puede compartir pantalla, presentar documentos o mostrar
      contenido durante la reunión.
    </>
  );

  return (
    <LabeledSelect
      id="present-restriction"
      label="Restricción de Presentación"
      tooltip={tooltipContent}
      value={value}
      onValueChange={(v) => onChange(v as typeof value)}
      options={options}
      disabled={disabled}
    />
  );
};