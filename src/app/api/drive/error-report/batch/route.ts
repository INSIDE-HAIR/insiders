import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

interface BatchRequestBody {
  ids: string[];
  action: "delete" | "update-status" | "assign-category" | "assign-users";
  data?: {
    status?: string;
    category?: string | null;
    assignedTo?: string[];
  };
}

/**
 * POST: Ejecutar acciones masivas sobre múltiples reportes de error
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BatchRequestBody;
    const { ids, action, data } = body;

    // Validaciones básicas
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos un ID de reporte" },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: "Se requiere especificar una acción" },
        { status: 400 }
      );
    }

    let result;

    // Ejecutar la acción correspondiente
    switch (action) {
      case "delete":
        // Eliminar reportes
        result = await prisma.driveErrorReport.deleteMany({
          where: {
            id: {
              in: ids,
            },
          },
        });

        return NextResponse.json({
          message: `${result.count} reportes eliminados correctamente`,
          count: result.count,
        });

      case "update-status":
        // Validar que se proporcionó un estado
        if (!data?.status) {
          return NextResponse.json(
            { error: "Se requiere especificar un estado" },
            { status: 400 }
          );
        }

        // Actualizar estado de reportes
        result = await prisma.driveErrorReport.updateMany({
          where: {
            id: {
              in: ids,
            },
          },
          data: {
            status: data.status,
            // Si el estado es 'resolved', establecer la fecha de resolución
            resolvedAt: data.status === "resolved" ? new Date() : undefined,
          },
        });

        return NextResponse.json({
          message: `${result.count} reportes actualizados a estado "${data.status}"`,
          count: result.count,
        });

      case "assign-category":
        // Actualizar categoría de reportes
        result = await prisma.driveErrorReport.updateMany({
          where: {
            id: {
              in: ids,
            },
          },
          data: {
            category: data?.category || null,
          },
        });

        return NextResponse.json({
          message: data?.category
            ? `${result.count} reportes asignados a la categoría especificada`
            : `${result.count} reportes con categoría removida`,
          count: result.count,
        });

      case "assign-users":
        // Validar que se proporcionaron usuarios
        if (!data?.assignedTo) {
          return NextResponse.json(
            { error: "Se requiere especificar usuarios para asignar" },
            { status: 400 }
          );
        }

        // Actualizar cada reporte individualmente para manejar el array de assignedTo
        let updatedCount = 0;

        for (const id of ids) {
          await prisma.driveErrorReport.update({
            where: { id },
            data: {
              assignedTo: data.assignedTo,
            },
          });
          updatedCount++;
        }

        return NextResponse.json({
          message: `${updatedCount} reportes asignados a los usuarios especificados`,
          count: updatedCount,
        });

      default:
        return NextResponse.json(
          { error: "Acción no reconocida" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error al procesar acción por lotes:", error);

    return NextResponse.json(
      {
        error: "Error interno al procesar la acción por lotes",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
