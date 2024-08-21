import React, { useState } from "react";
import { DataTable } from "../DataTable";
import { columns } from "../columns/monthlyColumns";
import { useBackups } from "@/src/hooks/useBackups";
import LoadingSpinner from "@/src/components/share/LoadingSpinner";
import { Button } from "@/src/components/ui/button";
import { DeleteConfirmationModal } from "../DeleteConfirmationModal";
import { useToast } from "@/src/components/ui/use-toast";

const MonthlyBackupsTab: React.FC = () => {
  const {
    monthlyBackups,
    loadingBackupId,
    deleteBackup,
    createOrUpdateBackup,
    isCreatingBackup,
    isLoading,
    error,
  } = useBackups("MONTHLY");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState<string | null>(null);
  const { toast } = useToast(); // Utiliza el hook de ShadCN para manejar los toasts

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
            description: "The backup has been successfully deleted.",
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

  if (error) return <div>Error loading backups: {error.message}</div>;

  const columnMeta = {
    openDeleteModal,
    onViewDetails: () => {}, // Define your view details function
    onDelete: () => {}, // Define your delete function
    onToggleFavorite: () => {}, // Define your toggle favorite function
    loadingBackupId,
  };

  return (
    <div>
      <div className="mb-4">
        <Button
          onClick={() => createOrUpdateBackup()}
          disabled={isCreatingBackup}
        >
          {isCreatingBackup ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              Creating Backup...
            </>
          ) : (
            "Create/Update Monthly Backup"
          )}
        </Button>
      </div>
      <DataTable
        columns={columns(columnMeta)}
        data={monthlyBackups}
        loadingBackupId={loadingBackupId}
        onDelete={handleDelete}
        openDeleteModal={openDeleteModal}
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

export default MonthlyBackupsTab;
