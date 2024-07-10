// src/app/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./components/DataTable";
import { columns } from "./columns";
import { User } from "./lib/types/user";
import { getUsers, syncUsersWithHolded } from "./lib/api/api";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await syncUsersWithHolded();
      await fetchUsers(); // Refresh user list after sync
    } catch (err) {
      setError("Failed to sync users with Holded");
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Users</h1>
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
