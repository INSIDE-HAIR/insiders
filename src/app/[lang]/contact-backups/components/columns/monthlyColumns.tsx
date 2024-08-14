import { ColumnDef } from "@tanstack/react-table";
import { HoldedContactsMonthlyBackup } from "@prisma/client";
import { createBaseColumns } from "./columns";
import { BackupActions } from "../BackupActions";

// Define columns specifically for monthly backups
export const columns: ColumnDef<HoldedContactsMonthlyBackup>[] = [
  ...createBaseColumns<HoldedContactsMonthlyBackup>(), // Extend the base columns

  {
    accessorKey: "month",
    header: "Month",
    cell: ({ row }) => {
      const month: number = row.getValue("month");
      return <span>{month}</span>;
    },
  },
  {
    accessorKey: "year",
    header: "Year",
    cell: ({ row }) => {
      const year: number = row.getValue("year");
      return <span>{year}</span>;
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
