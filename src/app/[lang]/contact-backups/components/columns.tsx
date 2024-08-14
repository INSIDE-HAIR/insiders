// components/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { ContactBackup, BackupType } from "@prisma/client";
import { Button } from "@/src/components/ui/button";
import { formatDistanceToNow } from "date-fns";

type BackupWithFavorite = ContactBackup & { isFavorite: boolean };

export const columns: ColumnDef<BackupWithFavorite, any>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <div className="font-mono text-xs">{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <div>{row.getValue("type")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return <div>{formatDistanceToNow(date, { addSuffix: true })}</div>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as Date;
      return <div>{formatDistanceToNow(date, { addSuffix: true })}</div>;
    },
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
    cell: ({ row }) => {
      const date = row.getValue("expiresAt") as Date | null;
      return date ? (
        <div>{formatDistanceToNow(date, { addSuffix: true })}</div>
      ) : (
        <div>N/A</div>
      );
    },
  },
  {
    accessorKey: "isFavorite",
    header: "Favorite",
    cell: ({ row }) => <div>{row.original.isFavorite ? "⭐" : "☆"}</div>,
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const backup = row.original;
      const { onToggleFavorite, onDelete, onCreateOrUpdateCurrent } = table
        .options.meta as any;

      return (
        <div className="space-x-2">
          {backup.type === BackupType.CURRENT ? (
            <Button onClick={() => onCreateOrUpdateCurrent(backup)}>
              {backup.id ? "Update" : "Create"}
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => onToggleFavorite(backup)}>
                {backup.isFavorite ? "Unstar" : "Star"}
              </Button>
              <Button variant="ghost" onClick={() => onDelete(backup)}>
                Delete
              </Button>
            </>
          )}
        </div>
      );
    },
  },
];
