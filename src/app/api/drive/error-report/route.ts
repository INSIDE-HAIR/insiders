import { NextRequest, NextResponse } from "next/server";
import { emailConfig, emailDefaults } from "@/src/config/email/email-config";
import { PrismaClient } from "@prisma/client";
import { sendErrorReportTeamEmail } from "@/src/config/email/templates/error-report-team-email";
import { sendErrorReportClientEmail } from "@/src/config/email/templates/error-report-client-email";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

/**
 * API endpoint para enviar reportes de error en archivos de Drive
 * Guarda el reporte en la base de datos y envía emails de notificación
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileId, message, email, fullName } = body;

    // Validar datos
    if (!fileName || !message || !email || !fullName) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Guardar error en la base de datos
    const errorReport = await prisma.driveErrorReport.create({
      data: {
        fileName,
        fileId,
        message,
        email,
        fullName,
        status: "pending",
      },
    });

    // Obtener la configuración de destinatarios
    let recipientConfig = await prisma.driveErrorReportConfig.findFirst({
      where: { active: true },
    });

    // Si no existe configuración, crear una con los destinatarios predeterminados
    if (!recipientConfig) {
      recipientConfig = await prisma.driveErrorReportConfig.create({
        data: {
          recipients: [
            "carlos@insidesalons.com",
            "patricia@insidesalons.com",
            "sistemas@insidesalons.com",
          ],
          ccRecipients: [],
          bccRecipients: [],
          active: true,
        },
      });
    }

    const reportData = {
      fileName,
      fileId,
      message,
      email,
      fullName,
    };

    // Enviar emails usando las plantillas
    const [teamEmailResponse, clientEmailResponse] = await Promise.all([
      sendErrorReportTeamEmail(
        recipientConfig.recipients,
        recipientConfig.ccRecipients,
        recipientConfig.bccRecipients,
        reportData
      ),
      sendErrorReportClientEmail(reportData),
    ]);

    return NextResponse.json({
      success: true,
      errorReport,
    });
  } catch (error) {
    console.error("Error al procesar reporte de error:", error);

    return NextResponse.json(
      {
        error: "Error interno al procesar el reporte",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * Obtiene todos los reportes de errores
 */
export async function GET() {
  try {
    const reports = await prisma.driveErrorReport.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        categoryRef: true,
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error al obtener reportes:", error);

    return NextResponse.json(
      {
        error: "Error interno al obtener los reportes",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
