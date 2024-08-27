"use client";
import { ColumnDef } from "@tanstack/react-table";
import { HoldedContactsCurrentBackup } from "@prisma/client";
import { CreateBaseColumns } from "./columns";
import { useTranslations } from "@/src/context/TranslationContext";
import { ContactActions } from "../actions/contactActions";

interface ColumnMeta {
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
          <ContactActions
            backup={backup}
            loadingBackupId={meta.loadingBackupId}
          />
        );
      },
    },
  ];
};

export default Columns;
