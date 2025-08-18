import { z } from "zod";

// Enum for API Key Status matching Prisma schema
export const ApiKeyStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'REVOKED']);

// Export enum values for use in components
export const ApiKeyStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  REVOKED: 'REVOKED'
} as const;

// Base API Key validation schema
export const ApiKeyBaseSchema = z.object({
  id: z.string().cuid("Invalid ID format"),
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable()
    .transform(val => val || undefined),
  key: z.string().optional(),
  keyPrefix: z.string()
    .min(12, "Key prefix too short")
    .regex(/^ak_[a-z]+_[a-zA-Z0-9]{3}\.\.\./, "Invalid key prefix format"),
  status: ApiKeyStatusSchema,
  expiresAt: z.date().nullable().optional(),
  userId: z.string().cuid("Invalid user ID format"),
  totalRequests: z.number().int().min(0).default(0),
  lastUsedAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create API Key request validation
export const CreateApiKeyRequestSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .regex(/^[a-zA-Z0-9\s\-_\.\(\)]+$/, "Name contains invalid characters"),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable()
    .transform(val => val && val.trim() ? val.trim() : undefined),
  expiresAt: z.union([
    z.string()
      .datetime("Invalid date format")
      .transform(val => {
        const date = new Date(val);
        if (date <= new Date()) {
          throw new Error("Expiration date must be in the future");
        }
        return date;
      }),
    z.undefined(),
    z.null()
  ])
  .optional()
  .transform(val => val === null ? undefined : val),
});

// Update API Key request validation
export const UpdateApiKeyRequestSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .regex(/^[a-zA-Z0-9\s\-_\.\(\)]+$/, "Name contains invalid characters")
    .optional(),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable()
    .transform(val => val && val.trim() ? val.trim() : undefined),
  status: ApiKeyStatusSchema.optional(),
  expiresAt: z.string()
    .datetime("Invalid date format")
    .optional()
    .nullable()
    .transform(val => {
      if (!val || val.trim() === '') return undefined;
      const date = new Date(val);
      if (date <= new Date()) {
        throw new Error("Expiration date must be in the future");
      }
      return date;
    }),
});

// Query parameters validation for listing API keys
export const ApiKeyQueryParamsSchema = z.object({
  page: z.string()
    .optional()
    .transform(val => {
      if (!val) return 1;
      const parsed = parseInt(val);
      return isNaN(parsed) ? 1 : Math.max(1, parsed);
    }),
  limit: z.string()
    .optional()
    .transform(val => {
      if (!val) return 20;
      const parsed = parseInt(val);
      return isNaN(parsed) ? 20 : Math.min(100, Math.max(1, parsed));
    }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'REVOKED', 'all'])
    .optional()
    .default('all'),
  search: z.string()
    .max(100, "Search term too long")
    .optional()
    .transform(val => val?.trim() || undefined),
});

// Bulk delete validation
export const BulkDeleteApiKeysSchema = z.object({
  keyIds: z.array(z.string().cuid("Invalid key ID format"))
    .min(1, "At least one key ID is required")
    .max(50, "Maximum 50 keys can be deleted at once"),
});

// API Key response validation
export const ApiKeyResponseSchema = z.object({
  apiKey: ApiKeyBaseSchema,
});

// API Keys list response validation
export const ApiKeysListResponseSchema = z.object({
  apiKeys: z.array(ApiKeyBaseSchema),
  pagination: z.object({
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    limit: z.number().int().min(1).max(100),
    pages: z.number().int().min(0),
  }),
  usingMockData: z.boolean().optional(),
});

// Create API Key response validation
export const CreateApiKeyResponseSchema = z.object({
  apiKey: ApiKeyBaseSchema,
  key: z.string()
    .regex(/^ak_[a-z]+_[a-zA-Z0-9]{32}$/, "Invalid API key format"),
  message: z.string(),
});

// API Key statistics validation
export const ApiKeyStatsSchema = z.object({
  total: z.number().int().min(0),
  active: z.number().int().min(0),
  inactive: z.number().int().min(0),
  revoked: z.number().int().min(0),
  recentlyUsed: z.number().int().min(0),
  totalRequests: z.number().int().min(0),
  averageRequestsPerKey: z.number().int().min(0),
  lastUpdated: z.string().datetime(),
  usingMockData: z.boolean().optional(),
});

// Parameter validation helpers
export const validateKeyId = (keyId: string) => {
  const schema = z.string().cuid("Invalid key ID format");
  return schema.parse(keyId);
};

// API Key format validation
export const validateApiKeyFormat = (key: string): boolean => {
  const pattern = /^ak_[a-z]+_[a-zA-Z0-9]{32}$/;
  return pattern.test(key);
};

// Utility to extract key prefix
export const extractKeyPrefix = (key: string): string => {
  if (!validateApiKeyFormat(key)) {
    throw new Error("Invalid API key format");
  }
  return key.substring(0, 12) + '...';
};

// Environment-based key generation validation
export const validateKeyEnvironment = (environment?: string): string => {
  const validEnvironments = ['dev', 'staging', 'prod'];
  if (!environment) {
    return process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  }
  if (!validEnvironments.includes(environment)) {
    throw new Error(`Invalid environment: ${environment}. Must be one of: ${validEnvironments.join(', ')}`);
  }
  return environment;
};

// Type exports for use in other files
export type ApiKeyStatusType = z.infer<typeof ApiKeyStatusSchema>;
export type ApiKey = z.infer<typeof ApiKeyBaseSchema>;
export type CreateApiKeyRequest = z.infer<typeof CreateApiKeyRequestSchema>;
export type UpdateApiKeyRequest = z.infer<typeof UpdateApiKeyRequestSchema>;

// Input types for frontend forms (before transformation)
export type CreateApiKeyRequestInput = {
  name: string;
  description?: string;
  expiresAt?: string;
};
export type ApiKeyQueryParams = z.infer<typeof ApiKeyQueryParamsSchema>;
export type BulkDeleteApiKeys = z.infer<typeof BulkDeleteApiKeysSchema>;
export type ApiKeyResponse = z.infer<typeof ApiKeyResponseSchema>;
export type ApiKeysListResponse = z.infer<typeof ApiKeysListResponseSchema>;
export type CreateApiKeyResponse = z.infer<typeof CreateApiKeyResponseSchema>;
export type ApiKeyStats = z.infer<typeof ApiKeyStatsSchema>;