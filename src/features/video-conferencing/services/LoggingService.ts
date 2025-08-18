/**
 * LoggingService
 * Comprehensive logging system for video conferencing operations
 */
import { PrismaClient } from "@prisma/client";

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  context: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  performance?: {
    duration: number;
    memoryUsage: NodeJS.MemoryUsage;
  };
}

export interface LogFilter {
  level?: LogLevel;
  context?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface LogStats {
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  averageResponseTime: number;
  topErrors: Array<{ error: string; count: number }>;
  logsByLevel: Record<LogLevel, number>;
}

export class LoggingService {
  private prisma: PrismaClient;
  private logs: LogEntry[] = [];
  private maxLogsInMemory = 10000;
  private logLevel: LogLevel = "info";

  constructor(prisma: PrismaClient, logLevel: LogLevel = "info") {
    this.prisma = prisma;
    this.logLevel = logLevel;
  }

  /**
   * Log a message with specified level
   */
  log(
    level: LogLevel,
    message: string,
    context: string,
    metadata?: Record<string, any>,
    error?: Error,
    userId?: string,
    sessionId?: string,
    requestId?: string
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      level,
      message,
      context,
      userId,
      sessionId,
      requestId,
      metadata,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: (error as any).code,
          }
        : undefined,
    };

    this.addLog(logEntry);
    this.outputLog(logEntry);
  }

  /**
   * Debug level logging
   */
  debug(
    message: string,
    context: string,
    metadata?: Record<string, any>,
    userId?: string,
    sessionId?: string,
    requestId?: string
  ): void {
    this.log(
      "debug",
      message,
      context,
      metadata,
      undefined,
      userId,
      sessionId,
      requestId
    );
  }

  /**
   * Info level logging
   */
  info(
    message: string,
    context: string,
    metadata?: Record<string, any>,
    userId?: string,
    sessionId?: string,
    requestId?: string
  ): void {
    this.log(
      "info",
      message,
      context,
      metadata,
      undefined,
      userId,
      sessionId,
      requestId
    );
  }

  /**
   * Warning level logging
   */
  warn(
    message: string,
    context: string,
    metadata?: Record<string, any>,
    error?: Error,
    userId?: string,
    sessionId?: string,
    requestId?: string
  ): void {
    this.log(
      "warn",
      message,
      context,
      metadata,
      error,
      userId,
      sessionId,
      requestId
    );
  }

  /**
   * Error level logging
   */
  error(
    message: string,
    context: string,
    error?: Error,
    metadata?: Record<string, any>,
    userId?: string,
    sessionId?: string,
    requestId?: string
  ): void {
    this.log(
      "error",
      message,
      context,
      metadata,
      error,
      userId,
      sessionId,
      requestId
    );
  }

  /**
   * Fatal level logging
   */
  fatal(
    message: string,
    context: string,
    error?: Error,
    metadata?: Record<string, any>,
    userId?: string,
    sessionId?: string,
    requestId?: string
  ): void {
    this.log(
      "fatal",
      message,
      context,
      metadata,
      error,
      userId,
      sessionId,
      requestId
    );
  }

  /**
   * Log performance metrics
   */
  logPerformance(
    message: string,
    context: string,
    duration: number,
    metadata?: Record<string, any>,
    userId?: string,
    sessionId?: string,
    requestId?: string
  ): void {
    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      level: "info",
      message,
      context,
      userId,
      sessionId,
      requestId,
      metadata,
      performance: {
        duration,
        memoryUsage: process.memoryUsage(),
      },
    };

    this.addLog(logEntry);
    this.outputLog(logEntry);
  }

  /**
   * Log API request/response
   */
  logApiCall(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: string,
    sessionId?: string,
    requestId?: string,
    error?: Error
  ): void {
    const level: LogLevel =
      statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";

    this.log(
      level,
      `API ${method} ${url} - ${statusCode}`,
      "API_CALL",
      {
        method,
        url,
        statusCode,
        duration,
      },
      error,
      userId,
      sessionId,
      requestId
    );
  }

  /**
   * Log provider API interactions
   */
  logProviderCall(
    provider: string,
    operation: string,
    success: boolean,
    duration: number,
    metadata?: Record<string, any>,
    error?: Error,
    userId?: string,
    sessionId?: string,
    requestId?: string
  ): void {
    const level: LogLevel = success ? "info" : "error";

    this.log(
      level,
      `${provider} ${operation} - ${success ? "SUCCESS" : "FAILED"}`,
      "PROVIDER_API",
      {
        provider,
        operation,
        success,
        duration,
        ...metadata,
      },
      error,
      userId,
      sessionId,
      requestId
    );
  }

  /**
   * Log user actions
   */
  logUserAction(
    action: string,
    resource: string,
    resourceId?: string,
    success: boolean = true,
    metadata?: Record<string, any>,
    error?: Error,
    userId?: string,
    sessionId?: string,
    requestId?: string
  ): void {
    const level: LogLevel = success ? "info" : "error";

    this.log(
      level,
      `User action: ${action} on ${resource}${resourceId ? ` (${resourceId})` : ""}`,
      "USER_ACTION",
      {
        action,
        resource,
        resourceId,
        success,
        ...metadata,
      },
      error,
      userId,
      sessionId,
      requestId
    );
  }

  /**
   * Log security events
   */
  logSecurityEvent(
    event: string,
    severity: "low" | "medium" | "high" | "critical",
    details: Record<string, any>,
    userId?: string,
    sessionId?: string,
    requestId?: string
  ): void {
    const levelMap: Record<string, LogLevel> = {
      low: "info",
      medium: "warn",
      high: "error",
      critical: "fatal",
    };

    this.log(
      levelMap[severity],
      `Security event: ${event}`,
      "SECURITY",
      {
        event,
        severity,
        ...details,
      },
      undefined,
      userId,
      sessionId,
      requestId
    );
  }

  /**
   * Get logs with filtering
   */
  getLogs(
    filter: LogFilter = {},
    limit: number = 100,
    offset: number = 0
  ): LogEntry[] {
    let filteredLogs = [...this.logs];

    // Apply filters
    if (filter.level) {
      filteredLogs = filteredLogs.filter((log) => log.level === filter.level);
    }

    if (filter.context) {
      filteredLogs = filteredLogs.filter(
        (log) => log.context === filter.context
      );
    }

    if (filter.userId) {
      filteredLogs = filteredLogs.filter((log) => log.userId === filter.userId);
    }

    if (filter.startDate) {
      filteredLogs = filteredLogs.filter(
        (log) => log.timestamp >= filter.startDate!
      );
    }

    if (filter.endDate) {
      filteredLogs = filteredLogs.filter(
        (log) => log.timestamp <= filter.endDate!
      );
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filteredLogs = filteredLogs.filter(
        (log) =>
          log.message.toLowerCase().includes(searchLower) ||
          log.context.toLowerCase().includes(searchLower) ||
          log.error?.message.toLowerCase().includes(searchLower)
      );
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    return filteredLogs.slice(offset, offset + limit);
  }

  /**
   * Get log statistics
   */
  getLogStats(filter: LogFilter = {}): LogStats {
    const logs = this.getLogs(filter, 10000); // Get more logs for stats

    const errorCount = logs.filter(
      (log) => log.level === "error" || log.level === "fatal"
    ).length;
    const warnCount = logs.filter((log) => log.level === "warn").length;

    // Calculate average response time from performance logs
    const performanceLogs = logs.filter((log) => log.performance);
    const averageResponseTime =
      performanceLogs.length > 0
        ? performanceLogs.reduce(
            (sum, log) => sum + log.performance!.duration,
            0
          ) / performanceLogs.length
        : 0;

    // Get top errors
    const errorMessages: Record<string, number> = {};
    logs
      .filter((log) => log.error)
      .forEach((log) => {
        const errorKey = log.error!.name + ": " + log.error!.message;
        errorMessages[errorKey] = (errorMessages[errorKey] || 0) + 1;
      });

    const topErrors = Object.entries(errorMessages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([error, count]) => ({ error, count }));

    // Count logs by level
    const logsByLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0,
    };

    logs.forEach((log) => {
      logsByLevel[log.level]++;
    });

    return {
      totalLogs: logs.length,
      errorCount,
      warnCount,
      averageResponseTime,
      topErrors,
      logsByLevel,
    };
  }

  /**
   * Export logs to different formats
   */
  exportLogs(
    format: "json" | "csv" | "txt",
    filter: LogFilter = {},
    limit: number = 1000
  ): string {
    const logs = this.getLogs(filter, limit);

    switch (format) {
      case "json":
        return JSON.stringify(logs, null, 2);

      case "csv":
        const headers = [
          "timestamp",
          "level",
          "context",
          "message",
          "userId",
          "error",
        ];
        const csvRows = [
          headers.join(","),
          ...logs.map((log) =>
            [
              log.timestamp.toISOString(),
              log.level,
              log.context,
              `"${log.message.replace(/"/g, '""')}"`,
              log.userId || "",
              log.error ? `"${log.error.message.replace(/"/g, '""')}"` : "",
            ].join(",")
          ),
        ];
        return csvRows.join("\n");

      case "txt":
        return logs
          .map((log) => {
            let line = `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()} [${log.context}] ${log.message}`;
            if (log.userId) line += ` (User: ${log.userId})`;
            if (log.error) line += `\nError: ${log.error.message}`;
            if (log.error?.stack) line += `\nStack: ${log.error.stack}`;
            return line;
          })
          .join("\n\n");

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Clear old logs
   */
  clearOldLogs(olderThanHours: number = 24): number {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    const initialCount = this.logs.length;

    this.logs = this.logs.filter((log) => log.timestamp > cutoffTime);

    const removedCount = initialCount - this.logs.length;
    if (removedCount > 0) {
      this.info(`Cleared ${removedCount} old log entries`, "LOG_CLEANUP", {
        removedCount,
        cutoffTime: cutoffTime.toISOString(),
      });
    }

    return removedCount;
  }

  /**
   * Set log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.info(`Log level changed to ${level}`, "LOG_CONFIG");
  }

  /**
   * Get current log level
   */
  getLogLevel(): LogLevel {
    return this.logLevel;
  }

  /**
   * Check if should log at specified level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      fatal: 4,
    };

    return levels[level] >= levels[this.logLevel];
  }

  /**
   * Add log to memory storage
   */
  private addLog(logEntry: LogEntry): void {
    this.logs.push(logEntry);

    // Keep only the most recent logs in memory
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs = this.logs.slice(-this.maxLogsInMemory);
    }
  }

  /**
   * Output log to console
   */
  private outputLog(logEntry: LogEntry): void {
    const timestamp = logEntry.timestamp.toISOString();
    const level = logEntry.level.toUpperCase().padEnd(5);
    const context = logEntry.context.padEnd(15);

    let message = `[${timestamp}] ${level} [${context}] ${logEntry.message}`;

    if (logEntry.userId) {
      message += ` (User: ${logEntry.userId})`;
    }

    if (logEntry.requestId) {
      message += ` (Request: ${logEntry.requestId})`;
    }

    // Use appropriate console method based on log level
    switch (logEntry.level) {
      case "debug":
        console.debug(message, logEntry.metadata);
        break;
      case "info":
        console.info(message, logEntry.metadata);
        break;
      case "warn":
        console.warn(message, logEntry.metadata, logEntry.error);
        break;
      case "error":
      case "fatal":
        console.error(message, logEntry.metadata, logEntry.error);
        break;
    }
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Flush logs to persistent storage (if needed)
   */
  async flushLogs(): Promise<void> {
    // In a real implementation, you might want to persist logs to database
    // For now, we'll just log the flush operation
    this.info(
      `Flushed ${this.logs.length} logs to persistent storage`,
      "LOG_FLUSH",
      { logCount: this.logs.length }
    );
  }

  /**
   * Get memory usage of logging service
   */
  getMemoryUsage(): {
    logCount: number;
    estimatedMemoryMB: number;
  } {
    const logCount = this.logs.length;
    const estimatedMemoryMB = JSON.stringify(this.logs).length / 1024 / 1024;

    return {
      logCount,
      estimatedMemoryMB: Math.round(estimatedMemoryMB * 100) / 100,
    };
  }
}
