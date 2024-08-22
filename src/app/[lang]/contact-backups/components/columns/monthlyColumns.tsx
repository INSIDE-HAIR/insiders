import { ColumnDef } from "@tanstack/react-table";
import { HoldedContactsMonthlyBackup } from "@prisma/client";
import { createBaseColumns } from "./columns";
import { BackupActions } from "../BackupActions";

interface ColumnMeta {
  openDeleteModal: (backupId: string) => void;
  onViewDetails?: (backup: HoldedContactsMonthlyBackup) => void;
  onDelete?: (backup: HoldedContactsMonthlyBackup) => void;
  onToggleFavorite?: (backup: HoldedContactsMonthlyBackup) => void;
  loadingBackupId?: string | null;
  isFavorite: (backupId: string) => boolean;
}

// Define columns specifically for monthly backups
export const columns: (
  meta: ColumnMeta
) => ColumnDef<HoldedContactsMonthlyBackup>[] = (meta) => [
  ...createBaseColumns<HoldedContactsMonthlyBackup>(), // Extend the base columns

  {
    accessorKey: "month",
    header: "Month",
    cell: ({ row }) => {
      const month: number = row.getValue("month");
      return <span>{month}</span>;
    },
  },
  {
    accessorKey: "year",
    header: "Year",
    cell: ({ row }) => {
      const year: number = row.getValue("year");
      return <span>{year}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const backup = row.original;
      return (
        <BackupActions
          backup={backup}
          openDeleteModal={meta.openDeleteModal}
          onViewDetails={meta.onViewDetails}
          onToggleFavorite={meta.onToggleFavorite}
          loadingBackupId={meta.loadingBackupId}
          isFavorite={meta.isFavorite(backup.id)}
          isTogglingFavorite={meta.loadingBackupId === backup.id}
        />
      );
    },
  },
];

export default columns;
