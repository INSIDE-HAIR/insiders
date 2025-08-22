import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";

/**
 * GET /api/meet/rooms/filter-options
 * Devuelve opciones disponibles para filtros avanzados
 */
export async function GET(request: NextRequest) {
  let storageService: MeetStorageService | null = null;

  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    // Inicializar servicios
    storageService = new MeetStorageService();

    // Obtener opciones de filtro desde el almacenamiento
    const filterOptions = await storageService.getFilterOptions();

    return NextResponse.json({
      tags: filterOptions.tags || [],
      groups: filterOptions.groups || [],
      users: filterOptions.users || [],
      source: "storage",
    });
  } catch (error: any) {
    console.error("Failed to get filter options:", error);

    // Return empty options instead of error to prevent UI breaking
    return NextResponse.json({
      tags: [],
      groups: [],
      users: [],
      error: error.message,
      source: "fallback",
    });
  } finally {
    if (storageService) {
      await storageService.disconnect();
    }
  }
}