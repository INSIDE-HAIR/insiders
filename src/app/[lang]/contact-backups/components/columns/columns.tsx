import { ColumnDef } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/src/components/ui/tooltip";

// Define a generic function to create base columns
export const createBaseColumns = <
  T extends { id: string; createdAt: Date; updatedAt: Date; data: any }
>(): ColumnDef<T>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const id: string = row.getValue("id");
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-mono text-sm cursor-pointer">
                {id.slice(0, 8)}...
              </span>
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
      const date: Date = row.getValue("createdAt");
      return <span>{new Date(date).toLocaleString()}</span>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => {
      const date: Date = row.getValue("updatedAt");
      return <span>{new Date(date).toLocaleString()}</span>;
    },
  },
  {
    accessorKey: "data",
    header: "Contacts",
    cell: ({ row }) => {
      const data: any = row.getValue("data");
      return <span>{Array.isArray(data) ? data.length : 0}</span>;
    },
  },
];
