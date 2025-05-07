import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { DriveErrorReminder, DriveErrorReport } from "@/src/types/drive";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Verificar que la solicitud tenga el token secreto de cron
const validateCronSecret = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.replace("Bearer ", "");
  return token === process.env.CRON_SECRET;
};

// Tipo para el recordatorio desde la base de datos
type DbReminder = {
  id: string;
  status: string;
  frequency: string;
  interval: number;
  active: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  lastSent?: Date | string | null;
};

// Tipo para usuarios asignados
type AssignedUser = {
  name: string | null;
  email: string;
};

// Función para determinar si un recordatorio debe ejecutarse ahora
const shouldSendReminder = (reminder: DbReminder, now = new Date()) => {
  // En lugar de lastSent, usaremos updatedAt para determinar cuándo se ejecutó por última vez
  // Si no tiene fecha de último envío, enviar ahora
  if (!reminder.updatedAt) {
    return true;
  }

  const lastUpdated = new Date(reminder.updatedAt);
  let nextSendTime: Date;

  switch (reminder.frequency) {
    case "hourly":
      nextSendTime = new Date(lastUpdated);
      nextSendTime.setHours(lastUpdated.getHours() + reminder.interval);
      break;
    case "daily":
      nextSendTime = new Date(lastUpdated);
      nextSendTime.setDate(lastUpdated.getDate() + reminder.interval);
      break;
    case "weekly":
      nextSendTime = new Date(lastUpdated);
      nextSendTime.setDate(lastUpdated.getDate() + reminder.interval * 7);
      break;
    case "monthly":
      nextSendTime = new Date(lastUpdated);
      nextSendTime.setMonth(lastUpdated.getMonth() + reminder.interval);
      break;
    default:
      return false;
  }

  return now >= nextSendTime;
};

/**
 * GET: Verificar y enviar recordatorios según configuración
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación para el cron job
    if (!validateCronSecret(request)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener todos los recordatorios activos
    const reminders = await prisma.driveErrorReminder.findMany({
      where: { active: true },
    });

    if (reminders.length === 0) {
      return NextResponse.json({
        message: "No hay recordatorios activos configurados",
      });
    }

    const results = [];
    const now = new Date();

    // Verificar cada recordatorio
    for (const reminder of reminders as DbReminder[]) {
      // Determinar si es hora de enviar el recordatorio
      if (!shouldSendReminder(reminder, now)) {
        results.push({
          id: reminder.id,
          status: "skipped",
          message: "No es momento de ejecutar este recordatorio",
        });
        continue;
      }

      // Buscar reportes en el estado especificado
      const reports = await prisma.driveErrorReport.findMany({
        where: {
          // Convertir status a string para que coincida con lo que viene de la BD
          status: String(reminder.status),
          // Reportes que no se hayan resuelto
          resolvedAt: null,
        },
        include: {
          categoryRef: true,
        },
      });

      if (reports.length === 0) {
        // Actualizar la fecha de último envío incluso si no hay reportes
        await prisma.driveErrorReminder.update({
          where: { id: reminder.id },
          data: {
            updatedAt: now, // Solo actualizamos updatedAt en lugar de lastSent
          },
        });

        results.push({
          id: reminder.id,
          status: "no_reports",
          message: `No hay reportes en estado '${reminder.status}' para enviar recordatorios`,
        });
        continue;
      }

      // Obtener la configuración general de destinatarios
      const recipientConfig = await prisma.driveErrorReportConfig.findFirst({
        where: { active: true },
      });

      // Procesar cada reporte
      for (const report of reports) {
        try {
          const recipients: string[] = [];

          // Si hay usuarios asignados, usar sus emails
          if (report.assignedTo && report.assignedTo.length > 0) {
            const assignedUsers: AssignedUser[] = await prisma.user.findMany({
              where: {
                id: {
                  in: report.assignedTo as string[],
                },
              },
              select: {
                email: true,
                name: true,
              },
            });

            assignedUsers.forEach((user) => {
              if (user.email) {
                recipients.push(user.email);
              }
            });
          }
          // Si no hay usuarios asignados, usar la configuración general de destinatarios
          else if (recipientConfig && recipientConfig.recipients.length > 0) {
            recipientConfig.recipients.forEach((email) => {
              recipients.push(email);
            });
          }

          // Si no hay destinatarios, omitir este reporte
          if (recipients.length === 0) {
            continue;
          }

          // Preparar el contenido del email (igual que en el endpoint de recordatorio manual)
          const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL}/es/admin/drive/errors?report=${report.id}`;

          // Obtener información de usuarios asignados
          const assignedUsers: AssignedUser[] = [];
          if (report.assignedTo && report.assignedTo.length > 0) {
            const users = await prisma.user.findMany({
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
            users.forEach((user) => assignedUsers.push(user));
          }

          const assignedList =
            assignedUsers.length > 0
              ? assignedUsers
                  .map((u) => `${u.name || "Usuario sin nombre"} (${u.email})`)
                  .join(", ")
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
            
            <p>Recordatorio automático para el siguiente reporte de error:</p>
            
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
              ${
                report.notes
                  ? `<p><strong>Notas:</strong> ${report.notes}</p>`
                  : ""
              }
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
          await resend.emails.send({
            from: `Insiders <${
              process.env.EMAIL_FROM || "noreply@insiders.com"
            }>`,
            to: recipients,
            subject: `Recordatorio: Reporte de error - ${report.fileName}`,
            html: emailHtml,
          });
        } catch (emailError) {
          console.error(
            `Error al enviar recordatorio para reporte ${report.id}:`,
            emailError
          );
        }
      }

      // Actualizar la fecha de último envío
      await prisma.driveErrorReminder.update({
        where: { id: reminder.id },
        data: {
          updatedAt: now, // Solo actualizamos updatedAt en vez de lastSent
        },
      });

      results.push({
        id: reminder.id,
        status: "success",
        message: `Recordatorios enviados para ${reports.length} reportes en estado '${reminder.status}'`,
      });
    }

    return NextResponse.json({
      message: "Proceso de recordatorios completado",
      results,
    });
  } catch (error) {
    console.error("Error al procesar recordatorios:", error);
    return NextResponse.json(
      {
        error: "Error interno al procesar recordatorios",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
