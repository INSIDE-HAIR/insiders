import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";

/**
 * DELETE /api/meet/rooms/[id]/delete-from-db
 * Elimina el registro de nuestra base de datos SOLAMENTE
 * NO elimina el space de Google Meet API (eso sigue existiendo)
 */
export async function DELETE(
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

    // Eliminar de BD
    const deletedCount = await storageService.unregisterSpace(spaceId, session.user.id);
    
    // Log de la operación
    await storageService.logOperation(
      'delete_from_db',
      spaceId,
      true,
      200,
      null,
      session.user.id
    );

    console.log(`🗑️ Space removed from database: ${spaceId} (${deletedCount} records deleted)`);

    return NextResponse.json({
      success: true,
      spaceId,
      deletedCount,
      message: "Space removed from database successfully",
      note: "The Google Meet space still exists and can be accessed via its URL"
    });

  } catch (error: any) {
    console.error("Failed to delete space from database:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error deleting space from database",
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