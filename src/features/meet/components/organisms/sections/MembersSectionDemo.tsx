import React, { useState, useMemo } from "react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { UsersIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/src/hooks/use-toast";
import { AddMemberForm } from "../../molecules/forms/AddMemberForm";
import { SearchInput } from "../../molecules/forms/SearchInput";
import { FilterSelect, FilterOption } from "../../molecules/forms/FilterSelect";
import { MemberCardDemo, MemberDemo, roleApiToDisplay, type MeetApiRole } from "../../molecules/cards/MemberCardDemo";
import { LoadingMessage } from "../../atoms/loading/LoadingMessage";
import { Spinner } from "../../atoms/loading/Spinner";

export interface MembersSectionDemoData {
  members: MemberDemo[];
  totalMembers: number;
  activeMembers: number;
}

export interface MembersSectionDemoProps {
  data: MembersSectionDemoData;
  loading?: boolean;
  onAddMember?: (email: string, role: string) => void;
  onDeleteMember?: (member: MemberDemo) => void;
  onRoleChange?: (member: MemberDemo, newRole: MeetApiRole) => Promise<void>;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Sección Members completa usando componentes atómicos
 * Replica exactamente la funcionalidad del ResponsiveModalDemo
 * 
 * @example
 * <MembersSectionDemo 
 *   data={modalDummyData.members}
 *   loading={false}
 *   onAddMember={(email, role) => console.log('Agregar:', email, role)}
 *   onDeleteMember={(member) => console.log('Eliminar:', member.email)}
 *   onRoleChange={(member, newRole) => console.log('Cambiar rol:', member.email, newRole)}
 *   onRefresh={() => console.log('Refrescar')}
 * />
 */
export const MembersSectionDemo: React.FC<MembersSectionDemoProps> = ({
  data,
  loading = false,
  onAddMember,
  onDeleteMember,
  onRoleChange,
  onRefresh,
  className
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Filtros de rol con contadores dinámicos
  const filterOptions: FilterOption[] = useMemo(() => {
    const members = data.members || [];
    const cohostCount = members.filter(m => m.role === "COHOST").length;
    const participantCount = members.filter(m => m.role === "ROLE_UNSPECIFIED").length;
    
    return [
      { value: "ALL", label: "Todos", count: members.length },
      { value: "COHOST", label: "Co-anfitrión", count: cohostCount },
      { value: "ROLE_UNSPECIFIED", label: "Participante", count: participantCount },
    ];
  }, [data.members]);

  // Filtrar miembros según búsqueda y rol
  const filteredMembers = useMemo(() => {
    const members = data.members || [];
    return members.filter(member => {
      // Filtro por búsqueda
      const matchesSearch = searchQuery === "" || 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filtro por rol
      const matchesRole = roleFilter === "ALL" ||
        (roleFilter === "COHOST" && member.role === "COHOST") ||
        (roleFilter === "ROLE_UNSPECIFIED" && member.role === "ROLE_UNSPECIFIED");
      
      return matchesSearch && matchesRole;
    });
  }, [data.members, searchQuery, roleFilter]);

  const handleAddMember = (email: string, role: string) => {
    // Mostrar toast de cargando
    toast({
      title: "Agregando miembro...",
      description: `Agregando ${email} como ${role === "COHOST" ? "co-anfitrión" : "participante"}`,
    });

    console.log('➕ Agregar miembro:', email, role);
    onAddMember?.(email, role);
    
    // Simular éxito después de un delay (en la implementación real sería después de la respuesta de la API)
    setTimeout(() => {
      toast({
        title: "Miembro agregado",
        description: `${email} se agregó exitosamente como ${role === "COHOST" ? "co-anfitrión" : "participante"}`,
      });
    }, 1000);
  };

  const handleDeleteMember = (member: MemberDemo) => {
    console.log('🗑️ Eliminar miembro:', member.email);
    
    // Mostrar toast de confirmación y ejecutar acción
    toast({
      title: "Miembro eliminado",
      description: `${member.name || member.email} ha sido removido del espacio`,
      variant: "destructive",
    });
    
    onDeleteMember?.(member);
  };

  const handleRoleChange = async (member: MemberDemo, newRole: MeetApiRole) => {
    if (onRoleChange) {
      console.log('🔄 Cambiar rol:', member.email, 'de', member.role, 'a', newRole);
      
      // Mostrar toast de cargando
      toast({
        title: "Actualizando rol...",
        description: `Cambiando rol de ${member.name || member.email}`,
      });
      
      try {
        await onRoleChange(member, newRole);
        
        // Toast de éxito
        toast({
          title: "Rol actualizado",
          description: `${member.name || member.email} ahora es ${roleApiToDisplay[newRole]}`,
        });
      } catch (error) {
        // Toast de error
        toast({
          title: "Error al actualizar rol",
          description: "No se pudo cambiar el rol del miembro. Intenta nuevamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRefresh = () => {
    onRefresh?.();
    console.log('🔄 Refrescar lista');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
  };

  return (
    <div className={cn("space-y-6", className)}>
      
      {/* Sección 1: Agregar Miembro */}
      <AddMemberForm
        onAddMember={handleAddMember}
        onRefresh={handleRefresh}
      />

      {/* Sección 2: Lista de Miembros */}
      <div className="space-y-4">
        {/* Header con contador - exacto del ResponsiveModalDemo */}
        <div className="flex items-center gap-2 mb-4">
          <UsersIcon className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-base">Miembros Actuales</h3>
          {loading ? (
            <div className="h-5 bg-muted rounded w-16 animate-pulse" />
          ) : (
            <Badge variant="outline">
              {data.activeMembers || 0} de {data.totalMembers || 0}
            </Badge>
          )}
        </div>
        
        {/* Filtros de búsqueda - usando molecules existentes */}
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchInput
              placeholder="Buscar por nombre o email..."
              onSearch={handleSearch}
              debounceMs={300}
              showClearButton={true}
            />
          </div>
          
          <FilterSelect
            options={filterOptions}
            value={roleFilter}
            onValueChange={handleRoleFilter}
            showCounts={true}
            clearable={false}
            className="w-40"
          />
        </div>

        {/* Lista scrollable de miembros - exacto del ResponsiveModalDemo */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {loading ? (
            // Skeleton loading para 3 members
            <>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`member-skeleton-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {/* Avatar skeleton */}
                    <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                    
                    <div>
                      {/* Nombre skeleton */}
                      <div className="h-4 bg-muted rounded w-24 mb-1 animate-pulse" />
                      {/* Email skeleton */}
                      <div className="h-3 bg-muted rounded w-32 mb-2 animate-pulse" />
                      {/* Badge skeleton */}
                      <div className="h-5 bg-muted rounded w-20 animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Delete button skeleton */}
                  <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                </div>
              ))}
              
              {/* Mensaje de carga centrado */}
              <div className="text-center py-4">
                <LoadingMessage 
                  message="Cargando miembros del espacio..." 
                  variant="primary" 
                  size="md"
                  spinnerSize="md"
                />
              </div>
            </>
          ) : (
            <>
              {filteredMembers.map((member, index) => (
                <MemberCardDemo
                  key={`${member.email}-${index}`}
                  member={member}
                  onDelete={handleDeleteMember}
                  onRoleChange={handleRoleChange}
                  showDeleteButton={true}
                  showRoleSelector={true}
                />
              ))}
              
              {filteredMembers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery || roleFilter !== "ALL" 
                    ? "No se encontraron miembros con los filtros aplicados"
                    : "No hay miembros en esta sala"
                  }
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
    </div>
  );
};