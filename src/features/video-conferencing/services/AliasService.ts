/**
 * Alias Service
 * Handles CRUD operations and resolution for video space aliases
 */

import { PrismaClient } from "@prisma/client";
import type {
  LinkAlias,
  CreateLinkAliasRequest,
  UpdateLinkAliasRequest,
  LinkAliasFilters,
  ServiceResponse,
  PaginatedResponse,
  AliasResolution,
  BulkUpdateAliasesRequest,
  BulkUpdateAliasesResponse,
} from "../types";

export class AliasService {
  constructor(private prisma: PrismaClient) {}

  // =============================================================================
  // CRUD Operations
  // =============================================================================

  /**
   * Create a new alias for a video space
   */
  async createAlias(
    request: CreateLinkAliasRequest,
    ownerId: string
  ): Promise<ServiceResponse<LinkAlias>> {
    try {
      // Check if video space exists and belongs to the user
      const videoSpace = await this.prisma.videoSpace.findFirst({
        where: {
          id: request.videoSpaceId,
          ownerId,
        },
      });

      if (!videoSpace) {
        return {
          success: false,
          error: "Video space not found or access denied",
          code: "VIDEO_SPACE_NOT_FOUND",
        };
      }

      // Check if alias already exists
      const existingAlias = await this.prisma.linkAlias.findFirst({
        where: {
          alias: request.alias,
        },
      });

      if (existingAlias) {
        return {
          success: false,
          error: "Alias already exists",
          code: "ALIAS_ALREADY_EXISTS",
        };
      }

      // Create the alias
      const alias = await this.prisma.linkAlias.create({
        data: {
          alias: request.alias,
          videoSpaceId: request.videoSpaceId,
        },
        include: {
          videoSpace: {
            select: {
              id: true,
              name: true,
              provider: true,
              status: true,
              providerJoinUri: true,
            },
          },
        },
      });

      return {
        success: true,
        data: alias,
      };
    } catch (error) {
      console.error("Error creating alias:", error);
      return {
        success: false,
        error: "Failed to create alias",
        code: "ALIAS_CREATION_ERROR",
      };
    }
  }

