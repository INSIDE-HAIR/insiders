import React from "react";
import { Button } from "@/src/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/src/components/ui/tooltip";
import { Star, Trash2, Eye } from "lucide-react";

interface BackupActionsProps<T extends { id: string }> {
  backup: T;
  loadingBackupId?: string | null;
  onToggleFavorite?: (backup: T) => void;
  onDelete?: (backup: T) => void;
  onViewDetails?: (backup: T) => void;
  openDeleteModal: (backupId: string) => void;
}

export function BackupActions<T extends { id: string }>({
  backup,
  loadingBackupId,
  onToggleFavorite,
  onDelete,
  onViewDetails,
  openDeleteModal,
}: BackupActionsProps<T>) {
  const isLoading = loadingBackupId === backup.id;

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2">
        {onToggleFavorite && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleFavorite(backup)}
                disabled={isLoading}
              >
                <Star className="text-gray-300" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add to favorites</TooltipContent>
          </Tooltip>
        )}

        {onViewDetails && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewDetails(backup)}
                disabled={isLoading}
              >
                <Eye className="text-blue-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View details</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openDeleteModal(backup.id)}
              disabled={isLoading}
            >
              <Trash2 className="text-red-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete backup</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
