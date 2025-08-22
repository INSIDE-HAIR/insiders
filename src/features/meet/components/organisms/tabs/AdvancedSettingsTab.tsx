import React from "react";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { ArtifactsSection } from "../sections/ArtifactsSection";
import { ModerationToggle } from "../../molecules/settings/ModerationToggle";
import { ChatRestrictionSelector } from "../../molecules/settings/ChatRestrictionSelector";
import { LabeledSwitch } from "../../atoms/controls/LabeledSwitch";
import { LabeledSelect } from "../../atoms/controls/LabeledSelect";
import { cn } from "@/src/lib/utils";

export interface AdvancedSettingsTabProps {
  // Entry Points
  restrictEntryPoints: boolean;
  onRestrictEntryPointsChange: (value: boolean) => void;
  
  // Moderation
  moderation: boolean;
  onModerationChange: (value: boolean) => void;
  
  // Moderation Restrictions (only if moderation is enabled)
  chatRestriction: "NO_RESTRICTION" | "HOSTS_ONLY";
  onChatRestrictionChange: (value: "NO_RESTRICTION" | "HOSTS_ONLY") => void;
  reactionRestriction: "NO_RESTRICTION" | "HOSTS_ONLY";
  onReactionRestrictionChange: (value: "NO_RESTRICTION" | "HOSTS_ONLY") => void;
  presentRestriction: "NO_RESTRICTION" | "HOSTS_ONLY";
  onPresentRestrictionChange: (value: "NO_RESTRICTION" | "HOSTS_ONLY") => void;
  defaultJoinAsViewer: boolean;
  onDefaultJoinAsViewerChange: (value: boolean) => void;
  
  // Artifacts
  autoRecording: boolean;
  onAutoRecordingChange: (value: boolean) => void;
  autoTranscription: boolean;
  onAutoTranscriptionChange: (value: boolean) => void;
  autoSmartNotes: boolean;
  onAutoSmartNotesChange: (value: boolean) => void;
  
  disabled?: boolean;
  className?: string;
}

/**
 * Tab de configuraciones avanzadas para salas de Meet
 * Incluye moderación, restricciones y artefactos automáticos
 */
export const AdvancedSettingsTab: React.FC<AdvancedSettingsTabProps> = ({
  restrictEntryPoints,
  onRestrictEntryPointsChange,
  moderation,
  onModerationChange,
  chatRestriction,
  onChatRestrictionChange,
  reactionRestriction,
  onReactionRestrictionChange,
  presentRestriction,
  onPresentRestrictionChange,
  defaultJoinAsViewer,
  onDefaultJoinAsViewerChange,
  autoRecording,
  onAutoRecordingChange,
  autoTranscription,
  onAutoTranscriptionChange,
  autoSmartNotes,
  onAutoSmartNotesChange,
  disabled,
  className,
}) => {
  return (
    <ScrollArea className={cn("h-[400px]", className)}>
      <div className="space-y-6 pr-4">
        {/* Sección de Moderación y Permisos */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Moderación y Permisos</h4>
          
          <LabeledSwitch
            id="restrict-entry"
            label="Restringir Puntos de Entrada"
            description="Limita el acceso solo a la aplicación que creó la sala"
            tooltip={
              <>
                <strong>Control de Aplicaciones:</strong>
                <br />• <strong>Desactivado:</strong> Se puede acceder desde
                cualquier aplicación (Google Meet, Calendar, etc.)
                <br />• <strong>Activado:</strong> Solo la aplicación que creó
                la sala puede acceder (más restrictivo)
              </>
            }
            checked={restrictEntryPoints}
            onCheckedChange={onRestrictEntryPointsChange}
            disabled={disabled}
          />
          
          <ModerationToggle
            enabled={moderation}
            onChange={onModerationChange}
            disabled={disabled}
          />
          
          {moderation && (
            <>
              <ChatRestrictionSelector
                value={chatRestriction}
                onChange={onChatRestrictionChange}
                disabled={disabled}
              />
              
              <LabeledSelect
                id="reaction-restriction"
                label="Restricción de Reacciones"
                tooltip="Determina quién puede enviar reacciones (emojis, 'me gusta', etc.) durante la reunión."
                value={reactionRestriction}
                onValueChange={(v) => onReactionRestrictionChange(v as "NO_RESTRICTION" | "HOSTS_ONLY")}
                options={[
                  { value: "NO_RESTRICTION", label: "Todos pueden reaccionar" },
                  { value: "HOSTS_ONLY", label: "Solo organizadores" },
                ]}
                disabled={disabled}
              />
              
              <LabeledSelect
                id="present-restriction"
                label="Restricción de Presentación"
                tooltip="Determina quién puede compartir pantalla, presentar documentos o mostrar contenido durante la reunión."
                value={presentRestriction}
                onValueChange={(v) => onPresentRestrictionChange(v as "NO_RESTRICTION" | "HOSTS_ONLY")}
                options={[
                  { value: "NO_RESTRICTION", label: "Todos pueden presentar" },
                  { value: "HOSTS_ONLY", label: "Solo organizadores" },
                ]}
                disabled={disabled}
              />
              
              <LabeledSwitch
                id="default-viewer"
                label="Unirse como Espectador"
                description="Nuevos participantes se unen como espectadores"
                tooltip="Los nuevos participantes entrarán solo con permisos de visualización. El anfitrión puede promocionarlos a participantes activos después."
                checked={defaultJoinAsViewer}
                onCheckedChange={onDefaultJoinAsViewerChange}
                disabled={disabled}
              />
            </>
          )}
        </div>
        
        {/* Sección de Artefactos Automáticos */}
        <ArtifactsSection
          autoRecording={autoRecording}
          autoTranscription={autoTranscription}
          autoSmartNotes={autoSmartNotes}
          onRecordingChange={onAutoRecordingChange}
          onTranscriptionChange={onAutoTranscriptionChange}
          onSmartNotesChange={onAutoSmartNotesChange}
          disabled={disabled}
        />
      </div>
    </ScrollArea>
  );
};