import React, { useState, useMemo } from "react";
import { DataTable } from "../DataTable";
import { columns } from "../columns/monthlyColumns";
import { useBackups } from "@/src/hooks/useBackups";
import LoadingSpinner from "@/src/components/share/LoadingSpinner";
import { Button } from "@/src/components/ui/button";
import { DeleteConfirmationModal } from "../DeleteConfirmationModal";
import { useToast } from "@/src/components/ui/use-toast";
import BackupDetails from "../BackupDetails";

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
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
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

  const handleViewDetails = (backup: any) => {
    setSelectedBackupId(backup.id);
  };

  const columnMeta = useMemo(
    () => ({
      openDeleteModal,
      onViewDetails: handleViewDetails,
      onDelete: () => {}, // Esta función no se usa directamente aquí, pero se mantiene por consistencia
      onToggleFavorite: () => {}, // Esta función no se usa en monthly backups, pero se mantiene por consistencia
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
            "Create/Update Monthly Backup"
          )}
        </Button>
      </div>
      <DataTable columns={tableColumns} data={monthlyBackups} />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        backupId={backupToDelete || ""}
      />
      {selectedBackupId && (
        <BackupDetails
          backupId={selectedBackupId}
          itemsPerPage={10}
          type="MONTHLY"
        />
      )}
    </div>
  );
};

export default MonthlyBackupsTab;
