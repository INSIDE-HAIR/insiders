import React from "react";
import { LabeledSelect } from "../../atoms/controls/LabeledSelect";

export interface ReactionRestrictionSelectorProps {
  value: "NO_RESTRICTION" | "HOSTS_ONLY";
  onChange: (value: "NO_RESTRICTION" | "HOSTS_ONLY") => void;
  disabled?: boolean;
}

/**
 * Selector para restricciones de reacciones en una sala
 */
export const ReactionRestrictionSelector: React.FC<ReactionRestrictionSelectorProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const options = [
    {
      value: "NO_RESTRICTION",
      label: "Todos pueden reaccionar",
    },
    {
      value: "HOSTS_ONLY",
      label: "Solo organizadores",
    },
  ];

  const tooltipContent = (
    <>
      <strong>Control de Reacciones:</strong>
      <br />
      Determina quién puede enviar reacciones (emojis, &ldquo;me gusta&rdquo;, etc.)
      durante la reunión.
    </>
  );

  return (
    <LabeledSelect
      id="reaction-restriction"
      label="Restricción de Reacciones"
      tooltip={tooltipContent}
      value={value}
      onValueChange={(v) => onChange(v as typeof value)}
      options={options}
      disabled={disabled}
    />
  );
};