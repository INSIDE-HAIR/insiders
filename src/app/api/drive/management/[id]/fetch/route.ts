import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { auth } from "../../../../../../config/auth/auth";
import { DriveSyncService } from "../../../../../../lib/services/driveSync";
import { GoogleDriveService } from "@drive/services/drive/GoogleDriveService";
import { FileAnalyzer } from "@drive/services/analyzer/fileAnalyzer";
import { HierarchyService } from "@drive/services/hierarchy/hierarchyService";

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar que la ruta existe
    const route = await prisma.driveRoute.findUnique({
      where: { id: params.id },
    });

    if (!route) {
      return NextResponse.json(
        { error: "Ruta no encontrada" },
        { status: 404 }
      );
    }

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

    // Sincronizar la ruta
    const result = await syncService.syncRoute(params.id);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al sincronizar ruta" },
      { status: 500 }
    );
  }
}
