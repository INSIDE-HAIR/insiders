/**
 * RESPONSIVEMODALDEMO - Demo completo del ResponsiveModal con navegación SOLID
 * Muestra la integración completa del sistema foundation
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState, lazy } from "react";
import { useToast } from "@/src/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { 
  Cog6ToothIcon,
  UsersIcon,
  TagIcon,
  ChartBarIcon,
  InformationCircleIcon,
  PlayIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import { SectionNavigationModal } from "./SectionNavigationModal";
import { GeneralSectionDemo } from "../../organisms/sections/GeneralSectionDemo";
import { ReferencesSectionDemo } from "../../organisms/sections/ReferencesSectionDemo";
import { MembersSectionDemo } from "../../organisms/sections/MembersSectionDemo";
import { ConfigurationSectionDemo } from "../../organisms/sections/ConfigurationSectionDemo";
import { SessionsSectionDemo } from "../../organisms/sections/SessionsSectionDemo";
import { StatisticsSectionDemo } from "../../organisms/sections/StatisticsSectionDemo";
import modalDummyData from "../../data/modal-dummy-data.json";

// Componentes lazy-loaded para las secciones (simulando secciones reales)
const GeneralSectionDemoWrapper = lazy(() => Promise.resolve({
  default: ({ navigation, toast }: any) => (
    <GeneralSectionDemo
      data={modalDummyData.roomInfo}
      onCopy={(value) => {
        navigator.clipboard.writeText(value);
        console.log('✅ Copiado:', value);
      }}
      onExternal={(value) => {
        window.open(value, '_blank');
        console.log('🔗 Abriendo:', value);
      }}
      onCloseSession={() => {
        toast({
          title: "Cerrando sesión",
          description: "La sesión se está cerrando...",
        });
        console.log('🚪 Cerrando sesión');
      }}
    />
  )
}));

const ReferencesSectionDemoWrapper = lazy(() => Promise.resolve({
  default: ({ navigation, toast }: any) => (
    <ReferencesSectionDemo
      data={modalDummyData.references}
      onTagRemove={(tagName) => {
        console.log('🏷️ Remover tag:', tagName);
      }}
      onTagAdd={(tagName) => {
        console.log('➕ Agregar tag:', tagName);
        toast({
          title: "Tag asignado",
          description: `Se ha asignado el tag: ${tagName}`,
        });
      }}
      onGroupRemove={(groupName) => {
        console.log('👥 Desasignar grupo:', groupName);
        toast({
          title: "Grupo desasignado",
          description: `Se ha desasignado el grupo: ${groupName}`,
        });
      }}
      onGroupAdd={(groupName) => {
        console.log('➕ Asignar grupo:', groupName);
        toast({
          title: "Grupo asignado",
          description: `Se ha asignado el grupo: ${groupName}`,
        });
      }}
    />
  )
}));

const MembersSectionDemoWrapper = lazy(() => Promise.resolve({
  default: ({ navigation, toast }: any) => (
    <MembersSectionDemo
      data={modalDummyData.members as any}
      onAddMember={(email, role) => {
        console.log('➕ Agregar miembro:', email, role);
        toast({
          title: "Agregando miembro",
          description: `Agregando ${email} con rol de ${role}...`,
        });
      }}
      onDeleteMember={(member) => {
        console.log('🗑️ Eliminar miembro:', member.email);
        toast({
          title: "Miembro eliminado",
          description: `Se ha eliminado a ${member.email}`,
          variant: "destructive",
        });
      }}
      onRefresh={() => {
        console.log('🔄 Refrescar lista');
      }}
    />
  )
}));

const ConfigurationSectionDemoWrapper = lazy(() => Promise.resolve({
  default: ({ navigation, toast }: any) => (
    <ConfigurationSectionDemo
      data={modalDummyData.configuration}
      onConfigChange={async (key, value) => {
        console.log('⚙️ Config changed:', key, value);
      }}
    />
  )
}));

const SessionsSectionDemoWrapper = lazy(() => Promise.resolve({
  default: ({ navigation, toast }: any) => (
    <SessionsSectionDemo
      spaceId="demo-space-id"
      onPlayRecording={(sessionId, recordingIndex) => {
        console.log('🎬 Reproducir grabación:', sessionId, recordingIndex);
        toast({
          title: "Reproduciendo grabación",
          description: `Reproduciendo grabación ${recordingIndex} de la sesión ${sessionId}`,
        });
      }}
      onDownloadRecording={(sessionId, recordingIndex) => {
        console.log('💾 Descargar grabación:', sessionId, recordingIndex);
        toast({
          title: "Descargando grabación",
          description: `Descargando grabación ${recordingIndex} de la sesión ${sessionId}`,
        });
      }}
      onViewTranscription={(sessionId, transcriptIndex) => {
        console.log('📄 Ver transcripción:', sessionId, transcriptIndex);
        toast({
          title: "Abriendo transcripción",
          description: `Abriendo transcripción ${transcriptIndex} de la sesión ${sessionId}`,
        });
      }}
      onDownloadTranscriptionPdf={(sessionId, transcriptIndex) => {
        console.log('📄 Descargar PDF:', sessionId, transcriptIndex);
        toast({
          title: "Descargando PDF",
          description: `Descargando PDF de transcripción ${transcriptIndex} de la sesión ${sessionId}`,
        });
      }}
      onViewSmartNote={(sessionId, noteIndex) => {
        console.log('✨ Ver nota inteligente:', sessionId, noteIndex);
        toast({
          title: "Abriendo nota inteligente",
          description: `Abriendo nota ${noteIndex} de la sesión ${sessionId}`,
        });
      }}
      onExportSmartNote={(sessionId, noteIndex) => {
        console.log('📤 Exportar nota:', sessionId, noteIndex);
        toast({
          title: "Exportando nota",
          description: `Exportando nota ${noteIndex} de la sesión ${sessionId}`,
        });
      }}
    />
  )
}));

const StatisticsSectionDemoWrapper = lazy(() => Promise.resolve({
  default: ({ navigation }: any) => (
    <StatisticsSectionDemo
      spaceId="demo-space-id"
    />
  )
}));

// Definición de secciones
const demoSections = [
  {
    id: "general",
    title: "General",
    icon: InformationCircleIcon,
    description: "Información básica y configuración de la sala",
    keywords: ["información", "nombre", "código", "básico"],
    component: GeneralSectionDemoWrapper,
  },
  {
    id: "references",
    title: "Referencias", 
    icon: TagIcon,
    description: "Tags y grupos para organizar la sala",
    keywords: ["tags", "grupos", "referencias", "organización", "categorías"],
    component: ReferencesSectionDemoWrapper,
  },
  {
    id: "members",
    title: "Miembros", 
    icon: UsersIcon,
    description: "Gestión de participantes y roles",
    keywords: ["miembros", "participantes", "usuarios", "roles", "cohosts"],
    component: MembersSectionDemoWrapper,
  },
  {
    id: "settings",
    title: "Configuración",
    icon: Cog6ToothIcon,
    description: "Configuraciones avanzadas de la sala",
    keywords: ["configuración", "avanzado", "moderación", "grabación", "restricciones"],
    component: ConfigurationSectionDemoWrapper,
  },
  {
    id: "sessions", 
    title: "Sesiones",
    icon: CalendarDaysIcon,
    description: "Detalle completo por sesión de reunión",
    keywords: ["sesiones", "reuniones", "detalle", "participantes", "grabaciones"],
    component: SessionsSectionDemoWrapper,
  },
  {
    id: "statistics", 
    title: "Estadísticas",
    icon: ChartBarIcon,
    description: "Analytics y ranking de participantes",
    keywords: ["estadísticas", "analytics", "ranking", "participantes", "métricas"],
    component: StatisticsSectionDemoWrapper,
  },
];

export const ResponsiveModalDemo: React.FC = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<"top" | "bottom" | "left" | "right">("bottom");
  const [currentSection, setCurrentSection] = useState<string>(demoSections[0]?.id || "general");

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 ResponsiveModal + Sistema SOLID
            <Badge className="bg-green-900 text-green-100 hover:bg-green-800">Foundation Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Demo Controls */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Variantes de Modal:</h3>
              <div className="flex flex-wrap gap-2">
                {(["bottom", "top", "left", "right"] as const).map((variant) => (
                  <Button
                    key={variant}
                    variant={modalVariant === variant ? "default" : "outline"}
                    size="sm"
                    onClick={() => setModalVariant(variant)}
                  >
                    {variant}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Sección Inicial:</h3>
              <div className="flex flex-wrap gap-2">
                {demoSections.map((section) => (
                  <Button
                    key={section.id}
                    variant={currentSection === section.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentSection(section.id)}
                  >
                    <section.icon className="h-4 w-4 mr-1" />
                    {section.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Launch Button */}
          <div className="text-center">
            <Button 
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="gap-2"
            >
              <PlayIcon className="h-5 w-5" />
              Abrir Modal Responsivo ({modalVariant})
            </Button>
          </div>

          {/* Features List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">🎯 Funcionalidades Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  ResponsiveModal integrado
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Navegación SOLID con búsqueda
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Keyboard shortcuts (Alt+←/→)
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Lazy loading de secciones
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Mobile: bottom sheet
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Desktop: modal centrado
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Estado persistente
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Historial de navegación
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  🎹 <strong>Prueba:</strong> Alt+←/→ para navegar, números 1-4 para acceso directo, 
                  búsqueda por &ldquo;miembros&rdquo;, &ldquo;configuración&rdquo;, etc.
                </p>
              </div>
            </CardContent>
          </Card>

        </CardContent>
      </Card>

      {/* Modal Demo */}
      <SectionNavigationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sections={demoSections}
        title="Detalles de la Sala"
        description="Sistema de navegación SOLID integrado con ResponsiveModal"
        initialSectionId={currentSection}
        variant={modalVariant}
        maxWidth="4xl"
        onSectionChange={(sectionId) => {
          console.log("🧭 Section changed to:", sectionId);
        }}
        globalProps={{
          // Props que se pasan a todas las secciones
          roomId: "demo-room-123",
          userId: "demo-user-456",
          toast: toast,
        }}
      />
    </div>
  );
};