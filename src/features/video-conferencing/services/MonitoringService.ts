/**
 * MonitoringService
 * System monitoring and alerting for video conferencing platform
 */
import { LoggingService } from "./LoggingService";
import { ErrorHandlingService } from "./ErrorHandlingService";

export interface HealthCheck {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  responseTime: number;
  lastCheck: Date;
  details?: Record<string, any>;
  error?: string;
}

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    connections: number;
    queryTime: number;
    errorRate: number;
  };
  api: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
  };
  providers: {
    googleMeet: HealthCheck;
    zoom: HealthCheck;
    vimeo: HealthCheck;
  };
}

export interface Alert {
  id: string;
  type: "performance" | "error" | "security" | "availability";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata: Record<string, any>;
  actions: string[];
}

export interface MonitoringRule {
  name: string;
  condition: (metrics: SystemMetrics) => boolean;
  alertType: Alert["type"];
  severity: Alert["severity"];
  title: string;
  description: string;
  actions: string[];
  cooldownMinutes: number;
}

export class MonitoringService {
  private loggingService: LoggingService;
  private errorHandlingService: ErrorHandlingService;
  private healthChecks: Map<string, HealthCheck> = new Map();
  private metrics: SystemMetrics[] = [];
  private alerts: Alert[] = [];
  private monitoringRules: MonitoringRule[] = [];
  private alertCooldowns: Map<string, Date> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(
    loggingService: LoggingService,
    errorHandlingService: ErrorHandlingService
  ) {
    this.loggingService = loggingService;
    this.errorHandlingService = errorHandlingService;
    this.initializeMonitoringRules();
  }

