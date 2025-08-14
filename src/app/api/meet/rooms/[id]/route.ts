import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleMeetService } from "@/src/features/calendar/services/GoogleMeetService";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { z } from "zod";

// Schema para actualizar un space
const updateSpaceSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100, "Display name too long").optional(),
  config: z.object({
    accessType: z.enum(["OPEN", "TRUSTED", "RESTRICTED"]).optional(),
    
    // Configuraciones de grabación
    recordingConfig: z.object({
      autoRecordingGeneration: z.enum(["ON", "OFF"])
    }).optional(),
    
    // Configuraciones de transcripción
    transcriptionConfig: z.object({
      autoTranscriptionGeneration: z.enum(["ON", "OFF"])
    }).optional(),
    
    // Configuraciones de notas inteligentes
    smartNotesConfig: z.object({
      autoSmartNotesGeneration: z.enum(["ON", "OFF"])
    }).optional(),
    
    // Configuraciones adicionales
    moderationRestrictions: z.object({
      chatRestriction: z.enum(["HOSTS_ONLY", "NO_RESTRICTION"]).optional(),
      presentRestriction: z.enum(["HOSTS_ONLY", "NO_RESTRICTION"]).optional(),
      defaultJoinAsViewerType: z.enum(["ON", "OFF"]).optional()
    }).optional()
  }).optional()
});

/**
 * GET /api/meet/rooms/[id]
 * Obtiene detalles de un space/sala específica de Meet
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const spaceId = params.id;
    if (!spaceId) {
      return NextResponse.json({ error: "Space ID is required" }, { status: 400 });
    }

    // Inicializar servicios
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();
    
    const meetService = new GoogleMeetService(calendarService.auth);

    // Obtener token
    const token = await calendarService.auth.getAccessToken();
    if (!token.token) {
      return NextResponse.json({ error: "No access token available" }, { status: 500 });
    }

    // Obtener detalles del space
    const spaceResponse = await fetch(`https://meet.googleapis.com/v2/spaces/${spaceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Accept': 'application/json'
      }
    });

    if (!spaceResponse.ok) {
      const errorText = await spaceResponse.text();
      console.error(`Failed to get Meet space: ${spaceResponse.status}`, errorText);
      
      return NextResponse.json({
        error: `Failed to get Meet space: ${spaceResponse.status} ${spaceResponse.statusText}`,
        details: errorText
      }, { status: spaceResponse.status });
    }

    const spaceData = await spaceResponse.json();

    // Enriquecer con información de miembros
    try {
      const members = await meetService.getSpaceMembers(spaceId);
      spaceData.members = members;
    } catch (error) {
      console.error(`Error fetching members for space ${spaceId}:`, error);
      spaceData.members = [];
    }

    return NextResponse.json(spaceData);

  } catch (error: any) {
    console.error("Failed to get Meet space:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error getting Meet space",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/meet/rooms/[id]
 * Actualiza configuraciones de un space/sala de Meet
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const spaceId = params.id;
    if (!spaceId) {
      return NextResponse.json({ error: "Space ID is required" }, { status: 400 });
    }

    // Parsear y validar body
    const body = await request.json();
    const validationResult = updateSpaceSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid update data", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Inicializar servicios
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    // Obtener token
    const token = await calendarService.auth.getAccessToken();
    if (!token.token) {
      return NextResponse.json({ error: "No access token available" }, { status: 500 });
    }

    // Construir query parameters para campos específicos
    const updateMask = [];
    if (updateData.displayName) updateMask.push('displayName');
    if (updateData.config) {
      if (updateData.config.accessType) updateMask.push('config.accessType');
      if (updateData.config.recordingConfig) updateMask.push('config.recordingConfig');
      if (updateData.config.transcriptionConfig) updateMask.push('config.transcriptionConfig');
      if (updateData.config.smartNotesConfig) updateMask.push('config.smartNotesConfig');
      if (updateData.config.moderationRestrictions) updateMask.push('config.moderationRestrictions');
    }

    // Actualizar el space
    const updateResponse = await fetch(
      `https://meet.googleapis.com/v2/spaces/${spaceId}?updateMask=${updateMask.join(',')}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token.token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(`Failed to update Meet space: ${updateResponse.status}`, errorText);
      
      return NextResponse.json({
        error: `Failed to update Meet space: ${updateResponse.status} ${updateResponse.statusText}`,
        details: errorText
      }, { status: updateResponse.status });
    }

    const updatedSpace = await updateResponse.json();
    console.log('✅ Meet space updated:', updatedSpace);

    return NextResponse.json(updatedSpace);

  } catch (error: any) {
    console.error("Failed to update Meet space:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error updating Meet space",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/meet/rooms/[id]
 * Elimina un space/sala de Meet (marca como eliminado)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const spaceId = params.id;
    if (!spaceId) {
      return NextResponse.json({ error: "Space ID is required" }, { status: 400 });
    }

    // Inicializar servicios
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();

    // Obtener token
    const token = await calendarService.auth.getAccessToken();
    if (!token.token) {
      return NextResponse.json({ error: "No access token available" }, { status: 500 });
    }

    // Nota: Meet API v2 Beta no soporta DELETE directo
    // En su lugar, podemos marcar el space como inactivo o restringir acceso
    const endSpaceResponse = await fetch(
      `https://meet.googleapis.com/v2/spaces/${spaceId}:endActiveConference`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      }
    );

    if (!endSpaceResponse.ok) {
      const errorText = await endSpaceResponse.text();
      console.error(`Failed to end Meet space: ${endSpaceResponse.status}`, errorText);
      
      // Si el endpoint no existe o no es compatible, devolver 501 Not Implemented
      if (endSpaceResponse.status === 404 || endSpaceResponse.status === 405) {
        return NextResponse.json({
          error: "Delete operation not supported by Meet API v2 Beta",
          details: "Meet spaces cannot be permanently deleted via API. Consider restricting access instead."
        }, { status: 501 });
      }
      
      return NextResponse.json({
        error: `Failed to delete Meet space: ${endSpaceResponse.status} ${endSpaceResponse.statusText}`,
        details: errorText
      }, { status: endSpaceResponse.status });
    }

    const result = await endSpaceResponse.json();
    console.log('✅ Meet space conference ended:', result);

    return NextResponse.json({ 
      message: "Meet space conference ended successfully",
      data: result 
    });

  } catch (error: any) {
    console.error("Failed to delete Meet space:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error deleting Meet space",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}