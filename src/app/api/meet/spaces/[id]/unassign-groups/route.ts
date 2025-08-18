import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";
import { z } from "zod";

const unassignGroupsSchema = z.object({
  groupIds: z.array(z.string()).min(1, "At least one group ID is required"),
});

/**
 * POST /api/meet/spaces/[id]/unassign-groups
 * Desasigna grupos de un space específico
 */
export async function POST(
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

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const resolvedParams = await params;
    const spaceId = resolvedParams.id;
    
    // Parsear y validar body
    const body = await request.json();
    const validation = unassignGroupsSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Invalid data", 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { groupIds } = validation.data;
    storageService = new MeetStorageService();
    
    // Verificar que el space existe
    const space = await storageService.prisma.meetSpace.findFirst({
      where: { spaceId }
    });
    
    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }
    
    // Desasignar grupos del space
    const result = await storageService.prisma.meetSpaceGroup.deleteMany({
      where: {
        spaceId: space.id,
        groupId: { in: groupIds }
      }
    });
    
    // Opcional: También remover tags auto-asignados por estos grupos
    // (esto podría ser configurable según los requisitos del negocio)
    for (const groupId of groupIds) {
      const autoAssignedTags = await storageService.prisma.meetSpaceTag.findMany({
        where: {
          spaceId: space.id,
          isAutoAssigned: true,
          tag: {
            assignedToGroups: {
              some: {
                groupId: groupId
              }
            }
          }
        }
      });
      
      if (autoAssignedTags.length > 0) {
        await storageService.prisma.meetSpaceTag.deleteMany({
          where: {
            spaceId: space.id,
            tagId: { in: autoAssignedTags.map(t => t.tagId) },
            isAutoAssigned: true
          }
        });
        
        console.log(`🏷️ Removed ${autoAssignedTags.length} auto-assigned tags from space ${spaceId}`);
      }
    }
    
    // Log de operación
    await storageService.logOperation(
      'unassign_groups',
      spaceId,
      true,
      200,
      null,
      session.user.id
    );
    
    console.log(`📁 Unassigned ${result.count} groups from space ${spaceId}`);
    
    return NextResponse.json({ 
      success: true,
      message: `${result.count} groups unassigned successfully`,
      spaceId,
      groupIds,
      unassignedCount: result.count
    });

  } catch (error: any) {
    console.error("Failed to unassign groups:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error unassigning groups",
        details: error.stack 
      },
      { status: 500 }
    );
  } finally {
    if (storageService) {
      await storageService.disconnect();
    }
  }
}