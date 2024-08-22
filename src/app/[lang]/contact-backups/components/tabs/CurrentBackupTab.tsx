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
import { DeletingModal } from "../modals/DeletingModal";
import { CreatingUpdatingModal } from "../modals/CreatingUpdatingModal";

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
          title: "Backup eliminado",
          description: "El backup actual ha sido eliminado exitosamente.",
        });
      } catch (error) {
        console.error("Error deleting backup:", error);
        toast({
          title: "Error",
          description:
            "Ocurrió un error al eliminar el backup. Por favor, intente nuevamente.",
          variant: "destructive",
        });
      } finally {
        setDeletingModalOpen(false);
      }
    },
    [deleteBackup, closeDeleteModal, toast]
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
        title: "Backup creado/actualizado",
        description:
          "El backup actual ha sido creado o actualizado exitosamente.",
      });
    } catch (error) {
      console.error("Error creating/updating backup:", error);
      toast({
        title: "Error",
        description:
          "Ocurrió un error al crear/actualizar el backup. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setCreatingUpdatingModalOpen(false);
    }
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
            Update Current Backup
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
