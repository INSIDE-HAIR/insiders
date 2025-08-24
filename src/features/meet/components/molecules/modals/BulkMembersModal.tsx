import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { useToast } from "@/src/hooks/use-toast";
import { UserPlusIcon, UserIcon } from "@heroicons/react/24/outline";

export interface BulkMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "overwrite";
  selectedRoomIds: string[];
  selectedRoomCount: number;
  onBulkMemberAction: (emails: string[], roles: string[], mode: "add" | "overwrite") => Promise<void>;
  isLoading?: boolean;
}

interface MemberEntry {
  email: string;
  role: string;
}

/**
 * Modal para gestión masiva de miembros
 * Permite agregar miembros a múltiples salas o sobreescribir los miembros existentes
 */
export const BulkMembersModal: React.FC<BulkMembersModalProps> = ({
  isOpen,
  onClose,
  mode,
  selectedRoomIds,
  selectedRoomCount,
  onBulkMemberAction,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentRole, setCurrentRole] = useState("ROLE_UNSPECIFIED");

  const handleAddMember = () => {
    if (currentEmail.trim()) {
      const newMember: MemberEntry = {
        email: currentEmail.trim(),
        role: currentRole
      };
      
      // Check if email already exists
      if (members.some(m => m.email === newMember.email)) {
        toast({
          title: "Email duplicado",
          description: "Este email ya está en la lista",
          variant: "destructive"
        });
        return;
      }

      setMembers(prev => [...prev, newMember]);
      setCurrentEmail("");
      setCurrentRole("ROLE_UNSPECIFIED");
    }
  };

  const handleRemoveMember = (index: number) => {
    setMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddMember();
    }
  };

  const handleSubmit = async () => {
    if (members.length === 0) {
      toast({
        title: "Sin miembros",
        description: "Agrega al menos un miembro para continuar",
        variant: "destructive"
      });
      return;
    }

    try {
      const emails = members.map(m => m.email);
      const roles = members.map(m => m.role);
      
      console.log(`🔧 Bulk ${mode} - submitting:`, { emails, roles, mode });
      
      await onBulkMemberAction(emails, roles, mode);
      
      // Reset form and close modal
      setMembers([]);
      setCurrentEmail("");
      setCurrentRole("ROLE_UNSPECIFIED");
      onClose();
      
      // Show success message (detailed breakdown will be shown by the bulk operation)
      const resultMessage = mode === "add" ? "Miembros agregados/actualizados" : "Miembros sobreescritos";
      const resultDescription = `Operación completada en ${selectedRoomCount} sala${selectedRoomCount > 1 ? 's' : ''}`;
      
      toast({
        title: resultMessage,
        description: resultDescription,
      });
    } catch (error) {
      console.error("Error in bulk member modal:", error);
      // Error is handled by the parent component
    }
  };

  const handleCancel = () => {
    // Don't allow closing while loading
    if (isLoading) return;
    
    setMembers([]);
    setCurrentEmail("");
    setCurrentRole("ROLE_UNSPECIFIED");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={isLoading ? undefined : handleCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "add" ? (
              <UserPlusIcon className="h-5 w-5" />
            ) : (
              <UserIcon className="h-5 w-5" />
            )}
            {mode === "add" ? "Agregar Miembros" : "Sobreescribir Miembros"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" 
              ? `Agregar miembros adicionales a ${selectedRoomCount} sala${selectedRoomCount > 1 ? 's' : ''} seleccionada${selectedRoomCount > 1 ? 's' : ''}. Si un miembro ya existe con un rol diferente, se actualizará automáticamente.`
              : `Reemplazar todos los miembros existentes en ${selectedRoomCount} sala${selectedRoomCount > 1 ? 's' : ''} seleccionada${selectedRoomCount > 1 ? 's' : ''}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add member form */}
          <div className="flex items-center gap-2 mb-4">
            <UserPlusIcon className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-base">
              {mode === "add" ? "Agregar Miembro" : "Nuevo Miembro"}
            </h3>
          </div>
          
          {mode === "add" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-md mb-4">
              <div className="flex items-start gap-2">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200">Actualización de roles automática</p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Si un miembro ya existe pero con un rol diferente, se actualizará automáticamente al nuevo rol especificado.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
              placeholder="email@ejemplo.com"
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            
            <select 
              className="w-40 px-3 py-2 border border-input rounded-md text-sm"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              disabled={isLoading}
            >
              <option value="ROLE_UNSPECIFIED">Participante</option>
              <option value="COHOST">Co-anfitrión</option>
            </select>
            
            <Button
              onClick={handleAddMember}
              disabled={isLoading || !currentEmail.trim()}
              className="gap-1"
            >
              <UserPlusIcon className="h-4 w-4" />
              Agregar
            </Button>
          </div>

          {/* Members list */}
          {members.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">
                    Miembros a {mode === "add" ? "agregar" : "establecer"} ({members.length})
                  </h4>
                  <Badge variant="secondary">
                    {selectedRoomCount} sala{selectedRoomCount > 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-1 border rounded-md p-2">
                  {members.map((member, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span>{member.email}</span>
                        <Badge variant="outline" className="text-xs">
                          {member.role === "COHOST" ? "Co-anfitrión" : "Participante"}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(index)}
                        disabled={isLoading}
                        className="text-red-500 hover:text-red-700 p-1 h-6"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Warning for overwrite mode */}
          {mode === "overwrite" && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md mb-4">
              <div className="flex items-start gap-2">
                <svg className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div className="text-sm">
                  <p className="font-medium text-red-800 dark:text-red-200">⚠️ SOBREESCRIBIR MIEMBROS</p>
                  <p className="text-red-700 dark:text-red-300">
                    Se eliminarán <strong>TODOS</strong> los miembros existentes de las {selectedRoomCount} salas seleccionadas.<br/>
                    {members.length > 0 
                      ? `Después se agregarán únicamente los ${members.length} miembro${members.length > 1 ? 's' : ''} de esta lista.`
                      : "Si no agregas miembros, las salas quedarán sin miembros."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || members.length === 0}
            className="gap-2"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : mode === "add" ? (
              <UserPlusIcon className="h-4 w-4" />
            ) : (
              <UserIcon className="h-4 w-4" />
            )}
            {isLoading 
              ? (mode === "add" ? "Agregando miembros..." : "Eliminando y reemplazando...")
              : (mode === "add" ? `Agregar a ${selectedRoomCount} sala${selectedRoomCount > 1 ? 's' : ''}` : `Eliminar todos y agregar ${members.length}`)
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};