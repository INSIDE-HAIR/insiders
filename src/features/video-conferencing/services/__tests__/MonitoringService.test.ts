/**
 * MonitoringService Tests
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { MonitoringService } from "../MonitoringService";
import { LoggingService } from "../LoggingService";
import { ErrorHandlingService } from "../ErrorHandlingService";
import { PrismaClient } from "@prisma/client";

// Mock dependencies
const mockLoggingService = {
  info: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
} as unknown as LoggingService;

const mockErrorHandlingService = {} as ErrorHandlingService;

describe("MonitoringService", () => {
  let service: MonitoringService;

  beforeEach(() => {
    service = new MonitoringService(
      mockLoggingService,
      mockErrorHandlingService
    );
    vi.clearAllMocks();
  });

  afterEach(() => {
    service.stopMonitoring();
    vi.restoreAllMocks();
  });

  describe("health checks", () => {
    it("should perform successful health check", async () => {
      const mockCheckFunction = vi.fn().mockResolvedValue({
        status: "healthy" as const,
        details: { version: "1.0" },
      });

      const result = await service.performHealthCheck(
        "test-service",
        mockCheckFunction
      );

      expect(result).toMatchObject({
        name: "test-service",
        status: "healthy",
        responseTime: expect.any(Number),
        lastCheck: expect.any(Date),
        details: { version: "1.0" },
      });
      expect(mockCheckFunction).toHaveBeenCalled();
      expect(mockLoggingService.debug).toHaveBeenCalledWith(
        "Health check completed for test-service: healthy",
        "HEALTH_CHECK",
        expect.objectContaining({
          name: "test-service",
          status: "healthy",
          responseTime: expect.any(Number),
        })
      );
    });

    it("should handle failed health check", async () => {
      const mockCheckFunction = vi
        .fn()
        .mockRejectedValue(new Error("Service unavailable"));

      const result = await service.performHealthCheck(
        "test-service",
        mockCheckFunction
      );

      expect(result).toMatchObject({
        name: "test-service",
        status: "unhealthy",
        responseTime: expect.any(Number),
        lastCheck: expect.any(Date),
        error: "Service unavailable",
      });
      expect(mockLoggingService.error).toHaveBeenCalledWith(
        "Health check failed for test-service",
        "HEALTH_CHECK",
        expect.any(Error),
        expect.objectContaining({
          name: "test-service",
          responseTime: expect.any(Number),
        })
      );
    });

    it("should handle health check timeout", async () => {
      const mockCheckFunction = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 15000)) // 15 seconds
      );

      const result = await service.performHealthCheck(
        "test-service",
        mockCheckFunction
      );

      expect(result.status).toBe("unhealthy");
      expect(result.error).toBe("Health check timeout");
    });

    it("should handle degraded service status", async () => {
      const mockCheckFunction = vi.fn().mockResolvedValue({
        status: "degraded" as const,
        details: { latency: "high" },
      });

      const result = await service.performHealthCheck(
        "test-service",
        mockCheckFunction
      );

      expect(result.status).toBe("degraded");
      expect(result.details).toEqual({ latency: "high" });
    });
  });

  describe("system health", () => {
    beforeEach(async () => {
      // Add some health checks
      await service.performHealthCheck("service1", async () => ({
        status: "healthy" as const,
      }));
      await service.performHealthCheck("service2", async () => ({
        status: "degraded" as const,
      }));
      await service.performHealthCheck("service3", async () => ({
        status: "unhealthy" as const,
      }));
    });

    it("should get system health status", () => {
      const health = service.getSystemHealth();

      expect(health.overall).toBe("unhealthy"); // Because service3 is unhealthy
      expect(health.checks).toHaveLength(3);
      expect(health.summary).toEqual({
        healthy: 1,
        degraded: 1,
        unhealthy: 1,
      });
    });

    it("should return degraded when no unhealthy services", async () => {
      // Reset and add only healthy and degraded services
      const newService = new MonitoringService(
        mockLoggingService,
        mockErrorHandlingService
      );
      await newService.performHealthCheck("service1", async () => ({
        status: "healthy" as const,
      }));
      await newService.performHealthCheck("service2", async () => ({
        status: "degraded" as const,
      }));

      const health = newService.getSystemHealth();
      expect(health.overall).toBe("degraded");
    });

    it("should return healthy when all services are healthy", async () => {
      const newService = new MonitoringService(
        mockLoggingService,
        mockErrorHandlingService
      );
      await newService.performHealthCheck("service1", async () => ({
        status: "healthy" as const,
      }));
      await newService.performHealthCheck("service2", async () => ({
        status: "healthy" as const,
      }));

      const health = newService.getSystemHealth();
      expect(health.overall).toBe("healthy");
    });
  });

  describe("metrics collection", () => {
    it("should collect system metrics", async () => {
      const metrics = await service.collectMetrics();

      expect(metrics).toMatchObject({
        timestamp: expect.any(Date),
        cpu: {
          usage: expect.any(Number),
          loadAverage: expect.any(Array),
        },
        memory: {
          used: expect.any(Number),
          total: expect.any(Number),
          percentage: expect.any(Number),
        },
        database: {
          connections: expect.any(Number),
          queryTime: expect.any(Number),
          errorRate: expect.any(Number),
        },
        api: {
          requestsPerMinute: expect.any(Number),
          averageResponseTime: expect.any(Number),
          errorRate: expect.any(Number),
        },
        providers: {
          googleMeet: expect.objectContaining({
            name: "google-meet",
            status: expect.any(String),
            responseTime: expect.any(Number),
            lastCheck: expect.any(Date),
          }),
          zoom: expect.objectContaining({
            name: "zoom",
            status: expect.any(String),
          }),
          vimeo: expect.objectContaining({
            name: "vimeo",
            status: expect.any(String),
          }),
        },
      });
    });

    it("should store metrics in memory", async () => {
      await service.collectMetrics();
      await service.collectMetrics();

      const metrics = service.getMetrics();
      expect(metrics).toHaveLength(2);
    });

    it("should limit stored metrics", async () => {
      // Mock the metrics array to simulate many entries
      const service = new MonitoringService(
        mockLoggingService,
        mockErrorHandlingService
      );

      // Collect many metrics
      for (let i = 0; i < 1005; i++) {
        await service.collectMetrics();
      }

      const metrics = service.getMetrics();
      expect(metrics.length).toBeLessThanOrEqual(1000);
    });
  });

  describe("alerts", () => {
    it("should create alert", () => {
      const alert = service.createAlert(
        "performance",
        "high",
        "High CPU Usage",
        "CPU usage is above 90%",
        { cpu: 95 },
        ["Scale resources", "Investigate"]
      );

      expect(alert).toMatchObject({
        id: expect.stringMatching(/^alert_\d+_[a-z0-9]+$/),
        type: "performance",
        severity: "high",
        title: "High CPU Usage",
        description: "CPU usage is above 90%",
        timestamp: expect.any(Date),
        resolved: false,
        metadata: { cpu: 95 },
        actions: ["Scale resources", "Investigate"],
      });

      expect(mockLoggingService.warn).toHaveBeenCalledWith(
        "Alert created: High CPU Usage",
        "ALERT",
        undefined,
        expect.objectContaining({
          alertId: alert.id,
          type: "performance",
          severity: "high",
        })
      );
    });

    it("should resolve alert", () => {
      const alert = service.createAlert(
        "error",
        "medium",
        "Test Alert",
        "Test description"
      );

      const resolved = service.resolveAlert(alert.id, "Issue fixed");

      expect(resolved).toBe(true);
      expect(alert.resolved).toBe(true);
      expect(alert.resolvedAt).toBeInstanceOf(Date);
      expect(alert.metadata.resolution).toBe("Issue fixed");

      expect(mockLoggingService.info).toHaveBeenCalledWith(
        "Alert resolved: Test Alert",
        "ALERT",
        expect.objectContaining({
          alertId: alert.id,
          resolution: "Issue fixed",
          duration: expect.any(Number),
        })
      );
    });

    it("should not resolve non-existent alert", () => {
      const resolved = service.resolveAlert("non-existent-id");
      expect(resolved).toBe(false);
    });

    it("should not resolve already resolved alert", () => {
      const alert = service.createAlert(
        "error",
        "medium",
        "Test Alert",
        "Test description"
      );
      service.resolveAlert(alert.id);

      const resolved = service.resolveAlert(alert.id);
      expect(resolved).toBe(false);
    });

    it("should get active alerts only", () => {
      const alert1 = service.createAlert(
        "error",
        "high",
        "Alert 1",
        "Description 1"
      );
      const alert2 = service.createAlert(
        "performance",
        "medium",
        "Alert 2",
        "Description 2"
      );
      service.resolveAlert(alert1.id);

      const activeAlerts = service.getAlerts(false);
      const allAlerts = service.getAlerts(true);

      expect(activeAlerts).toHaveLength(1);
      expect(activeAlerts[0].id).toBe(alert2.id);
      expect(allAlerts).toHaveLength(2);
    });
  });

  describe("monitoring statistics", () => {
    beforeEach(async () => {
      // Create some test data
      service.createAlert("error", "high", "Error Alert", "Description");
      service.createAlert(
        "performance",
        "critical",
        "Critical Alert",
        "Description"
      );
      await service.collectMetrics();
    });

    it("should get monitoring statistics", () => {
      const stats = service.getMonitoringStats();

      expect(stats).toMatchObject({
        uptime: expect.any(Number),
        totalAlerts: 2,
        activeAlerts: 2,
        criticalAlerts: 1,
        averageResponseTime: expect.any(Number),
        errorRate: expect.any(Number),
        healthScore: expect.any(Number),
      });

      expect(stats.uptime).toBeGreaterThan(0);
      expect(stats.healthScore).toBeGreaterThanOrEqual(0);
      expect(stats.healthScore).toBeLessThanOrEqual(100);
    });
  });

  describe("monitoring rules", () => {
    it("should add custom monitoring rule", () => {
      const customRule = {
        name: "Custom Rule",
        condition: (metrics: any) => metrics.memory.percentage > 80,
        alertType: "performance" as const,
        severity: "medium" as const,
        title: "Custom Alert",
        description: "Custom description",
        actions: ["Custom action"],
        cooldownMinutes: 10,
      };

      service.addMonitoringRule(customRule);

      expect(mockLoggingService.info).toHaveBeenCalledWith(
        "Added custom monitoring rule: Custom Rule",
        "MONITORING",
        { rule: "Custom Rule" }
      );
    });

    it("should remove monitoring rule", () => {
      const removed = service.removeMonitoringRule("High Memory Usage");

      expect(removed).toBe(true);
      expect(mockLoggingService.info).toHaveBeenCalledWith(
        "Removed monitoring rule: High Memory Usage",
        "MONITORING",
        { rule: "High Memory Usage" }
      );
    });

    it("should not remove non-existent rule", () => {
      const removed = service.removeMonitoringRule("Non-existent Rule");
      expect(removed).toBe(false);
    });
  });

  describe("data export", () => {
    beforeEach(async () => {
      service.createAlert("error", "high", "Test Alert", "Test description");
      await service.collectMetrics();
    });

    it("should export monitoring data as JSON", () => {
      const exported = service.exportMonitoringData("json");
      const data = JSON.parse(exported);

      expect(data).toMatchObject({
        timestamp: expect.any(String),
        systemHealth: expect.objectContaining({
          overall: expect.any(String),
          checks: expect.any(Array),
          summary: expect.any(Object),
        }),
        recentMetrics: expect.any(Array),
        alerts: expect.any(Array),
        stats: expect.any(Object),
      });
    });

    it("should export monitoring data as CSV", () => {
      const exported = service.exportMonitoringData("csv");
      const lines = exported.split("\n");

      expect(lines[0]).toBe("timestamp,type,severity,title,resolved");
      expect(lines.length).toBeGreaterThan(1);
      expect(lines[1]).toContain("error");
      expect(lines[1]).toContain("high");
      expect(lines[1]).toContain("Test Alert");
    });

    it("should throw error for unsupported format", () => {
      expect(() => {
        service.exportMonitoringData("xml" as any);
      }).toThrow("Unsupported export format: xml");
    });
  });

  describe("monitoring lifecycle", () => {
    it("should start monitoring", () => {
      const intervalMs = 5000;
      service.startMonitoring(intervalMs);

      expect(mockLoggingService.info).toHaveBeenCalledWith(
        `System monitoring started with ${intervalMs}ms interval`,
        "MONITORING",
        { intervalMs }
      );
    });

    it("should stop monitoring", () => {
      service.startMonitoring(5000);
      service.stopMonitoring();

      expect(mockLoggingService.info).toHaveBeenCalledWith(
        "System monitoring stopped",
        "MONITORING"
      );
    });

    it("should restart monitoring if already running", () => {
      service.startMonitoring(5000);
      service.startMonitoring(3000);

      // Should log stop and then start
      expect(mockLoggingService.info).toHaveBeenCalledWith(
        "System monitoring stopped",
        "MONITORING"
      );
      expect(mockLoggingService.info).toHaveBeenCalledWith(
        "System monitoring started with 3000ms interval",
        "MONITORING",
        { intervalMs: 3000 }
      );
    });
  });

  describe("alert evaluation", () => {
    it("should evaluate monitoring rules and create alerts", async () => {
      // Collect metrics first
      await service.collectMetrics();

      // Mock a condition that should trigger an alert
      const customRule = {
        name: "Test Rule",
        condition: () => true, // Always trigger
        alertType: "performance" as const,
        severity: "medium" as const,
        title: "Test Alert",
        description: "Test description",
        actions: ["Test action"],
        cooldownMinutes: 1,
      };

      service.addMonitoringRule(customRule);

      // Manually trigger evaluation (normally done by interval)
      await (service as any).evaluateAlerts();

      const alerts = service.getAlerts();
      expect(alerts.some((alert) => alert.title === "Test Alert")).toBe(true);
    });

    it("should respect cooldown periods", async () => {
      await service.collectMetrics();

      const customRule = {
        name: "Cooldown Test",
        condition: () => true,
        alertType: "performance" as const,
        severity: "medium" as const,
        title: "Cooldown Alert",
        description: "Test description",
        actions: [],
        cooldownMinutes: 60, // 1 hour cooldown
      };

      service.addMonitoringRule(customRule);

      // First evaluation should create alert
      await (service as any).evaluateAlerts();
      const alertsAfterFirst = service.getAlerts();
      const firstAlertCount = alertsAfterFirst.filter(
        (a) => a.title === "Cooldown Alert"
      ).length;

      // Second evaluation should not create another alert due to cooldown
      await (service as any).evaluateAlerts();
      const alertsAfterSecond = service.getAlerts();
      const secondAlertCount = alertsAfterSecond.filter(
        (a) => a.title === "Cooldown Alert"
      ).length;

      expect(firstAlertCount).toBe(1);
      expect(secondAlertCount).toBe(1); // Should still be 1, not 2
    });
  });

  describe("cleanup", () => {
    it("should clean up old data", async () => {
      // Create old alert
      const oldAlert = service.createAlert(
        "error",
        "medium",
        "Old Alert",
        "Description"
      );
      oldAlert.resolved = true;
      oldAlert.timestamp = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days ago

      // Create recent alert
      service.createAlert("error", "medium", "Recent Alert", "Description");

      // Manually trigger cleanup
      await (service as any).cleanupOldData();

      const alerts = service.getAlerts(true);
      expect(alerts.some((alert) => alert.title === "Old Alert")).toBe(false);
      expect(alerts.some((alert) => alert.title === "Recent Alert")).toBe(true);
    });
  });
});
