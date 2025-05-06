import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

/**
 * GET: Obtener todas las categorías de errores
 */
export async function GET() {
  try {
    const categories = await prisma.driveErrorCategory.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return NextResponse.json(
      {
        error: "Error interno al obtener categorías",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Crear nueva categoría de error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "El nombre de la categoría es obligatorio" },
        { status: 400 }
      );
    }

    const newCategory = await prisma.driveErrorCategory.create({
      data: {
        name,
        description,
        color: color || "#6366F1", // Color por defecto si no se proporciona
      },
    });

    return NextResponse.json({ category: newCategory }, { status: 201 });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return NextResponse.json(
      {
        error: "Error interno al crear categoría",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
