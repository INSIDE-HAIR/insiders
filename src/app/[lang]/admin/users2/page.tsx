"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";
import TailwindGrid from "@/src/components/grid/TailwindGrid";
import { useTranslations } from "@/src/context/TranslationContext";
import { Users2Table } from "./Users2Table";
import { useToast } from "@/src/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import LoadingSpinner from "@/src/components/shared/LoadingSpinner";

const fetchBackupData = async () => {
  const response = await fetch(
    `/api/vendor/holded/contacts/backups/current/null`
  );
  if (!response.ok) throw new Error("Failed to fetch backup data");
  return response.json();
};

const createOrUpdateBackup = async () => {
  const response = await fetch(`/api/vendor/holded/contacts/backups/current`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to create or update backup");
  return response.json();
};

const HoldedContactTable: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const t = useTranslations("UsersPage");

  const {
    data: contacts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["backupData"],
    queryFn: fetchBackupData,
    select: (data) => (data && !Array.isArray(data) ? data : null),
  });

  const mutation = useMutation({
    mutationFn: createOrUpdateBackup,
    onMutate: () => {
      setIsSyncing(true);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Backup was successfully created or updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["backupData"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "An error occurred while creating or updating the backup.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSyncing(false);
    },
  });

  if (isLoading) {
    return (
      <div className="my-4 flex items-center justify-center">
        <LoadingSpinner className="w-10 h-10" />
      </div>
    );
  }

  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <>
      <TailwindGrid fullSize>
        <header className="max-w-full col-start-1 col-end-full lg:col-start-3 lg:col-end-13 flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 col-span-full">
          <div className="flex-1 justify-between items-center flex ">
            <h1 className="text-2xl font-bold ">{t("mainTitle")}</h1>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isLoading || isSyncing}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("syncing")}
                </>
              ) : (
                t("syncButton")
              )}
            </Button>
          </div>
        </header>
      </TailwindGrid>
      <TailwindGrid fullSize>
        <main className="col-start-1 max-w-full w-full col-end-full md:col-start-1 lg:col-start-3 lg:col-end-13 order-2 md:order-1 z-30 col-span-full p-4">
          <Toaster position="top-right" />
          <>
            <h2 className="text-xl font-bold mt-8 mb-4">
              Holded Contacts Table
            </h2>
            <Users2Table data={contacts?.data ?? []} />
          </>
        </main>
      </TailwindGrid>
    </>
  );
};

export default HoldedContactTable;
