// src/components/table/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { ServiceUser } from "@/src/app/(protected)/insiders/admin/users/lib/types/user";

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
