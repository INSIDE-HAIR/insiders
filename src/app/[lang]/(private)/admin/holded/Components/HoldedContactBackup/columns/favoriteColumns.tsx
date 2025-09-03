"use client";
import { ColumnDef } from "@tanstack/react-table";
import { HoldedContactsFavoriteBackup } from "@prisma/client";
import { BackupActions } from "../actions/BackupActions";
import { CreateBaseColumns } from "./columns";
interface ColumnMeta {
  openDeleteModal: (backupId: string) => void;
  onViewDetails: (backup: HoldedContactsFavoriteBackup) => void;
  onToggleFavorite: (backup: HoldedContactsFavoriteBackup) => void;
  loadingBackupId: string | null;
  isDeletingBackup: boolean;
  isFavorite: (backupId: string) => boolean;
  originalTypeHeader?: string;
  dayOfMonthHeader?: string;
  monthHeader?: string;
  yearHeader?: string;
  actionsHeader?: string;
}

export const Columns: (
  meta: ColumnMeta
) => ColumnDef<HoldedContactsFavoriteBackup>[] = (meta) => {
  return [
    ...CreateBaseColumns<HoldedContactsFavoriteBackup>(),
    {
      accessorKey: "originalType",
      header: meta.originalTypeHeader || "Original Type",
      cell: ({ row }) => {
        const originalType: string = row.getValue("originalType");
        return <span>{originalType}</span>;
      },
    },
    {
      accessorKey: "dayOfMonth",
      header: meta.dayOfMonthHeader || "Day of Month",
      cell: ({ row }) => {
        const dayOfMonth: number | null = row.getValue("dayOfMonth");
        return <span>{dayOfMonth !== null ? dayOfMonth : "-"}</span>;
      },
    },
    {
      accessorKey: "month",
      header: meta.monthHeader || "Month",
      cell: ({ row }) => {
        const month: number | null = row.getValue("month");
        return <span>{month !== null ? month : "-"}</span>;
      },
    },
    {
      accessorKey: "year",
      header: meta.yearHeader || "Year",
      cell: ({ row }) => {
        const year: number | null = row.getValue("year");
        return <span>{year !== null ? year : "-"}</span>;
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
