import React from "react";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { cn } from "@/src/lib/utils";
import { SectionHeader } from "../../molecules/layout/SectionHeader";
import { ConfigToggle } from "../../molecules/forms/ConfigToggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { LoadingMessage } from "../../atoms/loading/LoadingMessage";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export interface ConfigurationSectionDemoData {
  moderation: {
    restrictEntry: {
      enabled: boolean;
      label: string;
      description: string;
      tooltip: string;
    };
    enableModeration: {
      enabled: boolean;
      label: string;
      description: string;
      tooltip: string;
    };
    chatRestriction: {
      value: string;
      options: Array<{ value: string; label: string }>;
    };
    reactionRestriction: {
      value: string;
      options: Array<{ value: string; label: string }>;
    };
    presentationRestriction: {
      value: string;
      options: Array<{ value: string; label: string }>;
    };
    defaultViewer: {
      enabled: boolean;
      label: string;
      description: string;
      tooltip: string;
    };
  };
  aiFeatures: {
    autoRecording: {
      enabled: boolean;
      label: string;
      description: string;
      tooltip: string;
    };
    autoTranscription: {
      enabled: boolean;
      label: string;
      description: string;
      tooltip: string;
    };
    smartNotes: {
      enabled: boolean;
      label: string;
      description: string;
      tooltip: string;
    };
  };
  alert: {
    message: string;
  };
}

export interface ConfigurationSectionDemoProps {
  data: ConfigurationSectionDemoData;
  loading?: boolean;
  onConfigChange?: (key: string, value: boolean | string) => Promise<void>;
  className?: string;
}

/**
 * Sección Configuration completa usando componentes atómicos
 * Replica exactamente la funcionalidad del ResponsiveModalDemo
 * 
 * @example
 * <ConfigurationSectionDemo 
 *   data={modalDummyData.configuration} 
 *   onConfigChange={(key, value) => console.log('Config:', key, value)}
 * />
 */
