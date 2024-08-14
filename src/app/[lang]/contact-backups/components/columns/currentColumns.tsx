import { ColumnDef } from "@tanstack/react-table";
import { HoldedContactsCurrentBackup } from "@prisma/client";
import { createBaseColumns } from "./columns";
import { BackupActions } from "../BackupActions";

// Define columns specifically for current backups
export const columns: ColumnDef<HoldedContactsCurrentBackup>[] = [
  ...createBaseColumns<HoldedContactsCurrentBackup>(), // Extend the base columns

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const backup = row.original;
      return <BackupActions backup={backup} />;
    },
  },
];

export default columns;
