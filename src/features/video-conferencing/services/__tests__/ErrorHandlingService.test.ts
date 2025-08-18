/**
 * ErrorHandlingService Tests
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  ErrorHandlingService,
  VideoConferencingError,
} from "../ErrorHandlingService";
import { LoggingService } from "../LoggingService";
import { PrismaClient } from "@prisma/client";

// Mock LoggingService
const mockLoggingService = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
} as unknown as LoggingService;

describe("ErrorHandlingService", () => {
  let service: ErrorHandlingService;

  beforeEach(() => {
    service = new ErrorHandlingService(mockLoggingService);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("VideoConferencingError", () => {
    it("should create error with correct properties", () => {
      const context = { userId: "user123", operation: "createSpace" };
      const error = new VideoConferencingError(
        "VALIDATION_ERROR",
        "Invalid input data",
        context,
        "low",
        "Custom user message",
        false
      );

      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.message).toBe("Invalid input data");
      expect(error.context).toEqual(context);
      expect(error.severity).toBe("low");
      expect(error.userMessage).toBe("Custom user message");
      expect(error.isRecoverable).toBe(false);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it("should use default user message when not provided", () => {
      const error = new VideoConferencingError(
        "AUTHENTICATION_ERROR",
        "Auth failed"
      );
      expect(error.userMessage).toBe(
        "Error de autenticación. Por favor, inicia sesión nuevamente."
      );
    });

    it("should serialize to JSON correctly", () => {
      const originalError = new Error("Original error");
      const error = new VideoConferencingError(
        "PROVIDER_API_ERROR",
        "Provider failed",
        { provider: "zoom" },
        "high",
        undefined,
        true,
        originalError
      );

      const json = error.toJSON();
      expect(json).toMatchObject({
        name: "VideoConferencingError",
        code: "PROVIDER_API_ERROR",
        message: "Provider failed",
        context: { provider: "zoom" },
        severity: "high",
        isRecoverable: true,
        originalError: {
          name: "Error",
          message: "Original error",
        },
      });
    });
  });

  describe("handleError", () => {
    it("should handle VideoConferencingError correctly", async () => {
      const error = new VideoConferencingError(
        "VALIDATION_ERROR",
        "Invalid data",
        { userId: "user123" }
      );

      const result = await service.handleError(error);

      expect(result.handled).toBe(true);
      expect(result.userMessage).toBe(
        "Los datos proporcionados no son válidos. Por favor, revisa la información e intenta nuevamente."
      );
      expect(result.shouldRetry).toBe(false);
      expect(mockLoggingService.error).toHaveBeenCalledWith(
        "Invalid data",
        "ERROR_HANDLER",
        error,
        expect.objectContaining({
          errorCode: "VALIDATION_ERROR",
          severity: "low",
        }),
        "user123",
        undefined,
        undefined
      );
    });

    it("should classify regular errors", async () => {
      const error = new Error("validation failed");
      const context = { userId: "user123", operation: "createSpace" };

      const result = await service.handleError(error, context);

      expect(result.handled).toBe(true);
      expect(result.userMessage).toContain("válidos");
      expect(mockLoggingService.error).toHaveBeenCalled();
    });

    it("should handle unknown errors", async () => {
      const error = new Error("unknown error type");

      const result = await service.handleError(error);

      expect(result.handled).toBe(false);
      expect(result.userMessage).toBe(
        "Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado."
      );
      expect(result.shouldRetry).toBe(false);
    });

    it("should update error counts", async () => {
      const error = new VideoConferencingError(
        "PROVIDER_API_ERROR",
        "API failed"
      );
      const context = { operation: "createMeeting" };

      await service.handleError(error, context);

      const stats = service.getErrorStats();
      expect(stats.totalErrors).toBe(1);
      expect(stats.errorsByCode.PROVIDER_API_ERROR).toBe(1);
    });

    it("should update circuit breaker on repeated failures", async () => {
      const error = new VideoConferencingError(
        "PROVIDER_API_ERROR",
        "API failed"
      );
      const context = { operation: "createMeeting" };

      // Trigger multiple failures
      for (let i = 0; i < 6; i++) {
        await service.handleError(error, context);
      }

      expect(service.isCircuitBreakerOpen("createMeeting")).toBe(true);
    });
  });

  describe("createErrorResponse", () => {
    it("should create proper error response for API", () => {
      const error = new VideoConferencingError(
        "AUTHENTICATION_ERROR",
        "Auth failed",
        { userId: "user123" }
      );
      const context = { requestId: "req123" };

      const response = service.createErrorResponse(error, context);

      expect(response.status).toBe(401);

      // In a real test, you'd parse the response body
      // For now, we just verify the method was called
      expect(mockLoggingService.error).toHaveBeenCalledWith(
        "API Error: Auth failed",
        "API_ERROR",
        error,
        expect.objectContaining({
          errorCode: "AUTHENTICATION_ERROR",
          userMessage: expect.any(String),
        }),
        "user123",
        undefined,
        "req123"
      );
    });

    it("should return correct HTTP status codes", () => {
      const testCases = [
        { code: "VALIDATION_ERROR", expectedStatus: 400 },
        { code: "AUTHENTICATION_ERROR", expectedStatus: 401 },
        { code: "AUTHORIZATION_ERROR", expectedStatus: 403 },
        { code: "RESOURCE_NOT_FOUND", expectedStatus: 404 },
        { code: "RATE_LIMIT_ERROR", expectedStatus: 429 },
        { code: "INTERNAL_ERROR", expectedStatus: 500 },
      ] as const;

      testCases.forEach(({ code, expectedStatus }) => {
        const error = new VideoConferencingError(code, "Test error");
        const response = service.createErrorResponse(error);
        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe("wrapAsync", () => {
    it("should wrap async function and handle errors", async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error("Test error"));
      const wrappedFn = service.wrapAsync(mockFn, { userId: "user123" });

      await expect(wrappedFn("arg1", "arg2")).rejects.toThrow("Test error");
      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
      expect(mockLoggingService.error).toHaveBeenCalled();
    });

    it("should pass through successful calls", async () => {
      const mockFn = vi.fn().mockResolvedValue("success");
      const wrappedFn = service.wrapAsync(mockFn);

      const result = await wrappedFn("arg1");
      expect(result).toBe("success");
      expect(mockFn).toHaveBeenCalledWith("arg1");
    });
  });

  describe("error creation methods", () => {
    it("should create validation error", () => {
      const error = service.createValidationError("Invalid email", {
        field: "email",
      });

      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.message).toBe("Invalid email");
      expect(error.context).toEqual({ field: "email" });
      expect(error.severity).toBe("low");
      expect(error.isRecoverable).toBe(false);
    });

    it("should create authentication error", () => {
      const error = service.createAuthenticationError("Token expired");

      expect(error.code).toBe("AUTHENTICATION_ERROR");
      expect(error.severity).toBe("high");
      expect(error.isRecoverable).toBe(false);
    });

    it("should create provider error", () => {
      const originalError = new Error("API timeout");
      const error = service.createProviderError(
        "zoom",
        "Failed to create meeting",
        { meetingId: "123" },
        originalError
      );

      expect(error.code).toBe("PROVIDER_API_ERROR");
      expect(error.context.provider).toBe("zoom");
      expect(error.severity).toBe("high");
      expect(error.isRecoverable).toBe(true);
      expect(error.originalError).toBe(originalError);
    });

    it("should create database error", () => {
      const error = service.createDatabaseError("Connection failed");

      expect(error.code).toBe("DATABASE_ERROR");
      expect(error.severity).toBe("critical");
      expect(error.isRecoverable).toBe(true);
    });

    it("should create rate limit error", () => {
      const error = service.createRateLimitError("Too many requests");

      expect(error.code).toBe("RATE_LIMIT_ERROR");
      expect(error.severity).toBe("medium");
      expect(error.isRecoverable).toBe(true);
    });
  });

  describe("getErrorStats", () => {
    it("should return error statistics", async () => {
      // Create some errors
      await service.handleError(
        new VideoConferencingError("VALIDATION_ERROR", "Error 1"),
        { operation: "op1" }
      );
      await service.handleError(
        new VideoConferencingError("VALIDATION_ERROR", "Error 2"),
        { operation: "op1" }
      );
      await service.handleError(
        new VideoConferencingError("PROVIDER_API_ERROR", "Error 3"),
        { operation: "op2" }
      );

      const stats = service.getErrorStats();

      expect(stats.totalErrors).toBe(3);
      expect(stats.errorsByCode.VALIDATION_ERROR).toBe(2);
      expect(stats.errorsByCode.PROVIDER_API_ERROR).toBe(1);
      expect(stats.topErrors).toHaveLength(2);
      expect(stats.topErrors[0]).toEqual({
        code: "VALIDATION_ERROR",
        count: 2,
      });
    });
  });

  describe("circuit breaker", () => {
    it("should open circuit breaker after threshold failures", async () => {
      const error = new VideoConferencingError(
        "PROVIDER_API_ERROR",
        "API failed"
      );
      const context = { operation: "testOperation" };

      expect(service.isCircuitBreakerOpen("testOperation")).toBe(false);

      // Trigger failures to open circuit breaker
      for (let i = 0; i < 5; i++) {
        await service.handleError(error, context);
      }

      expect(service.isCircuitBreakerOpen("testOperation")).toBe(true);
    });

    it("should reset circuit breaker after timeout", async () => {
      const error = new VideoConferencingError(
        "PROVIDER_API_ERROR",
        "API failed"
      );
      const context = { operation: "testOperation" };

      // Open circuit breaker
      for (let i = 0; i < 5; i++) {
        await service.handleError(error, context);
      }

      expect(service.isCircuitBreakerOpen("testOperation")).toBe(true);

      // Mock time passage (5+ minutes)
      const originalNow = Date.now;
      Date.now = vi.fn(() => originalNow() + 6 * 60 * 1000);

      expect(service.isCircuitBreakerOpen("testOperation")).toBe(false);

      Date.now = originalNow;
    });
  });

  describe("error classification", () => {
    it("should classify validation errors", async () => {
      const error = new Error("validation failed for field email");
      const result = await service.handleError(error);

      expect(result.userMessage).toContain("válidos");
    });

    it("should classify authentication errors", async () => {
      const error = new Error("unauthorized access");
      const result = await service.handleError(error);

      expect(result.userMessage).toContain("autenticación");
    });

    it("should classify network errors", async () => {
      const error = new Error("network connection failed");
      const result = await service.handleError(error);

      expect(result.userMessage).toContain("conexión");
    });

    it("should classify timeout errors", async () => {
      const error = new Error("request timeout");
      const result = await service.handleError(error);

      expect(result.userMessage).toContain("tiempo");
    });

    it("should classify database errors", async () => {
      const error = new Error("prisma connection error");
      const result = await service.handleError(error);

      expect(result.userMessage).toContain("interno");
    });
  });
});
