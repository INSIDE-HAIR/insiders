import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarService } from "@/src/features/calendar/services/calendar/GoogleCalendarService";
import { GoogleMeetService } from "@/src/features/calendar/services/GoogleMeetService";

/**
 * GET /api/calendar/meet/test
 * Endpoint para probar la funcionalidad de Google Meet API
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get('spaceId');

    // Inicializar servicios
    const calendarService = new GoogleCalendarService();
    await calendarService.initialize();
    
    const meetService = new GoogleMeetService(calendarService.auth);

    const results: any = {
      timestamp: new Date().toISOString(),
      spaceId: spaceId || null,
      tokenScopes: null,
      spaceInfo: null,
      spaceMembers: null,
      errors: []
    };

    // 1. Verificar scopes del token
    try {
      await meetService.checkTokenScopes();
      results.tokenScopes = "Check completed (see console logs)";
    } catch (error) {
      results.errors.push(`Token scope check failed: ${error}`);
    }

    // 2. Si se proporciona un spaceId, intentar obtener información del espacio
    if (spaceId) {
      try {
        const token = await calendarService.auth.getAccessToken();
        
        // Intentar obtener información del espacio
        const spaceResponse = await fetch(
          `https://meet.googleapis.com/v2beta/spaces/${spaceId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token.token}`,
              'Accept': 'application/json'
            }
          }
        );

        if (spaceResponse.ok) {
          results.spaceInfo = await spaceResponse.json();
          
          // Si el espacio existe, intentar obtener miembros
          const members = await meetService.getSpaceMembers(spaceId);
          results.spaceMembers = members;
        } else {
          results.errors.push(`Space fetch failed: ${spaceResponse.status} ${spaceResponse.statusText}`);
          
          // Intentar obtener el body del error
          try {
            const errorBody = await spaceResponse.json();
            results.errors.push(`Error details: ${JSON.stringify(errorBody)}`);
          } catch (e) {
            const errorText = await spaceResponse.text();
            results.errors.push(`Error text: ${errorText}`);
          }
        }
      } catch (error) {
        results.errors.push(`Space operation failed: ${error}`);
      }
    }

    // 3. Probar con algunos space IDs de ejemplo de tus logs
    const testSpaceIds = ['bzv-pvfh-jxr', 'pip-yijn-weg', 'cjp-mpdz-skw'];
    results.testResults = [];

    for (const testSpaceId of testSpaceIds) {
      try {
        const token = await calendarService.auth.getAccessToken();
        
        const testResponse = await fetch(
          `https://meet.googleapis.com/v2beta/spaces/${testSpaceId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token.token}`,
              'Accept': 'application/json'
            }
          }
        );

        results.testResults.push({
          spaceId: testSpaceId,
          status: testResponse.status,
          statusText: testResponse.statusText,
          success: testResponse.ok
        });
      } catch (error) {
        results.testResults.push({
          spaceId: testSpaceId,
          error: String(error),
          success: false
        });
      }
    }

    return NextResponse.json(results, { status: 200 });

  } catch (error: any) {
    console.error("Meet test endpoint failed:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error testing Meet API",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}