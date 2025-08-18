import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleMeetService } from "@/src/features/calendar/services/GoogleMeetService";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";
import {
  CreateSpaceSchema,
  generateTemplateConfig,
  MeetingTemplateEnum,
  SpaceConfigSchema
} from "@/src/features/meet/validations/SpaceConfigSchema";
import { z } from "zod";

// Schema para aplicar plantillas rápidas
const applyTemplateSchema = z.object({
  template: MeetingTemplateEnum,
  customConfig: SpaceConfigSchema.optional()
});

// Schema para listar spaces
const listSpacesSchema = z.object({
  pageSize: z.number().min(1).max(100).default(25),
  pageToken: z.string().optional(),
  filter: z.string().optional()
});

/**
 * GET /api/meet/rooms
 * Devuelve spaces desde almacenamiento local (solución a limitación API v2)
 */
export async function GET(request: NextRequest) {
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

    // Parsear query parameters
    const { searchParams } = new URL(request.url);
    const queryParams: any = Object.fromEntries(searchParams.entries());
    
    // Convertir tipos
    if (queryParams.pageSize) {
      queryParams.pageSize = parseInt(queryParams.pageSize);
    }

    const validationResult = listSpacesSchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Inicializar servicio de almacenamiento local
    storageService = new MeetStorageService();
    
    console.log('📦 Fetching Meet spaces from local storage...');
    
    // Obtener spaces desde almacenamiento local
    const localSpaces = await storageService.getAllSpaces();
    
    // Transformar al formato esperado por el frontend
    const transformedSpaces = localSpaces.map(space => ({
      name: space.name || `spaces/${space.spaceId}`,
      spaceId: space.spaceId,
      meetingUri: space.meetingUri,
      meetingCode: space.meetingCode,
      config: space.config,
      members: space.members || [],
      activeConference: {
        // TODO: Implementar detección de conferencias activas
        conferenceRecord: null
      },
      // Metadatos adicionales
      _metadata: {
        createdAt: space.createdAt,
        lastSyncAt: space.lastSyncAt,
        source: 'local-storage'
      }
    }));
    
    // Obtener estadísticas
    const stats = await storageService.getStats();
    
    console.log(`✅ Retrieved ${transformedSpaces.length} spaces from local storage`);
    
    return NextResponse.json({
      spaces: transformedSpaces,
      nextPageToken: null, // No paginación por ahora
      stats: stats,
      source: "local-storage",
      note: "Meet API v2 no soporta listado. Usando almacenamiento local híbrido.",
      documentation: "https://developers.google.com/workspace/meet/api/reference/rest/v2/spaces"
    });

  } catch (error: any) {
    console.error("Failed to list Meet spaces from local storage:", error);
    
    // Fallback a respuesta vacía en caso de error
    return NextResponse.json({
      spaces: [],
      error: "Error listing Meet spaces",
      details: error.message,
      fallback: true,
      source: "error-fallback"
    }, { status: 500 });
  } finally {
    // Cerrar conexión de base de datos
    if (storageService) {
      await storageService.disconnect();
    }
  }
}

/**
 * POST /api/meet/rooms
 * Crea un nuevo space/sala de Meet
 */
