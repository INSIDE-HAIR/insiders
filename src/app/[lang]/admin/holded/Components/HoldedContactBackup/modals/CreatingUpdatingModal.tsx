import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Spinner } from "@/src/components/ui/spinner";
import { useTranslations } from "@/src/context/TranslationContext";

interface CreatingUpdatingModalProps {
  isOpen: boolean;
}

export const CreatingUpdatingModal: React.FC<CreatingUpdatingModalProps> = ({
  isOpen,
}) => {
  const t = useTranslations("Common.modals.creatingUpdating");

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
          <Spinner size="lg" />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
