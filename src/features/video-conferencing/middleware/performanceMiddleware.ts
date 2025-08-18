/**
 * Performance Middleware
 * Tracks API performance metrics and applies optimizations
 */
import { NextRequest, NextResponse } from "next/server";
import { DatabaseOptimizationService } from "../services/DatabaseOptimizationService";
import { CacheService } from "../services/CacheService";
import { PerformanceMonitoringService } from "../services/PerformanceMonitoringService";

export interface PerformanceMetrics {
  requestId: string;
  method: string;
  path: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  statusCode?: number;
  cacheHit?: boolean;
  dbQueries?: number;
  memoryUsage?: {
    before: NodeJS.MemoryUsage;
    after: NodeJS.MemoryUsage;
  };
}

export interface PerformanceMiddlewareConfig {
  enableCaching: boolean;
  enableMetrics: boolean;
  enableOptimization: boolean;
  slowRequestThreshold: number; // milliseconds
  cacheableRoutes: string[];
  excludeRoutes: string[];
}

export class PerformanceMiddleware {
  private cacheService: CacheService;
  private monitoringService: PerformanceMonitoringService;
  private config: PerformanceMiddlewareConfig;
  private activeRequests: Map<string, PerformanceMetrics> = new Map();

  constructor(
    cacheService: CacheService,
    monitoringService: PerformanceMonitoringService,
    config?: Partial<PerformanceMiddlewareConfig>
  ) {
    this.cacheService = cacheService;
    this.monitoringService = monitoringService;
    this.config = {
      enableCaching: true,
      enableMetrics: true,
      enableOptimization: true,
      slowRequestThreshold: 2000,
      cacheableRoutes: [
        "/api/video-conferencing/spaces",
        "/api/video-conferencing/analytics",
        "/api/video-conferencing/participants",
      ],
      excludeRoutes: [
        "/api/video-conferencing/webhook",
        "/api/video-conferencing/stream",
      ],
      ...config,
    };
  }

  /**
   * Create performance middleware for Next.js API routes
   */
  createMiddleware() {
    return async (request: NextRequest): Promise<NextResponse | void> => {
      const requestId = this.generateRequestId();
      const path = request.nextUrl.pathname;
      const method = request.method;

      // Skip excluded routes
      if (this.shouldExcludeRoute(path)) {
        return;
      }

      // Start performance tracking
      const metrics = this.startTracking(requestId, method, path);

      try {
        // Check cache for GET requests
        if (method === "GET" && this.isCacheableRoute(path)) {
          const cachedResponse = await this.checkCache(request);
          if (cachedResponse) {
            this.endTracking(requestId, 200, true);
            return cachedResponse;
          }
        }

        // Continue to next middleware/handler
        return;
      } catch (error) {
        this.endTracking(requestId, 500, false);
        console.error("Performance middleware error:", error);
        return;
      }
    };
  }

