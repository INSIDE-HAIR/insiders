import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

/**
 * GET: Obtener todos los recordatorios configurados
 */
export async function GET(request: NextRequest) {
  try {
    const reminders = await prisma.driveErrorReminder.findMany({
      orderBy: [{ status: "asc" }, { frequency: "asc" }],
    });

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error("Error al obtener recordatorios:", error);
    return NextResponse.json(
      {
        error: "Error interno al obtener recordatorios",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Crear un nuevo recordatorio
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { status, frequency, interval, emails, active = true } = body;

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

    // Crear el recordatorio
    const reminder = await prisma.driveErrorReminder.create({
      data: {
        status,
        frequency,
        interval,
        emails,
        active,
      },
    });

    return NextResponse.json(
      { message: "Recordatorio creado exitosamente", reminder },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear recordatorio:", error);
    return NextResponse.json(
      {
        error: "Error interno al crear recordatorio",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
