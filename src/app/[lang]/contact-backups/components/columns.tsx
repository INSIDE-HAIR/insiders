// app/contact-backups/components/columns.tsx

import { ColumnDef } from "@tanstack/react-table";
import { ContactBackup } from "@prisma/client";
import { Button } from "@/src/components/ui/button";
import { Star, Eye, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

export const columns: ColumnDef<ContactBackup>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const id: string = row.getValue("id");
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="font-mono text-sm">
              {id.slice(0, 8)}...
            </TooltipTrigger>
            <TooltipContent>{id}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div>{date.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "expiresAt",
    header: "Expires At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("expiresAt"));
      const now = new Date();
      const daysLeft = Math.ceil(
        (date.getTime() - now.getTime()) / (1000 * 3600 * 24)
      );
      return (
        <div>
          {date.toLocaleString()}
          <span className="ml-2 text-sm text-gray-500">
            ({daysLeft} days left)
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const backup = row.original;
      const meta = table.options.meta as
        | {
            toggleFavorite: (backup: ContactBackup) => void;
            deleteBackup: (backup: ContactBackup) => void;
            viewDetails: (backup: ContactBackup) => void;
            openDeleteModal: (backup: ContactBackup) => void;
          }
        | undefined;

      return (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => meta?.toggleFavorite(backup)}
          >
            <Star
              className={
                backup.isFavorite ? "text-yellow-500" : "text-gray-300"
              }
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => meta?.viewDetails(backup)}
          >
            <Eye className="text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => meta?.openDeleteModal(backup)}
          >
            <Trash2 className="text-red-500" />
          </Button>
        </div>
      );
    },
  },
];
