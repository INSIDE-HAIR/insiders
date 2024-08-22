import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import LoadingSpinner from "@/src/components/share/LoadingSpinner";

interface DeletingModalProps {
  isOpen: boolean;
}

export const DeletingModal: React.FC<DeletingModalProps> = ({ isOpen }) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Procesando solicitud</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Eliminando backup...
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-center items-center p-4">
          <LoadingSpinner className="h-8 w-8" />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
