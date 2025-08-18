/**
 * Video Conferencing Services - Error Classes
 * Standardized error handling for all video conferencing operations
 */

import type { VideoProvider } from "../types";

// =============================================================================
// Base Error Class
// =============================================================================

export class VideoConferencingError extends Error {
  public readonly code: string;
  public readonly provider?: VideoProvider;
  public readonly originalError?: Error;
  public readonly statusCode?: number;
  public readonly requestId?: string;

  constructor(
    message: string,
    code: string,
    provider?: VideoProvider,
    originalError?: Error,
    statusCode?: number,
    requestId?: string
  ) {
    super(message);
    this.name = "VideoConferencingError";
    this.code = code;
    this.provider = provider;
    this.originalError = originalError;
    this.statusCode = statusCode;
    this.requestId = requestId;

    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VideoConferencingError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      provider: this.provider,
      statusCode: this.statusCode,
      requestId: this.requestId,
      stack: this.stack,
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack,
          }
        : undefined,
    };
  }
}

// =============================================================================
// Authentication Errors
// =============================================================================

export class ProviderAuthError extends VideoConferencingError {
  constructor(
    provider: VideoProvider,
    message: string,
    originalError?: Error,
    statusCode?: number
  ) {
    super(
      `Authentication failed for ${provider}: ${message}`,
      "AUTH_ERROR",
      provider,
      originalError,
      statusCode
    );
    this.name = "ProviderAuthError";
  }
}

export class TokenExpiredError extends ProviderAuthError {
  constructor(provider: VideoProvider, originalError?: Error) {
    super(
      provider,
      "Access token has expired and refresh failed",
      originalError,
      401
    );
    this.name = "TokenExpiredError";
  }
}

export class InvalidScopesError extends ProviderAuthError {
  public readonly requiredScopes: string[];
  public readonly grantedScopes: string[];

  constructor(
    provider: VideoProvider,
    requiredScopes: string[],
    grantedScopes: string[],
    originalError?: Error
  ) {
    const missingScopes = requiredScopes.filter(
      (scope) => !grantedScopes.includes(scope)
    );
    super(
      provider,
      `Missing required scopes: ${missingScopes.join(", ")}`,
      originalError,
      403
    );
    this.name = "InvalidScopesError";
    this.requiredScopes = requiredScopes;
    this.grantedScopes = grantedScopes;
  }
}

// =============================================================================
// Room Management Errors
// =============================================================================

export class RoomCreationError extends VideoConferencingError {
  constructor(
    provider: VideoProvider,
    message: string,
    originalError?: Error,
    statusCode?: number
  ) {
    super(
      `Failed to create room in ${provider}: ${message}`,
      "ROOM_CREATION_ERROR",
      provider,
      originalError,
      statusCode
    );
    this.name = "RoomCreationError";
  }
}

export class RoomNotFoundError extends VideoConferencingError {
  public readonly roomId: string;

  constructor(provider: VideoProvider, roomId: string, originalError?: Error) {
    super(
      `Room not found in ${provider}: ${roomId}`,
      "ROOM_NOT_FOUND",
      provider,
      originalError,
      404
    );
    this.name = "RoomNotFoundError";
    this.roomId = roomId;
  }
}

export class RoomConfigurationError extends VideoConferencingError {
  public readonly unsupportedFeatures: string[];

  constructor(
    provider: VideoProvider,
    unsupportedFeatures: string[],
    originalError?: Error
  ) {
    super(
      `Unsupported configuration features for ${provider}: ${unsupportedFeatures.join(", ")}`,
      "ROOM_CONFIGURATION_ERROR",
      provider,
      originalError,
      400
    );
    this.name = "RoomConfigurationError";
    this.unsupportedFeatures = unsupportedFeatures;
  }
}

// =============================================================================
// Data Synchronization Errors
// =============================================================================

