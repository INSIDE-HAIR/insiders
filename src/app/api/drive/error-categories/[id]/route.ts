import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

/**
 * GET: Obtener una categoría por su ID
 */
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = params.id;
    const category = await prisma.driveErrorCategory.findUnique({
      where: { id },
      include: {
        reports: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    return NextResponse.json(
      {
        error: "Error interno al obtener categoría",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Actualizar una categoría por su ID
 */
export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = params.id;
    const body = await request.json();
    const { name, description, color } = body;

    // Validar que existe la categoría
    const existingCategory = await prisma.driveErrorCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    // Validar datos
    if (name === "") {
      return NextResponse.json(
        { error: "El nombre de la categoría no puede estar vacío" },
        { status: 400 }
      );
    }

    // Actualizar solo los campos proporcionados
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;

    const updatedCategory = await prisma.driveErrorCategory.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ category: updatedCategory });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    return NextResponse.json(
      {
        error: "Error interno al actualizar categoría",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Eliminar una categoría por su ID
 */
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = params.id;

    // Verificar si existen reportes que usan esta categoría
    const reportsWithCategory = await prisma.driveErrorReport.count({
      where: { category: id },
    });

    if (reportsWithCategory > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar esta categoría porque está siendo utilizada en reportes",
          reportsCount: reportsWithCategory,
        },
        { status: 400 }
      );
    }

    await prisma.driveErrorCategory.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Categoría eliminada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return NextResponse.json(
      {
        error: "Error interno al eliminar categoría",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