  /**
   * Start system monitoring
   */
  startMonitoring(intervalMs: number = 60000): void {
    if (this.monitoringInterval) {
      this.stopMonitoring();
    }

    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
      await this.evaluateAlerts();
      this.cleanupOldData();
    }, intervalMs);

    this.loggingService.info(
      `System monitoring started with ${intervalMs}ms interval`,
      "MONITORING",
      { intervalMs }
    );
  }

  /**
   * Stop system monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.loggingService.info("System monitoring stopped", "MONITORING");
    }
  }

  /**
   * Perform health check for a service
   */
  async performHealthCheck(
    name: string,
    checkFunction: () => Promise<{
      status: "healthy" | "degraded" | "unhealthy";
      details?: any;
    }>
  ): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      const result = await Promise.race([
        checkFunction(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Health check timeout")), 10000)
        ),
      ]);

      const responseTime = Date.now() - startTime;

      const healthCheck: HealthCheck = {
        name,
        status: result.status,
        responseTime,
        lastCheck: new Date(),
        details: result.details,
      };

      this.healthChecks.set(name, healthCheck);

      this.loggingService.debug(
        `Health check completed for ${name}: ${result.status}`,
        "HEALTH_CHECK",
        { name, status: result.status, responseTime }
      );

      return healthCheck;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      const healthCheck: HealthCheck = {
        name,
        status: "unhealthy",
        responseTime,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
      };

      this.healthChecks.set(name, healthCheck);

      this.loggingService.error(
        `Health check failed for ${name}`,
        "HEALTH_CHECK",
        error as Error,
        { name, responseTime }
      );

      return healthCheck;
    }
  }

  /**
   * Get current system health status
   */
  getSystemHealth(): {
    overall: "healthy" | "degraded" | "unhealthy";
    checks: HealthCheck[];
    summary: {
      healthy: number;
      degraded: number;
      unhealthy: number;
    };
  } {
    const checks = Array.from(this.healthChecks.values());

    const summary = {
      healthy: checks.filter((c) => c.status === "healthy").length,
      degraded: checks.filter((c) => c.status === "degraded").length,
      unhealthy: checks.filter((c) => c.status === "unhealthy").length,
    };

    let overall: "healthy" | "degraded" | "unhealthy" = "healthy";

    if (summary.unhealthy > 0) {
      overall = "unhealthy";
    } else if (summary.degraded > 0) {
      overall = "degraded";
    }

    return { overall, checks, summary };
  }

  /**
   * Collect system metrics
   */
  async collectMetrics(): Promise<SystemMetrics> {
    const timestamp = new Date();

    // Collect CPU and memory metrics
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Perform health checks for providers
    const googleMeetCheck = await this.performHealthCheck(
      "google-meet",
      async () => {
        // Simulate Google Meet API health check
        return { status: "healthy" as const, details: { apiVersion: "v2" } };
      }
    );

    const zoomCheck = await this.performHealthCheck("zoom", async () => {
      // Simulate Zoom API health check
      return { status: "healthy" as const, details: { apiVersion: "v2" } };
    });

    const vimeoCheck = await this.performHealthCheck("vimeo", async () => {
      // Simulate Vimeo API health check
      return {
        status: "degraded" as const,
        details: { apiVersion: "v4", issue: "High latency" },
      };
    });

    const metrics: SystemMetrics = {
      timestamp,
      cpu: {
        usage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to milliseconds
        loadAverage:
          process.platform !== "win32" ? require("os").loadavg() : [0, 0, 0],
      },
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
      },
      database: {
        connections: 10, // Would be actual database connection count
        queryTime: 50, // Average query time in ms
        errorRate: 0.01, // 1% error rate
      },
      api: {
        requestsPerMinute: 120, // Would be actual request count
        averageResponseTime: 250, // Average response time in ms
        errorRate: 0.02, // 2% error rate
      },
      providers: {
        googleMeet: googleMeetCheck,
        zoom: zoomCheck,
        vimeo: vimeoCheck,
      },
    };

    // Store metrics (keep last 1000 entries)
    this.metrics.push(metrics);
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    this.loggingService.debug("System metrics collected", "METRICS", {
      memoryUsage: `${Math.round(metrics.memory.percentage)}%`,
      apiResponseTime: `${metrics.api.averageResponseTime}ms`,
      providersHealthy: Object.values(metrics.providers).filter(
        (p) => p.status === "healthy"
      ).length,
    });

    return metrics;
  }

  /**
   * Get recent metrics
   */
  getMetrics(limit: number = 100): SystemMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Get current alerts
   */
  getAlerts(includeResolved: boolean = false): Alert[] {
    return includeResolved
      ? [...this.alerts]
      : this.alerts.filter((alert) => !alert.resolved);
  }

  /**
   * Create an alert
   */
  createAlert(
    type: Alert["type"],
    severity: Alert["severity"],
    title: string,
    description: string,
    metadata: Record<string, any> = {},
    actions: string[] = []
  ): Alert {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title,
      description,
      timestamp: new Date(),
      resolved: false,
      metadata,
      actions,
    };

    this.alerts.push(alert);

    // Log the alert
    this.loggingService.warn(`Alert created: ${title}`, "ALERT", undefined, {
      alertId: alert.id,
      type,
      severity,
      description,
      metadata,
    });

    // Send notification for high/critical alerts
    if (severity === "high" || severity === "critical") {
      this.sendAlertNotification(alert);
    }

    return alert;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string, resolution?: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert || alert.resolved) {
      return false;
    }

    alert.resolved = true;
    alert.resolvedAt = new Date();

    if (resolution) {
      alert.metadata.resolution = resolution;
    }

    this.loggingService.info(`Alert resolved: ${alert.title}`, "ALERT", {
      alertId,
      resolution,
      duration: alert.resolvedAt.getTime() - alert.timestamp.getTime(),
    });

    return true;
  }

  /**
   * Get monitoring statistics
   */
  getMonitoringStats(): {
    uptime: number;
    totalAlerts: number;
    activeAlerts: number;
    criticalAlerts: number;
    averageResponseTime: number;
    errorRate: number;
    healthScore: number;
  } {
    const activeAlerts = this.getAlerts(false);
    const criticalAlerts = activeAlerts.filter(
      (a) => a.severity === "critical"
    );

    const recentMetrics = this.getMetrics(10);
    const averageResponseTime =
      recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.api.averageResponseTime, 0) /
          recentMetrics.length
        : 0;

    const errorRate =
      recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.api.errorRate, 0) /
          recentMetrics.length
        : 0;

    // Calculate health score (0-100)
    const systemHealth = this.getSystemHealth();
    const healthScore =
      (systemHealth.summary.healthy / Math.max(1, systemHealth.checks.length)) *
      100;

    return {
      uptime: process.uptime(),
      totalAlerts: this.alerts.length,
      activeAlerts: activeAlerts.length,
      criticalAlerts: criticalAlerts.length,
      averageResponseTime,
      errorRate,
      healthScore,
    };
  }

  /**
   * Export monitoring data
   */
  exportMonitoringData(format: "json" | "csv"): string {
    const data = {
      timestamp: new Date().toISOString(),
      systemHealth: this.getSystemHealth(),
      recentMetrics: this.getMetrics(100),
      alerts: this.getAlerts(true),
      stats: this.getMonitoringStats(),
    };

    if (format === "json") {
      return JSON.stringify(data, null, 2);
    }

    if (format === "csv") {
      // Simple CSV export of alerts
      const headers = ["timestamp", "type", "severity", "title", "resolved"];
      const csvRows = [
        headers.join(","),
        ...this.alerts.map((alert) =>
          [
            alert.timestamp.toISOString(),
            alert.type,
            alert.severity,
            `"${alert.title.replace(/"/g, '""')}"`,
            alert.resolved.toString(),
          ].join(",")
        ),
      ];
      return csvRows.join("\n");
    }

    throw new Error(`Unsupported export format: ${format}`);
  }

  /**
   * Initialize monitoring rules
   */
  private initializeMonitoringRules(): void {
    this.monitoringRules = [
      {
        name: "High Memory Usage",
        condition: (metrics) => metrics.memory.percentage > 85,
        alertType: "performance",
        severity: "high",
        title: "High Memory Usage Detected",
        description: "System memory usage is above 85%",
        actions: ["Scale up resources", "Clear cache", "Restart services"],
        cooldownMinutes: 15,
      },
      {
        name: "High API Error Rate",
        condition: (metrics) => metrics.api.errorRate > 0.05, // 5%
        alertType: "error",
        severity: "high",
        title: "High API Error Rate",
        description: "API error rate is above 5%",
        actions: ["Check logs", "Investigate errors", "Scale API servers"],
        cooldownMinutes: 10,
      },
      {
        name: "Slow API Response",
        condition: (metrics) => metrics.api.averageResponseTime > 2000, // 2 seconds
        alertType: "performance",
        severity: "medium",
        title: "Slow API Response Times",
        description: "Average API response time is above 2 seconds",
        actions: [
          "Optimize queries",
          "Check database performance",
          "Scale resources",
        ],
        cooldownMinutes: 20,
      },
      {
        name: "Provider Service Down",
        condition: (metrics) =>
          Object.values(metrics.providers).some(
            (p) => p.status === "unhealthy"
          ),
        alertType: "availability",
        severity: "critical",
        title: "Video Provider Service Down",
        description: "One or more video conferencing providers are unhealthy",
        actions: [
          "Check provider status",
          "Switch to backup provider",
          "Contact provider support",
        ],
        cooldownMinutes: 5,
      },
      {
        name: "High Database Query Time",
        condition: (metrics) => metrics.database.queryTime > 1000, // 1 second
        alertType: "performance",
        severity: "medium",
        title: "Slow Database Queries",
        description: "Average database query time is above 1 second",
        actions: ["Optimize queries", "Check indexes", "Scale database"],
        cooldownMinutes: 30,
      },
    ];
  }

  /**
   * Evaluate monitoring rules and create alerts
   */
  private async evaluateAlerts(): Promise<void> {
    if (this.metrics.length === 0) return;

    const latestMetrics = this.metrics[this.metrics.length - 1];

    for (const rule of this.monitoringRules) {
      try {
        // Check cooldown
        const lastAlert = this.alertCooldowns.get(rule.name);
        if (
          lastAlert &&
          Date.now() - lastAlert.getTime() < rule.cooldownMinutes * 60 * 1000
        ) {
          continue;
        }

        // Evaluate condition
        if (rule.condition(latestMetrics)) {
          // Check if similar alert already exists and is not resolved
          const existingAlert = this.alerts.find(
            (alert) =>
              !alert.resolved &&
              alert.title === rule.title &&
              Date.now() - alert.timestamp.getTime() < 60 * 60 * 1000 // Within last hour
          );

          if (!existingAlert) {
            this.createAlert(
              rule.alertType,
              rule.severity,
              rule.title,
              rule.description,
              { rule: rule.name, metrics: latestMetrics },
              rule.actions
            );

            this.alertCooldowns.set(rule.name, new Date());
          }
        }
      } catch (error) {
        this.loggingService.error(
          `Error evaluating monitoring rule: ${rule.name}`,
          "MONITORING",
          error as Error,
          { rule: rule.name }
        );
      }
    }
  }

  /**
   * Send alert notification
   */
  private async sendAlertNotification(alert: Alert): Promise<void> {
    // In a real implementation, this would send notifications via email, Slack, etc.
    this.loggingService.info(
      `Sending alert notification: ${alert.title}`,
      "ALERT_NOTIFICATION",
      {
        alertId: alert.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
      }
    );

    // Simulate notification sending
    console.log(`🚨 ALERT [${alert.severity.toUpperCase()}]: ${alert.title}`);
    console.log(`   Description: ${alert.description}`);
    console.log(`   Actions: ${alert.actions.join(", ")}`);
  }

  /**
   * Clean up old data
   */
  private cleanupOldData(): void {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Clean up old metrics (keep last 1000 anyway)
    this.metrics = this.metrics.filter((m) => m.timestamp > cutoffTime);

    // Clean up resolved alerts older than 7 days
    const alertCutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const initialAlertCount = this.alerts.length;

    this.alerts = this.alerts.filter(
      (alert) => !alert.resolved || alert.timestamp > alertCutoffTime
    );

    const removedAlerts = initialAlertCount - this.alerts.length;
    if (removedAlerts > 0) {
      this.loggingService.debug(
        `Cleaned up ${removedAlerts} old alerts`,
        "MONITORING",
        { removedAlerts }
      );
    }

    // Clean up old cooldowns
    for (const [ruleName, lastAlert] of this.alertCooldowns.entries()) {
      if (Date.now() - lastAlert.getTime() > 60 * 60 * 1000) {
        // 1 hour
        this.alertCooldowns.delete(ruleName);
      }
    }
  }

  /**
   * Add custom monitoring rule
   */
  addMonitoringRule(rule: MonitoringRule): void {
    this.monitoringRules.push(rule);
    this.loggingService.info(
      `Added custom monitoring rule: ${rule.name}`,
      "MONITORING",
      { rule: rule.name }
    );
  }

  /**
   * Remove monitoring rule
   */
  removeMonitoringRule(ruleName: string): boolean {
    const initialLength = this.monitoringRules.length;
    this.monitoringRules = this.monitoringRules.filter(
      (rule) => rule.name !== ruleName
    );

    const removed = this.monitoringRules.length < initialLength;
    if (removed) {
      this.loggingService.info(
        `Removed monitoring rule: ${ruleName}`,
        "MONITORING",
        { rule: ruleName }
      );
    }

    return removed;
  }
}
