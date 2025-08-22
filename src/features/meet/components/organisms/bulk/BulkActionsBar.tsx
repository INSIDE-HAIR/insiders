/**
 * BULKACTIONSBAR - Barra de acciones masivas para salas seleccionadas
 * Permite realizar operaciones en lote sobre múltiples salas
 */

import React from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import {
  TrashIcon,
  EllipsisHorizontalIcon,
  LockClosedIcon,
  LockOpenIcon,
  EyeIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  TagIcon,
  FolderIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Import hooks
import { useBulkOperations } from "../../../hooks/useBulkOperations";

export interface BulkActionsBarProps {
  selectedCount: number;
  selectedRoomIds: string[];
  onClearSelection: () => void;
  onBulkAction?: (action: string, payload?: any) => void;
  className?: string;
}

/**
 * Barra de acciones que aparece cuando hay salas seleccionadas
 * Proporciona acciones masivas como eliminar, cambiar configuraciones, etc.
 */
export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  selectedRoomIds,
  onClearSelection,
  onBulkAction,
  className,
}) => {
  const {
    bulkDelete,
    bulkUpdateAccessType,
    bulkEnableRecording,
    bulkDisableRecording,
    bulkEnableTranscription,
    bulkDisableTranscription,
    isOperationLoading,
    operationProgress,
  } = useBulkOperations();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);

  if (selectedCount === 0) return null;

  const handleBulkDelete = async () => {
    try {
      await bulkDelete(selectedRoomIds);
      onClearSelection();
      setDeleteConfirmOpen(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleAccessTypeChange = async (accessType: string) => {
    try {
      await bulkUpdateAccessType(selectedRoomIds, accessType);
      onBulkAction?.("accessTypeChanged", { accessType, count: selectedCount });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleRecordingToggle = async (enable: boolean) => {
    try {
      if (enable) {
        await bulkEnableRecording(selectedRoomIds);
      } else {
        await bulkDisableRecording(selectedRoomIds);
      }
      onBulkAction?.("recordingToggled", { enabled: enable, count: selectedCount });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleTranscriptionToggle = async (enable: boolean) => {
    try {
      if (enable) {
        await bulkEnableTranscription(selectedRoomIds);
      } else {
        await bulkDisableTranscription(selectedRoomIds);
      }
      onBulkAction?.("transcriptionToggled", { enabled: enable, count: selectedCount });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      <div className="bg-primary text-primary-foreground rounded-lg shadow-lg border px-4 py-3 flex items-center gap-4 min-w-96">
        {/* Selection info */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary-foreground text-primary">
            {selectedCount}
          </Badge>
          <span className="text-sm font-medium">
            {selectedCount === 1 ? "sala seleccionada" : "salas seleccionadas"}
          </span>
        </div>

        <Separator orientation="vertical" className="h-6 bg-primary-foreground/20" />

        {/* Quick actions */}
        <div className="flex items-center gap-1">
          {/* Delete */}
          <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isOperationLoading}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar {selectedCount} salas?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente {selectedCount} sala{selectedCount > 1 ? 's' : ''} 
                  y todos sus datos asociados. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleBulkDelete}
                  className="bg-destructive hover:bg-destructive/90"
                  disabled={isOperationLoading}
                >
                  {isOperationLoading ? "Eliminando..." : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isOperationLoading}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <EllipsisHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Acciones Masivas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Access Type */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <LockClosedIcon className="mr-2 h-4 w-4" />
                  <span>Cambiar Acceso</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleAccessTypeChange("OPEN")}>
                    <LockOpenIcon className="mr-2 h-4 w-4" />
                    Libre (OPEN)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAccessTypeChange("TRUSTED")}>
                    <EyeIcon className="mr-2 h-4 w-4" />
                    Organizacional (TRUSTED)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAccessTypeChange("RESTRICTED")}>
                    <LockClosedIcon className="mr-2 h-4 w-4" />
                    Solo invitados (RESTRICTED)
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Recording */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <PlayCircleIcon className="mr-2 h-4 w-4" />
                  <span>Grabaciones</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleRecordingToggle(true)}>
                    Habilitar grabación automática
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRecordingToggle(false)}>
                    Deshabilitar grabación automática
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Transcription */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <DocumentTextIcon className="mr-2 h-4 w-4" />
                  <span>Transcripciones</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleTranscriptionToggle(true)}>
                    Habilitar transcripción automática
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTranscriptionToggle(false)}>
                    Deshabilitar transcripción automática
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              {/* Tags and Groups */}
              <DropdownMenuItem>
                <TagIcon className="mr-2 h-4 w-4" />
                <span>Gestionar Tags</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <FolderIcon className="mr-2 h-4 w-4" />
                <span>Mover a Grupo</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Other actions */}
              <DropdownMenuItem>
                <DocumentDuplicateIcon className="mr-2 h-4 w-4" />
                <span>Duplicar Salas</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                <span>Exportar Datos</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator orientation="vertical" className="h-6 bg-primary-foreground/20" />

        {/* Clear selection */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={isOperationLoading}
          className="text-primary-foreground hover:bg-primary-foreground/10"
        >
          <XMarkIcon className="h-4 w-4 mr-1" />
          Cancelar
        </Button>

        {/* Progress indicator */}
        {operationProgress && !operationProgress.completed && (
          <div className="flex items-center gap-2 ml-2">
            <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">
              {operationProgress.current}/{operationProgress.total}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};