"use client";
import { ColumnDef } from "@tanstack/react-table";
import { HoldedContactsDailyBackup } from "@prisma/client";
import { CreateBaseColumns } from "./columns";
import { BackupActions } from "../actions/BackupActions";
interface ColumnMeta {
  openDeleteModal: (backupId: string) => void;
  onViewDetails?: (backup: HoldedContactsDailyBackup) => void;
  onDelete?: (backup: HoldedContactsDailyBackup) => void;
  onToggleFavorite?: (backup: HoldedContactsDailyBackup) => void;
  isFavorite: (backupId: string) => boolean;
  loadingBackupId?: string | null;
  dayOfMonthHeader?: string;
  actionsHeader?: string;
}

export const Columns = (
  meta: ColumnMeta
): ColumnDef<HoldedContactsDailyBackup>[] => {
  return [
    ...CreateBaseColumns<HoldedContactsDailyBackup>(),
    {
      accessorKey: "dayOfMonth",
      header: meta.dayOfMonthHeader || "Day of Month",
      cell: ({ row }) => {
        const dayOfMonth: number = row.getValue("dayOfMonth");
        return <span>{dayOfMonth}</span>;
      },
    },
    {
      id: "actions",
      header: meta.actionsHeader || "Actions",
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
            isTogglingFavorite={false}
          />
        );
      },
    },
  ];
};

export default Columns;
