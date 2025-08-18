/**
 * AccessControlService Tests
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { AccessControlService } from "../AccessControlService";

// Mock auth function
vi.mock("@/src/config/auth/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/src/config/auth/auth";

// Mock Prisma Client
const mockPrisma = {
  videoSpace: {
    findUnique: vi.fn(),
    count: vi.fn(),
  },
} as unknown as PrismaClient;

describe("AccessControlService", () => {
  let service: AccessControlService;
  const mockAuth = auth as any;

  beforeEach(() => {
    service = new AccessControlService(mockPrisma);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getUserPermissions", () => {
    it("should return ADMIN permissions", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", role: "ADMIN" },
      });

      const permissions = await service.getUserPermissions("user-123");

      expect(permissions).toMatchObject({
        canCreateSpaces: true,
        canEditSpaces: true,
        canDeleteSpaces: true,
        canViewAnalytics: true,
        canExportData: true,
        canManageIntegrations: true,
        canViewAllSpaces: true,
        canModerateSpaces: true,
        allowedProviders: ["GOOGLE_MEET", "ZOOM", "VIMEO"],
      });
    });

    it("should return TRAINER permissions", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", role: "TRAINER" },
      });

      const permissions = await service.getUserPermissions("user-123");

      expect(permissions).toMatchObject({
        canCreateSpaces: true,
        canEditSpaces: true,
        canDeleteSpaces: false,
        canViewAnalytics: true,
        canExportData: true,
        canManageIntegrations: false,
        canViewAllSpaces: false,
        canModerateSpaces: true,
        allowedProviders: ["GOOGLE_MEET", "ZOOM"],
        maxSpacesPerUser: 10,
      });
    });

    it("should return EMPLOYEE permissions", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", role: "EMPLOYEE" },
      });

      const permissions = await service.getUserPermissions("user-123");

      expect(permissions).toMatchObject({
        canCreateSpaces: true,
        canEditSpaces: true,
        canDeleteSpaces: false,
        canViewAnalytics: false,
        canExportData: false,
        canManageIntegrations: false,
        canViewAllSpaces: false,
        canModerateSpaces: false,
        allowedProviders: ["GOOGLE_MEET"],
        maxSpacesPerUser: 5,
      });
    });

    it("should return CLIENT permissions", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", role: "CLIENT" },
      });

      const permissions = await service.getUserPermissions("user-123");

      expect(permissions).toMatchObject({
        canCreateSpaces: false,
        canEditSpaces: false,
        canDeleteSpaces: false,
        canViewAnalytics: false,
        canExportData: false,
        canManageIntegrations: false,
        canViewAllSpaces: false,
        canModerateSpaces: false,
        allowedProviders: [],
      });
    });

    it("should return null for unauthorized user", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "other-user", role: "ADMIN" },
      });

      const permissions = await service.getUserPermissions("user-123");

      expect(permissions).toBeNull();
    });

    it("should return null when no session", async () => {
      mockAuth.mockResolvedValue(null);

      const permissions = await service.getUserPermissions("user-123");

      expect(permissions).toBeNull();
    });

    it("should default to CLIENT permissions for unknown role", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", role: "UNKNOWN_ROLE" },
      });

      const permissions = await service.getUserPermissions("user-123");

      expect(permissions).toMatchObject({
        canCreateSpaces: false,
        canEditSpaces: false,
        canDeleteSpaces: false,
      });
    });
  });

  describe("hasPermission", () => {
    it("should return true for valid permission", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", role: "ADMIN" },
      });

      const hasPermission = await service.hasPermission(
        "user-123",
        "canCreateSpaces"
      );

      expect(hasPermission).toBe(true);
    });

    it("should return false for invalid permission", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", role: "CLIENT" },
      });

      const hasPermission = await service.hasPermission(
        "user-123",
        "canCreateSpaces"
      );

      expect(hasPermission).toBe(false);
    });

    it("should return false when permissions are null", async () => {
      mockAuth.mockResolvedValue(null);

      const hasPermission = await service.hasPermission(
        "user-123",
        "canCreateSpaces"
      );

      expect(hasPermission).toBe(false);
    });

    it("should handle errors gracefully", async () => {
      mockAuth.mockRejectedValue(new Error("Auth error"));

      const hasPermission = await service.hasPermission(
        "user-123",
        "canCreateSpaces"
      );

      expect(hasPermission).toBe(false);
    });
  });

  describe("canAccessVideoSpace", () => {
    const mockVideoSpace = {
      id: "space-123",
      title: "Test Space",
      createdById: "owner-123",
      createdBy: { id: "owner-123", name: "Owner" },
    };

    beforeEach(() => {
      (mockPrisma.videoSpace.findUnique as any).mockResolvedValue(
        mockVideoSpace
      );
    });

    it("should allow admin to view any space", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "admin-123", role: "ADMIN" },
      });

      const canAccess = await service.canAccessVideoSpace(
        "admin-123",
        "space-123",
        "view"
      );

      expect(canAccess).toBe(true);
    });

    it("should allow owner to view their space", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "owner-123", role: "TRAINER" },
      });

      const canAccess = await service.canAccessVideoSpace(
        "owner-123",
        "space-123",
        "view"
      );

      expect(canAccess).toBe(true);
    });

    it("should deny non-owner trainer to view others space", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "other-123", role: "TRAINER" },
      });

      const canAccess = await service.canAccessVideoSpace(
        "other-123",
        "space-123",
        "view"
      );

      expect(canAccess).toBe(false);
    });

    it("should allow admin to edit any space", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "admin-123", role: "ADMIN" },
      });

      const canAccess = await service.canAccessVideoSpace(
        "admin-123",
        "space-123",
        "edit"
      );

      expect(canAccess).toBe(true);
    });

    it("should deny employee to edit space", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "employee-123", role: "EMPLOYEE" },
      });

      const canAccess = await service.canAccessVideoSpace(
        "employee-123",
        "space-123",
        "edit"
      );

      expect(canAccess).toBe(false);
    });

    it("should deny trainer to delete space", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "owner-123", role: "TRAINER" },
      });

      const canAccess = await service.canAccessVideoSpace(
        "owner-123",
        "space-123",
        "delete"
      );

      expect(canAccess).toBe(false);
    });

    it("should allow admin to delete any space", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "admin-123", role: "ADMIN" },
      });

      const canAccess = await service.canAccessVideoSpace(
        "admin-123",
        "space-123",
        "delete"
      );

      expect(canAccess).toBe(true);
    });

    it("should return false for non-existent space", async () => {
      (mockPrisma.videoSpace.findUnique as any).mockResolvedValue(null);
      mockAuth.mockResolvedValue({
        user: { id: "admin-123", role: "ADMIN" },
      });

      const canAccess = await service.canAccessVideoSpace(
        "admin-123",
        "non-existent",
        "view"
      );

      expect(canAccess).toBe(false);
    });

    it("should handle database errors", async () => {
      (mockPrisma.videoSpace.findUnique as any).mockRejectedValue(
        new Error("DB error")
      );
      mockAuth.mockResolvedValue({
        user: { id: "admin-123", role: "ADMIN" },
      });

      const canAccess = await service.canAccessVideoSpace(
        "admin-123",
        "space-123",
        "view"
      );

      expect(canAccess).toBe(false);
    });
  });

  describe("filterVideoSpacesForUser", () => {
    const mockSpaces = [
      { id: "space-1", title: "Space 1", createdById: "user-123" },
      { id: "space-2", title: "Space 2", createdById: "other-123" },
      { id: "space-3", title: "Space 3", createdById: "user-123" },
    ];

    it("should return all spaces for admin", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "admin-123", role: "ADMIN" },
      });

      const filtered = await service.filterVideoSpacesForUser(
        "admin-123",
        mockSpaces
      );

      expect(filtered).toHaveLength(3);
      expect(filtered).toEqual(mockSpaces);
    });

    it("should return only owned spaces for trainer", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", role: "TRAINER" },
      });

      const filtered = await service.filterVideoSpacesForUser(
        "user-123",
        mockSpaces
      );

      expect(filtered).toHaveLength(2);
      expect(filtered.every((space) => space.createdById === "user-123")).toBe(
        true
      );
    });

    it("should return empty array when no permissions", async () => {
      mockAuth.mockResolvedValue(null);

      const filtered = await service.filterVideoSpacesForUser(
        "user-123",
        mockSpaces
      );

      expect(filtered).toHaveLength(0);
    });

    it("should handle errors gracefully", async () => {
      mockAuth.mockRejectedValue(new Error("Auth error"));

      const filtered = await service.filterVideoSpacesForUser(
        "user-123",
        mockSpaces
      );

      expect(filtered).toHaveLength(0);
    });
  });

  describe("canCreateVideoSpace", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", role: "TRAINER" },
      });
    });

    it("should allow creation with valid provider", async () => {
      const result = await service.canCreateVideoSpace(
        "user-123",
        "GOOGLE_MEET"
      );

      expect(result.allowed).toBe(true);
    });

    it("should deny creation with invalid provider", async () => {
      const result = await service.canCreateVideoSpace("user-123", "VIMEO");

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("Provider VIMEO not allowed");
    });

    it("should deny creation when user cannot create spaces", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", role: "CLIENT" },
      });

      const result = await service.canCreateVideoSpace(
        "user-123",
        "GOOGLE_MEET"
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("User cannot create video spaces");
    });

    it("should check daily limits", async () => {
      // Mock today's spaces count to exceed limit
      (mockPrisma.videoSpace.count as any).mockResolvedValue(6); // Exceeds TRAINER limit of 5

      const result = await service.canCreateVideoSpace(
        "user-123",
        "GOOGLE_MEET"
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("Daily limit of 5 spaces reached");
    });

    it("should check total spaces limit", async () => {
      // Mock daily count as OK but total count exceeds limit
      (mockPrisma.videoSpace.count as any)
        .mockResolvedValueOnce(2) // Daily count
        .mockResolvedValueOnce(11); // Total count exceeds TRAINER limit of 10

      const result = await service.canCreateVideoSpace(
        "user-123",
        "GOOGLE_MEET"
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("Maximum of 10 spaces allowed");
    });

    it("should handle no permissions", async () => {
      mockAuth.mockResolvedValue(null);

      const result = await service.canCreateVideoSpace(
        "user-123",
        "GOOGLE_MEET"
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("No permissions found");
    });

    it("should handle database errors", async () => {
      (mockPrisma.videoSpace.count as any).mockRejectedValue(
        new Error("DB error")
      );

      const result = await service.canCreateVideoSpace(
        "user-123",
        "GOOGLE_MEET"
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("Internal error");
    });
  });

  describe("logUserAction", () => {
    it("should log user action", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", email: "user@example.com" },
      });

      await service.logUserAction(
        "user-123",
        "CREATE_SPACE",
        "video_space",
        "space-123",
        { provider: "zoom" },
        true
      );

      // Should add to audit logs (we can't directly test private array, but we can test the method doesn't throw)
      expect(true).toBe(true); // Test passes if no error thrown
    });

    it("should handle auth errors gracefully", async () => {
      mockAuth.mockRejectedValue(new Error("Auth error"));

      await expect(
        service.logUserAction("user-123", "CREATE_SPACE", "video_space")
      ).resolves.not.toThrow();
    });
  });

  describe("getUserAuditLogs", () => {
    beforeEach(async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", email: "user@example.com", role: "TRAINER" },
      });

      // Add some audit logs
      await service.logUserAction(
        "user-123",
        "CREATE_SPACE",
        "video_space",
        "space-1"
      );
      await service.logUserAction(
        "user-123",
        "EDIT_SPACE",
        "video_space",
        "space-1"
      );
      await service.logUserAction(
        "other-123",
        "CREATE_SPACE",
        "video_space",
        "space-2"
      );
    });

    it("should return user audit logs for non-admin", async () => {
      const logs = await service.getUserAuditLogs("user-123");

      expect(logs.length).toBeGreaterThan(0);
      // All logs should be for the requesting user
      logs.forEach((log) => {
        expect(log.userId).toBe("user-123");
      });
    });

    it("should return all audit logs for admin", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "admin-123", email: "admin@example.com", role: "ADMIN" },
      });

      const logs = await service.getUserAuditLogs("admin-123");

      expect(logs.length).toBeGreaterThan(0);
      // Should include logs from different users
      const userIds = [...new Set(logs.map((log) => log.userId))];
      expect(userIds.length).toBeGreaterThan(1);
    });

    it("should apply pagination", async () => {
      const firstPage = await service.getUserAuditLogs("user-123", 1, 0);
      const secondPage = await service.getUserAuditLogs("user-123", 1, 1);

      expect(firstPage).toHaveLength(1);
      expect(secondPage).toHaveLength(1);
      expect(firstPage[0].id).not.toBe(secondPage[0].id);
    });

    it("should return empty array when no permissions", async () => {
      mockAuth.mockResolvedValue(null);

      const logs = await service.getUserAuditLogs("user-123");

      expect(logs).toHaveLength(0);
    });
  });

  describe("validateApiAccess", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", role: "ADMIN" },
      });
    });

    it("should allow API access with correct permissions", async () => {
      const result = await service.validateApiAccess(
        "user-123",
        "/api/video-conferencing/spaces",
        "POST"
      );

      expect(result.allowed).toBe(true);
    });

    it("should deny API access without permissions", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", role: "CLIENT" },
      });

      const result = await service.validateApiAccess(
        "user-123",
        "/api/video-conferencing/spaces",
        "POST"
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("Missing permission");
    });

    it("should check resource access for specific operations", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", role: "TRAINER" },
      });

      (mockPrisma.videoSpace.findUnique as any).mockResolvedValue({
        id: "space-123",
        createdById: "other-123", // Different user
      });

      const result = await service.validateApiAccess(
        "user-123",
        "/api/video-conferencing/spaces",
        "DELETE",
        "space-123"
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("No access to this resource");
    });

    it("should handle no permissions", async () => {
      mockAuth.mockResolvedValue(null);

      const result = await service.validateApiAccess(
        "user-123",
        "/api/video-conferencing/spaces",
        "GET"
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("No permissions found");
    });

    it("should handle unknown endpoints", async () => {
      const result = await service.validateApiAccess(
        "user-123",
        "/api/unknown/endpoint",
        "GET"
      );

      expect(result.allowed).toBe(true); // Unknown endpoints are allowed by default
    });
  });

  describe("access rules management", () => {
    it("should update access rule", () => {
      const newRule = {
        role: "CUSTOM_ROLE",
        permissions: {
          canCreateSpaces: true,
          canEditSpaces: false,
          canDeleteSpaces: false,
          canViewAnalytics: true,
          canExportData: false,
          canManageIntegrations: false,
          canViewAllSpaces: false,
          canModerateSpaces: false,
          allowedProviders: ["GOOGLE_MEET"],
        },
      };

      service.updateAccessRule("CUSTOM_ROLE", newRule);

      const allRules = service.getAllAccessRules();
      expect(allRules.has("CUSTOM_ROLE")).toBe(true);
      expect(allRules.get("CUSTOM_ROLE")).toEqual(newRule);
    });

    it("should get all access rules", () => {
      const allRules = service.getAllAccessRules();

      expect(allRules.has("ADMIN")).toBe(true);
      expect(allRules.has("TRAINER")).toBe(true);
      expect(allRules.has("EMPLOYEE")).toBe(true);
      expect(allRules.has("VIEWER")).toBe(true);
      expect(allRules.has("CLIENT")).toBe(true);
    });
  });

  describe("getUserRestrictions", () => {
    it("should return restrictions for TRAINER", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", role: "TRAINER" },
      });

      const restrictions = await service.getUserRestrictions("user-123");

      expect(restrictions).toMatchObject({
        maxSpacesPerDay: 5,
        maxParticipantsPerSpace: 100,
        requiredApproval: false,
      });
    });

    it("should return null for ADMIN (no restrictions)", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123", role: "ADMIN" },
      });

      const restrictions = await service.getUserRestrictions("user-123");

      expect(restrictions).toBeNull();
    });

    it("should return null when no session", async () => {
      mockAuth.mockResolvedValue(null);

      const restrictions = await service.getUserRestrictions("user-123");

      expect(restrictions).toBeNull();
    });
  });
});