  /**
   * Wrap API handler with performance tracking
   */
  wrapHandler<T extends any[], R>(
    handler: (...args: T) => Promise<R>,
    routePath: string
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      const requestId = this.generateRequestId();
      const metrics = this.startTracking(requestId, "HANDLER", routePath);

      try {
        const result = await handler(...args);
        this.endTracking(requestId, 200, false);
        return result;
      } catch (error) {
        this.endTracking(requestId, 500, false);
        throw error;
      }
    };
  }

  /**
   * Start performance tracking for a request
   */
  private startTracking(
    requestId: string,
    method: string,
    path: string
  ): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      requestId,
      method,
      path,
      startTime: Date.now(),
      memoryUsage: {
        before: process.memoryUsage(),
        after: process.memoryUsage(), // Will be updated later
      },
    };

    this.activeRequests.set(requestId, metrics);
    return metrics;
  }

  /**
   * End performance tracking for a request
   */
  private endTracking(
    requestId: string,
    statusCode: number,
    cacheHit: boolean
  ): void {
    const metrics = this.activeRequests.get(requestId);
    if (!metrics) return;

    metrics.endTime = Date.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    metrics.statusCode = statusCode;
    metrics.cacheHit = cacheHit;
    metrics.memoryUsage!.after = process.memoryUsage();

    // Log slow requests
    if (metrics.duration > this.config.slowRequestThreshold) {
      console.warn(
        `Slow request detected: ${metrics.method} ${metrics.path} - ${metrics.duration}ms`
      );
    }

    // Store metrics for monitoring
    if (this.config.enableMetrics) {
      this.storeMetrics(metrics);
    }

    this.activeRequests.delete(requestId);
  }

  /**
   * Check cache for cached response
   */
  private async checkCache(request: NextRequest): Promise<NextResponse | null> {
    try {
      const cacheKey = this.generateCacheKey(request);
      const cached = await this.cacheService.get<{
        data: any;
        headers: Record<string, string>;
        status: number;
      }>(cacheKey);

      if (cached) {
        const response = NextResponse.json(cached.data, {
          status: cached.status,
        });

        // Set cached headers
        Object.entries(cached.headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });

        // Add cache hit header
        response.headers.set("X-Cache", "HIT");
        response.headers.set("X-Cache-Key", cacheKey);

        return response;
      }

      return null;
    } catch (error) {
      console.error("Cache check error:", error);
      return null;
    }
  }

  /**
   * Cache response for future requests
   */
  async cacheResponse(
    request: NextRequest,
    response: NextResponse,
    ttl?: number
  ): Promise<void> {
    try {
      if (!this.isCacheableRoute(request.nextUrl.pathname)) {
        return;
      }

      const cacheKey = this.generateCacheKey(request);
      const responseData = await response.clone().json();

      const cacheData = {
        data: responseData,
        headers: Object.fromEntries(response.headers.entries()),
        status: response.status,
      };

      await this.cacheService.set(cacheKey, cacheData, {
        ttl: ttl || 300, // Default 5 minutes
        tags: this.getCacheTags(request.nextUrl.pathname),
      });

      // Add cache miss header to original response
      response.headers.set("X-Cache", "MISS");
      response.headers.set("X-Cache-Key", cacheKey);
    } catch (error) {
      console.error("Cache response error:", error);
    }
  }

  /**
   * Generate cache key for request
   */
  private generateCacheKey(request: NextRequest): string {
    const url = request.nextUrl;
    const method = request.method;
    const searchParams = url.searchParams.toString();

    const keyData = {
      method,
      pathname: url.pathname,
      searchParams: searchParams || null,
      // Include relevant headers for cache key
      userAgent: request.headers.get("user-agent")?.substring(0, 50) || null,
      acceptLanguage: request.headers.get("accept-language") || null,
    };

    const keyString = JSON.stringify(keyData);
    return `api:${Buffer.from(keyString).toString("base64")}`;
  }

  /**
   * Get cache tags for a route
   */
  private getCacheTags(pathname: string): string[] {
    const tags = ["api-response"];

    if (pathname.includes("/spaces")) {
      tags.push("video-spaces");
    }
    if (pathname.includes("/analytics")) {
      tags.push("analytics");
    }
    if (pathname.includes("/participants")) {
      tags.push("participants");
    }
    if (pathname.includes("/transcription")) {
      tags.push("transcription");
    }

    return tags;
  }

  /**
   * Store performance metrics
   */
  private storeMetrics(metrics: PerformanceMetrics): void {
    // This could be stored in a database, sent to monitoring service, etc.
    console.log("Performance metrics:", {
      requestId: metrics.requestId,
      method: metrics.method,
      path: metrics.path,
      duration: metrics.duration,
      statusCode: metrics.statusCode,
      cacheHit: metrics.cacheHit,
      memoryDelta: metrics.memoryUsage
        ? {
            heapUsed:
              metrics.memoryUsage.after.heapUsed -
              metrics.memoryUsage.before.heapUsed,
            heapTotal:
              metrics.memoryUsage.after.heapTotal -
              metrics.memoryUsage.before.heapTotal,
          }
        : null,
    });
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if route should be excluded from performance tracking
   */
  private shouldExcludeRoute(path: string): boolean {
    return this.config.excludeRoutes.some((route) => path.includes(route));
  }

  /**
   * Check if route is cacheable
   */
  private isCacheableRoute(path: string): boolean {
    return this.config.cacheableRoutes.some((route) => path.includes(route));
  }

  /**
   * Get current active requests
   */
  getActiveRequests(): PerformanceMetrics[] {
    return Array.from(this.activeRequests.values());
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    activeRequests: number;
    averageResponseTime: number;
    slowRequests: number;
    cacheHitRate: number;
  } {
    const activeRequests = this.activeRequests.size;

    // This would typically be calculated from stored metrics
    return {
      activeRequests,
      averageResponseTime: 0, // Would be calculated from historical data
      slowRequests: 0, // Would be calculated from historical data
      cacheHitRate: 0, // Would be calculated from cache service stats
    };
  }

  /**
   * Invalidate cache for specific routes or tags
   */
  async invalidateCache(tags: string[]): Promise<void> {
    await this.cacheService.invalidateByTags(tags);
  }

  /**
   * Update middleware configuration
   */
  updateConfig(newConfig: Partial<PerformanceMiddlewareConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Health check for middleware
   */
  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    details: any;
  }> {
    try {
      const cacheHealth = await this.cacheService.getHealthStatus();
      const monitoringHealth = this.monitoringService.getPerformanceSummary();

      let status: "healthy" | "degraded" | "unhealthy" = "healthy";

      if (
        cacheHealth.status === "unhealthy" ||
        monitoringHealth.status === "critical"
      ) {
        status = "unhealthy";
      } else if (
        cacheHealth.status === "degraded" ||
        monitoringHealth.status === "degraded"
      ) {
        status = "degraded";
      }

      return {
        status,
        details: {
          cache: cacheHealth,
          monitoring: monitoringHealth,
          activeRequests: this.activeRequests.size,
          config: this.config,
        },
      };
    } catch (error) {
      return {
        status: "unhealthy",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }
}
