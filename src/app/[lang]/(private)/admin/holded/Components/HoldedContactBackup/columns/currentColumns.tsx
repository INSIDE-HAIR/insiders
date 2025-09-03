"use client";
import { ColumnDef } from "@tanstack/react-table";
import { HoldedContactsCurrentBackup } from "@prisma/client";
import { CreateBaseColumns } from "./columns";
import { BackupActions } from "../actions/BackupActions";

interface ColumnMeta {
  openDeleteModal: (backupId: string) => void;
  onViewDetails?: (backup: HoldedContactsCurrentBackup) => void;
  onDelete?: (backup: HoldedContactsCurrentBackup) => void;
  onToggleFavorite?: (backup: HoldedContactsCurrentBackup) => void;
  loadingBackupId?: string | null;
  actionsHeader?: string;
}

export const Columns: (
  meta: ColumnMeta
) => ColumnDef<HoldedContactsCurrentBackup>[] = (meta) => {
  return [
    ...CreateBaseColumns<HoldedContactsCurrentBackup>(),
    {
      id: "actions",
      header: meta.actionsHeader || "Actions",
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
};

export default Columns;
