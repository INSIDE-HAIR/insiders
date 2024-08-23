"use client";
import { ColumnDef } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/src/components/ui/tooltip";
import { useTranslations } from "@/src/context/TranslationContext";

export const CreateBaseColumns = <
  T extends { id: string; createdAt: Date; updatedAt: Date; data: any }
>(): ColumnDef<T>[] => {
  const t = useTranslations("Common.columns");

  return [
    {
      accessorKey: "id",
      header: t("id"),
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
      header: t("createdAt"),
      cell: ({ row }) => {
        const date: Date = row.getValue("createdAt");
        return <span>{new Date(date).toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "updatedAt",
      header: t("updatedAt"),
      cell: ({ row }) => {
        const date: Date = row.getValue("updatedAt");
        return <span>{new Date(date).toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "length",
      header: t("contacts"),
      cell: ({ row }) => {
        const length: number = row.getValue("length");
        return <span>{length}</span>;
      },
    },
  ];
};
