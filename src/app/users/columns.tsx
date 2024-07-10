// src/app/users/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "./lib/types/user";
import { DataTableColumnHeader } from "./components/DataTableColumnHeader";

export const columns: ColumnDef<User>[] = [
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
  {
    accessorKey: "customFields.CLIENTES - Estado del Cliente",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client Status" />
    ),
  },
  // Add more columns as needed
];
