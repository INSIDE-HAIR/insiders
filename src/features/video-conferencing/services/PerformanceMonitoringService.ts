/**
 * PerformanceMonitoringService
 * Monitors and tracks performance metrics for video conferencing operations
 */
import {
  DatabaseOptimizationService,
  QueryPerformanceMetrics,
} from "./DatabaseOptimizationService";
import { CacheService, CacheStats } from "./CacheService";

export interface PerformanceAlert {
  id: string;
  type: "slow_query" | "high_memory" | "low_cache_hit" | "connection_error";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  details: any;
  timestamp: Date;
  resolved: boolean;
}

export interface SystemMetrics {
  database: {
    queryPerformance: QueryPerformanceMetrics[];
    slowQueries: QueryPerformanceMetrics[];
    averageResponseTime: number;
    totalQueries: number;
  };
  cache: {
    stats: CacheStats;
    healthStatus: any;
  };
  api: {
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
  memory: {
    usage: number;
    limit: number;
    percentage: number;
  };
}

export interface PerformanceThresholds {
  slowQueryThreshold: number; // milliseconds
  cacheHitRateThreshold: number; // percentage
  memoryUsageThreshold: number; // percentage
  errorRateThreshold: number; // percentage
  responseTimeThreshold: number; // milliseconds
}

export class PerformanceMonitoringService {
  private dbOptimizationService: DatabaseOptimizationService;
  private cacheService: CacheService;
  private alerts: PerformanceAlert[] = [];
  private metrics: SystemMetrics | null = null;
  private thresholds: PerformanceThresholds;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(
    dbOptimizationService: DatabaseOptimizationService,
    cacheService: CacheService,
    thresholds?: Partial<PerformanceThresholds>
  ) {
    this.dbOptimizationService = dbOptimizationService;
    this.cacheService = cacheService;
    this.thresholds = {
      slowQueryThreshold: 1000, // 1 second
      cacheHitRateThreshold: 0.8, // 80%
      memoryUsageThreshold: 0.85, // 85%
      errorRateThreshold: 0.05, // 5%
      responseTimeThreshold: 2000, // 2 seconds
      ...thresholds,
    };
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(intervalMs: number = 60000): void {
    // Default 1 minute
    if (this.monitoringInterval) {
      this.stopMonitoring();
    }

    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
      await this.checkThresholds();
      await this.cleanupOldAlerts();
    }, intervalMs);

