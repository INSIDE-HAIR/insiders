/**
 * CREATEROOMMODALWITHDUPLICATE - Modal de creación con soporte para duplicar
 * Reutiliza CreateRoomModal.refactored + nuevas 4 secciones optimizadas
 * Máxima reutilización de componentes existentes
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Badge } from "@/src/components/ui/badge";
import { 
  VideoCameraIcon, 
  ExclamationTriangleIcon,
  UsersIcon,
  TagIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon
} from "@heroicons/react/24/outline";

// Importar secciones existentes (máxima reutilización)
import { GeneralSectionDemo } from "./organisms/sections/GeneralSectionDemo";
import { ReferencesSectionDemo } from "./organisms/sections/ReferencesSectionDemo";
import { MembersSectionDemo } from "./organisms/sections/MembersSectionDemo";
import { ConfigurationSectionDemo } from "./organisms/sections/ConfigurationSectionDemo";

// Importar hooks y tipos existentes
import { useRoomForm } from "../hooks/useRoomForm";
import { useRoomOperations } from "../hooks/useRoomOperations";

// Importar data mock existente
import modalDummyData from "./data/modal-dummy-data.json";

interface CreateRoomModalWithDuplicateProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => Promise<void>;
  /** Sala original para duplicar (opcional) */
  duplicateFrom?: any;
}

/**
 * Modal de creación/duplicación con 4 secciones optimizadas
 * General | Referencias | Miembros | Configuración
 */
