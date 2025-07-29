import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleCalendarAuthProvider } from "@/src/features/calendar/services/auth/GoogleCalendarAuthProvider";
import { Logger } from "@/src/features/calendar/utils/logger";

const logger = new Logger("API:CalendarAuth");

/**
 * GET /api/calendar/auth/token
 * Verifica el estado de autenticación con Google Calendar
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación de usuario
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    logger.info("Checking Calendar authentication status");

    // Inicializar proveedor de auth
    const authProvider = new GoogleCalendarAuthProvider();

    // Verificar autenticación
    const isAuthenticated = await authProvider.verifyAuthentication();
    
    if (!isAuthenticated) {
      return NextResponse.json({
        authenticated: false,
        error: "Calendar authentication failed",
        message: "Please check your Google Calendar API credentials"
      }, { status: 401 });
    }

    // Obtener información del token
    const tokenInfo = authProvider.getTokenInfo();

    logger.info("Calendar authentication verified successfully");

    return NextResponse.json({
      authenticated: true,
      tokenInfo: {
        hasToken: tokenInfo.hasToken,
        expiresAt: tokenInfo.expiresAt?.toISOString() || null
      },
      message: "Calendar authentication is valid"
    });

  } catch (error: any) {
    logger.error("Calendar authentication check failed", error);
    
    return NextResponse.json({
      authenticated: false,
      error: error.message || "Authentication check failed",
      details: error.stack
    }, { status: 500 });
  }
}

/**
 * POST /api/calendar/auth/token
 * Renueva el token de acceso de Google Calendar
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación de usuario
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    logger.info("Refreshing Calendar access token");

    // Inicializar proveedor de auth
    const authProvider = new GoogleCalendarAuthProvider();

    // Forzar renovación del token
    const accessToken = await authProvider.getAccessToken();
    const tokenInfo = authProvider.getTokenInfo();

    logger.info("Calendar access token refreshed successfully");

    return NextResponse.json({
      success: true,
      message: "Access token refreshed successfully",
      tokenInfo: {
        hasToken: tokenInfo.hasToken,
        expiresAt: tokenInfo.expiresAt?.toISOString() || null
      }
    });

  } catch (error: any) {
    logger.error("Failed to refresh Calendar access token", error);
    
    return NextResponse.json({
      success: false,
      error: error.message || "Token refresh failed",
      details: error.stack
    }, { status: 500 });
  }
}

/**
 * DELETE /api/calendar/auth/token
 * Revoca el token de acceso actual
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación de usuario
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar permisos de admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    logger.info("Revoking Calendar access token");

    // Inicializar proveedor de auth
    const authProvider = new GoogleCalendarAuthProvider();

    // Revocar token
    await authProvider.revokeToken();

    logger.info("Calendar access token revoked successfully");

    return NextResponse.json({
      success: true,
      message: "Access token revoked successfully"
    });

  } catch (error: any) {
    logger.error("Failed to revoke Calendar access token", error);
    
    return NextResponse.json({
      success: false,
      error: error.message || "Token revocation failed",
      details: error.stack
    }, { status: 500 });
  }
}