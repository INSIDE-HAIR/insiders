"use client";

import { useState, useEffect, useCallback } from "react";
import { ServiceUser } from "./lib/types/user";
import { getUsers, syncUsersWithHolded } from "./lib/api/api";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { DataTable } from "@/src/components/table/data-table";
import { useColumns } from "./columns"; // Asegúrate de que la ruta de importación sea correcta

export default function UsersPage() {
  const [users, setUsers] = useState<ServiceUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const columns = useColumns(users); // Usa el hook personalizado aquí

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      console.log("Fetched users:", data); // Añade este log
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err); // Añade este log
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
      setIsSyncing(true);
      await syncUsersWithHolded();
      await fetchUsers();
      toast.success("Users synced successfully with Holded.");
    } catch (err) {
      toast.error("Failed to sync users with Holded. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
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
    </div>
  );
}
