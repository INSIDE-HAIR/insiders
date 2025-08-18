/**
 * AliasService Tests
 * Unit tests for alias management service
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { AliasService } from "../AliasService";

// Mock Prisma client
const mockPrisma = {
  linkAlias: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    aggregate: vi.fn(),
  },
  videoSpace: {
    findFirst: vi.fn(),
  },
};

describe("AliasService", () => {
  let aliasService: AliasService;
  const mockUserId = "507f1f77bcf86cd799439011";
  const mockVideoSpaceId = "507f1f77bcf86cd799439021";
  const mockAliasId = "507f1f77bcf86cd799439031";

  beforeEach(() => {
    vi.clearAllMocks();
    aliasService = new AliasService(mockPrisma as any);
  });

  describe("createAlias", () => {
    it("should create a new alias successfully", async () => {
      const createRequest = {
        alias: "team-standup",
        videoSpaceId: mockVideoSpaceId,
      };

      // Mock video space exists
      mockPrisma.videoSpace.findFirst.mockResolvedValue({
        id: mockVideoSpaceId,
        name: "Team Standup",
        ownerId: mockUserId,
      });

      // Mock alias doesn't exist
      mockPrisma.linkAlias.findFirst.mockResolvedValue(null);

      // Mock alias creation
      const mockCreatedAlias = {
        id: mockAliasId,
        alias: "team-standup",
        videoSpaceId: mockVideoSpaceId,
        isActive: true,
        accessCount: 0,
        lastAccessedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        videoSpace: {
          id: mockVideoSpaceId,
          name: "Team Standup",
          provider: "ZOOM",
          status: "ACTIVE",
          providerJoinUri: "https://zoom.us/j/123456789",
        },
      };

      mockPrisma.linkAlias.create.mockResolvedValue(mockCreatedAlias);

      const result = await aliasService.createAlias(createRequest, mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedAlias);
      expect(mockPrisma.videoSpace.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockVideoSpaceId,
          ownerId: mockUserId,
        },
      });
      expect(mockPrisma.linkAlias.create).toHaveBeenCalledWith({
        data: createRequest,
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
    });

    it("should fail if video space not found", async () => {
      const createRequest = {
        alias: "team-standup",
        videoSpaceId: mockVideoSpaceId,
      };

      mockPrisma.videoSpace.findFirst.mockResolvedValue(null);

      const result = await aliasService.createAlias(createRequest, mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Video space not found or access denied");
      expect(result.code).toBe("VIDEO_SPACE_NOT_FOUND");
    });

    it("should fail if alias already exists", async () => {
      const createRequest = {
        alias: "team-standup",
        videoSpaceId: mockVideoSpaceId,
      };

      mockPrisma.videoSpace.findFirst.mockResolvedValue({
        id: mockVideoSpaceId,
        ownerId: mockUserId,
      });

      mockPrisma.linkAlias.findFirst.mockResolvedValue({
        id: "existing-alias-id",
        alias: "team-standup",
      });

      const result = await aliasService.createAlias(createRequest, mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Alias already exists");
      expect(result.code).toBe("ALIAS_ALREADY_EXISTS");
    });
  });

  describe("getAliases", () => {
    it("should get aliases with pagination", async () => {
      const filters = {
        page: 1,
        limit: 20,
        isActive: true,
      };

      const mockAliases = [
        {
          id: mockAliasId,
          alias: "team-standup",
          videoSpaceId: mockVideoSpaceId,
          isActive: true,
          accessCount: 5,
          lastAccessedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          videoSpace: {
            id: mockVideoSpaceId,
            name: "Team Standup",
            provider: "ZOOM",
            status: "ACTIVE",
            providerJoinUri: "https://zoom.us/j/123456789",
          },
        },
      ];

      mockPrisma.linkAlias.count.mockResolvedValue(1);
      mockPrisma.linkAlias.findMany.mockResolvedValue(mockAliases);

      const result = await aliasService.getAliases(filters, mockUserId);

      expect(result.success).toBe(true);
      expect(result.data?.data).toEqual(mockAliases);
      expect(result.data?.total).toBe(1);
      expect(result.data?.page).toBe(1);
      expect(result.data?.limit).toBe(20);
      expect(result.data?.totalPages).toBe(1);
      expect(result.data?.hasNextPage).toBe(false);
      expect(result.data?.hasPreviousPage).toBe(false);
    });

    it("should filter by video space", async () => {
      const filters = {
        page: 1,
        limit: 20,
        videoSpaceId: mockVideoSpaceId,
      };

      mockPrisma.videoSpace.findFirst.mockResolvedValue({
        id: mockVideoSpaceId,
        ownerId: mockUserId,
      });

      mockPrisma.linkAlias.count.mockResolvedValue(0);
      mockPrisma.linkAlias.findMany.mockResolvedValue([]);

      const result = await aliasService.getAliases(filters, mockUserId);

      expect(result.success).toBe(true);
      expect(mockPrisma.videoSpace.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockVideoSpaceId,
          ownerId: mockUserId,
        },
      });
    });

    it("should fail if video space not found when filtering", async () => {
      const filters = {
        page: 1,
        limit: 20,
        videoSpaceId: mockVideoSpaceId,
      };

      mockPrisma.videoSpace.findFirst.mockResolvedValue(null);

      const result = await aliasService.getAliases(filters, mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Video space not found or access denied");
      expect(result.code).toBe("VIDEO_SPACE_NOT_FOUND");
    });
  });

  describe("getAliasById", () => {
    it("should get alias by ID successfully", async () => {
      const mockAlias = {
        id: mockAliasId,
        alias: "team-standup",
        videoSpaceId: mockVideoSpaceId,
        isActive: true,
        accessCount: 5,
        lastAccessedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        videoSpace: {
          id: mockVideoSpaceId,
          name: "Team Standup",
          provider: "ZOOM",
          status: "ACTIVE",
          providerJoinUri: "https://zoom.us/j/123456789",
        },
      };

      mockPrisma.linkAlias.findFirst.mockResolvedValue(mockAlias);

      const result = await aliasService.getAliasById(mockAliasId, mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAlias);
      expect(mockPrisma.linkAlias.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockAliasId,
          videoSpace: {
            ownerId: mockUserId,
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
    });

    it("should fail if alias not found", async () => {
      mockPrisma.linkAlias.findFirst.mockResolvedValue(null);

      const result = await aliasService.getAliasById(mockAliasId, mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Alias not found or access denied");
      expect(result.code).toBe("ALIAS_NOT_FOUND");
    });
  });

  describe("updateAlias", () => {
    it("should update alias successfully", async () => {
      const updateRequest = {
        alias: "updated-standup",
        isActive: false,
      };

      const existingAlias = {
        id: mockAliasId,
        alias: "team-standup",
        videoSpaceId: mockVideoSpaceId,
      };

      const updatedAlias = {
        ...existingAlias,
        ...updateRequest,
        updatedAt: new Date(),
        videoSpace: {
          id: mockVideoSpaceId,
          name: "Team Standup",
          provider: "ZOOM",
          status: "ACTIVE",
          providerJoinUri: "https://zoom.us/j/123456789",
        },
      };

      mockPrisma.linkAlias.findFirst
        .mockResolvedValueOnce(existingAlias) // First call for existence check
        .mockResolvedValueOnce(null); // Second call for uniqueness check

      mockPrisma.linkAlias.update.mockResolvedValue(updatedAlias);

      const result = await aliasService.updateAlias(
        mockAliasId,
        updateRequest,
        mockUserId
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedAlias);
      expect(mockPrisma.linkAlias.update).toHaveBeenCalledWith({
        where: { id: mockAliasId },
        data: updateRequest,
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
    });

    it("should fail if alias not found", async () => {
      const updateRequest = { alias: "updated-standup" };

      mockPrisma.linkAlias.findFirst.mockResolvedValue(null);

      const result = await aliasService.updateAlias(
        mockAliasId,
        updateRequest,
        mockUserId
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Alias not found or access denied");
      expect(result.code).toBe("ALIAS_NOT_FOUND");
    });

    it("should fail if new alias name already exists", async () => {
      const updateRequest = { alias: "existing-alias" };

      const existingAlias = {
        id: mockAliasId,
        alias: "team-standup",
      };

      mockPrisma.linkAlias.findFirst
        .mockResolvedValueOnce(existingAlias) // First call for existence check
        .mockResolvedValueOnce({ id: "other-id" }); // Second call finds existing alias

      const result = await aliasService.updateAlias(
        mockAliasId,
        updateRequest,
        mockUserId
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Alias already exists");
      expect(result.code).toBe("ALIAS_ALREADY_EXISTS");
    });
  });

  describe("deleteAlias", () => {
    it("should soft delete alias successfully", async () => {
      const existingAlias = {
        id: mockAliasId,
        alias: "team-standup",
      };

      mockPrisma.linkAlias.findFirst.mockResolvedValue(existingAlias);
      mockPrisma.linkAlias.update.mockResolvedValue({});

      const result = await aliasService.deleteAlias(
        mockAliasId,
        mockUserId,
        false
      );

      expect(result.success).toBe(true);
      expect(mockPrisma.linkAlias.update).toHaveBeenCalledWith({
        where: { id: mockAliasId },
        data: { isActive: false },
      });
    });

    it("should hard delete alias successfully", async () => {
      const existingAlias = {
        id: mockAliasId,
        alias: "team-standup",
      };

      mockPrisma.linkAlias.findFirst.mockResolvedValue(existingAlias);
      mockPrisma.linkAlias.delete.mockResolvedValue({});

      const result = await aliasService.deleteAlias(
        mockAliasId,
        mockUserId,
        true
      );

      expect(result.success).toBe(true);
      expect(mockPrisma.linkAlias.delete).toHaveBeenCalledWith({
        where: { id: mockAliasId },
      });
    });

    it("should fail if alias not found", async () => {
      mockPrisma.linkAlias.findFirst.mockResolvedValue(null);

      const result = await aliasService.deleteAlias(mockAliasId, mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Alias not found or access denied");
      expect(result.code).toBe("ALIAS_NOT_FOUND");
    });
  });

  describe("resolveAlias", () => {
    it("should resolve alias successfully", async () => {
      const mockAlias = {
        id: mockAliasId,
        alias: "team-standup",
        accessCount: 5,
        lastAccessedAt: new Date(),
        videoSpace: {
          id: mockVideoSpaceId,
          name: "Team Standup",
          provider: "ZOOM",
          status: "ACTIVE",
          providerJoinUri: "https://zoom.us/j/123456789",
          providerRoomId: "123456789",
        },
      };

      mockPrisma.linkAlias.findFirst.mockResolvedValue(mockAlias);
      mockPrisma.linkAlias.update.mockResolvedValue({});

      const result = await aliasService.resolveAlias("team-standup");

      expect(result.success).toBe(true);
      expect(result.data?.alias).toBe("team-standup");
      expect(result.data?.redirectUrl).toBe("https://zoom.us/j/123456789");
      expect(result.data?.accessCount).toBe(6);
      expect(mockPrisma.linkAlias.update).toHaveBeenCalledWith({
        where: { id: mockAliasId },
        data: {
          accessCount: { increment: 1 },
          lastAccessedAt: expect.any(Date),
        },
      });
    });

    it("should fail if alias not found", async () => {
      mockPrisma.linkAlias.findFirst.mockResolvedValue(null);

      const result = await aliasService.resolveAlias("nonexistent-alias");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Alias not found or inactive");
      expect(result.code).toBe("ALIAS_NOT_FOUND");
    });

    it("should fail if video space is inactive", async () => {
      const mockAlias = {
        id: mockAliasId,
        alias: "team-standup",
        videoSpace: {
          status: "INACTIVE",
        },
      };

      mockPrisma.linkAlias.findFirst.mockResolvedValue(mockAlias);

      const result = await aliasService.resolveAlias("team-standup");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Video space is not active");
      expect(result.code).toBe("VIDEO_SPACE_INACTIVE");
    });

    it("should fail if no join URL", async () => {
      const mockAlias = {
        id: mockAliasId,
        alias: "team-standup",
        videoSpace: {
          status: "ACTIVE",
          providerJoinUri: null,
        },
      };

      mockPrisma.linkAlias.findFirst.mockResolvedValue(mockAlias);

      const result = await aliasService.resolveAlias("team-standup");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Video space has no join URL");
      expect(result.code).toBe("NO_JOIN_URL");
    });
  });

  describe("isAliasAvailable", () => {
    it("should return true if alias is available", async () => {
      mockPrisma.linkAlias.findFirst.mockResolvedValue(null);

      const result = await aliasService.isAliasAvailable("new-alias");

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it("should return false if alias is taken", async () => {
      mockPrisma.linkAlias.findFirst.mockResolvedValue({
        id: mockAliasId,
        alias: "existing-alias",
      });

      const result = await aliasService.isAliasAvailable("existing-alias");

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
    });
  });

  describe("getAliasStats", () => {
    it("should get alias statistics successfully", async () => {
      const mockStats = {
        totalAliases: 10,
        activeAliases: 8,
        inactiveAliases: 2,
        totalAccesses: 150,
        mostAccessedAliases: [
          {
            alias: "popular-alias",
            accessCount: 50,
            videoSpaceName: "Popular Room",
          },
        ],
        recentlyAccessedAliases: [
          {
            alias: "recent-alias",
            lastAccessedAt: new Date(),
            videoSpaceName: "Recent Room",
          },
        ],
      };

      mockPrisma.linkAlias.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(8) // active
        .mockResolvedValueOnce(2); // inactive

      mockPrisma.linkAlias.aggregate.mockResolvedValue({
        _sum: { accessCount: 150 },
      });

      mockPrisma.linkAlias.findMany
        .mockResolvedValueOnce([
          {
            alias: "popular-alias",
            accessCount: 50,
            videoSpace: { name: "Popular Room" },
          },
        ])
        .mockResolvedValueOnce([
          {
            alias: "recent-alias",
            lastAccessedAt: new Date(),
            videoSpace: { name: "Recent Room" },
          },
        ]);

      const result = await aliasService.getAliasStats(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data?.totalAliases).toBe(10);
      expect(result.data?.activeAliases).toBe(8);
      expect(result.data?.inactiveAliases).toBe(2);
      expect(result.data?.totalAccesses).toBe(150);
      expect(result.data?.mostAccessedAliases).toHaveLength(1);
      expect(result.data?.recentlyAccessedAliases).toHaveLength(1);
    });
  });
});
