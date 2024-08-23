"use client";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/use-toast";
import { useBackups } from "@/src/hooks/useBackups";
import React, { useCallback, useState } from "react";
import RequestModal from "../components/modals/RequestModal";
import { useTranslations } from "@/src/context/TranslationContext";

export default function Page() {
  const { createOrUpdateBackup, isCreatingBackup } = useBackups("CURRENT");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const t = useTranslations("Common.general");
  const b = useTranslations("Common.backups");

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleCreateOrUpdateBackup = useCallback(async () => {
    try {
      await createOrUpdateBackup();
      toast({
        title: t("toasts.success.title"),
        description: b("createUpdateSuccess"),
      });
    } catch (error) {
      console.error("Error creating/updating backup:", error);
      toast({
        title: t("toasts.error.title"),
        description: t("toasts.error.description"),
        variant: "destructive",
      });
    } finally {
      closeModal();
    }
  }, [createOrUpdateBackup, toast, t, b, closeModal]);

  return (
    <>
      <RequestModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="createUpdateTitle"
        description="processingDescription"
        onConfirm={handleCreateOrUpdateBackup}
        confirmText="confirm"
        cancelText="cancel"
        isLoading={isCreatingBackup}
      />

      <Button onClick={openModal} disabled={isCreatingBackup}>
        {isCreatingBackup ? t("loading") : b("createUpdateCurrent")}
      </Button>
    </>
  );
}
