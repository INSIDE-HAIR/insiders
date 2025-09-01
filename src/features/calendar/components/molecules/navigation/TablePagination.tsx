/**
 * TablePagination - Molecular Component
 * 
 * Paginación de tabla usando Pagination de shadcn
 * Mantiene estética IDÉNTICA con componentes shadcn
 */

"use client";

import React from "react";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/src/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/src/lib/utils";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  className?: string;
  disabled?: boolean;
  showItemsPerPage?: boolean;
  showTotalItems?: boolean;
  showFirstLast?: boolean;
  pageSizeOptions?: number[];
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className,
  disabled = false,
  showItemsPerPage = true,
  showTotalItems = true,
  showFirstLast = false,
  pageSizeOptions = [10, 25, 50, 100],
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const generatePageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 4) {
        pages.push('ellipsis');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 3) {
        pages.push('ellipsis');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !disabled) {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    if (onItemsPerPageChange && !disabled) {
      const newItemsPerPage = parseInt(value, 10);
      onItemsPerPageChange(newItemsPerPage);
      // Reset to first page when changing items per page
      onPageChange(1);
    }
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
      {/* Items info and per page selector */}
      <div className="flex items-center gap-4">
        {showTotalItems && (
          <div className="text-sm text-muted-foreground">
            Mostrando {startItem} a {endItem} de {totalItems} elementos
          </div>
        )}
        
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Elementos por página:</span>
            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={handleItemsPerPageChange}
              disabled={disabled}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
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
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {/* First page button */}
          {showFirstLast && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || disabled}
              className="h-8 w-8 p-0"
            >
              <ChevronDoubleLeftIcon className="h-4 w-4" />
            </Button>
          )}

          <Pagination className="mx-0 w-auto">
            <PaginationContent className="gap-1">
              {/* Previous button */}
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={cn(
                    "h-8 px-2",
                    (currentPage === 1 || disabled) && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>

              {/* Page numbers */}
              {pageNumbers.map((page, index) => (
                <PaginationItem key={index}>
                  {page === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === currentPage}
                      className={cn(
                        "h-8 w-8",
                        disabled && "pointer-events-none opacity-50"
                      )}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              {/* Next button */}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={cn(
                    "h-8 px-2",
                    (currentPage === totalPages || disabled) && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          {/* Last page button */}
          {showFirstLast && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || disabled}
              className="h-8 w-8 p-0"
            >
              <ChevronDoubleRightIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Loading skeleton
export const TablePaginationSkeleton: React.FC = () => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="h-4 w-48 bg-muted rounded" />
      <div className="flex items-center gap-2">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-8 w-20 bg-muted rounded" />
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 bg-muted rounded" />
      <div className="h-8 w-8 bg-muted rounded" />
      <div className="h-8 w-8 bg-muted rounded" />
      <div className="h-8 w-8 bg-muted rounded" />
      <div className="h-8 w-8 bg-muted rounded" />
    </div>
  </div>
);

TablePagination.displayName = "TablePagination";