export const CreateRoomModalWithDuplicate: React.FC<CreateRoomModalWithDuplicateProps> = ({
  isOpen,
  onClose,
  onConfirm,
  duplicateFrom,
}) => {
  // Hooks existentes (reutilización)
  const {
    formState,
    loading,
    setLoading,
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

  const { extractRoomData } = useRoomOperations();

  const [activeTab, setActiveTab] = React.useState("general");
  
  // Determinar modo
  const isDuplicateMode = !!duplicateFrom;
  const modalTitle = isDuplicateMode ? "Duplicar Sala de Meet" : "Crear Nueva Sala de Meet";
  const modalDescription = isDuplicateMode 
    ? `Crear una copia de "${duplicateFrom._metadata?.displayName || duplicateFrom.displayName || 'Sala sin nombre'}"`
    : "Configura una nueva sala de reuniones con los parámetros deseados";

  // Cargar datos cuando se abre en modo duplicate
  React.useEffect(() => {
    if (isOpen) {
      if (isDuplicateMode && duplicateFrom) {
        const roomData = extractRoomData(duplicateFrom);
        loadFromRoom(roomData);
      } else {
        reset();
      }
      setActiveTab("general");
    }
  }, [isOpen, isDuplicateMode, duplicateFrom, extractRoomData, loadFromRoom, reset]);

  const handleSubmit = async () => {
    if (!validate()) return;
    
    try {
      setLoading(true);
      const data = buildApiData();
      
      console.log("🚀 Sending room data:", JSON.stringify(data, null, 2));
      
      await onConfirm(data);
      onClose();
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setLoading(false);
    }
  };

  // Preparar data para secciones (reutilizando estructura existente)
  const generalData = {
    roomId: `spaces/new-room-${Date.now()}`,
    meetingCode: "generando...",
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
      message: isDuplicateMode ? 'Esta sala será creada como una copia de la sala original' : 'La sala se creará al confirmar la configuración'
    }
  };

  const referencesData = {
    tags: {
      assigned: [],
      available: modalDummyData.references.tags.available
    },
    groups: {
      assigned: [],
      available: modalDummyData.references.groups.available
    }
  };

  const membersData = {
    members: formState.members.map((member, index) => ({
      id: `temp-${index}`,
      email: member.email,
      name: member.displayName || member.email,
      avatar: undefined,
      role: member.role as any,
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isActive: true
    })),
    totalMembers: formState.members.length,
    activeMembers: formState.members.length
  };

  const configurationData = {
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
      message: "Las configuraciones avanzadas se aplicarán al momento de crear la sala"
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] min-h-[80dvh] max-w-[95vw] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDuplicateMode ? (
              <DocumentDuplicateIcon className="h-5 w-5 text-purple-600" />
            ) : (
              <VideoCameraIcon className="h-5 w-5 text-primary" />
            )}
            {modalTitle}
          </DialogTitle>
          <DialogDescription>
            {modalDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          {/* Panel principal con 4 tabs */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general" className="flex items-center gap-1">
                  <VideoCameraIcon className="h-3 w-3" />
                  General
                </TabsTrigger>
                <TabsTrigger value="references" className="flex items-center gap-1">
                  <TagIcon className="h-3 w-3" />
                  Referencias
                </TabsTrigger>
                <TabsTrigger value="members" className="flex items-center gap-1">
                  <UsersIcon className="h-3 w-3" />
                  Miembros
                  {formState.members.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs px-1">
                      {formState.members.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="configuration" className="flex items-center gap-1">
                  <Cog6ToothIcon className="h-3 w-3" />
                  Config
                  {validation.hasWarnings && (
                    <ExclamationTriangleIcon className="ml-1 h-3 w-3 text-yellow-500" />
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Sección General - Reutilizando componente existente */}
              <TabsContent value="general" className="space-y-4 mt-4 max-h-[50vh] overflow-y-auto">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nombre de la Sala</Label>
                    <Input
                      id="displayName"
                      value={formState.displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ej: Reunión de Equipo Semanal"
                      maxLength={100}
                      className={validation.fieldValidations.displayName.hasErrors ? "border-destructive" : ""}
                    />
                    <div className="flex justify-between">
                      <p className="text-sm text-muted-foreground">
                        {formState.displayName.length}/100 caracteres
                      </p>
                      {validation.fieldValidations.displayName.errors.map((error, idx) => (
                        <p key={idx} className="text-sm text-destructive">
                          {error.message}
                        </p>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tipo de Acceso</Label>
                    <select 
                      value={formState.accessType}
                      onChange={(e) => setAccessType(e.target.value as any)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="OPEN">Abierto - Cualquiera con el enlace puede unirse</option>
                      <option value="TRUSTED">Confiable - Solo miembros de la organización</option>
                      <option value="RESTRICTED">Restringido - Solo invitados específicos</option>
                    </select>
                  </div>
                </div>
                
                <GeneralSectionDemo 
                  data={generalData}
                />
              </TabsContent>

              {/* Sección Referencias - Reutilizando componente existente */}
              <TabsContent value="references" className="space-y-4 mt-4 max-h-[50vh] overflow-y-auto">
                <ReferencesSectionDemo 
                  data={referencesData}
                  onTagAdd={(tagName) => console.log('Add tag:', tagName)}
                  onTagRemove={(tagName) => console.log('Remove tag:', tagName)}
                  onGroupAdd={(groupName) => console.log('Add group:', groupName)}
                  onGroupRemove={(groupName) => console.log('Remove group:', groupName)}
                />
              </TabsContent>

              {/* Sección Miembros - Reutilizando componente existente */}
              <TabsContent value="members" className="space-y-4 mt-4 max-h-[50vh] overflow-y-auto">
                <MembersSectionDemo 
                  data={membersData}
                  onAddMember={(email, role) => {
                    const newMember = {
                      email,
                      displayName: email,
                      role: role as any
                    };
                    setMembers([...formState.members, newMember]);
                  }}
                  onDeleteMember={(member) => {
                    setMembers(formState.members.filter(m => m.email !== member.email));
                  }}
                />
              </TabsContent>

              {/* Sección Configuración - Reutilizando componente existente */}
              <TabsContent value="configuration" className="space-y-4 mt-4 max-h-[50vh] overflow-y-auto">
                <ConfigurationSectionDemo 
                  data={configurationData}
                  onConfigChange={async (key, value) => {
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
                      case 'autoRecording':
                        toggleAutoRecording();
                        break;
                      case 'autoTranscription':
                        toggleAutoTranscription();
                        break;
                      case 'smartNotes':
                        toggleAutoSmartNotes();
                        break;
                      case 'chatRestriction':
                        setChatRestriction(value as any);
                        break;
                      case 'reactionRestriction':
                        setReactionRestriction(value as any);
                        break;
                      case 'presentRestriction':
                        setPresentRestriction(value as any);
                        break;
                    }
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Panel lateral de resumen */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Resumen</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Nombre:</span>
                  <p className="font-medium">{formState.displayName || "Sin nombre"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Acceso:</span>
                  <p>{formState.accessType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Miembros:</span>
                  <p>{formState.members.length} usuarios</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Moderación:</span>
                  <p>{formState.moderation ? "Activada" : "Desactivada"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">IA:</span>
                  <p>
                    {[
                      formState.autoRecording && "Grabación",
                      formState.autoTranscription && "Transcripción", 
                      formState.autoSmartNotes && "Notas"
                    ].filter(Boolean).join(", ") || "Ninguna"}
                  </p>
                </div>
              </div>
            </div>
            
            {validation.validation.errors.length > 0 && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  Corrige los errores antes de crear la sala
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || validation.validation.errors.length > 0}
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Creando...
              </div>
            ) : (
              isDuplicateMode ? "Duplicar Sala" : "Crear Sala"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};