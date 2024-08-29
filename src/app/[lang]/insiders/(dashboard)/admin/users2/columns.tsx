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
import { useTranslations } from "@/src/context/TranslationContext";

export const useColumns = (data: ServiceUser[]): ColumnDef<ServiceUser>[] => {
  const t = useTranslations("fields");
  const c = useTranslations("Common.columns");

  const categoryNames: Record<FieldType, string> = {
    clientsFields: t("clientsFields.title"),
    salesFields: t("salesFields.title"),
    consultingAndMentoringFields: t("consultingAndMentoringFields.title"),
    marketingFields: t("marketingFields.title"),
    trainingsFields: t("trainingsFields.title"),
    creativitiesFields: t("creativitiesFields.title"),
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
          <DataTableColumnHeader column={column} title={c("name")} />
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
          <DataTableColumnHeader column={column} title={c("lastName")} />
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
          <DataTableColumnHeader column={column} title={c("email")} />
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
          <DataTableColumnHeader column={column} title={c("role")} />
        ),
        enableSorting: true,
        enableHiding: true,
        meta: {
          filterType: "selection",
        },
      },
      {
        accessorKey: "contactNumber",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={c("contactNumber")} />
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
          <DataTableColumnHeader column={column} title={c("lastLogin")} />
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
          <DataTableColumnHeader
            column={column}
            title={c("lastHoldedSyncAt")}
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
        accessorKey: "holdedId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={c("holdedId")} />
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
      const allFields: any[] = [];
      for (let i = 0; i < data.length; i++) {
        const user = data[i];
        if (
          user &&
          typeof user === "object" &&
          Array.isArray(user[fieldType])
        ) {
          allFields.push(...user[fieldType]);
        }
      }

      const uniqueFieldNames = new Set<string>();
      allFields.forEach((field) => {
        if (
          field &&
          typeof field === "object" &&
          typeof field.holdedFieldName === "string"
        ) {
          uniqueFieldNames.add(field.holdedFieldName);
        }
      });

      uniqueFieldNames.forEach((fieldName) => {
        const field = allFields.find(
          (f) => f && f.holdedFieldName === fieldName
        );
        if (field) {
          dynamicColumns.push({
            id: `${fieldType}_${fieldName}`,
            accessorFn: (row: ServiceUser) => {
              const fields = row[fieldType];
              if (Array.isArray(fields)) {
                const field = fields.find(
                  (f) => f && f.holdedFieldName === fieldName
                );
                return field && field.value ? field.value : "";
              }
              return "";
            },
            header: ({ column }) => (
              <DataTableColumnHeader
                column={column}
                title={
                  t(
                    `${fieldType}.groups.${field.subCategoryId}.fields.${fieldName}.title`
                  ) || `${fieldName} 2`
                }
              />
            ),
            cell: ({ getValue }) => getValue() || "",
            enableSorting: true,
            enableHiding: true,
            meta: {
              categoryId: field.categoryId || fieldType,
              subCategoryId: field.subCategoryId || "Otros",
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
};
