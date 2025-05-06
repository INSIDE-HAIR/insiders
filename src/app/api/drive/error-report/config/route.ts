import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

/**
 * API endpoint para gestionar la configuración de destinatarios de reportes de errores
 * Permite obtener y actualizar los correos que reciben notificaciones
 */
export async function GET() {
  try {
    // Buscar configuración activa
    let config = await prisma.driveErrorReportConfig.findFirst({
      where: { active: true },
    });

    // Si no existe, crear configuración por defecto
    if (!config) {
      config = await prisma.driveErrorReportConfig.create({
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

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Error al obtener configuración:", error);

    return NextResponse.json(
      {
        error: "Error interno al obtener la configuración",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipients, ccRecipients, bccRecipients } = body;

    // Validación básica
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos un destinatario principal" },
        { status: 400 }
      );
    }

    // Buscar la configuración actual
    let config = await prisma.driveErrorReportConfig.findFirst({
      where: { active: true },
    });

    if (config) {
      // Actualizar configuración existente
      config = await prisma.driveErrorReportConfig.update({
        where: { id: config.id },
        data: {
          recipients,
          ccRecipients: ccRecipients || [],
          bccRecipients: bccRecipients || [],
        },
      });
    } else {
      // Crear nueva configuración
      config = await prisma.driveErrorReportConfig.create({
        data: {
          recipients,
          ccRecipients: ccRecipients || [],
          bccRecipients: bccRecipients || [],
          active: true,
        },
      });
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Error al actualizar configuración:", error);

    return NextResponse.json(
      {
        error: "Error interno al actualizar la configuración",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
