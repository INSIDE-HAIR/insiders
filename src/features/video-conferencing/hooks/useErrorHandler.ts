/**
 * useErrorHandler Hook
 * React hook for handling errors in video conferencing components
 */
import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";

export interface ErrorInfo {
  code: string;
  message: string;
  userMessage: string;
  timestamp: Date;
  context?: Record<string, any>;
  recoverable?: boolean;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  reportToService?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export interface UseErrorHandlerReturn {
  error: ErrorInfo | null;
  isLoading: boolean;
  clearError: () => void;
  handleError: (
    error: Error | ErrorInfo,
    options?: ErrorHandlerOptions
  ) => void;
  executeWithErrorHandling: <T>(
    operation: () => Promise<T>,
    options?: ErrorHandlerOptions
  ) => Promise<T | null>;
  retryLastOperation: () => Promise<void>;
  getErrorHistory: () => ErrorInfo[];
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const { data: session } = useSession();
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorHistory, setErrorHistory] = useState<ErrorInfo[]>([]);
  const [lastOperation, setLastOperation] = useState<{
    operation: () => Promise<any>;
    options?: ErrorHandlerOptions;
  } | null>(null);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Convert error to ErrorInfo format
   */
  const normalizeError = useCallback((error: Error | ErrorInfo): ErrorInfo => {
    if ("code" in error && "userMessage" in error) {
      return error as ErrorInfo;
    }

    // Convert regular Error to ErrorInfo
    const regularError = error as Error;
    let code = "UNKNOWN_ERROR";
    let userMessage = "Ha ocurrido un error inesperado.";

    // Try to classify the error based on message
    if (regularError.message.includes("fetch")) {
      code = "NETWORK_ERROR";
      userMessage = "Error de conexión. Verifica tu conexión a internet.";
    } else if (
      regularError.message.includes("401") ||
      regularError.message.includes("unauthorized")
    ) {
      code = "AUTHENTICATION_ERROR";
      userMessage =
        "Error de autenticación. Por favor, inicia sesión nuevamente.";
    } else if (
      regularError.message.includes("403") ||
      regularError.message.includes("forbidden")
    ) {
      code = "AUTHORIZATION_ERROR";
      userMessage = "No tienes permisos para realizar esta acción.";
    } else if (regularError.message.includes("404")) {
      code = "RESOURCE_NOT_FOUND";
      userMessage = "El recurso solicitado no fue encontrado.";
    } else if (regularError.message.includes("429")) {
      code = "RATE_LIMIT_ERROR";
      userMessage =
        "Has excedido el límite de solicitudes. Intenta nuevamente en unos minutos.";
    } else if (
      regularError.message.includes("500") ||
      regularError.message.includes("502") ||
      regularError.message.includes("503")
    ) {
      code = "SERVER_ERROR";
      userMessage = "Error del servidor. Nuestro equipo ha sido notificado.";
    }

    return {
      code,
      message: regularError.message,
      userMessage,
      timestamp: new Date(),
      context: {
        stack: regularError.stack,
        name: regularError.name,
      },
      recoverable: [
        "NETWORK_ERROR",
        "SERVER_ERROR",
        "RATE_LIMIT_ERROR",
      ].includes(code),
    };
  }, []);

  /**
   * Handle error with various options
   */
  const handleError = useCallback(
    (error: Error | ErrorInfo, options: ErrorHandlerOptions = {}) => {
      const errorInfo = normalizeError(error);

      // Set current error
      setError(errorInfo);

      // Add to history
      setErrorHistory((prev) => [errorInfo, ...prev.slice(0, 9)]); // Keep last 10 errors

      // Log to console if enabled
      if (options.logToConsole !== false) {
        console.error("Error handled by useErrorHandler:", {
          code: errorInfo.code,
          message: errorInfo.message,
          userMessage: errorInfo.userMessage,
          context: errorInfo.context,
          timestamp: errorInfo.timestamp,
        });
      }

      // Show toast notification if enabled
      if (options.showToast) {
        // In a real implementation, you would integrate with a toast library
        console.log("Toast:", errorInfo.userMessage);
      }

      // Report to error service if enabled
      if (options.reportToService) {
        reportErrorToService(errorInfo, session?.user?.id);
      }
    },
    [normalizeError, session?.user?.id]
  );

