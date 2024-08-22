import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import LoadingSpinner from "@/src/components/share/LoadingSpinner";

interface ToggleFavoriteModalProps {
  isOpen: boolean;
  isFavorite: boolean;
}

export const ToggleFavoriteModal: React.FC<ToggleFavoriteModalProps> = ({
  isOpen,
  isFavorite,
}) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Procesando solicitud</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {isFavorite
              ? "Quitando de favoritos..."
              : "Agregando a favoritos..."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-center items-center p-4">
          <LoadingSpinner className="h-8 w-8" />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
