/**
 * Example API Route with Comprehensive Error Handling and Logging
 * Demonstrates how to use the error handling and logging services
 */
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createGlobalErrorHandler } from "@/src/features/video-conferencing/middleware/globalErrorHandler";
import { VideoConferencingError } from "@/src/features/video-conferencing/services/ErrorHandlingService";
import { getCurrentUser } from "@/src/features/video-conferencing/middleware/authMiddleware";

const prisma = new PrismaClient();
const globalErrorHandler = createGlobalErrorHandler(prisma, {
  enableStackTrace: process.env.NODE_ENV === "development",
  enableDetailedErrors: process.env.NODE_ENV === "development",
  logAllErrors: true,
  enableErrorReporting: true,
  enableRecovery: true,
});

// Get services from global error handler
const loggingService = globalErrorHandler.getLoggingService();
const errorHandlingService = globalErrorHandler.getErrorHandlingService();

/**
 * GET - Example endpoint with comprehensive error handling
 */
export const GET = globalErrorHandler.wrapApiHandler(
  async (request: NextRequest) => {
    const requestId = request.headers.get("x-request-id") || "unknown";
    const searchParams = request.nextUrl.searchParams;
    const operation = searchParams.get("operation") || "default";

    try {
      // Log the start of the operation
      loggingService.info(
        `Starting example operation: ${operation}`,
        "EXAMPLE_API",
        { operation, requestId },
        undefined,
        undefined,
        requestId
      );

      // Get current user
      const user = await getCurrentUser(request);
      if (!user) {
        throw errorHandlingService.createAuthenticationError(
          "User not authenticated",
          { requestId, operation }
        );
      }

      // Log user action
      loggingService.logUserAction(
        "EXAMPLE_OPERATION",
        "example_resource",
        undefined,
        true,
        { operation },
        undefined,
        user.id,
        undefined,
        requestId
      );

      // Simulate different operations with different error scenarios
      switch (operation) {
        case "validation_error":
          return handleValidationErrorExample(user.id, requestId);

        case "provider_error":
          return await handleProviderErrorExample(user.id, requestId);

        case "database_error":
          return await handleDatabaseErrorExample(user.id, requestId);

        case "rate_limit_error":
          return handleRateLimitErrorExample(user.id, requestId);

        case "success":
          return handleSuccessExample(user.id, requestId);

        default:
          return handleDefaultExample(user.id, requestId);
      }
    } catch (error) {
      // The global error handler will catch and process this error
      throw error;
    }
  }
);

/**
 * POST - Example endpoint with validation and error recovery
 */
export const POST = globalErrorHandler.wrapApiHandler(
  async (request: NextRequest) => {
    const requestId = request.headers.get("x-request-id") || "unknown";

    try {
      const body = await request.json();

      // Validate request body
      if (!body.title || typeof body.title !== "string") {
        throw globalErrorHandler.handleValidationError(
          "title",
          body.title,
          "required_string",
          "Title is required and must be a string"
        );
      }

      if (body.title.length < 3) {
        throw globalErrorHandler.handleValidationError(
          "title",
          body.title,
          "min_length",
          "Title must be at least 3 characters long"
        );
      }

      // Get current user
      const user = await getCurrentUser(request);
      if (!user) {
        throw errorHandlingService.createAuthenticationError(
          "User not authenticated",
          { requestId, operation: "create_example" }
        );
      }

      // Check user permissions (example)
      if (user.role !== "ADMIN" && user.role !== "TRAINER") {
        throw errorHandlingService.createAuthorizationError(
          "Insufficient permissions to create resource",
          { requestId, userId: user.id, requiredRole: "ADMIN or TRAINER" }
        );
      }

      // Simulate database operation with error handling
      const result = await performDatabaseOperation(body, user.id, requestId);

      // Log successful operation
      loggingService.logUserAction(
        "CREATE_EXAMPLE",
        "example_resource",
        result.id,
        true,
        { title: body.title },
        undefined,
        user.id,
        undefined,
        requestId
      );

      loggingService.info(
        "Example resource created successfully",
        "EXAMPLE_API",
        { resourceId: result.id, title: body.title },
        user.id,
        undefined,
        requestId
      );

      return NextResponse.json({
        success: true,
        data: result,
        requestId,
      });
    } catch (error) {
      // The global error handler will catch and process this error
      throw error;
    }
  }
);

/**
 * Handle validation error example
 */
