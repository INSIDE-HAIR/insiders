import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Verificar variables de entorno críticas
    const environment = {
      nodeEnv: process.env.NODE_ENV || "development",
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    };

    // Verificar conectividad básica
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment,
      services: {
        api: "operational",
        database: environment.hasDatabaseUrl ? "configured" : "not_configured",
        auth:
          environment.hasNextAuthSecret && environment.hasNextAuthUrl
            ? "configured"
            : "not_configured",
      },
    };

    // Si hay problemas críticos, cambiar status
    if (!environment.hasDatabaseUrl) {
      healthStatus.status = "degraded";
      healthStatus.services.database = "not_configured";
    }

    const statusCode = healthStatus.status === "healthy" ? 200 : 503;

    return NextResponse.json(healthStatus, { status: statusCode });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Health check failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
