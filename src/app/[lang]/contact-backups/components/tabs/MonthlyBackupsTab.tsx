import React, { useState, useCallback } from "react";
import { DataTable } from "../DataTable";
import { columns } from "../columns/monthlyColumns";
import { useBackups } from "@/src/hooks/useBackups";
import LoadingSpinner from "@/src/components/share/LoadingSpinner";
import { Button } from "@/src/components/ui/button";
import { DeleteConfirmationModal } from "../modals/DeleteConfirmationModal";
import { useToast } from "@/src/components/ui/use-toast";
import BackupDetails from "../BackupDetails";
import { HoldedContactsMonthlyBackup } from "@prisma/client";
import { ToggleFavoriteModal } from "../modals/ToggleFavoriteModal";
import { DeletingModal } from "../modals/DeletingModal";

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
  const [backupToDelete, setBackupToDelete] = useState<string | null>(null);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [backupBeingToggled, setBackupBeingToggled] =
    useState<HoldedContactsMonthlyBackup | null>(null);
  const { toast } = useToast();

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
          title: "Backup eliminado",
          description: "El backup mensual ha sido eliminado exitosamente.",
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
    (backup: HoldedContactsMonthlyBackup) => {
      setSelectedBackupId(backup.id);
    },
    []
  );

  const handleCreateOrUpdateBackup = useCallback(() => {
    createOrUpdateBackup();
    toast({
      title: "Creando/Actualizando backup",
      description: "Se está creando o actualizando un nuevo backup mensual.",
    });
  }, [createOrUpdateBackup, toast]);

  const handleToggleFavorite = useCallback(
    async (backup: HoldedContactsMonthlyBackup) => {
      setIsTogglingFavorite(true);
      setBackupBeingToggled(backup);
      try {
        const result = await toggleFavorite(backup.id);
        console.log("Toggle favorite result:", result);
        if (result.newFavoriteId) {
          console.log("New favorite created with ID:", result.newFavoriteId);
          toast({
            title: "¡Copia exitosa!",
            description: `Se ha creado una nueva copia de seguridad en favoritos con el ID: ${result.newFavoriteId}`,
          });
        } else {
          console.log("Favorite was removed");
          toast({
            title: "Acción completada",
            description: isFavorite(backup.id)
              ? "Se ha quitado la copia de seguridad de favoritos."
              : "Se ha agregado la copia de seguridad a favoritos.",
          });
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
        toast({
          title: "Error",
          description: "Ocurrió un error al procesar la solicitud.",
          variant: "destructive",
        });
      } finally {
        setIsTogglingFavorite(false);
        setBackupBeingToggled(null);
      }
    },
    [toggleFavorite, isFavorite, toast]
  );

  if (isLoading) {
    return (
      <div className="my-4 flex items-center justify-center">
        <LoadingSpinner className="w-10 h-10" />
      </div>
    );
  }

  if (error) return <div>Error loading backups: {error.message}</div>;

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
        <h1 className="text-3xl font-bold text-center">Monthly Backups</h1>
        <p className="text-center max-w-3xl">
          Solo se crearán copias de seguridad de los contactos de Holded de los
          últimos 12 meses.
        </p>
      </div>
      <div className="mb-4 flex justify-between items-center">
        <p>
          Monthly Backups{" "}
          <span className="text-sm font-normal text-gray-500">
            ({monthlyBackups?.length || 0}/12)
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
            "Create/Update the most recent Monthly Backup"
          )}
        </Button>
      </div>
      <DataTable columns={columns(columnMeta)} data={monthlyBackups || []} />
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