function handleValidationErrorExample(
  userId: string,
  requestId: string
): NextResponse {
  loggingService.info(
    "Demonstrating validation error",
    "EXAMPLE_API",
    { scenario: "validation_error" },
    userId,
    undefined,
    requestId
  );

  throw errorHandlingService.createValidationError(
    "Invalid email format provided",
    { field: "email", value: "invalid-email", requestId }
  );
}

/**
 * Handle provider error example
 */
async function handleProviderErrorExample(
  userId: string,
  requestId: string
): Promise<NextResponse> {
  loggingService.info(
    "Demonstrating provider API error",
    "EXAMPLE_API",
    { scenario: "provider_error" },
    userId,
    undefined,
    requestId
  );

  // Simulate provider API call failure
  const providerError = new Error(
    "Google Meet API returned 503 Service Unavailable"
  );

  throw globalErrorHandler.handleProviderError(
    "google-meet",
    "create_meeting",
    providerError,
    503
  );
}

/**
 * Handle database error example
 */
async function handleDatabaseErrorExample(
  userId: string,
  requestId: string
): Promise<NextResponse> {
  loggingService.info(
    "Demonstrating database error",
    "EXAMPLE_API",
    { scenario: "database_error" },
    userId,
    undefined,
    requestId
  );

  // Simulate database connection error
  const dbError = new Error("Connection to database timed out");

  throw globalErrorHandler.handleDatabaseError(dbError, "find_video_spaces");
}

/**
 * Handle rate limit error example
 */
function handleRateLimitErrorExample(
  userId: string,
  requestId: string
): NextResponse {
  loggingService.info(
    "Demonstrating rate limit error",
    "EXAMPLE_API",
    { scenario: "rate_limit_error" },
    userId,
    undefined,
    requestId
  );

  throw errorHandlingService.createRateLimitError(
    "Too many requests from this user",
    { userId, requestId, limit: 100, window: "1 hour" }
  );
}

/**
 * Handle success example
 */
function handleSuccessExample(userId: string, requestId: string): NextResponse {
  loggingService.info(
    "Demonstrating successful operation",
    "EXAMPLE_API",
    { scenario: "success" },
    userId,
    undefined,
    requestId
  );

  // Log performance metrics
  loggingService.logPerformance(
    "Example operation completed",
    "EXAMPLE_API",
    150, // 150ms duration
    { scenario: "success", userId },
    userId,
    undefined,
    requestId
  );

  return NextResponse.json({
    success: true,
    message: "Operation completed successfully",
    data: {
      id: "example-123",
      title: "Example Resource",
      createdAt: new Date().toISOString(),
      createdBy: userId,
    },
    requestId,
  });
}

/**
 * Handle default example
 */
function handleDefaultExample(userId: string, requestId: string): NextResponse {
  loggingService.info(
    "Handling default example operation",
    "EXAMPLE_API",
    { scenario: "default" },
    userId,
    undefined,
    requestId
  );

  return NextResponse.json({
    success: true,
    message: "Default operation completed",
    availableOperations: [
      "validation_error",
      "provider_error",
      "database_error",
      "rate_limit_error",
      "success",
    ],
    requestId,
  });
}

/**
 * Simulate database operation with error handling
 */
async function performDatabaseOperation(
  data: any,
  userId: string,
  requestId: string
): Promise<{ id: string; title: string; createdAt: string }> {
  try {
    loggingService.debug(
      "Starting database operation",
      "DATABASE",
      { operation: "create", table: "example" },
      userId,
      undefined,
      requestId
    );

    // Simulate database operation
    const startTime = Date.now();

    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 100));

    const result = {
      id: `example_${Date.now()}`,
      title: data.title,
      createdAt: new Date().toISOString(),
    };

    const duration = Date.now() - startTime;

    loggingService.logPerformance(
      "Database operation completed",
      "DATABASE",
      duration,
      { operation: "create", table: "example", recordId: result.id },
      userId,
      undefined,
      requestId
    );

    return result;
  } catch (error) {
    loggingService.error(
      "Database operation failed",
      "DATABASE",
      error as Error,
      { operation: "create", table: "example" },
      userId,
      undefined,
      requestId
    );

    throw globalErrorHandler.handleDatabaseError(
      error as Error,
      "create_example_record"
    );
  }
}

/**
 * Health check endpoint for monitoring
 */
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  try {
    const stats = globalErrorHandler.getErrorStats();

    return new NextResponse(null, {
      status: 200,
      headers: {
        "x-error-count": stats.errorHandling.totalErrors.toString(),
        "x-uptime": process.uptime().toString(),
        "x-memory-usage":
          (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + "MB",
      },
    });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
