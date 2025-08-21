"use client";

import React, { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
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
  TrashIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  CameraIcon,
  CheckCircleIcon,
  FolderIcon,
  InformationCircleIcon,
  TagIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

interface MeetRoom {
  name: string;
  meetingUri?: string;
  meetingCode?: string;
  config?: {
    accessType?: 'OPEN' | 'TRUSTED' | 'RESTRICTED';
    recordingConfig?: { autoRecordingGeneration?: 'ON' | 'OFF' };
    transcriptionConfig?: { autoTranscriptionGeneration?: 'ON' | 'OFF' };
    smartNotesConfig?: { autoSmartNotesGeneration?: 'ON' | 'OFF' };
  };
  members?: Array<{
    name: string;
    email: string;
    role: string;
  }>;
  activeConference?: {
    conferenceRecord?: string;
  };
}

interface RoomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: MeetRoom & { _metadata?: { localId?: string; displayName?: string; createdAt?: Date; createdBy?: string; lastSyncAt?: Date; source?: string; } };
  onUpdate: () => void;
  onDelete: () => void;
}

interface RoomMember {
  name: string; // formato: "spaces/{space_id}/members/{member_id}"
  email: string; // email directo según Google Meet API v2
  role: "ROLE_UNSPECIFIED" | "COHOST";
  user?: {
    id?: string;
  };
  createTime?: string;
  // Campos enriquecidos por nuestro backend
  isCohost?: boolean;
  joinedAt?: string;
  displayName?: string;
  source?: string;
}

