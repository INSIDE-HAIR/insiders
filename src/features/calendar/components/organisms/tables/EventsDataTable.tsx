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
  isLoading = false,
}: EventsDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");

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
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const handleRowClick = useCallback(
    (row: Row<TData>) => {
      if (onRowClick) {
        onRowClick(row.original);
      }
    },
    [onRowClick]
  );

  const handleBulkAction = useCallback(
    (action: string, selectedEvents: TData[]) => {
      switch (action) {
        case "addParticipants":
          onBulkAddParticipants?.(selectedEvents);
          break;
        case "generateMeetLinks":
          onBulkGenerateMeetLinks?.(selectedEvents);
          break;
        case "generateDescriptions":
          onBulkGenerateDescriptions?.(selectedEvents);
          break;
        case "moveCalendar":
          onBulkMoveCalendar?.(selectedEvents);
          break;
        case "updateDateTime":
          onBulkUpdateDateTime?.(selectedEvents);
          break;
      }
    },
    [
      onBulkAddParticipants,
      onBulkGenerateMeetLinks,
      onBulkGenerateDescriptions,
      onBulkMoveCalendar,
      onBulkUpdateDateTime,
    ]
  );

  // Obtener eventos seleccionados
  const selectedEvents = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);

  // Función para limpiar selección
  const clearSelection = () => {
    table.resetRowSelection();
  };

  // Loading skeleton para toda la tabla
  if (isLoading) {
    return (
      <div className='space-y-4'>
        {/* Search bar skeleton */}
        <div className='flex items-center py-4'>
          <SkeletonBox width={300} height={40} />
        </div>

        {/* Table skeleton */}
        <div className='rounded-md border'>
          <div className='p-4 space-y-3'>
            {/* Header skeleton */}
            <div className='flex gap-4'>
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <SkeletonBox key={i} width={120} height={20} />
                ))}
            </div>

            {/* Rows skeleton */}
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <div key={i} className='flex gap-4'>
                  {Array(6)
                    .fill(0)
                    .map((_, j) => (
                      <SkeletonBox key={j} width={120} height={16} />
                    ))}
                </div>
              ))}
          </div>
        </div>

        {/* Pagination skeleton */}
        <div className='flex items-center justify-between'>
          <SkeletonBox width={200} height={20} />
          <div className='flex gap-2'>
            <SkeletonBox width={80} height={32} />
            <SkeletonBox width={80} height={32} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Indicador de selección - usando atom SelectionIndicator */}
      <SelectionIndicator
        selectedEvents={selectedEvents as GoogleCalendarEvent[]}
        onClearSelection={clearSelection}
      />

      {/* Barra de acciones bulk - usando componente original temporalmente */}
      <BulkActionsSection
        selectedCount={selectedEvents.length}
        onBulkAddParticipants={() =>
          onBulkAddParticipants?.(selectedEvents as any)
        }
        onBulkGenerateMeetLinks={() =>
          onBulkGenerateMeetLinks?.(selectedEvents as any)
        }
        onBulkGenerateDescriptions={() =>
          onBulkGenerateDescriptions?.(selectedEvents as any)
        }
        onBulkMoveCalendar={() => onBulkMoveCalendar?.(selectedEvents as any)}
        onBulkUpdateDateTime={() =>
          onBulkUpdateDateTime?.(selectedEvents as any)
        }
        onDeselectAll={clearSelection}
      />

      {/* Barra de búsqueda */}
      <div className='flex items-center py-4'>
        <Input
          placeholder='Buscar eventos...'
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className='max-w-sm'
        />
      </div>

      {/* Tabla */}
      <div className='rounded-md border'>
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
                  className='cursor-pointer hover:bg-muted/50'
                  onClick={() => handleRowClick(row)}
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
                  className='h-24 text-center'
                >
                  No hay eventos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='flex-1 text-sm text-muted-foreground'>
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
        </div>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
