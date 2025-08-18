import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";
import { z } from "zod";

const bulkDeleteSchema = z.object({
  spaceIds: z.array(z.string().min(1)).min(1, "At least one space ID is required").max(50, "Maximum 50 spaces per bulk operation")
});

/**
 * POST /api/meet/rooms/bulk-delete
 * Elimina múltiples espacios de nuestra base de datos
 * NO elimina los spaces de Google Meet API
 */
export async function POST(request: NextRequest) {
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

    // Parsear y validar body
    const body = await request.json();
    const validation = bulkDeleteSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Invalid data", 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { spaceIds } = validation.data;

    // Inicializar servicios
    storageService = new MeetStorageService();

    const results = {
      success: [],
      failed: [],
      totalDeleted: 0
    } as {
      success: string[];
      failed: Array<{ spaceId: string; error: string }>;
      totalDeleted: number;
    };

    // Procesar cada space
    for (const spaceId of spaceIds) {
      try {
        // Verificar existencia
        const isRegistered = await storageService.isSpaceRegistered(spaceId);
        if (!isRegistered) {
          results.failed.push({
            spaceId,
            error: "Space not found in database"
          });
          continue;
        }

        // Eliminar
        const deletedCount = await storageService.unregisterSpace(spaceId, session.user.id);
        results.totalDeleted += (deletedCount ? 1 : 0);
        results.success.push(spaceId);
        
        // Log
        await storageService.logOperation(
          'bulk_delete_from_db',
          spaceId,
          true,
          200,
          null,
          session.user.id
        );

      } catch (error: any) {
        results.failed.push({
          spaceId,
          error: error.message || "Unknown error"
        });
        
        // Log error
        await storageService.logOperation(
          'bulk_delete_from_db',
          spaceId,
          false,
          500,
          error.message,
          session.user.id
        );
      }
    }

    console.log(`🗑️ Bulk delete completed: ${results.success.length} success, ${results.failed.length} failed`);

    // Determinar status code
    const statusCode = results.failed.length > 0 ? 207 : 200; // 207 Multi-Status si hay errores parciales

    return NextResponse.json({
      success: results.success.length > 0,
      results,
      summary: {
        requested: spaceIds.length,
        deleted: results.success.length,
        failed: results.failed.length,
        totalRecordsDeleted: results.totalDeleted
      },
      message: results.failed.length === 0 ? 
        "All spaces deleted successfully" : 
        "Bulk delete completed with some errors",
      note: "Google Meet spaces still exist and can be accessed via their URLs"
    }, { status: statusCode });

  } catch (error: any) {
    console.error("Failed to bulk delete spaces:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error in bulk delete operation",
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