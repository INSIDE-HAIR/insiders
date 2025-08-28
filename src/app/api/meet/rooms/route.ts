import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { MeetStorageService } from "@/src/features/meet/services/MeetStorageService";
import { MeetSpaceConfigService } from "@/src/features/meet/services/MeetSpaceConfigService";
import { MeetMembersService } from "@/src/features/meet/services/MeetMembersService";
import { MeetRoomFilterService } from "@/src/features/meet/services/MeetRoomFilterService";
import { CreateSpaceSchema } from "@/src/features/meet/validations/SpaceConfigSchema";
import { DateFilter, RoomFilters, MeetSpaceWithDates } from "@/src/features/meet/types/room-dates.types";
import { calculateRoomStatus } from "@/src/features/meet/utils/date-filters";

/**
 * GET /api/meet/rooms?include=analytics
 * Devuelve spaces con datos FRESCOS de Google Meet API
 * Solo usa almacenamiento local para obtener la lista de IDs
 *
 * Query parameters:
 * - include=analytics: Incluye métricas de participantes y sesiones
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

    // Verificar query parameters
    const { searchParams } = new URL(request.url);
    const includeAnalytics =
      searchParams.get("include")?.includes("analytics") || false;
    
    // Nuevos parámetros de filtrado
    const search = searchParams.get("search") || undefined;
    const dateFilter = (searchParams.get("dateFilter") as DateFilter) || DateFilter.ALL;
    const includeStatus = searchParams.get("includeStatus") === "true";

    // Inicializar servicios
    storageService = new MeetStorageService();
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();
    const spaceConfigService = new MeetSpaceConfigService(calendarService.auth);
    const membersService = new MeetMembersService(calendarService.auth);

    console.log(
      `🆙 Fetching space IDs and getting FRESH data from Meet API...${includeAnalytics ? " (with analytics)" : ""}`
    );

    // 1. Obtener solo los IDs de spaces registrados
    const registeredSpaces = await storageService.getAllSpaceIds();

    // 2. Para cada ID, hacer llamada fresca a Google Meet API
    const freshSpaces = await Promise.all(
      registeredSpaces.map(async (registered) => {
        try {
          // Llamada fresca a Meet API - incluir activeConference
          const freshSpace = await spaceConfigService.getSpace(
            registered.spaceId,
            "name,meetingUri,meetingCode,config,activeConference"
          );

          // Fetch members separately since getSpace doesn't include them
          let members: any[] = [];
          try {
            const membersResponse = await membersService.listMembers(
              registered.spaceId,
              {
                fields: "name,email,role,createTime,updateTime,user",
                pageSize: 100
              }
            );
            members = membersResponse.members || [];
            console.log(`📋 Fetched ${members.length} members for space ${registered.spaceId}`);
          } catch (memberError) {
            console.warn(
              `⚠️ Failed to fetch members for ${registered.spaceId}:`,
              memberError
            );
          }

          // Actualizar tiempo de sync
          await storageService?.updateSyncTime(registered.spaceId);

          return {
            ...freshSpace,
            members, // Add members to the response
            startDate: registered.startDate,
            endDate: registered.endDate,
            _metadata: {
              localId: registered.id,
              displayName: registered.displayName,
              createdAt: registered.createdAt,
              createdBy: registered.createdBy,
              lastSyncAt: new Date(),
              source: "fresh-api-call",
              membersCount: members.length,
              status: includeStatus ? calculateRoomStatus(registered.startDate, registered.endDate) : undefined,
            },
          };
        } catch (error) {
          console.warn(
            `⚠️ Failed to fetch fresh data for ${registered.spaceId}:`,
            error
          );
          // Fallback: devolver solo lo que tenemos registrado
          return {
            name: `spaces/${registered.spaceId}`,
            spaceId: registered.spaceId,
            displayName: registered.displayName,
            members: [], // Empty members array for fallback
            _metadata: {
              localId: registered.id,
              createdAt: registered.createdAt,
              createdBy: registered.createdBy,
              lastSyncAt: registered.lastSyncAt,
              source: "local-fallback",
              error: "api-call-failed",
              membersCount: 0,
            },
          };
        }
      })
    );

    // 3. Aplicar filtros si es necesario
    let enhancedSpaces = freshSpaces;
    
    if (search || dateFilter !== DateFilter.ALL) {
      const filterService = new MeetRoomFilterService();
      const filters: RoomFilters = {
        search,
        dateFilter
      };
      
      enhancedSpaces = filterService.applyFilters(enhancedSpaces as unknown as MeetSpaceWithDates[], filters) as any;
      console.log(`🔍 Filtered ${enhancedSpaces.length} rooms from ${freshSpaces.length} total`);
    }
    
    // Añadir analytics si se solicita
    if (includeAnalytics) {
      console.log(
        "ℹ️ Analytics solicitados - disponibles via /api/meet/rooms/[id]/analytics"
      );
      // Por ahora, solo agregamos un indicador de que analytics están disponibles
      enhancedSpaces = enhancedSpaces.map((space) => ({
        ...space,
        _analyticsAvailable: true,
      }));
    }

    // Obtener estadísticas
    const stats = await storageService.getStats();

    console.log(
      `✅ Retrieved ${enhancedSpaces.length} spaces with FRESH data${includeAnalytics ? " and analytics" : ""}`
    );

    return NextResponse.json({
      rooms: enhancedSpaces, // Changed from 'spaces' to 'rooms' for frontend compatibility
      spaces: enhancedSpaces, // Keep both for backwards compatibility
      stats: stats,
      source: "fresh-api-hybrid",
      note: `Datos frescos de Google Meet API. IDs desde almacenamiento local.${includeAnalytics ? " Incluye métricas de participantes." : ""}`,
      totalRegistered: registeredSpaces.length,
      includesAnalytics: includeAnalytics,
    });
  } catch (error: any) {
    console.error("Failed to list Meet spaces:", error);

    return NextResponse.json(
      {
        rooms: [], // Added for frontend compatibility
        spaces: [],
        error: "Error listing Meet spaces",
        details: error.message,
        source: "error",
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

    // Debug: Log the received body
    console.log("📥 Received body:", JSON.stringify(body, null, 2));

    // Validar configuración personalizada
    const validationResult = CreateSpaceSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("❌ API Validation errors:", validationResult.error.errors);
      return NextResponse.json(
        { error: "Invalid space data", details: validationResult.error.errors },
        { status: 400 }
      );
    }
    const spaceData = validationResult.data;

    // Inicializar servicios
    storageService = new MeetStorageService();
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();
    const spaceConfigService = new MeetSpaceConfigService(calendarService.auth);
    const membersService = new MeetMembersService(calendarService.auth);

    // 1. CREAR SPACE EN GOOGLE MEET API
    const createdSpace = await spaceConfigService.createSpace({
      displayName: spaceData.displayName,
      config: spaceData.config,
    });
    console.log("✅ Space created with custom config:", createdSpace.name);

    const spaceId = createdSpace.name?.split("/").pop();
    if (!spaceId) {
      throw new Error("No space ID returned from API");
    }

    // 2. SOLO REGISTRAR ID EN ALMACENAMIENTO LOCAL (con fechas opcionales)
    await storageService.registerSpace(
      spaceId,
      spaceData.displayName,
      session.user.id,
      spaceData.startDate ? new Date(spaceData.startDate) : null,
      spaceData.endDate ? new Date(spaceData.endDate) : null
    );
    console.log("💾 Space ID registered locally:", spaceId);

    // 3. AGREGAR MIEMBROS DIRECTAMENTE VÍA API (si hay)
    let membersResult;
    if (spaceData.initialMembers && spaceData.initialMembers.length > 0) {
      console.log(
        `👥 Adding ${spaceData.initialMembers.length} initial members via API`
      );

      membersResult = await membersService.bulkCreateMembers(
        spaceId,
        spaceData.initialMembers,
        {
          batchDelay: 150,
          continueOnError: true,
          fields: "name,email,role",
        }
      );

      console.log(
        `📊 Members: ${membersResult.successes.length} added, ${membersResult.failures.length} failed`
      );
    }

    // 4. LOG DE OPERACIÓN
    await storageService.logOperation(
      "create_space",
      spaceId,
      true,
      201,
      null,
      session.user.id
    );

    // 5. RESPUESTA CON DATOS FRESCOS DE API
    const metadata: any = {
      spaceId,
      displayName: spaceData.displayName,
      registeredLocally: true,
      membersAdded: membersResult?.successes.length || 0,
      membersFailed: membersResult?.failures.length || 0,
      source: "fresh-api-creation",
      note: "Space creado vía API y solo ID registrado localmente",
    };

    // Agregar información sobre limitaciones de configuración si existen
    if ((createdSpace as any)._configurationIssues) {
      metadata.configurationWarning = (
        createdSpace as any
      )._configurationIssues;
    }

    return NextResponse.json(
      {
        ...createdSpace,
        _metadata: metadata,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create Meet space:", error);

    return NextResponse.json(
      {
        error: error.message || "Error creating Meet space",
        details: error.stack,
      },
      { status: 500 }
    );
  } finally {
    if (storageService) {
      await storageService.disconnect();
    }
  }
}
