import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";
import { MeetMembersService } from "@/src/features/meet/services/MeetMembersService";
import { z } from "zod";

// Schema para agregar un miembro
const addMemberSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.enum(["ROLE_UNSPECIFIED", "COHOST"]).default("ROLE_UNSPECIFIED")
});

// Schema para la respuesta de miembro según Google Meet API v2
const memberResponseSchema = z.object({
  name: z.string(), // formato: "spaces/{space_id}/members/{member_id}"
  email: z.string().email(),
  role: z.enum(["ROLE_UNSPECIFIED", "COHOST"]),
  user: z.object({
    id: z.string().optional()
  }).optional(),
  createTime: z.string().optional()
});

// Schema para bulk add members
const bulkAddMembersSchema = z.object({
  members: z.array(addMemberSchema).min(1, "At least one member is required").max(50, "Maximum 50 members at once")
});

// Schema para listar miembros con filtros
const listMembersSchema = z.object({
  pageSize: z.number().min(1).max(100).default(25),
  pageToken: z.string().optional(),
  fields: z.string().default("name,email,role,user") // Campos por defecto según la API
});

/**
 * GET /api/meet/rooms/[id]/members
 * Lista miembros SOLO con llamadas FRESCAS a Google Meet API v2beta
 * No almacena datos - todo viene directo de la API
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

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { id: spaceId } = await params;
    if (!spaceId) {
      return NextResponse.json({ error: "Space ID is required" }, { status: 400 });
    }

    // Parsear query parameters
    const { searchParams } = new URL(request.url);
    const queryParams: any = Object.fromEntries(searchParams.entries());
    
    // Convertir tipos
    if (queryParams.pageSize) {
      queryParams.pageSize = parseInt(queryParams.pageSize);
    }

    const validationResult = listMembersSchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Verificar que el space esté registrado localmente (solo para validación)
    storageService = new MeetStorageService();
    const isRegistered = await storageService.isSpaceRegistered(spaceId);
    
    if (!isRegistered) {
      return NextResponse.json({ 
        error: "Space not found", 
        details: "Space no encontrado en registro local" 
      }, { status: 404 });
    }

    // Inicializar servicios de API
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();
    const membersService = new MeetMembersService(calendarService.auth);
    
    console.log(`🆙 Fetching FRESH members for space ${spaceId} from Meet API v2beta`);
    
    // LLAMADA FRESCA A GOOGLE MEET API v2beta
    const membersResponse = await membersService.listMembers(spaceId, {
      pageSize: validationResult.data.pageSize,
      pageToken: validationResult.data.pageToken,
      fields: validationResult.data.fields
    });
    
    // Enriquecer con información adicional para frontend
    const enrichedMembers = membersResponse.members.map((member: any) => ({
      ...member,
      // Campos calculados
      isCohost: member.role === 'COHOST',
      joinedAt: member.createTime || null,
      // Según la API oficial, el email viene directamente en member.email
      displayName: member.email ? member.email.split('@')[0] : 'Usuario anónimo',
      // Metadata
      source: 'fresh-meet-api-v2beta'
    }));
    
    // Log de la operación (solo para auditoria)
    await storageService.logOperation(
      'get_members',
      spaceId,
      true,
      200,
      null,
      session.user.id
    );

    console.log(`✅ Retrieved ${enrichedMembers.length} FRESH members for space ${spaceId}`);

    return NextResponse.json({
      spaceId: spaceId,
      members: enrichedMembers,
      totalMembers: enrichedMembers.length,
      nextPageToken: membersResponse.nextPageToken,
      source: membersResponse._limitation ? "developer-preview-required" : "fresh-meet-api-v2beta",
      note: membersResponse._limitation || "Datos frescos directos de Google Meet API v2beta",
      limitation: membersResponse._limitation,
      previewLink: membersResponse._link,
      _metadata: {
        apiSuccess: true,
        localFallback: false,
        lastFetched: new Date().toISOString(),
        previewRequired: !!membersResponse._limitation
      }
    });

  } catch (error: any) {
    console.error("Failed to list Meet space members:", error);
    
    // Si falla la API, devolver error limpio (no fallback local)
    return NextResponse.json({
      spaceId: params.id,
      members: [],
      error: "Error fetching members from Meet API",
      details: error.message,
      source: "error",
      _metadata: {
        apiSuccess: false,
        localFallback: false,
        errorType: 'api-failure'
      }
    }, { status: 500 });
    
  } finally {
    if (storageService) {
      await storageService.disconnect();
    }
  }
}

/**
 * POST /api/meet/rooms/[id]/members
 * Agrega miembros SOLO via API - no almacena datos localmente
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

    const { id: spaceId } = await params;
    if (!spaceId) {
      return NextResponse.json({ error: "Space ID is required" }, { status: 400 });
    }

    // Parsear y validar body
    const body = await request.json();
    
    // Detectar si es bulk add o single add
    const isBulkAdd = body.members && Array.isArray(body.members);
    
    let validationResult;
    if (isBulkAdd) {
      validationResult = bulkAddMembersSchema.safeParse(body);
    } else {
      validationResult = addMemberSchema.safeParse(body);
    }
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid member data", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    // Preparar lista de miembros a agregar
    const membersToAdd = isBulkAdd ? validationResult.data.members : [validationResult.data];

    // Verificar que el space esté registrado localmente (solo para validación)
    storageService = new MeetStorageService();
    const isRegistered = await storageService.isSpaceRegistered(spaceId);
    
    if (!isRegistered) {
      return NextResponse.json({ 
        error: "Space not found", 
        details: "Space no encontrado en registro local" 
      }, { status: 404 });
    }
    
    // Inicializar servicios de API
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();
    const membersService = new MeetMembersService(calendarService.auth);

    console.log(`👥 Adding ${membersToAdd.length} member(s) to space ${spaceId} via FRESH API calls`);

    // AGREGAR MIEMBROS VIA GOOGLE MEET API v2beta
    let result;
    if (isBulkAdd) {
      result = await membersService.bulkCreateMembers(spaceId, membersToAdd, {
        batchDelay: 150,
        continueOnError: true,
        fields: 'name,email,role'
      });
    } else {
      try {
        const createdMember = await membersService.createMember(
          spaceId, 
          membersToAdd[0], 
          'name,email,role'
        );
        result = {
          successes: [createdMember],
          failures: []
        };
      } catch (error) {
        // Detectar si es limitación de Developer Preview
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isPreviewLimitation = errorMessage.includes('Developer Preview access');
        
        result = {
          successes: [],
          failures: [{ 
            member: membersToAdd[0], 
            error: errorMessage,
            previewRequired: isPreviewLimitation
          }]
        };
      }
    }
    
    // Log de la operación (solo para auditoria)
    await storageService.logOperation(
      'add_members',
      spaceId,
      result.successes.length > 0,
      result.successes.length > 0 ? 201 : 500,
      result.failures.length > 0 ? `${result.failures.length} failures` : null,
      session.user.id
    );

    console.log(`📊 Members: ${result.successes.length} added, ${result.failures.length} failed`);

    // Detectar si hay limitaciones de Developer Preview
    const hasPreviewLimitation = result.failures.some((f: any) => f.previewRequired);
    
    // Preparar respuesta informativa
    return NextResponse.json({
      spaceId: spaceId,
      addedMembers: result.successes,
      totalAdded: result.successes.length,
      totalFailed: result.failures.length,
      failures: result.failures,
      message: hasPreviewLimitation 
        ? "Google Meet API v2beta Members requiere acceso Developer Preview"
        : `${result.successes.length} miembro(s) agregado(s) exitosamente via API`,
      source: hasPreviewLimitation ? "developer-preview-required" : "fresh-meet-api-v2beta",
      note: hasPreviewLimitation 
        ? "Endpoints de members requieren inscripción en programa de preview"
        : "Miembros agregados directamente via Google Meet API v2beta",
      previewLink: hasPreviewLimitation ? "https://developers.google.com/workspace/preview" : undefined,
      _metadata: {
        apiSuccess: result.successes.length > 0,
        localStorage: false,
        bulkOperation: isBulkAdd,
        totalRequested: membersToAdd.length,
        previewRequired: hasPreviewLimitation
      }
    }, { status: hasPreviewLimitation ? 202 : (result.successes.length > 0 ? 201 : 500) });

  } catch (error: any) {
    console.error("Failed to add Meet space members:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error adding Meet space members",
        details: error.stack,
        source: "error"
      },
      { status: 500 }
    );
  } finally {
    if (storageService) {
      await storageService.disconnect();
    }
  }
}

/**
 * DELETE /api/meet/rooms/[id]/members?email=user@example.com
 * Elimina un miembro SOLO via API - no modifica datos locales
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

    const { id: spaceId } = await params;
    if (!spaceId) {
      return NextResponse.json({ error: "Space ID is required" }, { status: 400 });
    }

    // Obtener email del query parameter
    const { searchParams } = new URL(request.url);
    const memberEmail = searchParams.get('email');
    
    if (!memberEmail) {
      return NextResponse.json({ error: "Member email is required" }, { status: 400 });
    }

    // Validar email
    const emailSchema = z.string().email();
    const emailValidation = emailSchema.safeParse(memberEmail);
    if (!emailValidation.success) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Verificar que el space esté registrado localmente (solo para validación)
    storageService = new MeetStorageService();
    const isRegistered = await storageService.isSpaceRegistered(spaceId);
    
    if (!isRegistered) {
      return NextResponse.json({ 
        error: "Space not found", 
        details: "Space no encontrado en registro local" 
      }, { status: 404 });
    }

    // Inicializar servicios de API
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();
    const membersService = new MeetMembersService(calendarService.auth);

    console.log(`👤❌ Deleting member ${memberEmail} from space ${spaceId} via FRESH API`);

    // 1. BUSCAR MIEMBRO POR EMAIL VIA API
    const targetMember = await membersService.findMemberByEmail(spaceId, memberEmail);

    if (!targetMember) {
      return NextResponse.json({ 
        error: "Member not found in space",
        details: `No member with email ${memberEmail} found in space ${spaceId}`
      }, { status: 404 });
    }

    // 2. EXTRAER MEMBER ID
    const memberId = membersService.extractMemberId(targetMember.name);
    if (!memberId) {
      return NextResponse.json({ 
        error: "Invalid member ID",
        details: "Could not extract member ID from member data"
      }, { status: 400 });
    }

    // 3. ELIMINAR VIA API
    await membersService.deleteMember(spaceId, memberId);

    // Log de la operación (solo para auditoria)
    await storageService.logOperation(
      'delete_member',
      spaceId,
      true,
      200,
      null,
      session.user.id
    );

    console.log(`✅ Member removed: ${memberEmail} from space ${spaceId}`);

    return NextResponse.json({ 
      message: "Member removed successfully via API",
      memberEmail: memberEmail,
      memberId: memberId,
      spaceId: spaceId,
      source: "fresh-meet-api-v2beta",
      note: "Miembro eliminado directamente via Google Meet API v2beta",
      _metadata: {
        apiSuccess: true,
        localStorage: false
      }
    });

  } catch (error: any) {
    console.error("Failed to delete Meet space member:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error deleting Meet space member",
        details: error.stack,
        source: "error"
      },
      { status: 500 }
    );
  } finally {
    if (storageService) {
      await storageService.disconnect();
    }
  }
}