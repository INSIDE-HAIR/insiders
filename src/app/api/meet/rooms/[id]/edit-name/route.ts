import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";
import { z } from "zod";

const updateDisplayNameSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100, "Display name too long")
});

/**
 * PUT /api/meet/rooms/[id]/edit-name
 * Actualiza SOLO el displayName en nuestra base de datos (no en Google API)
 */
export async function PUT(
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
    if (!spaceId) {
      return NextResponse.json({ error: "Space ID is required" }, { status: 400 });
    }

    // Parsear y validar body
    const body = await request.json();
    const validation = updateDisplayNameSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Invalid data", 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { displayName } = validation.data;

    // Inicializar servicios
    storageService = new MeetStorageService();

    // Verificar que el space existe en nuestra BD
    const isRegistered = await storageService.isSpaceRegistered(spaceId);
    if (!isRegistered) {
      return NextResponse.json(
        { error: "Space not found in database" }, 
        { status: 404 }
      );
    }

    // Actualizar displayName en BD
    await storageService.updateSpaceDisplayName(spaceId, displayName);
    
    // Log de la operación
    await storageService.logOperation(
      'update_display_name',
      spaceId,
      true,
      200,
      null,
      session.user.id
    );

    console.log(`✅ Display name updated for space ${spaceId}: "${displayName}"`);

    return NextResponse.json({
      success: true,
      spaceId,
      displayName,
      message: "Display name updated successfully"
    });

  } catch (error: any) {
    console.error("Failed to update display name:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error updating display name",
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