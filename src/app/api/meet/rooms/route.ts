import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";
import { MeetSpaceConfigService } from "@/src/features/meet/services/MeetSpaceConfigService";
import { MeetMembersService } from "@/src/features/meet/services/MeetMembersService";
import {
  CreateSpaceSchema,
  generateTemplateConfig,
  MeetingTemplateEnum,
} from "@/src/features/meet/validations/SpaceConfigSchema";
import { z } from "zod";

// Schema para aplicar plantillas rápidas
const applyTemplateSchema = z.object({
  template: MeetingTemplateEnum,
  customConfig: z.any().optional()
});

/**
 * GET /api/meet/rooms
 * Devuelve spaces con datos FRESCOS de Google Meet API
 * Solo usa almacenamiento local para obtener la lista de IDs
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

    // Inicializar servicios
    storageService = new MeetStorageService();
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();
    const spaceConfigService = new MeetSpaceConfigService(calendarService.auth);
    
    console.log('🆙 Fetching space IDs and getting FRESH data from Meet API...');
    
    // 1. Obtener solo los IDs de spaces registrados
    const registeredSpaces = await storageService.getAllSpaceIds();
    
    // 2. Para cada ID, hacer llamada fresca a Google Meet API
    const freshSpaces = await Promise.all(
      registeredSpaces.map(async (registered) => {
        try {
          // Llamada fresca a Meet API
          const freshSpace = await spaceConfigService.getSpace(registered.spaceId);
          
          // Actualizar tiempo de sync
          await storageService.updateSyncTime(registered.spaceId);
          
          return {
            ...freshSpace,
            _metadata: {
              localId: registered.id,
              createdAt: registered.createdAt,
              createdBy: registered.createdBy,
              lastSyncAt: new Date(),
              source: 'fresh-api-call'
            }
          };
        } catch (error) {
          console.warn(`⚠️ Failed to fetch fresh data for ${registered.spaceId}:`, error);
          // Fallback: devolver solo lo que tenemos registrado
          return {
            name: `spaces/${registered.spaceId}`,
            spaceId: registered.spaceId,
            displayName: registered.displayName,
            _metadata: {
              localId: registered.id,
              createdAt: registered.createdAt,
              createdBy: registered.createdBy,
              lastSyncAt: registered.lastSyncAt,
              source: 'local-fallback',
              error: 'api-call-failed'
            }
          };
        }
      })
    );
    
    // Obtener estadísticas
    const stats = await storageService.getStats();
    
    console.log(`✅ Retrieved ${freshSpaces.length} spaces with FRESH data`);
    
    return NextResponse.json({
      spaces: freshSpaces,
      stats: stats,
      source: "fresh-api-hybrid",
      note: "Datos frescos de Google Meet API. IDs desde almacenamiento local.",
      totalRegistered: registeredSpaces.length
    });

  } catch (error: any) {
    console.error("Failed to list Meet spaces:", error);
    
    return NextResponse.json({
      spaces: [],
      error: "Error listing Meet spaces",
      details: error.message,
      source: "error"
    }, { status: 500 });
  } finally {
    if (storageService) {
      await storageService.disconnect();
    }
  }
}

/**
 * POST /api/meet/rooms
 * Crea un nuevo space/sala de Meet y SOLO registra el ID localmente
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

    // Inicializar servicios
    storageService = new MeetStorageService();
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();
    const spaceConfigService = new MeetSpaceConfigService(calendarService.auth);
    const membersService = new MeetMembersService(calendarService.auth);

    // 1. CREAR SPACE EN GOOGLE MEET API
    let createdSpace;
    
    if (isTemplate) {
      createdSpace = await spaceConfigService.createSpaceFromTemplate(
        spaceData._template,
        spaceData.displayName,
        spaceData.customConfig
      );
      console.log(`✅ Space created from template ${spaceData._template}:`, createdSpace.name);
    } else {
      createdSpace = await spaceConfigService.createSpace({
        displayName: spaceData.displayName,
        config: spaceData.config
      });
      console.log('✅ Space created with custom config:', createdSpace.name);
    }

    const spaceId = createdSpace.name?.split('/').pop();
    if (!spaceId) {
      throw new Error('No space ID returned from API');
    }

    // 2. SOLO REGISTRAR ID EN ALMACENAMIENTO LOCAL
    await storageService.registerSpace(
      spaceId,
      spaceData.displayName,
      session.user.id
    );
    console.log('💾 Space ID registered locally:', spaceId);

    // 3. AGREGAR MIEMBROS DIRECTAMENTE VÍA API (si hay)
    let membersResult;
    if (spaceData.initialMembers && spaceData.initialMembers.length > 0) {
      console.log(`👥 Adding ${spaceData.initialMembers.length} initial members via API`);
      
      membersResult = await membersService.bulkCreateMembers(
        spaceId,
        spaceData.initialMembers,
        {
          batchDelay: 150,
          continueOnError: true,
          fields: 'name,email,role'
        }
      );
      
      console.log(`📊 Members: ${membersResult.successes.length} added, ${membersResult.failures.length} failed`);
    }

    // 4. LOG DE OPERACIÓN
    await storageService.logOperation(
      'create_space',
      spaceId,
      true,
      201,
      null,
      session.user.id
    );

    // 5. RESPUESTA CON DATOS FRESCOS DE API
    return NextResponse.json({
      ...createdSpace,
      _metadata: {
        spaceId,
        template: spaceData._template || null,
        registeredLocally: true,
        membersAdded: membersResult?.successes.length || 0,
        membersFailed: membersResult?.failures.length || 0,
        source: 'fresh-api-creation',
        note: 'Space creado vía API y solo ID registrado localmente'
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Failed to create Meet space:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error creating Meet space",
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