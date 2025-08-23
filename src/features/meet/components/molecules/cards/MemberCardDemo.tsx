import React, { useState } from "react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { UserAvatar } from "../../atoms/display/UserAvatar";
import { DeleteButton } from "../../atoms/buttons/DeleteButton";
import { Spinner } from "../../atoms/loading/Spinner";

// Tipos de roles exactos de Google Meet API v2
export type MeetApiRole = "COHOST" | "ROLE_UNSPECIFIED";

export interface MemberDemo {
  name: string;
  email: string;
  role: MeetApiRole;
  avatar?: string;
  // Campos adicionales que puede devolver la API
  isCohost?: boolean;
  joinedAt?: string | null;
  displayName?: string;
}

// Funciones de mapeo entre API y frontend
export const roleApiToDisplay = (apiRole: MeetApiRole): string => {
  switch (apiRole) {
    case "COHOST":
      return "Co-anfitrión";
    case "ROLE_UNSPECIFIED":
    default:
      return "Participante";
  }
};

export const roleDisplayToApi = (displayRole: string): MeetApiRole => {
  switch (displayRole) {
    case "Co-anfitrión":
      return "COHOST";
    case "Participante":
    default:
      return "ROLE_UNSPECIFIED";
  }
};

export interface MemberCardDemoProps {
  member: MemberDemo;
  onDelete?: (member: MemberDemo) => void;
  onRoleChange?: (member: MemberDemo, newRole: MeetApiRole) => Promise<void>;
  showDeleteButton?: boolean;
  showRoleSelector?: boolean;
  className?: string;
}

/**
 * Card molecular para mostrar información de miembros
 * Replica exactamente la apariencia del ResponsiveModalDemo
 * 
 * @example
 * <MemberCardDemo 
 *   member={{
 *     name: "Juan Pérez",
 *     email: "juan.perez@empresa.com", 
 *     role: "COHOST"
 *   }}
 *   onDelete={(member) => console.log('Eliminar:', member.email)}
 *   onRoleChange={async (member, newRole) => {
 *     console.log('Cambiar rol:', member.email, newRole);
 *     // Simular API call
 *     await new Promise(resolve => setTimeout(resolve, 1000));
 *   }}
 *   showDeleteButton={true}
 *   showRoleSelector={true}
 * />
 */
export const MemberCardDemo: React.FC<MemberCardDemoProps> = ({
  member,
  onDelete,
  onRoleChange,
  showDeleteButton = true,
  showRoleSelector = true,
  className
}) => {
  
  // Estado para loading optimistic
  const [optimisticRole, setOptimisticRole] = useState<MeetApiRole | null>(null);
  const [isChangingRole, setIsChangingRole] = useState(false);
  
  // Usar rol optimistic si existe, sino el rol real
  const displayRole = optimisticRole || member.role;
  
  const handleDelete = () => {
    onDelete?.(member);
  };

  const handleRoleChange = async (newRole: MeetApiRole) => {
    if (newRole !== member.role && onRoleChange) {
      // Optimistic update: mostrar el cambio inmediatamente
      setOptimisticRole(newRole);
      setIsChangingRole(true);
      
      try {
        await onRoleChange(member, newRole);
        // Si el cambio fue exitoso, limpiar el estado optimistic
        setOptimisticRole(null);
      } catch (error) {
        // Si falla, revertir al rol original
        setOptimisticRole(null);
        console.error('Error changing role:', error);
      } finally {
        setIsChangingRole(false);
      }
    }
  };

  // Determinar el color del badge según el rol - usando tipos de API
  const getRoleBadgeClass = (role: MeetApiRole) => {
    return role === 'COHOST' 
      ? 'bg-blue-900 text-blue-100 hover:bg-blue-800'
      : 'bg-gray-900 text-gray-100 hover:bg-gray-800';
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-opacity",
      isChangingRole && "opacity-75",
      className
    )}>
      <div className="flex items-center gap-3">
        <UserAvatar 
          name={member.name}
          src={member.avatar}
        />
        
        <div>
          <p className="font-medium text-sm">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.email}</p>
          
          {showRoleSelector ? (
            // Selector de rol rápido con loading
            <div className="flex items-center gap-1.5 mt-1">
              <select 
                value={displayRole}
                onChange={(e) => handleRoleChange(e.target.value as MeetApiRole)}
                disabled={isChangingRole}
                className={cn(
                  "text-xs px-2 py-1 rounded border-0 cursor-pointer transition-opacity",
                  getRoleBadgeClass(displayRole),
                  isChangingRole && "opacity-70 cursor-not-allowed"
                )}
              >
                <option value="ROLE_UNSPECIFIED">Participante</option>
                <option value="COHOST">Co-anfitrión</option>
              </select>
              
              {/* Spinner de loading durante cambio de rol */}
              {isChangingRole && (
                <Spinner 
                  size="sm" 
                  variant="primary"
                  className="ml-1" 
                />
              )}
            </div>
          ) : (
            // Badge estático cuando no se permite cambio
            <Badge className={cn(
              "text-xs mt-1",
              getRoleBadgeClass(displayRole)
            )}>
              {roleApiToDisplay(displayRole)}
            </Badge>
          )}
        </div>
      </div>
      
      {showDeleteButton && (
        <DeleteButton
          onDelete={handleDelete}
          ariaLabel={`Eliminar ${member.email}`}
        />
      )}
    </div>
  );
};