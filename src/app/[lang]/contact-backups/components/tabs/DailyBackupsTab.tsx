import React, { useState, useMemo } from "react";
import { DataTable } from "../DataTable";
import { columns } from "../columns/dailyColumns";
import { useBackups } from "@/src/hooks/useBackups";
import LoadingSpinner from "@/src/components/share/LoadingSpinner";
import { Button } from "@/src/components/ui/button";
import { DeleteConfirmationModal } from "../DeleteConfirmationModal";
import { useToast } from "@/src/components/ui/use-toast";

const DailyBackupsTab: React.FC = () => {
  const {
    dailyBackups,
    loadingBackupId,
    deleteBackup,
    createOrUpdateBackup,
    isCreatingBackup,
    isLoading,
    error,
  } = useBackups("DAILY");

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

  const columnMeta = useMemo(
    () => ({
      openDeleteModal,
      onViewDetails: () => {}, // Define your view details function
      onDelete: () => {}, // Define your delete function
      onToggleFavorite: () => {}, // Define your toggle favorite function
      loadingBackupId,
    }),
    [loadingBackupId]
  );

  const tableColumns = useMemo(() => columns(columnMeta), [columnMeta]);

  if (isLoading)
    return (
      <div className="my-4 flex items-center justify-center">
        <LoadingSpinner className="w-10 h-10" />
      </div>
    );

  if (error) return <div>Error loading backups: {error.message}</div>;

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
            "Create/Update Daily Backup"
          )}
        </Button>
      </div>
      <DataTable
        columns={tableColumns}
        data={dailyBackups}
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

export default DailyBackupsTab;
