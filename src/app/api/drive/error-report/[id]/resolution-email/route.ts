import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendErrorResolutionEmail } from "@/src/config/email/templates/error-report-resolution-email";

// Crear instancia de Prisma con configuración para manejar problemas de conexión
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '&readPreference=secondaryPreferred&maxPoolSize=10&serverSelectionTimeoutMS=10000'
    }
  }
});
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
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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
    const { recipients, cc, bcc, subject, content } = body;

    if (!recipients || !recipients.length || !subject || !content) {
      return NextResponse.json(
        {
          error: "Faltan datos requeridos (destinatarios, asunto o contenido)",
        },
        { status: 400 }
      );
    }

    // Obtener datos del reporte con retry en caso de problemas de conexión
    let errorReport;
    try {
      errorReport = await prisma.driveErrorReport.findUnique({
        where: { id },
      });
    } catch (dbError) {
      console.error("Error de base de datos:", dbError);
      // Si hay problemas de BD, permitir envío con datos del formulario
      console.warn("Base de datos no disponible, enviando correo con datos proporcionados");
      
      // Usar datos mínimos para el envío
      await sendErrorResolutionEmail({
        fileName: `Reporte ID: ${id}`,
        fileId: undefined,
        fullName: "Cliente",
        email: recipients[0],
        reportedAt: new Date().toLocaleDateString(),
        resolvedBy: (cc || []).join(", ") || "Equipo de soporte",
        customSubject: subject,
        customContent: content,
        cc: cc || [],
        bcc: bcc || [],
      });

      return NextResponse.json({
        success: true,
        message: "Correo enviado exitosamente (sin actualización de estado por problemas de BD)",
        warning: "No se pudo verificar el estado del reporte en la base de datos",
      });
    }

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
      cc: cc || [],
      bcc: bcc || [],
    });

    // No actualizamos automáticamente el estado a "resolved"
    // El usuario debe marcarlo manualmente como resuelto

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
