import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { CalendarEnvValidator } from "@/src/features/calendar/services/validation/CalendarEnvValidator";
import { Logger } from "@/src/features/calendar/utils/logger";

const logger = new Logger("API:EnvHealth");

/**
 * GET /api/calendar/env/health
 * Verifica el estado de las variables de entorno de Calendar
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    logger.info("Checking Calendar environment variables health");

    // Validar variables de entorno
    const validation = CalendarEnvValidator.validateEnvironment();
    const connectionCheck = CalendarEnvValidator.canConnectToAPI();

    // Generar reporte para logs (solo en development)
    if (process.env.NODE_ENV === 'development') {
      const report = CalendarEnvValidator.generateReport();
      logger.debug(`Environment Report: ${report}`);
    }

    // Determinar severidad del estado
    let severity: 'success' | 'warning' | 'error' = 'success';
    let message = 'Todas las variables están correctamente configuradas';

    if (!validation.hasMinimumConfig) {
      severity = 'error';
      message = `Variables obligatorias faltantes: ${validation.missingRequired.join(', ')}`;
    } else if (validation.invalidVariables.length > 0) {
      severity = 'error';
      message = `Variables con errores: ${validation.invalidVariables.join(', ')}`;
    } else if (!validation.isFullyConfigured) {
      severity = 'warning';
      message = 'Configuración mínima presente, algunas opcionales faltantes';
    }

    const response = {
      status: validation.isFullyConfigured ? 'healthy' : 'unhealthy',
      severity,
      message,
      canConnectToAPI: connectionCheck.canConnect,
      connectionReason: connectionCheck.reason,
      validation: {
        isFullyConfigured: validation.isFullyConfigured,
        hasMinimumConfig: validation.hasMinimumConfig,
        summary: validation.summary,
        missingRequired: validation.missingRequired,
        invalidVariables: validation.invalidVariables
      },
      variables: validation.variables,
      recommendations: generateRecommendations(validation),
      timestamp: new Date().toISOString()
    };

    logger.info(`Environment health check completed: ${response.status.toUpperCase()}`);

    return NextResponse.json(response);

  } catch (error: any) {
    logger.error("Failed to check environment health", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error checking environment health",
        status: 'error',
        severity: 'error',
        canConnectToAPI: false,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Genera recomendaciones basadas en el estado de las variables
 */
function generateRecommendations(validation: any): string[] {
  const recommendations: string[] = [];

  // Variables faltantes
  if (validation.missingRequired.length > 0) {
    recommendations.push(
      `🔧 Configurar variables obligatorias: ${validation.missingRequired.join(', ')}`
    );
    recommendations.push(
      "📖 Revisar documentación en el dashboard para obtener estas variables"
    );
  }

  // Variables inválidas
  if (validation.invalidVariables.length > 0) {
    recommendations.push(
      `⚠️ Corregir formato de variables: ${validation.invalidVariables.join(', ')}`
    );
  }

  // Verificar REFRESH_TOKEN específicamente
  const refreshTokenVar = validation.variables.find((v: any) => 
    v.name === 'GOOGLE_CALENDAR_REFRESH_TOKEN'
  );
  
  if (refreshTokenVar && !refreshTokenVar.isSet) {
    recommendations.push(
      "🔑 El REFRESH_TOKEN determina QUÉ CUENTA se usa. Obténlo de OAuth2 Playground con la cuenta correcta"
    );
  }

  // Verificar CLIENT_ID con typo común
  const clientIdVar = validation.variables.find((v: any) => 
    v.name === 'GOOGLE_CALENDAR_CLIENT_ID'
  );
  
  if (clientIdVar && !clientIdVar.isSet) {
    // Verificar si existe con typo
    const typoVar = process.env.OOGLE_CALENDAR_CLIENT_ID;
    if (typoVar) {
      recommendations.push(
        "🔤 TYPO DETECTADO: Cambiar 'OOGLE_CALENDAR_CLIENT_ID' por 'GOOGLE_CALENDAR_CLIENT_ID' (falta la G inicial)"
      );
    }
  }

  // Si todo está bien
  if (validation.isFullyConfigured) {
    recommendations.push(
      "✅ Configuración completa. Puedes proceder a crear eventos"
    );
  } else if (validation.hasMinimumConfig) {
    recommendations.push(
      "✅ Configuración mínima completa. Variables opcionales pueden mejorar la funcionalidad"
    );
  }

  // Agregar enlace de documentación
  recommendations.push(
    "📚 Consultar documentación completa en: /admin/calendar (sección Documentación)"
  );

  return recommendations;
}