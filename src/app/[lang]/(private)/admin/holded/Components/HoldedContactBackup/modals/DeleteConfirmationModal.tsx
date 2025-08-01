import React from "react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { useTranslations } from "@/src/context/TranslationContext";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (backupId: string) => void;
  backupId: string;
}

export const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({ isOpen, onClose, onConfirm, backupId }) => {
  const t = useTranslations("Common.modals.confirmation");
  const a = useTranslations("Common.actions");

  const handleConfirm = () => {
    onConfirm(backupId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("deleteDescription")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {a("cancel")}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            {a("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
