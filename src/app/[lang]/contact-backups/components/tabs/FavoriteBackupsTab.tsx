import React, { useState, useCallback } from "react";
import { DataTable } from "../DataTable";
import { Columns } from "../columns/favoriteColumns";
import { useBackups } from "@/src/hooks/useBackups";
import LoadingSpinner from "@/src/components/share/LoadingSpinner";
import { DeleteConfirmationModal } from "../modals/DeleteConfirmationModal";
import { useToast } from "@/src/components/ui/use-toast";
import BackupDetails from "../BackupDetails";
import { HoldedContactsFavoriteBackup } from "@prisma/client";
import { DeletingModal } from "../modals/DeletingModal";
import { useTranslations } from "@/src/context/TranslationContext";

const FavoriteBackupsTab: React.FC = () => {
  const {
    backups,
    loadingBackupId,
    deleteBackup,
    isLoading,
    error,
    isDeletingBackup,
    toggleFavorite,
  } = useBackups("FAVORITE");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingModalOpen, setDeletingModalOpen] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState<string | null>(null);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const { toast } = useToast();

  const t = useTranslations("Common.general");
  const b = useTranslations("Common.backups");
  const a = useTranslations("Common.actions");
  const to = useTranslations("Common.toasts");

  const favoriteBackups = backups as HoldedContactsFavoriteBackup[] | undefined;

  const openDeleteModal = useCallback((backupId: string) => {
    setBackupToDelete(backupId);
    setDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setBackupToDelete(null);
  }, []);

  const handleDelete = useCallback(
    async (backup: HoldedContactsFavoriteBackup) => {
      closeDeleteModal();
      setDeletingModalOpen(true);
      try {
        await deleteBackup(backup.id);
        toast({
          title: to("success.title"),
          description: b("favorite.deleteSuccess"),
        });
      } catch (error) {
        console.error("Error deleting favorite backup:", error);
        toast({
          title: to("error.title"),
          description: b("favorite.deleteError"),
          variant: "destructive",
        });
      } finally {
        setDeletingModalOpen(false);
      }
    },
    [deleteBackup, closeDeleteModal, toast, b, to]
  );

  const handleViewDetails = useCallback(
    (backup: HoldedContactsFavoriteBackup) => {
      setSelectedBackupId(backup.id);
    },
    []
  );

  const handleToggleFavorite = useCallback(
    async (backup: HoldedContactsFavoriteBackup) => {
      try {
        await toggleFavorite(backup.id);
        toast({
          title: to("success.title"),
          description: b("favorite.toggleSuccess"),
        });
      } catch (error) {
        console.error("Error toggling favorite:", error);
        toast({
          title: to("error.title"),
          description: b("favorite.toggleError"),
          variant: "destructive",
        });
      }
    },
    [toggleFavorite, toast, b, to]
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
    isFavorite: () => true, // All backups in this tab are favorites
  };

  return (
    <div>
      <div className="my-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center">
          {b("favorite.title")}
        </h1>
        <p className="text-center max-w-3xl">{b("favorite.description")}</p>
      </div>

      <DataTable columns={Columns(columnMeta)} data={favoriteBackups || []} />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() =>
          backupToDelete &&
          handleDelete({ id: backupToDelete } as HoldedContactsFavoriteBackup)
        }
        backupId={backupToDelete || ""}
      />
      <DeletingModal isOpen={deletingModalOpen} />
      {selectedBackupId && (
        <BackupDetails
          backupId={selectedBackupId}
          itemsPerPage={10}
          type="FAVORITE"
        />
      )}
    </div>
  );
};

export default FavoriteBackupsTab;
