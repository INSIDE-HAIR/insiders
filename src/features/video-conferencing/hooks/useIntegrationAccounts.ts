import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VideoProvider, IntegrationStatus } from "@prisma/client";

interface IntegrationAccount {
  id: string;
  provider: VideoProvider;
  accountName: string;
  accountEmail: string;
  status: IntegrationStatus;
  scopes: string[];
  createdAt: string;
  updatedAt: string;
  lastSyncAt?: string;
  expiresAt?: string;
}

interface UseIntegrationAccountsParams {
  provider?: VideoProvider;
  status?: IntegrationStatus;
}

interface CreateIntegrationAccountData {
  provider: VideoProvider;
  authCode: string;
  redirectUri: string;
}

interface UpdateIntegrationAccountData {
  id: string;
  accountName?: string;
  scopes?: string[];
}

// Fetch integration accounts
export const useIntegrationAccounts = (
  params: UseIntegrationAccountsParams = {}
) => {
  return useQuery({
    queryKey: ["integrationAccounts", params],
    queryFn: async (): Promise<IntegrationAccount[]> => {
      const searchParams = new URLSearchParams();

      if (params.provider) searchParams.set("provider", params.provider);
      if (params.status) searchParams.set("status", params.status);

      const response = await fetch(
        `/api/integrations/accounts?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch integration accounts");
      }

      const data = await response.json();
      return data.accounts || [];
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });
};

// Fetch single integration account
export const useIntegrationAccount = (id: string) => {
  return useQuery({
    queryKey: ["integrationAccount", id],
    queryFn: async (): Promise<IntegrationAccount> => {
      const response = await fetch(`/api/integrations/accounts/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch integration account");
      }

      return response.json();
    },
    enabled: !!id,
    staleTime: 60000,
  });
};

// Create integration account (OAuth flow)
export const useCreateIntegrationAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateIntegrationAccountData
    ): Promise<IntegrationAccount> => {
      const response = await fetch("/api/integrations/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Failed to create integration account"
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrationAccounts"] });
    },
  });
};

// Update integration account
export const useUpdateIntegrationAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: UpdateIntegrationAccountData
    ): Promise<IntegrationAccount> => {
      const { id, ...updateData } = data;

      const response = await fetch(`/api/integrations/accounts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Failed to update integration account"
        );
      }

      return response.json();
    },
    onSuccess: (updatedAccount) => {
      queryClient.setQueryData(
        ["integrationAccount", updatedAccount.id],
        updatedAccount
      );
      queryClient.invalidateQueries({ queryKey: ["integrationAccounts"] });
    },
  });
};

// Delete integration account
export const useDeleteIntegrationAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/integrations/accounts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Failed to delete integration account"
        );
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({
        queryKey: ["integrationAccount", deletedId],
      });
      queryClient.invalidateQueries({ queryKey: ["integrationAccounts"] });
    },
  });
};

// Refresh integration account tokens
export const useRefreshIntegrationAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<IntegrationAccount> => {
      const response = await fetch(`/api/integrations/accounts/${id}/refresh`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Failed to refresh integration account"
        );
      }

      return response.json();
    },
    onSuccess: (refreshedAccount) => {
      queryClient.setQueryData(
        ["integrationAccount", refreshedAccount.id],
        refreshedAccount
      );
      queryClient.invalidateQueries({ queryKey: ["integrationAccounts"] });
    },
  });
};

// Test integration account connection
export const useTestIntegrationAccount = () => {
  return useMutation({
    mutationFn: async (
      id: string
    ): Promise<{ success: boolean; error?: string }> => {
      const response = await fetch(`/api/integrations/accounts/${id}/test`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to test integration account");
      }

      return response.json();
    },
  });
};

// Get OAuth authorization URL
export const useGetOAuthUrl = () => {
  return useMutation({
    mutationFn: async (
      provider: VideoProvider
    ): Promise<{ authUrl: string; state: string }> => {
      const response = await fetch(
        `/api/integrations/oauth/${provider.toLowerCase()}/authorize`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get OAuth URL");
      }

      return response.json();
    },
  });
};

// Handle OAuth callback
export const useHandleOAuthCallback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      provider: VideoProvider;
      code: string;
      state: string;
    }): Promise<IntegrationAccount> => {
      const response = await fetch(
        `/api/integrations/oauth/${data.provider.toLowerCase()}/callback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: data.code,
            state: data.state,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to handle OAuth callback");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrationAccounts"] });
    },
  });
};

// Get integration account statistics
export const useIntegrationAccountStats = (id: string) => {
  return useQuery({
    queryKey: ["integrationAccountStats", id],
    queryFn: async (): Promise<{
      totalVideoSpaces: number;
      activeVideoSpaces: number;
      totalMeetings: number;
      lastSyncAt?: string;
      syncErrors: number;
    }> => {
      const response = await fetch(`/api/integrations/accounts/${id}/stats`);

      if (!response.ok) {
        throw new Error("Failed to fetch integration account stats");
      }

      return response.json();
    },
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });
};
