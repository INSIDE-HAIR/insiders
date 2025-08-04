import { NextRequest, NextResponse } from "next/server";
import { adminApiRoute } from "@/src/middleware/api-access-control";
import prisma from "@/src/lib/prisma";
export const dynamic = "force-dynamic";

/**
 * GET: Obtener usuarios por rol
 */
export const GET = adminApiRoute(async (request: NextRequest, user) => {
  try {
    console.log(`✅ Admin ${user.email} requesting users by role`);
    
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

    console.log(`📊 Retrieved ${users.length} users by role for admin ${user.email}`);
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
});
