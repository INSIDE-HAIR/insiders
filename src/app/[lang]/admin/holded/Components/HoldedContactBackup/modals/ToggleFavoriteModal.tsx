import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import LoadingSpinner from "@/src/components/shared/LoadingSpinner";
import { useTranslations } from "@/src/context/TranslationContext";

interface ToggleFavoriteModalProps {
  isOpen: boolean;
  isFavorite: boolean;
}

export const ToggleFavoriteModal: React.FC<ToggleFavoriteModalProps> = ({
  isOpen,
  isFavorite,
}) => {
  const t = useTranslations("Common.modals.toggleFavorite");

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {isFavorite ? t("removing") : t("adding")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-center items-center p-4">
          <LoadingSpinner className="h-8 w-8" />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
