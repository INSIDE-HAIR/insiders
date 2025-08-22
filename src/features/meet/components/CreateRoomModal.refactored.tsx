/**
 * CREATEROOMMODAL COMPLETAMENTE REFACTORIZADO
 * Usando todos los principios SOLID y componentes atómicos/moleculares/organismos
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
import { Icons } from "@/src/components/shared/icons";
import { VideoCameraIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// Importar componentes refactorizados
import { AccessTypeSelector } from "./molecules/settings/AccessTypeSelector";
import { AdvancedSettingsTab } from "./organisms/tabs/AdvancedSettingsTab";
import { MembersTab } from "./organisms/tabs/MembersTab";
import { RoomSummaryCard } from "./molecules/cards/RoomSummaryCard";

// Importar hooks
import { useRoomForm } from "../hooks/useRoomForm";

interface CreateRoomModalRefactoredProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => Promise<void>;
}

/**
 * Modal de creación de sala completamente refactorizado
 * Utiliza arquitectura SOLID con componentes atómicos, moleculares y organismos
 */
export const CreateRoomModalRefactored: React.FC<CreateRoomModalRefactoredProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  // Usar el hook refactorizado
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
    validation,
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
      
      console.log("🚀 Sending room data:", JSON.stringify(data, null, 2));
      
      await onConfirm(data);
      onClose();
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] min-h-[80dvh] max-w-[95vw] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <VideoCameraIcon className="h-5 w-5 text-primary" />
            Crear Nueva Sala de Meet
          </DialogTitle>
          <DialogDescription>
            Configura una nueva sala de reuniones con los parámetros deseados
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Panel principal con tabs */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Configuración</TabsTrigger>
                <TabsTrigger value="members">
                  Miembros
                  {formState.members.length > 0 && (
                    <span className="ml-1 bg-primary text-primary-foreground rounded-full text-xs px-1.5 py-0.5">
                      {formState.members.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings">
                  Avanzado
                  {validation.hasWarnings && (
                    <ExclamationTriangleIcon className="ml-1 h-3 w-3 text-yellow-500" />
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Tab Básica */}
              <TabsContent value="basic" className="space-y-4 mt-4">
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

                <AccessTypeSelector
                  value={formState.accessType}
                  onChange={setAccessType}
                  disabled={loading}
                />

                <p className="text-sm text-muted-foreground">
                  {getAccessTypeDescription(formState.accessType)}
                </p>
              </TabsContent>

              {/* Tab de Miembros - Usando componente refactorizado */}
              <TabsContent value="members">
                <MembersTab
                  members={formState.members}
                  onMembersChange={setMembers}
                  disabled={loading}
                />
              </TabsContent>

              {/* Tab Avanzada - Usando componente refactorizado */}
              <TabsContent value="settings">
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
          </div>

          {/* Panel lateral con preview */}
          <div className="space-y-4">
            <h3 className="font-semibold">Vista Previa</h3>
            
            <RoomSummaryCard
              displayName={formState.displayName || "Nueva Sala"}
              accessType={formState.accessType}
              memberCount={formState.members.length}
              hasRecording={formState.autoRecording}
              hasTranscription={formState.autoTranscription}
              hasSmartNotes={formState.autoSmartNotes}
              hasModeration={formState.moderation}
            />

            {/* Validaciones */}
            {validation.hasWarnings && (
              <Alert>
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {validation.validation.warnings.map((warning, idx) => (
                      <p key={idx} className="text-sm">
                        {warning.message}
                      </p>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {!validation.isValid && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Errores a corregir:</p>
                    {validation.validation.errors.map((error, idx) => (
                      <p key={idx} className="text-sm">
                        • {error.message}
                      </p>
                    ))}
                  </div>
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
            disabled={loading || !validation.isValid}
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