  /**
   * Execute operation with error handling
   */
  const executeWithErrorHandling = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: ErrorHandlerOptions = {}
    ): Promise<T | null> => {
      setIsLoading(true);
      setLastOperation({ operation, options });

      let retries = 0;
      const maxRetries = options.maxRetries || 0;
      const retryDelay = options.retryDelay || 1000;

      const executeOperation = async (): Promise<T | null> => {
        try {
          const result = await operation();
          setIsLoading(false);
          clearError(); // Clear any previous errors on success
          return result;
        } catch (error) {
          const errorInfo = normalizeError(error as Error);

          // Check if we should retry
          if (
            options.autoRetry &&
            errorInfo.recoverable &&
            retries < maxRetries
          ) {
            retries++;
            console.log(
              `Retrying operation (attempt ${retries}/${maxRetries})...`
            );

            // Wait before retrying
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelay * retries)
            );

            return executeOperation();
          }

          // Handle the error
          handleError(errorInfo, options);
          setIsLoading(false);
          return null;
        }
      };

      return executeOperation();
    },
    [handleError, clearError]
  );

  /**
   * Retry the last operation
   */
  const retryLastOperation = useCallback(async (): Promise<void> => {
    if (!lastOperation) {
      console.warn("No operation to retry");
      return;
    }

    await executeWithErrorHandling(
      lastOperation.operation,
      lastOperation.options
    );
  }, [lastOperation, executeWithErrorHandling]);

  /**
   * Get error history
   */
  const getErrorHistory = useCallback(() => {
    return [...errorHistory];
  }, [errorHistory]);

  // Auto-clear errors after 10 seconds for non-critical errors
  useEffect(() => {
    if (
      error &&
      !["AUTHENTICATION_ERROR", "AUTHORIZATION_ERROR"].includes(error.code)
    ) {
      const timer = setTimeout(() => {
        clearError();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return {
    error,
    isLoading,
    clearError,
    handleError,
    executeWithErrorHandling,
    retryLastOperation,
    getErrorHistory,
  };
}

/**
 * Report error to external service
 */
async function reportErrorToService(
  error: ErrorInfo,
  userId?: string
): Promise<void> {
  try {
    // In a real implementation, this would send to your error reporting service
    const errorReport = {
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      timestamp: error.timestamp,
      context: error.context,
      userId,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Simulate API call to error reporting service
    console.log("Reporting error to service:", errorReport);

    // Example: Send to your API
    // await fetch('/api/error-reporting', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport),
    // });
  } catch (reportingError) {
    console.error("Failed to report error to service:", reportingError);
  }
}

/**
 * Hook for handling API errors specifically
 */
export function useApiErrorHandler() {
  const errorHandler = useErrorHandler();

  const handleApiError = useCallback(
    async (response: Response): Promise<void> => {
      if (!response.ok) {
        let errorInfo: ErrorInfo;

        try {
          const errorData = await response.json();

          if (errorData.error && errorData.error.code) {
            // Server returned structured error
            errorInfo = {
              code: errorData.error.code,
              message: errorData.error.message || `HTTP ${response.status}`,
              userMessage:
                errorData.error.message ||
                getDefaultErrorMessage(response.status),
              timestamp: new Date(errorData.error.timestamp || Date.now()),
              context: {
                status: response.status,
                statusText: response.statusText,
                url: response.url,
                requestId: errorData.error.requestId,
              },
              recoverable: isRecoverableStatus(response.status),
            };
          } else {
            // Generic HTTP error
            errorInfo = {
              code: `HTTP_${response.status}`,
              message: `HTTP ${response.status}: ${response.statusText}`,
              userMessage: getDefaultErrorMessage(response.status),
              timestamp: new Date(),
              context: {
                status: response.status,
                statusText: response.statusText,
                url: response.url,
              },
              recoverable: isRecoverableStatus(response.status),
            };
          }
        } catch (parseError) {
          // Failed to parse error response
          errorInfo = {
            code: `HTTP_${response.status}`,
            message: `HTTP ${response.status}: ${response.statusText}`,
            userMessage: getDefaultErrorMessage(response.status),
            timestamp: new Date(),
            context: {
              status: response.status,
              statusText: response.statusText,
              url: response.url,
              parseError: (parseError as Error).message,
            },
            recoverable: isRecoverableStatus(response.status),
          };
        }

        errorHandler.handleError(errorInfo, {
          showToast: true,
          reportToService: response.status >= 500,
          autoRetry: isRecoverableStatus(response.status),
          maxRetries: response.status >= 500 ? 2 : 0,
        });
      }
    },
    [errorHandler]
  );

  return {
    ...errorHandler,
    handleApiError,
  };
}

/**
 * Get default error message for HTTP status codes
 */
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Los datos enviados no son válidos.";
    case 401:
      return "Debes iniciar sesión para continuar.";
    case 403:
      return "No tienes permisos para realizar esta acción.";
    case 404:
      return "El recurso solicitado no fue encontrado.";
    case 409:
      return "El recurso ya existe o está en conflicto.";
    case 429:
      return "Has excedido el límite de solicitudes. Intenta más tarde.";
    case 500:
      return "Error interno del servidor. Nuestro equipo ha sido notificado.";
    case 502:
      return "Error de comunicación con el servidor. Intenta nuevamente.";
    case 503:
      return "El servicio no está disponible temporalmente.";
    case 504:
      return "El servidor tardó demasiado en responder. Intenta nuevamente.";
    default:
      return "Ha ocurrido un error inesperado.";
  }
}

/**
 * Check if HTTP status is recoverable (should retry)
 */
function isRecoverableStatus(status: number): boolean {
  return [429, 500, 502, 503, 504].includes(status);
}