    console.log(`Performance monitoring started with ${intervalMs}ms interval`);
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log("Performance monitoring stopped");
    }
  }

  /**
   * Collect system metrics
   */
  async collectMetrics(): Promise<SystemMetrics> {
    try {
      // Database metrics
      const dbMetrics = this.dbOptimizationService.getPerformanceMetrics();
      const slowQueries = dbMetrics.filter(
        (m) => m.executionTime > this.thresholds.slowQueryThreshold
      );
      const averageResponseTime =
        dbMetrics.length > 0
          ? dbMetrics.reduce((sum, m) => sum + m.executionTime, 0) /
            dbMetrics.length
          : 0;

      // Cache metrics
      const cacheStats = await this.cacheService.getStats();
      const cacheHealth = await this.cacheService.getHealthStatus();

      // Memory metrics (simplified - would integrate with actual system monitoring)
      const memoryUsage = process.memoryUsage();
      const memoryMetrics = {
        usage: memoryUsage.heapUsed,
        limit: memoryUsage.heapTotal,
        percentage: memoryUsage.heapUsed / memoryUsage.heapTotal,
      };

      this.metrics = {
        database: {
          queryPerformance: dbMetrics,
          slowQueries,
          averageResponseTime,
          totalQueries: dbMetrics.length,
        },
        cache: {
          stats: cacheStats,
          healthStatus: cacheHealth,
        },
        api: {
          responseTime: averageResponseTime, // Simplified
          errorRate: 0, // Would be calculated from actual API metrics
          throughput: dbMetrics.length, // Simplified
        },
        memory: memoryMetrics,
      };

      return this.metrics;
    } catch (error) {
      console.error("Error collecting metrics:", error);
      throw error;
    }
  }

  /**
   * Check performance thresholds and create alerts
   */
  async checkThresholds(): Promise<void> {
    if (!this.metrics) return;

    const { database, cache, memory } = this.metrics;

    // Check slow queries
    if (database.slowQueries.length > 0) {
      this.createAlert({
        type: "slow_query",
        severity: database.slowQueries.length > 5 ? "high" : "medium",
        message: `${database.slowQueries.length} slow queries detected`,
        details: {
          slowQueries: database.slowQueries.slice(0, 5), // Top 5 slowest
          threshold: this.thresholds.slowQueryThreshold,
        },
      });
    }

    // Check cache hit rate
    if (cache.stats.hitRate < this.thresholds.cacheHitRateThreshold) {
      this.createAlert({
        type: "low_cache_hit",
        severity: cache.stats.hitRate < 0.5 ? "high" : "medium",
        message: `Low cache hit rate: ${(cache.stats.hitRate * 100).toFixed(1)}%`,
        details: {
          hitRate: cache.stats.hitRate,
          threshold: this.thresholds.cacheHitRateThreshold,
          stats: cache.stats,
        },
      });
    }

    // Check memory usage
    if (memory.percentage > this.thresholds.memoryUsageThreshold) {
      this.createAlert({
        type: "high_memory",
        severity: memory.percentage > 0.95 ? "critical" : "high",
        message: `High memory usage: ${(memory.percentage * 100).toFixed(1)}%`,
        details: {
          usage: memory.usage,
          limit: memory.limit,
          percentage: memory.percentage,
          threshold: this.thresholds.memoryUsageThreshold,
        },
      });
    }

    // Check cache health
    if (cache.healthStatus.status !== "healthy") {
      this.createAlert({
        type: "connection_error",
        severity:
          cache.healthStatus.status === "unhealthy" ? "critical" : "medium",
        message: `Cache health status: ${cache.healthStatus.status}`,
        details: cache.healthStatus.details,
      });
    }
  }

  /**
   * Create a performance alert
   */
  private createAlert(
    alertData: Omit<PerformanceAlert, "id" | "timestamp" | "resolved">
  ): void {
    // Check if similar alert already exists and is not resolved
    const existingAlert = this.alerts.find(
      (alert) =>
        !alert.resolved &&
        alert.type === alertData.type &&
        alert.severity === alertData.severity
    );

    if (existingAlert) {
      // Update existing alert details
      existingAlert.details = alertData.details;
      existingAlert.timestamp = new Date();
      return;
    }

    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      ...alertData,
    };

    this.alerts.push(alert);
    console.warn(
      `Performance Alert [${alert.severity.toUpperCase()}]: ${alert.message}`,
      alert.details
    );

    // Auto-resolve low severity alerts after some time
    if (alert.severity === "low") {
      setTimeout(() => {
        this.resolveAlert(alert.id);
      }, 300000); // 5 minutes
    }
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`Performance alert resolved: ${alert.message}`);
      return true;
    }
    return false;
  }

  /**
   * Get current alerts
   */
  getAlerts(includeResolved: boolean = false): PerformanceAlert[] {
    return includeResolved
      ? [...this.alerts]
      : this.alerts.filter((alert) => !alert.resolved);
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): SystemMetrics | null {
    return this.metrics;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    status: "healthy" | "degraded" | "critical";
    activeAlerts: number;
    criticalAlerts: number;
    metrics: SystemMetrics | null;
    recommendations: string[];
  } {
    const activeAlerts = this.getAlerts();
    const criticalAlerts = activeAlerts.filter(
      (a) => a.severity === "critical"
    );

    let status: "healthy" | "degraded" | "critical" = "healthy";
    if (criticalAlerts.length > 0) {
      status = "critical";
    } else if (activeAlerts.length > 0) {
      status = "degraded";
    }

    const recommendations = this.generateRecommendations();

    return {
      status,
      activeAlerts: activeAlerts.length,
      criticalAlerts: criticalAlerts.length,
      metrics: this.metrics,
      recommendations,
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (!this.metrics) return recommendations;

    const { database, cache, memory } = this.metrics;

    // Database recommendations
    if (database.slowQueries.length > 0) {
      recommendations.push(
        "Consider adding database indexes for frequently queried columns"
      );
      recommendations.push("Review and optimize slow queries");
    }

    if (database.averageResponseTime > this.thresholds.responseTimeThreshold) {
      recommendations.push(
        "Database response time is high - consider query optimization"
      );
    }

    // Cache recommendations
    if (cache.stats.hitRate < this.thresholds.cacheHitRateThreshold) {
      recommendations.push(
        "Improve cache hit rate by adjusting TTL values or cache keys"
      );
      recommendations.push(
        "Consider pre-warming cache for frequently accessed data"
      );
    }

    // Memory recommendations
    if (memory.percentage > this.thresholds.memoryUsageThreshold) {
      recommendations.push(
        "High memory usage detected - consider scaling up or optimizing memory usage"
      );
      recommendations.push("Review cache size limits and cleanup policies");
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push("System performance is healthy");
    }

    return recommendations;
  }

  /**
   * Export performance report
   */
  exportPerformanceReport(): {
    timestamp: string;
    summary: any;
    metrics: SystemMetrics | null;
    alerts: PerformanceAlert[];
    recommendations: string[];
    thresholds: PerformanceThresholds;
  } {
    return {
      timestamp: new Date().toISOString(),
      summary: this.getPerformanceSummary(),
      metrics: this.metrics,
      alerts: this.getAlerts(true),
      recommendations: this.generateRecommendations(),
      thresholds: this.thresholds,
    };
  }

  /**
   * Update performance thresholds
   */
  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.log("Performance thresholds updated:", this.thresholds);
  }

  /**
   * Clean up old alerts
   */
  private async cleanupOldAlerts(): Promise<void> {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    const initialCount = this.alerts.length;

    this.alerts = this.alerts.filter(
      (alert) =>
        alert.timestamp > cutoffTime ||
        (!alert.resolved && alert.severity === "critical")
    );

    const removedCount = initialCount - this.alerts.length;
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} old performance alerts`);
    }
  }

  /**
   * Get database optimization recommendations
   */
  getDatabaseOptimizationRecommendations(): any {
    return this.dbOptimizationService.getIndexRecommendations();
  }

  /**
   * Get detailed performance report
   */
  async getDetailedReport(): Promise<any> {
    await this.collectMetrics();

    return {
      ...this.exportPerformanceReport(),
      databaseOptimization:
        this.dbOptimizationService.generateOptimizationReport(),
      cacheHealth: await this.cacheService.getHealthStatus(),
    };
  }
}
