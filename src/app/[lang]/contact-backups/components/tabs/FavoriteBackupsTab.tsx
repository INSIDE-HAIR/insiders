import React, { useState } from "react";
import { DataTable } from "../DataTable";
import { columns } from "../columns/favoriteColumns";
import { useBackups } from "@/src/hooks/useBackups";
import LoadingSpinner from "@/src/components/share/LoadingSpinner";
import { DeleteConfirmationModal } from "../DeleteConfirmationModal";
import { useToast } from "@/src/components/ui/use-toast";

const FavoriteBackupsTab: React.FC = () => {
  const { favoriteBackups, loadingBackupId, deleteBackup, isLoading, error } =
    useBackups("FAVORITE");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const openDeleteModal = (backupId: string) => {
    setBackupToDelete(backupId);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setBackupToDelete(null);
  };

  const handleDelete = () => {
    if (backupToDelete) {
      deleteBackup(backupToDelete, {
        onSuccess: () => {
          toast({
            title: "Backup deleted",
            description: "The favorite backup has been successfully deleted.",
          });
          closeDeleteModal();
        },
        onError: () => {
          toast({
            title: "Failed to delete backup",
            description:
              "There was an issue deleting the backup. Please try again.",
            variant: "destructive",
          });
        },
      });
    }
  };

  if (isLoading)
    return (
      <div className="my-4 flex items-center justify-center">
        <LoadingSpinner className="w-10 h-10" />
      </div>
    );

  if (error) {
    return (
      <div>
        Error loading favorite backups:{" "}
        {error instanceof Error ? error.message : "An unknown error occurred"}
      </div>
    );
  }

  const columnMeta = {
    openDeleteModal,
    onViewDetails: () => {}, // Define your view details function
    onDelete: () => {}, // Define your delete function
    onToggleFavorite: () => {}, // Define your toggle favorite function
    loadingBackupId,
  };

  return (
    <div>
      <DataTable
        columns={columns(columnMeta)}
        data={favoriteBackups}
        loadingBackupId={loadingBackupId}
        onDelete={handleDelete}
        openDeleteModal={openDeleteModal}
        pageSize={10}
      />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        backupId={backupToDelete || ""}
      />
    </div>
  );
};

export default FavoriteBackupsTab;
