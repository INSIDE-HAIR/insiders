// Mock data for API Keys development - Simplified Version
import { ApiKey, ApiKeyStatus } from "@/src/features/settings/types";

export const mockApiKeys: ApiKey[] = [
  {
    id: "clxk1a2b3c4d5e6f7g8h9i0j",
    name: "Production API Key",
    description: "Main API key for production environment",
    status: ApiKeyStatus.ACTIVE,
    keyPrefix: "ak_prod_abc123...",
    expiresAt: undefined,
    userId: "user_1",
    totalRequests: 15420,
    lastUsedAt: new Date("2024-01-15T10:30:00Z"),
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-15T10:30:00Z")
  },
  {
    id: "clxk2b3c4d5e6f7g8h9i0j1k",
    name: "Mobile App Key", 
    description: "API key for mobile application",
    status: ApiKeyStatus.ACTIVE,
    keyPrefix: "ak_mobile_xyz456...",
    expiresAt: new Date("2024-12-31T23:59:59Z"),
    userId: "user_1",
    totalRequests: 8200,
    lastUsedAt: new Date("2024-01-16T08:15:00Z"),
    createdAt: new Date("2024-01-05T00:00:00Z"),
    updatedAt: new Date("2024-01-16T08:15:00Z")
  },
  {
    id: "clxk3c4d5e6f7g8h9i0j1k2l",
    name: "Development Key",
    description: "API key for development and testing",
    status: ApiKeyStatus.INACTIVE,
    keyPrefix: "ak_dev_def789...",
    expiresAt: undefined,
    userId: "user_1", 
    totalRequests: 450,
    lastUsedAt: new Date("2024-01-10T12:00:00Z"),
    createdAt: new Date("2024-01-10T00:00:00Z"),
    updatedAt: new Date("2024-01-16T12:00:00Z")
  },
  {
    id: "clxk4d5e6f7g8h9i0j1k2l3m",
    name: "Legacy System",
    description: "Old API key scheduled for replacement",
    status: ApiKeyStatus.REVOKED,
    keyPrefix: "ak_legacy_ghi012...",
    expiresAt: new Date("2023-12-31T23:59:59Z"), // Expired
    userId: "user_1",
    totalRequests: 25000,
    lastUsedAt: new Date("2023-12-15T14:30:00Z"),
    createdAt: new Date("2023-06-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z")
  },
  {
    id: "clxk5e6f7g8h9i0j1k2l3m4n",
    name: "Analytics Dashboard",
    description: "Read-only key for analytics and reporting",
    status: ApiKeyStatus.ACTIVE,
    keyPrefix: "ak_analytics_jkl345...",
    expiresAt: new Date("2024-06-30T23:59:59Z"),
    userId: "user_1",
    totalRequests: 3200,
    lastUsedAt: new Date("2024-01-16T16:45:00Z"),
    createdAt: new Date("2024-01-12T00:00:00Z"),
    updatedAt: new Date("2024-01-16T16:45:00Z")
  },
  {
    id: "clxk6f7g8h9i0j1k2l3m4n5o",
    name: "Integration Test Key",
    description: "Temporary key for integration testing",
    status: ApiKeyStatus.INACTIVE,
    keyPrefix: "ak_test_mno678...",
    expiresAt: new Date("2024-02-15T23:59:59Z"),
    userId: "user_1",
    totalRequests: 120,
    lastUsedAt: new Date("2024-01-14T09:20:00Z"),
    createdAt: new Date("2024-01-14T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z")
  }
];

export const mockApiKeyStats = {
  total: mockApiKeys.length,
  active: mockApiKeys.filter(k => k.status === ApiKeyStatus.ACTIVE).length,
  inactive: mockApiKeys.filter(k => k.status === ApiKeyStatus.INACTIVE).length,
  revoked: mockApiKeys.filter(k => k.status === ApiKeyStatus.REVOKED).length,
  recentlyUsed: mockApiKeys.filter(k => {
    if (!k.lastUsedAt) return false;
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return new Date(k.lastUsedAt) > oneDayAgo;
  }).length,
  totalRequests: mockApiKeys.reduce((sum, key) => sum + (key.totalRequests || 0), 0),
  averageRequestsPerKey: Math.round(
    mockApiKeys.reduce((sum, key) => sum + (key.totalRequests || 0), 0) / mockApiKeys.length
  )
};

export function getMockApiKeys(filters: {
  status?: string;
  page?: number;
  limit?: number;
} = {}) {
  let filtered = mockApiKeys;

  // Filter by status
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(key => key.status === filters.status);
  }

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedKeys = filtered.slice(startIndex, endIndex);

  return {
    apiKeys: paginatedKeys,
    pagination: {
      total: filtered.length,
      page,
      limit,
      pages: Math.ceil(filtered.length / limit)
    }
  };
}

export function findMockApiKey(id: string): ApiKey | undefined {
  return mockApiKeys.find(key => key.id === id);
}