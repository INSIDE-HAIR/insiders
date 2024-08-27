"use client";
import { ColumnDef } from "@tanstack/react-table";
import { HoldedContactsMonthlyBackup } from "@prisma/client";
import { CreateBaseColumns } from "./columns";
import { BackupActions } from "../actions/BackupActions";
import { useTranslations } from "@/src/context/TranslationContext";

interface ColumnMeta {
  openDeleteModal: (backupId: string) => void;
  onViewDetails: (backup: HoldedContactsMonthlyBackup) => void;
  onToggleFavorite: (backup: HoldedContactsMonthlyBackup) => void;
  loadingBackupId: string | null;
  isDeletingBackup: boolean;
  isFavorite: (backupId: string) => boolean;
}

export const Columns: (
  meta: ColumnMeta
) => ColumnDef<HoldedContactsMonthlyBackup>[] = (meta) => {
  const t = useTranslations("Common.columns");

  return [
    ...CreateBaseColumns<HoldedContactsMonthlyBackup>(),
    {
      accessorKey: "month",
      header: t("month"),
      cell: ({ row }) => {
        const month: number = row.getValue("month");
        return <span>{month}</span>;
      },
    },
    {
      accessorKey: "year",
      header: t("year"),
      cell: ({ row }) => {
        const year: number = row.getValue("year");
        return <span>{year}</span>;
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
            isTogglingFavorite={meta.loadingBackupId === backup.id}
          />
        );
      },
    },
  ];
};

export default Columns;
