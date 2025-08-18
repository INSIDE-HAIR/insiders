/**
 * LoggingService Tests
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { LoggingService, LogLevel } from "../LoggingService";

// Mock Prisma Client
const mockPrisma = {} as PrismaClient;

// Mock console methods
const originalConsole = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

describe("LoggingService", () => {
  let service: LoggingService;

  beforeEach(() => {
    service = new LoggingService(mockPrisma, "debug");

    // Mock console methods
    console.debug = vi.fn();
    console.info = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    // Restore console methods
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;

    vi.restoreAllMocks();
  });

  describe("log levels", () => {
    it("should log debug messages when level is debug", () => {
      service.debug("Debug message", "TEST_CONTEXT");
      expect(console.debug).toHaveBeenCalled();
    });

    it("should log info messages when level is debug", () => {
      service.info("Info message", "TEST_CONTEXT");
      expect(console.info).toHaveBeenCalled();
    });

    it("should log warn messages when level is debug", () => {
      service.warn("Warn message", "TEST_CONTEXT");
      expect(console.warn).toHaveBeenCalled();
    });

    it("should log error messages when level is debug", () => {
      service.error("Error message", "TEST_CONTEXT");
      expect(console.error).toHaveBeenCalled();
    });

    it("should not log debug messages when level is info", () => {
      service.setLogLevel("info");
      service.debug("Debug message", "TEST_CONTEXT");
      expect(console.debug).not.toHaveBeenCalled();
    });

    it("should log info messages when level is info", () => {
      service.setLogLevel("info");
      service.info("Info message", "TEST_CONTEXT");
      expect(console.info).toHaveBeenCalled();
    });

    it("should not log info messages when level is error", () => {
      service.setLogLevel("error");
      service.info("Info message", "TEST_CONTEXT");
      expect(console.info).not.toHaveBeenCalled();
    });
  });

  describe("log entry creation", () => {
    it("should create log entry with all properties", () => {
      const error = new Error("Test error");
      service.error(
        "Test message",
        "TEST_CONTEXT",
        error,
        { key: "value" },
        "user123",
        "session456",
        "req789"
      );

      const logs = service.getLogs();
      expect(logs).toHaveLength(1);

      const logEntry = logs[0];
      expect(logEntry.level).toBe("error");
      expect(logEntry.message).toBe("Test message");
      expect(logEntry.context).toBe("TEST_CONTEXT");
      expect(logEntry.userId).toBe("user123");
      expect(logEntry.sessionId).toBe("session456");
      expect(logEntry.requestId).toBe("req789");
      expect(logEntry.metadata).toEqual({ key: "value" });
      expect(logEntry.error).toMatchObject({
        name: "Error",
        message: "Test error",
        stack: expect.any(String),
      });
      expect(logEntry.timestamp).toBeInstanceOf(Date);
      expect(logEntry.id).toMatch(/^log_\d+_[a-z0-9]+$/);
    });

    it("should create log entry without optional properties", () => {
      service.info("Simple message", "TEST_CONTEXT");

      const logs = service.getLogs();
      expect(logs).toHaveLength(1);

      const logEntry = logs[0];
      expect(logEntry.level).toBe("info");
      expect(logEntry.message).toBe("Simple message");
      expect(logEntry.context).toBe("TEST_CONTEXT");
      expect(logEntry.userId).toBeUndefined();
      expect(logEntry.sessionId).toBeUndefined();
      expect(logEntry.requestId).toBeUndefined();
      expect(logEntry.metadata).toBeUndefined();
      expect(logEntry.error).toBeUndefined();
    });
  });

  describe("performance logging", () => {
    it("should log performance metrics", () => {
      service.logPerformance(
        "Operation completed",
        "PERFORMANCE",
        1500,
        { operation: "test" },
        "user123"
      );

      const logs = service.getLogs();
      expect(logs).toHaveLength(1);

      const logEntry = logs[0];
      expect(logEntry.level).toBe("info");
      expect(logEntry.message).toBe("Operation completed");
      expect(logEntry.context).toBe("PERFORMANCE");
      expect(logEntry.performance).toMatchObject({
        duration: 1500,
        memoryUsage: expect.objectContaining({
          heapUsed: expect.any(Number),
          heapTotal: expect.any(Number),
        }),
      });
    });
  });

  describe("API call logging", () => {
    it("should log successful API call", () => {
      service.logApiCall(
        "GET",
        "/api/test",
        200,
        250,
        "user123",
        "session456",
        "req789"
      );

      const logs = service.getLogs();
      expect(logs).toHaveLength(1);

      const logEntry = logs[0];
      expect(logEntry.level).toBe("info");
      expect(logEntry.message).toBe("API GET /api/test - 200");
      expect(logEntry.context).toBe("API_CALL");
      expect(logEntry.metadata).toMatchObject({
        method: "GET",
        url: "/api/test",
        statusCode: 200,
        duration: 250,
      });
    });

    it("should log API call with error status as warning", () => {
      service.logApiCall("POST", "/api/test", 400, 150);

      const logs = service.getLogs();
      expect(logs).toHaveLength(1);

      const logEntry = logs[0];
      expect(logEntry.level).toBe("warn");
      expect(logEntry.message).toBe("API POST /api/test - 400");
    });

    it("should log API call with server error as error", () => {
      const error = new Error("Server error");
      service.logApiCall(
        "POST",
        "/api/test",
        500,
        1000,
        "user123",
        "session456",
        "req789",
        error
      );

      const logs = service.getLogs();
      expect(logs).toHaveLength(1);

      const logEntry = logs[0];
      expect(logEntry.level).toBe("error");
      expect(logEntry.error).toMatchObject({
        name: "Error",
        message: "Server error",
      });
    });
  });

  describe("provider call logging", () => {
    it("should log successful provider call", () => {
      service.logProviderCall(
        "zoom",
        "createMeeting",
        true,
        800,
        { meetingId: "123" },
        undefined,
        "user123"
      );

      const logs = service.getLogs();
      expect(logs).toHaveLength(1);

      const logEntry = logs[0];
      expect(logEntry.level).toBe("info");
      expect(logEntry.message).toBe("zoom createMeeting - SUCCESS");
      expect(logEntry.context).toBe("PROVIDER_API");
      expect(logEntry.metadata).toMatchObject({
        provider: "zoom",
        operation: "createMeeting",
        success: true,
        duration: 800,
        meetingId: "123",
      });
    });

    it("should log failed provider call", () => {
      const error = new Error("API timeout");
      service.logProviderCall(
        "google-meet",
        "createSpace",
        false,
        5000,
        { timeout: true },
        error,
        "user123"
      );

      const logs = service.getLogs();
      expect(logs).toHaveLength(1);

      const logEntry = logs[0];
      expect(logEntry.level).toBe("error");
      expect(logEntry.message).toBe("google-meet createSpace - FAILED");
      expect(logEntry.error).toMatchObject({
        name: "Error",
        message: "API timeout",
      });
    });
  });

  describe("user action logging", () => {
    it("should log successful user action", () => {
      service.logUserAction(
        "CREATE_SPACE",
        "video_space",
        "space123",
        true,
        { provider: "zoom" },
        undefined,
        "user123"
      );

      const logs = service.getLogs();
      expect(logs).toHaveLength(1);

      const logEntry = logs[0];
      expect(logEntry.level).toBe("info");
      expect(logEntry.message).toBe(
        "User action: CREATE_SPACE on video_space (space123)"
      );
      expect(logEntry.context).toBe("USER_ACTION");
      expect(logEntry.metadata).toMatchObject({
        action: "CREATE_SPACE",
        resource: "video_space",
        resourceId: "space123",
        success: true,
        provider: "zoom",
      });
    });

    it("should log failed user action", () => {
      const error = new Error("Permission denied");
      service.logUserAction(
        "DELETE_SPACE",
        "video_space",
        "space123",
        false,
        {},
        error,
        "user123"
      );

      const logs = service.getLogs();
      expect(logs).toHaveLength(1);

      const logEntry = logs[0];
      expect(logEntry.level).toBe("error");
      expect(logEntry.error).toMatchObject({
        name: "Error",
        message: "Permission denied",
      });
    });
  });

  describe("security event logging", () => {
    it("should log low severity security event as info", () => {
      service.logSecurityEvent(
        "LOGIN_ATTEMPT",
        "low",
        { ip: "192.168.1.1" },
        "user123"
      );

      const logs = service.getLogs();
      expect(logs).toHaveLength(1);

      const logEntry = logs[0];
      expect(logEntry.level).toBe("info");
      expect(logEntry.message).toBe("Security event: LOGIN_ATTEMPT");
      expect(logEntry.context).toBe("SECURITY");
    });

    it("should log critical security event as fatal", () => {
      service.logSecurityEvent(
        "BREACH_DETECTED",
        "critical",
        { source: "external" },
        "user123"
      );

      const logs = service.getLogs();
      expect(logs).toHaveLength(1);

      const logEntry = logs[0];
      expect(logEntry.level).toBe("fatal");
      expect(logEntry.metadata).toMatchObject({
        event: "BREACH_DETECTED",
        severity: "critical",
        source: "external",
      });
    });
  });

  describe("log filtering", () => {
    beforeEach(() => {
      // Create test logs
      service.debug("Debug message", "TEST", {}, undefined, "user1");
      service.info("Info message", "TEST", {}, undefined, "user1");
      service.warn("Warn message", "OTHER", {}, undefined, "user2");
      service.error("Error message", "TEST", new Error("test"), {}, "user2");
    });

    it("should filter by log level", () => {
      const errorLogs = service.getLogs({ level: "error" });
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].level).toBe("error");
    });

    it("should filter by context", () => {
      const testLogs = service.getLogs({ context: "TEST" });
      expect(testLogs).toHaveLength(3);
      testLogs.forEach((log) => expect(log.context).toBe("TEST"));
    });

    it("should filter by user ID", () => {
      const user1Logs = service.getLogs({ userId: "user1" });
      expect(user1Logs).toHaveLength(2);
      user1Logs.forEach((log) => expect(log.userId).toBe("user1"));
    });

    it("should filter by date range", () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      const recentLogs = service.getLogs({
        startDate: oneHourAgo,
        endDate: oneHourFromNow,
      });
      expect(recentLogs).toHaveLength(4); // All logs should be within range
    });

    it("should filter by search term", () => {
      const searchLogs = service.getLogs({ search: "Error" });
      expect(searchLogs).toHaveLength(1);
      expect(searchLogs[0].message).toContain("Error");
    });

    it("should apply multiple filters", () => {
      const filteredLogs = service.getLogs({
        context: "TEST",
        userId: "user1",
      });
      expect(filteredLogs).toHaveLength(2);
      filteredLogs.forEach((log) => {
        expect(log.context).toBe("TEST");
        expect(log.userId).toBe("user1");
      });
    });

    it("should apply pagination", () => {
      const firstPage = service.getLogs({}, 2, 0);
      const secondPage = service.getLogs({}, 2, 2);

      expect(firstPage).toHaveLength(2);
      expect(secondPage).toHaveLength(2);
      expect(firstPage[0].id).not.toBe(secondPage[0].id);
    });
  });

  describe("log statistics", () => {
    beforeEach(() => {
      // Create test logs with errors
      service.info("Info message", "TEST");
      service.warn("Warn message", "TEST");
      service.error("Error 1", "TEST", new Error("First error"));
      service.error("Error 2", "TEST", new Error("Second error"));
      service.fatal("Fatal error", "TEST", new Error("First error")); // Duplicate error
      service.logPerformance("Fast operation", "PERF", 100);
      service.logPerformance("Slow operation", "PERF", 2000);
    });

    it("should calculate log statistics correctly", () => {
      const stats = service.getLogStats();

      expect(stats.totalLogs).toBe(7);
      expect(stats.errorCount).toBe(3); // error + fatal
      expect(stats.warnCount).toBe(1);
      expect(stats.averageResponseTime).toBe(1050); // (100 + 2000) / 2
      expect(stats.logsByLevel.info).toBe(3); // info + 2 performance logs
      expect(stats.logsByLevel.warn).toBe(1);
      expect(stats.logsByLevel.error).toBe(2);
      expect(stats.logsByLevel.fatal).toBe(1);
    });

    it("should identify top errors", () => {
      const stats = service.getLogStats();

      expect(stats.topErrors).toHaveLength(2);
      expect(stats.topErrors[0]).toEqual({
        error: "Error: First error",
        count: 2, // Appears in both error and fatal logs
      });
      expect(stats.topErrors[1]).toEqual({
        error: "Error: Second error",
        count: 1,
      });
    });
  });

  describe("log export", () => {
    beforeEach(() => {
      service.info("Test message", "TEST", {}, undefined, "user123");
      service.error(
        "Error message",
        "TEST",
        new Error("Test error"),
        {},
        "user123"
      );
    });

    it("should export logs as JSON", () => {
      const exported = service.exportLogs("json", {}, 10);
      const logs = JSON.parse(exported);

      expect(Array.isArray(logs)).toBe(true);
      expect(logs).toHaveLength(2);
      expect(logs[0]).toMatchObject({
        level: expect.any(String),
        message: expect.any(String),
        context: expect.any(String),
        timestamp: expect.any(String),
      });
    });

    it("should export logs as CSV", () => {
      const exported = service.exportLogs("csv", {}, 10);
      const lines = exported.split("\n");

      expect(lines[0]).toBe("timestamp,level,context,message,userId,error");
      expect(lines).toHaveLength(3); // Header + 2 data rows
      expect(lines[1]).toContain("error");
      expect(lines[1]).toContain("TEST");
      expect(lines[1]).toContain("user123");
    });

    it("should export logs as TXT", () => {
      const exported = service.exportLogs("txt", {}, 10);

      expect(exported).toContain("[ERROR]");
      expect(exported).toContain("[INFO]");
      expect(exported).toContain("Test message");
      expect(exported).toContain("Error message");
      expect(exported).toContain("User: user123");
      expect(exported).toContain("Error: Test error");
    });

    it("should throw error for unsupported format", () => {
      expect(() => {
        service.exportLogs("xml" as any);
      }).toThrow("Unsupported export format: xml");
    });
  });

  describe("log cleanup", () => {
    it("should clear old logs", () => {
      // Create logs
      service.info("Recent log", "TEST");

      // Mock old timestamp
      const oldLog = service.getLogs()[0];
      oldLog.timestamp = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago

      service.info("Another recent log", "TEST");

      const removedCount = service.clearOldLogs(24); // Clear logs older than 24 hours

      expect(removedCount).toBe(1);
      const remainingLogs = service.getLogs();
      expect(remainingLogs).toHaveLength(2); // One old log removed, plus the cleanup log
    });

    it("should not clear recent logs", () => {
      service.info("Recent log 1", "TEST");
      service.info("Recent log 2", "TEST");

      const removedCount = service.clearOldLogs(24);

      expect(removedCount).toBe(0);
      const remainingLogs = service.getLogs();
      expect(remainingLogs).toHaveLength(2);
    });
  });

  describe("memory management", () => {
    it("should limit logs in memory", () => {
      // Create more logs than the limit (assuming default limit is 10000)
      const service = new LoggingService(mockPrisma);

      // Mock the maxLogsInMemory to a smaller number for testing
      (service as any).maxLogsInMemory = 5;

      // Add 10 logs
      for (let i = 0; i < 10; i++) {
        service.info(`Log ${i}`, "TEST");
      }

      const logs = service.getLogs();
      expect(logs.length).toBeLessThanOrEqual(5);
    });

    it("should report memory usage", () => {
      service.info("Test log", "TEST");

      const memoryUsage = service.getMemoryUsage();

      expect(memoryUsage).toMatchObject({
        logCount: expect.any(Number),
        estimatedMemoryMB: expect.any(Number),
      });
      expect(memoryUsage.logCount).toBeGreaterThan(0);
      expect(memoryUsage.estimatedMemoryMB).toBeGreaterThan(0);
    });
  });

  describe("log level management", () => {
    it("should get current log level", () => {
      expect(service.getLogLevel()).toBe("debug");
    });

    it("should set new log level", () => {
      service.setLogLevel("warn");
      expect(service.getLogLevel()).toBe("warn");

      // Should log the level change
      const logs = service.getLogs();
      expect(
        logs.some((log) => log.message.includes("Log level changed to warn"))
      ).toBe(true);
    });
  });

  describe("flush logs", () => {
    it("should flush logs to persistent storage", async () => {
      service.info("Test log", "TEST");

      await service.flushLogs();

      // Should log the flush operation
      const logs = service.getLogs();
      expect(
        logs.some(
          (log) =>
            log.message.includes("Flushed") &&
            log.message.includes("logs to persistent storage")
        )
      ).toBe(true);
    });
  });
});
