import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendErrorReportAssignEmail } from "@/src/config/email/templates/error-report-assign-email";
import { decodeFileName } from "@/src/features/drive/utils/marketing-salon/file-decoder";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

/**
 * GET: Obtener un reporte específico por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
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

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error al obtener reporte:", error);
    return NextResponse.json(
      {
        error: "Error interno al obtener el reporte",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Actualizar un reporte específico por ID
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { status, notes, category, assignedTo, resolvedAt, notifyUsers } =
      body;

    // Validación básica
    if (!id) {
      return NextResponse.json(
        { error: "ID del reporte no proporcionado" },
        { status: 400 }
      );
    }

    // Datos a actualizar
    const updateData: any = {};

    // Actualizar solo los campos proporcionados
    if (status !== undefined) {
      updateData.status = status;

      // Si el estado es "resolved" y no se proporciona una fecha de resolución, establecer la fecha actual
      if (status === "resolved" && resolvedAt === undefined) {
        updateData.resolvedAt = new Date();
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (category !== undefined) {
      updateData.category = category || null; // Permitir establecer o quitar categoría
    }

    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo; // Asignar a usuarios
    }

    if (resolvedAt !== undefined) {
      updateData.resolvedAt = resolvedAt ? new Date(resolvedAt) : null;
    }

    // Obtener datos actuales del reporte para notificaciones
    const currentReport = await prisma.driveErrorReport.findUnique({
      where: { id },
      include: {
        categoryRef: true,
      },
    });

    if (!currentReport) {
      return NextResponse.json(
        { error: "Reporte no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar el reporte
    const updatedReport = await prisma.driveErrorReport.update({
      where: { id },
      data: updateData,
      include: {
        categoryRef: true,
      },
    });

    // Si hay usuarios para notificar, enviar correos electrónicos
    if (notifyUsers && Array.isArray(notifyUsers) && notifyUsers.length > 0) {
      try {
        // Obtener nombre decodificado para incluirlo en el email
        const decodedInfo = decodeFileName(currentReport.fileName);

        // Enviar emails a todos los usuarios nuevos
        for (const user of notifyUsers) {
          await sendErrorReportAssignEmail(user.email, {
            reportId: id,
            fileName: currentReport.fileName,
            fileId: currentReport.fileId || undefined,
            message: currentReport.message,
            reporterName: currentReport.fullName,
            reporterEmail: currentReport.email,
            assigneeName: user.name,
            decodedFileName: decodedInfo?.fullName,
            category: updatedReport.categoryRef?.name,
            status: updatedReport.status,
          });
        }

        console.log(
          `Enviadas ${notifyUsers.length} notificaciones de asignación`
        );
      } catch (emailError) {
        console.error("Error al enviar notificaciones por correo:", emailError);
        // No interrumpir la operación principal por errores en el envío de correos
      }
    }

    return NextResponse.json({ report: updatedReport });
  } catch (error) {
    console.error("Error al actualizar reporte:", error);

    return NextResponse.json(
      {
        error: "Error interno al actualizar el reporte",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Eliminar un reporte específico por ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Verificar que existe el reporte
    const report = await prisma.driveErrorReport.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Reporte no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar el reporte
    await prisma.driveErrorReport.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Reporte eliminado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar reporte:", error);

    return NextResponse.json(
      {
        error: "Error interno al eliminar el reporte",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
