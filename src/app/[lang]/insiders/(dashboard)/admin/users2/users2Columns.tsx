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
import { useTranslations } from "@/src/context/TranslationContext";
import { dataBaseTranslation } from "@/db/constants";
import { format, isValid } from "date-fns";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/src/components/ui/tooltip";

interface Users2Data {
  id: string;
  name: string;
  tradeName: string;
  code: string;
  email: string;
  mobile: number;
  type: string;
  customFields: { [key: string]: string };
  [key: string]: any;
}

export const useUsers2Columns = (
  data: Users2Data[]
): ColumnDef<Users2Data>[] => {
  const t = useTranslations("fields");
  const c = useTranslations("Common.columns");

  const getFieldType = (
    fieldName: string
  ): "text" | "date" | "selection" | "number" => {
    for (const group of dataBaseTranslation) {
      for (const subGroup of group.groups) {
        const field = subGroup.fields.find(
          (f) => f.holdedFieldName === fieldName
        );
        if (field) {
          return field.type as "text" | "date" | "selection" | "number";
        }
      }
    }
    return "text";
  };

  const renderCellValue = (
    value: string,
    type: "text" | "date" | "number" | "selection"
  ) => {
    if (!value) return "";

    switch (type) {
      case "date":
        const date = new Date(value);
        return isValid(date) ? format(date, "dd/MM/yyyy") : value;
      case "number":
        const num = parseFloat(value);
        return isNaN(num) ? value : num.toLocaleString();
      case "selection":
      case "text":
      default:
        return value;
    }
  };

  return useMemo(() => {
    if (!data || data.length === 0) return [];

    const baseColumns: ColumnDef<Users2Data>[] = [
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
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ row }) => {
          const id: string = row.getValue("id");
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-mono text-sm cursor-pointer">
                    {id && id.slice(0, 8)}...
                  </span>
                </TooltipTrigger>
                <TooltipContent>{id}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
        enableSorting: true,
        enableHiding: true,
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
        accessorKey: "tradeName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={c("tradeName")} />
        ),
        enableSorting: true,
        enableHiding: true,
        meta: {
          filterType: "text",
        },
      },
      {
        accessorKey: "code",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={c("code")} />
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
        accessorKey: "mobile",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={c("mobile")} />
        ),
        enableSorting: true,
        enableHiding: true,
        meta: {
          filterType: "text",
        },
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={c("type")} />
        ),
        enableSorting: true,
        enableHiding: true,
        meta: {
          filterType: "selection",
        },
      },
    ];

    const dynamicColumns: ColumnDef<Users2Data>[] = dataBaseTranslation.flatMap(
      (group) =>
        group.groups.flatMap((subGroup) =>
          subGroup.fields.map((field) => ({
            accessorKey: `customFields.${field.holdedFieldName}`,
            header: ({ column }) => (
              <DataTableColumnHeader
                column={column}
                title={
                  t(
                    `${group.id}.groups.${subGroup.id}.fields.${field.holdedFieldName}.title`
                  ) || field.holdedFieldName
                }
              />
            ),
            cell: ({ row }) => {
              const value = row.original.customFields[field.holdedFieldName];
              const fieldType = getFieldType(field.holdedFieldName);
              return renderCellValue(value, fieldType);
            },
            enableSorting: true,
            enableHiding: true,
            meta: {
              categoryId: group.id,
              subCategoryId: subGroup.id,
              filterType: getFieldType(field.holdedFieldName),
            },
          }))
        )
    );

    const actionsColumn: ColumnDef<Users2Data> = {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.id)}
              >
                Copy user ID
              </DropdownMenuItem>
              <DropdownMenuItem>View user details</DropdownMenuItem>
              <DropdownMenuItem>View user fields</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    };

    return [...baseColumns, ...dynamicColumns, actionsColumn];
  }, [data, t, c]);
};
