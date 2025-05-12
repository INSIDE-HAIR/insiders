import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getEmailTemplates } from "@/src/config/email/templates/error-report-resolution-email";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

/**
 * GET /api/drive/email-templates
 *
 * Retorna las plantillas de correo disponibles para resolución de problemas.
 */
export async function GET() {
  try {
    // Obtener las plantillas disponibles
    const templates = getEmailTemplates();

    return NextResponse.json({
      templates,
      success: true,
    });
  } catch (error) {
    console.error("Error al obtener plantillas de correo:", error);

    return NextResponse.json(
      {
        error: "Error al obtener plantillas de correo",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
