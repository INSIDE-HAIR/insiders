import React, { useState, useEffect, useCallback } from "react";
import LoadingSpinner from "@/src/components/share/LoadingSpinner";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/src/components/ui/select";
import { Clipboard, Check } from "lucide-react";
import { useToast } from "@/src/components/ui/use-toast";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination";

interface BackupDetailsProps {
  backupId: string;
  itemsPerPage?: number;
  type?: "CURRENT" | "DAILY" | "MONTHLY" | "FAVORITE";
}

const BackupDetails: React.FC<BackupDetailsProps> = ({
  backupId,
  itemsPerPage = 10,
  type = "CURRENT",
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [pagedData, setPagedData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [itemsPerPageState, setItemsPerPageState] = useState(itemsPerPage);
  const [copied, setCopied] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("1");
  const { toast } = useToast();

  const updatePagedData = useCallback(() => {
    const start = currentPage * itemsPerPageState;
    const end = start + itemsPerPageState;
    setPagedData(data.slice(start, end));
    setTotalPages(Math.ceil(data.length / itemsPerPageState));
    setPageInputValue((currentPage + 1).toString());
  }, [currentPage, data, itemsPerPageState]);

  useEffect(() => {
    const fetchBackupData = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/vendor/holded/contacts/backups/${type.toLowerCase()}/${backupId}`
        );

        if (!response.ok) throw new Error("Failed to fetch backup data");

        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          setData(result.data);
        } else {
          console.error("Invalid data format received.");
          setData([]);
        }
      } catch (error) {
        console.error("Error loading backup data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBackupData();
  }, [backupId, type]);

  useEffect(() => {
    updatePagedData();
  }, [updatePagedData]);

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPageState(items);
    setCurrentPage(0);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    toast({
      title: "¡Copia exitosa!",
      description: "Los datos han sido copiados a tu portapapeles.",
    });

    setTimeout(() => {
      setCopied(false);
    }, 5000);
  };

  const generatePaginationItems = () => {
    const paginationItems = [];
    const maxVisiblePages = 5;
    let startPage, endPage;

    if (totalPages <= maxVisiblePages) {
      startPage = 0;
      endPage = totalPages - 1;
    } else {
      if (currentPage <= Math.floor(maxVisiblePages / 2)) {
        startPage = 0;
        endPage = maxVisiblePages - 1;
      } else if (currentPage + Math.floor(maxVisiblePages / 2) >= totalPages) {
        startPage = totalPages - maxVisiblePages;
        endPage = totalPages - 1;
      } else {
        startPage = currentPage - Math.floor(maxVisiblePages / 2);
        endPage = currentPage + Math.floor(maxVisiblePages / 2);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationItems.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(i);
            }}
            isActive={i === currentPage}
          >
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return paginationItems;
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPageInputValue(value);
  };

  const handlePageInputBlur = () => {
    let pageNumber = parseInt(pageInputValue, 10);
    if (isNaN(pageNumber) || pageNumber < 1) {
      pageNumber = 1;
    } else if (pageNumber > totalPages) {
      pageNumber = totalPages;
    }
    setCurrentPage(pageNumber - 1);
    setPageInputValue(pageNumber.toString());
  };

  const handlePageInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handlePageInputBlur();
    }
  };

  return (
    <div className="border rounded-md p-4 bg-gray-100 flex flex-col mt-4">
      <h3 className="text-lg font-semibold mb-2">Backup Details</h3>
      <div>
        <strong>ID:</strong> {backupId}
      </div>
      <div>
        <div className="flex justify-between items-end mb-5">
          <strong>Data:</strong>
          <div className="mt-2 flex items-center">
            <label className="mr-2">Items per page:</label>
            <Select
              onValueChange={(value) =>
                handleItemsPerPageChange(parseInt(value))
              }
              value={String(itemsPerPageState)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select number" />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
                <SelectItem value={String(data.length)}>
                  All ({data.length})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {loading ? (
          <div className="my-4 flex items-center justify-center bg-black text-white rounded-md min-h-96">
            <LoadingSpinner className="w-10 h-10" />
          </div>
        ) : (
          <div className="max-h-96 scroll-smooth overflow-auto bg-black text-white rounded-md">
            <pre className="mt-2 p-2 rounded text-sm w-full">
              {JSON.stringify(pagedData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center">
        {!loading && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 0) setCurrentPage(currentPage - 1);
                  }}
                />
              </PaginationItem>
              {generatePaginationItems()}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages - 1) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        <div className="flex items-center space-x-2 flex-nowrap">
          <span>Page</span>
          <Input
            className="w-16 text-center"
            value={pageInputValue}
            onChange={handlePageInputChange}
            onBlur={handlePageInputBlur}
            onKeyPress={handlePageInputKeyPress}
          />
          <span className="whitespace-nowrap">of {totalPages}</span>
        </div>
      </div>
      <div className="mt-4">
        <Button onClick={handleCopyToClipboard}>
          {copied ? (
            <Check className="w-4 h-4 mr-2" />
          ) : (
            <Clipboard className="w-4 h-4 mr-2" />
          )}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
    </div>
  );
};

export default BackupDetails;
