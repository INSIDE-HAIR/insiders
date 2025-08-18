import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";

/**
 * GET /api/meet/spaces/[id]/assignments
 * Obtiene todas las asignaciones de tags y grupos de un space específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let storageService: MeetStorageService | null = null;
  
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const resolvedParams = await params;
    const spaceId = resolvedParams.id;
    
    storageService = new MeetStorageService();
    
    // Verificar que el space existe y obtener sus asignaciones
    const space = await storageService.prisma.meetSpace.findFirst({
      where: { spaceId },
      include: {
        spaceTags: {
          include: {
            tag: true
          }
        },
        spaceGroups: {
          include: {
            group: true
          }
        }
      }
    });
    
    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }
    
    // Formatear respuesta
    const assignedTags = space.spaceTags.map(st => ({
      ...st.tag,
      isAutoAssigned: st.isAutoAssigned,
      assignedAt: st.createdAt,
      assignedBy: st.createdBy
    }));
    
    const assignedGroups = space.spaceGroups.map(sg => ({
      ...sg.group,
      assignedAt: sg.createdAt,
      assignedBy: sg.createdBy
    }));
    
    return NextResponse.json({
      space: {
        id: space.id,
        spaceId: space.spaceId,
        displayName: space.displayName
      },
      assignedTags,
      assignedGroups,
      counts: {
        tags: assignedTags.length,
        groups: assignedGroups.length,
        autoAssignedTags: assignedTags.filter(t => t.isAutoAssigned).length
      }
    });

  } catch (error: any) {
    console.error("Failed to get space assignments:", error);
    
    return NextResponse.json({
      error: "Error getting space assignments",
      details: error.message
    }, { status: 500 });
  } finally {
    if (storageService) {
      await storageService.disconnect();
    }
  }
}