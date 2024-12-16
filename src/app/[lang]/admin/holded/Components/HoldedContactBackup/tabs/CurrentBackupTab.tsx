import React, { useState, useCallback, useMemo } from "react";
import { DataTable } from "../DataTable";
import { Columns } from "../columns/currentColumns";
import { useBackups } from "@/src/hooks/useBackups";
import LoadingSpinner from "@/src/components/shared/LoadingSpinner";
import { Button } from "@/src/components/ui/button";
import { DeleteConfirmationModal } from "../modals/DeleteConfirmationModal";
import { useToast } from "@/src/components/ui/use-toast";
import BackupDetails from "../actions/BackupDetails";
import { HoldedContactsCurrentBackup } from "@prisma/client";
import { DeletingModal } from "../modals/DeletingModal";
import { CreatingUpdatingModal } from "../modals/CreatingUpdatingModal";
import { useTranslations } from "@/src/context/TranslationContext";

const CurrentBackupTab: React.FC = () => {
  const {
    backups,
    loadingBackupId,
    deleteBackup,
    createOrUpdateBackup,
    isCreatingBackup,
    isLoading,
    error,
    isDeletingBackup,
  } = useBackups("CURRENT");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingModalOpen, setDeletingModalOpen] = useState(false);
  const [creatingUpdatingModalOpen, setCreatingUpdatingModalOpen] =
    useState(false);
  const [backupToDelete, setBackupToDelete] = useState<string | null>(null);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const { toast } = useToast();

  const t = useTranslations("Common.general");
  const b = useTranslations("Common.backups");
  const to = useTranslations("Common.toasts");

  const currentBackup = useMemo(() => {
    return backups as HoldedContactsCurrentBackup | undefined;
  }, [backups]);

  const openDeleteModal = useCallback((backupId: string) => {
    setBackupToDelete(backupId);
    setDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setBackupToDelete(null);
  }, []);

  const handleDelete = useCallback(
    async (backup: HoldedContactsCurrentBackup) => {
      closeDeleteModal();
      setDeletingModalOpen(true);
      try {
        await deleteBackup(backup.id);
        toast({
          title: to("success.title"),
          description: to("success.description"),
        });
      } catch (error) {
        console.error("Error deleting backup:", error);
        toast({
          title: to("error.title"),
          description: to("error.description"),
          variant: "destructive",
        });
      } finally {
        setDeletingModalOpen(false);
      }
    },
    [deleteBackup, closeDeleteModal, toast, to]
  );

  const handleViewDetails = useCallback(
    (backup: HoldedContactsCurrentBackup) => {
      setSelectedBackupId(backup.id);
    },
    []
  );

  const handleCreateOrUpdateBackup = useCallback(async () => {
    setCreatingUpdatingModalOpen(true);
    try {
      await createOrUpdateBackup();
      toast({
        title: to("success.title"),
        description: b("current.actions.createUpdateCurrent"),
      });
    } catch (error) {
      console.error("Error creating/updating backup:", error);
      toast({
        title: to("error.title"),
        description: to("error.description"),
        variant: "destructive",
      });
    } finally {
      setCreatingUpdatingModalOpen(false);
    }
  }, [createOrUpdateBackup, toast, b, to]);

  if (isLoading) {
    return (
      <div className="my-4 flex items-center justify-center">
        <LoadingSpinner className="w-10 h-10" />
      </div>
    );
  }

  if (error) return <div>{t("loadingError", { error: error.message })}</div>;

  const columnMeta = {
    openDeleteModal,
    onViewDetails: handleViewDetails,
    onDelete: handleDelete,
    loadingBackupId,
    isDeletingBackup,
  };

  return (
    <div>
      <div className="mb-4">
        <div className="my-8 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-center">
            {b("current.title")}
          </h1>
          <p className="text-center max-w-3xl">{b("current.description")}</p>
        </div>

        <div className="mb-4 flex justify-between items-center text-sm">
          <p>
            {b("current.title")}{" "}
            <span className="text-sm font-normal text-gray-500">
              ({currentBackup ? 1 : 0}/1)
            </span>
          </p>

          <Button
            onClick={handleCreateOrUpdateBackup}
            disabled={isCreatingBackup}
          >
            {b("actions.createUpdateCurrent")}
          </Button>
        </div>
      </div>
      <DataTable
        columns={Columns(columnMeta)}
        data={currentBackup ? [currentBackup] : []}
      />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => currentBackup && handleDelete(currentBackup)}
        backupId={backupToDelete || ""}
      />
      <DeletingModal isOpen={deletingModalOpen} />
      <CreatingUpdatingModal isOpen={creatingUpdatingModalOpen} />
      {selectedBackupId && (
        <BackupDetails
          backupId={selectedBackupId}
          itemsPerPage={10}
          type="CURRENT"
        />
      )}
    </div>
  );
};

export default CurrentBackupTab;
