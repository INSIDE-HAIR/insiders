import React from "react";
import { Button } from "@/src/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/src/components/ui/tooltip";
import { Star, Trash2, Eye } from "lucide-react";

interface BackupActionsProps {
  backup: any;
  loadingBackupId?: string | null;
  onToggleFavorite?: (backupId: string) => void;
  onDelete?: (backupId: string) => void;
  onViewDetails?: (backupId: string) => void;
  openDeleteModal?: (backupId: string) => void;
}

export function BackupActions({
  backup,
  loadingBackupId,
  onToggleFavorite,
  onDelete,
  onViewDetails,
  openDeleteModal,
}: BackupActionsProps) {
  const isLoading = loadingBackupId === backup.id;

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFavorite?.(backup.id)}
              disabled={isLoading}
            >
              <Star
                className={
                  backup.isFavorite ? "text-yellow-500" : "text-gray-300"
                }
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {backup.isFavorite ? "Remove from favorites" : "Add to favorites"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewDetails?.(backup.id)}
              disabled={isLoading}
            >
              <Eye className="text-blue-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>View details</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openDeleteModal?.(backup.id)}
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
