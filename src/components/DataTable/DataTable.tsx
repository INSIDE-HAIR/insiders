// src/components/table/DataTable.tsx
import React, { useState, useMemo, useCallback } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Input } from "@/src/components/ui/input";
import { DataTablePagination } from "./DataTablePagination";
import { GroupColumnSelector } from "./GroupColumnSelector";
import { getFieldNames } from "@/db/constants";
import { Badge } from "@/src/components/ui/badge";
import { DataTableColumnHeader } from "./DataTableColumnHeader";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns: userColumns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const allFields = useMemo(
    () => [
      ...getFieldNames("salesFields"),
      ...getFieldNames("clientsFields"),
      ...getFieldNames("consultingAndMentoringFields"),
      ...getFieldNames("trainingsFields"),
      ...getFieldNames("marketingFields"),
      ...getFieldNames("creativitiesFields"),
    ],
    []
  );

  const handleRemoveFilter = useCallback(
    (columnId: string, valueToRemove: string) => {
      setColumnFilters((prev) =>
        prev
          .map((filter) => {
            if (filter.id === columnId) {
              return {
                ...filter,
                value: (filter.value as string[]).filter(
                  (value) => value !== valueToRemove
                ),
              };
            }
            return filter;
          })
          .filter((filter) => (filter.value as string[]).length > 0)
      );
    },
    []
  );

  const [activeFields, setActiveFields] = useState<Record<string, boolean>>(
    () => Object.fromEntries(allFields.map((field) => [field, false]))
  );

  const columns = useMemo(() => {
    return userColumns
      .map((col) => ({
        ...col,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={col.header as string}
            onRemoveFilter={handleRemoveFilter}
            setColumnVisibility={function (
              columnId: string,
              visible: boolean
            ): void {
              throw new Error("Function not implemented.");
            }}
          />
        ),
        filterFn: (
          row: { getValue: (arg0: any) => any },
          columnId: any,
          filterValue: string[]
        ) => {
          if (!Array.isArray(filterValue) || filterValue.length === 0)
            return true;
          const cellValue = row.getValue(columnId);
          if (cellValue == null) return false;
          const cellValueString = String(cellValue).toLowerCase();
          return filterValue.some((filter) =>
            cellValueString.includes(filter.toLowerCase())
          );
        },
      }))
      .filter((column) => {
        const meta = column.meta as { group?: string } | undefined;
        return !meta?.group || activeFields[meta.group];
      });
  }, [userColumns, activeFields, handleRemoveFilter]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // ... resto del componente (renderizado, etc.)

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Buscar en todas las columnas..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="max-w-sm"
        />
        <GroupColumnSelector
          activeFields={activeFields}
          setActiveFields={setActiveFields}
          setColumnVisibility={setColumnVisibility}
        />
      </div>

      {columnFilters.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Filtros aplicados:</h3>
          <div className="flex flex-wrap gap-2">
            {columnFilters.flatMap((filter) =>
              Array.isArray(filter.value)
                ? filter.value.map((value) => (
                    <Badge
                      key={`${filter.id}-${value}`}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <span>
                        {filter.id}: {value}
                      </span>
                      <button
                        onClick={() => handleRemoveFilter(filter.id, value)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))
                : []
            )}
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
