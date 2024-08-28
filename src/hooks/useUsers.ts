import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceUser } from "../app/[lang]/insiders/(dashboard)/admin/users/lib/types/user";

const fetchUsers = async (): Promise<ServiceUser[]> => {
  const response = await fetch("/api/users");
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

const syncUsersWithHolded = async (): Promise<void> => {
  const response = await fetch("/api/users/sync", { method: "POST" });
  if (!response.ok) throw new Error("Failed to sync users with Holded");
};

export function useUsers() {
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery<ServiceUser[], Error>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const syncMutation = useMutation({
    mutationFn: syncUsersWithHolded,
    onMutate: () => setIsSyncing(true),
    onSettled: () => setIsSyncing(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Error syncing users with Holded:", error);
    },
  });

  return {
    users,
    isLoading,
    error,
    isSyncing,
    syncUsers: () => syncMutation.mutate(),
  };
}
