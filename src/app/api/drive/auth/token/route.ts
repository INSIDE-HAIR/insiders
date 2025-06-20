import { NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { google } from "googleapis";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Solo admins pueden obtener tokens de acceso
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Crear autenticación con service account
    const googleAuth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
        project_id: process.env.GOOGLE_DRIVE_PROJECT_ID,
      },
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    // Obtener token de acceso
    const authClient = await googleAuth.getClient();
    const accessTokenResponse = await authClient.getAccessToken();

    if (!accessTokenResponse.token) {
      throw new Error("Failed to get access token");
    }

    return NextResponse.json({
      accessToken: accessTokenResponse.token,
      expiresAt: Date.now() + 3600 * 1000, // 1 hour from now
    });
  } catch (error) {
    console.error("Error getting access token:", error);
    return NextResponse.json(
      {
        error: "Failed to get access token",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
