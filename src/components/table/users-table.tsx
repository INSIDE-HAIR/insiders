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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Pagination } from "@/src/components/table/pagination/pagination";

// Extend the User type to include HoldedData and CustomFields
type ExtendedUser = User & {
  holdedData?: HoldedData & {
    customFields: CustomField[];
  };
};

export default function UsersTable() {
  const pageSizeOptions = [1, 5, 10, 25, 50, 100, 500, 1000, 2000];
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = React.useState<ExtendedUser[]>([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(0);

  const [activeFields, setActiveFields] = React.useState({
    insidersFields: false,
    marketing: false,
    salesFields: false,
    clientFields: false,
    consultoriaMentoring: false,
    formaciones: false,
    creativities: false,
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await getUsers();
        if (users !== null) {
          setData(users as ExtendedUser[]);
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

  const createCustomColumns = React.useCallback(
    (
      fields: Field[],
      category: string,
      data: ExtendedUser[]
    ): ColumnDef<ExtendedUser>[] => {
      return fields.map((field) => ({
        accessorKey: `${category}.${field.es}`,
        header: ({ column }) => {
          if (field.type === "selection") {
            return (
              <CheckboxFilterHeader
                column={column}
                title={field.es}
                data={data}
                accessorKey={`${category}.${field.es}` as keyof ExtendedUser}
                options={field.options}
              />
            );
          } else if (field.type === "date") {
            return (
              <DateRangeFilterHeader
                column={column}
                title={field.es}
                onAddFilter={handleAddFilter}
              />
            );
          } else {
            return <TextFilterHeader column={column} title={field.es} />;
          }
        },
        cell: ({ row }: any) => {
          const customField = row.original.holdedData?.customFields?.find(
            (cf: { field: string }) => cf.field === field.es
          );
          return <div>{customField?.value || "N/A"}</div>;
        },
        filterFn: (row, columnId, filterValue) => {
          if (!Array.isArray(filterValue) || filterValue.length === 0)
            return true;
          const customField = row.original.holdedData?.customFields?.find(
            (cf: { field: string }) => cf.field === field.es
          );
          const rowValue = (customField?.value as string)?.toLowerCase() ?? "";
          return (filterValue as string[]).some((value) =>
            rowValue.includes(value.toLowerCase())
          );
        },
      }));
    },
    []
  );

  const columns = React.useMemo<ColumnDef<ExtendedUser>[]>(() => {
    const baseColumns: ColumnDef<ExtendedUser>[] = [
      // Your existing base columns
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
        header: ({ column }) => (
          <TextFilterHeader column={column} title="Holded ID" />
        ),
        cell: ({ row }) => (
          <div>{row.original.holdedData?.holdedId || "N/A"}</div>
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
    ];

    const customColumns = Object.entries(activeFields).flatMap(
      ([key, isActive]) =>
        isActive
          ? createCustomColumns(
              dataBaseTranslation
                .find((group) => group.id === key)
                ?.groups.flatMap((group) => group.fields) || [],
              key,
              data
            )
          : []
    );

    return [...baseColumns, ...customColumns];
  }, [activeFields, data, createCustomColumns]);
  
  const filteredData = React.useMemo(() => {
    if (!data || !columns) return [];
  
    const filteredModel = getFilteredRowModel({
      data,
      state: { columnFilters },
      columns,
    });
    
    return filteredModel.rows ? filteredModel.rows.map((row) => row.original) : [];
  }, [data, columnFilters, columns]);

  const paginatedData = React.useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, pageIndex, pageSize]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    pageCount: Math.ceil(filteredData.length / pageSize),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
  });

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

  const handleAddFilter = (
    id: string,
    value: { from?: number; to?: number }
  ) => {
    setColumnFilters((filters) => {
      const existingFilter = filters.find((filter) => filter.id === id);
      if (existingFilter) {
        const newValue = { ...(existingFilter.value as object), ...value };
        return filters.map((filter) =>
          filter.id === id ? { ...filter, value: newValue } : filter
        );
      } else {
        return [...filters, { id, value }];
      }
    });
  };

  const appliedFilters = columnFilters.map((filter) => ({
    id: filter.id,
    value: filter.value as string | string[] | { from?: number; to?: number },
  }));

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h2 className="text-sm font-medium">Filtros aplicados</h2>
        <FilterBadges filters={appliedFilters} onRemove={handleRemoveFilter} />
      </div>

      <div className="flex items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Grupos de Columnas <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {Object.keys(activeFields).map((key) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={activeFields[key as keyof typeof activeFields]}
                onCheckedChange={(value) =>
                  setActiveFields((prev) => ({
                    ...prev,
                    [key]: value,
                  }))
                }
              >
                {dataBaseTranslation.find((group) => group.id === key)?.es ||
                  key}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columnas Individuales <ChevronDownIcon className="ml-2 h-4 w-4" />
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="table-header py-2">
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
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {filteredData.length} fila(s) seleccionadas.
        </div>
        <Pagination
          table={table}
          pageIndex={pageIndex}
          pageCount={Math.ceil(filteredData.length / pageSize)}
          setPageIndex={setPageIndex}
        />
      </div>
      <div className="flex gap-2 items-center">
        <h2 className="text-sm text-slate-600">Mostrar en lista:</h2>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            const newPageSize = Number(value);
            setPageSize(newPageSize);
            setPageIndex(0); // Reset to first page
            table.setPageSize(newPageSize);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Usuarios por página" />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
