import { ColumnDef } from "@tanstack/react-table";
import { HoldedContactsDailyBackup } from "@prisma/client";
import { createBaseColumns } from "./columns";
import { BackupActions } from "../BackupActions";

// Define columns specifically for daily backups
export const columns: ColumnDef<HoldedContactsDailyBackup>[] = [
  ...createBaseColumns<HoldedContactsDailyBackup>(), // Extend the base columns

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
      return <BackupActions backup={backup} />;
    },
  },
];

export default columns;
