import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import {
  HierarchyValidator,
  ValidationIssue,
  generateValidationReport,
} from "@drive/utils/hierarchy/hierarchyValidator";
import { Logger } from "@drive/utils/logger";
import { HierarchyItem } from "@drive/types/hierarchy";

const logger = new Logger("API:HierarchyValidator");

/**
 * POST /api/drive/hierarchy/validate
 * Valida una jerarquía existente
 * Body: Objeto con la jerarquía a validar (HierarchyItem)
 * Retorna la lista de problemas encontrados y un reporte formateado
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Verificar autenticación
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener datos del cuerpo de la solicitud
    const body = await request.json();
    const hierarchy = body.hierarchy as HierarchyItem;

    if (!hierarchy) {
      return NextResponse.json(
        { error: "No se proporcionó una jerarquía válida" },
        { status: 400 }
      );
    }

    // Validar la jerarquía
    logger.info(`Validando jerarquía con ID raíz: ${hierarchy.id}`);
    const issues = HierarchyValidator.validateHierarchy(hierarchy);

    // Generar reporte de validación
    const report = generateValidationReport(issues);

    const result = {
      valid: issues.length === 0,
      issues,
      report,
      stats: {
        total: issues.length,
        errors: issues.filter((issue) => issue.type === "error").length,
        warnings: issues.filter((issue) => issue.type === "warning").length,
      },
    };

    logger.info(
      `Validación completada: ${issues.length} problemas encontrados (${result.stats.errors} errores, ${result.stats.warnings} advertencias)`
    );

    return NextResponse.json(result);
  } catch (error: any) {
    logger.error("Error al validar jerarquía", error);
    return NextResponse.json(
      { error: error.message || "Error al validar jerarquía" },
      { status: 500 }
    );
  }
}
