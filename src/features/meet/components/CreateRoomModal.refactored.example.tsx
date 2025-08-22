/**
 * EJEMPLO DE INTEGRACIÓN DE COMPONENTES REFACTORIZADOS
 * Este archivo muestra cómo usar los nuevos componentes atómicos, moleculares y organismos
 * en el CreateRoomModal refactorizado
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
import { Icons } from "@/src/components/shared/icons";
import { VideoCameraIcon } from "@heroicons/react/24/outline";

// Importar el nuevo tab refactorizado
import { AdvancedSettingsTab } from "./organisms/tabs/AdvancedSettingsTab";

// Importar el hook personalizado
import { useRoomForm } from "../hooks/useRoomForm";

// Importar componentes atómicos
import { AccessTypeSelector } from "./molecules/settings/AccessTypeSelector";

interface CreateRoomModalRefactoredProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => Promise<void>;
}

/**
 * Versión refactorizada del CreateRoomModal usando componentes SOLID
 * Este es un ejemplo de cómo migrar gradualmente el componente original
 */
export const CreateRoomModalRefactored: React.FC<CreateRoomModalRefactoredProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  // Usar el hook personalizado para manejar el estado del formulario
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
    buildApiData,
    validate,
    reset,
  } = useRoomForm();

  const [activeTab, setActiveTab] = React.useState("basic");

  // Reset cuando el modal se abre
  React.useEffect(() => {
    if (isOpen) {
      reset();
      setActiveTab("basic");
    }
  }, [isOpen, reset]);

  const handleSubmit = async () => {
    if (!validate()) return;
    
    try {
      setLoading(true);
      const data = buildApiData();
      await onConfirm(data);
      onClose();
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] min-h-[80dvh] max-w-[95vw] flex flex-col overflow-hidden">
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Configuración</TabsTrigger>
            <TabsTrigger value="members">Miembros</TabsTrigger>
            <TabsTrigger value="settings">Avanzado</TabsTrigger>
          </TabsList>

          {/* Tab Básica - Usando componentes refactorizados */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nombre de la Sala</Label>
              <Input
                id="displayName"
                value={formState.displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ej: Reunión de Equipo Semanal"
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground">
                {formState.displayName.length}/100 caracteres
              </p>
            </div>

            {/* Usar el componente molecular AccessTypeSelector */}
            <AccessTypeSelector
              value={formState.accessType}
              onChange={setAccessType}
            />
          </TabsContent>

          {/* Tab de Miembros - Por refactorizar */}
          <TabsContent value="members" className="space-y-4 mt-4">
            <p className="text-muted-foreground">
              Sección de miembros por refactorizar...
            </p>
          </TabsContent>

          {/* Tab Avanzada - Usando el nuevo componente organismo */}
          <TabsContent value="settings" className="mt-4">
            <AdvancedSettingsTab
              restrictEntryPoints={formState.restrictEntryPoints}
              onRestrictEntryPointsChange={toggleRestrictEntryPoints}
              moderation={formState.moderation}
              onModerationChange={toggleModeration}
              chatRestriction={formState.chatRestriction}
              onChatRestrictionChange={setChatRestriction}
              reactionRestriction={formState.reactionRestriction}
              onReactionRestrictionChange={setReactionRestriction}
              presentRestriction={formState.presentRestriction}
              onPresentRestrictionChange={setPresentRestriction}
              defaultJoinAsViewer={formState.defaultJoinAsViewer}
              onDefaultJoinAsViewerChange={toggleDefaultJoinAsViewer}
              autoRecording={formState.autoRecording}
              onAutoRecordingChange={toggleAutoRecording}
              autoTranscription={formState.autoTranscription}
              onAutoTranscriptionChange={toggleAutoTranscription}
              autoSmartNotes={formState.autoSmartNotes}
              onAutoSmartNotesChange={toggleAutoSmartNotes}
              disabled={loading}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
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
                Creando Sala...
              </>
            ) : (
              <>
                <VideoCameraIcon className="mr-2 h-4 w-4" />
                Crear Sala
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};