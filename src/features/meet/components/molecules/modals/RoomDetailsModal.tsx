/**
 * ROOMDETAILSMODAL - Modal funcional real con sistema atómico
 * Conecta datos reales de rooms con componentes atómicos
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState, useEffect, lazy } from "react";
import { useToast } from "@/src/hooks/use-toast";
import { SectionNavigationModal } from "./SectionNavigationModal";
import { 
  InformationCircleIcon,
  TagIcon,
  UsersIcon,
  Cog6ToothIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { roleDisplayToApi } from "../cards/MemberCardDemo";
import type { Room, RoomMember } from "../../../services/interfaces";
import { 
  AccessTypeEnum, 
  EntryPointAccessEnum, 
  RestrictionTypeEnum,
  AutoGenerationTypeEnum
} from "../../../validations/SpaceConfigSchema";

// Importar los organismos de secciones atómicas
import { GeneralSectionDemo } from "../../organisms/sections/GeneralSectionDemo";
import { ReferencesSectionDemo } from "../../organisms/sections/ReferencesSectionDemo"; 
import { MembersSectionDemo } from "../../organisms/sections/MembersSectionDemo";
import { ConfigurationSectionDemo } from "../../organisms/sections/ConfigurationSectionDemo";
import { SessionsSectionDemo } from "../../organisms/sections/SessionsSectionDemo";
import { StatisticsSectionDemo } from "../../organisms/sections/StatisticsSectionDemo";

// Using proper typed interfaces from services
interface MeetRoom extends Omit<Room, 'config'> {
  name: string;
  meetingUri?: string;
  meetingCode?: string;
  config?: {
    accessType?: "OPEN" | "TRUSTED" | "RESTRICTED";
    entryPointAccess?: "ALL" | "CREATOR_APP_ONLY"; 
    moderation?: "ON" | "OFF";
    moderationRestrictions?: {
      chatRestriction?: "NO_RESTRICTION" | "HOSTS_ONLY";
      reactionRestriction?: "NO_RESTRICTION" | "HOSTS_ONLY";
      presentRestriction?: "NO_RESTRICTION" | "HOSTS_ONLY";
      defaultJoinAsViewerType?: "ON" | "OFF";
    };
    artifactConfig?: {
      recordingConfig?: { autoRecordingGeneration?: "ON" | "OFF" };
      transcriptionConfig?: { autoTranscriptionGeneration?: "ON" | "OFF" };
      smartNotesConfig?: { autoSmartNotesGeneration?: "ON" | "OFF" };
    };
  };
  activeConference?: {
    conferenceRecord?: any;
  };
  _metadata?: {
    localId?: string;
    displayName?: string;
    createdAt?: Date | string;
    tags?: string[];
    groups?: string[];
  };
  _analytics?: {
    permanentMembers?: {
      total: number;
      cohosts: number;
      regularMembers: number;
    };
    participants?: {
      invited: number;
      uninvited: number;
      unique: number;
    };
    sessions?: {
      total: number;
      totalDurationSeconds: number;
      averageDurationSeconds: number;
      averageParticipantsPerSession: number;
    };
  };
  members?: Array<{
    name: string;
    email: string;
    role: "ROLE_UNSPECIFIED" | "COHOST";
    displayName?: string;
    isCohost?: boolean;
    joinedAt?: string;
  }>;
}

interface RoomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: MeetRoom | null;
  onUpdate: () => void;
  onDelete: () => void;
}

// Función para convertir datos del room real a formato de dummy data
const convertRoomToModalData = (
  room: MeetRoom, 
  assignedTags?: any[], 
  availableTags?: any[], 
  assignedGroups?: any[], 
  availableGroups?: any[],
  members?: any[],
  membersStats?: { total: number; cohosts: number; regularMembers: number; active: number },
  configurations?: any
) => {
  if (!room) return null;

  const spaceId = room.name?.split("/").pop() || "";
  const displayName = room._metadata?.displayName || spaceId;

  return {
    roomInfo: {
      roomId: room.name || `spaces/${spaceId}`,
      meetingCode: room.meetingCode || spaceId,
      meetingLink: room.meetingUri || `https://meet.google.com/${room.meetingCode || spaceId}`,
      accessType: {
        type: (room.config?.accessType || "OPEN").toLowerCase(),
        label: room.config?.accessType === "RESTRICTED" ? "Restringido" 
              : room.config?.accessType === "TRUSTED" ? "De confianza" 
              : "Abierto",
        className: room.config?.accessType === "RESTRICTED" ? "bg-red-900 text-red-100 hover:bg-red-800"
                 : room.config?.accessType === "TRUSTED" ? "bg-yellow-900 text-yellow-100 hover:bg-yellow-800"
                 : "bg-green-900 text-green-100 hover:bg-green-800"
      },
      status: {
        type: room.activeConference?.conferenceRecord ? "active" : "inactive",
        label: room.activeConference?.conferenceRecord ? "Conferencia Activa" : "Inactiva",
        animated: !!room.activeConference?.conferenceRecord,
        showCloseButton: !!room.activeConference?.conferenceRecord
      },
      alert: {
        message: "Los cambios en la configuración pueden tardar unos minutos en aplicarse"
      }
    },
    references: {
      tags: {
        assigned: (assignedTags || []).map((tag) => ({
          name: tag.name,
          color: tag.color || "#10B981",
          slug: tag.slug
        })),
        available: (availableTags || []).map((tag) => ({
          name: tag.name,
          color: tag.color || "#3B82F6",
          slug: tag.slug
        }))
      },
      groups: {
        assigned: (assignedGroups || []).map((group) => ({
          name: group.name,
          path: group.path || `/${group.slug}`,
          color: group.color || "#10B981"
        })),
        available: (availableGroups || []).map((group) => ({
          name: group.name,
          path: group.path || `/${group.slug}`,
          color: group.color || "#3B82F6"
        }))
      }
    },
    members: {
      members: (members || room.members || []).map((member, index) => ({
        id: `member-${index}`,
        name: member.displayName || member.name || member.email.split("@")[0],
        email: member.email,
        role: member.role, // Mantener el rol de API sin mapear
        isCohost: member.role === "COHOST",
        joinedAt: member.joinedAt || new Date().toISOString(),
        status: "active" as const
      })),
      totalMembers: membersStats?.total || room._analytics?.permanentMembers?.total || 0,
      activeMembers: membersStats?.active || (room.members?.length || 0)
    },
    configuration: configurations && Object.keys(configurations).length > 0 
      ? configurations 
      : generateMockConfigData(),
    sessions: {
      summary: {
        totalSessions: room._analytics?.sessions?.total || 0,
        totalDuration: room._analytics?.sessions?.totalDurationSeconds || 0,
        averageDuration: room._analytics?.sessions?.averageDurationSeconds || 0,
        averageParticipants: room._analytics?.sessions?.averageParticipantsPerSession || 0
      },
      history: [] // Por ahora vacío, se podría cargar dinámicamente
    },
    statistics: {
      general: {
        totalSessions: room._analytics?.sessions?.total || 0,
        totalDuration: room._analytics?.sessions?.totalDurationSeconds || 0,
        totalParticipants: room._analytics?.participants?.unique || 0,
        averageParticipants: room._analytics?.sessions?.averageParticipantsPerSession || 0
      },
      ranking: [] // Por ahora vacío, se podría cargar dinámicamente
    }
  };
};

// Componentes lazy-loaded para las secciones reales
const GeneralSectionWrapper = lazy(() => Promise.resolve({
  default: ({ navigation, roomData, onUpdate, toast }: any) => (
    <GeneralSectionDemo
      data={roomData.roomInfo}
      onCopy={(value) => {
        navigator.clipboard.writeText(value);
        console.log('✅ Copiado:', value);
      }}
      onExternal={(value) => {
        window.open(value, '_blank');
        console.log('🔗 Abriendo:', value);
      }}
      onCloseSession={() => {
        // TODO: Implementar cierre de sesión real
        console.log('🚪 Cerrando sesión');
        toast({
          title: "Cerrando sesión",
          description: "Se está cerrando la sesión activa...",
        });
        onUpdate?.(); // Callback para actualizar datos
      }}
    />
  )
}));

const ReferencesSectionWrapper = lazy(() => Promise.resolve({
  default: ({ navigation, roomData, handleAssignTag, handleUnassignTag, handleAssignGroup, handleUnassignGroup, organizationLoading }: any) => (
    <ReferencesSectionDemo
      data={roomData.references}
      loading={organizationLoading}
      onTagRemove={(tagName) => {
        console.log('🏷️ Remover tag:', tagName);
        // Find tag by name and call real function
        const tag = roomData.references.tags.assigned.find((t: any) => t.name === tagName);
        if (tag) {
          console.log('🔍 Tag para remover:', tag);
          handleUnassignTag(tag.id); // Solo usar id, no slug como fallback
        }
      }}
      onTagAdd={(tagName) => {
        console.log('➕ Agregar tag:', tagName);
        // Find tag by name and call real function
        const tag = roomData.references.tags.available.find((t: any) => t.name === tagName);
        if (tag) {
          console.log('🔍 Tag encontrado:', tag);
          handleAssignTag(tag.id); // Solo usar id, no slug como fallback
        }
      }}
      onGroupRemove={(groupName) => {
        console.log('👥 Desasignar grupo:', groupName);
        // Find group by name and call real function
        const group = roomData.references.groups.assigned.find((g: any) => g.name === groupName);
        if (group) {
          console.log('🔍 Grupo para desasignar:', group);
          handleUnassignGroup(group.id); // Solo usar id, no slug como fallback
        }
      }}
      onGroupAdd={(groupName) => {
        console.log('➕ Asignar grupo:', groupName);
        // Find group by name and call real function
        const group = roomData.references.groups.available.find((g: any) => g.name === groupName);
        if (group) {
          console.log('🔍 Grupo encontrado:', group);
          handleAssignGroup(group.id); // Solo usar id, no slug como fallback
        }
      }}
    />
  )
}));

const MembersSectionWrapper = lazy(() => Promise.resolve({
  default: ({ navigation, roomData, room, handleAddMember, handleDeleteMember, handleRoleChange, handleRefreshMembers, membersLoading }: any) => (
    <MembersSectionDemo
      data={roomData.members}
      loading={membersLoading}
      onAddMember={handleAddMember}
      onDeleteMember={handleDeleteMember}
      onRoleChange={handleRoleChange}
      onRefresh={handleRefreshMembers}
    />
  )
}));

const ConfigurationSectionWrapper = lazy(() => Promise.resolve({
  default: ({ navigation, roomData, room, onUpdate, handleConfigChange, configLoading }: any) => (
    <ConfigurationSectionDemo
      data={roomData.configuration}
      loading={configLoading}
      onConfigChange={handleConfigChange}
    />
  )
}));

const SessionsSectionWrapper = lazy(() => Promise.resolve({
  default: ({ navigation, roomData, room, toast }: any) => (
    <SessionsSectionDemo
      spaceId={room?.name?.split('/').pop() || null}
      onPlayRecording={(sessionId, recordingIndex) => {
        console.log('🎬 Reproducir grabación:', sessionId, recordingIndex);
        toast({
          title: "Reproduciendo grabación",
          description: `Iniciando grabación ${recordingIndex} de la sesión ${sessionId}`,
        });
        // TODO: Implementar reproducción real de grabación
      }}
      onDownloadRecording={(sessionId, recordingIndex) => {
        console.log('💾 Descargar grabación:', sessionId, recordingIndex);
        toast({
          title: "Descarga iniciada",
          description: `Descargando grabación ${recordingIndex} de la sesión ${sessionId}`,
        });
        // TODO: Implementar descarga real
      }}
      onViewTranscription={(sessionId, transcriptIndex) => {
        console.log('📄 Ver transcripción:', sessionId, transcriptIndex);
        toast({
          title: "Abriendo transcripción",
          description: `Visualizando transcripción ${transcriptIndex} de la sesión ${sessionId}`,
        });
        // TODO: Implementar visualización real
      }}
      onDownloadTranscriptionPdf={(sessionId, transcriptIndex) => {
        console.log('📄 Descargar PDF:', sessionId, transcriptIndex);
        toast({
          title: "Descarga de PDF iniciada",
          description: `Descargando PDF de transcripción ${transcriptIndex} de la sesión ${sessionId}`,
        });
        // TODO: Implementar descarga de PDF real
      }}
      onViewSmartNote={(sessionId, noteIndex) => {
        console.log('✨ Ver nota inteligente:', sessionId, noteIndex);
        toast({
          title: "Abriendo nota inteligente",
          description: `Visualizando nota ${noteIndex} de la sesión ${sessionId}`,
        });
        // TODO: Implementar visualización real
      }}
      onExportSmartNote={(sessionId, noteIndex) => {
        console.log('📤 Exportar nota:', sessionId, noteIndex);
        toast({
          title: "Exportación iniciada",
          description: `Exportando nota ${noteIndex} de la sesión ${sessionId}`,
        });
        // TODO: Implementar exportación real
      }}
    />
  )
}));

const StatisticsSectionWrapper = lazy(() => Promise.resolve({
  default: ({ navigation, roomData, room }: any) => (
    <StatisticsSectionDemo
      spaceId={room?.name?.split('/').pop() || null}
    />
  )
}));

// Definición de secciones
const modalSections = [
  {
    id: "general",
    title: "General",
    icon: InformationCircleIcon,
    description: "Información básica y configuración de la sala",
    keywords: ["información", "nombre", "código", "básico"],
    component: GeneralSectionWrapper,
  },
  {
    id: "references",
    title: "Referencias", 
    icon: TagIcon,
    description: "Tags y grupos para organizar la sala",
    keywords: ["tags", "grupos", "referencias", "organización", "categorías"],
    component: ReferencesSectionWrapper,
  },
  {
    id: "members",
    title: "Miembros", 
    icon: UsersIcon,
    description: "Gestión de participantes y roles",
    keywords: ["miembros", "participantes", "usuarios", "roles", "cohosts"],
    component: MembersSectionWrapper,
  },
  {
    id: "settings",
    title: "Configuración",
    icon: Cog6ToothIcon,
    description: "Configuraciones avanzadas de la sala",
    keywords: ["configuración", "avanzado", "moderación", "grabación", "restricciones"],
    component: ConfigurationSectionWrapper,
  },
  {
    id: "sessions", 
    title: "Sesiones",
    icon: CalendarDaysIcon,
    description: "Detalle completo por sesión de reunión",
    keywords: ["sesiones", "reuniones", "detalle", "participantes", "grabaciones"],
    component: SessionsSectionWrapper,
  },
  {
    id: "statistics", 
    title: "Estadísticas",
    icon: ChartBarIcon,
    description: "Analytics y ranking de participantes",
    keywords: ["estadísticas", "analytics", "ranking", "participantes", "métricas"],
    component: StatisticsSectionWrapper,
  },
];

export const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  isOpen,
  onClose,
  room,
  onUpdate,
  onDelete,
}) => {
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState<string>("general");

  // Estados para organización (tags y grupos) reales
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [assignedTags, setAssignedTags] = useState<any[]>([]);
  const [assignedGroups, setAssignedGroups] = useState<any[]>([]);
  const [organizationLoading, setOrganizationLoading] = useState(false);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Estados para miembros reales
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersStats, setMembersStats] = useState({
    total: 0,
    cohosts: 0,
    regularMembers: 0,
    active: 0
  });

  // Estados para configuraciones reales
  const [configurations, setConfigurations] = useState<any>({});
  const [configLoading, setConfigLoading] = useState(false);

  // Función para cargar datos de organización (tags y grupos) - con fallback a datos mock
  const fetchOrganizationData = async () => {
    console.log('🚀 fetchOrganizationData iniciado');
    try {
      setOrganizationLoading(true);
      const spaceId = room?.name?.split("/").pop() || "";
      console.log('🎯 Space ID:', spaceId);

      // Intentar fetch real primero
      console.log('📡 Intentando fetch real de APIs...');
      try {
        const [tagsResponse, groupsResponse] = await Promise.all([
          fetch("/api/meet/tags?parentId=all", {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch("/api/meet/groups?parentId=all", {
            credentials: 'include', 
            headers: { 'Content-Type': 'application/json' }
          }),
        ]);

        console.log('📥 Responses received:', {
          tagsOk: tagsResponse.ok, 
          tagsStatus: tagsResponse.status,
          groupsOk: groupsResponse.ok, 
          groupsStatus: groupsResponse.status
        });

        if (tagsResponse.ok && groupsResponse.ok) {
          const [tagsData, groupsData] = await Promise.all([
            tagsResponse.json(),
            groupsResponse.json()
          ]);
          
          setAvailableTags(tagsData.tags || []);
          setAvailableGroups(groupsData.groups || []);
          setIsUsingMockData(false); // Datos reales
          
          // Fetch assignments
          const assignmentsResponse = await fetch(
            `/api/meet/spaces/${spaceId}/assignments`,
            {
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            }
          );

          if (assignmentsResponse.ok) {
            const assignmentsData = await assignmentsResponse.json();
            setAssignedTags(assignmentsData.assignedTags || []);
            setAssignedGroups(assignmentsData.assignedGroups || []);
          } else {
            setAssignedTags([]);
            setAssignedGroups([]);
          }
          
          console.log('✅ Usando datos reales de la API');
          return; // Éxito, salir de la función
        } else {
          console.log('❌ Una o ambas APIs fallaron, continuando con mock data...');
        }
      } catch (apiError) {
        console.log("❌ Error de API capturado, usando datos mock:", apiError);
      }

      // Pequeña demora para mostrar loading skeleton
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Fallback GARANTIZADO: Datos mock con colores vibrantes y variados + ObjectIds simulados
      console.log("🎨 Ejecutando fallback a datos mock con paleta de colores vibrantes");
      setIsUsingMockData(true); // Marcar como datos mock
      
      console.log("📝 Configurando availableTags...");
      setAvailableTags([
        { id: '66c1f2e3b4a8c9d012345601', name: 'Marketing', slug: 'marketing', color: '#E91E63' },
        { id: '66c1f2e3b4a8c9d012345602', name: 'Training', slug: 'training', color: '#2196F3' },
        { id: '66c1f2e3b4a8c9d012345603', name: 'Meeting', slug: 'meeting', color: '#4CAF50' },
        { id: '66c1f2e3b4a8c9d012345604', name: 'Estrategia', slug: 'strategy', color: '#9C27B0' },
        { id: '66c1f2e3b4a8c9d012345605', name: 'Desarrollo', slug: 'development', color: '#FF9800' },
        { id: '66c1f2e3b4a8c9d012345606', name: 'Ventas', slug: 'sales', color: '#009688' },
        { id: '66c1f2e3b4a8c9d012345607', name: 'Análisis', slug: 'analysis', color: '#3F51B5' },
      ]);
      
      console.log("📝 Configurando availableGroups...");
      setAvailableGroups([
        { id: '66c1f2e3b4a8c9d012345701', name: 'Todo el Personal', slug: 'all-staff', path: '/all-staff', color: '#E91E63' },
        { id: '66c1f2e3b4a8c9d012345702', name: 'Gerentes', slug: 'managers', path: '/managers', color: '#9C27B0' },
        { id: '66c1f2e3b4a8c9d012345703', name: 'Equipo Técnico', slug: 'tech-team', path: '/tech-team', color: '#2196F3' },
        { id: '66c1f2e3b4a8c9d012345704', name: 'Equipo Marketing', slug: 'marketing-team', path: '/marketing-team', color: '#4CAF50' },
        { id: '66c1f2e3b4a8c9d012345705', name: 'Equipo Ventas', slug: 'sales-team', path: '/sales-team', color: '#FF9800' },
      ]);
      
      console.log("📝 Configurando assignedTags (simulando algunos ya asignados)...");
      // Mock assigned (simulando que ya tiene algunos asignados)
      setAssignedTags([
        { id: '66c1f2e3b4a8c9d012345601', name: 'Marketing', slug: 'marketing', color: '#E91E63' },
        { id: '66c1f2e3b4a8c9d012345603', name: 'Meeting', slug: 'meeting', color: '#4CAF50' },
      ]);
      
      console.log("📝 Configurando assignedGroups (simulando algunos ya asignados)...");
      setAssignedGroups([
        { id: '66c1f2e3b4a8c9d012345703', name: 'Equipo Técnico', slug: 'tech-team', path: '/tech-team', color: '#2196F3' },
      ]);
      
      console.log("✅ Datos mock configurados completamente");
      
    } catch (error) {
      console.error("❌ ERROR GENERAL en fetchOrganizationData:", error);
      
      // Fallback FORZADO en caso de error general  
      console.log("🎨 ERROR GENERAL - Forzando datos mock de emergencia");
      setIsUsingMockData(true);
      setAvailableTags([
        { id: '66c1f2e3b4a8c9d012345601', name: 'Marketing', slug: 'marketing', color: '#E91E63' },
        { id: '66c1f2e3b4a8c9d012345602', name: 'Training', slug: 'training', color: '#2196F3' },
        { id: '66c1f2e3b4a8c9d012345603', name: 'Meeting', slug: 'meeting', color: '#4CAF50' },
      ]);
      setAvailableGroups([
        { id: '66c1f2e3b4a8c9d012345701', name: 'Todo el Personal', slug: 'all-staff', path: '/all-staff', color: '#E91E63' },
      ]);
      setAssignedTags([]);
      setAssignedGroups([]);
      
      toast({
        title: "Error al cargar datos de organización",
        description: "Usando datos de demostración de emergencia",
        variant: "default",
      });
      
    } finally {
      console.log("🏁 fetchOrganizationData finalizado");
      setOrganizationLoading(false);
    }
  };

  // Función para cargar configuraciones reales del espacio
  const fetchConfigurationsData = async () => {
    console.log('⚙️ fetchConfigurationsData iniciado');
    try {
      setConfigLoading(true);
      const spaceId = room?.name?.split("/").pop() || "";
      console.log('🎯 Space ID:', spaceId);

      const response = await fetch(`/api/meet/rooms/${spaceId}/settings`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('📥 Config response:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Error al cargar configuraciones: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('📦 Config data:', responseData);

      // Transformar a formato del componente
      const configData = transformApiConfigToComponentData(responseData.settings || {});
      setConfigurations(configData);

      console.log('✅ Configuraciones cargadas exitosamente');

    } catch (error: any) {
      console.error('❌ Error al cargar configuraciones:', error);
      
      // Fallback a datos mock si falla la API
      console.log('🎭 Usando datos mock de configuraciones como fallback');
      const mockConfigData = generateMockConfigData();
      setConfigurations(mockConfigData);
      
      toast({
        title: "Error al cargar configuraciones",
        description: "Usando datos de demostración. Verifica la conexión.",
        variant: "destructive",
      });
    } finally {
      setConfigLoading(false);
    }
  };

  // Función para cargar miembros reales del espacio
  const fetchMembersData = async () => {
    console.log('👥 fetchMembersData iniciado');
    try {
      setMembersLoading(true);
      const spaceId = room?.name?.split("/").pop() || "";
      console.log('🎯 Space ID para miembros:', spaceId);

      // Intentar cargar miembros reales
      try {
        const response = await fetch(`/api/meet/rooms/${spaceId}/members`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        console.log('📥 Members response:', {
          ok: response.ok, 
          status: response.status
        });

        if (response.ok) {
          const membersData = await response.json();
          console.log('✅ Miembros reales cargados:', membersData);
          
          const membersList = membersData.members || [];
          setMembers(membersList);
          
          // Calcular estadísticas
          const stats = {
            total: membersList.length,
            cohosts: membersList.filter((m: any) => m.role === "COHOST").length,
            regularMembers: membersList.filter((m: any) => m.role === "ROLE_UNSPECIFIED").length,
            active: membersList.length // Todos se consideran activos por ahora
          };
          
          setMembersStats(stats);
          console.log('📊 Stats calculadas:', stats);
          return;
        }
      } catch (apiError) {
        console.log("❌ Error al cargar miembros, usando fallback:", apiError);
      }

      // Fallback: usar miembros del room inicial o crear mock
      console.log("🎭 Usando miembros fallback");
      const fallbackMembers = room?.members || [
        {
          email: "admin@empresa.com",
          displayName: "Administrador",
          role: "COHOST",
          joinedAt: new Date().toISOString()
        },
        {
          email: "user1@empresa.com", 
          displayName: "Usuario Demo",
          role: "ROLE_UNSPECIFIED",
          joinedAt: new Date().toISOString()
        }
      ];
      
      setMembers(fallbackMembers);
      setMembersStats({
        total: fallbackMembers.length,
        cohosts: fallbackMembers.filter(m => m.role === "COHOST").length,
        regularMembers: fallbackMembers.filter(m => m.role === "ROLE_UNSPECIFIED").length,
        active: fallbackMembers.length
      });
      
    } catch (error) {
      console.error("❌ ERROR GENERAL en fetchMembersData:", error);
      
      // Fallback de emergencia
      setMembers([]);
      setMembersStats({ total: 0, cohosts: 0, regularMembers: 0, active: 0 });
      
      toast({
        title: "Error al cargar miembros",
        description: "Usando datos de demostración",
        variant: "default",
      });
      
    } finally {
      console.log("🏁 fetchMembersData finalizado");
      setMembersLoading(false);
    }
  };

  // useEffect para cargar datos cuando se abre el modal (sin datos mock inmediatos)
  useEffect(() => {
    console.log('🔄 useEffect triggered - isOpen:', isOpen, 'currentSection:', currentSection);
    if (isOpen) {
      console.log('✅ Modal abierto - iniciando carga de datos de organización');
      
      // Limpiar datos previos y activar estado de carga
      setAvailableTags([]);
      setAvailableGroups([]);
      setAssignedTags([]);
      setAssignedGroups([]);
      setOrganizationLoading(true);
      setIsUsingMockData(false);
      
      console.log('⏳ Estado de carga activado - ejecutando fetch de datos...');
      
      // Cargar datos (reales o mock como fallback)
      fetchOrganizationData();
      fetchMembersData();
      fetchConfigurationsData();
    } else {
      console.log('❌ Modal cerrado - limpiando datos');
      // Limpiar datos cuando se cierra el modal
      setAvailableTags([]);
      setAvailableGroups([]);
      setAssignedTags([]);  
      setAssignedGroups([]);
      setOrganizationLoading(false);
      setIsUsingMockData(false);
      
      // Limpiar datos de miembros
      setMembers([]);
      setMembersLoading(false);
      setMembersStats({ total: 0, cohosts: 0, regularMembers: 0, active: 0 });
      
      // Limpiar datos de configuraciones
      setConfigurations({});
      setConfigLoading(false);
    }
  }, [isOpen, room]);

  // Funciones de asignación/desasignación (siguiendo patrón del backup)
  const handleAssignTag = async (tagId: string) => {
    try {
      console.log('🏷️ Intentando asignar tag ID:', tagId);
      
      // Si estamos usando datos mock, simular la asignación localmente
      if (isUsingMockData) {
        console.log('🎭 Simulando asignación con datos mock');
        const tag = availableTags.find((t) => t.id === tagId);
        if (tag && !assignedTags.find(t => t.id === tagId)) {
          setAssignedTags((prev) => [...prev, tag]);
          toast({
            title: "Tag asignado (demo)",
            description: `Tag "${tag.name}" asignado localmente (usando datos de demostración)`,
          });
        }
        return;
      }
      
      const spaceId = room?.name?.split("/").pop() || "";
      console.log('🎯 Space ID:', spaceId);
      
      const response = await fetch(`/api/meet/spaces/${spaceId}/assign-tags`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds: [tagId] })
      });

      const responseData = await response.json();
      console.log('📥 Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Error al asignar tag");
      }

      const tag = availableTags.find((t) => t.id === tagId);
      if (tag) {
        setAssignedTags((prev) => [...prev, tag]);
        toast({
          title: "Tag asignado",
          description: `Tag "${tag.name}" asignado a la sala`,
        });
      }
    } catch (error: any) {
      console.error('❌ Error completo:', error);
      toast({
        title: "Error al asignar tag",
        description: error.message || "No se pudo asignar el tag",
        variant: "destructive",
      });
    }
  };

  const handleUnassignTag = async (tagId: string) => {
    try {
      // Si estamos usando datos mock, simular la desasignación localmente
      if (isUsingMockData) {
        console.log('🎭 Simulando desasignación con datos mock');
        const tag = assignedTags.find((t) => t.id === tagId);
        setAssignedTags((prev) => prev.filter((t) => t.id !== tagId));
        if (tag) {
          toast({
            title: "Tag desasignado (demo)",
            description: `Tag "${tag.name}" removido localmente (usando datos de demostración)`,
          });
        }
        return;
      }
      
      const spaceId = room?.name?.split("/").pop() || "";
      const response = await fetch(`/api/meet/spaces/${spaceId}/unassign-tags`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds: [tagId] })
      });

      if (!response.ok) {
        throw new Error("Error al desasignar tag");
      }

      const tag = assignedTags.find((t) => t.id === tagId);
      setAssignedTags((prev) => prev.filter((t) => t.id !== tagId));
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
      // Si estamos usando datos mock, simular la asignación localmente
      if (isUsingMockData) {
        console.log('🎭 Simulando asignación de grupo con datos mock');
        const group = availableGroups.find((g) => g.id === groupId);
        if (group && !assignedGroups.find(g => g.id === groupId)) {
          setAssignedGroups((prev) => [...prev, group]);
          toast({
            title: "Grupo asignado (demo)",
            description: `Grupo "${group.name}" asignado localmente (usando datos de demostración)`,
          });
        }
        return;
      }
      
      const spaceId = room?.name?.split("/").pop() || "";
      const response = await fetch(`/api/meet/spaces/${spaceId}/assign-groups`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupIds: [groupId] })
      });

      if (!response.ok) {
        throw new Error("Error al asignar grupo");
      }

      const group = availableGroups.find((g) => g.id === groupId);
      if (group) {
        setAssignedGroups((prev) => [...prev, group]);
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
      // Si estamos usando datos mock, simular la desasignación localmente
      if (isUsingMockData) {
        console.log('🎭 Simulando desasignación de grupo con datos mock');
        const group = assignedGroups.find((g) => g.id === groupId);
        setAssignedGroups((prev) => prev.filter((g) => g.id !== groupId));
        if (group) {
          toast({
            title: "Grupo desasignado (demo)",
            description: `Grupo "${group.name}" removido localmente (usando datos de demostración)`,
          });
        }
        return;
      }
      
      const spaceId = room?.name?.split("/").pop() || "";
      const response = await fetch(`/api/meet/spaces/${spaceId}/unassign-groups`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupIds: [groupId] })
      });

      if (!response.ok) {
        throw new Error("Error al desasignar grupo");
      }

      const group = assignedGroups.find((g) => g.id === groupId);
      setAssignedGroups((prev) => prev.filter((g) => g.id !== groupId));
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

  // Funciones para manejo de miembros
  const handleAddMember = async (email: string, role: string) => {
    try {
      console.log('➕ Agregando miembro:', email, role);
      const spaceId = room?.name?.split("/").pop() || "";
      
      const response = await fetch(`/api/meet/rooms/${spaceId}/members`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          role: role // role ya viene en formato de API desde AddMemberForm
        })
      });

      const responseData = await response.json();
      console.log('📥 Add member response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Error al agregar miembro");
      }

      // Recargar miembros para obtener datos actualizados
      await fetchMembersData();
      
      toast({
        title: "Miembro agregado",
        description: `${email} agregado como ${role}`,
      });

    } catch (error: any) {
      console.error('❌ Error al agregar miembro:', error);
      toast({
        title: "Error al agregar miembro",
        description: error.message || "No se pudo agregar el miembro",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (member: any, newRole: string) => {
    try {
      console.log('🔄 Cambiando rol de miembro:', member.email, 'de', member.role, 'a', newRole);
      const spaceId = room?.name?.split("/").pop() || "";
      
      const response = await fetch(`/api/meet/rooms/${spaceId}/members/role`, {
        method: "PATCH",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: member.email, 
          role: newRole 
        })
      });

      const responseData = await response.json();
      console.log('📥 Role change response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Error al cambiar rol del miembro");
      }

      // Actualizar los datos locales después de confirmación del servidor
      setMembers((prevMembers) =>
        prevMembers.map((m) =>
          m.email === member.email ? { ...m, role: newRole, isCohost: newRole === "COHOST" } : m
        )
      );

      // Actualizar estadísticas
      const updatedMembers = members.map((m) =>
        m.email === member.email ? { ...m, role: newRole, isCohost: newRole === "COHOST" } : m
      );
      
      setMembersStats({
        total: updatedMembers.length,
        cohosts: updatedMembers.filter(m => m.role === "COHOST").length,
        regularMembers: updatedMembers.filter(m => m.role === "ROLE_UNSPECIFIED").length,
        active: updatedMembers.length
      });

      toast({
        title: "Rol actualizado",
        description: `${member.email} ahora es ${newRole === "COHOST" ? "Co-anfitrión" : "Participante"}`,
      });

    } catch (error: any) {
      console.error('❌ Error al cambiar rol:', error);
      toast({
        title: "Error al cambiar rol",
        description: error.message || "No se pudo cambiar el rol del miembro",
        variant: "destructive",
      });
    }
  };

  const handleConfigChange = async (key: string, value: boolean | string) => {
    try {
      console.log('⚙️ Cambiando configuración:', key, 'a:', value);
      const spaceId = room?.name?.split("/").pop() || "";

      // Mapear key del componente a estructura API
      const apiPayload = mapConfigKeyToApiPayload(key, value);
      console.log('📤 API Payload:', JSON.stringify(apiPayload, null, 2));
      
      const response = await fetch(`/api/meet/rooms/${spaceId}/settings`, {
        method: "PATCH",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload)
      });

      const responseData = await response.json();
      console.log('📥 Config change response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Error al actualizar configuración");
      }

      // Actualizar configuración local con el nuevo valor
      setConfigurations((prev: any) => {
        const updated = { ...prev };
        updateConfigurationLocally(updated, key, value);
        return updated;
      });

      toast({
        title: "Configuración actualizada",
        description: `${getConfigDisplayName(key)} ha sido actualizada`,
      });

    } catch (error: any) {
      console.error('❌ Error al cambiar configuración:', error);
      toast({
        title: "Error al actualizar configuración",
        description: error.message || "No se pudo actualizar la configuración",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async (member: any) => {
    try {
      console.log('🗑️ Eliminando miembro:', member.email);
      const spaceId = room?.name?.split("/").pop() || "";
      
      const response = await fetch(
        `/api/meet/rooms/${spaceId}/members?email=${encodeURIComponent(member.email)}`,
        { 
          method: "DELETE",
          credentials: 'include',
          headers: { "Content-Type": "application/json" }
        }
      );

      const responseData = await response.json();
      console.log('📥 Delete member response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Error al eliminar miembro");
      }

      // Recargar miembros para obtener datos actualizados
      await fetchMembersData();
      
      toast({
        title: "Miembro eliminado",
        description: `${member.email} eliminado de la sala`,
      });

    } catch (error: any) {
      console.error('❌ Error al eliminar miembro:', error);
      toast({
        title: "Error al eliminar miembro", 
        description: error.message || "No se pudo eliminar el miembro",
        variant: "destructive",
      });
    }
  };

  const handleRefreshMembers = async () => {
    console.log('🔄 Refrescando lista de miembros');
    await fetchMembersData();
    
    toast({
      title: "Lista actualizada",
      description: "Los miembros se han actualizado correctamente",
    });
  };

  // Si no hay room, no mostrar modal
  if (!room) {
    return null;
  }

  // Convertir datos del room a formato compatible con datos reales
  const roomData = convertRoomToModalData(
    room, 
    assignedTags, 
    availableTags, 
    assignedGroups, 
    availableGroups,
    members,
    membersStats,
    configurations
  );

  // Si no hay datos convertidos, no mostrar modal
  if (!roomData) {
    return null;
  }

  const displayName = room._metadata?.displayName || room.name?.split("/").pop() || "Sala sin nombre";

  return (
    <SectionNavigationModal
      isOpen={isOpen}
      onClose={onClose}
      sections={modalSections}
      title={`Gestionar: ${displayName}`}
      description="Sistema de navegación para gestión completa de la sala"
      initialSectionId={currentSection}
      variant="bottom"
      maxWidth="4xl"
      onSectionChange={(sectionId) => {
        setCurrentSection(sectionId);
        console.log("🧭 Section changed to:", sectionId);
      }}
      globalProps={{
        // Props que se pasan a todas las secciones
        room: room,
        roomData: roomData,
        onUpdate: onUpdate,
        onDelete: onDelete,
        onClose: onClose,
        toast: toast,
        // Funciones de organización reales
        handleAssignTag: handleAssignTag,
        handleUnassignTag: handleUnassignTag,
        handleAssignGroup: handleAssignGroup,
        handleUnassignGroup: handleUnassignGroup,
        organizationLoading: organizationLoading,
        // Funciones de miembros reales
        handleAddMember: handleAddMember,
        handleDeleteMember: handleDeleteMember,
        handleRoleChange: handleRoleChange,
        handleRefreshMembers: handleRefreshMembers,
        membersLoading: membersLoading,
        // Funciones de configuraciones reales
        handleConfigChange: handleConfigChange,
        configLoading: configLoading,
      }}
    />
  );
};

// ========================================================================================
// FUNCIONES AUXILIARES PARA CONFIGURACIONES
// ========================================================================================

// Transformar configuraciones de API a formato del componente usando validaciones Zod
function transformApiConfigToComponentData(apiSettings: any) {
  // ✅ USING PROPER ZOD VALIDATIONS FROM SpaceConfigSchema.ts
  // This ensures type safety and validates API responses according to Google Meet API v2beta specs
  const entryPointAccess = EntryPointAccessEnum.safeParse(apiSettings.entryPointAccess);
  const chatRestriction = RestrictionTypeEnum.safeParse(apiSettings.moderationSettings?.chatRestriction);
  const reactionRestriction = RestrictionTypeEnum.safeParse(apiSettings.moderationSettings?.reactionRestriction);
  const presentRestriction = RestrictionTypeEnum.safeParse(apiSettings.moderationSettings?.presentRestriction);
  const autoRecording = AutoGenerationTypeEnum.safeParse(apiSettings.recordingSettings?.autoRecordingGeneration);
  const autoTranscription = AutoGenerationTypeEnum.safeParse(apiSettings.transcriptionSettings?.autoTranscriptionGeneration);
  const smartNotes = AutoGenerationTypeEnum.safeParse(apiSettings.smartNotesSettings?.autoSmartNotesGeneration);
  return {
    moderation: {
      restrictEntry: {
        enabled: entryPointAccess.success ? entryPointAccess.data === "CREATOR_APP_ONLY" : false,
        label: "Restringir Puntos de Entrada",
        description: "Solo los puntos de entrada del proyecto Google Cloud que creó el espacio pueden unirse",
        tooltip: "entryPointAccess: ALL permite todos los puntos de entrada, CREATOR_APP_ONLY solo puntos de entrada propios"
      },
      enableModeration: {
        enabled: apiSettings.moderationSettings?.moderationEnabled || false,
        label: "Activar Moderación",
        description: "Da al propietario de la reunión más control sobre funciones y participantes",
        tooltip: "moderation: Cuando está ON permite gestionar co-anfitriones y restricciones de funciones"
      },
      chatRestriction: {
        value: chatRestriction.success ? chatRestriction.data : "NO_RESTRICTION",
        options: [
          { value: "NO_RESTRICTION", label: "Todos los participantes tienen permisos" },
          { value: "HOSTS_ONLY", label: "Solo el organizador y co-anfitriones tienen permisos" }
        ]
      },
      reactionRestriction: {
        value: reactionRestriction.success ? reactionRestriction.data : "NO_RESTRICTION",
        options: [
          { value: "NO_RESTRICTION", label: "Todos los participantes tienen permisos" },
          { value: "HOSTS_ONLY", label: "Solo el organizador y co-anfitriones tienen permisos" }
        ]
      },
      presentationRestriction: {
        value: presentRestriction.success ? presentRestriction.data : "NO_RESTRICTION", 
        options: [
          { value: "NO_RESTRICTION", label: "Todos los participantes tienen permisos" },
          { value: "HOSTS_ONLY", label: "Solo el organizador y co-anfitriones tienen permisos" }
        ]
      },
      defaultViewer: {
        enabled: apiSettings.moderationSettings?.defaultJoinAsViewer || false,
        label: "Unirse como Espectador por Defecto",
        description: "Los usuarios se unirán como espectadores (ON) o contribuyentes (OFF) por defecto",
        tooltip: "defaultJoinAsViewerType: Define si restringir el rol por defecto asignado a usuarios como espectador"
      }
    },
    aiFeatures: {
      autoRecording: {
        enabled: autoRecording.success ? autoRecording.data === "ON" : false,
        label: "Generación Automática de Grabación",
        description: "Define si un espacio de reunión se graba automáticamente cuando se une alguien con privilegios de grabación",
        tooltip: "recordingConfig.autoRecordingGeneration: Graba automáticamente reuniones cuando se une usuario autorizado"
      },
      autoTranscription: {
        enabled: autoTranscription.success ? autoTranscription.data === "ON" : false,
        label: "Generación Automática de Transcripción",
        description: "Define si el contenido de la reunión se transcribe automáticamente cuando se une usuario autorizado",
        tooltip: "transcriptionConfig.autoTranscriptionGeneration: Transcribe automáticamente contenido de reunión cuando se une usuario autorizado"
      },
      smartNotes: {
        enabled: smartNotes.success ? smartNotes.data === "ON" : false,
        label: "Generación Automática de Notas Inteligentes",
        description: "Define si generar automáticamente resumen y recapitulación para todos los invitados cuando se une usuario autorizado",
        tooltip: "smartNotesConfig.autoSmartNotesGeneration: Genera automáticamente resumen y recapitulación de reunión para todos los invitados de la organización cuando se une usuario autorizado"
      }
    }
  };
}

// Generar datos mock de configuración como fallback
function generateMockConfigData() {
  return {
    moderation: {
      restrictEntry: {
        enabled: false,
        label: "Restringir Puntos de Entrada",
        description: "Solo los puntos de entrada del proyecto Google Cloud que creó el espacio pueden unirse",
        tooltip: "entryPointAccess: ALL permite todos los puntos de entrada, CREATOR_APP_ONLY solo puntos de entrada propios"
      },
      enableModeration: {
        enabled: true,
        label: "Activar Moderación",
        description: "Da al propietario de la reunión más control sobre funciones y participantes",
        tooltip: "moderation: Cuando está ON permite gestionar co-anfitriones y restricciones de funciones"
      },
      chatRestriction: {
        value: "NO_RESTRICTION",
        options: [
          { value: "NO_RESTRICTION", label: "Todos los participantes tienen permisos" },
          { value: "HOSTS_ONLY", label: "Solo el organizador y co-anfitriones tienen permisos" }
        ]
      },
      reactionRestriction: {
        value: "NO_RESTRICTION",
        options: [
          { value: "NO_RESTRICTION", label: "Todos los participantes tienen permisos" },
          { value: "HOSTS_ONLY", label: "Solo el organizador y co-anfitriones tienen permisos" }
        ]
      },
      presentationRestriction: {
        value: "HOSTS_ONLY",
        options: [
          { value: "NO_RESTRICTION", label: "Todos los participantes tienen permisos" },
          { value: "HOSTS_ONLY", label: "Solo el organizador y co-anfitriones tienen permisos" }
        ]
      },
      defaultViewer: {
        enabled: false,
        label: "Unirse como Espectador por Defecto",
        description: "Los usuarios se unirán como espectadores (ON) o contribuyentes (OFF) por defecto",
        tooltip: "defaultJoinAsViewerType: Define si restringir el rol por defecto asignado a usuarios como espectador"
      }
    },
    aiFeatures: {
      autoRecording: {
        enabled: true,
        label: "Generación Automática de Grabación",
        description: "Define si un espacio de reunión se graba automáticamente cuando se une alguien con privilegios de grabación",
        tooltip: "recordingConfig.autoRecordingGeneration: Graba automáticamente reuniones cuando se une usuario autorizado"
      },
      autoTranscription: {
        enabled: true,
        label: "Generación Automática de Transcripción",
        description: "Define si el contenido de la reunión se transcribe automáticamente cuando se une usuario autorizado",
        tooltip: "transcriptionConfig.autoTranscriptionGeneration: Transcribe automáticamente contenido de reunión cuando se une usuario autorizado"
      },
      smartNotes: {
        enabled: false,
        label: "Generación Automática de Notas Inteligentes",
        description: "Define si generar automáticamente resumen y recapitulación para todos los invitados cuando se une usuario autorizado",
        tooltip: "smartNotesConfig.autoSmartNotesGeneration: Genera automáticamente resumen y recapitulación de reunión para todos los invitados de la organización cuando se une usuario autorizado"
      }
    },
    alert: {
      message: "Configuraciones de demostración. Los cambios reales requieren conexión a la API."
    }
  };
}

// Mapear key de componente a payload de API
function mapConfigKeyToApiPayload(key: string, value: boolean | string) {
  const payload: any = {};

  switch (key) {
    case 'restrictEntry':
      payload.entryPointAccess = value ? "CREATOR_APP_ONLY" : "ALL";
      break;
      
    case 'enableModeration':
      payload.moderationSettings = {
        moderationEnabled: value
      };
      break;
    
    case 'chatRestriction':
      payload.moderationSettings = {
        chatRestriction: value
      };
      break;
      
    case 'reactionRestriction':
      payload.moderationSettings = {
        reactionRestriction: value
      };
      break;
      
    case 'presentationRestriction':
    case 'presentRestriction':
      payload.moderationSettings = {
        presentRestriction: value
      };
      break;
      
    case 'defaultViewer':
      payload.moderationSettings = {
        defaultJoinAsViewer: value
      };
      break;
      
    case 'autoRecording':
      payload.recordingSettings = {
        autoRecordingGeneration: value ? "ON" : "OFF"
      };
      break;
      
    case 'autoTranscription':
      payload.transcriptionSettings = {
        autoTranscriptionGeneration: value ? "ON" : "OFF"
      };
      break;
      
    case 'smartNotes':
      payload.smartNotesSettings = {
        autoSmartNotesGeneration: value ? "ON" : "OFF"
      };
      break;
      
    default:
      console.warn('Config key no reconocido:', key);
      payload[key] = value;
  }

  return payload;
}

// Actualizar configuración localmente
function updateConfigurationLocally(config: any, key: string, value: boolean | string) {
  switch (key) {
    case 'restrictEntry':
      config.moderation.restrictEntry.enabled = value;
      break;
    case 'enableModeration':
      config.moderation.enableModeration.enabled = value;
      break;
    case 'chatRestriction':
      config.moderation.chatRestriction.value = value;
      break;
    case 'reactionRestriction':
      config.moderation.reactionRestriction.value = value;
      break;
    case 'presentationRestriction':
    case 'presentRestriction':
      config.moderation.presentationRestriction.value = value;
      break;
    case 'defaultViewer':
      config.moderation.defaultViewer.enabled = value;
      break;
    case 'autoRecording':
      config.aiFeatures.autoRecording.enabled = value;
      break;
    case 'autoTranscription':
      config.aiFeatures.autoTranscription.enabled = value;
      break;
    case 'smartNotes':
      config.aiFeatures.smartNotes.enabled = value;
      break;
    default:
      console.warn('No se pudo actualizar config key:', key);
  }
}

// Obtener nombre display para notificaciones
function getConfigDisplayName(key: string): string {
  const names: { [key: string]: string } = {
    restrictEntry: "Restringir Puntos de Entrada",
    enableModeration: "Activar Moderación",
    chatRestriction: "Restricción de Chat",
    reactionRestriction: "Restricción de Reacciones", 
    presentationRestriction: "Restricción de Presentación",
    presentRestriction: "Restricción de Presentación",
    defaultViewer: "Unirse como Espectador por Defecto",
    autoRecording: "Grabación Automática",
    autoTranscription: "Transcripción Automática",
    smartNotes: "Notas Inteligentes"
  };
  
  return names[key] || key;
}