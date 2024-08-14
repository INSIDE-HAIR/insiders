// app/contact-backups/components/DataTable.tsx

import { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { ContactBackup } from "@prisma/client";
import { Loader2 } from "lucide-react";

interface DataTableProps<TData extends ContactBackup, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onToggleFavorite: (backup: ContactBackup) => void;
  onDelete: (backup: ContactBackup) => void;
  onViewDetails: (backup: ContactBackup) => void;
  openDeleteModal: (backup: ContactBackup) => void;
  pageSize: number;
  loadingBackupId: string | null;
}

export function DataTable<TData extends ContactBackup, TValue>({
  columns,
  data = [],
  onToggleFavorite,
  onDelete,
  onViewDetails,
  openDeleteModal,
  pageSize,
  loadingBackupId,
}: DataTableProps<TData, TValue>) {
  const [currentPage, setCurrentPage] = useState(0);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(data.length / pageSize),
    state: {
      pagination: {
        pageIndex: currentPage,
        pageSize: pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({
          pageIndex: currentPage,
          pageSize: pageSize,
        });
        setCurrentPage(newState.pageIndex);
      }
    },
    manualPagination: true,
    meta: {
      toggleFavorite: onToggleFavorite,
      deleteBackup: onDelete,
      viewDetails: onViewDetails,
      openDeleteModal: openDeleteModal,
      loadingBackupId,
    },
  });

  useEffect(() => {
    setCurrentPage(0);
    table.setPageIndex(0);
  }, [pageSize, table]);

  return (
    <div>
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
                      {cell.column.id === "favorite" ? ( // Suponiendo que la columna de favorito tiene un id de 'favorite'
                        row.original.id === loadingBackupId ? ( // Mostrar loader si está cargando
                          <Loader2 className="animate-spin" />
                        ) : (
                          <button
                            onClick={() => onToggleFavorite(row.original)}
                          >
                            ★
                          </button>
                        )
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
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
    </div>
  );
}