export async function POST(request: NextRequest) {
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
    
    // Detectar si usa plantilla o configuración personalizada
    const isTemplate = body.template && typeof body.template === 'string';
    
    let validationResult;
    let spaceData;
    
    if (isTemplate) {
      // Validar plantilla
      const templateResult = applyTemplateSchema.safeParse(body);
      if (!templateResult.success) {
        return NextResponse.json(
          { error: "Invalid template data", details: templateResult.error.errors },
          { status: 400 }
        );
      }
      
      // Generar configuración desde plantilla
      const templateConfig = generateTemplateConfig(templateResult.data.template);
      const finalConfig = {
        ...templateConfig,
        ...templateResult.data.customConfig
      };
      
      spaceData = {
        displayName: body.displayName,
        config: finalConfig,
        initialMembers: body.initialMembers || [],
        _template: templateResult.data.template
      };
      
      validationResult = { success: true, data: spaceData };
    } else {
      // Validar configuración personalizada
      validationResult = CreateSpaceSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "Invalid space data", details: validationResult.error.errors },
          { status: 400 }
        );
      }
      spaceData = validationResult.data;
    }
    
    // spaceData ya está preparado arriba

    // Inicializar servicios
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();
    
    const meetService = new GoogleMeetService(calendarService.auth);
    const spaceConfigService = new MeetSpaceConfigService(calendarService.auth);
    const membersService = new MeetMembersService(calendarService.auth);

    // Obtener token
    const token = await calendarService.auth.getAccessToken();
    if (!token.token) {
      return NextResponse.json({ error: "No access token available" }, { status: 500 });
    }

    // Preparar data para Meet API v2 con configuración completa
    const meetSpaceData: any = {
      ...(spaceData.displayName && { displayName: spaceData.displayName })
    };
    
    // Construir config object para Meet API
    if (spaceData.config) {
      meetSpaceData.config = {};
      
      // Configuración de acceso
      if (spaceData.config.accessType) {
        meetSpaceData.config.accessType = spaceData.config.accessType;
      }
      
      if (spaceData.config.entryPointAccess) {
        meetSpaceData.config.entryPointAccess = spaceData.config.entryPointAccess;
      }
      
      // Moderación
      if (spaceData.config.moderation) {
        meetSpaceData.config.moderation = spaceData.config.moderation;
      }
      
      if (spaceData.config.moderationRestrictions) {
        meetSpaceData.config.moderationRestrictions = spaceData.config.moderationRestrictions;
      }
      
      // Artefactos automáticos
      if (spaceData.config.artifactConfig) {
        meetSpaceData.config.artifactConfig = spaceData.config.artifactConfig;
      }
      
      // Reportes de asistencia
      if (spaceData.config.attendanceReportGenerationType) {
        meetSpaceData.config.attendanceReportGenerationType = spaceData.config.attendanceReportGenerationType;
      }
    } else {
      // Configuración mínima por defecto
      meetSpaceData.config = {
        accessType: "TRUSTED"
      };
    }

    console.log('📋 Creating Meet space with data:', JSON.stringify(meetSpaceData, null, 2));

    // Crear el space
    const createResponse = await fetch('https://meet.googleapis.com/v2/spaces', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(meetSpaceData)
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error(`Failed to create Meet space: ${createResponse.status}`, errorText);
      
      return NextResponse.json({
        error: `Failed to create Meet space: ${createResponse.status} ${createResponse.statusText}`,
        details: errorText
      }, { status: createResponse.status });
    }

    const createdSpace = await createResponse.json();
    console.log('✅ Meet space created:', createdSpace);

    // Inicializar servicio de almacenamiento local
    let storageService: MeetStorageService | null = null;
    
    try {
      storageService = new MeetStorageService();
      
      // Guardar el space en almacenamiento local
      const savedSpace = await storageService.saveSpace(createdSpace, session.user.id);
      console.log('💾 Space saved to local storage:', savedSpace.spaceId);
      
      // Agregar miembros iniciales al almacenamiento local
      if (spaceData.initialMembers.length > 0) {
        const spaceId = createdSpace.name?.split('/').pop();
        
        if (spaceId) {
          console.log(`👥 Adding ${spaceData.initialMembers.length} initial members to local storage`);
          
          // Intentar agregar miembros via API v2beta (puede fallar)
          const apiMembers = await Promise.all(
            spaceData.initialMembers.map(async (member) => {
              try {
                const memberResponse = await fetch(
                  `https://meet.googleapis.com/v2beta/spaces/${spaceId}/members`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token.token}`,
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      email: member.email,
                      role: member.role
                    })
                  }
                );

                if (memberResponse.ok) {
                  const memberData = await memberResponse.json();
                  console.log(`✅ Member added via API: ${member.email}`);
                  return { ...member, apiSuccess: true, apiData: memberData };
                } else {
                  const errorText = await memberResponse.text();
                  console.warn(`⚠️ API failed for member ${member.email}, using local only:`, errorText);
                  return { ...member, apiSuccess: false };
                }
              } catch (error) {
                console.warn(`⚠️ API error for member ${member.email}, using local only:`, error);
                return { ...member, apiSuccess: false };
              }
            })
          );

          // Guardar miembros en almacenamiento local (independientemente del resultado API)
          const localMembers = await storageService.addMembers(
            spaceId,
            spaceData.initialMembers,
            session.user.id
          );
          
          console.log(`💾 Successfully saved ${localMembers.length} members to local storage`);
          
          // Agregar información de miembros al resultado
          createdSpace.members = localMembers;
          createdSpace._metadata = {
            localMembersCount: localMembers.length,
            apiMembersSuccess: apiMembers.filter(m => m.apiSuccess).length,
            source: 'hybrid-local-api',
            template: spaceData._template || null,
            configApplied: spaceData.config
          };
        }
      }
      
      // Log de la operación exitosa
      await storageService.logApiOperation(
        'create_space',
        'POST',
        '/v2/spaces',
        createdSpace.name?.split('/').pop(),
        { success: true, statusCode: 201 },
        session.user.id
      );
      
    } catch (storageError) {
      console.error('❌ Error with local storage, but API space was created:', storageError);
      // Continuar aunque falle el almacenamiento local
    } finally {
      if (storageService) {
        await storageService.disconnect();
      }
    }

    return NextResponse.json(createdSpace, { status: 201 });

  } catch (error: any) {
    console.error("Failed to create Meet space:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error creating Meet space",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}