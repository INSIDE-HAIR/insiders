import { ColumnDef } from "@tanstack/react-table";
import { HoldedContactsCurrentBackup } from "@prisma/client";
import { createBaseColumns } from "./columns";
import { BackupActions } from "../BackupActions";

interface ColumnMeta {
  openDeleteModal: (backupId: string) => void;
  onViewDetails?: (backup: HoldedContactsCurrentBackup) => void;
  onDelete?: (backup: HoldedContactsCurrentBackup) => void;
  onToggleFavorite?: (backup: HoldedContactsCurrentBackup) => void;
  loadingBackupId?: string | null;
}

// Define columns specifically for current backups
export const columns: (meta: ColumnMeta) => ColumnDef<HoldedContactsCurrentBackup>[] = (meta) => [
  ...createBaseColumns<HoldedContactsCurrentBackup>(), // Extend the base columns

  // Add any current-specific columns here if needed
  // For example:
  // {
  //   accessorKey: "lastUpdated",
  //   header: "Last Updated",
  //   cell: ({ row }) => {
  //     const lastUpdated: Date = row.getValue("lastUpdated");
  //     return <span>{lastUpdated.toLocaleString()}</span>;
  //   },
  // },

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
          onDelete={meta.onDelete}
          onToggleFavorite={meta.onToggleFavorite}
          loadingBackupId={meta.loadingBackupId}
        />
      );
    },
  },
];

export default columns;