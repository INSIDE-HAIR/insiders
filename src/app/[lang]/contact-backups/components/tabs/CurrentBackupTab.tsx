import React, { useState, useCallback, useMemo } from "react";
import { DataTable } from "../DataTable";
import { columns } from "../columns/currentColumns";
import { useBackups } from "@/src/hooks/useBackups";
import LoadingSpinner from "@/src/components/share/LoadingSpinner";
import { Button } from "@/src/components/ui/button";
import { DeleteConfirmationModal } from "../modals/DeleteConfirmationModal";
import { useToast } from "@/src/components/ui/use-toast";
import BackupDetails from "../BackupDetails";
import {
  HoldedContactsCurrentBackup,
  HoldedContactsFavoriteBackup,
} from "@prisma/client";

const CurrentBackupTab: React.FC = () => {
  const {
    backups,
    favoriteBackups,
    loadingBackupId,
    deleteBackup,
    createOrUpdateBackup,
    isCreatingBackup,
    isLoading,
    error,
    isDeletingBackup,
  } = useBackups("CURRENT");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState<string | null>(null);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const { toast } = useToast();

  const currentBackup = useMemo(() => {
    return backups as HoldedContactsCurrentBackup | undefined;
  }, [backups]);

  const isFavorite = useMemo(() => {
    if (!currentBackup) return false;
    return favoriteBackups.some(
      (favorite: HoldedContactsFavoriteBackup) =>
        favorite.id === currentBackup.id
    );
  }, [currentBackup, favoriteBackups]);

  const openDeleteModal = useCallback((backupId: string) => {
    setBackupToDelete(backupId);
    setDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setBackupToDelete(null);
  }, []);

  const handleDelete = useCallback(
    (backup: HoldedContactsCurrentBackup) => {
      deleteBackup(backup.id);
      closeDeleteModal();
      toast({
        title: "Deleting backup",
        description: "The current backup is being deleted.",
      });
    },
    [deleteBackup, closeDeleteModal, toast]
  );

  const handleViewDetails = useCallback(
    (backup: HoldedContactsCurrentBackup) => {
      setSelectedBackupId(backup.id);
    },
    []
  );

  const handleCreateOrUpdateBackup = useCallback(() => {
    createOrUpdateBackup();
    toast({
      title: "Creating/Updating backup",
      description: "The current backup is being created or updated.",
    });
  }, [createOrUpdateBackup, toast]);

  if (isLoading) {
    return (
      <div className="my-4 flex items-center justify-center">
        <LoadingSpinner className="w-10 h-10" />
      </div>
    );
  }

  if (error) return <div>Error loading backup: {error.message}</div>;

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
        <div className="my-8 flex flex-col items-center justif">
          <h1 className="text-3xl font-bold text-center">Current Backups</h1>
          <p className="text-center max-w-3xl">
            Solo se puede tener un backup actual a la vez, pero puedes
            actualizarlo en cualquier momento.
          </p>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <p>
            Current Backups{" "}
            <span className="text-sm font-normal text-gray-500">
              ({[currentBackup]?.length || 0}/1)
            </span>
          </p>

          <Button
            onClick={handleCreateOrUpdateBackup}
            disabled={isCreatingBackup}
          >
            {isCreatingBackup ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Creating Backup...
              </>
            ) : (
              "Update Current Backup"
            )}
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns(columnMeta)}
        data={currentBackup ? [currentBackup] : []}
      />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => currentBackup && handleDelete(currentBackup)}
        backupId={backupToDelete || ""}
      />
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
