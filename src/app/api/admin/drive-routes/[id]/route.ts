import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { auth } from "../../../../../config/auth/auth";
import { z } from "zod";

// Schema de validación para actualizar rutas
const updateRouteSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    })
    .optional(),
  folderIds: z
    .array(z.string())
    .min(1, {
      message: "At least one folder ID is required",
    })
    .optional(),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  customSettings: z.record(z.any()).optional(),
});

// GET /api/admin/drive-routes/[id] - Obtener una ruta específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const route = await prisma.driveRoute.findUnique({
      where: { id: params.id },
    });

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    // Obtener logs de la ruta
    const logs = await prisma.driveRouteLog.findMany({
      where: { routeId: params.id },
      orderBy: { timestamp: "desc" },
      take: 10, // Últimos 10 logs
    });

    return NextResponse.json({ ...route, logs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error fetching route" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/drive-routes/[id] - Actualizar una ruta
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar que la ruta existe
    const existingRoute = await prisma.driveRoute.findUnique({
      where: { id: params.id },
    });

    if (!existingRoute) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    // Obtener y validar datos
    const body = await request.json();
    const validationResult = updateRouteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation error", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Si se actualiza el slug, verificar que no exista otro con ese slug
    if (body.slug && body.slug !== existingRoute.slug) {
      const slugExists = await prisma.driveRoute.findUnique({
        where: { slug: body.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: `Route with slug "${body.slug}" already exists` },
          { status: 400 }
        );
      }
    }

    // Actualizar la ruta
    const updatedRoute = await prisma.driveRoute.update({
      where: { id: params.id },
      data: {
        ...(body.slug && { slug: body.slug }),
        ...(body.folderIds && { folderIds: body.folderIds }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.subtitle !== undefined && { subtitle: body.subtitle }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.customSettings && { customSettings: body.customSettings }),
      },
    });

    // Registrar log de actualización
    await prisma.driveRouteLog.create({
      data: {
        routeId: params.id,
        operation: "update",
        success: true,
      },
    });

    return NextResponse.json(updatedRoute);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error updating route" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/drive-routes/[id] - Eliminar una ruta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar que la ruta existe
    const existingRoute = await prisma.driveRoute.findUnique({
      where: { id: params.id },
    });

    if (!existingRoute) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    // Eliminar logs asociados a la ruta
    await prisma.driveRouteLog.deleteMany({
      where: { routeId: params.id },
    });

    // Eliminar la ruta
    await prisma.driveRoute.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error deleting route" },
      { status: 500 }
    );
  }
}
