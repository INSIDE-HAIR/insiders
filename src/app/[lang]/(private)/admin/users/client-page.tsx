"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/src/components/ui/button";
import { InfoIcon, Loader2, Users } from "lucide-react";
import { Toaster, toast } from "sonner";
import { DataTable } from "./components/DataTable"; // Importación directa
import { useColumns } from "./columns";
import { useTranslations } from "@/src/context/TranslationContext";
import { ServiceUser } from "./lib/types/user";
import { UserSession } from "@/src/types/routes";
import TailwindGrid from "@/src/components/shared/grid/TailwindGrid";
import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";

interface UsersPageClientProps {
  user: UserSession;
}

export function UsersPageClient({ user }: UsersPageClientProps) {
  const [users, setUsers] = useState<ServiceUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const t = useTranslations("UsersPage");

  const columns = useColumns(users);

  const fetchUsers = useCallback(async () => {
    try {
      console.log("Fetching users...");
      setIsLoading(true);
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
        }/users`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
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
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
        }/users/sync`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
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
      <DocHeader
        title='Users'
        description='Manage users in the system'
        icon={Users}
      />
      <DocContent>
        <TailwindGrid fullSize>
          <main className='col-start-1 max-w-full w-full col-end-full md:col-start-1 lg:col-start-1 lg:col-end-13  order-2 md:order-1 z-30  col-span-full'>
            {isLoading ? (
              <div className='flex justify-center items-center h-64'>
                <Loader2 className='h-8 w-8 animate-spin' />
              </div>
            ) : (
              <div className='w-full'>
                <DataTable columns={columns} data={users} />
                <Button
                  className='mt-4'
                  onClick={handleSync}
                  disabled={isSyncing || isLoading}
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {t("syncing")}
                    </>
                  ) : (
                    t("syncButton")
                  )}
                </Button>
              </div>
            )}
          </main>
        </TailwindGrid>
      </DocContent>
      <Toaster position='top-right' />
    </>
  );
}
