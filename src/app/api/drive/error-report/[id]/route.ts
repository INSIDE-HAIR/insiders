import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

/**
 * API endpoint para gestionar reportes individuales de errores en Drive
 * Permite actualizar el estado y añadir notas a los reportes
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { status, notes } = body;

    // Validación básica
    if (!id) {
      return NextResponse.json(
        { error: "ID del reporte no proporcionado" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: "Estado no proporcionado" },
        { status: 400 }
      );
    }

    // Validar que el estado sea válido
    if (!["pending", "in-progress", "resolved"].includes(status)) {
      return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
    }

    // Datos a actualizar
    const updateData: any = { status };

    // Si se proporciona notas, añadirlas a la actualización
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Si el estado es "resolved", actualizar la fecha de resolución
    if (status === "resolved") {
      updateData.resolvedAt = new Date();
    }

    // Actualizar el reporte
    const updatedReport = await prisma.driveErrorReport.update({
      where: { id },
      data: updateData,
    });

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