export const ConfigurationSectionDemo: React.FC<ConfigurationSectionDemoProps> = ({
  data,
  loading = false,
  onConfigChange,
  className
}) => {
  
  // Safety check for data prop
  if (!data || !data.moderation || !data.aiFeatures) {
    console.error('ConfigurationSectionDemo: Invalid data structure', data);
    return (
      <div className={cn("space-y-6", className)}>
        <Alert>
          <InformationCircleIcon className="h-4 w-4" />
          <AlertDescription>
            No hay datos de configuración disponibles
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const handleToggleChange = (key: string) => async (checked: boolean) => {
    if (onConfigChange) {
      console.log('⚙️ Config toggle:', key, checked);
      await onConfigChange(key, checked);
    }
  };

  const handleSelectChange = (key: string) => async (value: string) => {
    if (onConfigChange) {
      console.log('📝 Config select:', key, value);
      await onConfigChange(key, value);
    }
  };

  // Skeleton de loading
  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        
        {/* Skeleton Sección 1: Moderación y Permisos */}
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-muted rounded animate-pulse" />
            <div className="h-5 bg-muted rounded w-40 animate-pulse" />
          </div>
          
          {/* Config toggles skeleton */}
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={`toggle-skeleton-${index}`} className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1 flex-1">
                  <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-48 animate-pulse" />
                </div>
                <div className="w-10 h-6 bg-muted rounded-full animate-pulse" />
              </div>
            </div>
          ))}
          
          {/* Config selects skeleton */}
          <div className="ml-6 space-y-4 border-l-2 border-primary/20 pl-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`select-skeleton-${index}`} className="space-y-2">
                <div className="h-4 bg-muted rounded w-28 animate-pulse" />
                <div className="h-10 bg-muted rounded w-full animate-pulse" />
              </div>
            ))}
            
            {/* Toggle skeleton dentro del sub-grupo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1 flex-1">
                  <div className="h-4 bg-muted rounded w-36 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-52 animate-pulse" />
                </div>
                <div className="w-10 h-6 bg-muted rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Sección 2: Herramientas */}
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-muted rounded animate-pulse" />
            <div className="h-5 bg-muted rounded w-32 animate-pulse" />
          </div>
          
          {/* AI toggles skeleton */}
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`ai-toggle-skeleton-${index}`} className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1 flex-1">
                  <div className="h-4 bg-muted rounded w-36 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-56 animate-pulse" />
                </div>
                <div className="w-10 h-6 bg-muted rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Alert skeleton */}
        <div className="flex items-start gap-3 p-4 border rounded-lg">
          <div className="w-4 h-4 bg-muted rounded animate-pulse mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          </div>
        </div>

        {/* Mensaje de carga centrado */}
        <div className="text-center py-6">
          <LoadingMessage 
            message="Cargando configuraciones del espacio..." 
            variant="primary" 
            size="md"
            spinnerSize="md"
          />
        </div>
        
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      
      {/* Sección 1: Moderación y Permisos */}
      <div className="space-y-4">
        <SectionHeader icon="cog" title="Moderación y Permisos" />
        
        {/* Restringir Puntos de Entrada */}
        {data.moderation?.restrictEntry && (
          <ConfigToggle
            id="restrict-entry"
            label={data.moderation.restrictEntry.label || "Restringir Puntos de Entrada"}
            description={data.moderation.restrictEntry.description || "Solo los puntos de entrada del proyecto Google Cloud que creó el espacio pueden unirse"}
            tooltip={data.moderation.restrictEntry.tooltip || "entryPointAccess: ALL permite todos los puntos de entrada, CREATOR_APP_ONLY solo puntos de entrada propios"}
            checked={data.moderation.restrictEntry.enabled || false}
            onChange={handleToggleChange('restrictEntry')}
            variant="security"
          />
        )}

        {/* Activar Moderación */}
        {data.moderation?.enableModeration && (
          <ConfigToggle
            id="moderation"
            label={data.moderation.enableModeration.label || "Activar Moderación"}
            description={data.moderation.enableModeration.description || "Da al propietario de la reunión más control sobre funciones y participantes"}
            tooltip={data.moderation.enableModeration.tooltip || "moderation: Cuando está ON permite gestionar co-anfitriones y restricciones de funciones"}
            checked={data.moderation.enableModeration.enabled || false}
            onChange={handleToggleChange('enableModeration')}
            variant="security"
          />
        )}

        {/* Configuraciones de moderación - solo visible cuando moderación está activada */}
        {data.moderation?.enableModeration?.enabled ? (
          <div className="ml-6 space-y-4 border-l-2 border-primary/20 pl-4">
          
          {/* Restricción de Chat */}
          {data.moderation?.chatRestriction && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Restricción de Chat</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent 
                      className="max-w-sm z-[9999]" 
                      side="left"
                      align="center"
                      avoidCollisions={true}
                      collisionPadding={16}
                      sideOffset={8}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Restricción de Chat</p>
                        <p className="text-sm text-muted-foreground">Define quién tiene permisos para enviar mensajes de chat en el espacio de reunión</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={data.moderation.chatRestriction.value || "NO_RESTRICTION"}
                onValueChange={handleSelectChange('chatRestriction')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NO_RESTRICTION">
                    Todos los participantes tienen permisos
                  </SelectItem>
                  <SelectItem value="HOSTS_ONLY">
                    Solo el organizador y co-anfitriones tienen permisos
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Restricción de Reacciones */}
          {data.moderation?.reactionRestriction && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Restricción de Reacciones</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent 
                      className="max-w-sm z-[9999]" 
                      side="left"
                      align="center"
                      avoidCollisions={true}
                      collisionPadding={16}
                      sideOffset={8}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Restricción de Reacciones</p>
                        <p className="text-sm text-muted-foreground">Define quién tiene permisos para enviar reacciones en el espacio de reunión</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={data.moderation.reactionRestriction.value || "NO_RESTRICTION"}
                onValueChange={handleSelectChange('reactionRestriction')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NO_RESTRICTION">
                    Todos los participantes tienen permisos
                  </SelectItem>
                  <SelectItem value="HOSTS_ONLY">
                    Solo el organizador y co-anfitriones tienen permisos
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Restricción de Presentación */}
          {data.moderation?.presentationRestriction && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Restricción de Presentación</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InformationCircleIcon className="h-4 w-4 text-primary cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent 
                      className="max-w-sm z-[9999]" 
                      side="left"
                      align="center"
                      avoidCollisions={true}
                      collisionPadding={16}
                      sideOffset={8}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Restricción de Presentación</p>
                        <p className="text-sm text-muted-foreground">Define quién tiene permisos para compartir pantalla en el espacio de reunión</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={data.moderation.presentationRestriction.value || "NO_RESTRICTION"}
                onValueChange={handleSelectChange('presentRestriction')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NO_RESTRICTION">
                    Todos los participantes tienen permisos
                  </SelectItem>
                  <SelectItem value="HOSTS_ONLY">
                    Solo el organizador y co-anfitriones tienen permisos
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Unirse como Espectador */}
          {data.moderation?.defaultViewer && (
            <ConfigToggle
              id="default-viewer"
              label={data.moderation.defaultViewer.label || "Unirse como Espectador por Defecto"}
              description={data.moderation.defaultViewer.description || "Los usuarios se unirán como espectadores (ON) o contribuyentes (OFF) por defecto"}
              tooltip={data.moderation.defaultViewer.tooltip || "defaultJoinAsViewerType: Define si restringir el rol por defecto asignado a usuarios como espectador"}
              checked={data.moderation.defaultViewer.enabled || false}
              onChange={handleToggleChange('defaultViewer')}
              variant="security"
            />
          )}
          </div>
        ) : (
          <div className="ml-6 p-4 border-l-2 border-muted/30 pl-4">
            <Alert>
              <InformationCircleIcon className="h-4 w-4" />
              <AlertDescription>
                <strong>La moderación está desactivada</strong><br />
                Activa la moderación arriba para acceder a restricciones de chat, reacciones, presentación y configuraciones de espectador.
                Cuando moderation está ON, estas restricciones entran en efecto para la reunión.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Sección 2: Herramientas */}
      <div className="space-y-4">
        <SectionHeader icon="cog" title="Herramientas" />
        
        {/* Grabación Automática */}
        {data.aiFeatures?.autoRecording && (
          <ConfigToggle
            id="auto-recording"
            label={data.aiFeatures.autoRecording.label || "Generación Automática de Grabación"}
            description={data.aiFeatures.autoRecording.description || "Define si un espacio de reunión se graba automáticamente cuando se une alguien con privilegios de grabación"}
            tooltip={data.aiFeatures.autoRecording.tooltip || "recordingConfig.autoRecordingGeneration: Graba automáticamente reuniones cuando se une usuario autorizado"}
            checked={data.aiFeatures.autoRecording.enabled || false}
            onChange={handleToggleChange('autoRecording')}
            variant="ai"
          />
        )}

        {/* Transcripción Automática */}
        {data.aiFeatures?.autoTranscription && (
          <ConfigToggle
            id="auto-transcription"
            label={data.aiFeatures.autoTranscription.label || "Generación Automática de Transcripción"}
            description={data.aiFeatures.autoTranscription.description || "Define si el contenido de la reunión se transcribe automáticamente cuando se une usuario autorizado"}
            tooltip={data.aiFeatures.autoTranscription.tooltip || "transcriptionConfig.autoTranscriptionGeneration: Transcribe automáticamente contenido de reunión cuando se une usuario autorizado"}
            checked={data.aiFeatures.autoTranscription.enabled || false}
            onChange={handleToggleChange('autoTranscription')}
            variant="ai"
          />
        )}

        {/* Notas Inteligentes */}
        {data.aiFeatures?.smartNotes && (
          <ConfigToggle
            id="smart-notes"
            label={data.aiFeatures.smartNotes.label || "Generación Automática de Notas Inteligentes"}
            description={data.aiFeatures.smartNotes.description || "Define si generar automáticamente resumen y recapitulación para todos los invitados cuando se une usuario autorizado"}
            tooltip={data.aiFeatures.smartNotes.tooltip || "smartNotesConfig.autoSmartNotesGeneration: Genera automáticamente resumen y recapitulación de reunión para todos los invitados de la organización cuando se une usuario autorizado"}
            checked={data.aiFeatures.smartNotes.enabled || false}
            onChange={handleToggleChange('smartNotes')}
            variant="ai"
          />
        )}
      </div>

      {/* Alert informativo - exacto del ResponsiveModalDemo */}
      {data.alert?.message && (
        <Alert>
          <InformationCircleIcon className="h-4 w-4" />
          <AlertDescription>
            {data.alert.message}
          </AlertDescription>
        </Alert>
      )}
      
    </div>
  );
};