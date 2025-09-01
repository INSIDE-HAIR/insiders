/**
 * DataTable - Organism Component
 * 
 * Tabla de datos usando Table de shadcn con funcionalidades avanzadas
 * Migrado desde el componente original manteniendo estética IDÉNTICA
 */

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
import { Skeleton } from "@/src/components/ui/skeleton";
import { Checkbox } from "@/src/components/ui/checkbox";
import { 
  ArrowDownTrayIcon,
  UserPlusIcon,
  VideoCameraIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import moment from "moment-timezone";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
// import { AdvancedColumnFilter } from "../../AdvancedColumnFilter"; // Original version with different interface
// Temporarily disable advanced column filter until interface is fixed
import { BulkActionsBar } from "../bars/BulkActionsBar";
import { SelectionIndicator } from "../../atoms/indicators/SelectionIndicator";
import { cn } from "@/src/lib/utils";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  onRowClick?: (item: TData) => void;
  onBulkAddParticipants?: (selectedEvents: TData[]) => void;
  onBulkGenerateMeetLinks?: (selectedEvents: TData[]) => void;
  onBulkGenerateDescriptions?: (selectedEvents: TData[]) => void;
  onBulkMoveCalendar?: (selectedEvents: TData[]) => void;
  onBulkUpdateDateTime?: (selectedEvents: TData[]) => void;
  onBulkDelete?: (selectedEvents: TData[]) => void;
  calendars?: Array<{
    id: string;
    summary: string;
    colorId?: string;
    backgroundColor?: string;
    foregroundColor?: string;
  }>;
  className?: string;
  isLoading?: boolean;
  pageSize?: number;
  enableSelection?: boolean;
  enableFiltering?: boolean;
  enableSorting?: boolean;
  enablePagination?: boolean;
}

