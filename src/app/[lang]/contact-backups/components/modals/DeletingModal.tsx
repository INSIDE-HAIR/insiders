import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import LoadingSpinner from "@/src/components/share/LoadingSpinner";
import { useTranslations } from "@/src/context/TranslationContext";

interface DeletingModalProps {
  isOpen: boolean;
}

export const DeletingModal: React.FC<DeletingModalProps> = ({ isOpen }) => {
  const t = useTranslations("Common.modals.deletion");

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {t("description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-center items-center p-4">
          <LoadingSpinner className="h-8 w-8" />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
