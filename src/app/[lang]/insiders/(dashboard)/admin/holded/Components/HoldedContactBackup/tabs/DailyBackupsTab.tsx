import React, { useState, useCallback } from "react";
import { DataTable } from "../DataTable";
import { Columns } from "../columns/dailyColumns";
import { useBackups } from "@/src/hooks/useBackups";
import LoadingSpinner from "@/src/components/share/LoadingSpinner";
import { Button } from "@/src/components/ui/button";
import { DeleteConfirmationModal } from "../modals/DeleteConfirmationModal";
import { useToast } from "@/src/components/ui/use-toast";
import BackupDetails from "../actions/BackupDetails";
import { HoldedContactsDailyBackup } from "@prisma/client";
import { ToggleFavoriteModal } from "../modals/ToggleFavoriteModal";
import { DeletingModal } from "../modals/DeletingModal";
import { CreatingUpdatingModal } from "../modals/CreatingUpdatingModal";
import { useTranslations } from "@/src/context/TranslationContext";

const DailyBackupsTab: React.FC = () => {
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
  } = useBackups("DAILY");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingModalOpen, setDeletingModalOpen] = useState(false);
  const [creatingUpdatingModalOpen, setCreatingUpdatingModalOpen] =
    useState(false);
  const [backupToDelete, setBackupToDelete] = useState<string | null>(null);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [backupBeingToggled, setBackupBeingToggled] =
    useState<HoldedContactsDailyBackup | null>(null);
  const { toast } = useToast();

  const t = useTranslations("Common.general");
  const b = useTranslations("Common.backups");
  const a = useTranslations("Common.actions");
  const to = useTranslations("Common.toasts");

  const dailyBackups = backups as HoldedContactsDailyBackup[] | undefined;

  const openDeleteModal = useCallback((backupId: string) => {
    setBackupToDelete(backupId);
    setDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setBackupToDelete(null);
  }, []);

  const handleDelete = useCallback(
    async (backup: HoldedContactsDailyBackup) => {
      closeDeleteModal();
      setDeletingModalOpen(true);
      try {
        await deleteBackup(backup.id);
        toast({
          title: to("success.title"),
          description: b("daily.deleteSuccess"),
        });
      } catch (error) {
        console.error("Error deleting backup:", error);
        toast({
          title: to("error.title"),
          description: b("daily.deleteError"),
          variant: "destructive",
        });
      } finally {
        setDeletingModalOpen(false);
      }
    },
    [deleteBackup, closeDeleteModal, toast, b, to]
  );

  const handleViewDetails = useCallback((backup: HoldedContactsDailyBackup) => {
    setSelectedBackupId(backup.id);
  }, []);

  const handleCreateOrUpdateBackup = useCallback(async () => {
    setCreatingUpdatingModalOpen(true);
    try {
      await createOrUpdateBackup();
      toast({
        title: to("success.title"),
        description: b("daily.createUpdateSuccess"),
      });
    } catch (error) {
      console.error("Error creating/updating backup:", error);
      toast({
        title: to("error.title"),
        description: b("daily.createUpdateError"),
        variant: "destructive",
      });
    } finally {
      setCreatingUpdatingModalOpen(false);
    }
  }, [createOrUpdateBackup, toast, b, to]);

  const handleToggleFavorite = useCallback(
    async (backup: HoldedContactsDailyBackup) => {
      setIsTogglingFavorite(true);
      setBackupBeingToggled(backup);
      try {
        const result = await toggleFavorite(backup.id);
        console.log("Toggle favorite result:", result);
        if (result.newFavoriteId) {
          console.log("New favorite created with ID:", result.newFavoriteId);
          toast({
            title: to("success.title"),
            description: b("daily.newFavoriteCreated", {
              id: result.newFavoriteId,
            }),
          });
        } else {
          console.log("Favorite was removed");
          toast({
            title: to("success.title"),
            description: isFavorite(backup.id)
              ? b("daily.favoriteRemoved")
              : b("daily.favoriteAdded"),
          });
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
        toast({
          title: to("error.title"),
          description: b("daily.toggleFavoriteError"),
          variant: "destructive",
        });
      } finally {
        setIsTogglingFavorite(false);
        setBackupBeingToggled(null);
      }
    },
    [toggleFavorite, isFavorite, toast, b, to]
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
        <h1 className="text-3xl font-bold text-center">{b("daily.title")}</h1>
        <p className="text-center max-w-3xl">{b("daily.description")}</p>
      </div>
      <div className="mb-4 flex justify-between items-center text-sm">
        <p>
          {b("daily.title")}{" "}
          <span className="text-sm font-normal text-gray-500">
            ({dailyBackups?.length || 0}/31)
          </span>
        </p>
        <Button
          onClick={handleCreateOrUpdateBackup}
          disabled={isCreatingBackup}
        >
          {b("actions.createUpdateDaily")}
        </Button>
      </div>
      <DataTable columns={Columns(columnMeta)} data={dailyBackups || []} />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() =>
          backupToDelete &&
          handleDelete({ id: backupToDelete } as HoldedContactsDailyBackup)
        }
        backupId={backupToDelete || ""}
      />
      <DeletingModal isOpen={deletingModalOpen} />
      <CreatingUpdatingModal isOpen={creatingUpdatingModalOpen} />
      {selectedBackupId && (
        <BackupDetails
          backupId={selectedBackupId}
          itemsPerPage={10}
          type="DAILY"
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

export default DailyBackupsTab;
