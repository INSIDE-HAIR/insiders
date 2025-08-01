"use client";
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
  RowSelectionState,
  Row,
  Table as TableType,
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
import { Button } from "@/src/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { FilterCollector } from "./FilterCollector";
import { AdvancedColumnFilter } from "./AdvancedColumnFilter";
import { DataTablePagination } from "./DataTablePagination";
import { GroupColumnSelector } from "./GroupColumnSelector";
import moment from "moment-timezone";
import { useTranslations } from "@/src/context/TranslationContext";
import { Value } from "@radix-ui/react-select";
import { string } from "zod";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
}

export function DataTable<TData>({
  columns: userColumns,
  data,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<{
    [key: string]: any[];
  }>({});
  const t = useTranslations("Common.dataTable"); // Usar el contexto de traducciones específico

  const columns = useMemo(() => {
    return userColumns.map((col) => ({
      ...col,
      filterFn: (row: Row<TData>, columnId: string, filterValue: any[]) => {
        const value = row.getValue(columnId);
        const filterType = (col.meta as any)?.filterType || "text";

        if (Array.isArray(filterValue) && filterValue.length > 0) {
          if (filterType === "date") {
            // Date filtering logic remains unchanged
          } else {
            return filterValue.some((filter) => {
              if (filter === "") {
                return value === "" || value === null || value === undefined;
              }
              return String(value)
                .toLowerCase()
                .includes(String(filter).toLowerCase());
            });
          }
        }
        return true;
      },
    }));
  }, [userColumns]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
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

  const handleExportCSV = useCallback(() => {
    // Obtener solo las columnas visibles, excluyendo la columna de selección
    const visibleColumns = table
      .getAllColumns()
      .filter((column) => column.id !== "select");

    const headers = visibleColumns.map((column) => {
      return typeof column.columnDef.header === "function"
        ? column.id
        : column.columnDef.header;
    });

    // Obtener solo las filas seleccionadas o, si no hay seleccionadas, las filas filtradas
    const rowsToExport = Object.keys(table.getSelectedRowModel().rows).length
      ? table.getSelectedRowModel().rows
      : table.getRowModel().rows;

    const csvData = rowsToExport.map((row) => {
      return visibleColumns
        .map((column) => {
          const cellValue = row.getValue(column.id);
          // Aseguramos que los valores que contienen comas se encierran entre comillas
          return `"${String(cellValue).replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csvString = [headers.join(","), ...csvData].join("\n");

    // Obtener la fecha actual en formato DD/MM/YYYY
    const todayDate = moment().tz("America/New_York").format("DD-MM-YYYY");

    // Crear un enlace temporal para descargar el archivo con la fecha incluida en el nombre
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `INSIDERS-${todayDate}.csv`; // Nombre del archivo con la fecha en formato DD-MM-YYYY
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [table]);

  const handleApplyFilter = useCallback(
    (columnId: string, filterValues: any[]) => {
      setAppliedFilters((prev) => {
        const newFilters = { ...prev };
        newFilters[columnId] = [...new Set(filterValues)]; // Elimina duplicados
        return newFilters;
      });
      table.getColumn(columnId)?.setFilterValue([...new Set(filterValues)]); // Elimina duplicados
    },
    [table]
  );

  const handleRemoveFilter = useCallback(
    (columnId: string, filterValue: any) => {
      setAppliedFilters((prev) => {
        const newFilters = { ...prev };
        newFilters[columnId] = newFilters[columnId].filter(
          (v) => v !== filterValue
        );
        if (newFilters[columnId].length === 0) {
          delete newFilters[columnId];
        }
        return newFilters;
      });
      table.getColumn(columnId)?.setFilterValue((old: any[]) => {
        const oldFilters = Array.isArray(old) ? old : [];
        return oldFilters.filter((v) => v !== filterValue);
      });
    },
    [table]
  );

  const columnInfo = useMemo(() => {
    return columns.map((col) => ({
      id: col.id as string,
      header:
        typeof col.header === "function"
          ? (col.id as string)
          : (col.header as string),
    }));
  }, [columns]);

  function getUniqueColumnValues<T>(
    table: TableType<T>,
    columnId: string
  ): any[] {
    const column = table.getColumn(columnId);
    if (!column) return [];

    const uniqueValues = new Set<any>();

    table.getFilteredRowModel().rows.forEach((row: any) => {
      const value = row.getValue(columnId);
      if (value !== undefined && value !== null) {
        uniqueValues.add(value);
      }
    });

    return Array.from(uniqueValues);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-x-2">
        <div className="flex space-x-2 items-center">
          <GroupColumnSelector table={table} />
          <Input
            placeholder={t("searchPlaceholder")}
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="max-w-sm"
          />
        </div>

        <Button onClick={handleExportCSV}>
          <DownloadIcon className="mr-2 h-4 w-4" />
          {t("exportCsv")}
        </Button>
      </div>

      <FilterCollector
        appliedFilters={appliedFilters}
        onRemoveFilter={handleRemoveFilter}
        columns={columnInfo}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div className="flex">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanFilter() && (
                          <AdvancedColumnFilter
                            column={header.column}
                            onApplyFilter={handleApplyFilter}
                            onRemoveFilter={handleRemoveFilter}
                            appliedFilters={
                              appliedFilters[header.column.id] || []
                            }
                            options={getUniqueColumnValues(
                              table,
                              header.column.id
                            )}
                          />
                        )}
                      </div>
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
                  {t("noResults")}
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
