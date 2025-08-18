import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";
import { z } from "zod";

const assignGroupsSchema = z.object({
  groupIds: z.array(z.string()).min(1, "At least one group ID is required"),
});

/**
 * POST /api/meet/spaces/[id]/assign-groups
 * Asigna grupos a un space específico
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
    const validation = assignGroupsSchema.safeParse(body);
    
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
    
    // Asignar grupos al space (esto también asignará automáticamente los tags por defecto)
    await storageService.assignGroupsToSpace(spaceId, groupIds, session.user.id);
    
    // Log de operación
    await storageService.logOperation(
      'assign_groups',
      spaceId,
      true,
      200,
      null,
      session.user.id
    );
    
    return NextResponse.json({ 
      success: true,
      message: `${groupIds.length} groups assigned successfully (with auto-tags)`,
      spaceId,
      groupIds
    });

  } catch (error: any) {
    console.error("Failed to assign groups:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error assigning groups",
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