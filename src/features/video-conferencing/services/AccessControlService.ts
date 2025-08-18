/**
 * AccessControlService
 * Handles role-based access control for video conferencing features
 */
import { auth } from "@/src/config/auth/auth";
import { PrismaClient } from "@prisma/client";

export interface UserPermissions {
  canCreateSpaces: boolean;
  canEditSpaces: boolean;
  canDeleteSpaces: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
  canManageIntegrations: boolean;
  canViewAllSpaces: boolean;
  canModerateSpaces: boolean;
  allowedProviders: string[];
  maxSpacesPerUser?: number;
}

export interface AccessControlRule {
  role: string;
  permissions: UserPermissions;
  restrictions?: {
    maxSpacesPerDay?: number;
    maxParticipantsPerSpace?: number;
    allowedTimeSlots?: string[];
    requiredApproval?: boolean;
  };
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export class AccessControlService {
  private prisma: PrismaClient;
  private accessRules: Map<string, AccessControlRule> = new Map();
  private auditLogs: AuditLogEntry[] = [];

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.initializeAccessRules();
  }

  /**
   * Initialize default access rules for different roles
   */
  private initializeAccessRules(): void {
    // Admin role - full access
    this.accessRules.set("ADMIN", {
      role: "ADMIN",
      permissions: {
        canCreateSpaces: true,
        canEditSpaces: true,
        canDeleteSpaces: true,
        canViewAnalytics: true,
        canExportData: true,
        canManageIntegrations: true,
        canViewAllSpaces: true,
        canModerateSpaces: true,
        allowedProviders: ["GOOGLE_MEET", "ZOOM", "VIMEO"],
      },
    });

    // Trainer role - can create and manage their own spaces
    this.accessRules.set("TRAINER", {
      role: "TRAINER",
      permissions: {
        canCreateSpaces: true,
        canEditSpaces: true,
        canDeleteSpaces: false, // Can only archive
        canViewAnalytics: true,
        canExportData: true,
        canManageIntegrations: false,
        canViewAllSpaces: false, // Only their own
        canModerateSpaces: true,
        allowedProviders: ["GOOGLE_MEET", "ZOOM"],
        maxSpacesPerUser: 10,
      },
      restrictions: {
        maxSpacesPerDay: 5,
        maxParticipantsPerSpace: 100,
        requiredApproval: false,
      },
    });

    // Employee role - limited access
    this.accessRules.set("EMPLOYEE", {
      role: "EMPLOYEE",
      permissions: {
        canCreateSpaces: true,
        canEditSpaces: true,
        canDeleteSpaces: false,
        canViewAnalytics: false, // Only basic stats
        canExportData: false,
        canManageIntegrations: false,
        canViewAllSpaces: false,
        canModerateSpaces: false,
        allowedProviders: ["GOOGLE_MEET"],
        maxSpacesPerUser: 5,
      },
      restrictions: {
        maxSpacesPerDay: 2,
        maxParticipantsPerSpace: 50,
        requiredApproval: true,
      },
    });

    // Read-only role - view only
    this.accessRules.set("VIEWER", {
      role: "VIEWER",
      permissions: {
        canCreateSpaces: false,
        canEditSpaces: false,
        canDeleteSpaces: false,
        canViewAnalytics: true,
        canExportData: false,
        canManageIntegrations: false,
        canViewAllSpaces: true,
        canModerateSpaces: false,
        allowedProviders: [],
      },
    });

    // Client role - very limited access
    this.accessRules.set("CLIENT", {
      role: "CLIENT",
      permissions: {
        canCreateSpaces: false,
        canEditSpaces: false,
        canDeleteSpaces: false,
        canViewAnalytics: false,
        canExportData: false,
        canManageIntegrations: false,
        canViewAllSpaces: false,
        canModerateSpaces: false,
        allowedProviders: [],
      },
    });
  }

  /**
   * Get user permissions based on their role
   */
  async getUserPermissions(userId: string): Promise<UserPermissions | null> {
    try {
      const session = await auth();
      if (!session?.user || session.user.id !== userId) {
        return null;
      }

      const userRole = session.user.role || "CLIENT";
      const accessRule = this.accessRules.get(userRole);

      if (!accessRule) {
        // Default to most restrictive permissions
        return this.accessRules.get("CLIENT")?.permissions || null;
      }

      return accessRule.permissions;
    } catch (error) {
      console.error("Error getting user permissions:", error);
      return null;
    }
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(
    userId: string,
    permission: keyof UserPermissions
  ): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      if (!permissions) return false;

      return Boolean(permissions[permission]);
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  }

