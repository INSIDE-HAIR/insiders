import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenu,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { User } from "@/src/lib/types/user";
import { dataBaseTranslation } from "@/db/constants";
import { DataTableColumnHeader } from "./DataTableColumnHeader";

// Función auxiliar para obtener todas las columnas de dataBaseTranslation
const getAllColumns = (): ColumnDef<User>[] => {
  const columns: ColumnDef<User>[] = [];
  dataBaseTranslation.forEach((group) => {
    group.groups.forEach((subGroup) => {
      subGroup.fields.forEach((field) => {
        columns.push({
          accessorKey: field.holdedFieldName,
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={field.es} />
          ),
          meta: {
            group: group.id,
            subGroup: subGroup.id,
          },
        });
      });
    });
  });
  return columns;
};

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  ...getAllColumns(),
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copiar ID de usuario
            </DropdownMenuItem>
            <DropdownMenuItem>Ver detalles del usuario</DropdownMenuItem>
            <DropdownMenuItem>Ver campos del usuario</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
