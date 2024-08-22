import React, { useState, useEffect } from "react";
import { DataTable } from "../DataTable";
import { columns } from "../columns/currentColumns";
import { useBackups } from "@/src/hooks/useBackups";
import LoadingSpinner from "@/src/components/share/LoadingSpinner";
import { Button } from "@/src/components/ui/button";
import { DeleteConfirmationModal } from "../DeleteConfirmationModal";
import { useToast } from "@/src/components/ui/use-toast";
import BackupDetails from "../BackupDetails";

const CurrentBackupTab: React.FC = () => {
  const {
    currentBackup,
    loadingBackupId,
    deleteBackup,
    createOrUpdateBackup,
    isCreatingBackup,
    isLoading,
    error,
    fetchBackupDataById,
  } = useBackups("CURRENT");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState<string | null>(null);
  const [selectedBackupId, setSelectedBackupId] = useState<any | null>(null);
  const [backupDetailsData, setBackupDetailsData] = useState<any | null>(null);
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
            description: "The current backup has been successfully deleted.",
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

  if (isLoading)
    return (
      <div className="my-4 flex items-center justify-center">
        <LoadingSpinner className="w-10 h-10" />
      </div>
    );

  if (error) return <div>Error loading backup: {error.message}</div>;

  const columnMeta = {
    openDeleteModal,
    onViewDetails: handleViewDetails,
    onDelete: () => {},
    onToggleFavorite: () => {},
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
            "Create/Update Current Backup"
          )}
        </Button>
      </div>
      <DataTable
        columns={columns(columnMeta)}
        data={currentBackup ? [currentBackup] : []}
      />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        backupId={backupToDelete || ""}
      />
      {/* Renderiza BackupDetails si hay un backup seleccionado */}
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