export class DataSyncError extends VideoConferencingError {
  public readonly syncType:
    | "meeting"
    | "participant"
    | "recording"
    | "transcript"
    | "chat";

  constructor(
    provider: VideoProvider,
    syncType: "meeting" | "participant" | "recording" | "transcript" | "chat",
    message: string,
    originalError?: Error,
    statusCode?: number
  ) {
    super(
      `Failed to sync ${syncType} data from ${provider}: ${message}`,
      "DATA_SYNC_ERROR",
      provider,
      originalError,
      statusCode
    );
    this.name = "DataSyncError";
    this.syncType = syncType;
  }
}

export class MeetingNotFoundError extends VideoConferencingError {
  public readonly meetingId: string;

  constructor(
    provider: VideoProvider,
    meetingId: string,
    originalError?: Error
  ) {
    super(
      `Meeting not found in ${provider}: ${meetingId}`,
      "MEETING_NOT_FOUND",
      provider,
      originalError,
      404
    );
    this.name = "MeetingNotFoundError";
    this.meetingId = meetingId;
  }
}

// =============================================================================
// Webhook Errors
// =============================================================================

export class WebhookValidationError extends VideoConferencingError {
  public readonly webhookEvent?: string;

  constructor(
    provider: VideoProvider,
    message: string,
    webhookEvent?: string,
    originalError?: Error
  ) {
    super(
      `Webhook validation failed for ${provider}: ${message}`,
      "WEBHOOK_VALIDATION_ERROR",
      provider,
      originalError,
      400
    );
    this.name = "WebhookValidationError";
    this.webhookEvent = webhookEvent;
  }
}

export class WebhookProcessingError extends VideoConferencingError {
  public readonly webhookEvent: string;
  public readonly webhookPayload?: any;

  constructor(
    provider: VideoProvider,
    webhookEvent: string,
    message: string,
    webhookPayload?: any,
    originalError?: Error
  ) {
    super(
      `Failed to process webhook event ${webhookEvent} for ${provider}: ${message}`,
      "WEBHOOK_PROCESSING_ERROR",
      provider,
      originalError,
      500
    );
    this.name = "WebhookProcessingError";
    this.webhookEvent = webhookEvent;
    this.webhookPayload = webhookPayload;
  }
}

// =============================================================================
// API Rate Limiting Errors
// =============================================================================

export class RateLimitError extends VideoConferencingError {
  public readonly retryAfter?: number;
  public readonly dailyLimit?: number;
  public readonly remainingRequests?: number;

  constructor(
    provider: VideoProvider,
    message: string,
    retryAfter?: number,
    dailyLimit?: number,
    remainingRequests?: number,
    originalError?: Error
  ) {
    super(
      `Rate limit exceeded for ${provider}: ${message}`,
      "RATE_LIMIT_ERROR",
      provider,
      originalError,
      429
    );
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
    this.dailyLimit = dailyLimit;
    this.remainingRequests = remainingRequests;
  }
}

// =============================================================================
// Validation Errors
// =============================================================================

export class ValidationError extends VideoConferencingError {
  public readonly field?: string;
  public readonly validationErrors: Array<{
    field: string;
    message: string;
    code: string;
  }>;

  constructor(
    message: string,
    validationErrors: Array<{ field: string; message: string; code: string }>,
    field?: string,
    provider?: VideoProvider
  ) {
    super(message, "VALIDATION_ERROR", provider, undefined, 400);
    this.name = "ValidationError";
    this.field = field;
    this.validationErrors = validationErrors;
  }
}

// =============================================================================
// Database Errors
// =============================================================================

export class DatabaseError extends VideoConferencingError {
  public readonly operation: "create" | "read" | "update" | "delete";
  public readonly entity: string;

  constructor(
    operation: "create" | "read" | "update" | "delete",
    entity: string,
    message: string,
    originalError?: Error
  ) {
    super(
      `Database ${operation} operation failed for ${entity}: ${message}`,
      "DATABASE_ERROR",
      undefined,
      originalError,
      500
    );
    this.name = "DatabaseError";
    this.operation = operation;
    this.entity = entity;
  }
}

