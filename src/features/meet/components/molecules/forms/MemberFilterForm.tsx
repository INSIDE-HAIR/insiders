import React from "react";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { LabeledSelect } from "../../atoms/controls/LabeledSelect";
import { cn } from "@/src/lib/utils";

export interface MemberFilterFormProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  roleFilter: "ALL" | "COHOST" | "ROLE_UNSPECIFIED";
  onRoleFilterChange: (filter: "ALL" | "COHOST" | "ROLE_UNSPECIFIED") => void;
  className?: string;
}

/**
 * Formulario de filtros para la lista de miembros
 * Permite buscar por email y filtrar por rol
 */
export const MemberFilterForm: React.FC<MemberFilterFormProps> = ({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  className,
}) => {
  const roleOptions = [
    {
      value: "ALL",
      label: "Todos",
    },
    {
      value: "COHOST",
      label: "Co-anfitrión",
    },
    {
      value: "ROLE_UNSPECIFIED",
      label: "Participante",
    },
  ];

  return (
    <div className={cn("flex gap-2", className)}>
      <div className='flex-1'>
        <Label htmlFor='member-search' className='sr-only'>
          Buscar miembros
        </Label>
        <div className='relative'>
          <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            id='member-search'
            placeholder='Buscar por email...'
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className='pl-10 text-sm'
          />
        </div>
      </div>

      <LabeledSelect
        label='Filtrar por rol'
        value={roleFilter}
        onValueChange={(value) =>
          onRoleFilterChange(value as typeof roleFilter)
        }
        options={roleOptions}
        selectClassName='w-40'
      />
    </div>
  );
};
