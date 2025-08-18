/**
 * React Query hooks for Integration Accounts API
 */
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useSession } from "next-auth/react";
import { IntegrationAccount, VideoProvider } from "../types/video-conferencing";

// API functions
const fetchIntegrationAccounts = async (): Promise<IntegrationAccount[]> => {
  const response = await fetch("/api/video-conferencing/integration-accounts");

  if (!response.ok) {
    throw new Error(
      `Failed to fetch integration accounts: ${response.statusText}`
    );
  }

  return response.json();
};

const createIntegrationAccount = async (data: {
  provider: VideoProvider;
  accountName: string;
  accountEmail: string;
}): Promise<IntegrationAccount> => {
  const response = await fetch("/api/video-conferencing/integration-accounts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create integration account");
  }

  return response.json();
};

const deleteIntegrationAccount = async (id: string): Promise<void> => {
  const response = await fetch(
    `/api/video-conferencing/integration-accounts/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete integration account");
  }
};

const refreshIntegrationToken = async (
  id: string
): Promise<IntegrationAccount> => {
  const response = await fetch(
    `/api/video-conferencing/integration-accounts/${id}/refresh`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to refresh integration token");
  }

  return response.json();
};

const testIntegrationConnection = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(
    `/api/video-conferencing/integration-accounts/${id}/test`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to test integration connection");
  }

  return response.json();
};

// OAuth flow functions
const initiateOAuthFlow = async (
  provider: VideoProvider
): Promise<{ authUrl: string }> => {
  const response = await fetch(
    `/api/video-conferencing/oauth/${provider.toLowerCase()}/initiate`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to initiate OAuth flow");
  }

  return response.json();
};

// Query keys
export const integrationKeys = {
  all: ["integrations"] as const,
  lists: () => [...integrationKeys.all, "list"] as const,
  details: () => [...integrationKeys.all, "detail"] as const,
  detail: (id: string) => [...integrationKeys.details(), id] as const,
  test: (id: string) => [...integrationKeys.all, "test", id] as const,
};

// Hooks
export const useIntegrationAccounts = () => {
  const { data: session } = useSession();

  return useQuery(integrationKeys.lists(), fetchIntegrationAccounts, {
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateIntegrationAccount = () => {
  const queryClient = useQueryClient();

  return useMutation(createIntegrationAccount, {
    onSuccess: () => {
      queryClient.invalidateQueries(integrationKeys.lists());
    },
  });
};

export const useDeleteIntegrationAccount = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteIntegrationAccount, {
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries(integrationKeys.detail(deletedId));
      queryClient.invalidateQueries(integrationKeys.lists());
    },
  });
};

export const useRefreshIntegrationToken = () => {
  const queryClient = useQueryClient();

  return useMutation(refreshIntegrationToken, {
    onSuccess: (data) => {
      queryClient.setQueryData(integrationKeys.detail(data.id), data);
      queryClient.invalidateQueries(integrationKeys.lists());
    },
  });
};

export const useTestIntegrationConnection = () => {
  return useMutation(testIntegrationConnection);
};

export const useInitiateOAuthFlow = () => {
  return useMutation(initiateOAuthFlow, {
    onSuccess: (data) => {
      // Redirect to OAuth URL
      window.location.href = data.authUrl;
    },
  });
};

// Provider-specific hooks
export const useIntegrationsByProvider = (provider?: VideoProvider) => {
  const { data: integrations, ...rest } = useIntegrationAccounts();

  const filteredIntegrations = provider
    ? integrations?.filter((integration) => integration.provider === provider)
    : integrations;

  return {
    data: filteredIntegrations,
    ...rest,
  };
};

export const useActiveIntegrations = () => {
  const { data: integrations, ...rest } = useIntegrationAccounts();

  const activeIntegrations = integrations?.filter(
    (integration) => integration.status === "ACTIVE"
  );

  return {
    data: activeIntegrations,
    ...rest,
  };
};
