import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { useToast } from "@/src/hooks/use-toast";

export interface AddMemberFormProps {
  onAddMember?: (email: string, role: string) => void;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Formulario molecular para agregar miembros
 * Replica exactamente la funcionalidad del ResponsiveModalDemo
 * 
 * @example
 * <AddMemberForm 
 *   onAddMember={(email, role) => console.log('Agregar:', email, role)}
 *   onRefresh={() => console.log('Refrescar lista')}
 * />
 */
export const AddMemberForm: React.FC<AddMemberFormProps> = ({
  onAddMember,
  onRefresh,
  className
}) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("ROLE_UNSPECIFIED");

  const handleSubmit = () => {
    if (email.trim()) {
      onAddMember?.(email.trim(), role);
      setEmail(""); // Limpiar después de agregar
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleRefresh = () => {
    toast({
      title: "Actualizando lista",
      description: "Refrescando la lista de miembros...",
    });
    onRefresh?.();
  };

  return (
    <div className={cn("space-y-4", className)}>
      
      {/* Header con icono - exacto del ResponsiveModalDemo */}
      <div className="flex items-center gap-2 mb-4">
        <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        <h3 className="font-medium text-base">Agregar Miembro</h3>
      </div>
      
      {/* Formulario - layout exacto */}
      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
          placeholder="email@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        
        <select 
          className="w-40 px-3 py-2 border border-input rounded-md text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="ROLE_UNSPECIFIED">Participante</option>
          <option value="COHOST">Co-anfitrión</option>
        </select>
        
        <Button
          onClick={handleSubmit}
          className="gap-1"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Agregar
        </Button>
      </div>
      
      {/* Botón refresh - exacto del ResponsiveModalDemo */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRefresh}
        className="gap-2"
      >
        <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refrescar lista
      </Button>
      
    </div>
  );
};