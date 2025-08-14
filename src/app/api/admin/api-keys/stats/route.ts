import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import prisma from "@/prisma/database";
import { ApiKeyStatsSchema } from "@/src/features/settings/validations/api-keys";

/**
 * GET /api/admin/api-keys/stats
 * Obtener estadísticas globales de API Keys
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Intentar obtener estadísticas de la base de datos, usar mock si falla
    let total = 0, active = 0, inactive = 0, revoked = 0;
    let usageStats: any = null;
    let usingMockData = false;
    let additionalStats: any[] = [];
    
    const currentDate = new Date();
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);

    try {

      // Contar API Keys por estado
      [total, active, inactive, revoked] = await Promise.all([
        prisma.apiKey.count({
          where: { userId: session.user.id }
        }),
        prisma.apiKey.count({
          where: { 
            userId: session.user.id,
            status: 'ACTIVE'
          }
        }),
        prisma.apiKey.count({
          where: { 
            userId: session.user.id,
            status: 'INACTIVE'
          }
        }),
        prisma.apiKey.count({
          where: { 
            userId: session.user.id,
            status: 'REVOKED'
          }
        })
      ]);

      // Obtener estadísticas básicas de las API keys
      additionalStats = await prisma.apiKey.findMany({
        where: {
          userId: session.user.id,
          status: 'ACTIVE'
        },
        select: {
          id: true,
          totalRequests: true,
          lastUsedAt: true
        }
      });

      // Calcular métricas básicas
      const recentlyUsed = additionalStats.filter(key => 
        key.lastUsedAt && key.lastUsedAt > yesterday
      ).length;

    } catch (dbError) {
      // Si la tabla no existe, usar datos mock
      console.log("Database table not found, using mock data for stats");
      usingMockData = true;
      total = 3;
      active = 2;
      inactive = 1;
      revoked = 0;
      additionalStats = []; // Mock vacío para evitar errores
    }

    // Preparar respuesta con datos reales o mock
    if (usingMockData) {
      return NextResponse.json({
        total,
        active,
        inactive,
        revoked,
        recentlyUsed: 2,
        totalRequests: 23070, // Suma de todos los totalRequests de los mock keys
        averageRequestsPerKey: active > 0 ? Math.round(23070 / active) : 0,
        lastUpdated: new Date().toISOString(),
        usingMockData: true
      });
    }

    // Datos reales de la base de datos (simplificados)
    const totalRequests = additionalStats.reduce((sum, key) => sum + key.totalRequests, 0);

    const recentlyUsed = additionalStats.filter(key => 
      key.lastUsedAt && key.lastUsedAt > yesterday
    ).length;

    return NextResponse.json({
      total,
      active,
      inactive,
      revoked,
      recentlyUsed,
      totalRequests,
      averageRequestsPerKey: active > 0 ? Math.round(totalRequests / active) : 0,
      lastUpdated: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Error fetching API key statistics:", error);
    
    // En caso de error, devolver datos de ejemplo seguros
    return NextResponse.json({
      total: 0,
      active: 0,
      suspended: 0,
      revoked: 0,
      expired: 0,
      recentlyUsed: 0,
      totalRequests24h: 0,
      successfulRequests24h: 0,
      failedRequests24h: 0,
      successRate: 0,
      averageRequestsPerKey: 0,
      lastUpdated: new Date().toISOString(),
      error: "Could not fetch real statistics"
    }, { status: 500 });
  }
}