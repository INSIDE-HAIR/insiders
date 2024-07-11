import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Button } from "@/src/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "./components/DataTableColumnHeader";
import { ServiceUser } from "./lib/types/user";

export const useColumns = (data: ServiceUser[]): ColumnDef<ServiceUser>[] => {
  return useMemo(() => {
    if (!data || data.length === 0) return [];

    const baseColumns: ColumnDef<ServiceUser>[] = [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
    ];

    const fieldTypes = [
      "clientsFields",
      "salesFields",
      "consultingAndMentoringFields",
      "marketingFields",
      "trainingsFields",
      "creativitiesFields",
    ];

    const dynamicColumns: ColumnDef<ServiceUser>[] = [];

    fieldTypes.forEach((fieldType) => {
      const allFields = data.flatMap(
        (user) => user[fieldType as keyof ServiceUser] || []
      );
      const uniqueFields = Array.from(
        new Set(allFields.map((field) => field.es))
      );

      uniqueFields.forEach((fieldName) => {
        dynamicColumns.push({
          id: `${fieldType}_${fieldName}`,
          accessorFn: (row: ServiceUser) => {
            const fields = row[fieldType as keyof ServiceUser];
            if (Array.isArray(fields)) {
              const field = fields.find((f) => f.es === fieldName);
              return field ? field.value : "";
            }
            return "";
          },
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={fieldName} />
          ),
          cell: ({ getValue }) => getValue() || "",
        });
      });
    });

    const actionsColumn: ColumnDef<ServiceUser> = {
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
    };

    return [...baseColumns, ...dynamicColumns, actionsColumn];
  }, [data]);
};
