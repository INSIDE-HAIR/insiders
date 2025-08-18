import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";
import { z } from "zod";

const unassignTagsSchema = z.object({
  tagIds: z.array(z.string()).min(1, "At least one tag ID is required"),
});

/**
 * POST /api/meet/spaces/[id]/unassign-tags
 * Desasigna tags de un space específico
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
    const validation = unassignTagsSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Invalid data", 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { tagIds } = validation.data;
    storageService = new MeetStorageService();
    
    // Verificar que el space existe
    const space = await storageService.prisma.meetSpace.findFirst({
      where: { spaceId }
    });
    
    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }
    
    // Desasignar tags del space
    const result = await storageService.prisma.meetSpaceTag.deleteMany({
      where: {
        spaceId: space.id,
        tagId: { in: tagIds }
      }
    });
    
    // Log de operación
    await storageService.logOperation(
      'unassign_tags',
      spaceId,
      true,
      200,
      null,
      session.user.id
    );
    
    console.log(`🏷️ Unassigned ${result.count} tags from space ${spaceId}`);
    
    return NextResponse.json({ 
      success: true,
      message: `${result.count} tags unassigned successfully`,
      spaceId,
      tagIds,
      unassignedCount: result.count
    });

  } catch (error: any) {
    console.error("Failed to unassign tags:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error unassigning tags",
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