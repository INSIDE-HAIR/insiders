"use client";
import { ColumnDef } from "@tanstack/react-table";
import { HoldedContactsCurrentBackup } from "@prisma/client";
import { CreateBaseColumns } from "./columns";
import { ContactActions } from "../actions/contactActions";

interface ColumnMeta {
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
