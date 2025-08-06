import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";

/**
 * GET /api/v1/debug-session
 * Debug de la sesión del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    return NextResponse.json({
      success: true,
      message: "Session debug information",
      data: {
        session: session
          ? {
              user: {
                id: session.user?.id,
                email: session.user?.email,
                name: session.user?.name,
                role: session.user?.role,
              },
              expires: session.expires,
            }
          : null,
        hasSession: !!session,
        hasUser: !!session?.user,
      },
    });
  } catch (error: any) {
    console.error("Error getting session:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
