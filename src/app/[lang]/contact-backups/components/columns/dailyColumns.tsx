import { ColumnDef } from "@tanstack/react-table";
import { HoldedContactsDailyBackup } from "@prisma/client";
import { createBaseColumns } from "./columns";
import { BackupActions } from "../BackupActions";

interface ColumnMeta {
  openDeleteModal: (backupId: string) => void;
  onViewDetails?: (backup: HoldedContactsDailyBackup) => void;
  onDelete?: (backup: HoldedContactsDailyBackup) => void;
  onToggleFavorite?: (backup: HoldedContactsDailyBackup) => void;
  isFavorite: (backupId: string) => boolean;
  loadingBackupId?: string | null;
}

export const columns = (
  meta: ColumnMeta
): ColumnDef<HoldedContactsDailyBackup>[] => [
  ...createBaseColumns<HoldedContactsDailyBackup>(),
  {
    accessorKey: "dayOfMonth",
    header: "Day of Month",
    cell: ({ row }) => {
      const dayOfMonth: number = row.getValue("dayOfMonth");
      return <span>{dayOfMonth}</span>;
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
          isTogglingFavorite={false}
        />
      );
    },
  },
];
