// src/components/table/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ServiceUser } from "@/src/app/users/lib/types/user";
import { DataTableColumnHeader } from "./data-table-column-header";

export const columns: ColumnDef<ServiceUser>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  // Añade más columnas según sea necesario
];
