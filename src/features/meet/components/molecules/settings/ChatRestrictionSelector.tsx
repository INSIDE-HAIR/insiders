import React from "react";
import { LabeledSelect } from "../../atoms/controls/LabeledSelect";

export interface ChatRestrictionSelectorProps {
  value: "NO_RESTRICTION" | "HOSTS_ONLY";
  onChange: (value: "NO_RESTRICTION" | "HOSTS_ONLY") => void;
  disabled?: boolean;
}

/**
 * Selector para restricciones de chat en una sala
 */
export const ChatRestrictionSelector: React.FC<ChatRestrictionSelectorProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const options = [
    {
      value: "NO_RESTRICTION",
      label: "Todos pueden chatear",
    },
    {
      value: "HOSTS_ONLY",
      label: "Solo organizadores",
    },
  ];

  const tooltipContent = (
    <>
      <strong>Control de Chat:</strong>
      <br />
      Determina quién puede enviar mensajes en el chat durante la reunión.
    </>
  );

  return (
    <LabeledSelect
      id="chat-restriction"
      label="Restricción de Chat"
      tooltip={tooltipContent}
      value={value}
      onValueChange={(v) => onChange(v as typeof value)}
      options={options}
      disabled={disabled}
    />
  );
};