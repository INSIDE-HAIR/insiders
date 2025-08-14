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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { useToast } from "@/src/hooks/use-toast";
import { Icons } from "@/src/components/shared/icons";
import {
  VideoCameraIcon,
  UsersIcon,
  LockClosedIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { z } from "zod";
import {
  CreateSpaceSchema,
  MeetingTemplateEnum,
  generateTemplateConfig,
  type MeetingTemplate
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
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MeetingTemplate>("TEAM_STANDUP");
  const [accessType, setAccessType] = useState<"OPEN" | "TRUSTED" | "RESTRICTED">("TRUSTED");
  const [members, setMembers] = useState<Array<{ email: string; role: "ROLE_UNSPECIFIED" | "COHOST" }>>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"ROLE_UNSPECIFIED" | "COHOST">("ROLE_UNSPECIFIED");
  
  // Configuración avanzada
  const [moderation, setModeration] = useState(false);
  const [autoRecording, setAutoRecording] = useState(false);
  const [autoTranscription, setAutoTranscription] = useState(false);
  const [autoSmartNotes, setAutoSmartNotes] = useState(false);
  const [attendanceReport, setAttendanceReport] = useState(false);
  const [chatRestriction, setChatRestriction] = useState<"HOSTS_ONLY" | "NO_RESTRICTION">("NO_RESTRICTION");
  const [presentRestriction, setPresentRestriction] = useState<"HOSTS_ONLY" | "NO_RESTRICTION">("NO_RESTRICTION");
  const [defaultJoinAsViewer, setDefaultJoinAsViewer] = useState(false);

  const [activeTab, setActiveTab] = useState("basic");

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

    if (members.some(m => m.email === newMemberEmail)) {
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
    setMembers(members.filter(m => m.email !== email));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      let data: any;
      
      if (useTemplate) {
        // Usar plantilla predefinida
        data = {
          displayName,
          template: selectedTemplate,
          initialMembers: members,
          customConfig: {
            // Permitir override de algunas configuraciones
            accessType: accessType !== "TRUSTED" ? accessType : undefined
          }
        };
      } else {
        // Configuración personalizada completa
        data = {
          displayName,
          config: {
            accessType,
            moderation: moderation ? "ON" : "OFF",
            moderationRestrictions: {
              chatRestriction,
              presentRestriction,
              defaultJoinAsViewerType: defaultJoinAsViewer ? "ON" : "OFF"
            },
            artifactConfig: {
              recordingConfig: { autoRecordingGeneration: autoRecording ? "ON" : "OFF" },
              transcriptionConfig: { autoTranscriptionGeneration: autoTranscription ? "ON" : "OFF" },
              smartNotesConfig: { autoSmartNotesGeneration: autoSmartNotes ? "ON" : "OFF" }
            },
            attendanceReportGenerationType: attendanceReport ? "GENERATE_REPORT" : "DO_NOT_GENERATE"
          },
          initialMembers: members
        };
      }

      const validation = CreateSpaceSchema.safeParse(data);
      if (!validation.success) {
        toast({
          title: "Error de validación",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      await onConfirm(data);
      
      // Reset form
      setDisplayName("");
      setUseTemplate(false);
      setSelectedTemplate("TEAM_STANDUP");
      setAccessType("TRUSTED");
      setMembers([]);
      setModeration(false);
      setAutoRecording(false);
      setAutoTranscription(false);
      setAutoSmartNotes(false);
      setAttendanceReport(false);
      setChatRestriction("NO_RESTRICTION");
      setPresentRestriction("NO_RESTRICTION");
      setDefaultJoinAsViewer(false);
      setActiveTab("basic");
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAccessTypeDescription = (type: string) => {
    switch (type) {
      case "OPEN":
        return "Cualquiera con el enlace puede unirse sin aprobación";
      case "TRUSTED":
        return "Solo usuarios autenticados de tu organización pueden unirse";
      case "RESTRICTED":
        return "Solo usuarios invitados específicamente pueden unirse";
      default:
        return "";
    }
  };
  
  const getTemplateDescription = (template: MeetingTemplate) => {
    switch (template) {
      case "TEAM_STANDUP":
        return "Reunión informal de equipo con permisos abiertos";
      case "PRESENTATION":
        return "Presentación formal con grabación y restricciones de presentación";
      case "TRAINING_SESSION":
        return "Sesión de entrenamiento con grabación, transcripción y notas automáticas";
      case "INTERVIEW":
        return "Entrevista restringida con reporte de asistencia";
      case "WEBINAR":
        return "Seminario web abierto con moderación y grabación";
      case "OPEN_MEETING":
        return "Reunión completamente abierta sin restricciones";
      case "RESTRICTED_MEETING":
        return "Reunión altamente restringida con máxima moderación";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <VideoCameraIcon className="h-5 w-5 text-primary" />
            Crear Nueva Sala de Meet
          </DialogTitle>
          <DialogDescription>
            Configura una nueva sala de reuniones con los parámetros deseados
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="template">Plantillas</TabsTrigger>
            <TabsTrigger value="members">Miembros</TabsTrigger>
            <TabsTrigger value="settings">Avanzado</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nombre de la Sala</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ej: Reunión de Equipo Semanal"
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground">
                {displayName.length}/100 caracteres
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="use-template"
                checked={useTemplate}
                onCheckedChange={setUseTemplate}
              />
              <Label htmlFor="use-template">Usar plantilla predefinida</Label>
            </div>

            {!useTemplate && (
              <div className="space-y-2">
                <Label htmlFor="accessType">Tipo de Acceso</Label>
                <Select value={accessType} onValueChange={(value: any) => setAccessType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de acceso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">
                      <div className="flex items-center gap-2">
                        <LockClosedIcon className="h-4 w-4 text-green-500" />
                        <span>Abierto</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="TRUSTED">
                      <div className="flex items-center gap-2">
                        <LockClosedIcon className="h-4 w-4 text-yellow-500" />
                        <span>Confiable</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="RESTRICTED">
                      <div className="flex items-center gap-2">
                        <LockClosedIcon className="h-4 w-4 text-red-500" />
                        <span>Restringido</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {getAccessTypeDescription(accessType)}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="template" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Plantillas Predefinidas</Label>
              <Select value={selectedTemplate} onValueChange={(value: MeetingTemplate) => setSelectedTemplate(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una plantilla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEAM_STANDUP">Reunión de Equipo</SelectItem>
                  <SelectItem value="PRESENTATION">Presentación</SelectItem>
                  <SelectItem value="TRAINING_SESSION">Sesión de Entrenamiento</SelectItem>
                  <SelectItem value="INTERVIEW">Entrevista</SelectItem>
                  <SelectItem value="WEBINAR">Seminario Web</SelectItem>
                  <SelectItem value="OPEN_MEETING">Reunión Abierta</SelectItem>
                  <SelectItem value="RESTRICTED_MEETING">Reunión Restringida</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {getTemplateDescription(selectedTemplate)}
              </p>
            </div>
            
            <Alert>
              <Cog6ToothIcon className="h-4 w-4" />
              <AlertDescription>
                Las plantillas configuran automáticamente moderación, permisos, grabación y otras opciones según el tipo de reunión.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="members" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Agregar Participantes Iniciales</Label>
              <div className="flex gap-2">
                <Input
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="email@ejemplo.com"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                />
                <Select value={newMemberRole} onValueChange={(value: any) => setNewMemberRole(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROLE_UNSPECIFIED">Participante</SelectItem>
                    <SelectItem value="COHOST">Co-anfitrión</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={handleAddMember}
                  disabled={!newMemberEmail}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {members.length > 0 && (
              <div className="space-y-2">
                <Label>Participantes ({members.length})</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {members.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{member.email}</span>
                        <Badge variant={member.role === "COHOST" ? "default" : "secondary"}>
                          {member.role === "COHOST" ? "Co-anfitrión" : "Participante"}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.email)}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Alert>
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>
                Los participantes recibirán una invitación por email para unirse a la sala
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            {!useTemplate && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Moderación y Permisos</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="moderation">Activar Moderación</Label>
                      <p className="text-sm text-muted-foreground">
                        El organizador controla permisos de los participantes
                      </p>
                    </div>
                    <Switch
                      id="moderation"
                      checked={moderation}
                      onCheckedChange={setModeration}
                    />
                  </div>

                  {moderation && (
                    <>
                      <div className="space-y-2">
                        <Label>Restricción de Chat</Label>
                        <Select value={chatRestriction} onValueChange={(value: any) => setChatRestriction(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NO_RESTRICTION">Todos pueden chatear</SelectItem>
                            <SelectItem value="HOSTS_ONLY">Solo organizadores</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Restricción de Presentación</Label>
                        <Select value={presentRestriction} onValueChange={(value: any) => setPresentRestriction(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NO_RESTRICTION">Todos pueden presentar</SelectItem>
                            <SelectItem value="HOSTS_ONLY">Solo organizadores</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="default-viewer">Unirse como Espectador</Label>
                          <p className="text-sm text-muted-foreground">
                            Nuevos participantes se unen como espectadores
                          </p>
                        </div>
                        <Switch
                          id="default-viewer"
                          checked={defaultJoinAsViewer}
                          onCheckedChange={setDefaultJoinAsViewer}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Artefactos Automáticos</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-recording">Grabación Automática</Label>
                      <p className="text-sm text-muted-foreground">
                        Las reuniones se grabarán automáticamente al iniciar
                      </p>
                    </div>
                    <Switch
                      id="auto-recording"
                      checked={autoRecording}
                      onCheckedChange={setAutoRecording}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-transcription">Transcripción Automática</Label>
                      <p className="text-sm text-muted-foreground">
                        Genera transcripciones de las conversaciones
                      </p>
                    </div>
                    <Switch
                      id="auto-transcription"
                      checked={autoTranscription}
                      onCheckedChange={setAutoTranscription}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-smart-notes">Notas Inteligentes</Label>
                      <p className="text-sm text-muted-foreground">
                        Genera resúmenes y puntos clave automáticamente
                      </p>
                    </div>
                    <Switch
                      id="auto-smart-notes"
                      checked={autoSmartNotes}
                      onCheckedChange={setAutoSmartNotes}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Reportes</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="attendance-report">Reporte de Asistencia</Label>
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
              </div>
            )}

            {useTemplate && (
              <Alert>
                <Cog6ToothIcon className="h-4 w-4" />
                <AlertDescription>
                  La plantilla seleccionada configurará automáticamente todas estas opciones. Puedes modificarlas después de crear la sala.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Icons.SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                {useTemplate ? "Aplicando Plantilla..." : "Creando Sala..."}
              </>
            ) : (
              <>
                <VideoCameraIcon className="mr-2 h-4 w-4" />
                {useTemplate ? `Crear con ${selectedTemplate}` : "Crear Sala"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};