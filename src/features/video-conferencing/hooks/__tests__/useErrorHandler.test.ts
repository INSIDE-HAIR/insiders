/**
 * useErrorHandler Hook Tests
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { useErrorHandler, useApiErrorHandler } from "../useErrorHandler";

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

// Mock console methods
const originalConsole = {
  error: console.error,
  log: console.log,
};

describe("useErrorHandler", () => {
  const mockUseSession = useSession as any;

  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-123", email: "user@example.com" } },
    });

    console.error = vi.fn();
    console.log = vi.fn();

    // Mock setTimeout for auto-clear functionality
    vi.useFakeTimers();
  });

  afterEach(() => {
    console.error = originalConsole.error;
    console.log = originalConsole.log;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("error normalization", () => {
    it("should handle ErrorInfo objects", () => {
      const { result } = renderHook(() => useErrorHandler());

      const errorInfo = {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        userMessage: "Please check your input",
        timestamp: new Date(),
      };

      act(() => {
        result.current.handleError(errorInfo);
      });

      expect(result.current.error).toEqual(errorInfo);
    });

    it("should normalize regular Error objects", () => {
      const { result } = renderHook(() => useErrorHandler());

      const regularError = new Error("Something went wrong");

      act(() => {
        result.current.handleError(regularError);
      });

      expect(result.current.error).toMatchObject({
        code: "UNKNOWN_ERROR",
        message: "Something went wrong",
        userMessage: "Ha ocurrido un error inesperado.",
        timestamp: expect.any(Date),
        context: expect.objectContaining({
          stack: expect.any(String),
          name: "Error",
        }),
        recoverable: false,
      });
    });

    it("should classify network errors", () => {
      const { result } = renderHook(() => useErrorHandler());

      const networkError = new Error("fetch failed");

      act(() => {
        result.current.handleError(networkError);
      });

      expect(result.current.error).toMatchObject({
        code: "NETWORK_ERROR",
        userMessage: "Error de conexión. Verifica tu conexión a internet.",
        recoverable: true,
      });
    });

    it("should classify authentication errors", () => {
      const { result } = renderHook(() => useErrorHandler());

      const authError = new Error("401 unauthorized");

      act(() => {
        result.current.handleError(authError);
      });

      expect(result.current.error).toMatchObject({
        code: "AUTHENTICATION_ERROR",
        userMessage:
          "Error de autenticación. Por favor, inicia sesión nuevamente.",
        recoverable: false,
      });
    });

    it("should classify authorization errors", () => {
      const { result } = renderHook(() => useErrorHandler());

      const authzError = new Error("403 forbidden");

      act(() => {
        result.current.handleError(authzError);
      });

      expect(result.current.error).toMatchObject({
        code: "AUTHORIZATION_ERROR",
        userMessage: "No tienes permisos para realizar esta acción.",
        recoverable: false,
      });
    });

    it("should classify rate limit errors", () => {
      const { result } = renderHook(() => useErrorHandler());

      const rateLimitError = new Error("429 too many requests");

      act(() => {
        result.current.handleError(rateLimitError);
      });

      expect(result.current.error).toMatchObject({
        code: "RATE_LIMIT_ERROR",
        userMessage:
          "Has excedido el límite de solicitudes. Intenta nuevamente en unos minutos.",
        recoverable: true,
      });
    });

    it("should classify server errors", () => {
      const { result } = renderHook(() => useErrorHandler());

      const serverError = new Error("500 internal server error");

      act(() => {
        result.current.handleError(serverError);
      });

      expect(result.current.error).toMatchObject({
        code: "SERVER_ERROR",
        userMessage: "Error del servidor. Nuestro equipo ha sido notificado.",
        recoverable: true,
      });
    });
  });

  describe("error handling options", () => {
    it("should log to console by default", () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError(new Error("Test error"));
      });

      expect(console.error).toHaveBeenCalledWith(
        "Error handled by useErrorHandler:",
        expect.objectContaining({
          code: "UNKNOWN_ERROR",
          message: "Test error",
        })
      );
    });

    it("should not log to console when disabled", () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError(new Error("Test error"), {
          logToConsole: false,
        });
      });

      expect(console.error).not.toHaveBeenCalled();
    });

    it("should show toast when enabled", () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError(new Error("Test error"), {
          showToast: true,
        });
      });

      expect(console.log).toHaveBeenCalledWith(
        "Toast:",
        "Ha ocurrido un error inesperado."
      );
    });
  });

  describe("error history", () => {
    it("should maintain error history", () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError(new Error("Error 1"));
      });

      act(() => {
        result.current.handleError(new Error("Error 2"));
      });

      const history = result.current.getErrorHistory();
      expect(history).toHaveLength(2);
      expect(history[0].message).toBe("Error 2"); // Most recent first
      expect(history[1].message).toBe("Error 1");
    });

    it("should limit error history to 10 entries", () => {
      const { result } = renderHook(() => useErrorHandler());

      // Add 12 errors
      for (let i = 1; i <= 12; i++) {
        act(() => {
          result.current.handleError(new Error(`Error ${i}`));
        });
      }

      const history = result.current.getErrorHistory();
      expect(history).toHaveLength(10);
      expect(history[0].message).toBe("Error 12"); // Most recent
      expect(history[9].message).toBe("Error 3"); // Oldest kept
    });
  });

  describe("clearError", () => {
    it("should clear current error", () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError(new Error("Test error"));
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("executeWithErrorHandling", () => {
    it("should execute operation successfully", async () => {
      const { result } = renderHook(() => useErrorHandler());

      const mockOperation = vi.fn().mockResolvedValue("success");

      let operationResult: any;
      await act(async () => {
        operationResult =
          await result.current.executeWithErrorHandling(mockOperation);
      });

      expect(operationResult).toBe("success");
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockOperation).toHaveBeenCalled();
    });

    it("should handle operation failure", async () => {
      const { result } = renderHook(() => useErrorHandler());

      const mockOperation = vi
        .fn()
        .mockRejectedValue(new Error("Operation failed"));

      let operationResult: any;
      await act(async () => {
        operationResult =
          await result.current.executeWithErrorHandling(mockOperation);
      });

      expect(operationResult).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toMatchObject({
        message: "Operation failed",
      });
    });

    it("should set loading state during operation", async () => {
      const { result } = renderHook(() => useErrorHandler());

      const mockOperation = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        );

      act(() => {
        result.current.executeWithErrorHandling(mockOperation);
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        vi.advanceTimersByTime(100);
        await Promise.resolve(); // Wait for promise resolution
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should retry recoverable errors when autoRetry is enabled", async () => {
      const { result } = renderHook(() => useErrorHandler());

      const mockOperation = vi
        .fn()
        .mockRejectedValueOnce(new Error("network connection failed"))
        .mockResolvedValueOnce("success");

      let operationResult: any;
      await act(async () => {
        operationResult = await result.current.executeWithErrorHandling(
          mockOperation,
          {
            autoRetry: true,
            maxRetries: 2,
            retryDelay: 100,
          }
        );
      });

      // Fast-forward timers for retry delay
      act(() => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockOperation).toHaveBeenCalledTimes(2);
      });

      expect(operationResult).toBe("success");
      expect(result.current.error).toBeNull(); // Error should be cleared on success
    });

    it("should not retry non-recoverable errors", async () => {
      const { result } = renderHook(() => useErrorHandler());

      const mockOperation = vi
        .fn()
        .mockRejectedValue(new Error("401 unauthorized"));

      await act(async () => {
        await result.current.executeWithErrorHandling(mockOperation, {
          autoRetry: true,
          maxRetries: 2,
        });
      });

      expect(mockOperation).toHaveBeenCalledTimes(1); // No retry
      expect(result.current.error).toMatchObject({
        code: "AUTHENTICATION_ERROR",
        recoverable: false,
      });
    });

    it("should stop retrying after max retries", async () => {
      const { result } = renderHook(() => useErrorHandler());

      const mockOperation = vi
        .fn()
        .mockRejectedValue(new Error("network connection failed"));

      await act(async () => {
        await result.current.executeWithErrorHandling(mockOperation, {
          autoRetry: true,
          maxRetries: 2,
          retryDelay: 10,
        });
      });

      // Fast-forward timers for retry delays
      act(() => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockOperation).toHaveBeenCalledTimes(3); // Initial + 2 retries
      });

      expect(result.current.error).toMatchObject({
        code: "NETWORK_ERROR",
      });
    });
  });

  describe("retryLastOperation", () => {
    it("should retry the last operation", async () => {
      const { result } = renderHook(() => useErrorHandler());

      const mockOperation = vi
        .fn()
        .mockRejectedValueOnce(new Error("First failure"))
        .mockResolvedValueOnce("success");

      // Execute operation that fails
      await act(async () => {
        await result.current.executeWithErrorHandling(mockOperation);
      });

      expect(result.current.error).not.toBeNull();

      // Retry the operation
      await act(async () => {
        await result.current.retryLastOperation();
      });

      expect(mockOperation).toHaveBeenCalledTimes(2);
      expect(result.current.error).toBeNull(); // Should be cleared on success
    });

    it("should handle no operation to retry", async () => {
      const { result } = renderHook(() => useErrorHandler());

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await act(async () => {
        await result.current.retryLastOperation();
      });

      expect(consoleSpy).toHaveBeenCalledWith("No operation to retry");
      consoleSpy.mockRestore();
    });
  });

  describe("auto-clear errors", () => {
    it("should auto-clear non-critical errors after 10 seconds", async () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError(new Error("network error"));
      });

      expect(result.current.error).not.toBeNull();

      // Fast-forward 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.error).toBeNull();
    });

    it("should not auto-clear critical errors", async () => {
      const { result } = renderHook(() => useErrorHandler());

      act(() => {
        result.current.handleError(new Error("401 unauthorized"));
      });

      expect(result.current.error).not.toBeNull();

      // Fast-forward 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.error).not.toBeNull(); // Should still be there
    });
  });
});

describe("useApiErrorHandler", () => {
  const mockUseSession = useSession as any;

  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-123", email: "user@example.com" } },
    });

    console.error = vi.fn();
    console.log = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    console.error = originalConsole.error;
    console.log = originalConsole.log;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("handleApiError", () => {
    it("should handle successful response", async () => {
      const { result } = renderHook(() => useApiErrorHandler());

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
      } as Response;

      await act(async () => {
        await result.current.handleApiError(mockResponse);
      });

      expect(result.current.error).toBeNull();
    });

    it("should handle structured error response", async () => {
      const { result } = renderHook(() => useApiErrorHandler());

      const errorData = {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          timestamp: new Date().toISOString(),
          requestId: "req-123",
        },
      };

      const mockResponse = {
        ok: false,
        status: 400,
        statusText: "Bad Request",
        url: "/api/test",
        json: vi.fn().mockResolvedValue(errorData),
      } as any;

      await act(async () => {
        await result.current.handleApiError(mockResponse);
      });

      expect(result.current.error).toMatchObject({
        code: "VALIDATION_ERROR",
        message: "Invalid input data",
        context: expect.objectContaining({
          status: 400,
          statusText: "Bad Request",
          url: "/api/test",
          requestId: "req-123",
        }),
      });
    });

    it("should handle generic HTTP error", async () => {
      const { result } = renderHook(() => useApiErrorHandler());

      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
        url: "/api/test",
        json: vi.fn().mockResolvedValue({}),
      } as any;

      await act(async () => {
        await result.current.handleApiError(mockResponse);
      });

      expect(result.current.error).toMatchObject({
        code: "HTTP_404",
        message: "HTTP 404: Not Found",
        userMessage: "El recurso solicitado no fue encontrado.",
        context: expect.objectContaining({
          status: 404,
          statusText: "Not Found",
          url: "/api/test",
        }),
      });
    });

    it("should handle JSON parse error", async () => {
      const { result } = renderHook(() => useApiErrorHandler());

      const mockResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        url: "/api/test",
        json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
      } as any;

      await act(async () => {
        await result.current.handleApiError(mockResponse);
      });

      expect(result.current.error).toMatchObject({
        code: "HTTP_500",
        message: "HTTP 500: Internal Server Error",
        context: expect.objectContaining({
          parseError: "Invalid JSON",
        }),
      });
    });

    it("should set appropriate options for server errors", async () => {
      const { result } = renderHook(() => useApiErrorHandler());

      const mockResponse = {
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
        url: "/api/test",
        json: vi.fn().mockResolvedValue({}),
      } as any;

      await act(async () => {
        await result.current.handleApiError(mockResponse);
      });

      expect(console.log).toHaveBeenCalledWith(
        "Toast:",
        "El servicio no está disponible temporalmente."
      );
    });
  });

  describe("default error messages", () => {
    const testCases = [
      { status: 400, expected: "Los datos enviados no son válidos." },
      { status: 401, expected: "Debes iniciar sesión para continuar." },
      {
        status: 403,
        expected: "No tienes permisos para realizar esta acción.",
      },
      { status: 404, expected: "El recurso solicitado no fue encontrado." },
      { status: 409, expected: "El recurso ya existe o está en conflicto." },
      {
        status: 429,
        expected: "Has excedido el límite de solicitudes. Intenta más tarde.",
      },
      {
        status: 500,
        expected:
          "Error interno del servidor. Nuestro equipo ha sido notificado.",
      },
      {
        status: 502,
        expected: "Error de comunicación con el servidor. Intenta nuevamente.",
      },
      {
        status: 503,
        expected: "El servicio no está disponible temporalmente.",
      },
      {
        status: 504,
        expected:
          "El servidor tardó demasiado en responder. Intenta nuevamente.",
      },
      { status: 999, expected: "Ha ocurrido un error inesperado." },
    ];

    testCases.forEach(({ status, expected }) => {
      it(`should return correct message for status ${status}`, async () => {
        const { result } = renderHook(() => useApiErrorHandler());

        const mockResponse = {
          ok: false,
          status,
          statusText: "Test Status",
          url: "/api/test",
          json: vi.fn().mockResolvedValue({}),
        } as any;

        await act(async () => {
          await result.current.handleApiError(mockResponse);
        });

        expect(result.current.error?.userMessage).toBe(expected);
      });
    });
  });

  describe("recoverable status detection", () => {
    const recoverableStatuses = [429, 500, 502, 503, 504];
    const nonRecoverableStatuses = [400, 401, 403, 404, 409];

    recoverableStatuses.forEach((status) => {
      it(`should mark status ${status} as recoverable`, async () => {
        const { result } = renderHook(() => useApiErrorHandler());

        const mockResponse = {
          ok: false,
          status,
          statusText: "Test Status",
          url: "/api/test",
          json: vi.fn().mockResolvedValue({}),
        } as any;

        await act(async () => {
          await result.current.handleApiError(mockResponse);
        });

        expect(result.current.error?.recoverable).toBe(true);
      });
    });

    nonRecoverableStatuses.forEach((status) => {
      it(`should mark status ${status} as non-recoverable`, async () => {
        const { result } = renderHook(() => useApiErrorHandler());

        const mockResponse = {
          ok: false,
          status,
          statusText: "Test Status",
          url: "/api/test",
          json: vi.fn().mockResolvedValue({}),
        } as any;

        await act(async () => {
          await result.current.handleApiError(mockResponse);
        });

        expect(result.current.error?.recoverable).toBe(false);
      });
    });
  });
});
