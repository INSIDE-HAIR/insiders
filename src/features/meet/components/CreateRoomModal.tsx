"use client";

import React, { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Switch } from "@/src/components/ui/switch";
import { Badge } from "@/src/components/ui/badge";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { useToast } from "@/src/hooks/use-toast";
import { Icons } from "@/src/components/shared/icons";
import {
  VideoCameraIcon,
  UsersIcon,
  LockClosedIcon,
  LockOpenIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  XMarkIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { z } from "zod";
import {
  CreateSpaceSchema,
  AccessTypeEnum,
  EntryPointAccessEnum,
  RestrictionTypeEnum,
  DefaultJoinAsViewerTypeEnum,
  AutoGenerationTypeEnum,
  AttendanceReportGenerationTypeEnum,
  MemberRoleEnum,
} from "@/src/features/meet/validations/SpaceConfigSchema";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => Promise<void>;
}

type CreateRoomData = z.infer<typeof CreateSpaceSchema>;

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [accessType, setAccessType] = useState<
    "OPEN" | "TRUSTED" | "RESTRICTED"
  >("TRUSTED");
  const [restrictEntryPoints, setRestrictEntryPoints] = useState(false); // false = ALL, true = CREATOR_APP_ONLY
  const [members, setMembers] = useState<
    Array<{ email: string; role: "ROLE_UNSPECIFIED" | "COHOST" }>
  >([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<
    "ROLE_UNSPECIFIED" | "COHOST"
  >("ROLE_UNSPECIFIED");

  // Estados para filtros de miembros
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState<
    "ALL" | "COHOST" | "ROLE_UNSPECIFIED"
  >("ALL");

  // Configuración de moderación
  const [moderation, setModeration] = useState(false);
  const [chatRestriction, setChatRestriction] = useState<
    "HOSTS_ONLY" | "NO_RESTRICTION"
  >("NO_RESTRICTION");
  const [reactionRestriction, setReactionRestriction] = useState<
    "HOSTS_ONLY" | "NO_RESTRICTION"
  >("NO_RESTRICTION");
  const [presentRestriction, setPresentRestriction] = useState<
    "HOSTS_ONLY" | "NO_RESTRICTION"
  >("NO_RESTRICTION");
  const [defaultJoinAsViewer, setDefaultJoinAsViewer] = useState(false);

  // Configuración de artefactos automáticos
  const [autoRecording, setAutoRecording] = useState(false);
  const [autoTranscription, setAutoTranscription] = useState(false);
  const [autoSmartNotes, setAutoSmartNotes] = useState(false);

  // Wrapper functions for debugging
  const handleModerationChange = (checked: boolean) => {
    console.log("🎛️ Moderation toggle clicked:", checked);
    setModeration(checked);
  };

  const handleAutoRecordingChange = (checked: boolean) => {
    console.log("🎛️ Auto recording toggle clicked:", checked);
    setAutoRecording(checked);
  };

  const handleAutoTranscriptionChange = (checked: boolean) => {
    console.log("🎛️ Auto transcription toggle clicked:", checked);
    setAutoTranscription(checked);
  };

  const handleAutoSmartNotesChange = (checked: boolean) => {
    console.log("🎛️ Auto smart notes toggle clicked:", checked);
    setAutoSmartNotes(checked);
  };

  const handleDefaultJoinAsViewerChange = (checked: boolean) => {
    console.log("🎛️ Default join as viewer toggle clicked:", checked);
    setDefaultJoinAsViewer(checked);
  };

  const handleRestrictEntryPointsChange = (checked: boolean) => {
    console.log("🎛️ Restrict entry points toggle clicked:", checked);
    setRestrictEntryPoints(checked);
  };

  // Debug: Log state changes
  React.useEffect(() => {
    console.log("🔄 State updated:", {
      moderation,
      autoRecording,
      autoTranscription,
      autoSmartNotes,
      defaultJoinAsViewer,
      restrictEntryPoints,
    });
  }, [
    moderation,
    autoRecording,
    autoTranscription,
    autoSmartNotes,
    defaultJoinAsViewer,
    restrictEntryPoints,
  ]);

  // REPORTES: Comentado hasta tener Google Workspace Enterprise
  // Para habilitar: descomentar esta línea y las secciones relacionadas en el JSX
  // Requiere scope: meetings.space.settings y configuración en Google Admin
  // const [attendanceReport, setAttendanceReport] = useState(false);

  const [activeTab, setActiveTab] = useState("basic");

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      // Reset all form state when modal opens
      setDisplayName("");
      setAccessType("TRUSTED");
      setRestrictEntryPoints(false);
      setMembers([]);
      setModeration(false);
      setAutoRecording(false);
      setAutoTranscription(false);
      setAutoSmartNotes(false);
      setChatRestriction("NO_RESTRICTION");
      setReactionRestriction("NO_RESTRICTION");
      setPresentRestriction("NO_RESTRICTION");
      setDefaultJoinAsViewer(false);
      setActiveTab("basic");
      setNewMemberEmail("");
      setNewMemberRole("ROLE_UNSPECIFIED");
      setMemberSearchTerm("");
      setMemberRoleFilter("ALL");
      console.log("🔄 Modal opened - form reset");
    }
  }, [isOpen]);

  // Función para filtrar miembros
  const filteredMembers = members.filter((member) => {
    // Filtro por término de búsqueda (email)
    const searchMatch =
      memberSearchTerm === "" ||
      member.email.toLowerCase().includes(memberSearchTerm.toLowerCase());

    // Filtro por rol
    const roleMatch =
      memberRoleFilter === "ALL" || member.role === memberRoleFilter;

    return searchMatch && roleMatch;
  });

  const handleAddMember = () => {
    if (!newMemberEmail) return;

    const emailValidation = z.string().email().safeParse(newMemberEmail);
    if (!emailValidation.success) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      });
      return;
    }

    if (members.some((m) => m.email === newMemberEmail)) {
      toast({
        title: "Miembro duplicado",
        description: "Este email ya está en la lista",
        variant: "destructive",
      });
      return;
    }

    setMembers([...members, { email: newMemberEmail, role: newMemberRole }]);
    setNewMemberEmail("");
    setNewMemberRole("ROLE_UNSPECIFIED");
  };

  const handleRemoveMember = (email: string) => {
    setMembers(members.filter((m) => m.email !== email));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Configuración completa según Google Meet API v2beta
      const config: any = {
        accessType,
        entryPointAccess: restrictEntryPoints ? "CREATOR_APP_ONLY" : "ALL",
        moderation: moderation ? "ON" : "OFF",
      };

      // Solo agregar moderationRestrictions si moderation está activada
      if (moderation) {
        config.moderationRestrictions = {
          chatRestriction,
          reactionRestriction,
          presentRestriction,
          defaultJoinAsViewerType: defaultJoinAsViewer ? "ON" : "OFF",
        };
      }

      // Solo agregar artifactConfig si al menos una opción está activada
      if (autoRecording || autoTranscription || autoSmartNotes) {
        config.artifactConfig = {};

        if (autoRecording) {
          config.artifactConfig.recordingConfig = {
            autoRecordingGeneration: "ON",
          };
        }

        if (autoTranscription) {
          config.artifactConfig.transcriptionConfig = {
            autoTranscriptionGeneration: "ON",
          };
        }

        if (autoSmartNotes) {
          config.artifactConfig.smartNotesConfig = {
            autoSmartNotesGeneration: "ON",
          };
        }
      }

      // REPORTES: Comentado hasta tener Google Workspace Enterprise
      // Cambiar por: attendanceReport ? "GENERATE_REPORT" : "DO_NOT_GENERATE"
      config.attendanceReportGenerationType = "DO_NOT_GENERATE";

      const data: any = {
        initialMembers: members || [],
      };

      // Solo agregar displayName si no está vacío
      if (displayName && displayName.trim()) {
        data.displayName = displayName.trim();
      }

      // Solo agregar config si tiene contenido
      if (Object.keys(config).length > 0) {
        data.config = config;
      }

      // Debug: Log the data being sent
      console.log("🔍 Data being sent to API:", JSON.stringify(data, null, 2));

      const validation = CreateSpaceSchema.safeParse(data);
      if (!validation.success) {
        console.error("❌ Validation errors:", validation.error.errors);
        toast({
          title: "Error de validación",
          description:
            validation.error.errors[0]?.message || "Error de validación",
          variant: "destructive",
        });
        return;
      }

      await onConfirm(data);

      // Form will be reset when modal closes and reopens
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAccessTypeDescription = (type: string) => {
    switch (type) {
      case "OPEN":
        return "Cualquiera con el enlace puede unirse directamente sin pedir permiso al anfitrión";
      case "TRUSTED":
        return "Miembros de tu organización y invitados por calendario entran directamente. Otros deben pedir permiso al anfitrión";
      case "RESTRICTED":
        return "Solo invitados específicos entran directamente. Todos los demás deben pedir permiso al anfitrión";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        key={isOpen ? "open" : "closed"}
        className='sm:max-w-2xl max-h-[90vh] min-h-[80dvh] max-w-[95vw] flex flex-col overflow-hidden'
      >
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <VideoCameraIcon className='h-5 w-5 text-primary' />
            Crear Nueva Sala de Meet
          </DialogTitle>
          <DialogDescription>
            Configura una nueva sala de reuniones con los parámetros deseados
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='mt-4'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='basic'>Configuración</TabsTrigger>
            <TabsTrigger value='members'>Miembros</TabsTrigger>
            <TabsTrigger value='settings'>Avanzado</TabsTrigger>
          </TabsList>

          <TabsContent value='basic' className='space-y-4 mt-4'>
            <div className='space-y-2'>
              <Label htmlFor='displayName'>Nombre de la Sala</Label>
              <Input
                id='displayName'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder='Ej: Reunión de Equipo Semanal'
                maxLength={100}
              />
              <p className='text-sm text-muted-foreground'>
                {displayName.length}/100 caracteres
              </p>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Label htmlFor='accessType'>Tipo de Acceso</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InformationCircleIcon className='h-4 w-4 text-primary cursor-help' />
                    </TooltipTrigger>
                    <TooltipContent className='max-w-sm'>
                      <p className='text-sm'>
                        <strong>Control de Acceso a la Reunión:</strong>
                        <br />• <strong>Libre:</strong> Cualquiera con el enlace
                        entra directamente
                        <br />• <strong>Organizacional:</strong> Tu organización
                        entra directamente, otros piden permiso
                        <br />• <strong>Solo Invitados:</strong> Solo invitados
                        específicos entran, otros piden permiso al anfitrión
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={accessType}
                onValueChange={(value: any) => setAccessType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecciona el tipo de acceso' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='OPEN'>
                    <div className='flex items-center gap-2'>
                      <LockOpenIcon className='h-4 w-4 text-green-500' />
                      <span>Acceso Libre</span>
                    </div>
                  </SelectItem>
                  <SelectItem value='TRUSTED'>
                    <div className='flex items-center gap-2'>
                      <LockClosedIcon className='h-4 w-4 text-yellow-500' />
                      <span>Acceso Organizacional</span>
                    </div>
                  </SelectItem>
                  <SelectItem value='RESTRICTED'>
                    <div className='flex items-center gap-2'>
                      <LockClosedIcon className='h-4 w-4 text-red-500' />
                      <span>Solo Invitados</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className='text-sm text-muted-foreground'>
                {getAccessTypeDescription(accessType)}
              </p>
            </div>
          </TabsContent>

          <TabsContent value='members' className='space-y-4 mt-4'>
            <div className='space-y-2'>
              <Label>Agregar Participantes Iniciales</Label>
              <div className='flex gap-2'>
                <Input
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder='email@ejemplo.com'
                  onKeyPress={(e) => e.key === "Enter" && handleAddMember()}
                />
                <Select
                  value={newMemberRole}
                  onValueChange={(value: any) => setNewMemberRole(value)}
                >
                  <SelectTrigger className='w-40'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ROLE_UNSPECIFIED'>
                      Participante
                    </SelectItem>
                    <SelectItem value='COHOST'>Co-anfitrión</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type='button'
                  onClick={handleAddMember}
                  disabled={!newMemberEmail}
                >
                  <PlusIcon className='h-4 w-4' />
                </Button>
              </div>
            </div>

            {members.length > 0 && (
              <div className='space-y-2'>
                <Label>
                  Participantes ({filteredMembers.length} de {members.length})
                </Label>

                {/* Filtros de búsqueda y rol */}
                <div className='flex gap-2'>
                  <div className='flex-1'>
                    <Input
                      placeholder='Buscar por email...'
                      value={memberSearchTerm}
                      onChange={(e) => setMemberSearchTerm(e.target.value)}
                      className='text-sm'
                    />
                  </div>
                  <Select
                    value={memberRoleFilter}
                    onValueChange={(
                      value: "ALL" | "COHOST" | "ROLE_UNSPECIFIED"
                    ) => setMemberRoleFilter(value)}
                  >
                    <SelectTrigger className='w-40'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='ALL'>Todos</SelectItem>
                      <SelectItem value='COHOST'>Co-anfitrión</SelectItem>
                      <SelectItem value='ROLE_UNSPECIFIED'>
                        Participante
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {filteredMembers.length === 0 ? (
                  <p className='text-muted-foreground text-center py-4 text-sm'>
                    No se encontraron miembros que coincidan con los filtros
                  </p>
                ) : (
                  <div className='space-y-2 max-h-48 overflow-y-auto'>
                    {filteredMembers.map((member, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-2 bg-muted rounded-lg'
                      >
                        <div className='flex items-center gap-2'>
                          <UsersIcon className='h-4 w-4 text-muted-foreground' />
                          <span className='text-sm'>{member.email}</span>
                          <Badge
                            variant={
                              member.role === "COHOST" ? "default" : "secondary"
                            }
                          >
                            {member.role === "COHOST"
                              ? "Co-anfitrión"
                              : "Participante"}
                          </Badge>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => handleRemoveMember(member.email)}
                        >
                          <XMarkIcon className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Alert>
              <ExclamationTriangleIcon className='h-4 w-4' />
              <AlertDescription>
                Los participantes recibirán una invitación por email para unirse
                a la sala
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value='settings' className='space-y-4 mt-4'>
            <div className='space-y-4'>
              <div className='space-y-3'>
                <h4 className='text-sm font-medium'>Moderación y Permisos</h4>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <div className='flex items-center gap-2'>
                      <Label htmlFor='restrict-entry'>
                        Restringir Puntos de Entrada
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InformationCircleIcon className='h-4 w-4 text-primary cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent className='max-w-sm'>
                            <p className='text-sm'>
                              <strong>Control de Aplicaciones:</strong>
                              <br />• <strong>Desactivado:</strong> Se puede
                              acceder desde cualquier aplicación (Google Meet,
                              Calendar, etc.)
                              <br />• <strong>Activado:</strong> Solo la
                              aplicación que creó la sala puede acceder (más
                              restrictivo)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      Limita el acceso solo a la aplicación que creó la sala
                    </p>
                  </div>
                  <Switch
                    id='restrict-entry'
                    checked={restrictEntryPoints}
                    onCheckedChange={handleRestrictEntryPointsChange}
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <div className='flex items-center gap-2'>
                      <Label htmlFor='moderation'>Activar Moderación</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InformationCircleIcon className='h-4 w-4 text-primary cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent className='max-w-sm'>
                            <p className='text-sm'>
                              <strong>Control del Anfitrión:</strong>
                              <br />
                              Permite al anfitrión y co-anfitriones controlar
                              quién puede chatear, presentar, reaccionar y si
                              los nuevos participantes entran como espectadores.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      El organizador controla permisos de los participantes
                    </p>
                  </div>
                  <Switch
                    id='moderation'
                    checked={moderation}
                    onCheckedChange={handleModerationChange}
                  />
                </div>

                {moderation && (
                  <>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Label>Restricción de Chat</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InformationCircleIcon className='h-4 w-4 text-primary cursor-help' />
                            </TooltipTrigger>
                            <TooltipContent className='max-w-sm'>
                              <p className='text-sm'>
                                <strong>Control de Chat:</strong>
                                <br />
                                Determina quién puede enviar mensajes en el chat
                                durante la reunión.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select
                        value={chatRestriction}
                        onValueChange={(value: any) =>
                          setChatRestriction(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='NO_RESTRICTION'>
                            Todos pueden chatear
                          </SelectItem>
                          <SelectItem value='HOSTS_ONLY'>
                            Solo organizadores
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Label>Restricción de Reacciones</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InformationCircleIcon className='h-4 w-4 text-primary cursor-help' />
                            </TooltipTrigger>
                            <TooltipContent className='max-w-sm'>
                              <p className='text-sm'>
                                <strong>Control de Reacciones:</strong>
                                <br />
                                Determina quién puede enviar reacciones (emojis,
                                &ldquo;me gusta&rdquo;, etc.) durante la
                                reunión.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select
                        value={reactionRestriction}
                        onValueChange={(value: any) =>
                          setReactionRestriction(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='NO_RESTRICTION'>
                            Todos pueden reaccionar
                          </SelectItem>
                          <SelectItem value='HOSTS_ONLY'>
                            Solo organizadores
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Label>Restricción de Presentación</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InformationCircleIcon className='h-4 w-4 text-primary cursor-help' />
                            </TooltipTrigger>
                            <TooltipContent className='max-w-sm'>
                              <p className='text-sm'>
                                <strong>Control de Pantalla:</strong>
                                <br />
                                Determina quién puede compartir pantalla,
                                presentar documentos o mostrar contenido durante
                                la reunión.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select
                        value={presentRestriction}
                        onValueChange={(value: any) =>
                          setPresentRestriction(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='NO_RESTRICTION'>
                            Todos pueden presentar
                          </SelectItem>
                          <SelectItem value='HOSTS_ONLY'>
                            Solo organizadores
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <div className='flex items-center gap-2'>
                          <Label htmlFor='default-viewer'>
                            Unirse como Espectador
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InformationCircleIcon className='h-4 w-4 text-primary cursor-help' />
                              </TooltipTrigger>
                              <TooltipContent className='max-w-sm'>
                                <p className='text-sm'>
                                  <strong>Modo Espectador:</strong>
                                  <br />
                                  Los nuevos participantes entrarán solo con
                                  permisos de visualización. El anfitrión puede
                                  promocionarlos a participantes activos
                                  después.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          Nuevos participantes se unen como espectadores
                        </p>
                      </div>
                      <Switch
                        id='default-viewer'
                        checked={defaultJoinAsViewer}
                        onCheckedChange={handleDefaultJoinAsViewerChange}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className='space-y-3'>
                <h4 className='text-sm font-medium'>Artefactos Automáticos</h4>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <div className='flex items-center gap-2'>
                      <Label htmlFor='auto-recording'>
                        Grabación Automática
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InformationCircleIcon className='h-4 w-4 text-primary cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent className='max-w-sm'>
                            <p className='text-sm'>
                              <strong>Grabación Automática:</strong>
                              <br />
                              La reunión se grabará automáticamente cuando
                              comience. Los archivos se guardan en Google Drive
                              del organizador. Los participantes serán
                              notificados.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      Las reuniones se grabarán automáticamente al iniciar
                    </p>
                  </div>
                  <Switch
                    id='auto-recording'
                    checked={autoRecording}
                    onCheckedChange={handleAutoRecordingChange}
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <div className='flex items-center gap-2'>
                      <Label htmlFor='auto-transcription'>
                        Transcripción Automática
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InformationCircleIcon className='h-4 w-4 text-primary cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent className='max-w-sm'>
                            <p className='text-sm'>
                              <strong>Transcripción Automática:</strong>
                              <br />
                              Convierte automáticamente el audio de la reunión
                              en texto. El documento se guarda en Google Drive
                              con marcas de tiempo y identificación de
                              participantes.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      Genera transcripciones de las conversaciones
                    </p>
                  </div>
                  <Switch
                    id='auto-transcription'
                    checked={autoTranscription}
                    onCheckedChange={handleAutoTranscriptionChange}
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <div className='flex items-center gap-2'>
                      <Label htmlFor='auto-smart-notes'>
                        Notas Inteligentes
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InformationCircleIcon className='h-4 w-4 text-primary cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent className='max-w-sm'>
                            <p className='text-sm'>
                              <strong>Notas Inteligentes:</strong>
                              <br />
                              Genera automáticamente resúmenes, puntos clave,
                              acciones y decisiones de la reunión usando IA. Se
                              guarda como documento de Google Docs.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      Genera resúmenes y puntos clave automáticamente
                    </p>
                  </div>
                  <Switch
                    id='auto-smart-notes'
                    checked={autoSmartNotes}
                    onCheckedChange={handleAutoSmartNotesChange}
                  />
                </div>
              </div>

              {/* 
                  FUNCIONALIDAD DE REPORTES - COMENTADA TEMPORALMENTE
                  =====================================================
                  Esta sección está comentada porque requiere Google Workspace Enterprise
                  o una suscripción avanzada que incluya "Meeting attendance reports".
                  
                  Para habilitar en el futuro:
                  1. Descomentar esta sección
                  2. Descomentar la variable attendanceReport en el estado
                  3. Descomentar las referencias en handleSubmit y resetForm
                  4. Verificar que tengas los scopes correctos en Google Cloud Console
                  5. Configurar "Generate attendance reports" en Google Workspace Admin
                  
                  API Error que se produce sin el plan correcto:
                  "updateAttendanceReportGenerationType is not available to the user"
                */}
              {/*
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Reportes</h4>
                    <p className="text-xs text-muted-foreground">
                      Configurar reportes automáticos de asistencia
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="attendance-report">Reporte de Asistencia</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p className="text-sm">
                                <strong>Reporte de Asistencia:</strong><br/>
                                Genera automáticamente un informe detallado con la lista de participantes, 
                                horarios de entrada/salida y duración de permanencia en la reunión.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Generar reporte automático de participantes
                      </p>
                    </div>
                    <Switch
                      id="attendance-report"
                      checked={attendanceReport}
                      onCheckedChange={setAttendanceReport}
                    />
                  </div>
                </div>
                */}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className='bg-primary hover:bg-primary/90'
          >
            {loading ? (
              <>
                <Icons.SpinnerIcon className='mr-2 h-4 w-4 animate-spin' />
                Creando Sala...
              </>
            ) : (
              <>
                <VideoCameraIcon className='mr-2 h-4 w-4' />
                Crear Sala
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
