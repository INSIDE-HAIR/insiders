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
import { DownloadIcon, UserPlusIcon, VideoIcon, FileTextIcon } from "lucide-react";
import moment from "moment-timezone";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import { AdvancedColumnFilter } from "./AdvancedColumnFilter";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  onRowClick?: (item: TData) => void;
  onBulkAddParticipants?: (selectedEvents: TData[]) => void;
  onBulkGenerateMeetLinks?: (selectedEvents: TData[]) => void;
  onBulkGenerateDescriptions?: (selectedEvents: TData[]) => void;
  calendars?: Array<{ 
    id: string; 
    summary: string; 
    colorId?: string; 
    backgroundColor?: string; 
    foregroundColor?: string; 
  }>;
}

export function DataTable<TData>({
  columns: userColumns,
  data,
  onRowClick,
  onBulkAddParticipants,
  onBulkGenerateMeetLinks,
  onBulkGenerateDescriptions,
  calendars = [],
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
    const selectColumn: ColumnDef<TData> = {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => {
            e.stopPropagation();
            table.toggleAllPageRowsSelected(e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-ring focus:ring-2 focus:ring-offset-2"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => {
            e.stopPropagation(); // Evitar que dispare el modal
            row.toggleSelected(e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()} // Evitar propagación en el click también
          className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-ring focus:ring-2 focus:ring-offset-2"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };

    const processedColumns = userColumns.map((col) => ({
      ...col,
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

    return [selectColumn, ...processedColumns];
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

  const getUniqueColumnValues = useCallback((columnId: string): any[] => {
    const column = table.getColumn(columnId);
    if (!column) return [];

    const uniqueValues = new Set<any>();

    // Para la columna de attendees, extraer emails individuales
    if (columnId === 'attendees') {
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
  }, [table]);

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  
  // Helper para verificar si un evento tiene Google Meet
  const hasGoogleMeet = (event: any) => {
    return !!(event.hangoutLink || event.conferenceData);
  };
  
  // Filtrar eventos seleccionados sin Google Meet
  const selectedEventsWithoutMeet = table.getFilteredSelectedRowModel().rows
    .map(row => row.original)
    .filter(event => !hasGoogleMeet(event));

  // Helper para obtener el color del calendario
  const getCalendarColor = (item: TData) => {
    const calendarId = (item as any).calendarId;
    if (!calendarId) return { backgroundColor: '#4285f4' };
    
    const calendar = calendars.find(cal => cal.id === calendarId);
    return {
      backgroundColor: calendar?.backgroundColor || '#4285f4',
      foregroundColor: calendar?.foregroundColor || '#ffffff',
    };
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* Bulk Actions Bar */}
      {selectedRowsCount > 0 && (
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-primary">
              {selectedRowsCount} evento{selectedRowsCount !== 1 ? 's' : ''} seleccionado{selectedRowsCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onBulkAddParticipants && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  const selectedData = table.getFilteredSelectedRowModel().rows.map(row => row.original);
                  onBulkAddParticipants(selectedData);
                }}
                className="text-xs bg-card-foreground text-card hover:bg-card-foreground/90"
              >
                <UserPlusIcon className="mr-1 h-3 w-3" />
                Agregar Participantes
              </Button>
            )}
            {onBulkGenerateMeetLinks && selectedEventsWithoutMeet.length > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  onBulkGenerateMeetLinks(selectedEventsWithoutMeet);
                }}
                className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                title={`Generar enlaces de Google Meet para ${selectedEventsWithoutMeet.length} evento${selectedEventsWithoutMeet.length !== 1 ? 's' : ''} sin Meet`}
              >
                <VideoIcon className="mr-1 h-3 w-3" />
                Generar Meet ({selectedEventsWithoutMeet.length})
              </Button>
            )}
            {onBulkGenerateDescriptions && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  const selectedData = table.getFilteredSelectedRowModel().rows.map(row => row.original);
                  onBulkGenerateDescriptions(selectedData);
                }}
                className="text-xs bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                title={`Generar descripciones automáticas para ${selectedRowsCount} evento${selectedRowsCount !== 1 ? 's' : ''}`}
              >
                <FileTextIcon className="mr-1 h-3 w-3" />
                Generar Descripciones
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs"
            >
              <DownloadIcon className="mr-1 h-3 w-3" />
              Exportar Seleccionados
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.toggleAllPageRowsSelected(false)}
              className="text-xs"
            >
              Deseleccionar Todo
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:space-x-2">
        <div className="flex space-x-2 items-center w-full md:w-auto">
          <Input
            placeholder="Buscar eventos..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="w-full md:max-w-sm"
          />
        </div>

        <Button onClick={handleExportCSV}>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto max-w-full">
        <Table className="min-w-full w-max">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className={`${
                      header.column.id === 'select' ? 'w-12' :
                      header.column.id === 'actions' ? 'w-32' :
                      header.column.id === 'summary' ? 'min-w-48' :
                      header.column.id === 'attendees' ? 'min-w-80' :
                      header.column.id === 'location' ? 'min-w-48' :
                      header.column.id === 'description' ? 'min-w-64' :
                      header.column.id === 'organizer' ? 'min-w-48' :
                      header.column.id === 'creator' ? 'min-w-48' :
                      header.column.id === 'conferenceData' ? 'min-w-80' :
                      'min-w-36'
                    } whitespace-nowrap`}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                        {header.column.getCanFilter() && (
                          <AdvancedColumnFilter
                            column={header.column}
                            onApplyFilter={handleApplyFilter}
                            onRemoveFilter={handleRemoveFilter}
                            appliedFilters={
                              appliedFilters[header.column.id] || []
                            }
                            options={getUniqueColumnValues(header.column.id)}
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
              table.getRowModel().rows.map((row) => {
                const calendarColor = getCalendarColor(row.original);
                
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick?.(row.original)}
                    className={onRowClick ? "cursor-pointer hover:bg-accent/50" : ""}
                    style={{
                      borderLeft: `4px solid ${calendarColor.backgroundColor}`,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className={`${
                        cell.column.id === 'select' ? 'w-12' :
                        cell.column.id === 'actions' ? 'w-32' :
                        cell.column.id === 'summary' ? 'min-w-48' :
                        cell.column.id === 'attendees' ? 'min-w-80' :
                        cell.column.id === 'location' ? 'min-w-48' :
                        cell.column.id === 'description' ? 'min-w-64' :
                        cell.column.id === 'organizer' ? 'min-w-48' :
                        cell.column.id === 'creator' ? 'min-w-48' :
                        cell.column.id === 'conferenceData' ? 'min-w-80' :
                        'min-w-36'
                      } align-top`}
                      onClick={(e) => {
                        // Evitar que el click en acciones y select dispare el modal
                        if (cell.column.id === 'actions' || cell.column.id === 'select') {
                          e.stopPropagation();
                        }
                      }}
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
                  No se encontraron eventos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} evento(s) seleccionado(s).
        </div>
        <div className="flex flex-wrap items-center gap-2 md:space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Filas por página</p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value))
              }}
              className="h-8 w-[70px] border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Primera página</span>
              «
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Página anterior</span>
              ‹
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Página siguiente</span>
              ›
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Última página</span>
              »
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}