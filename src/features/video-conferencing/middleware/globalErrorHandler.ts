/**
 * Global Error Handler for Video Conferencing APIs
 */
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ZodError } from "zod";

export interface ErrorHandlerOptions {
  logErrors?: boolean;
  includeStack?: boolean;
  customErrorMessages?: Record<string, string>;
}

export class GlobalErrorHandler {
  constructor(
    private prisma: PrismaClient,
    private options: ErrorHandlerOptions = {}
  ) {
    this.options = {
      logErrors: true,
      includeStack: process.env.NODE_ENV === "development",
      ...options,
    };
  }

  /**
   * Wrap API handler with error handling
   */
  wrapApiHandler(handler: (request: NextRequest) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
      try {
        return await handler(request);
      } catch (error) {
        return this.handleError(error, request);
      }
    };
  }

  /**
   * Wrap API handler with error handling for routes with context
   */
  wrapApiHandlerWithContext<T>(
    handler: (request: NextRequest, context: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, context: T): Promise<NextResponse> => {
      try {
        return await handler(request, context);
      } catch (error) {
        return this.handleError(error, request);
      }
    };
  }

  /**
   * Handle different types of errors
   */
  private async handleError(
    error: unknown,
    request: NextRequest
  ): Promise<NextResponse> {
    const errorInfo = this.parseError(error);

    // Log error if enabled
    if (this.options.logErrors) {
      console.error("API Error:", {
        url: request.url,
        method: request.method,
        error: errorInfo,
        timestamp: new Date().toISOString(),
      });
    }

    // Log to database for critical errors
    if (errorInfo.status >= 500) {
      await this.logErrorToDatabase(errorInfo, request);
    }

    // Return appropriate response
    return NextResponse.json(
      {
        error: {
          code: errorInfo.code,
          message: errorInfo.message,
          ...(this.options.includeStack && { stack: errorInfo.stack }),
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        },
      },
      { status: errorInfo.status }
    );
  }

  /**
   * Parse error into standardized format
   */
  private parseError(error: unknown): {
    code: string;
    message: string;
    status: number;
    stack?: string;
  } {
    // Zod validation errors
    if (error instanceof ZodError) {
      return {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        status: 400,
        stack: error.stack,
      };
    }

    // Custom application errors
    if (error instanceof Error) {
      // Authentication errors
      if (error.message.includes("Authentication required")) {
        return {
          code: "AUTHENTICATION_REQUIRED",
          message: "Authentication required",
          status: 401,
          stack: error.stack,
        };
      }

      // Authorization errors
      if (
        error.message.includes("Role") &&
        error.message.includes("required")
      ) {
        return {
          code: "INSUFFICIENT_PERMISSIONS",
          message: "Insufficient permissions",
          status: 403,
          stack: error.stack,
        };
      }

      // Not found errors
      if (error.message.includes("not found")) {
        return {
          code: "RESOURCE_NOT_FOUND",
          message: "Resource not found",
          status: 404,
          stack: error.stack,
        };
      }

      // Conflict errors
      if (error.message.includes("already exists")) {
        return {
          code: "RESOURCE_CONFLICT",
          message: "Resource already exists",
          status: 409,
          stack: error.stack,
        };
      }

      // Provider API errors
      if (error.message.includes("Failed to")) {
        return {
          code: "PROVIDER_API_ERROR",
          message: "External service error",
          status: 502,
          stack: error.stack,
        };
      }

      // Generic application error
      return {
        code: "APPLICATION_ERROR",
        message: error.message,
        status: 500,
        stack: error.stack,
      };
    }

    // Unknown error
    return {
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred",
      status: 500,
      stack: undefined,
    };
  }

  /**
   * Log error to database
   */
  private async logErrorToDatabase(
    errorInfo: any,
    request: NextRequest
  ): Promise<void> {
    try {
      // In a real implementation, you would have an ErrorLog model
      // await this.prisma.errorLog.create({
      //   data: {
      //     code: errorInfo.code,
      //     message: errorInfo.message,
      //     status: errorInfo.status,
      //     url: request.url,
      //     method: request.method,
      //     stack: errorInfo.stack,
      //     userAgent: request.headers.get('user-agent'),
      //     timestamp: new Date(),
      //   },
      // });

      console.log("Error logged to database:", errorInfo);
    } catch (logError) {
      console.error("Failed to log error to database:", logError);
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Create global error handler instance
 */
export function createGlobalErrorHandler(
  prisma: PrismaClient,
  options?: ErrorHandlerOptions
): GlobalErrorHandler {
  return new GlobalErrorHandler(prisma, options);
}
