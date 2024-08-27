"use client";
import { ColumnDef } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/src/components/ui/tooltip";

export const CreateBaseColumns = <
  T extends { id: string; createdAt: Date; updatedAt: Date; data: any }
>(): ColumnDef<T>[] => {
  return [
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
                  {id && id.slice(0, 8)}...
                </span>
              </TooltipTrigger>
              <TooltipContent>{id}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const name: string = row.getValue("name");
        return <span>{name}</span>;
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const email: string = row.getValue("email");
        return <span>{email}</span>;
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type: string = row.getValue("type");
        return <span>{type}</span>;
      },
    },
  ];
};
