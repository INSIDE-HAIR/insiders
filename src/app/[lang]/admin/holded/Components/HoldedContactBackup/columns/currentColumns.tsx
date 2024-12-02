"use client";
import { ColumnDef } from "@tanstack/react-table";
import { HoldedContactsCurrentBackup } from "@prisma/client";
import { CreateBaseColumns } from "./columns";
import { BackupActions } from "../actions/BackupActions";
import { useTranslations } from "@/src/context/TranslationContext";

interface ColumnMeta {
  openDeleteModal: (backupId: string) => void;
  onViewDetails?: (backup: HoldedContactsCurrentBackup) => void;
  onDelete?: (backup: HoldedContactsCurrentBackup) => void;
  onToggleFavorite?: (backup: HoldedContactsCurrentBackup) => void;
  loadingBackupId?: string | null;
}

export const Columns: (
  meta: ColumnMeta
) => ColumnDef<HoldedContactsCurrentBackup>[] = (meta) => {
  const t = useTranslations("Common.columns");

  return [
    ...CreateBaseColumns<HoldedContactsCurrentBackup>(),
    {
      id: "actions",
      header: t("actions"),
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