  /**
   * Get aliases with filtering and pagination
   */
  async getAliases(
    filters: LinkAliasFilters,
    ownerId: string
  ): Promise<ServiceResponse<PaginatedResponse<LinkAlias>>> {
    try {
      const { page = 1, limit = 20, videoSpaceId, isActive, search } = filters;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      // Filter by video spaces owned by the user
      if (videoSpaceId) {
        // Verify the video space belongs to the user
        const videoSpace = await this.prisma.videoSpace.findFirst({
          where: {
            id: videoSpaceId,
            ownerId,
          },
        });

        if (!videoSpace) {
          return {
            success: false,
            error: "Video space not found or access denied",
            code: "VIDEO_SPACE_NOT_FOUND",
          };
        }

        where.videoSpaceId = videoSpaceId;
      } else {
        // Filter by all video spaces owned by the user
        where.videoSpace = {
          ownerId,
        };
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (search) {
        where.alias = {
          contains: search,
          mode: "insensitive",
        };
      }

      // Get total count
      const totalCount = await this.prisma.linkAlias.count({ where });

      // Get aliases
      const aliases = await this.prisma.linkAlias.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isActive: "desc" },
          { lastAccessedAt: "desc" },
          { createdAt: "desc" },
        ],
        include: {
          videoSpace: {
            select: {
              id: true,
              name: true,
              provider: true,
              status: true,
              providerJoinUri: true,
            },
          },
        },
      });

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: {
          data: aliases,
          total: totalCount,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      console.error("Error getting aliases:", error);
      return {
        success: false,
        error: "Failed to get aliases",
        code: "ALIAS_FETCH_ERROR",
      };
    }
  }

  /**
   * Get a specific alias by ID
   */
  async getAliasById(
    aliasId: string,
    ownerId: string
  ): Promise<ServiceResponse<LinkAlias>> {
    try {
      const alias = await this.prisma.linkAlias.findFirst({
        where: {
          id: aliasId,
          videoSpace: {
            ownerId,
          },
        },
        include: {
          videoSpace: {
            select: {
              id: true,
              name: true,
              provider: true,
              status: true,
              providerJoinUri: true,
            },
          },
        },
      });

      if (!alias) {
        return {
          success: false,
          error: "Alias not found or access denied",
          code: "ALIAS_NOT_FOUND",
        };
      }

      return {
        success: true,
        data: alias,
      };
    } catch (error) {
      console.error("Error getting alias:", error);
      return {
        success: false,
        error: "Failed to get alias",
        code: "ALIAS_FETCH_ERROR",
      };
    }
  }

  /**
   * Update an alias
   */
  async updateAlias(
    aliasId: string,
    request: UpdateLinkAliasRequest,
    ownerId: string
  ): Promise<ServiceResponse<LinkAlias>> {
    try {
      // Check if alias exists and belongs to the user
      const existingAlias = await this.prisma.linkAlias.findFirst({
        where: {
          id: aliasId,
          videoSpace: {
            ownerId,
          },
        },
      });

      if (!existingAlias) {
        return {
          success: false,
          error: "Alias not found or access denied",
          code: "ALIAS_NOT_FOUND",
        };
      }

      // If updating alias name, check for uniqueness
      if (request.alias && request.alias !== existingAlias.alias) {
        const aliasExists = await this.prisma.linkAlias.findFirst({
          where: {
            alias: request.alias,
            id: { not: aliasId },
          },
        });

        if (aliasExists) {
          return {
            success: false,
            error: "Alias already exists",
            code: "ALIAS_ALREADY_EXISTS",
          };
        }
      }

      // Update the alias
      const updatedAlias = await this.prisma.linkAlias.update({
        where: { id: aliasId },
        data: request,
        include: {
          videoSpace: {
            select: {
              id: true,
              name: true,
              provider: true,
              status: true,
              providerJoinUri: true,
            },
          },
        },
      });

      return {
        success: true,
        data: updatedAlias,
      };
    } catch (error) {
      console.error("Error updating alias:", error);
      return {
        success: false,
        error: "Failed to update alias",
        code: "ALIAS_UPDATE_ERROR",
      };
    }
  }

  /**
   * Delete an alias (soft delete by setting isActive to false)
   */
  async deleteAlias(
    aliasId: string,
    ownerId: string,
    permanent: boolean = false
  ): Promise<ServiceResponse<void>> {
    try {
      // Check if alias exists and belongs to the user
      const existingAlias = await this.prisma.linkAlias.findFirst({
        where: {
          id: aliasId,
          videoSpace: {
            ownerId,
          },
        },
      });

      if (!existingAlias) {
        return {
          success: false,
          error: "Alias not found or access denied",
          code: "ALIAS_NOT_FOUND",
        };
      }

      if (permanent) {
        // Hard delete
        await this.prisma.linkAlias.delete({
          where: { id: aliasId },
        });
      } else {
        // Soft delete
        await this.prisma.linkAlias.update({
          where: { id: aliasId },
          data: { isActive: false },
        });
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting alias:", error);
      return {
        success: false,
        error: "Failed to delete alias",
        code: "ALIAS_DELETE_ERROR",
      };
    }
  }

  // =============================================================================
  // Alias Resolution
  // =============================================================================

  /**
   * Resolve an alias to its video space and redirect URL
   */
  async resolveAlias(alias: string): Promise<ServiceResponse<AliasResolution>> {
    try {
      const linkAlias = await this.prisma.linkAlias.findFirst({
        where: {
          alias,
          isActive: true,
        },
        include: {
          videoSpace: {
            select: {
              id: true,
              name: true,
              provider: true,
              status: true,
              providerJoinUri: true,
              providerRoomId: true,
            },
          },
        },
      });

      if (!linkAlias) {
        return {
          success: false,
          error: "Alias not found or inactive",
          code: "ALIAS_NOT_FOUND",
        };
      }

      if (linkAlias.videoSpace.status !== "ACTIVE") {
        return {
          success: false,
          error: "Video space is not active",
          code: "VIDEO_SPACE_INACTIVE",
        };
      }

      if (!linkAlias.videoSpace.providerJoinUri) {
        return {
          success: false,
          error: "Video space has no join URL",
          code: "NO_JOIN_URL",
        };
      }

      // Update access tracking
      await this.prisma.linkAlias.update({
        where: { id: linkAlias.id },
        data: {
          accessCount: { increment: 1 },
          lastAccessedAt: new Date(),
        },
      });

      return {
        success: true,
        data: {
          alias: linkAlias.alias,
          videoSpace: linkAlias.videoSpace,
          redirectUrl: linkAlias.videoSpace.providerJoinUri,
          accessCount: linkAlias.accessCount + 1,
          lastAccessedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Error resolving alias:", error);
      return {
        success: false,
        error: "Failed to resolve alias",
        code: "ALIAS_RESOLUTION_ERROR",
      };
    }
  }

  /**
   * Check if an alias is available
   */
  async isAliasAvailable(alias: string): Promise<ServiceResponse<boolean>> {
    try {
      const existingAlias = await this.prisma.linkAlias.findFirst({
        where: { alias },
      });

      return {
        success: true,
        data: !existingAlias,
      };
    } catch (error) {
      console.error("Error checking alias availability:", error);
      return {
        success: false,
        error: "Failed to check alias availability",
        code: "ALIAS_CHECK_ERROR",
      };
    }
  }

  // =============================================================================
  // Bulk Operations
  // =============================================================================

  /**
   * Bulk update aliases
   */
  async bulkUpdateAliases(
    request: BulkUpdateAliasesRequest,
    ownerId: string
  ): Promise<ServiceResponse<BulkUpdateAliasesResponse>> {
    try {
      const results = [];
      let successful = 0;
      let failed = 0;

      for (const aliasId of request.aliasIds) {
        try {
          // Check if alias exists and belongs to the user
          const existingAlias = await this.prisma.linkAlias.findFirst({
            where: {
              id: aliasId,
              videoSpace: {
                ownerId,
              },
            },
          });

          if (!existingAlias) {
            results.push({
              id: aliasId,
              alias: "unknown",
              success: false,
              error: "Alias not found or access denied",
            });
            failed++;
            continue;
          }

          // Update the alias
          await this.prisma.linkAlias.update({
            where: { id: aliasId },
            data: request.updates,
          });

          results.push({
            id: aliasId,
            alias: existingAlias.alias,
            success: true,
          });
          successful++;
        } catch (error) {
          results.push({
            id: aliasId,
            alias: "unknown",
            success: false,
            error: "Update failed",
          });
          failed++;
        }
      }

      return {
        success: true,
        data: {
          updated: results,
          summary: {
            total: request.aliasIds.length,
            successful,
            failed,
          },
        },
      };
    } catch (error) {
      console.error("Error bulk updating aliases:", error);
      return {
        success: false,
        error: "Failed to bulk update aliases",
        code: "BULK_UPDATE_ERROR",
      };
    }
  }

  // =============================================================================
  // Analytics and Statistics
  // =============================================================================

  /**
   * Get alias usage statistics
   */
  async getAliasStats(
    ownerId: string,
    videoSpaceId?: string
  ): Promise<
    ServiceResponse<{
      totalAliases: number;
      activeAliases: number;
      inactiveAliases: number;
      totalAccesses: number;
      mostAccessedAliases: Array<{
        alias: string;
        accessCount: number;
        videoSpaceName: string;
      }>;
      recentlyAccessedAliases: Array<{
        alias: string;
        lastAccessedAt: Date;
        videoSpaceName: string;
      }>;
    }>
  > {
    try {
      const where: any = {
        videoSpace: {
          ownerId,
        },
      };

      if (videoSpaceId) {
        where.videoSpaceId = videoSpaceId;
      }

      // Get basic counts
      const [totalAliases, activeAliases, inactiveAliases] = await Promise.all([
        this.prisma.linkAlias.count({ where }),
        this.prisma.linkAlias.count({ where: { ...where, isActive: true } }),
        this.prisma.linkAlias.count({ where: { ...where, isActive: false } }),
      ]);

      // Get total accesses
      const accessStats = await this.prisma.linkAlias.aggregate({
        where,
        _sum: {
          accessCount: true,
        },
      });

      // Get most accessed aliases
      const mostAccessedAliases = await this.prisma.linkAlias.findMany({
        where,
        orderBy: { accessCount: "desc" },
        take: 10,
        include: {
          videoSpace: {
            select: {
              name: true,
            },
          },
        },
      });

      // Get recently accessed aliases
      const recentlyAccessedAliases = await this.prisma.linkAlias.findMany({
        where: {
          ...where,
          lastAccessedAt: { not: null },
        },
        orderBy: { lastAccessedAt: "desc" },
        take: 10,
        include: {
          videoSpace: {
            select: {
              name: true,
            },
          },
        },
      });

      return {
        success: true,
        data: {
          totalAliases,
          activeAliases,
          inactiveAliases,
          totalAccesses: accessStats._sum.accessCount || 0,
          mostAccessedAliases: mostAccessedAliases.map((alias) => ({
            alias: alias.alias,
            accessCount: alias.accessCount,
            videoSpaceName: alias.videoSpace.name,
          })),
          recentlyAccessedAliases: recentlyAccessedAliases.map((alias) => ({
            alias: alias.alias,
            lastAccessedAt: alias.lastAccessedAt!,
            videoSpaceName: alias.videoSpace.name,
          })),
        },
      };
    } catch (error) {
      console.error("Error getting alias stats:", error);
      return {
        success: false,
        error: "Failed to get alias statistics",
        code: "ALIAS_STATS_ERROR",
      };
    }
  }
}
