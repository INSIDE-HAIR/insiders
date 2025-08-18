/**
 * CacheService
 * Handles caching strategies for video conferencing data
 */
import { Redis } from "ioredis";
import { VideoProvider } from "@prisma/client";

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  tags: string[];
  compression?: boolean;
  serialization?: "json" | "msgpack";
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  memoryUsage: number;
}

export interface CacheKey {
  pattern: string;
  tags: string[];
  ttl: number;
}

export class CacheService {
  private redis: Redis;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalKeys: 0,
    memoryUsage: 0,
  };
  private keyPatterns: Map<string, CacheKey> = new Map();

  constructor(redisUrl?: string) {
    this.redis = new Redis(
      redisUrl || process.env.REDIS_URL || "redis://localhost:6379"
    );
    this.initializeKeyPatterns();
  }

  /**
   * Get cached data
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);

      if (cached) {
        this.stats.hits++;
        this.updateHitRate();
        return JSON.parse(cached) as T;
      }

      this.stats.misses++;
      this.updateHitRate();
      return null;
    } catch (error) {
      console.error("Cache get error:", error);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  /**
   * Set cached data
   */
  async set<T>(key: string, data: T, config?: CacheConfig): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      const ttl = config?.ttl || 300; // Default 5 minutes

      await this.redis.setex(key, ttl, serialized);

      // Add tags for cache invalidation
      if (config?.tags) {
        for (const tag of config.tags) {
          await this.redis.sadd(`tag:${tag}`, key);
          await this.redis.expire(`tag:${tag}`, ttl + 60); // Tag expires slightly later
        }
      }

      this.stats.totalKeys++;
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  /**
   * Delete cached data
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      this.stats.totalKeys = Math.max(0, this.stats.totalKeys - 1);
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      for (const tag of tags) {
        const keys = await this.redis.smembers(`tag:${tag}`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          await this.redis.del(`tag:${tag}`);
          this.stats.totalKeys = Math.max(
            0,
            this.stats.totalKeys - keys.length
          );
        }
      }
    } catch (error) {
      console.error("Cache invalidation error:", error);
    }
  }

  /**
   * Cache video spaces list
   */
  async cacheVideoSpacesList(
    filters: {
      page: number;
      limit: number;
      provider?: VideoProvider;
      status?: string;
      search?: string;
    },
    data: any
  ): Promise<void> {
    const key = this.generateVideoSpacesKey(filters);
    await this.set(key, data, {
      ttl: 300, // 5 minutes
      tags: ["video-spaces", "lists"],
    });
  }

  /**
   * Get cached video spaces list
   */
  async getCachedVideoSpacesList(filters: {
    page: number;
    limit: number;
    provider?: VideoProvider;
    status?: string;
    search?: string;
  }): Promise<any | null> {
    const key = this.generateVideoSpacesKey(filters);
    return this.get(key);
  }

  /**
   * Cache meeting analytics
   */
  async cacheMeetingAnalytics(meetingId: string, data: any): Promise<void> {
    const key = `analytics:meeting:${meetingId}`;
    await this.set(key, data, {
      ttl: 1800, // 30 minutes
      tags: ["analytics", `meeting:${meetingId}`],
    });
  }

  /**
   * Get cached meeting analytics
   */
  async getCachedMeetingAnalytics(meetingId: string): Promise<any | null> {
    const key = `analytics:meeting:${meetingId}`;
    return this.get(key);
  }

  /**
   * Cache participant data
   */
  async cacheParticipantData(meetingId: string, data: any): Promise<void> {
    const key = `participants:meeting:${meetingId}`;
    await this.set(key, data, {
      ttl: 600, // 10 minutes
      tags: ["participants", `meeting:${meetingId}`],
    });
  }

  /**
   * Get cached participant data
   */
  async getCachedParticipantData(meetingId: string): Promise<any | null> {
    const key = `participants:meeting:${meetingId}`;
    return this.get(key);
  }

  /**
   * Cache transcription data
   */
  async cacheTranscription(meetingId: string, data: any): Promise<void> {
    const key = `transcription:meeting:${meetingId}`;
    await this.set(key, data, {
      ttl: 3600, // 1 hour
      tags: ["transcription", `meeting:${meetingId}`],
    });
  }

  /**
   * Get cached transcription
   */
  async getCachedTranscription(meetingId: string): Promise<any | null> {
    const key = `transcription:meeting:${meetingId}`;
    return this.get(key);
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const info = await this.redis.info("memory");
      const memoryMatch = info.match(/used_memory:(\\d+)/);
      const memoryUsage = memoryMatch ? parseInt(memoryMatch[1]) : 0;

      return {
        ...this.stats,
        memoryUsage,
      };
    } catch (error) {
      console.error("Error getting cache stats:", error);
      return this.stats;
    }
  }

  /**
   * Get cache health status
   */
  async getHealthStatus(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    details: any;
  }> {
    try {
      const ping = await this.redis.ping();
      const stats = await this.getStats();

      let status: "healthy" | "degraded" | "unhealthy" = "healthy";

      if (ping !== "PONG") {
        status = "unhealthy";
      } else if (stats.hitRate < 0.5 || stats.memoryUsage > 1024 * 1024 * 100) {
        // 100MB
        status = "degraded";
      }

      return {
        status,
        details: {
          ping,
          stats,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: "unhealthy",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Generate video spaces cache key
   */
  private generateVideoSpacesKey(filters: {
    page: number;
    limit: number;
    provider?: VideoProvider;
    status?: string;
    search?: string;
  }): string {
    const filterStr = JSON.stringify({
      page: filters.page,
      limit: filters.limit,
      provider: filters.provider || null,
      status: filters.status || null,
      search: filters.search || null,
    });

    return `video-spaces:list:${Buffer.from(filterStr).toString("base64")}`;
  }

  /**
   * Generate search cache key
   */
  private generateSearchKey(query: string, filters: any): string {
    const searchData = JSON.stringify({ query, filters });
    return `search:${Buffer.from(searchData).toString("base64")}`;
  }

  /**
   * Initialize key patterns for cache management
   */
  private initializeKeyPatterns(): void {
    this.keyPatterns.set("video-spaces", {
      pattern: "video-spaces:*",
      tags: ["video-spaces"],
      ttl: 300,
    });

    this.keyPatterns.set("analytics", {
      pattern: "analytics:*",
      tags: ["analytics"],
      ttl: 1800,
    });

    this.keyPatterns.set("participants", {
      pattern: "participants:*",
      tags: ["participants"],
      ttl: 600,
    });

    this.keyPatterns.set("transcription", {
      pattern: "transcription:*",
      tags: ["transcription"],
      ttl: 3600,
    });
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    try {
      await this.redis.flushdb();
      this.stats = {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalKeys: 0,
        memoryUsage: 0,
      };
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}
