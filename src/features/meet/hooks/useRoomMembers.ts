import { useState, useCallback, useMemo } from "react";
import { useToast } from "@/src/hooks/use-toast";
import { z } from "zod";

export interface RoomMember {
  email: string;
  role: "ROLE_UNSPECIFIED" | "COHOST";
  displayName?: string;
  joinedAt?: string;
  source?: string;
}

export interface MemberFilters {
  searchTerm: string;
  roleFilter: "ALL" | "COHOST" | "ROLE_UNSPECIFIED";
}

/**
 * Hook para manejar la lógica de miembros de una sala
 * Incluye filtrado, validación y operaciones CRUD
 */
export const useRoomMembers = (initialMembers: RoomMember[] = []) => {
  const { toast } = useToast();
  const [members, setMembers] = useState<RoomMember[]>(initialMembers);
  const [filters, setFilters] = useState<MemberFilters>({
    searchTerm: "",
    roleFilter: "ALL",
  });

  // Agregar miembro con validación
  const addMember = useCallback((email: string, role: RoomMember["role"]) => {
    // Validar email
    const emailValidation = z.string().email().safeParse(email);
    if (!emailValidation.success) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      });
      return false;
    }

    // Verificar si ya existe
    if (members.some((m) => m.email.toLowerCase() === email.toLowerCase())) {
      toast({
        title: "Miembro duplicado",
        description: "Este email ya está en la lista",
        variant: "destructive",
      });
      return false;
    }

    // Agregar miembro
    const newMember: RoomMember = {
      email: email.toLowerCase(),
      role,
      joinedAt: new Date().toISOString(),
      source: "manual",
    };

    setMembers((prev) => [...prev, newMember]);
    
    toast({
      title: "Miembro agregado",
      description: `${email} agregado como ${role === "COHOST" ? "co-anfitrión" : "participante"}`,
    });
    
    return true;
  }, [members, toast]);

  // Remover miembro
  const removeMember = useCallback((email: string) => {
    setMembers((prev) => prev.filter((m) => m.email !== email));
    
    toast({
      title: "Miembro removido",
      description: `${email} ha sido removido de la lista`,
    });
  }, [toast]);

  // Cambiar rol de miembro
  const changeMemberRole = useCallback((email: string, newRole: RoomMember["role"]) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.email === email ? { ...member, role: newRole } : member
      )
    );
    
    toast({
      title: "Rol actualizado",
      description: `${email} ahora es ${newRole === "COHOST" ? "co-anfitrión" : "participante"}`,
    });
  }, [toast]);

  // Filtros
  const setSearchTerm = useCallback((term: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: term }));
  }, []);

  const setRoleFilter = useCallback((filter: MemberFilters["roleFilter"]) => {
    setFilters((prev) => ({ ...prev, roleFilter: filter }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      roleFilter: "ALL",
    });
  }, []);

  // Miembros filtrados
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Filtro por búsqueda
      const searchMatch =
        filters.searchTerm === "" ||
        member.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        member.displayName?.toLowerCase().includes(filters.searchTerm.toLowerCase());

      // Filtro por rol
      const roleMatch =
        filters.roleFilter === "ALL" || member.role === filters.roleFilter;

      return searchMatch && roleMatch;
    });
  }, [members, filters]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = members.length;
    const cohosts = members.filter((m) => m.role === "COHOST").length;
    const participants = total - cohosts;

    return {
      total,
      cohosts,
      participants,
      hasMembers: total > 0,
      hasFiltered: filteredMembers.length !== total,
    };
  }, [members, filteredMembers]);

  // Validaciones
  const validateMembers = useCallback(() => {
    const errors: string[] = [];

    if (members.length === 0) {
      // No es error, solo advertencia
      return { isValid: true, errors: [], warnings: ["No hay miembros agregados"] };
    }

    // Verificar emails duplicados
    const emails = members.map((m) => m.email.toLowerCase());
    const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
    if (duplicates.length > 0) {
      errors.push(`Emails duplicados: ${duplicates.join(", ")}`);
    }

    // Verificar al menos un co-anfitrión si hay más de 5 miembros
    const cohosts = members.filter((m) => m.role === "COHOST").length;
    if (members.length > 5 && cohosts === 0) {
      errors.push("Se recomienda tener al menos un co-anfitrión para salas grandes");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }, [members]);

  // Resetear
  const reset = useCallback(() => {
    setMembers([]);
    clearFilters();
  }, [clearFilters]);

  // Bulk operations
  const removeSelectedMembers = useCallback((emails: string[]) => {
    setMembers((prev) => prev.filter((m) => !emails.includes(m.email)));
    
    toast({
      title: "Miembros removidos",
      description: `${emails.length} miembro(s) removido(s)`,
    });
  }, [toast]);

  const promoteToCohost = useCallback((emails: string[]) => {
    setMembers((prev) =>
      prev.map((member) =>
        emails.includes(member.email) ? { ...member, role: "COHOST" } : member
      )
    );
    
    toast({
      title: "Miembros promocionados",
      description: `${emails.length} miembro(s) promocionado(s) a co-anfitrión`,
    });
  }, [toast]);

  return {
    // State
    members,
    filteredMembers,
    filters,
    stats,
    
    // Actions
    addMember,
    removeMember,
    changeMemberRole,
    
    // Filters
    setSearchTerm,
    setRoleFilter,
    clearFilters,
    
    // Bulk operations
    removeSelectedMembers,
    promoteToCohost,
    
    // Utils
    validateMembers,
    reset,
  };
};