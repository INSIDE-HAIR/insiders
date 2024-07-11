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
import { ServiceUser, FieldType } from "./lib/types/user";
import moment from "moment-timezone";
import "moment/locale/es"; // Importar el idioma español
import { DataTableColumnHeader } from "./components/DataTableColumnHeader";

export const useColumns = (data: ServiceUser[]): ColumnDef<ServiceUser>[] => {
  const categoryNames: Record<FieldType, string> = {
    clientsFields: "Clientes",
    salesFields: "Ventas",
    consultingAndMentoringFields: "Consultoría y Mentoring",
    marketingFields: "Marketing",
    trainingsFields: "Formación",
    creativitiesFields: "Creatividad",
  };

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
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "lastName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Apellido" />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Rol" />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "contactNumber",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Número de Contacto" />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "lastLogin",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Último Inicio de Sesión"
          />
        ),
        cell: ({ getValue }) => {
          const value = getValue() as Date;
          return value ? moment(value).format("DD/MM/YYYY - HH:mm") : "";
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "lastHoldedSyncAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Última Sync Holded" />
        ),
        cell: ({ getValue }) => {
          const value = getValue() as Date;
          return value ? moment(value).format("DD/MM/YYYY - HH:mm") : "";
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "holdedId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Holded ID" />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ];

    const fieldTypes: FieldType[] = [
      "clientsFields",
      "salesFields",
      "consultingAndMentoringFields",
      "marketingFields",
      "trainingsFields",
      "creativitiesFields",
    ];

    const dynamicColumns: ColumnDef<ServiceUser>[] = [];

    fieldTypes.forEach((fieldType) => {
      const allFields = data.flatMap((user) => user[fieldType] || []);
      const uniqueFields = Array.from(
        new Set(allFields.map((field) => field.holdedFieldName))
      );

      uniqueFields.forEach((fieldName) => {
        const field = allFields.find((f) => f.holdedFieldName === fieldName);
        if (field) {
          dynamicColumns.push({
            id: `${fieldType}_${fieldName}`,
            accessorFn: (row: ServiceUser) => {
              const fields = row[fieldType];
              if (Array.isArray(fields)) {
                const field = fields.find(
                  (f) => f.holdedFieldName === fieldName
                );
                return field ? field.value : "";
              }
              return "";
            },
            header: field.es,
            cell: ({ getValue }) => getValue() || "",
            meta: {
              category: categoryNames[fieldType],
              subCategory: field.subCategoryName,
            },
          });
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
};
