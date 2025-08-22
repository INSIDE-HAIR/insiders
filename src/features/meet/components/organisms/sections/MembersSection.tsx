import React from "react";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { ExclamationTriangleIcon, TrashIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { MemberAddForm } from "../../molecules/forms/MemberAddForm";
import { MemberFilterForm } from "../../molecules/forms/MemberFilterForm";
import { MemberCard } from "../../molecules/cards/MemberCard";
import { useRoomMembers, RoomMember } from "../../../hooks/useRoomMembers";
import { cn } from "@/src/lib/utils";

export interface MembersSectionProps {
  initialMembers?: RoomMember[];
  onMembersChange?: (members: RoomMember[]) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Sección completa de gestión de miembros
 * Incluye formulario de agregado, filtros, lista y estadísticas
 */
export const MembersSection: React.FC<MembersSectionProps> = ({
  initialMembers = [],
  onMembersChange,
  disabled = false,
  className,
}) => {
  const {
    members,
    filteredMembers,
    filters,
    stats,
    addMember,
    removeMember,
    changeMemberRole,
    setSearchTerm,
    setRoleFilter,
    clearFilters,
    removeSelectedMembers,
    promoteToCohost,
    validateMembers,
  } = useRoomMembers(initialMembers);

  // Notificar cambios al componente padre
  React.useEffect(() => {
    if (onMembersChange) {
      onMembersChange(members);
    }
  }, [members, onMembersChange]);

  // Estado de selección múltiple
  const [selectedMembers, setSelectedMembers] = React.useState<Set<string>>(new Set());

  const handleSelectMember = (email: string, selected: boolean) => {
    setSelectedMembers((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(email);
      } else {
        newSet.delete(email);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map((m) => m.email)));
    }
  };

  const handleRemoveSelected = () => {
    const emails = Array.from(selectedMembers);
    removeSelectedMembers(emails);
    setSelectedMembers(new Set());
  };

  const handlePromoteSelected = () => {
    const emails = Array.from(selectedMembers);
    promoteToCohost(emails);
    setSelectedMembers(new Set());
  };

  const validation = validateMembers();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Formulario para agregar miembros */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Agregar Participantes Iniciales</h4>
        <MemberAddForm
          onAddMember={addMember}
          disabled={disabled}
        />
      </div>

      {/* Estadísticas y filtros */}
      {stats.hasMembers && (
        <div className="space-y-3">
          {/* Header con estadísticas */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">
                Participantes ({stats.total})
              </h4>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">
                  {stats.cohosts} co-anfitrión{stats.cohosts !== 1 ? "es" : ""}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {stats.participants} participante{stats.participants !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>

            {/* Acciones masivas */}
            {selectedMembers.size > 0 && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePromoteSelected}
                  disabled={disabled}
                >
                  <UserGroupIcon className="h-3 w-3 mr-1" />
                  Promover ({selectedMembers.size})
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveSelected}
                  disabled={disabled}
                >
                  <TrashIcon className="h-3 w-3 mr-1" />
                  Remover ({selectedMembers.size})
                </Button>
              </div>
            )}
          </div>

          {/* Filtros */}
          <MemberFilterForm
            searchTerm={filters.searchTerm}
            onSearchChange={setSearchTerm}
            roleFilter={filters.roleFilter}
            onRoleFilterChange={setRoleFilter}
          />

          {/* Botón para seleccionar todos */}
          {filteredMembers.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                disabled={disabled}
              >
                {selectedMembers.size === filteredMembers.length
                  ? "Deseleccionar todo"
                  : "Seleccionar todo"}
              </Button>

              {filters.searchTerm || filters.roleFilter !== "ALL" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  Limpiar filtros
                </Button>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Lista de miembros */}
      {stats.hasMembers ? (
        <>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No se encontraron miembros que coincidan con los filtros</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="mt-2"
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-64 max-h-64">
              <div className="space-y-2 pr-3">
                {filteredMembers.map((member) => (
                  <div key={member.email} className="relative">
                    {/* Checkbox para selección múltiple */}
                    <input
                      type="checkbox"
                      checked={selectedMembers.has(member.email)}
                      onChange={(e) =>
                        handleSelectMember(member.email, e.target.checked)
                      }
                      className="absolute top-2 left-2 z-10"
                      disabled={disabled}
                    />
                    
                    <MemberCard
                      email={member.email}
                      role={member.role}
                      displayName={member.displayName}
                      joinedAt={member.joinedAt}
                      source={member.source}
                      onRemove={() => removeMember(member.email)}
                      onRoleChange={(newRole) => changeMemberRole(member.email, newRole)}
                      showRemoveButton={!disabled}
                      className={cn(
                        "pl-8", // Espacio para checkbox
                        selectedMembers.has(member.email) && "ring-2 ring-primary"
                      )}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <UserGroupIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No hay miembros agregados</p>
          <p className="text-sm">
            Los participantes recibirán una invitación por email
          </p>
        </div>
      )}

      {/* Validaciones y advertencias */}
      {validation.warnings.length > 0 && (
        <Alert>
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertDescription>
            {validation.warnings.join(". ")}
          </AlertDescription>
        </Alert>
      )}

      {/* Información adicional */}
      <Alert>
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertDescription>
          Los participantes recibirán una invitación por email para unirse a la sala.
          Los co-anfitriones tendrán permisos adicionales de moderación.
        </AlertDescription>
      </Alert>
    </div>
  );
};