import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/src/config/auth/auth';
import prisma from "@/src/lib/prisma";
export const dynamic = "force-dynamic";

/**
 * GET: Obtener usuarios por rol
 */
export async function GET(request: NextRequest) {
  try {
    // Use auth() instead of getToken() for consistency
    const session = await auth();

    console.log('🔍 Session received:', {
      exists: !!session,
      email: session?.user?.email,
      role: session?.user?.role,
      id: session?.user?.id
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userRole = (session.user.role || 'CLIENT').toUpperCase();
    console.log(`📋 Checking role: ${userRole} for user ${session.user.email}`);
    
    // Verificar si el usuario tiene permisos (ADMIN o EMPLOYEE)
    if (userRole !== 'ADMIN' && userRole !== 'EMPLOYEE') {
      console.log(`❌ User ${session.user.email} with role ${session.user.role} denied access`);
      return NextResponse.json(
        { error: 'Admin or Employee access required', role: session.user.role },
        { status: 403 }
      );
    }

    const user = {
      id: session.user.id,
      email: session.user.email,
      role: userRole
    };

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
}
