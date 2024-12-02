"use client";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { DataTable } from "./DataTable";
import { Columns } from "./columns/contactColumns";
import LoadingSpinner from "@/src/components/share/LoadingSpinner";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/use-toast";

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
  });

  if (isLoading) {
    return (
      <div className="my-4 flex items-center justify-center">
        <LoadingSpinner className="w-10 h-10" />
      </div>
    );
  }

  if (error) return <div>Error: {(error as Error).message}</div>;

  const columnMeta = {
    loadingBackupId: null,
  };

  return (
    <div>
      <div className="mb-4">
        <div className="my-8 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-center">Current Backup</h1>
          <p className="text-center max-w-3xl">
            This section contains the current backup data.
          </p>
        </div>

        <div className="mb-4 flex justify-between items-center text-sm">
          <p>Current Backup</p>

          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isLoading}
          >
            Create or Update Current Backup
          </Button>
        </div>
      </div>

      <DataTable columns={Columns(columnMeta)} data={contacts?.data ?? []} />
    </div>
  );
};

export default HoldedContactTable;