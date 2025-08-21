import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware para autenticación con API Keys
 * Por defecto, todas las rutas de API son accesibles con API Key
 * Solo se excluyen las rutas específicas del frontend
 */
export function withApiKeyAuth(middleware: Function) {
  return async (request: NextRequest, event: any) => {
    const pathname = request.nextUrl.pathname;

    console.log(`�� Middleware withApiKeyAuth ejecutándose para: ${pathname}`);

    // Rutas que NO requieren API Key (solo rutas del frontend)
    const excludedRoutes = [
      "/api/admin/", // Rutas de admin del frontend (sesión)
      "/api/auth/", // Rutas de autenticación (sesión)
      "/api/users", // Rutas de usuarios (sesión)
      "/api/v1/health/debug/", // Rutas de debug internas
      "/api/cron/", // Rutas de cron internas
    ];

    // Verificar si es una ruta excluida (solo para frontend)
    const isExcludedRoute = excludedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    console.log(`🔍 Ruta ${pathname} es excluida: ${isExcludedRoute}`);

    // Si es una ruta excluida, no aplicar API Key auth
    if (isExcludedRoute) {
      console.log(
        `⏭️  Ruta ${pathname} excluida de API Key auth, continuando...`
      );
      return middleware(request, event);
    }

    // Para todas las demás rutas de API, verificar API Key si está presente
    const apiKey = extractApiKeySimple(request);

    if (apiKey) {
      console.log(`🔐 API Key detectada para ruta: ${pathname}`);

      // Validar API Key usando una función simple
      const validation = validateApiKeySimple(request);

      if (!validation.valid) {
        console.log(`❌ API Key inválida para ${pathname}:`, validation.error);
        return NextResponse.json(
          {
            error: validation.error || "Invalid API Key",
            code: "UNAUTHORIZED",
            timestamp: new Date().toISOString(),
            path: pathname,
          },
          { status: validation.statusCode || 401 }
        );
      }

      console.log(
        `✅ API Key válida para ${pathname}, usuario: ${validation.context?.userId}`
      );

      // Añadir contexto de la API Key a los headers de la request para uso en las rutas
      request.headers.set(
        "x-api-key-context",
        JSON.stringify(validation.context)
      );
      request.headers.set(
        "x-api-key-user-id",
        validation.context?.userId || ""
      );
      request.headers.set("x-api-key-id", validation.context?.keyId || "");

      return middleware(request, event);
    }

    // Si no hay API Key, continuar normalmente (permite acceso sin API Key)
    console.log(`⏭️  No hay API Key para ${pathname}, continuando...`);
    return middleware(request, event);
  };
}

/**
 * Función simple para validar API Keys (compatible con Edge Runtime)
 */
function validateApiKeySimple(request: NextRequest): {
  valid: boolean;
  context?: { keyId: string; userId: string };
  error?: string;
  statusCode?: number;
} {
  try {
    console.log("🔍 validateApiKeySimple ejecutándose");

    // Extraer API Key del header
    const apiKey = extractApiKeySimple(request);
    console.log(
      "🔍 API Key extraída:",
      apiKey ? apiKey.substring(0, 20) + "..." : "NO"
    );

    if (!apiKey) {
      return {
        valid: false,
        error:
          'API Key is required. Include it in Authorization header as "Bearer YOUR_API_KEY" or X-API-Key header.',
        statusCode: 401,
      };
    }

    // Para debug, aceptar cualquier API Key que empiece con ak_dev_
    if (apiKey.startsWith("ak_dev_")) {
      console.log("✅ API Key válida (debug mode)");
      return {
        valid: true,
        context: {
          keyId: "debug_key_id",
          userId: "debug_user_id",
        },
      };
    }

    return {
      valid: false,
      error: "Invalid API Key format",
      statusCode: 401,
    };
  } catch (error: any) {
    console.error("❌ Error en validateApiKeySimple:", error);
    return {
      valid: false,
      error: "Internal server error during authentication",
      statusCode: 500,
    };
  }
}

/**
 * Extraer API Key de headers (función simple)
 */
function extractApiKeySimple(request: NextRequest): string | null {
  // Opción 1: Authorization Bearer
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Opción 2: X-API-Key header
  const apiKeyHeader = request.headers.get("x-api-key");
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  // Opción 3: Query parameter (menos seguro)
  const url = new URL(request.url);
  const apiKeyParam = url.searchParams.get("api_key");
  if (apiKeyParam) {
    return apiKeyParam;
  }

  return null;
}
