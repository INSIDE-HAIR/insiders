import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { EmailInput } from "../../atoms/controls/EmailInput";
import { LabeledSelect } from "../../atoms/controls/LabeledSelect";
import { cn } from "@/src/lib/utils";

export interface MemberAddFormProps {
  onAddMember: (email: string, role: "ROLE_UNSPECIFIED" | "COHOST") => boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Formulario para agregar nuevos miembros a una sala
 * Incluye validación de email y selección de rol
 */
export const MemberAddForm: React.FC<MemberAddFormProps> = ({
  onAddMember,
  disabled,
  className,
}) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ROLE_UNSPECIFIED" | "COHOST">(
    "ROLE_UNSPECIFIED"
  );

  const roleOptions = [
    {
      value: "ROLE_UNSPECIFIED",
      label: "Participante",
    },
    {
      value: "COHOST",
      label: "Co-anfitrión",
    },
  ];

  const handleSubmit = () => {
    if (!email.trim()) return;

    const success = onAddMember(email.trim(), role);
    if (success) {
      setEmail("");
      setRole("ROLE_UNSPECIFIED");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className='flex gap-2'>
        <div className='flex-1'>
          <EmailInput
            value={email}
            onChange={setEmail}
            placeholder='email@ejemplo.com'
            onKeyPress={handleKeyPress}
            disabled={disabled}
          />
        </div>

        <LabeledSelect
          label='Rol'
          value={role}
          onValueChange={(value) =>
            setRole(value as "ROLE_UNSPECIFIED" | "COHOST")
          }
          options={roleOptions}
          selectClassName='w-40'
          disabled={disabled}
        />

        <Button
          type='button'
          onClick={handleSubmit}
          disabled={!email.trim() || disabled}
          size='icon'
        >
          <PlusIcon className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
};