  /**
   * Check if user can access a specific video space
   */
  async canAccessVideoSpace(
    userId: string,
    spaceId: string,
    action: "view" | "edit" | "delete" | "moderate"
  ): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      if (!permissions) return false;

      // Get the video space
      const videoSpace = await this.prisma.videoSpace.findUnique({
        where: { id: spaceId },
        include: { createdBy: true },
      });

      if (!videoSpace) return false;

      // Check basic permissions
      switch (action) {
        case "view":
          if (permissions.canViewAllSpaces) return true;
          return videoSpace.createdById === userId;

        case "edit":
          if (!permissions.canEditSpaces) return false;
          if (permissions.canViewAllSpaces) return true;
          return videoSpace.createdById === userId;

        case "delete":
          if (!permissions.canDeleteSpaces) return false;
          if (permissions.canViewAllSpaces) return true;
          return videoSpace.createdById === userId;

        case "moderate":
          if (!permissions.canModerateSpaces) return false;
          if (permissions.canViewAllSpaces) return true;
          return videoSpace.createdById === userId;

        default:
          return false;
      }
    } catch (error) {
      console.error("Error checking video space access:", error);
      return false;
    }
  }

  /**
   * Filter video spaces based on user permissions
   */
  async filterVideoSpacesForUser(
    userId: string,
    spaces: any[]
  ): Promise<any[]> {
    try {
      const permissions = await this.getUserPermissions(userId);
      if (!permissions) return [];

      // If user can view all spaces, return all
      if (permissions.canViewAllSpaces) {
        return spaces;
      }

      // Otherwise, only return spaces they created
      return spaces.filter((space) => space.createdById === userId);
    } catch (error) {
      console.error("Error filtering video spaces:", error);
      return [];
    }
  }

  /**
   * Check if user can create a new video space
   */
  async canCreateVideoSpace(
    userId: string,
    provider: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const permissions = await this.getUserPermissions(userId);
      if (!permissions) {
        return { allowed: false, reason: "No permissions found" };
      }

      if (!permissions.canCreateSpaces) {
        return { allowed: false, reason: "User cannot create video spaces" };
      }

      if (!permissions.allowedProviders.includes(provider)) {
        return {
          allowed: false,
          reason: `Provider ${provider} not allowed for this user`,
        };
      }

      const session = await auth();
      const userRole = session?.user?.role || "CLIENT";
      const accessRule = this.accessRules.get(userRole);

      if (accessRule?.restrictions) {
        // Check daily limit
        if (accessRule.restrictions.maxSpacesPerDay) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const spacesToday = await this.prisma.videoSpace.count({
            where: {
              createdById: userId,
              createdAt: {
                gte: today,
              },
            },
          });

          if (spacesToday >= accessRule.restrictions.maxSpacesPerDay) {
            return {
              allowed: false,
              reason: `Daily limit of ${accessRule.restrictions.maxSpacesPerDay} spaces reached`,
            };
          }
        }

        // Check total limit
        if (permissions.maxSpacesPerUser) {
          const totalSpaces = await this.prisma.videoSpace.count({
            where: {
              createdById: userId,
              status: { not: "DELETED" },
            },
          });

          if (totalSpaces >= permissions.maxSpacesPerUser) {
            return {
              allowed: false,
              reason: `Maximum of ${permissions.maxSpacesPerUser} spaces allowed`,
            };
          }
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error("Error checking video space creation:", error);
      return { allowed: false, reason: "Internal error" };
    }
  }

  /**
   * Log user action for audit purposes
   */
  async logUserAction(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    details?: any,
    success: boolean = true,
    errorMessage?: string,
    request?: any
  ): Promise<void> {
    try {
      const session = await auth();
      const userEmail = session?.user?.email || "unknown";

      const auditEntry: AuditLogEntry = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        userEmail,
        action,
        resource,
        resourceId,
        details: details || {},
        timestamp: new Date(),
        ipAddress:
          request?.ip || request?.headers?.["x-forwarded-for"] || "unknown",
        userAgent: request?.headers?.["user-agent"] || "unknown",
        success,
        errorMessage,
      };

      this.auditLogs.push(auditEntry);

      // Keep only last 1000 entries in memory
      if (this.auditLogs.length > 1000) {
        this.auditLogs = this.auditLogs.slice(-1000);
      }

      // In a real implementation, you would store this in the database
      console.log("Audit log entry:", auditEntry);
    } catch (error) {
      console.error("Error logging user action:", error);
    }
  }

  /**
   * Get audit logs for a user
   */
  async getUserAuditLogs(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<AuditLogEntry[]> {
    try {
      const permissions = await this.getUserPermissions(userId);
      if (!permissions) return [];

      // Only admins can view all audit logs
      const session = await auth();
      const isAdmin = session?.user?.role === "ADMIN";

      let filteredLogs = this.auditLogs;

      if (!isAdmin) {
        // Non-admins can only see their own logs
        filteredLogs = this.auditLogs.filter((log) => log.userId === userId);
      }

      return filteredLogs
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(offset, offset + limit);
    } catch (error) {
      console.error("Error getting audit logs:", error);
      return [];
    }
  }

  /**
   * Update access rules for a role
   */
  updateAccessRule(role: string, rule: AccessControlRule): void {
    this.accessRules.set(role, rule);
  }

  /**
   * Get all access rules
   */
  getAllAccessRules(): Map<string, AccessControlRule> {
    return new Map(this.accessRules);
  }

  /**
   * Validate API request permissions
   */
  async validateApiAccess(
    userId: string,
    endpoint: string,
    method: string,
    resourceId?: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const permissions = await this.getUserPermissions(userId);
      if (!permissions) {
        return { allowed: false, reason: "No permissions found" };
      }

      // Define endpoint permission mappings
      const endpointPermissions: Record<string, keyof UserPermissions> = {
        "POST /api/video-conferencing/spaces": "canCreateSpaces",
        "PUT /api/video-conferencing/spaces": "canEditSpaces",
        "PATCH /api/video-conferencing/spaces": "canEditSpaces",
        "DELETE /api/video-conferencing/spaces": "canDeleteSpaces",
        "GET /api/video-conferencing/analytics": "canViewAnalytics",
        "GET /api/video-conferencing/export": "canExportData",
        "POST /api/video-conferencing/integrations": "canManageIntegrations",
        "PUT /api/video-conferencing/integrations": "canManageIntegrations",
        "DELETE /api/video-conferencing/integrations": "canManageIntegrations",
      };

      const key = `${method} ${endpoint}`;
      const requiredPermission = endpointPermissions[key];

      if (requiredPermission && !permissions[requiredPermission]) {
        return {
          allowed: false,
          reason: `Missing permission: ${requiredPermission}`,
        };
      }

      // Additional checks for specific resources
      if (
        resourceId &&
        (method === "PUT" || method === "PATCH" || method === "DELETE")
      ) {
        const canAccess = await this.canAccessVideoSpace(
          userId,
          resourceId,
          method === "DELETE" ? "delete" : "edit"
        );

        if (!canAccess) {
          return {
            allowed: false,
            reason: "No access to this resource",
          };
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error("Error validating API access:", error);
      return { allowed: false, reason: "Internal error" };
    }
  }

  /**
   * Get user restrictions
   */
  async getUserRestrictions(
    userId: string
  ): Promise<AccessControlRule["restrictions"] | null> {
    try {
      const session = await auth();
      if (!session?.user || session.user.id !== userId) {
        return null;
      }

      const userRole = session.user.role || "CLIENT";
      const accessRule = this.accessRules.get(userRole);

      return accessRule?.restrictions || null;
    } catch (error) {
      console.error("Error getting user restrictions:", error);
      return null;
    }
  }

  /**
   * Check if action requires approval
   */
  async requiresApproval(userId: string, action: string): Promise<boolean> {
    try {
      const restrictions = await getUserRestrictions(userId);
      return restrictions?.requiredApproval || false;
    } catch (error) {
      console.error("Error checking approval requirement:", error);
      return true; // Default to requiring approval on error
    }
  }
}

// Helper function to get user restrictions (exported for use in other modules)
export async function getUserRestrictions(
  userId: string
): Promise<AccessControlRule["restrictions"] | null> {
  try {
    const session = await auth();
    if (!session?.user || session.user.id !== userId) {
      return null;
    }

    const userRole = session.user.role || "CLIENT";

    // This would typically come from a service instance, but for simplicity:
    const accessRules = new Map<string, AccessControlRule>();

    // Initialize with default rules (simplified version)
    accessRules.set("ADMIN", {
      role: "ADMIN",
      permissions: {} as UserPermissions,
    });

    accessRules.set("TRAINER", {
      role: "TRAINER",
      permissions: {} as UserPermissions,
      restrictions: {
        maxSpacesPerDay: 5,
        maxParticipantsPerSpace: 100,
        requiredApproval: false,
      },
    });

    const accessRule = accessRules.get(userRole);
    return accessRule?.restrictions || null;
  } catch (error) {
    console.error("Error getting user restrictions:", error);
    return null;
  }
}
