"use client";
import { ColumnDef } from "@tanstack/react-table";
import { HoldedContactsDailyBackup } from "@prisma/client";
import { CreateBaseColumns } from "./columns";
import { BackupActions } from "../BackupActions";
import { useTranslations } from "@/src/context/TranslationContext";

interface ColumnMeta {
  openDeleteModal: (backupId: string) => void;
  onViewDetails?: (backup: HoldedContactsDailyBackup) => void;
  onDelete?: (backup: HoldedContactsDailyBackup) => void;
  onToggleFavorite?: (backup: HoldedContactsDailyBackup) => void;
  isFavorite: (backupId: string) => boolean;
  loadingBackupId?: string | null;
}

export const Columns = (
  meta: ColumnMeta
): ColumnDef<HoldedContactsDailyBackup>[] => {
  const t = useTranslations("Common.columns");

  return [
    ...CreateBaseColumns<HoldedContactsDailyBackup>(),
    {
      accessorKey: "dayOfMonth",
      header: t("dayOfMonth"),
      cell: ({ row }) => {
        const dayOfMonth: number = row.getValue("dayOfMonth");
        return <span>{dayOfMonth}</span>;
      },
    },
    {
      id: "actions",
      header: t("actions"),
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
