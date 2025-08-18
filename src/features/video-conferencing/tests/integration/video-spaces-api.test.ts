/**
 * Integration tests for Video Spaces API
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import { GET, POST } from "@/src/app/api/video-conferencing/spaces/route";

// Mock Prisma client
const mockPrisma = {
  videoSpace: {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  integrationAccount: {
    findUnique: vi.fn(),
  },
} as unknown as PrismaClient;

// Mock services
vi.mock("@/src/features/video-conferencing/services/VideoConferencingService");
vi.mock("@/src/features/video-conferencing/middleware/authMiddleware");

// Mock user authentication
const mockUser = {
  id: "user-1",
  email: "admin@test.com",
  role: "ADMIN",
};

vi.mock("@/src/features/video-conferencing/middleware/authMiddleware", () => ({
  getCurrentUser: vi.fn().mockResolvedValue(mockUser),
}));

describe("Video Spaces API Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/video-conferencing/spaces", () => {
    it("should return paginated video spaces", async () => {
      // Mock data
      const mockVideoSpaces = [
        {
          id: "space-1",
          title: "Test Space 1",
          description: "Test description",
          provider: "GOOGLE_MEET",
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { meetingRecords: 5 },
        },
        {
          id: "space-2",
          title: "Test Space 2",
          description: "Test description 2",
          provider: "ZOOM",
          status: "SCHEDULED",
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { meetingRecords: 2 },
        },
      ];

      // Mock Prisma responses
      mockPrisma.videoSpace.findMany.mockResolvedValue(mockVideoSpaces);
      mockPrisma.videoSpace.count.mockResolvedValue(2);

      // Create request
      const request = new NextRequest(
        "http://localhost:3000/api/video-conferencing/spaces?page=1&limit=20"
      );

      // Execute
      const response = await GET(request);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data).toHaveProperty("videoSpaces");
      expect(data).toHaveProperty("total");
      expect(data).toHaveProperty("page");
      expect(data).toHaveProperty("limit");
      expect(data).toHaveProperty("hasMore");
      expect(data.videoSpaces).toHaveLength(2);
      expect(data.total).toBe(2);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);
      expect(data.hasMore).toBe(false);
    });

    it("should filter video spaces by provider", async () => {
      const mockVideoSpaces = [
        {
          id: "space-1",
          title: "Google Meet Space",
          provider: "GOOGLE_MEET",
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { meetingRecords: 3 },
        },
      ];

      mockPrisma.videoSpace.findMany.mockResolvedValue(mockVideoSpaces);
      mockPrisma.videoSpace.count.mockResolvedValue(1);

      const request = new NextRequest(
        "http://localhost:3000/api/video-conferencing/spaces?provider=GOOGLE_MEET"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.videoSpaces).toHaveLength(1);
      expect(data.videoSpaces[0].provider).toBe("GOOGLE_MEET");
    });

    it("should search video spaces by title", async () => {
      const mockVideoSpaces = [
        {
          id: "space-1",
          title: "Marketing Meeting",
          provider: "ZOOM",
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { meetingRecords: 1 },
        },
      ];

      mockPrisma.videoSpace.findMany.mockResolvedValue(mockVideoSpaces);
      mockPrisma.videoSpace.count.mockResolvedValue(1);

      const request = new NextRequest(
        "http://localhost:3000/api/video-conferencing/spaces?search=marketing"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.videoSpaces).toHaveLength(1);
      expect(data.videoSpaces[0].title).toContain("Marketing");
    });

    it("should return 401 for unauthenticated requests", async () => {
      // Mock unauthenticated user
      vi.mocked(
        require("@/src/features/video-conferencing/middleware/authMiddleware")
          .getCurrentUser
      ).mockResolvedValueOnce(null);

      const request = new NextRequest(
        "http://localhost:3000/api/video-conferencing/spaces"
      );

      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/video-conferencing/spaces", () => {
    it("should create a new video space", async () => {
      const mockIntegrationAccount = {
        id: "integration-1",
        provider: "GOOGLE_MEET",
        status: "ACTIVE",
      };

      const mockCreatedSpace = {
        id: "space-new",
        title: "New Test Space",
        description: "New test description",
        provider: "GOOGLE_MEET",
        status: "SCHEDULED",
        maxParticipants: 100,
        integrationAccountId: "integration-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.integrationAccount.findUnique.mockResolvedValue(
        mockIntegrationAccount
      );
      mockPrisma.videoSpace.create.mockResolvedValue(mockCreatedSpace);

      const requestBody = {
        title: "New Test Space",
        description: "New test description",
        provider: "GOOGLE_MEET",
        scheduledStartTime: new Date().toISOString(),
        scheduledEndTime: new Date(
          Date.now() + 2 * 60 * 60 * 1000
        ).toISOString(),
        maxParticipants: 100,
        integrationAccountId: "integration-1",
      };

      const request = new NextRequest(
        "http://localhost:3000/api/video-conferencing/spaces",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty("id");
      expect(data.title).toBe("New Test Space");
      expect(data.provider).toBe("GOOGLE_MEET");
    });

    it("should validate required fields", async () => {
      const requestBody = {
        // Missing required fields
        description: "Test description",
      };

      const request = new NextRequest(
        "http://localhost:3000/api/video-conferencing/spaces",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should return 401 for unauthenticated requests", async () => {
      vi.mocked(
        require("@/src/features/video-conferencing/middleware/authMiddleware")
          .getCurrentUser
      ).mockResolvedValueOnce(null);

      const requestBody = {
        title: "Test Space",
        provider: "GOOGLE_MEET",
        scheduledStartTime: new Date().toISOString(),
        scheduledEndTime: new Date(
          Date.now() + 2 * 60 * 60 * 1000
        ).toISOString(),
        integrationAccountId: "integration-1",
      };

      const request = new NextRequest(
        "http://localhost:3000/api/video-conferencing/spaces",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      mockPrisma.videoSpace.findMany.mockRejectedValue(
        new Error("Database connection failed")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/video-conferencing/spaces"
      );

      const response = await GET(request);

      expect(response.status).toBe(500);
    });

    it("should handle invalid query parameters", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/video-conferencing/spaces?page=invalid"
      );

      const response = await GET(request);

      expect(response.status).toBe(400);
    });
  });

  describe("Pagination", () => {
    it("should handle pagination correctly", async () => {
      const mockVideoSpaces = Array.from({ length: 20 }, (_, i) => ({
        id: `space-${i + 1}`,
        title: `Test Space ${i + 1}`,
        provider: "GOOGLE_MEET",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { meetingRecords: i },
      }));

      mockPrisma.videoSpace.findMany.mockResolvedValue(mockVideoSpaces);
      mockPrisma.videoSpace.count.mockResolvedValue(50); // Total count

      const request = new NextRequest(
        "http://localhost:3000/api/video-conferencing/spaces?page=1&limit=20"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.videoSpaces).toHaveLength(20);
      expect(data.total).toBe(50);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);
      expect(data.hasMore).toBe(true);
    });

    it("should handle last page correctly", async () => {
      const mockVideoSpaces = Array.from({ length: 10 }, (_, i) => ({
        id: `space-${i + 41}`,
        title: `Test Space ${i + 41}`,
        provider: "ZOOM",
        status: "COMPLETED",
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { meetingRecords: i },
      }));

      mockPrisma.videoSpace.findMany.mockResolvedValue(mockVideoSpaces);
      mockPrisma.videoSpace.count.mockResolvedValue(50);

      const request = new NextRequest(
        "http://localhost:3000/api/video-conferencing/spaces?page=3&limit=20"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.videoSpaces).toHaveLength(10);
      expect(data.total).toBe(50);
      expect(data.page).toBe(3);
      expect(data.limit).toBe(20);
      expect(data.hasMore).toBe(false);
    });
  });
});
