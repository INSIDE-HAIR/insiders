import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";
import { z } from "zod";

const assignTagsSchema = z.object({
  tagIds: z.array(z.string()).min(1, "At least one tag ID is required"),
});

/**
 * POST /api/meet/spaces/[id]/assign-tags
 * Asigna tags a un space específico
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
    const validation = assignTagsSchema.safeParse(body);
    
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
    
    // Asignar tags al space
    await storageService.assignTagsToSpace(spaceId, tagIds, session.user.id);
    
    // Log de operación
    await storageService.logOperation(
      'assign_tags',
      spaceId,
      true,
      200,
      null,
      session.user.id
    );
    
    return NextResponse.json({ 
      success: true,
      message: `${tagIds.length} tags assigned successfully`,
      spaceId,
      tagIds
    });

  } catch (error: any) {
    console.error("Failed to assign tags:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error assigning tags",
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