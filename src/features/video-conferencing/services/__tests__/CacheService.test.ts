/**
 * CacheService Tests
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { CacheService } from "../CacheService";

// Mock Redis
const mockRedis = {
  get: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
  sadd: vi.fn(),
  expire: vi.fn(),
  smembers: vi.fn(),
  info: vi.fn(),
  ping: vi.fn(),
  keys: vi.fn(),
  ttl: vi.fn(),
  flushdb: vi.fn(),
  quit: vi.fn(),
};

// Mock ioredis
vi.mock("ioredis", () => ({
  Redis: vi.fn(() => mockRedis),
}));

describe("CacheService", () => {
  let service: CacheService;

  beforeEach(() => {
    service = new CacheService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("get", () => {
    it("should return cached data when key exists", async () => {
      const testData = { id: "1", name: "Test" };
      mockRedis.get.mockResolvedValue(JSON.stringify(testData));

      const result = await service.get("test-key");

      expect(result).toEqual(testData);
      expect(mockRedis.get).toHaveBeenCalledWith("test-key");
    });

    it("should return null when key does not exist", async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await service.get("non-existent-key");

      expect(result).toBeNull();
    });

    it("should handle Redis errors gracefully", async () => {
      mockRedis.get.mockRejectedValue(new Error("Redis connection error"));

      const result = await service.get("test-key");

      expect(result).toBeNull();
    });

    it("should update hit/miss statistics", async () => {
      // Test cache hit
      mockRedis.get.mockResolvedValue(JSON.stringify({ data: "test" }));
      await service.get("hit-key");

      // Test cache miss
      mockRedis.get.mockResolvedValue(null);
      await service.get("miss-key");

      const stats = await service.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });
  });

  describe("set", () => {
    it("should cache data with default TTL", async () => {
      const testData = { id: "1", name: "Test" };

      await service.set("test-key", testData);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        "test-key",
        300, // Default 5 minutes
        JSON.stringify(testData)
      );
    });

    it("should cache data with custom TTL", async () => {
      const testData = { id: "1", name: "Test" };

      await service.set("test-key", testData, { ttl: 600, tags: [] });

      expect(mockRedis.setex).toHaveBeenCalledWith(
        "test-key",
        600,
        JSON.stringify(testData)
      );
    });

    it("should add tags for cache invalidation", async () => {
      const testData = { id: "1", name: "Test" };
      const config = { ttl: 300, tags: ["tag1", "tag2"] };

      await service.set("test-key", testData, config);

      expect(mockRedis.sadd).toHaveBeenCalledWith("tag:tag1", "test-key");
      expect(mockRedis.sadd).toHaveBeenCalledWith("tag:tag2", "test-key");
      expect(mockRedis.expire).toHaveBeenCalledWith("tag:tag1", 360);
      expect(mockRedis.expire).toHaveBeenCalledWith("tag:tag2", 360);
    });

    it("should handle Redis errors gracefully", async () => {
      mockRedis.setex.mockRejectedValue(new Error("Redis connection error"));

      await expect(
        service.set("test-key", { data: "test" })
      ).resolves.not.toThrow();
    });
  });

  describe("delete", () => {
    it("should delete cached data", async () => {
      await service.delete("test-key");

      expect(mockRedis.del).toHaveBeenCalledWith("test-key");
    });

    it("should handle Redis errors gracefully", async () => {
      mockRedis.del.mockRejectedValue(new Error("Redis connection error"));

      await expect(service.delete("test-key")).resolves.not.toThrow();
    });
  });

  describe("invalidateByTags", () => {
    it("should invalidate all keys with specified tags", async () => {
      mockRedis.smembers
        .mockResolvedValueOnce(["key1", "key2"])
        .mockResolvedValueOnce(["key3"]);

      await service.invalidateByTags(["tag1", "tag2"]);

      expect(mockRedis.smembers).toHaveBeenCalledWith("tag:tag1");
      expect(mockRedis.smembers).toHaveBeenCalledWith("tag:tag2");
      expect(mockRedis.del).toHaveBeenCalledWith("key1", "key2");
      expect(mockRedis.del).toHaveBeenCalledWith("key3");
      expect(mockRedis.del).toHaveBeenCalledWith("tag:tag1");
      expect(mockRedis.del).toHaveBeenCalledWith("tag:tag2");
    });

    it("should handle empty tag sets", async () => {
      mockRedis.smembers.mockResolvedValue([]);

      await service.invalidateByTags(["empty-tag"]);

      expect(mockRedis.smembers).toHaveBeenCalledWith("tag:empty-tag");
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe("cacheVideoSpacesList", () => {
    it("should cache video spaces list with proper key and tags", async () => {
      const filters = {
        page: 1,
        limit: 20,
        provider: "GOOGLE_MEET" as any,
        status: "active",
      };
      const data = { spaces: [], pagination: {} };

      await service.cacheVideoSpacesList(filters, data);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringContaining("video-spaces:list:"),
        300,
        JSON.stringify(data)
      );
      expect(mockRedis.sadd).toHaveBeenCalledWith(
        "tag:video-spaces",
        expect.any(String)
      );
      expect(mockRedis.sadd).toHaveBeenCalledWith(
        "tag:lists",
        expect.any(String)
      );
    });
  });

  describe("getCachedVideoSpacesList", () => {
    it("should retrieve cached video spaces list", async () => {
      const filters = {
        page: 1,
        limit: 20,
        provider: "GOOGLE_MEET" as any,
      };
      const cachedData = { spaces: [], pagination: {} };

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await service.getCachedVideoSpacesList(filters);

      expect(result).toEqual(cachedData);
      expect(mockRedis.get).toHaveBeenCalledWith(
        expect.stringContaining("video-spaces:list:")
      );
    });
  });

  describe("cacheMeetingAnalytics", () => {
    it("should cache meeting analytics with proper TTL", async () => {
      const meetingId = "meeting123";
      const data = { participants: 5, duration: 3600 };

      await service.cacheMeetingAnalytics(meetingId, data);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        `analytics:meeting:${meetingId}`,
        1800, // 30 minutes
        JSON.stringify(data)
      );
      expect(mockRedis.sadd).toHaveBeenCalledWith(
        "tag:analytics",
        `analytics:meeting:${meetingId}`
      );
      expect(mockRedis.sadd).toHaveBeenCalledWith(
        `tag:meeting:${meetingId}`,
        `analytics:meeting:${meetingId}`
      );
    });
  });

  describe("getStats", () => {
    it("should return cache statistics with memory usage", async () => {
      mockRedis.info.mockResolvedValue("used_memory:1048576\\r\\n");

      const stats = await service.getStats();

      expect(stats).toMatchObject({
        hits: expect.any(Number),
        misses: expect.any(Number),
        hitRate: expect.any(Number),
        totalKeys: expect.any(Number),
        memoryUsage: 1048576,
      });
    });

    it("should handle Redis info errors", async () => {
      mockRedis.info.mockRejectedValue(new Error("Redis error"));

      const stats = await service.getStats();

      expect(stats.memoryUsage).toBe(0);
    });
  });

  describe("getHealthStatus", () => {
    it("should return healthy status when Redis is working", async () => {
      mockRedis.ping.mockResolvedValue("PONG");
      mockRedis.info.mockResolvedValue("used_memory:1048576\\r\\n");

      const health = await service.getHealthStatus();

      expect(health.status).toBe("healthy");
      expect(health.details.ping).toBe("PONG");
    });

    it("should return unhealthy status when Redis ping fails", async () => {
      mockRedis.ping.mockResolvedValue("ERROR");

      const health = await service.getHealthStatus();

      expect(health.status).toBe("unhealthy");
    });

    it("should return degraded status for high memory usage", async () => {
      mockRedis.ping.mockResolvedValue("PONG");
      mockRedis.info.mockResolvedValue("used_memory:209715200\\r\\n"); // 200MB

      const health = await service.getHealthStatus();

      expect(health.status).toBe("degraded");
    });

    it("should handle Redis connection errors", async () => {
      mockRedis.ping.mockRejectedValue(new Error("Connection failed"));

      const health = await service.getHealthStatus();

      expect(health.status).toBe("unhealthy");
      expect(health.details.error).toBe("Connection failed");
    });
  });

  describe("clearAll", () => {
    it("should clear all cache and reset statistics", async () => {
      await service.clearAll();

      expect(mockRedis.flushdb).toHaveBeenCalled();

      const stats = await service.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
      expect(stats.totalKeys).toBe(0);
    });
  });

  describe("cleanup", () => {
    it("should cleanup expired keys and update statistics", async () => {
      mockRedis.keys
        .mockResolvedValueOnce(["tag:tag1", "tag:tag2"])
        .mockResolvedValueOnce(["key1", "key2", "tag:tag1"]);

      mockRedis.ttl
        .mockResolvedValueOnce(-1) // No expiration
        .mockResolvedValueOnce(300); // Has expiration

      await service.cleanup();

      expect(mockRedis.expire).toHaveBeenCalledWith("tag:tag1", 3600);
      expect(mockRedis.expire).not.toHaveBeenCalledWith(
        "tag:tag2",
        expect.any(Number)
      );
    });
  });

  describe("disconnect", () => {
    it("should close Redis connection", async () => {
      await service.disconnect();

      expect(mockRedis.quit).toHaveBeenCalled();
    });
  });

  describe("cache key generation", () => {
    it("should generate consistent keys for same filters", async () => {
      const filters1 = { page: 1, limit: 20, provider: "GOOGLE_MEET" as any };
      const filters2 = { page: 1, limit: 20, provider: "GOOGLE_MEET" as any };

      await service.cacheVideoSpacesList(filters1, { data: "test1" });
      await service.cacheVideoSpacesList(filters2, { data: "test2" });

      // Should use the same key (second call overwrites first)
      expect(mockRedis.setex).toHaveBeenCalledTimes(2);
      const calls = (mockRedis.setex as any).mock.calls;
      expect(calls[0][0]).toBe(calls[1][0]); // Same key
    });

    it("should generate different keys for different filters", async () => {
      const filters1 = { page: 1, limit: 20 };
      const filters2 = { page: 2, limit: 20 };

      await service.cacheVideoSpacesList(filters1, { data: "test1" });
      await service.cacheVideoSpacesList(filters2, { data: "test2" });

      const calls = (mockRedis.setex as any).mock.calls;
      expect(calls[0][0]).not.toBe(calls[1][0]); // Different keys
    });
  });
});
