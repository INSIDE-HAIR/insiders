import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

// GET /api/drive-routes/[slug]
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    // Buscar ruta en la base de datos
    const route = await prisma.driveRoute.findUnique({
      where: { slug, isActive: true },
    });

    // Si no existe, devolver 404
    if (!route) {
      return NextResponse.json(
        { error: "Ruta no encontrada" },
        { status: 404 }
      );
    }

    // Incrementar contador de visitas
    await prisma.driveRoute.update({
      where: { id: route.id },
      data: { viewCount: { increment: 1 } },
    });

    // Devolver la ruta encontrada
    return NextResponse.json(route);
  } catch (error) {
    console.error("Error al buscar ruta:", error);
    return NextResponse.json(
      { error: "Error al buscar la ruta" },
      { status: 500 }
    );
  }
}
