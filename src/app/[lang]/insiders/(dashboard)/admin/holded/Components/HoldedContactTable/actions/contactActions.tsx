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
import { useTranslations } from "@/src/context/TranslationContext";

interface ContactActionsProps<T extends { id: string }> {
  backup: T;
  loadingBackupId?: string | null;
  onToggleFavorite?: (backup: T) => void;
  onViewDetails?: (backup: T) => void;
  openDeleteModal?: (backupId: string) => void;
  isFavorite?: boolean;
  isTogglingFavorite?: boolean;
}

export function ContactActions<T extends { id: string }>({
  backup,
  loadingBackupId,
  onToggleFavorite,
  onViewDetails,
  openDeleteModal,
  isFavorite,
  isTogglingFavorite,
}: ContactActionsProps<T>) {
  const isLoading = loadingBackupId === backup.id;
  const isAddingToFavorites = isTogglingFavorite && !isFavorite;

  const t = useTranslations("Common.ContactActions");

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
                aria-label={
                  isFavorite ? t("alreadyInFavorites") : t("addToFavorites")
                }
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
              {isFavorite ? t("alreadyInFavorites") : t("addToFavorites")}
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
                aria-label={t("viewDetails")}
              >
                <Eye className="text-blue-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("viewDetails")}</TooltipContent>
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
                aria-label={t("deleteBackup")}
              >
                <Trash2 className="text-red-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("deleteBackup")}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
