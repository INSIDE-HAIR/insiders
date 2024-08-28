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
import "moment/locale/es";
import { DataTableColumnHeader } from "./components/DataTableColumnHeader";

const categoryNames: Record<FieldType, string> = {
  clientsFields: "Clientes",
  salesFields: "Ventas",
  consultingAndMentoringFields: "Consultoría y Mentoring",
  marketingFields: "Marketing",
  trainingsFields: "Formación",
  creativitiesFields: "Creatividad",
};

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
        enableSorting: true,
        enableHiding: true,
        meta: {
          filterType: "text",
        },
      },
      {
        accessorKey: "lastName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Apellido" />
        ),
        enableSorting: true,
        enableHiding: true,
        meta: {
          filterType: "text",
        },
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
        enableSorting: true,
        enableHiding: true,
        meta: {
          filterType: "text",
        },
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Rol" />
        ),
        enableSorting: true,
        enableHiding: true,
        meta: {
          filterType: "text",
        },
      },
      {
        accessorKey: "contactNumber",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Número de Contacto" />
        ),
        enableSorting: true,
        enableHiding: true,
        meta: {
          filterType: "text",
        },
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
        enableSorting: true,
        enableHiding: true,
        meta: {
          filterType: "date",
        },
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
        enableSorting: true,
        enableHiding: true,
        meta: {
          filterType: "date",
        },
      },
      {
        accessorKey: "holdedId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Holded ID" />
        ),
        enableSorting: true,
        enableHiding: true,
        meta: {
          filterType: "text",
        },
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
      const allFields = data.reduce((acc, user) => {
        if (Array.isArray(user[fieldType])) {
          return acc.concat(user[fieldType] || []);
        }
        return acc;
      }, [] as any[]);

      const uniqueFields = Array.from(
        new Set(
          allFields.map((field) => field?.holdedFieldName).filter(Boolean)
        )
      );

      uniqueFields.forEach((fieldName) => {
        const field = allFields.find((f) => f?.holdedFieldName === fieldName);
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
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title={field.es} />
            ),
            cell: ({ getValue }) => getValue() || "",
            enableSorting: true,
            enableHiding: true,
            meta: {
              category: categoryNames[fieldType],
              subCategory: field.subCategoryName,
              filterType: "text",
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
  }, [data]);
};
