import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { auth } from "../../../../../config/auth/auth";
import { z } from "zod";
import { DriveSyncService } from "../../../../../lib/services/driveSync";
import { GoogleDriveService } from "@drive/services/drive/GoogleDriveService";
import { FileAnalyzer } from "@drive/services/analyzer/fileAnalyzer";
import { HierarchyService } from "@drive/services/hierarchy/hierarchyService";

// Schema de validación para actualizar rutas
const updateRouteSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-\/]+$/, {
      message:
        "Slug can only contain lowercase letters, numbers, hyphens, and slashes",
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
  customSettings: z.record(z.any()).optional().default({}),
});

// GET /api/drive/management/[id] - Obtener una ruta específica
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

// PUT /api/drive/management/[id] - Actualizar una ruta
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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
        {
          error: "Validation error",
          details: {
            issues: validationResult.error.errors,
            formattedErrors: validationResult.error.format(),
          },
        },
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
        ...(body.customSettings !== undefined && {
          customSettings: body.customSettings || {},
        }),
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

    // Si se actualizaron los folderIds o se está activando una ruta, sincronizar automáticamente
    if (body.folderIds || (body.isActive === true && !existingRoute.isActive)) {
      try {
        // Inicializar servicios para sincronización
        const driveService = new GoogleDriveService();
        await driveService.initialize();
        const fileAnalyzer = new FileAnalyzer();
        const hierarchyService = new HierarchyService(
          driveService,
          fileAnalyzer
        );
        const syncService = new DriveSyncService(
          driveService,
          hierarchyService,
          prisma
        );

        // Sincronizar la ruta
        const syncResult = await syncService.syncRoute(params.id);

        // Devolver los datos actualizados después de la sincronización
        return NextResponse.json({
          ...updatedRoute,
          syncStatus: "success",
          syncResult,
        });
      } catch (syncError: any) {
        // Si hay error en la sincronización, devolver la ruta actualizada pero con mensaje de error
        console.error(
          "Error al sincronizar después de la actualización:",
          syncError
        );
        return NextResponse.json({
          ...updatedRoute,
          syncStatus: "error",
          syncError: syncError.message || "Error al sincronizar",
        });
      }
    }

    return NextResponse.json(updatedRoute);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error updating route" },
      { status: 500 }
    );
  }
}

// DELETE /api/drive/management/[id] - Eliminar una ruta
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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