// =============================================================================
// Export and Analytics Errors
// =============================================================================

export class ExportError extends VideoConferencingError {
  public readonly exportFormat: string;
  public readonly recordCount?: number;

  constructor(
    exportFormat: string,
    message: string,
    recordCount?: number,
    originalError?: Error
  ) {
    super(
      `Failed to export data in ${exportFormat} format: ${message}`,
      "EXPORT_ERROR",
      undefined,
      originalError,
      500
    );
    this.name = "ExportError";
    this.exportFormat = exportFormat;
    this.recordCount = recordCount;
  }
}

export class AnalyticsError extends VideoConferencingError {
  public readonly analyticsType: string;

  constructor(
    analyticsType: string,
    message: string,
    provider?: VideoProvider,
    originalError?: Error
  ) {
    super(
      `Failed to generate ${analyticsType} analytics: ${message}`,
      "ANALYTICS_ERROR",
      provider,
      originalError,
      500
    );
    this.name = "AnalyticsError";
    this.analyticsType = analyticsType;
  }
}

// =============================================================================
// Error Factory Functions
// =============================================================================

export const createProviderError = (
  provider: VideoProvider,
  error: any,
  context?: string
): VideoConferencingError => {
  // Handle different types of provider errors
  if (error?.response?.status === 401 || error?.code === "UNAUTHENTICATED") {
    return new TokenExpiredError(provider, error);
  }

  if (error?.response?.status === 403 || error?.code === "PERMISSION_DENIED") {
    return new ProviderAuthError(
      provider,
      "Insufficient permissions",
      error,
      403
    );
  }

  if (error?.response?.status === 404 || error?.code === "NOT_FOUND") {
    return new RoomNotFoundError(provider, context || "unknown", error);
  }

  if (error?.response?.status === 429 || error?.code === "RESOURCE_EXHAUSTED") {
    const retryAfter = error?.response?.headers?.["retry-after"];
    return new RateLimitError(
      provider,
      error.message,
      retryAfter ? parseInt(retryAfter) : undefined,
      undefined,
      undefined,
      error
    );
  }

  // Default to generic provider error
  return new VideoConferencingError(
    error?.message || "Unknown provider error",
    "PROVIDER_ERROR",
    provider,
    error,
    error?.response?.status || error?.status
  );
};

export const createDatabaseError = (
  operation: "create" | "read" | "update" | "delete",
  entity: string,
  error: any
): DatabaseError => {
  return new DatabaseError(
    operation,
    entity,
    error?.message || "Unknown database error",
    error
  );
};

export const createValidationError = (
  message: string,
  errors: Array<{ field: string; message: string; code: string }>,
  provider?: VideoProvider
): ValidationError => {
  return new ValidationError(message, errors, undefined, provider);
};

// =============================================================================
// Error Utilities
// =============================================================================

export const isRetryableError = (error: VideoConferencingError): boolean => {
  return (
    error instanceof RateLimitError ||
    error instanceof DataSyncError ||
    (error.statusCode && error.statusCode >= 500) ||
    error.code === "NETWORK_ERROR" ||
    error.code === "TIMEOUT_ERROR"
  );
};

export const getRetryDelay = (
  error: VideoConferencingError,
  attempt: number
): number => {
  if (error instanceof RateLimitError && error.retryAfter) {
    return error.retryAfter * 1000; // Convert to milliseconds
  }

  // Exponential backoff: 1s, 2s, 4s, 8s, 16s (max)
  return Math.min(1000 * Math.pow(2, attempt - 1), 16000);
};

export const shouldRetry = (
  error: VideoConferencingError,
  attempt: number,
  maxAttempts: number = 3
): boolean => {
  return attempt < maxAttempts && isRetryableError(error);
};