export const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  isOpen,
  onClose,
  room,
  onUpdate,
  onDelete,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [activityData, setActivityData] = useState<any>({
    conferenceRecords: [],
    recordings: [],
    transcripts: [],
    participantsHistory: [],
    participantStats: [],
    participantsSessions: [],
    smartNotes: []
  });
  const [activityLoading, setActivityLoading] = useState(false);
  const [participantsReport, setParticipantsReport] = useState<any>(null);
  const [showParticipantsReport, setShowParticipantsReport] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [activitySubTab, setActivitySubTab] = useState("vista-general");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [assignedTags, setAssignedTags] = useState<any[]>([]);
  const [assignedGroups, setAssignedGroups] = useState<any[]>([]);
  const [organizationLoading, setOrganizationLoading] = useState(false);
  const { toast } = useToast();

  // States para agregar miembros
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"ROLE_UNSPECIFIED" | "COHOST">("ROLE_UNSPECIFIED");
  
  // Estados para filtros de miembros
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState<"ALL" | "COHOST" | "ROLE_UNSPECIFIED">("ALL");
  const [addingMember, setAddingMember] = useState(false);

  const spaceId = room.name?.split('/').pop() || '';

  // Función para filtrar miembros
  const filteredMembers = members.filter((member) => {
    // Filtro por término de búsqueda (nombre o email)
    const searchMatch = memberSearchTerm === "" || 
      (member.displayName && member.displayName.toLowerCase().includes(memberSearchTerm.toLowerCase())) ||
      (member.email && member.email.toLowerCase().includes(memberSearchTerm.toLowerCase()));
    
    // Filtro por rol
    const roleMatch = memberRoleFilter === "ALL" || member.role === memberRoleFilter;
    
    return searchMatch && roleMatch;
  });

  useEffect(() => {
    // Initialize edit name with current display name
    setEditName(room._metadata?.displayName || spaceId);
  }, [room._metadata?.displayName, spaceId]);

  useEffect(() => {
    if (isOpen && activeTab === "organization") {
      fetchOrganizationData();
    }
    if (isOpen && activeTab === "members") {
      fetchMembers();
    }
    if (isOpen && activeTab === "settings") {
      fetchSettings();
    }
    if (isOpen && activeTab === "activity") {
      fetchActivityData();
    }
  }, [isOpen, activeTab, room.name]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/meet/rooms/${spaceId}/members`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Members data received:', data.members);
        setMembers(data.members || []);
      } else {
        console.error("Error fetching members:", response.status);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los miembros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/meet/rooms/${spaceId}/settings`);
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || {});
      } else {
        console.error("Error fetching settings:", response.status);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityData = async () => {
    try {
      setActivityLoading(true);
      
      // Fetch all activity data in parallel
      const [recordsRes, recordingsRes, transcriptsRes, participantsRes, sessionsRes, smartNotesRes] = await Promise.all([
        fetch(`/api/meet/rooms/${spaceId}/conference-records`),
        fetch(`/api/meet/rooms/${spaceId}/recordings`),
        fetch(`/api/meet/rooms/${spaceId}/transcripts`),
        fetch(`/api/meet/rooms/${spaceId}/participants`),
        fetch(`/api/meet/rooms/${spaceId}/participants-by-session`),
        fetch(`/api/meet/rooms/${spaceId}/smart-notes`)
      ]);

      const [recordsData, recordingsData, transcriptsData, participantsData, sessionsData, smartNotesData] = await Promise.all([
        recordsRes.ok ? recordsRes.json() : { conferenceRecords: [] },
        recordingsRes.ok ? recordingsRes.json() : { recordings: [] },
        transcriptsRes.ok ? transcriptsRes.json() : { transcripts: [] },
        participantsRes.ok ? participantsRes.json() : { participantsHistory: [], participantStats: [] },
        sessionsRes.ok ? sessionsRes.json() : { sessions: [] },
        smartNotesRes.ok ? smartNotesRes.json() : { smartNotes: [] }
      ]);

      setActivityData({
        conferenceRecords: recordsData.conferenceRecords || [],
        recordings: recordingsData.recordings || [],
        transcripts: transcriptsData.transcripts || [],
        participantsHistory: participantsData.participantsHistory || [],
        participantStats: participantsData.participantStats || [],
        participantsSessions: sessionsData.sessions || [],
        smartNotes: smartNotesData.smartNotes || []
      });
      
    } catch (error) {
      console.error("Error fetching activity data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de actividad",
        variant: "destructive",
      });
    } finally {
      setActivityLoading(false);
    }
  };

  const handleEndConference = async () => {
    if (!room.activeConference?.conferenceRecord) {
      toast({
        title: "No hay conferencia activa",
        description: "No se encontró una conferencia activa para terminar",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("¿Estás seguro de que deseas terminar la conferencia activa?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/meet/rooms/${spaceId}/end-conference`, {
        method: "POST",
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Conferencia terminada",
          description: "La conferencia activa ha sido terminada exitosamente",
        });
        onUpdate(); // Refresh room data
        if (activeTab === "activity") {
          fetchActivityData(); // Refresh activity data
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "No se pudo terminar la conferencia",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo terminar la conferencia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail) return;

    try {
      setAddingMember(true);
      const response = await fetch(`/api/meet/rooms/${spaceId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newMemberEmail,
          role: newMemberRole,
        }),
      });

      if (response.ok) {
        toast({
          title: "Miembro agregado",
          description: `${newMemberEmail} ha sido agregado a la sala`,
        });
        setNewMemberEmail("");
        setNewMemberRole("ROLE_UNSPECIFIED");
        await fetchMembers();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Error al agregar miembro");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el miembro",
        variant: "destructive",
      });
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberEmail: string) => {
    try {
      const response = await fetch(
        `/api/meet/rooms/${spaceId}/members?email=${encodeURIComponent(memberEmail)}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast({
          title: "Miembro eliminado",
          description: `${memberEmail} ha sido eliminado de la sala`,
        });
        await fetchMembers();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar miembro");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el miembro",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSettings = async (newSettings: any) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/meet/rooms/${spaceId}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        toast({
          title: "Configuración actualizada",
          description: "Los cambios han sido guardados",
        });
        await fetchSettings();
        onUpdate();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar configuración");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la configuración",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipantsReport = async () => {
    try {
      setReportLoading(true);
      const response = await fetch(`/api/meet/rooms/${spaceId}/participants-report`);
      
      if (response.ok) {
        const data = await response.json();
        setParticipantsReport(data);
        setShowParticipantsReport(true);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Error al obtener el reporte");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo generar el reporte de participantes",
        variant: "destructive",
      });
    } finally {
      setReportLoading(false);
    }
  };

  const fetchOrganizationData = async () => {
    try {
      setOrganizationLoading(true);
      
      // Fetch available tags and groups
      const [tagsResponse, groupsResponse] = await Promise.all([
        fetch("/api/meet/tags?parentId=all"),
        fetch("/api/meet/groups?parentId=all")
      ]);

      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        setAvailableTags(tagsData.tags || []);
      }

      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        setAvailableGroups(groupsData.groups || []);
      }

      // Fetch current assignments for this space
      const assignmentsResponse = await fetch(`/api/meet/spaces/${spaceId}/assignments`);
      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        setAssignedTags(assignmentsData.assignedTags || []);
        setAssignedGroups(assignmentsData.assignedGroups || []);
      } else {
        // Space might not exist in DB yet, which is fine
        setAssignedTags([]);
        setAssignedGroups([]);
      }

    } catch (error) {
      console.error("Error fetching organization data:", error);
      toast({
        title: "Error al cargar datos de organización",
        description: "No se pudieron cargar los tags y grupos",
        variant: "destructive",
      });
    } finally {
      setOrganizationLoading(false);
    }
  };

  const handleAssignTag = async (tagId: string) => {
    try {
      const response = await fetch(`/api/meet/spaces/${spaceId}/assign-tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds: [tagId] }),
      });

      if (!response.ok) {
        throw new Error("Error al asignar tag");
      }

      const tag = availableTags.find(t => t.id === tagId);
      if (tag) {
        setAssignedTags(prev => [...prev, tag]);
        toast({
          title: "Tag asignado",
          description: `Tag "${tag.name}" asignado a la sala`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error al asignar tag",
        description: error.message || "No se pudo asignar el tag",
        variant: "destructive",
      });
    }
  };

  const handleUnassignTag = async (tagId: string) => {
    try {
      const response = await fetch(`/api/meet/spaces/${spaceId}/unassign-tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds: [tagId] }),
      });

      if (!response.ok) {
        throw new Error("Error al desasignar tag");
      }

      const tag = assignedTags.find(t => t.id === tagId);
      setAssignedTags(prev => prev.filter(t => t.id !== tagId));
      
      if (tag) {
        toast({
          title: "Tag desasignado",
          description: `Tag "${tag.name}" removido de la sala`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error al desasignar tag",
        description: error.message || "No se pudo desasignar el tag",
        variant: "destructive",
      });
    }
  };

  const handleAssignGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/meet/spaces/${spaceId}/assign-groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupIds: [groupId] }),
      });

      if (!response.ok) {
        throw new Error("Error al asignar grupo");
      }

      const group = availableGroups.find(g => g.id === groupId);
      if (group) {
        setAssignedGroups(prev => [...prev, group]);
        toast({
          title: "Grupo asignado",
          description: `Grupo "${group.name}" asignado a la sala`,
        });
        
        // Refresh tags as groups might have auto-assigned some
        fetchOrganizationData();
      }
    } catch (error: any) {
      toast({
        title: "Error al asignar grupo",
        description: error.message || "No se pudo asignar el grupo",
        variant: "destructive",
      });
    }
  };

  const handleUnassignGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/meet/spaces/${spaceId}/unassign-groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupIds: [groupId] }),
      });

      if (!response.ok) {
        throw new Error("Error al desasignar grupo");
      }

      const group = assignedGroups.find(g => g.id === groupId);
      setAssignedGroups(prev => prev.filter(g => g.id !== groupId));
      
      if (group) {
        toast({
          title: "Grupo desasignado",
          description: `Grupo "${group.name}" removido de la sala`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error al desasignar grupo",
        description: error.message || "No se pudo desasignar el grupo",
        variant: "destructive",
      });
    }
  };

  const handleEditRoomName = async () => {
    if (!editName.trim() || editName === (room._metadata?.displayName || spaceId)) {
      setIsEditingName(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/meet/rooms/${spaceId}/edit-name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: editName.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar nombre");
      }

      toast({
        title: "Nombre actualizado",
        description: `Sala renombrada a "${editName.trim()}"`,
      });

      setIsEditingName(false);
      onUpdate(); // Refresh the room data in parent component
    } catch (error: any) {
      console.error("Error editing room name:", error);
      toast({
        title: "Error al actualizar nombre",
        description: error.message || "No se pudo actualizar el nombre",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta sala?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/meet/rooms/${spaceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Sala eliminada",
          description: "La sala ha sido eliminada exitosamente",
        });
        onDelete();
      } else {
        const error = await response.json();
        
        // Si es 501, mostrar mensaje específico
        if (response.status === 501) {
          toast({
            title: "Operación no soportada",
            description: "Las salas de Meet no pueden ser eliminadas permanentemente via API. La conferencia activa ha sido terminada.",
            variant: "destructive",
          });
        } else {
          throw new Error(error.error || "Error al eliminar sala");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la sala",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: `${description} copiado al portapapeles`,
    });
  };

  const getAccessTypeBadge = (accessType?: string) => {
    switch (accessType) {
      case 'OPEN':
        return <Badge className="bg-green-100 text-green-700">Abierto</Badge>;
      case 'RESTRICTED':
        return <Badge className="bg-red-100 text-red-700">Restringido</Badge>;
      case 'TRUSTED':
      default:
        return <Badge className="bg-yellow-100 text-yellow-700">Confiable</Badge>;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] max-w-[95vw] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <VideoCameraIcon className="h-5 w-5 text-primary" />
            {isEditingName ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleEditRoomName();
                    if (e.key === 'Escape') {
                      setIsEditingName(false);
                      setEditName(room._metadata?.displayName || spaceId);
                    }
                  }}
                  className="text-base font-semibold"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleEditRoomName}
                  disabled={loading}
                >
                  {loading ? (
                    <Icons.SpinnerIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircleIcon className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditingName(false);
                    setEditName(room._metadata?.displayName || spaceId);
                  }}
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <span>Detalles de la Sala - {room._metadata?.displayName || spaceId}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingName(true)}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </DialogTitle>
          <DialogDescription>
            Gestiona la configuración, miembros y actividad de la sala
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-5 flex-shrink-0">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="organization">Organización</TabsTrigger>
            <TabsTrigger value="members">Miembros</TabsTrigger>
            <TabsTrigger value="settings">Avanzado</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="flex-1 mt-4 overflow-hidden">
            <ScrollArea className="h-full max-h-[55vh]">
              <div className="space-y-4 pr-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <VideoCameraIcon className="h-5 w-5 text-primary" />
                    Información General
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">ID de la Sala</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-muted px-2 py-1 rounded text-sm">{spaceId}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(spaceId, "ID de sala")}
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {room.meetingCode && (
                    <div>
                      <Label className="text-sm font-medium">Código de Reunión</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-muted px-2 py-1 rounded text-sm">{room.meetingCode}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(room.meetingCode!, "Código de reunión")}
                        >
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {room.meetingUri && (
                    <div>
                      <Label className="text-sm font-medium">Enlace de Reunión</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={room.meetingUri}
                          readOnly
                          className="text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(room.meetingUri!, "Enlace de reunión")}
                        >
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(room.meetingUri, '_blank')}
                        >
                          <Icons.ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium">Tipo de Acceso</Label>
                    <div className="mt-1">
                      {getAccessTypeBadge(room.config?.accessType)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-primary" />
                    Estadísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Total Miembros</Label>
                      <div className="text-2xl font-bold">{room.members?.length || 0}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Co-anfitriones</Label>
                      <div className="text-2xl font-bold">
                        {room.members?.filter(m => m.role === 'COHOST').length || 0}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Estado</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {room.activeConference?.conferenceRecord ? (
                        <Badge className="bg-green-100 text-green-700">
                          <span className="animate-pulse mr-1">●</span>
                          Conferencia Activa
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactiva</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

                <Alert>
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertDescription>
                    Los cambios en la configuración pueden tardar unos minutos en aplicarse
                  </AlertDescription>
                </Alert>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="organization" className="flex-1 mt-4 overflow-hidden">
            <ScrollArea className="h-full max-h-[55vh]">
              <div className="space-y-6 pr-4">
                {organizationLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Icons.SpinnerIcon className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Tags Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <TagIcon className="h-5 w-5 text-primary" />
                          Tags
                        </h3>
                        <Badge variant="outline">
                          {assignedTags.length} asignados
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Assigned Tags */}
                        {assignedTags.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Tags Asignados</Label>
                            <div className="flex flex-wrap gap-2">
                              {assignedTags.map((tag) => (
                                <div
                                  key={`assigned-tag-${tag.id}`}
                                  className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm"
                                >
                                  <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: tag.color }}
                                  />
                                  <span>{tag.name}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={() => handleUnassignTag(tag.id)}
                                  >
                                    <XMarkIcon className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Available Tags */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Tags Disponibles</Label>
                          <div className="max-h-32 overflow-y-auto space-y-1 border rounded-md p-2">
                            {availableTags
                              .filter(tag => !assignedTags.some(at => at.id === tag.id))
                              .map((tag) => (
                                <div
                                  key={`available-tag-${tag.id}`}
                                  className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                                  onClick={() => handleAssignTag(tag.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-3 w-3 rounded-full"
                                      style={{ backgroundColor: tag.color }}
                                    />
                                    <span className="text-sm" style={{ paddingLeft: `${tag.level * 12}px` }}>
                                      {tag.name}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {tag.slug}
                                    </Badge>
                                  </div>
                                  <PlusIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                              ))}
                            {availableTags.filter(tag => !assignedTags.some(at => at.id === tag.id)).length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                Todos los tags disponibles ya están asignados
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Groups Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <FolderIcon className="h-5 w-5 text-primary" />
                          Grupos
                        </h3>
                        <Badge variant="outline">
                          {assignedGroups.length} asignados
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Assigned Groups */}
                        {assignedGroups.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Grupos Asignados</Label>
                            <div className="space-y-2">
                              {assignedGroups.map((group) => (
                                <div
                                  key={`assigned-group-${group.id}`}
                                  className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="h-4 w-4 rounded"
                                      style={{ backgroundColor: group.color }}
                                    />
                                    <div>
                                      <p className="font-medium">{group.name}</p>
                                      {group.path && (
                                        <p className="text-xs text-muted-foreground">{group.path}</p>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleUnassignGroup(group.id)}
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Available Groups */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Grupos Disponibles</Label>
                          <div className="max-h-32 overflow-y-auto space-y-1 border rounded-md p-2">
                            {availableGroups
                              .filter(group => !assignedGroups.some(ag => ag.id === group.id))
                              .map((group) => (
                                <div
                                  key={`available-group-${group.id}`}
                                  className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                                  onClick={() => handleAssignGroup(group.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-3 w-3 rounded"
                                      style={{ backgroundColor: group.color }}
                                    />
                                    <span className="text-sm" style={{ paddingLeft: `${group.level * 12}px` }}>
                                      {group.name}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {group.slug}
                                    </Badge>
                                  </div>
                                  <PlusIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                              ))}
                            {availableGroups.filter(group => !assignedGroups.some(ag => ag.id === group.id)).length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                Todos los grupos disponibles ya están asignados
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Info Panel */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <InformationCircleIcon className="h-5 w-5 text-primary mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Organización Automática</p>
                          <p className="text-xs text-muted-foreground">
                            Los grupos pueden asignar automáticamente ciertos tags a la sala. 
                            Los tags asignados automáticamente aparecerán con un indicador especial.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="members" className="flex-1 mt-4 overflow-hidden">
            <div className="h-full max-h-[55vh] overflow-hidden flex flex-col space-y-4">
              {/* Card para agregar miembro - altura fija */}
              <Card className="flex-shrink-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <UsersIcon className="h-5 w-5 text-primary" />
                      Agregar Miembro
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchMembers}
                      disabled={loading}
                    >
                      <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
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
                      onClick={handleAddMember}
                      disabled={!newMemberEmail || addingMember}
                    >
                      {addingMember ? (
                        <Icons.SpinnerIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <PlusIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Card para miembros actuales - altura flexible con scroll */}
              <Card className="flex-1 min-h-0 overflow-hidden">
                <CardHeader className="pb-3 flex-shrink-0">
                  <CardTitle className="text-base">Miembros Actuales ({filteredMembers.length} de {members.length})</CardTitle>
                  
                  {/* Filtros de búsqueda y rol */}
                  <div className="flex gap-2 mt-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Buscar por nombre o email..."
                        value={memberSearchTerm}
                        onChange={(e) => setMemberSearchTerm(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <Select 
                      value={memberRoleFilter} 
                      onValueChange={(value: "ALL" | "COHOST" | "ROLE_UNSPECIFIED") => setMemberRoleFilter(value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todos</SelectItem>
                        <SelectItem value="COHOST">Co-anfitrión</SelectItem>
                        <SelectItem value="ROLE_UNSPECIFIED">Participante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-3">
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Icons.SpinnerIcon className="h-6 w-6 animate-spin" />
                    </div>
                  ) : members.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No hay miembros en esta sala
                    </p>
                  ) : filteredMembers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No se encontraron miembros que coincidan con los filtros
                    </p>
                  ) : (
                    <ScrollArea className="h-80">
                      <div className="space-y-2 pr-3">
                        {filteredMembers.map((member, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-primary">
                                  {(member.email || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate">
                                  {member.displayName || (member.email ? member.email.split('@')[0] : 'Usuario anónimo')}
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {member.email || 'Sin email'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant={member.role === "COHOST" ? "default" : "secondary"}>
                                {member.role === "COHOST" ? "Co-anfitrión" : "Participante"}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMember(member.email || '')}
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 mt-4 overflow-hidden">
            <ScrollArea className="h-full max-h-[55vh]">
              <div className="space-y-4 pr-4">
                <div className="space-y-6">
                  {/* Moderación y Permisos */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Moderación y Permisos</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="restrict-entry-edit">Restringir Puntos de Entrada</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p className="text-sm">
                                  <strong>Control de Aplicaciones:</strong><br/>
                                  • <strong>Desactivado:</strong> Se puede acceder desde cualquier aplicación (Google Meet, Calendar, etc.)<br/>
                                  • <strong>Activado:</strong> Solo la aplicación que creó la sala puede acceder (más restrictivo)
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Limita el acceso solo a la aplicación que creó la sala
                        </p>
                      </div>
                      <Switch
                        id="restrict-entry-edit"
                        checked={room.config?.entryPointAccess === "CREATOR_APP_ONLY"}
                        onCheckedChange={(checked) => 
                          handleUpdateSettings({
                            entryPointAccess: checked ? "CREATOR_APP_ONLY" : "ALL"
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="moderation-edit">Activar Moderación</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p className="text-sm">
                                  <strong>Control del Anfitrión:</strong><br/>
                                  Permite al anfitrión y co-anfitriones controlar quién puede chatear, presentar, reaccionar y si los nuevos participantes entran como espectadores.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          El organizador controla permisos de los participantes
                        </p>
                      </div>
                      <Switch
                        id="moderation-edit"
                        checked={room.config?.moderation === "ON"}
                        onCheckedChange={(checked) => 
                          handleUpdateSettings({
                            moderation: checked ? "ON" : "OFF"
                          })
                        }
                      />
                    </div>

                    {room.config?.moderation === "ON" && (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label>Restricción de Chat</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                  <p className="text-sm">
                                    <strong>Control de Chat:</strong><br/>
                                    Determina quién puede enviar mensajes en el chat durante la reunión.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Select 
                            value={room.config?.moderationRestrictions?.chatRestriction || "NO_RESTRICTION"} 
                            onValueChange={(value: any) => 
                              handleUpdateSettings({
                                moderationRestrictions: {
                                  ...settings.moderationRestrictions,
                                  chatRestriction: value
                                }
                              })
                            }
                          >
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
                          <div className="flex items-center gap-2">
                            <Label>Restricción de Reacciones</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                  <p className="text-sm">
                                    <strong>Control de Reacciones:</strong><br/>
                                    Determina quién puede enviar reacciones (emojis, "me gusta", etc.) durante la reunión.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Select 
                            value={room.config?.moderationRestrictions?.reactionRestriction || "NO_RESTRICTION"} 
                            onValueChange={(value: any) => 
                              handleUpdateSettings({
                                moderationRestrictions: {
                                  ...settings.moderationRestrictions,
                                  reactionRestriction: value
                                }
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NO_RESTRICTION">Todos pueden reaccionar</SelectItem>
                              <SelectItem value="HOSTS_ONLY">Solo organizadores</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label>Restricción de Presentación</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                  <p className="text-sm">
                                    <strong>Control de Pantalla:</strong><br/>
                                    Determina quién puede compartir pantalla, presentar documentos o mostrar contenido durante la reunión.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Select 
                            value={room.config?.moderationRestrictions?.presentRestriction || "NO_RESTRICTION"} 
                            onValueChange={(value: any) => 
                              handleUpdateSettings({
                                moderationRestrictions: {
                                  ...settings.moderationRestrictions,
                                  presentRestriction: value
                                }
                              })
                            }
                          >
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
                            <div className="flex items-center gap-2">
                              <Label htmlFor="default-viewer-edit">Unirse como Espectador</Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-sm">
                                    <p className="text-sm">
                                      <strong>Modo Espectador:</strong><br/>
                                      Los nuevos participantes entrarán solo con permisos de visualización. El anfitrión puede promocionarlos a participantes activos después.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Nuevos participantes se unen como espectadores
                            </p>
                          </div>
                          <Switch
                            id="default-viewer-edit"
                            checked={room.config?.moderationRestrictions?.defaultJoinAsViewerType === "ON"}
                            onCheckedChange={(checked) => 
                              handleUpdateSettings({
                                moderationRestrictions: {
                                  ...settings.moderationRestrictions,
                                  defaultJoinAsViewerType: checked ? "ON" : "OFF"
                                }
                              })
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Artefactos Automáticos */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Artefactos Automáticos</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="auto-recording-edit">Grabación Automática</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p className="text-sm">
                                  <strong>Grabación Automática:</strong><br/>
                                  La reunión se grabará automáticamente cuando comience. Los archivos se guardan en Google Drive del organizador. Los participantes serán notificados.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Las reuniones se grabarán automáticamente al iniciar
                        </p>
                      </div>
                      <Switch
                        id="auto-recording-edit"
                        checked={room.config?.artifactConfig?.recordingConfig?.autoRecordingGeneration === "ON"}
                        onCheckedChange={(checked) => 
                          handleUpdateSettings({
                            artifactConfig: {
                              ...settings.artifactConfig,
                              recordingConfig: { autoRecordingGeneration: checked ? "ON" : "OFF" }
                            }
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="auto-transcription-edit">Transcripción Automática</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p className="text-sm">
                                  <strong>Transcripción Automática:</strong><br/>
                                  Convierte automáticamente el audio de la reunión en texto. El documento se guarda en Google Drive con marcas de tiempo y identificación de participantes.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Genera transcripciones de las conversaciones
                        </p>
                      </div>
                      <Switch
                        id="auto-transcription-edit"
                        checked={room.config?.artifactConfig?.transcriptionConfig?.autoTranscriptionGeneration === "ON"}
                        onCheckedChange={(checked) => 
                          handleUpdateSettings({
                            artifactConfig: {
                              ...settings.artifactConfig,
                              transcriptionConfig: { autoTranscriptionGeneration: checked ? "ON" : "OFF" }
                            }
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="auto-smart-notes-edit">Notas Inteligentes</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p className="text-sm">
                                  <strong>Notas Inteligentes:</strong><br/>
                                  Genera automáticamente resúmenes, puntos clave, acciones y decisiones de la reunión usando IA. Se guarda como documento de Google Docs.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Genera resúmenes y puntos clave automáticamente
                        </p>
                      </div>
                      <Switch
                        id="auto-smart-notes-edit"
                        checked={room.config?.artifactConfig?.smartNotesConfig?.autoSmartNotesGeneration === "ON"}
                        onCheckedChange={(checked) => 
                          handleUpdateSettings({
                            artifactConfig: {
                              ...settings.artifactConfig,
                              smartNotesConfig: { autoSmartNotesGeneration: checked ? "ON" : "OFF" }
                            }
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* 
                    FUNCIONALIDAD DE REPORTES - COMENTADA TEMPORALMENTE
                    =====================================================
                    Esta sección está comentada porque requiere Google Workspace Enterprise
                    o una suscripción avanzada que incluya "Meeting attendance reports".
                    
                    Para habilitar en el futuro, descomentar la sección siguiente.
                  */}
                  {/*
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Reportes</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="attendance-report-edit">Reporte de Asistencia</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p className="text-sm">
                                  <strong>Reporte de Asistencia:</strong><br/>
                                  Genera automáticamente un informe detallado con la lista de participantes, horarios de entrada/salida y duración de permanencia en la reunión.
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
                        id="attendance-report-edit"
                        checked={room.config?.attendanceReportGenerationType === "GENERATE_REPORT"}
                        onCheckedChange={(checked) => 
                          handleUpdateSettings({
                            attendanceReportGenerationType: checked ? "GENERATE_REPORT" : "DO_NOT_GENERATE"
                          })
                        }
                      />
                    </div>
                  </div>
                  */}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="activity" className="flex-1 mt-4 overflow-hidden">
            <ScrollArea className="h-full max-h-[55vh]">
              <div className="space-y-4 pr-4">
                {/* Active Conference Controls */}
                {room.activeConference?.conferenceRecord && (
                  <Alert>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="animate-pulse text-green-500">●</span>
                        <span>Hay una conferencia activa en curso</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEndConference}
                        disabled={loading}
                      >
                        {loading ? (
                          <Icons.SpinnerIcon className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <XMarkIcon className="h-4 w-4 mr-2" />
                        )}
                        Terminar Conferencia
                      </Button>
                    </div>
                  </Alert>
                )}

                {/* Activity Sub-tabs */}
                <Tabs value={activitySubTab} onValueChange={setActivitySubTab} className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                    <TabsTrigger value="vista-general">Vista General</TabsTrigger>
                    <TabsTrigger value="por-sesion">Por Sesión</TabsTrigger>
                  </TabsList>

                  {/* Vista General Tab - Current view */}
                  <TabsContent value="vista-general" className="flex-1 mt-4 overflow-hidden">
                    <ScrollArea className="h-80 max-h-80">
                      <div className="space-y-4 pr-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                  {/* Conference Records */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <CalendarDaysIcon className="h-5 w-5 text-primary" />
                          Historial de Reuniones
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={fetchActivityData}
                          disabled={activityLoading}
                        >
                          <ArrowPathIcon className={`h-4 w-4 ${activityLoading ? 'animate-spin' : ''}`} />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activityLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Icons.SpinnerIcon className="h-6 w-6 animate-spin" />
                        </div>
                      ) : activityData.conferenceRecords.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4 text-sm">
                          No se encontraron reuniones
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {activityData.conferenceRecords.slice(0, 5).map((record: any, index: number) => (
                            <div key={index} className="p-2 bg-muted rounded text-sm">
                              <div className="font-medium">
                                {new Date(record.startTime).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              {record.duration && (
                                <div className="text-muted-foreground">
                                  Duración: {record.duration} min
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recordings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CameraIcon className="h-5 w-5 text-primary" />
                        Grabaciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activityLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Icons.SpinnerIcon className="h-6 w-6 animate-spin" />
                        </div>
                      ) : activityData.recordings.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4 text-sm">
                          No se encontraron grabaciones
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {activityData.recordings.slice(0, 3).map((recording: any, index: number) => (
                            <div key={index} className="p-2 bg-muted rounded text-sm">
                              <div className="font-medium">
                                {new Date(recording.startTime || recording.conferenceStartTime).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit'
                                })}
                              </div>
                              <div className="text-muted-foreground">
                                Estado: {recording.state === 'FILE_GENERATED' ? 'Disponible' : 'Procesando'}
                              </div>
                              {recording.driveDestination?.exportUri && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-1 h-6 text-xs"
                                  onClick={() => window.open(recording.driveDestination.exportUri, '_blank')}
                                >
                                  Ver grabación
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Transcripts */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DocumentTextIcon className="h-5 w-5 text-primary" />
                        Transcripciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activityLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Icons.SpinnerIcon className="h-6 w-6 animate-spin" />
                        </div>
                      ) : activityData.transcripts.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4 text-sm">
                          No se encontraron transcripciones
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {activityData.transcripts.slice(0, 3).map((transcript: any, index: number) => (
                            <div key={index} className="p-2 bg-muted rounded text-sm">
                              <div className="font-medium">
                                {new Date(transcript.startTime || transcript.conferenceStartTime).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit'
                                })}
                              </div>
                              <div className="text-muted-foreground">
                                Estado: {transcript.state === 'FILE_GENERATED' ? 'Disponible' : 'Procesando'}
                              </div>
                              {transcript.entriesPreview?.length > 0 && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  &quot;{transcript.entriesPreview[0].text}&quot;
                                </div>
                              )}
                              {transcript.docsDestination?.exportUri && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-1 h-6 text-xs"
                                  onClick={() => window.open(transcript.docsDestination.exportUri, '_blank')}
                                >
                                  Ver transcripción
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Top Participants (renamed from Participants by Session) */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <UsersIcon className="h-5 w-5 text-primary" />
                          Top Participantes
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchParticipantsReport}
                          disabled={reportLoading}
                        >
                          {reportLoading ? (
                            <Icons.SpinnerIcon className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <DocumentTextIcon className="h-4 w-4 mr-2" />
                          )}
                          Reporte Detallado
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activityLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Icons.SpinnerIcon className="h-6 w-6 animate-spin" />
                        </div>
                      ) : activityData.participantsSessions.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4 text-sm">
                          No se encontraron participantes
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {/* Show top participants by total minutes */}
                          {activityData.participantsSessions
                            .flatMap((session: any) => session.participants)
                            .reduce((acc: any[], participant: any) => {
                              const existing = acc.find(p => p.userInfo.displayName === participant.userInfo.displayName);
                              if (existing) {
                                existing.totalMinutes += participant.totalDurationMinutes;
                                existing.sessions += 1;
                              } else {
                                acc.push({
                                  userInfo: participant.userInfo,
                                  totalMinutes: participant.totalDurationMinutes,
                                  sessions: 1,
                                  type: participant.userInfo.type
                                });
                              }
                              return acc;
                            }, [])
                            .sort((a: any, b: any) => b.totalMinutes - a.totalMinutes)
                            .slice(0, 5)
                            .map((participant: any, index: number) => (
                              <div key={index} className="p-2 bg-muted rounded text-sm">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 bg-primary/20 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-medium text-primary">
                                        {participant.userInfo.displayName.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="font-medium">
                                        {participant.userInfo.displayName.length > 15 ? 
                                          participant.userInfo.displayName.substring(0, 15) + '...' : 
                                          participant.userInfo.displayName}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {participant.sessions} reuniones • {participant.totalMinutes} min total
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-xs">
                                    <Badge variant={participant.type === 'signed_in' ? 'default' : 'secondary'}>
                                      {participant.type === 'signed_in' ? 'Autenticado' : 
                                       participant.type === 'anonymous' ? 'Anónimo' : 'Teléfono'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Smart Notes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icons.Sparkles className="h-5 w-5 text-primary" />
                        Notas Inteligentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activityLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Icons.SpinnerIcon className="h-6 w-6 animate-spin" />
                        </div>
                      ) : activityData.smartNotes.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4 text-sm">
                          No hay notas inteligentes disponibles
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {activityData.smartNotes.slice(0, 3).map((note: any, index: number) => (
                            <div key={index} className="p-2 bg-muted rounded text-sm">
                              <div className="font-medium">
                                {new Date(note.startTime || note.conferenceStartTime).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit'
                                })}
                              </div>
                              <div className="text-muted-foreground">
                                Estado: {note.status === 'Completado' ? 'Disponible' : 'Procesando'}
                              </div>
                              {note.confidence && (
                                <div className="text-xs text-muted-foreground">
                                  Confianza: {note.confidence}%
                                </div>
                              )}
                              {note.summary && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {note.summary.substring(0, 80)}...
                                </div>
                              )}
                              {note.downloadLinks?.summary && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-1 h-6 text-xs"
                                  onClick={() => window.open(note.downloadLinks.summary, '_blank')}
                                >
                                  Ver resumen
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Por Sesión Tab - Comprehensive session view */}
                  <TabsContent value="por-sesion" className="flex-1 mt-4 overflow-hidden">
                    <ScrollArea className="h-80 max-h-80">
                      <div className="space-y-4 pr-4">
                        {activityLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Icons.SpinnerIcon className="h-8 w-8 animate-spin" />
                          </div>
                        ) : activityData.participantsSessions.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground mb-4">No se encontraron sesiones</p>
                            <Button
                              variant="outline"
                              onClick={fetchActivityData}
                              disabled={activityLoading}
                            >
                              <ArrowPathIcon className="h-4 w-4 mr-2" />
                              Actualizar datos
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {activityData.participantsSessions.map((session: any, sessionIndex: number) => {
                              // Find corresponding recordings, transcripts, and smart notes for this session
                              const sessionRecordings = activityData.recordings.filter((recording: any) => 
                                recording.conferenceRecordId === session.conferenceRecordId
                              );
                              const sessionTranscripts = activityData.transcripts.filter((transcript: any) => 
                                transcript.conferenceRecordId === session.conferenceRecordId
                              );
                              const sessionSmartNotes = activityData.smartNotes.filter((note: any) => 
                                note.conferenceRecordId === session.conferenceRecordId
                              );
                              
                              return (
                        <Card key={sessionIndex} className="overflow-hidden">
                          <CardHeader className="bg-muted/50">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <CalendarDaysIcon className="h-5 w-5 text-primary" />
                                  Sesión {session.sessionDateTime}
                                </CardTitle>
                                <div className="text-sm text-muted-foreground mt-1">
                                  Duración: {session.duration} min • {session.participantCount} participantes • ID: {session.conferenceRecordId}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {session.isActive && (
                                  <Badge className="animate-pulse">
                                    <span className="mr-1">●</span>
                                    Activa
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="grid gap-6 md:grid-cols-2">
                              {/* Grabaciones */}
                              <div className="space-y-3">
                                <h4 className="font-medium flex items-center gap-2">
                                  <CameraIcon className="h-4 w-4 text-primary" />
                                  Grabaciones ({sessionRecordings.length})
                                </h4>
                                {sessionRecordings.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">No hay grabaciones disponibles</p>
                                ) : (
                                  <div className="space-y-2">
                                    {sessionRecordings.map((recording: any, recIndex: number) => (
                                      <div key={recIndex} className="p-3 bg-background border rounded-lg">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <div className="text-sm font-medium">
                                              Estado: {recording.state === 'FILE_GENERATED' ? '✅ Disponible' : '⏳ Procesando'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {recording.startTime && new Date(recording.startTime).toLocaleTimeString('es-ES')}
                                            </div>
                                          </div>
                                          {recording.driveDestination?.exportUri && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => window.open(recording.driveDestination.exportUri, '_blank')}
                                            >
                                              <Icons.ExternalLink className="h-3 w-3 mr-1" />
                                              Ver
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Transcripciones */}
                              <div className="space-y-3">
                                <h4 className="font-medium flex items-center gap-2">
                                  <DocumentTextIcon className="h-4 w-4 text-primary" />
                                  Transcripciones ({sessionTranscripts.length})
                                </h4>
                                {sessionTranscripts.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">No hay transcripciones disponibles</p>
                                ) : (
                                  <div className="space-y-2">
                                    {sessionTranscripts.map((transcript: any, transIndex: number) => (
                                      <div key={transIndex} className="p-3 bg-background border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                          <div>
                                            <div className="text-sm font-medium">
                                              Estado: {transcript.state === 'FILE_GENERATED' ? '✅ Disponible' : '⏳ Procesando'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {transcript.startTime && new Date(transcript.startTime).toLocaleTimeString('es-ES')}
                                            </div>
                                          </div>
                                          {transcript.docsDestination?.exportUri && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => window.open(transcript.docsDestination.exportUri, '_blank')}
                                            >
                                              <Icons.ExternalLink className="h-3 w-3 mr-1" />
                                              Ver
                                            </Button>
                                          )}
                                        </div>
                                        {transcript.entriesPreview?.length > 0 && (
                                          <div className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2">
                                            &quot;{transcript.entriesPreview[0].text.substring(0, 80)}...&quot;
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Participantes */}
                              <div className="space-y-3">
                                <h4 className="font-medium flex items-center gap-2">
                                  <UsersIcon className="h-4 w-4 text-primary" />
                                  Participantes ({session.participantCount})
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      // Generate CSV for this session's participants
                                      const csvData = session.participants.map((p: any) => ({
                                        'Nombre': p.userInfo.displayName,
                                        'Tipo': p.userInfo.type === 'signed_in' ? 'Autenticado' : 
                                               p.userInfo.type === 'anonymous' ? 'Anónimo' : 'Teléfono',
                                        'Tiempo Participación (min)': p.totalDurationMinutes,
                                        'Hora Entrada': p.joinTime,
                                        'Hora Salida': p.leaveTime,
                                        'Sesiones': p.sessionsCount,
                                        'Aún Activo': p.isStillActive ? 'Sí' : 'No'
                                      }));
                                      
                                      const csv = [
                                        Object.keys(csvData[0]).join(','),
                                        ...csvData.map((row: any) => Object.values(row).join(','))
                                      ].join('\n');
                                      
                                      const blob = new Blob([csv], { type: 'text/csv' });
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `participantes_${session.conferenceRecordId}.csv`;
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                    }}
                                  >
                                    <Icons.Download className="h-3 w-3 mr-1" />
                                    CSV
                                  </Button>
                                </h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {session.participants.map((participant: any, partIndex: number) => (
                                    <div key={partIndex} className="p-2 bg-background border rounded-lg">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="h-6 w-6 bg-primary/20 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-medium text-primary">
                                              {participant.userInfo.displayName.charAt(0).toUpperCase()}
                                            </span>
                                          </div>
                                          <div>
                                            <div className="text-sm font-medium">
                                              {participant.userInfo.displayName}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {participant.userInfo.type === 'signed_in' ? 'Autenticado' : 
                                               participant.userInfo.type === 'anonymous' ? 'Anónimo' : 'Teléfono'}
                                              {participant.isStillActive && (
                                                <span className="ml-2 text-green-600">● Conectado</span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-sm font-medium">
                                            {participant.totalDurationMinutes} min
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            {participant.joinTime} - {participant.leaveTime}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Notas Inteligentes */}
                              <div className="space-y-3">
                                <h4 className="font-medium flex items-center gap-2">
                                  <Icons.Sparkles className="h-4 w-4 text-primary" />
                                  Notas Inteligentes ({sessionSmartNotes.length})
                                </h4>
                                {sessionSmartNotes.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">No hay notas inteligentes disponibles</p>
                                ) : (
                                  <div className="space-y-2">
                                    {sessionSmartNotes.map((note: any, noteIndex: number) => (
                                      <div key={noteIndex} className="p-3 bg-background border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                          <div>
                                            <div className="text-sm font-medium">
                                              Estado: {note.status === 'Completado' ? '✅ Disponible' : '⏳ Procesando'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              Confianza: {note.confidence}% • {note.keyTopics?.length || 0} temas
                                            </div>
                                          </div>
                                          <div className="flex gap-1">
                                            {note.downloadLinks?.summary && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(note.downloadLinks.summary, '_blank')}
                                              >
                                                <Icons.Download className="h-3 w-3 mr-1" />
                                                PDF
                                              </Button>
                                            )}
                                            {note.downloadLinks?.actionItems && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(note.downloadLinks.actionItems, '_blank')}
                                              >
                                                <Icons.Download className="h-3 w-3 mr-1" />
                                                CSV
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                        {note.summary && (
                                          <div className="text-xs text-muted-foreground border-l-2 border-muted pl-2">
                                            {note.summary.substring(0, 120)}...
                                          </div>
                                        )}
                                        {note.actionItems && note.actionItems.length > 0 && (
                                          <div className="mt-2">
                                            <div className="text-xs font-medium mb-1">Acciones identificadas:</div>
                                            <div className="text-xs text-muted-foreground">
                                              • {note.actionItems[0].action}
                                              {note.actionItems.length > 1 && ` (+${note.actionItems.length - 1} más)`}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={handleDeleteRoom}
            disabled={loading}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Eliminar Sala
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>

    {/* Modal de Reporte Detallado de Participantes */}
    {showParticipantsReport && participantsReport && (
      <Dialog open={showParticipantsReport} onOpenChange={setShowParticipantsReport}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] max-w-[95vw] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 text-primary" />
              Reporte Detallado de Participantes - {spaceId}
            </DialogTitle>
            <DialogDescription>
              Análisis completo de {participantsReport.totalParticipantRecords} registros de participación en {participantsReport.conferenceRecordsAnalyzed} reuniones
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="summary" className="mt-4 flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="summary">Resumen</TabsTrigger>
              <TabsTrigger value="participants">Participantes</TabsTrigger>
              <TabsTrigger value="sessions">Sesiones</TabsTrigger>
            </TabsList>

            {/* Tab Resumen */}
            <TabsContent value="summary" className="flex-1 mt-4 overflow-hidden">
              <ScrollArea className="h-96 max-h-96">
                <div className="space-y-4 pr-4">
                  <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Estadísticas Generales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Participantes únicos:</span>
                        <span className="font-medium">{participantsReport.uniqueParticipants}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total registros:</span>
                        <span className="font-medium">{participantsReport.totalParticipantRecords}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Reuniones analizadas:</span>
                        <span className="font-medium">{participantsReport.conferenceRecordsAnalyzed}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Top Participantes por Tiempo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {participantsReport.participantsSummary.slice(0, 5).map((participant: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <div className="font-medium">{participant.displayName}</div>
                            <div className="text-xs text-muted-foreground">
                              {participant.totalMeetings} reuniones • {participant.avgParticipationPercentage}% participación promedio
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">{Math.round(participant.totalDurationMinutes)} min</div>
                            <div className="text-xs text-muted-foreground">{participant.totalSessions} sesiones</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Tab Participantes - Enfoque en participantes únicos */}
            <TabsContent value="participants" className="flex-1 mt-4 overflow-hidden">
              <ScrollArea className="h-96 max-h-96">
                <div className="space-y-4 pr-4">
                  <div className="space-y-3">
                {participantsReport.participantsSummary.map((participant: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {participant.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{participant.displayName}</h4>
                          <div className="text-sm text-muted-foreground">
                            Tipo: {participant.userType === 'signed_in' ? 'Autenticado' : 
                                   participant.userType === 'anonymous' ? 'Anónimo' : 'Teléfono'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{Math.round(participant.totalDurationMinutes)} min</div>
                        <div className="text-xs text-muted-foreground">{participant.totalMeetings} reuniones</div>
                      </div>
                    </div>
                    
                    {/* Estadísticas generales */}
                    <div className="grid grid-cols-3 gap-4 mb-3 p-2 bg-muted rounded">
                      <div className="text-center">
                        <div className="text-sm font-medium">{participant.avgParticipationPercentage}%</div>
                        <div className="text-xs text-muted-foreground">Participación promedio</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{participant.totalSessions}</div>
                        <div className="text-xs text-muted-foreground">Total sesiones</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{Math.round(participant.totalDurationMinutes / participant.totalMeetings)} min</div>
                        <div className="text-xs text-muted-foreground">Promedio por reunión</div>
                      </div>
                    </div>
                    
                    {/* Lista de sesiones donde participó */}
                    <div>
                      <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <CalendarDaysIcon className="h-4 w-4" />
                        Sesiones ({participant.meetingDates.length})
                      </h5>
                      <div className="space-y-1">
                        {participant.meetingDates.slice(0, 4).map((meetingDate: string, dateIndex: number) => {
                          // Buscar la sesión correspondiente en los datos detallados
                          const sessionData = participantsReport.participants.find((p: any) => 
                            p.userInfo.displayName === participant.displayName && p.meetingDate === meetingDate
                          );
                          
                          return (
                            <div key={dateIndex} className="flex items-center justify-between p-2 bg-background rounded border text-sm">
                              <div className="flex items-center gap-2">
                                <CalendarDaysIcon className="h-3 w-3 text-muted-foreground" />
                                <span>{meetingDate}</span>
                                {sessionData?.stillActive && (
                                  <Badge className="text-xs h-4">
                                    <span className="animate-pulse mr-1">●</span>
                                    Activa
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{sessionData?.totalDurationMinutes || 0} min</div>
                                <div className="text-xs text-muted-foreground">
                                  {sessionData?.participationPercentage || 0}% participación
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {participant.meetingDates.length > 4 && (
                          <div className="text-xs text-muted-foreground text-center py-1">
                            +{participant.meetingDates.length - 4} sesiones más
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Información temporal */}
                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Primera vez: {new Date(participant.firstSeen).toLocaleDateString('es-ES')}</span>
                        <span>Última vez: {new Date(participant.lastSeen).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                  </Card>
                ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Tab Sesiones - Enfoque en sesiones con sus participantes */}
            <TabsContent value="sessions" className="flex-1 mt-4 overflow-hidden">
              <ScrollArea className="h-96 max-h-96">
                <div className="space-y-4 pr-4">
                  <div className="space-y-4">
                {/* Usar datos de participantsSessions si están disponibles, sino usar datos agrupados */}
                {(participantsReport.participantsSessions || 
                  // Crear sesiones agrupadas desde participants si no hay participantsSessions
                  participantsReport.participants.reduce((sessions: any[], participant: any) => {
                    const existingSession = sessions.find(s => s.conferenceRecordId === participant.conferenceRecordId);
                    if (existingSession) {
                      existingSession.participants.push(participant);
                    } else {
                      sessions.push({
                        conferenceRecordId: participant.conferenceRecordId,
                        sessionDateTime: participant.meetingDate,
                        startTime: participant.conferenceStartTime,
                        endTime: participant.conferenceEndTime,
                        duration: participant.conferenceDuration,
                        participants: [participant],
                        participantCount: 1,
                        isActive: participant.stillActive
                      });
                    }
                    return sessions;
                  }, []).map((session: any) => ({ ...session, participantCount: session.participants.length }))
                ).map((session: any, sessionIndex: number) => (
                  <Card key={sessionIndex}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <CalendarDaysIcon className="h-4 w-4 text-primary" />
                            {session.sessionDateTime || new Date(session.startTime).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </CardTitle>
                          <div className="text-sm text-muted-foreground">
                            Duración: {session.duration} min • {session.participantCount} participantes
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.isActive && (
                            <Badge className="text-xs">
                              <span className="animate-pulse mr-1">●</span>
                              Activa
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            ID: {session.conferenceRecordId}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Estadísticas de la sesión */}
                      {session.totalParticipationMinutes && (
                        <div className="grid grid-cols-2 gap-4 mb-3 p-2 bg-muted rounded">
                          <div className="text-center">
                            <div className="text-sm font-medium">{session.totalParticipationMinutes} min</div>
                            <div className="text-xs text-muted-foreground">Participación total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">{session.averageParticipationMinutes || Math.round(session.totalParticipationMinutes / session.participantCount)} min</div>
                            <div className="text-xs text-muted-foreground">Promedio por participante</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Lista de participantes */}
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <UsersIcon className="h-4 w-4" />
                          Participantes ({session.participantCount})
                        </h5>
                        <div className="space-y-2">
                          {session.participants.map((participant: any, partIndex: number) => (
                            <div key={partIndex} className="flex items-center justify-between p-2 bg-background rounded border">
                              <div className="flex items-center gap-3">
                                <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">
                                    {(participant.userInfo?.displayName || participant.displayName || 'U').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium">
                                    {participant.userInfo?.displayName || participant.displayName || 'Usuario desconocido'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Tipo: {(participant.userInfo?.type || participant.userType) === 'signed_in' ? 'Autenticado' : 
                                           (participant.userInfo?.type || participant.userType) === 'anonymous' ? 'Anónimo' : 
                                           (participant.userInfo?.type || participant.userType) === 'phone' ? 'Teléfono' : 'Desconocido'}
                                    {participant.joinTime && participant.leaveTime && (
                                      <span className="ml-2">
                                        {participant.joinTime} - {participant.leaveTime}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {participant.totalDurationMinutes || 0} min
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {participant.participationPercentage || 0}% participación
                                </div>
                                {participant.isStillActive && (
                                  <div className="text-xs text-green-600 font-medium">
                                    ● Conectado
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowParticipantsReport(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
};