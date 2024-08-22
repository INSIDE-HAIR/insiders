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
export const columns: (
  meta: ColumnMeta
) => ColumnDef<HoldedContactsCurrentBackup>[] = (meta) => [
  ...createBaseColumns<HoldedContactsCurrentBackup>(), // Extend the base columns

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const backup = row.original;
      return (
        <BackupActions
          backup={backup}
          onViewDetails={meta.onViewDetails}
          loadingBackupId={meta.loadingBackupId}
        />
      );
    },
  },
];

export default columns;
