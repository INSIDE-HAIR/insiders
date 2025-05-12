import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendErrorResolutionEmail } from "@/src/config/email/templates/error-report-resolution-email";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

/**
 * POST /api/drive/error-report/[id]/resolution-email
 *
 * Envía un correo de resolución al cliente que reportó un problema.
 * Solo disponible para usuarios autenticados con rol ADMIN o EMPLOYEE.
 *
 * Parámetros:
 * - recipients: Array de correos destinatarios (principal: cliente)
 * - cc: Array de correos en copia (usualmente staff asignado)
 * - subject: Asunto del correo
 * - content: Contenido del correo
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Obtener ID del reporte
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID de reporte no proporcionado" },
        { status: 400 }
      );
    }

    // Obtener datos del body
    const body = await request.json();
    const { recipients, cc, subject, content } = body;

    if (!recipients || !recipients.length || !subject || !content) {
      return NextResponse.json(
        {
          error: "Faltan datos requeridos (destinatarios, asunto o contenido)",
        },
        { status: 400 }
      );
    }

    // Obtener datos del reporte
    const errorReport = await prisma.driveErrorReport.findUnique({
      where: { id },
    });

    if (!errorReport) {
      return NextResponse.json(
        { error: "Reporte no encontrado" },
        { status: 404 }
      );
    }

    // Preparar lista de correos de usuarios asignados (para CC)
    const assignedUserEmails = cc || [];

    // Enviar correo
    await sendErrorResolutionEmail({
      fileName: errorReport.fileName,
      fileId: errorReport.fileId || undefined,
      fullName: errorReport.fullName,
      email: recipients[0], // Usamos el primer destinatario como principal
      reportedAt: new Date(errorReport.createdAt).toLocaleDateString(),
      resolvedBy: assignedUserEmails.join(", "),
      customSubject: subject,
      customContent: content,
    });

    // Actualizar reporte para indicar que se envió correo de resolución
    await prisma.driveErrorReport.update({
      where: { id },
      data: {
        status: "resolved",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Correo de resolución enviado correctamente",
    });
  } catch (error) {
    console.error("Error al enviar correo de resolución:", error);

    return NextResponse.json(
      {
        error: "Error al enviar correo de resolución",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
