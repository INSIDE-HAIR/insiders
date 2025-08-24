/**
 * CREATEROOMBUTTON - Botón reutilizable para crear nuevas salas
 * Componente atómico siguiendo patrón de JoinMeetingButton
 *
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState, lazy } from "react";
import { Button } from "@/src/components/ui/button";
import { PlusIcon, VideoCameraIcon, TagIcon, UsersIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";
import { useToast } from "@/src/hooks/use-toast";

// Importar modal correcto con selector de secciones
import { SectionNavigationModal } from "../../molecules/modals/SectionNavigationModal";
import { useRoomOperations } from "../../../hooks/useRoomOperations";
import { useRoomForm } from "../../../hooks/useRoomForm";

// Importar secciones existentes (lazy-loaded)
const GeneralSectionDemo = lazy(() => import("../../organisms/sections/GeneralSectionDemo").then(m => ({ default: m.GeneralSectionDemo })));
const ReferencesSectionDemo = lazy(() => import("../../organisms/sections/ReferencesSectionDemo").then(m => ({ default: m.ReferencesSectionDemo })));
const MembersSectionDemo = lazy(() => import("../../organisms/sections/MembersSectionDemo").then(m => ({ default: m.MembersSectionDemo })));
const ConfigurationSectionDemo = lazy(() => import("../../organisms/sections/ConfigurationSectionDemo").then(m => ({ default: m.ConfigurationSectionDemo })));

// Componente estable para evitar re-renders del input
const StableGeneralSection = React.memo(function StableGeneralSection({ 
  data, 
  formState, 
  validation,
  setDisplayName,
  setAccessType,
  ...props 
}: any) {
  return (
    <div className="space-y-6">
      {/* Campo nombre de la sala */}
      <div className="space-y-2">
        <label htmlFor="displayName" className="block text-sm font-medium">
          Nombre de la Sala <span className="text-red-500">*</span>
        </label>
        <input
          id="displayName"
          type="text"
          value={formState.displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Ej: Reunión de Equipo Semanal"
          maxLength={100}
          className={cn(
            "w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            validation.fieldValidations.displayName.hasErrors ? "border-red-500" : "border-gray-300"
          )}
        />
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{formState.displayName.length}/100 caracteres</span>
          {validation.fieldValidations.displayName.errors.map((error: any, idx: number) => (
            <span key={idx} className="text-red-500">{error.message}</span>
          ))}
        </div>
      </div>

      {/* Selector de tipo de acceso */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Tipo de Acceso</label>
        <select 
          value={formState.accessType}
          onChange={(e) => setAccessType(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="OPEN">Abierto - Cualquiera con el enlace puede unirse</option>
          <option value="TRUSTED">Confiable - Solo miembros de la organización</option>
          <option value="RESTRICTED">Restringido - Solo invitados específicos</option>
        </select>
      </div>
      
      {/* Vista previa usando GeneralSectionDemo */}
      <React.Suspense fallback={<div>Cargando...</div>}>
        <GeneralSectionDemo data={data} {...props} />
      </React.Suspense>
    </div>
  );
});

export interface CreateRoomButtonProps {
  /** Callback cuando se crea una sala exitosamente */
  onRoomCreated?: (room: any) => void;
  /** Callback cuando se cancela (opcional) */
  onCancel?: () => void;
  /** Texto personalizado del botón */
  children?: React.ReactNode;
  /** Tamaño del botón */
  size?: "sm" | "default" | "lg";
  /** Variante del botón */
  variant?: "default" | "secondary" | "outline";
  /** Clases CSS adicionales */
  className?: string;
  /** Si el botón está deshabilitado */
  disabled?: boolean;
  /** Mostrar como botón flotante */
  floating?: boolean;
  /** Datos de sala para duplicar (opcional) */
  duplicateFrom?: any;
  /** Abrir modal automáticamente (para duplicación) */
  autoOpen?: boolean;
}

export const CreateRoomButton: React.FC<CreateRoomButtonProps> = ({
  onRoomCreated,
  onCancel,
  children = "Crear Sala",
  size = "default",
  variant = "default", 
  className,
  disabled = false,
  floating = false,
  duplicateFrom,
  autoOpen = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(autoOpen);
  const { createRoom, isLoading, extractRoomData } = useRoomOperations();
  const { toast } = useToast();
  
  // Debug: Log props on component mount and when duplicateFrom changes
  React.useEffect(() => {
    if (duplicateFrom) {
      console.log('🚨 CreateRoomButton RECEIVED DUPLICATE DATA!!!');
      console.log('🚨 duplicateFrom:', duplicateFrom);
      console.log('🚨 duplicateFrom.members:', duplicateFrom?.members);
      console.log('🚨 autoOpen:', autoOpen);
    }
  }, [duplicateFrom, autoOpen]);
  
  // Hook del formulario de sala
  const {
    formState,
    setDisplayName,
    setAccessType,
    toggleModeration,
    toggleRestrictEntryPoints,
    toggleAutoRecording,
    toggleAutoTranscription,
    toggleAutoSmartNotes,
    toggleDefaultJoinAsViewer,
    setChatRestriction,
    setReactionRestriction,
    setPresentRestriction,
    setMembers,
    buildApiData,
    validate,
    reset,
    loadFromRoom,
    validation,
  } = useRoomForm();

  const handleCreateRoom = async () => {
    if (!validate()) return;
    
    try {
      const roomData = buildApiData();
      const createdRoom = await createRoom(roomData);
      
      // Cerrar modal
      setIsModalOpen(false);
      
      // Reset form
      reset();
      
      // Callback opcional
      onRoomCreated?.(createdRoom);
      
    } catch (error) {
      console.error('Error in CreateRoomButton:', error);
    }
  };

  // Reset form o cargar datos de duplicación cuando se abre el modal
  React.useEffect(() => {
    if (isModalOpen && duplicateFrom) {
      console.log('🚨 MODAL OPENED WITH DUPLICATE DATA!!!');
      console.log('🚨 CALLING extractRoomData...');
      
      const extractedData = extractRoomData(duplicateFrom);
      console.log('🚨 EXTRACTED DATA:', extractedData);
      console.log('🚨 EXTRACTED MEMBERS:', extractedData.members);
      
      console.log('🚨 CALLING loadFromRoom...');
      loadFromRoom(extractedData);
      console.log('🚨 loadFromRoom COMPLETED');
    } else if (isModalOpen) {
      console.log('🔍 New room mode - resetting');
      reset();
    }
  }, [isModalOpen, reset, loadFromRoom, duplicateFrom, extractRoomData]);

  // Debug: Log formState changes
  React.useEffect(() => {
    console.log('🔍 DEBUG CreateRoomButton: formState updated:', formState);
    console.log('🔍 DEBUG CreateRoomButton: formState.members:', formState.members);
  }, [formState]);

  // Abrir modal automáticamente cuando autoOpen es true
  React.useEffect(() => {
    if (autoOpen && !isModalOpen) {
      setIsModalOpen(true);
    }
  }, [autoOpen, isModalOpen]);

  // Preparar datos para las secciones
  const generalData = {
    roomId: `spaces/new-room-${Date.now()}`,
    meetingCode: "Se generará automáticamente",
    meetingLink: "Se generará automáticamente",
    accessType: {
      type: formState.accessType.toLowerCase(),
      label: formState.accessType === 'TRUSTED' ? 'Confiable' : formState.accessType === 'RESTRICTED' ? 'Restringido' : 'Abierto',
      className: formState.accessType === 'TRUSTED' ? 'bg-green-100 text-green-700' : formState.accessType === 'RESTRICTED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
    },
    status: {
      type: 'pending',
      label: 'Pendiente de crear',
      animated: false,
      showCloseButton: false
    },
    alert: {
      message: 'La sala se creará al confirmar la configuración'
    }
  };

  // Definir las secciones del modal
  const sections = [
    {
      id: "general",
      title: "General",
      icon: VideoCameraIcon,
      description: "Información básica de la sala",
      component: StableGeneralSection,
      props: {
        data: generalData
      }
    },
    {
      id: "members",
      title: "Miembros",
      icon: UsersIcon,
      description: "Gestión de participantes",
      component: MembersSectionDemo,
      props: {
        data: (() => {
          console.log('🔍 DEBUG Members Section: formState.members:', formState.members);
          const mappedMembers = formState.members.map((member, index) => ({
            id: `temp-${index}`,
            email: member.email,
            name: member.displayName || member.email,
            role: member.role,
            joinedAt: new Date().toISOString(),
            isActive: true
          }));
          console.log('🔍 DEBUG Members Section: mapped members:', mappedMembers);
          
          return {
            members: mappedMembers,
            totalMembers: formState.members.length,
            activeMembers: formState.members.length
          };
        })(),
        onAddMember: (email: string, role: string) => {
          const newMember = {
            email,
            displayName: email,
            role: role as any
          };
          setMembers([...formState.members, newMember]);
        },
        onDeleteMember: (member: any) => {
          setMembers(formState.members.filter(m => m.email !== member.email));
        }
      }
    },
    {
      id: "configuration",
      title: "Configuración", 
      icon: Cog6ToothIcon,
      description: "Opciones avanzadas de la sala",
      component: ConfigurationSectionDemo,
      props: {
        data: {
          moderation: {
            restrictEntry: {
              enabled: formState.restrictEntryPoints,
              label: "Restringir Puntos de Entrada",
              description: "Solo los puntos de entrada del proyecto Google Cloud que creó el espacio pueden unirse",
              tooltip: "entryPointAccess: ALL permite todos los puntos de entrada, CREATOR_APP_ONLY solo puntos de entrada propios"
            },
            enableModeration: {
              enabled: formState.moderation,
              label: "Activar Moderación",
              description: "Da al propietario de la reunión más control sobre funciones y participantes",
              tooltip: "moderation: Cuando está ON permite gestionar co-anfitriones y restricciones de funciones"
            },
            chatRestriction: {
              value: formState.chatRestriction,
              options: [
                { value: "NO_RESTRICTION", label: "Todos los participantes tienen permisos" },
                { value: "HOSTS_ONLY", label: "Solo el organizador y co-anfitriones tienen permisos" }
              ]
            },
            reactionRestriction: {
              value: formState.reactionRestriction,
              options: [
                { value: "NO_RESTRICTION", label: "Todos los participantes tienen permisos" },
                { value: "HOSTS_ONLY", label: "Solo el organizador y co-anfitriones tienen permisos" }
              ]
            },
            presentationRestriction: {
              value: formState.presentRestriction,
              options: [
                { value: "NO_RESTRICTION", label: "Todos los participantes tienen permisos" },
                { value: "HOSTS_ONLY", label: "Solo el organizador y co-anfitriones tienen permisos" }
              ]
            },
            defaultViewer: {
              enabled: formState.defaultJoinAsViewer,
              label: "Unirse como Espectador por Defecto",
              description: "Los usuarios se unirán como espectadores (ON) o contribuyentes (OFF) por defecto",
              tooltip: "defaultJoinAsViewerType: Define si restringir el rol por defecto asignado a usuarios como espectador"
            }
          },
          aiFeatures: {
            autoRecording: {
              enabled: formState.autoRecording,
              label: "Generación Automática de Grabación",
              description: "Define si un espacio de reunión se graba automáticamente cuando se une alguien con privilegios de grabación",
              tooltip: "recordingConfig.autoRecordingGeneration: Graba automáticamente reuniones cuando se une usuario autorizado"
            },
            autoTranscription: {
              enabled: formState.autoTranscription,
              label: "Generación Automática de Transcripción",
              description: "Define si el contenido de la reunión se transcribe automáticamente cuando se une usuario autorizado",
              tooltip: "transcriptionConfig.autoTranscriptionGeneration: Transcribe automáticamente contenido de reunión cuando se une usuario autorizado"
            },
            smartNotes: {
              enabled: formState.autoSmartNotes,
              label: "Generación Automática de Notas Inteligentes",
              description: "Define si generar automáticamente resumen y recapitulación para todos los invitados cuando se une usuario autorizado",
              tooltip: "smartNotesConfig.autoSmartNotesGeneration: Genera automáticamente resumen y recapitulación de reunión para todos los invitados de la organización cuando se une usuario autorizado"
            }
          },
          alert: {
            message: "Las configuraciones se aplicarán cuando se cree la sala"
          }
        },
        onConfigChange: async (key: string, value: boolean | string) => {
          switch (key) {
            case 'restrictEntry':
              toggleRestrictEntryPoints();
              break;
            case 'enableModeration':
              toggleModeration();
              break;
            case 'defaultViewer':
              toggleDefaultJoinAsViewer();
              break;
            case 'chatRestriction':
              setChatRestriction(value as "HOSTS_ONLY" | "NO_RESTRICTION");
              break;
            case 'reactionRestriction':
              setReactionRestriction(value as "HOSTS_ONLY" | "NO_RESTRICTION");
              break;
            case 'presentRestriction':
              setPresentRestriction(value as "HOSTS_ONLY" | "NO_RESTRICTION");
              break;
            case 'autoRecording':
              toggleAutoRecording();
              break;
            case 'autoTranscription':
              toggleAutoTranscription();
              break;
            case 'smartNotes':
              toggleAutoSmartNotes();
              break;
          }
        }
      }
    }
  ];

  // Estilos condicionales para floating button
  const floatingStyles = floating ? 
    "fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl transition-shadow" : 
    "";

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        size={size}
        variant={variant}
        disabled={disabled || isLoading}
        className={cn(
          "flex items-center gap-2",
          floatingStyles,
          className
        )}
      >
        <PlusIcon className={cn(
          "flex-shrink-0",
          size === "sm" ? "h-3 w-3" : 
          size === "lg" ? "h-5 w-5" : "h-4 w-4"
        )} />
        {children}
      </Button>

      {/* Modal con selector de secciones */}
      <SectionNavigationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          onCancel?.();
        }}
        title={duplicateFrom ? "Duplicar Sala de Meet" : "Crear Nueva Sala de Meet"}
        description={duplicateFrom ? "Revisa y ajusta la configuración de la sala duplicada" : "Configura una nueva sala de reuniones con los parámetros deseados"}
        sections={sections}
        initialSectionId="general"
        variant="bottom"
        maxHeight="85vh"
        globalProps={{
          formState,
          validation,
          isLoading,
          setDisplayName,
          setAccessType,
          toggleModeration,
          toggleRestrictEntryPoints,
          toggleAutoRecording,
          toggleAutoTranscription,
          toggleAutoSmartNotes,
          toggleDefaultJoinAsViewer,
          setChatRestriction,
          setReactionRestriction,
          setPresentRestriction,
          setMembers
        }}
        customFooter={
          <div className="flex items-center justify-between p-6 border-t">
            {/* Información del formulario */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Nombre: {formState.displayName || "Sin nombre"}</span>
              <span>•</span>
              <span>Miembros: {formState.members.length}</span>
              {validation.validation.errors.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-destructive">
                    {validation.validation.errors.length} errores
                  </span>
                </>
              )}
            </div>
            
            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateRoom}
                disabled={isLoading || validation.validation.errors.length > 0 || !formState.displayName.trim()}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Creando...
                  </div>
                ) : (
                  duplicateFrom ? "Duplicar Sala" : "Crear Sala"
                )}
              </Button>
            </div>
          </div>
        }
      />
    </>
  );
};