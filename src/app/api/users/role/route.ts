import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

/**
 * GET: Obtener usuarios por rol
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const role = url.searchParams.get("role") || undefined;
    const rolesParam = url.searchParams.get("roles") || undefined;

    // Si se proporcionan múltiples roles en formato comma-separated
    const roles =
      rolesParam?.split(",").map((r) => r.trim().toUpperCase()) || undefined;

    // Crear condición de filtro
    const whereCondition: any = {};
    if (role) {
      whereCondition.role = role;
    } else if (roles && roles.length > 0) {
      whereCondition.role = {
        in: roles,
      };
    }

    const users = await prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      {
        error: "Error interno al obtener usuarios",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
