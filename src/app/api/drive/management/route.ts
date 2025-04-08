import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { auth } from "../../../../config/auth/auth";
import { z } from "zod";
import { DriveSyncService } from "../../../../lib/services/driveSync";
import { GoogleDriveService } from "../../../../features/drive/services/drive/GoogleDriveService";
import { FileAnalyzer } from "../../../../features/drive/services/analyzer/fileAnalyzer";
import { HierarchyService } from "../../../../features/drive/services/hierarchy/hierarchyService";
// Schema de validación para crear/actualizar rutas
const routeSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    }),
  folderIds: z.array(z.string()).min(1, {
    message: "At least one folder ID is required",
  }),
  title: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  customSettings: z.record(z.any()).optional(),
});

// GET /api/drive/management - Listar todas las rutas
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const routes = await prisma.driveRoute.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(routes);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error fetching routes" },
      { status: 500 }
    );
  }
}

// POST /api/drive/management - Crear una nueva ruta
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = routeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error },
        { status: 400 }
      );
    }

    const nextSyncDue = new Date();
    nextSyncDue.setHours(nextSyncDue.getHours() + 24);

    // Inicializar servicios
    const driveService = new GoogleDriveService();
    await driveService.initialize();
    const fileAnalyzer = new FileAnalyzer();
    const hierarchyService = new HierarchyService(driveService, fileAnalyzer);
    const syncService = new DriveSyncService(
      driveService,
      hierarchyService,
      prisma
    );

    try {
      // Crear la ruta con hierarchyData inicializado como array vacío
      const newRoute = await prisma.driveRoute.create({
        data: {
          slug: body.slug,
          folderIds: body.folderIds,
          title: body.title ?? null,
          subtitle: body.subtitle ?? null,
          description: body.description ?? null,
          hierarchyData: [], // Inicializar como array vacío
          nextSyncDue,
          createdById: session.user.id,
          customSettings: body.customSettings || {},
        },
      });

      // Registrar log de creación
      await prisma.driveRouteLog.create({
        data: {
          routeId: newRoute.id,
          operation: "create",
          success: true,
        },
      });

      // Realizar sincronización inicial
      try {
        const syncResult = await syncService.syncRoute(newRoute.id);

        // Procesar las relaciones de previewItems si hay datos
        if (Array.isArray(syncResult.route.hierarchyData)) {
          const processedHierarchy = hierarchyService.processPreviewItems(
            syncResult.route.hierarchyData
          );

          // Actualizar la ruta con la jerarquía procesada
          const updatedRoute = await prisma.driveRoute.update({
            where: { id: newRoute.id },
            data: {
              hierarchyData: JSON.parse(JSON.stringify(processedHierarchy)), // Convertir a objeto JSON plano
              lastUpdated: new Date(),
              lastSyncAttempt: new Date(),
            },
          });

          return NextResponse.json(updatedRoute, { status: 201 });
        }

        return NextResponse.json(syncResult.route, { status: 201 });
      } catch (syncError) {
        console.error("Error en sincronización inicial:", syncError);
        // Retornar la ruta creada incluso si falla la sincronización
        return NextResponse.json(newRoute, { status: 201 });
      }
    } catch (prismaError) {
      console.error("Prisma error:", prismaError);
      return NextResponse.json(
        {
          error: "Error creating route in database",
          details:
            prismaError instanceof Error
              ? prismaError.message
              : "Unknown prisma error",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("General error:", error);
    return NextResponse.json(
      { error: error.message || "Error creating route" },
      { status: 500 }
    );
  }
}
