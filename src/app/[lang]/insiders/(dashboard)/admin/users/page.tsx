"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import TailwindGrid from "@/src/components/grid/TailwindGrid";
import { ServiceUser } from "./lib/types/user";
import { DataTable } from "./components/DataTable"; // Importación directa
import { useColumns } from "./columns";

export default function UsersPage() {
  const [users, setUsers] = useState<ServiceUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const columns = useColumns(users);

  const fetchUsers = useCallback(async () => {
    try {
      console.log("Fetching users...");
      setIsLoading(true);
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
        }/users`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch users. Status: ${response.status}`);
      }

      const data: ServiceUser[] = await response.json();
      console.log("Users fetched successfully:", data);
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users on client:", err);
      toast.error("Failed to fetch users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSync = async () => {
    try {
      console.log("Syncing users with Holded...");
      setIsSyncing(true);
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api"
        }/users/sync`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to sync users with Holded. Status: ${response.status}`
        );
      }

      await fetchUsers();
      console.log("Users synced successfully.");
      toast.success("Users synced successfully with Holded.");
    } catch (err) {
      console.error("Error syncing users on client:", err);
      toast.error("Failed to sync users with Holded. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <TailwindGrid fullSize>
        <header className="max-w-full col-start-1 col-end-full lg:col-start-3 lg:col-end-13 flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 col-span-full">
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Lista de Usuarios</h1>
          </div>
        </header>
      </TailwindGrid>
      <TailwindGrid fullSize>
        <main className="col-start-1 max-w-full w-full col-end-full md:col-start-1 lg:col-start-3 lg:col-end-13 order-2 md:order-1 z-30 col-span-full p-4">
          <Toaster position="top-right" />
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-2xl font-bold">Users</h1>
            <Button onClick={handleSync} disabled={isSyncing || isLoading}>
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
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <DataTable columns={columns} data={users} />
          )}
        </main>
      </TailwindGrid>
    </>
  );
}
