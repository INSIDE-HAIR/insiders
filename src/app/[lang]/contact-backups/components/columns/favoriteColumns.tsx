import { ColumnDef } from "@tanstack/react-table";
import { HoldedContactsFavoriteBackup } from "@prisma/client";
import { BackupActions } from "../BackupActions";
import { createBaseColumns } from "./columns";

// Define columns specifically for favorite backups
export const columns: ColumnDef<HoldedContactsFavoriteBackup>[] = [
  ...createBaseColumns<HoldedContactsFavoriteBackup>(), // Extend the base columns

  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name: string | null = row.getValue("name");
      return <span>{name || "Unnamed"}</span>;
    },
  },
  {
    accessorKey: "originalType",
    header: "Original Type",
    cell: ({ row }) => {
      const originalType: string = row.getValue("originalType");
      return <span>{originalType}</span>;
    },
  },
  {
    accessorKey: "dayOfMonth",
    header: "Day of Month",
    cell: ({ row }) => {
      const dayOfMonth: number | null = row.getValue("dayOfMonth");
      return <span>{dayOfMonth !== null ? dayOfMonth : "-"}</span>;
    },
  },
  {
    accessorKey: "month",
    header: "Month",
    cell: ({ row }) => {
      const month: number | null = row.getValue("month");
      return <span>{month !== null ? month : "-"}</span>;
    },
  },
  {
    accessorKey: "year",
    header: "Year",
    cell: ({ row }) => {
      const year: number | null = row.getValue("year");
      return <span>{year !== null ? year : "-"}</span>;
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
