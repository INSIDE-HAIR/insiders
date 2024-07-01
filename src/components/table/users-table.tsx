"use client";
import * as React from "react";
import { ChevronDownIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/src/components/ui/buttons/chadcn-button";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import Link from "next/link";
import { getUsers } from "@/prisma/query/user";
import { User, HoldedData, CustomField } from "@prisma/client";
import { Field, dataBaseTranslation } from "@/db/constants";
import TextFilterHeader from "@/src/components/table/filters/text-filter-header";
import CheckboxFilterHeader from "@/src/components/table/filters/checkbox-filter-header";
import DateRangeFilterHeader from "@/src/components/table/filters/date-range-filter-header";
import FilterBadges from "@/src/components/table/filters/filter-badges";

type ExtendedUser = User & {
  holdedData?: HoldedData & {
    customFields: CustomField[];
  };
};

export default function UsersTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = React.useState<ExtendedUser[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await getUsers();
        if (users !== null) {
          setData(users as unknown as ExtendedUser[]);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setData([]);
      }
    };
    fetchData();
  }, []);

  const handleRemoveFilter = (
    id: string,
    value?: string | { from?: number; to?: number }
  ) => {
    setColumnFilters((filters) => {
      if (value) {
        if (typeof value === "object") {
          return filters
            .map((filter) => {
              if (filter.id === id) {
                const newValue = { ...(filter.value as object) };
                if (value.from) delete (newValue as { from?: number }).from;
                if (value.to) delete (newValue as { to?: number }).to;
                return {
                  ...filter,
                  value:
                    Object.keys(newValue).length === 0 ? undefined : newValue,
                };
              }
              return filter;
            })
            .filter((filter) => filter.value !== undefined);
        } else {
          return filters
            .map((filter) => {
              if (filter.id === id && Array.isArray(filter.value)) {
                return {
                  ...filter,
                  value: (filter.value as string[]).filter(
                    (v: string) => v !== value
                  ),
                };
              }
              return filter;
            })
            .filter((filter) => (filter.value as string[]).length !== 0);
        }
      }
      return filters.filter((filter) => filter.id !== id);
    });
  };


  const createCustomColumns = (
    fields: Record<string, Field>,
    category: string
  ): ColumnDef<ExtendedUser>[] => {
    return Object.entries(fields || {}).map(([key, field]) => ({
      accessorKey: `customFields.${key}`,
      header: ({ column }) => (
        <TextFilterHeader column={column} title={field.es} />
      ),
      cell: ({ row }: any) => {
        const customField = row.original.holdedData?.customFields?.find(
          (cf: { field: string }) => cf.field === key
        ) ?? { value: "N/A" };
        return <div>{customField.value || "N/A"}</div>;
      },
      filterFn:
        field.type === "selection"
          ? (row, columnId, filterValue) => {
              if (!Array.isArray(filterValue) || filterValue.length === 0)
                return true;
              const rowValue =
                (row.getValue(columnId) as string)?.toLowerCase() ?? "";
              return (filterValue as string[]).some((value) =>
                rowValue.includes(value.toLowerCase())
              );
            }
          : undefined,
    }));
  };

  const columns: ColumnDef<ExtendedUser>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: any }) => (
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
      accessorKey: "holdedId",
      header: "Holded ID",
      cell: ({ row }) => (
        <div>{row.original.holdedData?.holdedId || "N/A"}</div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <TextFilterHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("email")}</div>
      ),
      filterFn: (row, columnId, filterValue) => {
        if (!Array.isArray(filterValue) || filterValue.length === 0)
          return true;
        const rowValue =
          (row.getValue(columnId) as string)?.toLowerCase() ?? "";
        return (filterValue as string[]).some((value) =>
          rowValue.includes(value.toLowerCase())
        );
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <TextFilterHeader column={column} title="Nombre" />
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("name")}</div>
      ),
      filterFn: (row, columnId, filterValue) => {
        if (!Array.isArray(filterValue) || filterValue.length === 0)
          return true;
        const rowValue =
          (row.getValue(columnId) as string)?.toLowerCase() ?? "";
        return (filterValue as string[]).some((value) =>
          rowValue.includes(value.toLowerCase())
        );
      },
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <TextFilterHeader column={column} title="Apellido" />
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("lastName")}</div>
      ),
      filterFn: (row, columnId, filterValue) => {
        if (!Array.isArray(filterValue) || filterValue.length === 0)
          return true;
        const rowValue =
          (row.getValue(columnId) as string)?.toLowerCase() ?? "";
        return (filterValue as string[]).some((value) =>
          rowValue.includes(value.toLowerCase())
        );
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <CheckboxFilterHeader
          column={column}
          title="Rol"
          data={data}
          accessorKey="role"
        />
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("role")}</div>
      ),
      filterFn: (row, columnId, filterValue) => {
        if (!Array.isArray(filterValue) || filterValue.length === 0) {
          return true;
        }
        const rowValue =
          (row.getValue(columnId) as string)?.toLowerCase() ?? "";
        return (filterValue as string[])
          .map((val) => val.toLowerCase())
          .includes(rowValue);
      },
    },
    ...createCustomColumns(dataBaseTranslation.clientFields, "clientFields"),
    ...createCustomColumns(
      dataBaseTranslation.servicesFields.consultoriaMentoring,
      "consultoriaMentoring"
    ),
    ...createCustomColumns(
      dataBaseTranslation.servicesFields.formaciones,
      "formaciones"
    ),
    ...createCustomColumns(
      dataBaseTranslation.servicesFields.creativities,
      "creativities"
    ),
    {
      accessorKey: "lastLogin",
      header: ({ column }) => (
        <DateRangeFilterHeader column={column} title="Última conexión" />
      ),
      cell: ({ row }) =>
        new Date(row.getValue("lastLogin")).toLocaleDateString(),
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const rowValue = new Date(row.getValue(columnId)).getTime();
        const { from, to } = filterValue as { from?: number; to?: number };
        if (from && to) {
          return rowValue >= from && rowValue <= to;
        } else if (from) {
          return rowValue >= from;
        } else if (to) {
          return rowValue <= to;
        }
        return true;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DateRangeFilterHeader column={column} title="Fecha de Creación" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const rowValue = new Date(row.getValue(columnId)).getTime();
        const { from, to } = filterValue as { from?: number; to?: number };
        if (from && to) {
          return rowValue >= from && rowValue <= to;
        } else if (from) {
          return rowValue >= from;
        } else if (to) {
          return rowValue <= to;
        }
        return true;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.id)}
              >
                Copiar ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.email)}
              >
                Copiar Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link href={`/insiders/admin/users/${user.email}`}>
                <DropdownMenuItem>Ver o Editar</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const appliedFilters = columnFilters.map((filter) => ({
    id: filter.id,
    value: filter.value as string | string[] | { from?: number; to?: number },
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columnas <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Filtros aplicados</h2>
        <FilterBadges filters={appliedFilters} onRemove={handleRemoveFilter} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="table-header">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
