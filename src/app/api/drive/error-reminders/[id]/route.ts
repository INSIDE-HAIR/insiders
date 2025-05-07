import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

/**
 * GET: Obtener un recordatorio específico por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const reminder = await prisma.driveErrorReminder.findUnique({
      where: { id },
    });

    if (!reminder) {
      return NextResponse.json(
        { error: "Recordatorio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ reminder });
  } catch (error) {
    console.error("Error al obtener recordatorio:", error);
    return NextResponse.json(
      {
        error: "Error interno al obtener el recordatorio",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT: Actualizar un recordatorio específico por ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { status, frequency, interval, emails, active } = body;

    // Validar que el recordatorio exista
    const reminderExists = await prisma.driveErrorReminder.findUnique({
      where: { id },
    });

    if (!reminderExists) {
      return NextResponse.json(
        { error: "Recordatorio no encontrado" },
        { status: 404 }
      );
    }

    // Validaciones básicas
    if (!status || !frequency || !interval || !emails || !emails.length) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Validar que el estado sea válido
    if (!["pending", "in-progress"].includes(status)) {
      return NextResponse.json(
        { error: "Estado de reporte no válido" },
        { status: 400 }
      );
    }

    // Validar que la frecuencia sea válida
    if (!["hourly", "daily", "weekly", "monthly"].includes(frequency)) {
      return NextResponse.json(
        { error: "Frecuencia no válida" },
        { status: 400 }
      );
    }

    // Validar que el intervalo sea un número positivo
    if (typeof interval !== "number" || interval <= 0) {
      return NextResponse.json(
        { error: "El intervalo debe ser un número positivo" },
        { status: 400 }
      );
    }

    // Actualizar el recordatorio
    const updatedReminder = await prisma.driveErrorReminder.update({
      where: { id },
      data: {
        status,
        frequency,
        interval,
        emails,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json({
      message: "Recordatorio actualizado exitosamente",
      reminder: updatedReminder,
    });
  } catch (error) {
    console.error("Error al actualizar recordatorio:", error);
    return NextResponse.json(
      {
        error: "Error interno al actualizar el recordatorio",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Eliminar un recordatorio específico por ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validar que el recordatorio exista
    const reminderExists = await prisma.driveErrorReminder.findUnique({
      where: { id },
    });

    if (!reminderExists) {
      return NextResponse.json(
        { error: "Recordatorio no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar el recordatorio
    await prisma.driveErrorReminder.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Recordatorio eliminado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar recordatorio:", error);
    return NextResponse.json(
      {
        error: "Error interno al eliminar el recordatorio",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
