import React, { useState, useCallback } from "react";
import { DataTable } from "../DataTable";
import { Columns } from "../columns/monthlyColumns";
import { useBackups } from "@/src/hooks/useBackups";
import LoadingSpinner from "@/src/components/share/LoadingSpinner";
import { Button } from "@/src/components/ui/button";
import { DeleteConfirmationModal } from "../modals/DeleteConfirmationModal";
import { useToast } from "@/src/components/ui/use-toast";
import BackupDetails from "../actions/BackupDetails";
import { HoldedContactsMonthlyBackup } from "@prisma/client";
import { ToggleFavoriteModal } from "../modals/ToggleFavoriteModal";
import { DeletingModal } from "../modals/DeletingModal";
import { CreatingUpdatingModal } from "../modals/CreatingUpdatingModal";
import { useTranslations } from "@/src/context/TranslationContext";

const MonthlyBackupsTab: React.FC = () => {
  const {
    backups,
    loadingBackupId,
    deleteBackup,
    createOrUpdateBackup,
    isCreatingBackup,
    isLoading,
    error,
    isDeletingBackup,
    toggleFavorite,
    isFavorite,
  } = useBackups("MONTHLY");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingModalOpen, setDeletingModalOpen] = useState(false);
  const [creatingUpdatingModalOpen, setCreatingUpdatingModalOpen] =
    useState(false);
  const [backupToDelete, setBackupToDelete] = useState<string | null>(null);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [backupBeingToggled, setBackupBeingToggled] =
    useState<HoldedContactsMonthlyBackup | null>(null);
  const { toast } = useToast();

  const t = useTranslations("Common.general");
  const b = useTranslations("Common.backups");
  const a = useTranslations("Common.actions");
  const m = useTranslations("Common.modals.confirmation");
  const to = useTranslations("Common.toasts");

  const monthlyBackups = backups as HoldedContactsMonthlyBackup[] | undefined;

  const openDeleteModal = useCallback((backupId: string) => {
    setBackupToDelete(backupId);
    setDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setBackupToDelete(null);
  }, []);

  const handleDelete = useCallback(
    async (backup: HoldedContactsMonthlyBackup) => {
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
    (backup: HoldedContactsMonthlyBackup) => {
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
        description: to("success.description"),
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
  }, [createOrUpdateBackup, toast, to]);

  const handleToggleFavorite = useCallback(
    async (backup: HoldedContactsMonthlyBackup) => {
      setIsTogglingFavorite(true);
      setBackupBeingToggled(backup);
      try {
        const result = await toggleFavorite(backup.id);
        if (result.newFavoriteId) {
          toast({
            title: a("copySuccessTitle"),
            description: `${a("copySuccessDescription")} ID: ${
              result.newFavoriteId
            }`,
          });
        } else {
          toast({
            title: to("success.title"),
            description: isFavorite(backup.id)
              ? b("favorite.actions.removeSuccess")
              : b("favorite.actions.addSuccess"),
          });
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
        toast({
          title: to("error.title"),
          description: to("error.description"),
          variant: "destructive",
        });
      } finally {
        setIsTogglingFavorite(false);
        setBackupBeingToggled(null);
      }
    },
    [toggleFavorite, isFavorite, toast, to, a, b]
  );

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
    onToggleFavorite: handleToggleFavorite,
    loadingBackupId,
    isDeletingBackup,
    isFavorite,
  };

  return (
    <div>
      <div className="my-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center">{b("monthly.title")}</h1>
        <p className="text-center max-w-3xl">{b("monthly.description")}</p>
      </div>
      <div className="mb-4 flex justify-between items-center text-sm">
        <p>
          {b("monthly.title")}{" "}
          <span className="text-sm font-normal text-gray-500">
            ({monthlyBackups?.length || 0}/12)
          </span>
        </p>
        <Button
          onClick={handleCreateOrUpdateBackup}
          disabled={isCreatingBackup}
        >
          {b("actions.createUpdateMonthly")}
        </Button>
      </div>
      <DataTable columns={Columns(columnMeta)} data={monthlyBackups || []} />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() =>
          backupToDelete &&
          handleDelete({ id: backupToDelete } as HoldedContactsMonthlyBackup)
        }
        backupId={backupToDelete || ""}
      />
      <DeletingModal isOpen={deletingModalOpen} />
      <CreatingUpdatingModal isOpen={creatingUpdatingModalOpen} />
      {selectedBackupId && (
        <BackupDetails
          backupId={selectedBackupId}
          itemsPerPage={10}
          type="MONTHLY"
        />
      )}
      {backupBeingToggled && (
        <ToggleFavoriteModal
          isOpen={isTogglingFavorite}
          isFavorite={isFavorite(backupBeingToggled.id)}
        />
      )}
    </div>
  );
};

export default MonthlyBackupsTab;
