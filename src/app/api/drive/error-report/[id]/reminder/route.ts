import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { User } from "@/src/types/user";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = "force-dynamic";

interface RequestBody {
  recipients: string[];
  manualTrigger: boolean;
}

interface AssignedUser {
  name: string | null;
  email: string;
}

/**
 * POST: Enviar un recordatorio inmediato para un reporte específico
 */
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = params.id;
    const body = (await request.json()) as RequestBody;
    const { recipients, manualTrigger = false } = body;

    // Validaciones básicas
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos un destinatario" },
        { status: 400 }
      );
    }

    // Buscar el reporte para incluir sus detalles en el correo
    const report = await prisma.driveErrorReport.findUnique({
      where: { id },
      include: {
        categoryRef: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Reporte no encontrado" },
        { status: 404 }
      );
    }

    // Ignorar reportes resueltos
    if (report.status === "resolved") {
      return NextResponse.json(
        {
          error: "No se pueden enviar recordatorios para reportes ya resueltos",
        },
        { status: 400 }
      );
    }

    // Obtener información de usuarios asignados si existen
    let assignedUsers: AssignedUser[] = [];
    if (report.assignedTo && report.assignedTo.length > 0) {
      assignedUsers = await prisma.user.findMany({
        where: {
          id: {
            in: report.assignedTo as string[],
          },
        },
        select: {
          name: true,
          email: true,
        },
      });
    }

    // Crear el contenido del correo
    const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL}/es/admin/drive/errors?report=${report.id}`;
    const assignedList =
      assignedUsers.length > 0
        ? assignedUsers.map((u) => `${u.name || "Usuario sin nombre"} (${u.email})`).join(", ")
        : "No asignado";

    const statusText =
      {
        pending: "Pendiente",
        "in-progress": "En progreso",
        resolved: "Resuelto",
      }[report.status] || report.status;

    const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #ef4444; margin-top: 0;">Recordatorio: Reporte de Error en Archivo</h2>
      
      <p>${
        manualTrigger
          ? "Se ha enviado un recordatorio manual"
          : "Recordatorio automático"
      } para el siguiente reporte de error:</p>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <p><strong>Archivo:</strong> ${report.fileName}</p>
        <p><strong>Estado:</strong> <span style="color: ${
          report.status === "pending"
            ? "#eab308"
            : report.status === "in-progress"
            ? "#3b82f6"
            : "#22c55e"
        };">${statusText}</span></p>
        <p><strong>Categoría:</strong> ${
          report.categoryRef?.name || "Sin categoría"
        }</p>
        <p><strong>Reportado por:</strong> ${report.fullName} (${
      report.email
    })</p>
        <p><strong>Asignado a:</strong> ${assignedList}</p>
        <p><strong>Fecha de reporte:</strong> ${new Date(
          report.createdAt
        ).toLocaleString()}</p>
        ${report.notes ? `<p><strong>Notas:</strong> ${report.notes}</p>` : ""}
      </div>
      
      <div style="margin: 20px 0;">
        <p>Por favor revisa este reporte de error lo antes posible.</p>
        <a href="${reportUrl}" style="display: inline-block; background-color: #ef4444; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; font-weight: bold;">Ver detalles del reporte</a>
      </div>
      
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
        Este es un correo automático. Por favor no respondas a este mensaje.
      </p>
    </div>
    `;

    // Enviar el correo
    const emailResult = await resend.emails.send({
      from: `Insiders <${process.env.EMAIL_FROM || "noreply@insiders.com"}>`,
      to: recipients,
      subject: `Recordatorio: Reporte de error - ${report.fileName}`,
      html: emailHtml,
    });

    // Actualizar el recordatorio si existe
    if (!manualTrigger) {
      // Buscar recordatorio que coincida con el estado del reporte
      const reminder = await prisma.driveErrorReminder.findFirst({
        where: {
          status: report.status,
          active: true,
        },
      });

      if (reminder) {
        await prisma.driveErrorReminder.update({
          where: { id: reminder.id },
          data: {
            lastSent: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      message: "Recordatorio enviado exitosamente",
      emailSent: true,
    });
  } catch (error) {
    console.error("Error al enviar recordatorio:", error);
    return NextResponse.json(
      {
        error: "Error interno al enviar el recordatorio",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
