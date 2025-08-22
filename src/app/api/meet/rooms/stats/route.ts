import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";

/**
 * GET /api/meet/rooms/stats
 * Devuelve estadísticas filtradas de salas
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

    // Obtener parámetros de filtro
    const { searchParams } = new URL(request.url);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const groups = searchParams.get('groups')?.split(',').filter(Boolean) || [];
    const users = searchParams.get('users')?.split(',').filter(Boolean) || [];
    const activity = searchParams.get('activity');
    const hasRecordings = searchParams.get('recordings');
    const hasTranscripts = searchParams.get('transcripts');
    const minMembers = searchParams.get('minMembers');
    const maxMembers = searchParams.get('maxMembers');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Inicializar servicios
    storageService = new MeetStorageService();

    // Por ahora, devolver estadísticas básicas
    // En el futuro, esto debería hacer consultas filtradas más complejas
    const basicStats = await storageService.getStats();

    const stats = {
      totalRooms: basicStats.totalSpaces || 0,
      filteredRooms: basicStats.totalSpaces || 0, // TODO: aplicar filtros
      activeRooms: 0, // TODO: contar rooms activos
      roomsWithRecordings: 0, // TODO: contar rooms con grabaciones
      roomsWithTranscripts: 0, // TODO: contar rooms con transcripciones
      avgMembersPerRoom: 0, // TODO: calcular promedio de miembros
      appliedFilters: {
        tags: tags.length,
        groups: groups.length,
        users: users.length,
        activity,
        hasRecordings,
        hasTranscripts,
        memberRange: minMembers || maxMembers ? { min: minMembers, max: maxMembers } : null,
        dateRange: fromDate || toDate ? { from: fromDate, to: toDate } : null,
      }
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Failed to get filter stats:", error);

    // Return basic stats instead of error to prevent UI breaking
    return NextResponse.json({
      totalRooms: 0,
      filteredRooms: 0,
      activeRooms: 0,
      roomsWithRecordings: 0,
      roomsWithTranscripts: 0,
      avgMembersPerRoom: 0,
      error: error.message,
      source: "fallback",
    });
  } finally {
    if (storageService) {
      await storageService.disconnect();
    }
  }
}