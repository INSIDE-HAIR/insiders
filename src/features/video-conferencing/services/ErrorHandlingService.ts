/**
 * ErrorHandlingService
 * Comprehensive error handling and recovery system
 */
import { LoggingService } from "./LoggingService";
import { NextResponse } from "next/server";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "PROVIDER_API_ERROR"
  | "DATABASE_ERROR"
  | "NETWORK_ERROR"
  | "RATE_LIMIT_ERROR"
  | "RESOURCE_NOT_FOUND"
  | "RESOURCE_CONFLICT"
  | "INTERNAL_ERROR"
  | "EXTERNAL_SERVICE_ERROR"
  | "CONFIGURATION_ERROR"
  | "TIMEOUT_ERROR";

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  operation?: string;
  resource?: string;
  resourceId?: string;
  provider?: string;
  metadata?: Record<string, any>;
}

export interface ErrorRecoveryAction {
  type: "retry" | "fallback" | "notify" | "escalate" | "ignore";
  description: string;
  parameters?: Record<string, any>;
}

export interface ErrorHandlingRule {
  errorCode: ErrorCode;
  severity: "low" | "medium" | "high" | "critical";
  userMessage: string;
  recoveryActions: ErrorRecoveryAction[];
  shouldLog: boolean;
  shouldNotify: boolean;
  shouldRetry: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export class VideoConferencingError extends Error {
  public readonly code: ErrorCode;
  public readonly context: ErrorContext;
  public readonly timestamp: Date;
  public readonly severity: "low" | "medium" | "high" | "critical";
  public readonly userMessage: string;
  public readonly isRecoverable: boolean;
  public readonly originalError?: Error;

  constructor(
    code: ErrorCode,
    message: string,
    context: ErrorContext = {},
    severity: "low" | "medium" | "high" | "critical" = "medium",
    userMessage?: string,
    isRecoverable: boolean = false,
    originalError?: Error
  ) {
    super(message);
    this.name = "VideoConferencingError";
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
    this.severity = severity;
    this.userMessage = userMessage || this.getDefaultUserMessage(code);
    this.isRecoverable = isRecoverable;
    this.originalError = originalError;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VideoConferencingError);
    }
  }

  private getDefaultUserMessage(code: ErrorCode): string {
    const messages: Record<ErrorCode, string> = {
      VALIDATION_ERROR:
        "Los datos proporcionados no son válidos. Por favor, revisa la información e intenta nuevamente.",
      AUTHENTICATION_ERROR:
        "Error de autenticación. Por favor, inicia sesión nuevamente.",
      AUTHORIZATION_ERROR: "No tienes permisos para realizar esta acción.",
      PROVIDER_API_ERROR:
        "Error al comunicarse con el proveedor de videoconferencia. Intenta nuevamente en unos minutos.",
      DATABASE_ERROR:
        "Error interno del sistema. Nuestro equipo ha sido notificado.",
      NETWORK_ERROR:
        "Error de conexión. Verifica tu conexión a internet e intenta nuevamente.",
      RATE_LIMIT_ERROR:
        "Has excedido el límite de solicitudes. Por favor, espera un momento antes de intentar nuevamente.",
      RESOURCE_NOT_FOUND: "El recurso solicitado no fue encontrado.",
      RESOURCE_CONFLICT:
        "El recurso ya existe o está en conflicto con otro recurso.",
      INTERNAL_ERROR:
        "Error interno del sistema. Nuestro equipo ha sido notificado.",
      EXTERNAL_SERVICE_ERROR:
        "Error en un servicio externo. Intenta nuevamente más tarde.",
      CONFIGURATION_ERROR:
        "Error de configuración del sistema. Contacta al administrador.",
      TIMEOUT_ERROR: "La operación tardó demasiado tiempo. Intenta nuevamente.",
    };

    return messages[code] || "Ha ocurrido un error inesperado.";
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      context: this.context,
      timestamp: this.timestamp,
      severity: this.severity,
      isRecoverable: this.isRecoverable,
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

export class ErrorHandlingService {
  private loggingService: LoggingService;
  private errorRules: Map<ErrorCode, ErrorHandlingRule> = new Map();
  private errorCounts: Map<string, number> = new Map();
  private circuitBreakers: Map<
    string,
    { failures: number; lastFailure: Date; isOpen: boolean }
  > = new Map();

  constructor(loggingService: LoggingService) {
    this.loggingService = loggingService;
    this.initializeErrorRules();
  }

  /**
   * Handle an error with comprehensive logging and recovery
   */
  async handleError(
    error: Error | VideoConferencingError,
    context: ErrorContext = {}
  ): Promise<{
    handled: boolean;
    userMessage: string;
    shouldRetry: boolean;
    recoveryActions: ErrorRecoveryAction[];
  }> {
    let vcError: VideoConferencingError;

    // Convert regular errors to VideoConferencingError
    if (error instanceof VideoConferencingError) {
      vcError = error;
    } else {
      vcError = this.classifyError(error, context);
    }

    // Get handling rule
    const rule = this.errorRules.get(vcError.code);
    if (!rule) {
      // Default handling for unknown errors
      return this.handleUnknownError(vcError, context);
    }

    // Log the error if required
    if (rule.shouldLog) {
      this.loggingService.error(
        vcError.message,
        "ERROR_HANDLER",
        vcError.originalError || vcError,
        {
          errorCode: vcError.code,
          severity: vcError.severity,
          context: vcError.context,
          userMessage: vcError.userMessage,
          isRecoverable: vcError.isRecoverable,
        },
        context.userId,
        context.sessionId,
        context.requestId
      );
    }

    // Update error counts
    this.updateErrorCounts(vcError.code, context);

    // Check circuit breaker
    if (context.operation) {
      this.updateCircuitBreaker(context.operation, vcError);
    }

    // Execute recovery actions
    const executedActions = await this.executeRecoveryActions(
      rule.recoveryActions,
      vcError,
      context
    );

    // Send notifications if required
    if (rule.shouldNotify) {
      await this.sendErrorNotification(vcError, context);
    }

    return {
      handled: true,
      userMessage: vcError.userMessage,
      shouldRetry: rule.shouldRetry && vcError.isRecoverable,
      recoveryActions: executedActions,
    };
  }

  /**
   * Create a standardized error response for APIs
   */
  createErrorResponse(
    error: Error | VideoConferencingError,
    context: ErrorContext = {}
  ): NextResponse {
    let vcError: VideoConferencingError;

    if (error instanceof VideoConferencingError) {
      vcError = error;
    } else {
      vcError = this.classifyError(error, context);
    }

    // Log the error
    this.loggingService.error(
      `API Error: ${vcError.message}`,
      "API_ERROR",
      vcError.originalError || vcError,
      {
        errorCode: vcError.code,
        context: vcError.context,
        userMessage: vcError.userMessage,
      },
      context.userId,
      context.sessionId,
      context.requestId
    );

    // Determine HTTP status code
    const statusCode = this.getHttpStatusCode(vcError.code);

    // Create error response
    const errorResponse = {
      error: {
        code: vcError.code,
        message: vcError.userMessage,
        timestamp: vcError.timestamp.toISOString(),
        requestId: context.requestId,
      },
      // Include additional details in development
      ...(process.env.NODE_ENV === "development" && {
        debug: {
          originalMessage: vcError.message,
          stack: vcError.stack,
          context: vcError.context,
        },
      }),
    };

    return NextResponse.json(errorResponse, { status: statusCode });
  }

  /**
   * Wrap async functions with error handling
   */
  wrapAsync<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context: ErrorContext = {}
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        const handlingResult = await this.handleError(error as Error, context);

        if (handlingResult.shouldRetry) {
          // Implement retry logic here if needed
          console.log("Retrying operation...");
        }

        throw error; // Re-throw after handling
      }
    };
  }

  /**
   * Create specific error types
   */
  createValidationError(
    message: string,
    context: ErrorContext = {}
  ): VideoConferencingError {
    return new VideoConferencingError(
      "VALIDATION_ERROR",
      message,
      context,
      "low",
      undefined,
      false
    );
  }

  createAuthenticationError(
    message: string,
    context: ErrorContext = {}
  ): VideoConferencingError {
    return new VideoConferencingError(
      "AUTHENTICATION_ERROR",
      message,
      context,
      "high",
      undefined,
      false
    );
  }

  createAuthorizationError(
    message: string,
    context: ErrorContext = {}
  ): VideoConferencingError {
    return new VideoConferencingError(
      "AUTHORIZATION_ERROR",
      message,
      context,
      "medium",
      undefined,
      false
    );
  }

  createProviderError(
    provider: string,
    message: string,
    context: ErrorContext = {},
    originalError?: Error
  ): VideoConferencingError {
    return new VideoConferencingError(
      "PROVIDER_API_ERROR",
      message,
      { ...context, provider },
      "high",
      undefined,
      true,
      originalError
    );
  }

  createDatabaseError(
    message: string,
    context: ErrorContext = {},
    originalError?: Error
  ): VideoConferencingError {
    return new VideoConferencingError(
      "DATABASE_ERROR",
      message,
      context,
      "critical",
      undefined,
      true,
      originalError
    );
  }

  createRateLimitError(
    message: string,
    context: ErrorContext = {}
  ): VideoConferencingError {
    return new VideoConferencingError(
      "RATE_LIMIT_ERROR",
      message,
      context,
      "medium",
      undefined,
      true
    );
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByCode: Record<ErrorCode, number>;
    circuitBreakerStatus: Record<string, { isOpen: boolean; failures: number }>;
    topErrors: Array<{ code: ErrorCode; count: number }>;
  } {
    const errorsByCode: Record<ErrorCode, number> = {} as Record<
      ErrorCode,
      number
    >;
    let totalErrors = 0;

    for (const [key, count] of this.errorCounts.entries()) {
      const code = key.split(":")[0] as ErrorCode;
      errorsByCode[code] = (errorsByCode[code] || 0) + count;
      totalErrors += count;
    }

    const circuitBreakerStatus: Record<
      string,
      { isOpen: boolean; failures: number }
    > = {};
    for (const [operation, breaker] of this.circuitBreakers.entries()) {
      circuitBreakerStatus[operation] = {
        isOpen: breaker.isOpen,
        failures: breaker.failures,
      };
    }

    const topErrors = Object.entries(errorsByCode)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([code, count]) => ({ code: code as ErrorCode, count }));

    return {
      totalErrors,
      errorsByCode,
      circuitBreakerStatus,
      topErrors,
    };
  }

  /**
   * Check if circuit breaker is open for an operation
   */
  isCircuitBreakerOpen(operation: string): boolean {
    const breaker = this.circuitBreakers.get(operation);
    if (!breaker) return false;

    // Reset circuit breaker after 5 minutes
    if (
      breaker.isOpen &&
      Date.now() - breaker.lastFailure.getTime() > 5 * 60 * 1000
    ) {
      breaker.isOpen = false;
      breaker.failures = 0;
    }

    return breaker.isOpen;
  }

  /**
   * Initialize error handling rules
   */
  private initializeErrorRules(): void {
    const rules: ErrorHandlingRule[] = [
      {
        errorCode: "VALIDATION_ERROR",
        severity: "low",
        userMessage: "Los datos proporcionados no son válidos.",
        recoveryActions: [
          { type: "notify", description: "Show validation errors to user" },
        ],
        shouldLog: true,
        shouldNotify: false,
        shouldRetry: false,
      },
      {
        errorCode: "AUTHENTICATION_ERROR",
        severity: "high",
        userMessage:
          "Error de autenticación. Por favor, inicia sesión nuevamente.",
        recoveryActions: [
          { type: "notify", description: "Redirect to login page" },
          { type: "escalate", description: "Log security event" },
        ],
        shouldLog: true,
        shouldNotify: true,
        shouldRetry: false,
      },
      {
        errorCode: "PROVIDER_API_ERROR",
        severity: "high",
        userMessage:
          "Error al comunicarse con el proveedor de videoconferencia.",
        recoveryActions: [
          { type: "retry", description: "Retry with exponential backoff" },
          {
            type: "fallback",
            description: "Use alternative provider if available",
          },
        ],
        shouldLog: true,
        shouldNotify: true,
        shouldRetry: true,
        maxRetries: 3,
        retryDelay: 1000,
      },
      {
        errorCode: "DATABASE_ERROR",
        severity: "critical",
        userMessage:
          "Error interno del sistema. Nuestro equipo ha sido notificado.",
        recoveryActions: [
          { type: "escalate", description: "Alert system administrators" },
          { type: "retry", description: "Retry database operation" },
        ],
        shouldLog: true,
        shouldNotify: true,
        shouldRetry: true,
        maxRetries: 2,
        retryDelay: 2000,
      },
      {
        errorCode: "RATE_LIMIT_ERROR",
        severity: "medium",
        userMessage: "Has excedido el límite de solicitudes.",
        recoveryActions: [
          { type: "retry", description: "Retry after delay" },
          { type: "notify", description: "Show rate limit message" },
        ],
        shouldLog: true,
        shouldNotify: false,
        shouldRetry: true,
        maxRetries: 1,
        retryDelay: 5000,
      },
    ];

    rules.forEach((rule) => {
      this.errorRules.set(rule.errorCode, rule);
    });
  }

  /**
   * Classify unknown errors
   */
  private classifyError(
    error: Error,
    context: ErrorContext
  ): VideoConferencingError {
    // Try to classify based on error message and type
    if (
      error.message.includes("validation") ||
      error.message.includes("invalid")
    ) {
      return new VideoConferencingError(
        "VALIDATION_ERROR",
        error.message,
        context,
        "low",
        undefined,
        false,
        error
      );
    }

    if (
      error.message.includes("unauthorized") ||
      error.message.includes("authentication")
    ) {
      return new VideoConferencingError(
        "AUTHENTICATION_ERROR",
        error.message,
        context,
        "high",
        undefined,
        false,
        error
      );
    }

    if (
      error.message.includes("forbidden") ||
      error.message.includes("permission")
    ) {
      return new VideoConferencingError(
        "AUTHORIZATION_ERROR",
        error.message,
        context,
        "medium",
        undefined,
        false,
        error
      );
    }

    if (
      error.message.includes("network") ||
      error.message.includes("connection")
    ) {
      return new VideoConferencingError(
        "NETWORK_ERROR",
        error.message,
        context,
        "medium",
        undefined,
        true,
        error
      );
    }

    if (error.message.includes("timeout")) {
      return new VideoConferencingError(
        "TIMEOUT_ERROR",
        error.message,
        context,
        "medium",
        undefined,
        true,
        error
      );
    }

    if (
      error.message.includes("database") ||
      error.message.includes("prisma")
    ) {
      return new VideoConferencingError(
        "DATABASE_ERROR",
        error.message,
        context,
        "critical",
        undefined,
        true,
        error
      );
    }

    // Default to internal error
    return new VideoConferencingError(
      "INTERNAL_ERROR",
      error.message,
      context,
      "high",
      undefined,
      false,
      error
    );
  }

  /**
   * Handle unknown errors
   */
  private async handleUnknownError(
    error: VideoConferencingError,
    context: ErrorContext
  ): Promise<{
    handled: boolean;
    userMessage: string;
    shouldRetry: boolean;
    recoveryActions: ErrorRecoveryAction[];
  }> {
    this.loggingService.error(
      `Unknown error: ${error.message}`,
      "UNKNOWN_ERROR",
      error,
      { context },
      context.userId,
      context.sessionId,
      context.requestId
    );

    return {
      handled: false,
      userMessage:
        "Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.",
      shouldRetry: false,
      recoveryActions: [],
    };
  }

  /**
   * Update error counts for monitoring
   */
  private updateErrorCounts(errorCode: ErrorCode, context: ErrorContext): void {
    const key = `${errorCode}:${context.operation || "unknown"}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
  }

  /**
   * Update circuit breaker state
   */
  private updateCircuitBreaker(
    operation: string,
    error: VideoConferencingError
  ): void {
    let breaker = this.circuitBreakers.get(operation);
    if (!breaker) {
      breaker = { failures: 0, lastFailure: new Date(), isOpen: false };
      this.circuitBreakers.set(operation, breaker);
    }

    breaker.failures++;
    breaker.lastFailure = new Date();

    // Open circuit breaker after 5 failures
    if (breaker.failures >= 5) {
      breaker.isOpen = true;
      this.loggingService.warn(
        `Circuit breaker opened for operation: ${operation}`,
        "CIRCUIT_BREAKER",
        undefined,
        { operation, failures: breaker.failures }
      );
    }
  }

  /**
   * Execute recovery actions
   */
  private async executeRecoveryActions(
    actions: ErrorRecoveryAction[],
    error: VideoConferencingError,
    context: ErrorContext
  ): Promise<ErrorRecoveryAction[]> {
    const executedActions: ErrorRecoveryAction[] = [];

    for (const action of actions) {
      try {
        switch (action.type) {
          case "retry":
            // Retry logic would be implemented here
            this.loggingService.info(
              `Executing retry action for error: ${error.code}`,
              "ERROR_RECOVERY",
              { action, errorCode: error.code }
            );
            break;

          case "fallback":
            // Fallback logic would be implemented here
            this.loggingService.info(
              `Executing fallback action for error: ${error.code}`,
              "ERROR_RECOVERY",
              { action, errorCode: error.code }
            );
            break;

          case "notify":
            // Notification logic would be implemented here
            break;

          case "escalate":
            // Escalation logic would be implemented here
            this.loggingService.error(
              `Escalating error: ${error.message}`,
              "ERROR_ESCALATION",
              error,
              { action, context }
            );
            break;
        }

        executedActions.push(action);
      } catch (actionError) {
        this.loggingService.error(
          `Failed to execute recovery action: ${action.type}`,
          "RECOVERY_ACTION_FAILED",
          actionError as Error,
          { action, originalError: error.code }
        );
      }
    }

    return executedActions;
  }

  /**
   * Send error notifications
   */
  private async sendErrorNotification(
    error: VideoConferencingError,
    context: ErrorContext
  ): Promise<void> {
    // In a real implementation, this would send notifications via email, Slack, etc.
    this.loggingService.info(
      `Sending error notification for: ${error.code}`,
      "ERROR_NOTIFICATION",
      {
        errorCode: error.code,
        severity: error.severity,
        context,
        userMessage: error.userMessage,
      }
    );
  }

  /**
   * Get HTTP status code for error code
   */
  private getHttpStatusCode(errorCode: ErrorCode): number {
    const statusCodes: Record<ErrorCode, number> = {
      VALIDATION_ERROR: 400,
      AUTHENTICATION_ERROR: 401,
      AUTHORIZATION_ERROR: 403,
      RESOURCE_NOT_FOUND: 404,
      RESOURCE_CONFLICT: 409,
      RATE_LIMIT_ERROR: 429,
      PROVIDER_API_ERROR: 502,
      EXTERNAL_SERVICE_ERROR: 502,
      NETWORK_ERROR: 503,
      TIMEOUT_ERROR: 504,
      DATABASE_ERROR: 500,
      CONFIGURATION_ERROR: 500,
      INTERNAL_ERROR: 500,
    };

    return statusCodes[errorCode] || 500;
  }
}