export function DataTable<TData>({
  columns: userColumns,
  data,
  onRowClick,
  onBulkAddParticipants,
  onBulkGenerateMeetLinks,
  onBulkGenerateDescriptions,
  onBulkMoveCalendar,
  onBulkUpdateDateTime,
  onBulkDelete,
  calendars = [],
  className,
  isLoading = false,
  pageSize = 50,
  enableSelection = true,
  enableFiltering = true,
  enableSorting = true,
  enablePagination = true,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<{
    [key: string]: any[];
  }>({});

  const columns = useMemo(() => {
    const processedColumns = userColumns.map((col, index) => ({
      ...col,
      id: col.id || `column-${index}`,
      filterFn: (row: Row<TData>, columnId: string, filterValue: any[]) => {
        const value = row.getValue(columnId);

        if (Array.isArray(filterValue) && filterValue.length > 0) {
          return filterValue.some((filter) => {
            if (filter === "") {
              return value === "" || value === null || value === undefined;
            }
            return String(value)
              .toLowerCase()
              .includes(String(filter).toLowerCase());
          });
        }
        return true;
      },
    }));

    if (!enableSelection) {
      return processedColumns;
    }

    const selectColumn: ColumnDef<TData> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(checked) => {
            table.toggleAllPageRowsSelected(!!checked);
          }}
          aria-label="Select all"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => {
            row.toggleSelected(!!checked);
          }}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [selectColumn, ...processedColumns];
  }, [userColumns, enableSelection]);

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
    enableRowSelection: enableSelection,
    enableSorting,
    enableColumnFilters: enableFiltering,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : getCoreRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const handleExportCSV = useCallback(() => {
    const visibleColumns = table
      .getAllColumns()
      .filter((column) => column.id !== "select");

    const headers = visibleColumns.map((column) => {
      return typeof column.columnDef.header === "function"
        ? column.id
        : column.columnDef.header;
    });

    const rowsToExport = Object.keys(table.getSelectedRowModel().rows).length
      ? table.getSelectedRowModel().rows
      : table.getRowModel().rows;

    const csvData = rowsToExport.map((row) => {
      return visibleColumns
        .map((column) => {
          const cellValue = row.getValue(column.id);
          return `"${String(cellValue).replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csvString = [headers.join(","), ...csvData].join("\n");
    const todayDate = moment().tz("Europe/Madrid").format("DD-MM-YYYY");

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calendar-events-${todayDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [table]);

  const handleApplyFilter = useCallback(
    (columnId: string, filterValues: any[]) => {
      setAppliedFilters((prev) => {
        const newFilters = { ...prev };
        newFilters[columnId] = [...new Set(filterValues)];
        return newFilters;
      });
      table.getColumn(columnId)?.setFilterValue([...new Set(filterValues)]);
    },
    [table]
  );

  const handleRemoveFilter = useCallback(
    (columnId: string, filterValue: any) => {
      setAppliedFilters((prev) => {
        const newFilters = { ...prev };
        newFilters[columnId] = (newFilters[columnId] || []).filter(
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

  const getUniqueColumnValues = useCallback(
    (columnId: string): any[] => {
      const column = table.getColumn(columnId);
      if (!column) return [];

      const uniqueValues = new Set<any>();

      // Para la columna de attendees, extraer emails individuales
      if (columnId === "attendees") {
        table.getFilteredRowModel().rows.forEach((row: any) => {
          const attendees = row.getValue(columnId) || [];
          attendees.forEach((attendee: any) => {
            if (attendee.email) {
              uniqueValues.add(attendee.email);
            }
            if (attendee.displayName) {
              uniqueValues.add(attendee.displayName);
            }
          });
        });
      } else {
        table.getFilteredRowModel().rows.forEach((row: any) => {
          const value = row.getValue(columnId);
          if (value !== undefined && value !== null) {
            uniqueValues.add(value);
          }
        });
      }

      return Array.from(uniqueValues);
    },
    [table]
  );

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;

  // Helper para verificar si un evento tiene Google Meet
  const hasGoogleMeet = (event: any) => {
    return !!(event.hangoutLink || event.conferenceData);
  };

  // Filtrar eventos seleccionados sin Google Meet
  const selectedEventsWithoutMeet = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original)
    .filter((event) => !hasGoogleMeet(event));

  // Helper para obtener el color del calendario
  const getCalendarColor = (item: TData) => {
    const calendarId = (item as any).calendarId;
    if (!calendarId) return { backgroundColor: "#4285f4" };

    const calendar = calendars.find((cal) => cal.id === calendarId);
    return {
      backgroundColor: calendar?.backgroundColor || "#4285f4",
      foregroundColor: calendar?.foregroundColor || "#ffffff",
    };
  };

  // Loading state
  if (isLoading) {
    return <DataTableSkeleton className={className} />;
  }

  return (
    <div className={cn("space-y-4 w-full max-w-full overflow-hidden", className)}>
      {/* Selection Indicator */}
      {enableSelection && (
        <SelectionIndicator
          selectedEvents={
            table
              .getFilteredSelectedRowModel()
              .rows.map((row) => row.original) as GoogleCalendarEvent[]
          }
          onClearSelection={() => table.toggleAllPageRowsSelected(false)}
        />
      )}

      {/* Enhanced Bulk Actions Bar */}
      {enableSelection && (
        <BulkActionsBar
          selectedCount={selectedRowsCount}
          eventsWithoutMeet={selectedEventsWithoutMeet.length}
          onBulkAddParticipants={() =>
            onBulkAddParticipants?.(
              table.getFilteredSelectedRowModel().rows.map((row) => row.original)
            )
          }
          onBulkGenerateMeetLinks={() =>
            onBulkGenerateMeetLinks?.(selectedEventsWithoutMeet)
          }
          onBulkGenerateDescriptions={() =>
            onBulkGenerateDescriptions?.(
              table.getFilteredSelectedRowModel().rows.map((row) => row.original)
            )
          }
          onBulkMoveCalendar={() =>
            onBulkMoveCalendar?.(
              table.getFilteredSelectedRowModel().rows.map((row) => row.original)
            )
          }
          onBulkUpdateDateTime={() =>
            onBulkUpdateDateTime?.(
              table.getFilteredSelectedRowModel().rows.map((row) => row.original)
            )
          }
          onBulkDelete={() =>
            onBulkDelete?.(
              table.getFilteredSelectedRowModel().rows.map((row) => row.original)
            )
          }
          onDeselectAll={() => table.toggleAllPageRowsSelected(false)}
        />
      )}

      {/* Global Search */}
      {enableFiltering && (
        <div className="flex items-center py-4">
          <Input
            placeholder="Buscar eventos..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="max-w-sm"
          />
          <div className="ml-auto flex items-center space-x-2">
            {!enableSelection && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
              >
                <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Advanced Filters - Temporarily disabled due to interface mismatch */}
      {enableFiltering && false && (
        // <AdvancedColumnFilter
        //   table={table}
        //   appliedFilters={appliedFilters}
        //   onApplyFilter={handleApplyFilter}
        //   onRemoveFilter={handleRemoveFilter}
        //   getUniqueColumnValues={getUniqueColumnValues}
        // />
        <div className="text-sm text-muted-foreground p-2">
          Advanced filters temporarily disabled
        </div>
      )}

      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                      key={header.id}
                      className={cn(
                        "text-left font-medium",
                        header.column.getCanSort() && "cursor-pointer select-none hover:bg-muted/50"
                      )}
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    >
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
              table.getRowModel().rows.map((row) => {
                const calendarColor = getCalendarColor(row.original);
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50 transition-colors border-l-4",
                      row.getIsSelected() && "bg-muted/30"
                    )}
                    style={{
                      borderLeftColor: calendarColor.backgroundColor,
                    }}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id}
                        className="py-2"
                        onClick={cell.column.id === "select" ? (e) => e.stopPropagation() : undefined}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron eventos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {enableSelection && (
              <>
                {table.getFilteredSelectedRowModel().rows.length} de{" "}
                {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
              </>
            )}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Loading skeleton
export const DataTableSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-4 w-full animate-pulse", className)}>
    {/* Search Skeleton */}
    <div className="flex items-center py-4">
      <Skeleton className="h-10 w-64" />
      <div className="ml-auto">
        <Skeleton className="h-8 w-24" />
      </div>
    </div>

    {/* Filters Skeleton */}
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-32" />
      ))}
    </div>

    {/* Table Skeleton */}
    <div className="rounded-md border">
      <div className="p-4">
        {/* Header Skeleton */}
        <div className="flex space-x-4 mb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>

        {/* Rows Skeleton */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex space-x-4 mb-3">
            {Array.from({ length: 6 }).map((_, j) => (
              <Skeleton key={j} className="h-6 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>

    {/* Pagination Skeleton */}
    <div className="flex items-center justify-end space-x-2 py-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

DataTable.displayName = "DataTable";