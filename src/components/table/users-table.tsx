// src/components/table/users-table.tsx
"use client";

import React from "react";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { syncUsersWithHolded } from "@/src/app/(protected)/insiders/admin/users/lib/api/api";
import { ServiceUser } from "@/src/app/(protected)/insiders/admin/users/lib/types/user";

interface UsersTableProps {
  users: ServiceUser[];
}

export default function UsersTable({ users }: UsersTableProps) {
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await syncUsersWithHolded();
      toast.success("Users synced successfully with Holded.");
    } catch (err) {
      toast.error("Failed to sync users with Holded. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Users</h2>
        <Button onClick={handleSync} disabled={isSyncing}>
          {isSyncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            "Sync with Holded"
          )}
        </Button>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
