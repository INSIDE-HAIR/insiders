/**
 * EventsDataTable - Organism Component
 * 
 * Table IDÉNTICO estéticamente al original DataTable.tsx
 * + Estado de loading con skeleton
 * Copiado exacto de: DataTable.tsx líneas completas pero con composición atomic
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
import {
  DownloadIcon,
  UserPlusIcon,
  VideoIcon,
  FileTextIcon,
} from "lucide-react";
import moment from "moment-timezone";
import { GoogleCalendarEvent } from "@/src/features/calendar/types";
import { SelectionIndicator } from "../../atoms/indicators/SelectionIndicator";
import { SkeletonBox } from "../../atoms/loading/SkeletonBox";
// Importamos componentes atómicos migrados
import { BulkActionsSection } from "../sections/BulkActionsSection";

interface EventsDataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  onRowClick?: (item: TData) => void;
  onBulkAddParticipants?: (selectedEvents: TData[]) => void;
  onBulkGenerateMeetLinks?: (selectedEvents: TData[]) => void;
  onBulkGenerateDescriptions?: (selectedEvents: TData[]) => void;
  onBulkMoveCalendar?: (selectedEvents: TData[]) => void;
  onBulkUpdateDateTime?: (selectedEvents: TData[]) => void;
  // calendars?: Array<{
  //   id: string;
  //   summary: string;
  //   colorId?: string;
  //   backgroundColor?: string;
  //   foregroundColor?: string;
  // }>;
  isLoading?: boolean;
}

export function EventsDataTable<TData>({
  columns: userColumns,
  data,
  onRowClick,
  onBulkAddParticipants,
  onBulkGenerateMeetLinks,
  onBulkGenerateDescriptions,
  onBulkMoveCalendar,
  onBulkUpdateDateTime,
  // calendars = [],
  isLoading = false,
}: EventsDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  // const [appliedFilters, setAppliedFilters] = useState<{
  //   [key: string]: any[];
  // }>({});

  // Loading skeleton para toda la tabla
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Search bar skeleton */}
        <div className="flex items-center py-4">
          <SkeletonBox width={300} height={40} />
        </div>
        
        {/* Table skeleton */}
        <div className="rounded-md border">
          <div className="p-4 space-y-3">
            {/* Header skeleton */}
            <div className="flex gap-4">
              {Array(6).fill(0).map((_, i) => (
                <SkeletonBox key={i} width={120} height={20} />
              ))}
            </div>
            
            {/* Rows skeleton */}
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4">
                {Array(6).fill(0).map((_, j) => (
                  <SkeletonBox key={j} width={120} height={16} />
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Pagination skeleton */}
        <div className="flex items-center justify-between">
          <SkeletonBox width={200} height={20} />
          <div className="flex gap-2">
            <SkeletonBox width={80} height={32} />
            <SkeletonBox width={80} height={32} />
          </div>
        </div>
      </div>
    );
  }

  // Copiado exacto del DataTable original - construcción de columnas con checkbox
  const columns = useMemo(() => {
    const selectColumn: ColumnDef<TData> = {
      id: "select",
      header: ({ table }) => (
        <input
          type='checkbox'
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => {
            e.stopPropagation();
            table.toggleAllPageRowsSelected(e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className='w-4 h-4 text-primary bg-background border-primary/30 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2 hover:border-primary transition-colors'
        />
      ),
      cell: ({ row }) => (
        <input
          type='checkbox'
          checked={row.getIsSelected()}
          onChange={(e) => {
            e.stopPropagation();
            row.toggleSelected(e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className='w-4 h-4 text-primary bg-background border-primary/30 rounded focus:ring-primary focus:ring-2 focus:ring-offset-2 hover:border-primary transition-colors'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [selectColumn, ...userColumns];
  }, [userColumns]);

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
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    filterFns: {
      // Función de filtro personalizada para fechas
      dateRange: (row: Row<TData>, columnId: string, filterValue: any) => {
        const rowValue = row.getValue(columnId) as any;
        
        if (!filterValue || (!filterValue.from && !filterValue.to)) {
          return true;
        }
        
        let dateToCheck: Date;
        
        if (typeof rowValue === 'string') {
          dateToCheck = new Date(rowValue);
        } else if (rowValue?.dateTime || rowValue?.date) {
          dateToCheck = new Date(rowValue.dateTime || rowValue.date);
        } else {
          return false;
        }

        if (isNaN(dateToCheck.getTime())) {
          return false;
        }

        const from = filterValue.from ? new Date(filterValue.from) : null;
        const to = filterValue.to ? new Date(filterValue.to) : null;

        if (from && to) {
          return dateToCheck >= from && dateToCheck <= to;
        } else if (from) {
          return dateToCheck >= from;
        } else if (to) {
          return dateToCheck <= to;
        }

        return true;
      }
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  // Obtener eventos seleccionados
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedEvents = selectedRows.map(row => row.original) as GoogleCalendarEvent[];

  // Limpiar selección
  const clearSelection = useCallback(() => {
    table.resetRowSelection();
  }, [table]);

  // Exportar a CSV
  const exportToCSV = useCallback(() => {
    const selectedData = selectedRows.length > 0 ? selectedRows.map(row => row.original) : data;
    
    const csvHeaders = [
      'Título',
      'Fecha Inicio',
      'Fecha Fin', 
      'Estado',
      'Ubicación',
      'Invitados',
      'Descripción',
      'Creado',
      'Actualizado',
      'Creador',
      'Organizador',
      'Enlace Google Meet',
      'ID Reunión',
      'Código Reunión'
    ];

    const csvData = (selectedData as GoogleCalendarEvent[]).map(event => {
      const getEventStatus = () => {
        const now = new Date();
        const start = new Date(event.start?.dateTime || event.start?.date || '');
        const end = new Date(event.end?.dateTime || event.end?.date || '');
        
        if (now < start) return 'Próximo';
        if (now > end) return 'Pasado';
        return 'En curso';
      };

      const formatDate = (dateObj: any) => {
        if (!dateObj) return '';
        const date = dateObj.dateTime || dateObj.date;
        if (!date) return '';
        return moment(date).format('YYYY-MM-DD HH:mm:ss');
      };

      const attendeesText = event.attendees?.map(a => 
        `${a.displayName || a.email?.split('@')[0] || 'Sin nombre'} (${a.email}) [${a.responseStatus || 'Sin respuesta'}]`
      ).join('; ') || '';

      const meetingId = event.conferenceData?.conferenceId || '';
      const meetingCode = event.hangoutLink?.match(/meet\.google\.com\/([a-z-]+)/)?.[1] || '';

      return [
        event.summary || '',
        formatDate(event.start),
        formatDate(event.end),
        getEventStatus(),
        event.location || '',
        attendeesText,
        event.description || '',
        event.created ? moment(event.created).format('YYYY-MM-DD HH:mm:ss') : '',
        event.updated ? moment(event.updated).format('YYYY-MM-DD HH:mm:ss') : '',
        event.creator ? `${event.creator.displayName || event.creator.email || ''}` : '',
        event.organizer ? `${event.organizer.displayName || event.organizer.email || ''}` : '',
        event.hangoutLink || '',
        meetingId,
        meetingCode
      ];
    });

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
      link.setAttribute('download', `eventos_calendario_${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [selectedRows, data]);

  return (
    <div className="space-y-4">
      {/* Indicador de selección - usando atom SelectionIndicator */}
      <SelectionIndicator
        selectedEvents={selectedEvents}
        onClearSelection={clearSelection}
      />

      {/* Barra de acciones bulk - usando componente original temporalmente */}
      {selectedEvents.length > 0 && (
        <BulkActionsSection
          selectedCount={selectedEvents.length}
          onBulkAddParticipants={onBulkAddParticipants ? () => onBulkAddParticipants(selectedEvents as any) : undefined}
          onBulkGenerateMeetLinks={onBulkGenerateMeetLinks ? () => onBulkGenerateMeetLinks(selectedEvents as any) : undefined}
          onBulkGenerateDescriptions={onBulkGenerateDescriptions ? () => onBulkGenerateDescriptions(selectedEvents as any) : undefined}
          onBulkMoveCalendar={onBulkMoveCalendar ? () => onBulkMoveCalendar(selectedEvents as any) : undefined}
          onBulkUpdateDateTime={onBulkUpdateDateTime ? () => onBulkUpdateDateTime(selectedEvents as any) : undefined}
          onExportSelected={exportToCSV}
        />
      )}

      {/* Controles superiores */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar eventos..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        
        {/* TODO: Revisar interfaz de AdvancedColumnFilter */}
        {/* <AdvancedColumnFilter
          table={table}
          appliedFilters={appliedFilters}
          onAppliedFiltersChange={setAppliedFilters}
          calendars={calendars}
        /> */}
        
        {/* Botón exportar */}
        <Button
          variant="outline"
          size="sm"
          onClick={exportToCSV}
          className="ml-2"
        >
          <DownloadIcon className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
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
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => onRowClick?.(row.original)}
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

      {/* Paginación */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {selectedRows.length > 0 && (
            <>
              {selectedRows.length} de {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
            </>
          )}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Filas por página</p>
            <select
              className="h-8 w-16 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value))
              }}
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
              <span className="sr-only">Ir a la primera página</span>
              {"<<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la página anterior</span>
              {"<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir a la siguiente página</span>
              {">"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir a la última página</span>
              {">>"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

EventsDataTable.displayName = "EventsDataTable";