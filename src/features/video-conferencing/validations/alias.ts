/**
 * Link Alias Validation Schemas
 * Zod schemas for alias management operations
 */

import { z } from "zod";

// =============================================================================
// Base Schemas
// =============================================================================

export const linkAliasSchema = z.object({
  id: z.string(),
  alias: z.string(),
  videoSpaceId: z.string(),
  isActive: z.boolean(),
  accessCount: z.number().int().min(0),
  lastAccessedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// =============================================================================
// Request Validation Schemas
// =============================================================================

export const createLinkAliasRequestSchema = z.object({
  alias: z
    .string()
    .min(1, "Alias is required")
    .max(100, "Alias must be less than 100 characters")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Alias can only contain letters, numbers, hyphens, and underscores"
    )
    .refine(
      (alias) => !alias.startsWith("-") && !alias.endsWith("-"),
      "Alias cannot start or end with a hyphen"
    )
    .refine(
      (alias) => !alias.startsWith("_") && !alias.endsWith("_"),
      "Alias cannot start or end with an underscore"
    ),
  videoSpaceId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid video space ID format"),
});

export const updateLinkAliasRequestSchema = z.object({
  alias: z
    .string()
    .min(1, "Alias is required")
    .max(100, "Alias must be less than 100 characters")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Alias can only contain letters, numbers, hyphens, and underscores"
    )
    .refine(
      (alias) => !alias.startsWith("-") && !alias.endsWith("-"),
      "Alias cannot start or end with a hyphen"
    )
    .refine(
      (alias) => !alias.startsWith("_") && !alias.endsWith("_"),
      "Alias cannot start or end with an underscore"
    )
    .optional(),
  isActive: z.boolean().optional(),
});

export const linkAliasFiltersSchema = z.object({
  videoSpaceId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid video space ID format")
    .optional(),
  isActive: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  search: z.string().optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1))
    .default("1"),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100))
    .default("20"),
});

// =============================================================================
// Response Validation Schemas
// =============================================================================

export const linkAliasResponseSchema = z.object({
  id: z.string(),
  alias: z.string(),
  videoSpaceId: z.string(),
  videoSpace: z
    .object({
      id: z.string(),
      name: z.string(),
      provider: z.enum(["MEET", "ZOOM", "VIMEO"]),
      status: z.enum(["ACTIVE", "INACTIVE", "DISABLED", "EXPIRED"]),
      providerJoinUri: z.string().nullable(),
    })
    .optional(),
  isActive: z.boolean(),
  accessCount: z.number().int().min(0),
  lastAccessedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const linkAliasListResponseSchema = z.object({
  data: z.array(linkAliasResponseSchema),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    totalCount: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
  filters: z.object({
    videoSpaceId: z.string().optional(),
    isActive: z.boolean().optional(),
    search: z.string().optional(),
  }),
});

// =============================================================================
// Alias Resolution Schema
// =============================================================================

export const aliasResolutionSchema = z.object({
  alias: z.string(),
  videoSpace: z.object({
    id: z.string(),
    name: z.string(),
    provider: z.enum(["MEET", "ZOOM", "VIMEO"]),
    status: z.enum(["ACTIVE", "INACTIVE", "DISABLED", "EXPIRED"]),
    providerJoinUri: z.string().nullable(),
    providerRoomId: z.string().nullable(),
  }),
  redirectUrl: z.string().url(),
  accessCount: z.number().int().min(0),
  lastAccessedAt: z.string().nullable(),
});

// =============================================================================
// Bulk Operations Schemas
// =============================================================================

export const bulkUpdateAliasesRequestSchema = z.object({
  aliasIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid alias ID format"))
    .min(1, "At least one alias ID is required")
    .max(50, "Cannot update more than 50 aliases at once"),
  updates: z.object({
    isActive: z.boolean().optional(),
  }),
});

export const bulkUpdateAliasesResponseSchema = z.object({
  updated: z.array(
    z.object({
      id: z.string(),
      alias: z.string(),
      success: z.boolean(),
      error: z.string().optional(),
    })
  ),
  summary: z.object({
    total: z.number().int().min(0),
    successful: z.number().int().min(0),
    failed: z.number().int().min(0),
  }),
});

// =============================================================================
// Type Exports
// =============================================================================

export type LinkAlias = z.infer<typeof linkAliasSchema>;
export type CreateLinkAliasRequest = z.infer<
  typeof createLinkAliasRequestSchema
>;
export type UpdateLinkAliasRequest = z.infer<
  typeof updateLinkAliasRequestSchema
>;
export type LinkAliasFilters = z.infer<typeof linkAliasFiltersSchema>;
export type LinkAliasResponse = z.infer<typeof linkAliasResponseSchema>;
export type LinkAliasListResponse = z.infer<typeof linkAliasListResponseSchema>;
export type AliasResolution = z.infer<typeof aliasResolutionSchema>;
export type BulkUpdateAliasesRequest = z.infer<
  typeof bulkUpdateAliasesRequestSchema
>;
export type BulkUpdateAliasesResponse = z.infer<
  typeof bulkUpdateAliasesResponseSchema
>;
