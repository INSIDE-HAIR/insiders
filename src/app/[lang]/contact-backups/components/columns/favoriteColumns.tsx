"use client";
import { ColumnDef } from "@tanstack/react-table";
import { HoldedContactsFavoriteBackup } from "@prisma/client";
import { BackupActions } from "../BackupActions";
import { CreateBaseColumns } from "./columns";
import { useTranslations } from "@/src/context/TranslationContext";

interface ColumnMeta {
  openDeleteModal: (backupId: string) => void;
  onViewDetails: (backup: HoldedContactsFavoriteBackup) => void;
  onToggleFavorite: (backup: HoldedContactsFavoriteBackup) => void;
  loadingBackupId: string | null;
  isDeletingBackup: boolean;
  isFavorite: (backupId: string) => boolean;
}

export const Columns: (
  meta: ColumnMeta
) => ColumnDef<HoldedContactsFavoriteBackup>[] = (meta) => {
  const t = useTranslations("Common.columns");

  return [
    ...CreateBaseColumns<HoldedContactsFavoriteBackup>(),
    {
      accessorKey: "originalType",
      header: t("originalType"),
      cell: ({ row }) => {
        const originalType: string = row.getValue("originalType");
        return <span>{originalType}</span>;
      },
    },
    {
      accessorKey: "dayOfMonth",
      header: t("dayOfMonth"),
      cell: ({ row }) => {
        const dayOfMonth: number | null = row.getValue("dayOfMonth");
        return <span>{dayOfMonth !== null ? dayOfMonth : "-"}</span>;
      },
    },
    {
      accessorKey: "month",
      header: t("month"),
      cell: ({ row }) => {
        const month: number | null = row.getValue("month");
        return <span>{month !== null ? month : "-"}</span>;
      },
    },
    {
      accessorKey: "year",
      header: t("year"),
      cell: ({ row }) => {
        const year: number | null = row.getValue("year");
        return <span>{year !== null ? year : "-"}</span>;
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
            loadingBackupId={meta.loadingBackupId}
            isFavorite={true}
            isTogglingFavorite={false}
          />
        );
      },
    },
  ];
};

export default Columns;
