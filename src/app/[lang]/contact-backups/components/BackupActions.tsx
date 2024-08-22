import React from "react";
import { Button } from "@/src/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/src/components/ui/tooltip";
import { Star, Trash2, Eye } from "lucide-react";
import { cn } from "@/src/lib/utils/utils";

interface BackupActionsProps<T extends { id: string }> {
  backup: T;
  loadingBackupId?: string | null;
  onToggleFavorite?: (backup: T) => void;
  onViewDetails?: (backup: T) => void;
  openDeleteModal?: (backupId: string) => void;
  isFavorite?: boolean;
  isTogglingFavorite?: boolean;
}

export function BackupActions<T extends { id: string }>({
  backup,
  loadingBackupId,
  onToggleFavorite,
  onViewDetails,
  openDeleteModal,
  isFavorite,
  isTogglingFavorite,
}: BackupActionsProps<T>) {
  const isLoading = loadingBackupId === backup.id;
  const isAddingToFavorites = isTogglingFavorite && !isFavorite;

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
                disabled={isLoading || isFavorite || isTogglingFavorite}
              >
                <Star
                  className={cn(
                    "transition-colors",
                    isFavorite
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isFavorite ? "Already in favorites" : "Add to favorites"}
            </TooltipContent>
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

        {openDeleteModal && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openDeleteModal(backup.id)}
                disabled={isLoading || isAddingToFavorites}
              >
                <Trash2 className="text-red-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete backup</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
