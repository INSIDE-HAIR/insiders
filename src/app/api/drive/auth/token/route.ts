import { NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { google } from "googleapis";

export async function GET(request: Request) {
  console.log("=== TOKEN REQUEST START ===");

  try {
    console.log("1. Checking authentication...");
    const session = await auth();
    if (!session?.user) {
      console.log("❌ No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ User authenticated:", {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    // Solo admins pueden obtener tokens de acceso
    if (session.user.role !== "ADMIN") {
      console.log("❌ User is not admin");
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    console.log("✅ Admin access confirmed");

    console.log("2. Creating Google Auth with Service Account...");

    // Verificar variables de entorno
    console.log("Environment check:", {
      hasClientEmail: !!process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_DRIVE_PRIVATE_KEY,
      hasProjectId: !!process.env.GOOGLE_DRIVE_PROJECT_ID,
      clientEmailPrefix: process.env.GOOGLE_DRIVE_CLIENT_EMAIL?.substring(
        0,
        20
      ),
    });

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

    console.log("3. Getting access token...");

    // Obtener token de acceso
    const authClient = await googleAuth.getClient();
    const accessTokenResponse = await authClient.getAccessToken();

    if (!accessTokenResponse.token) {
      console.log("❌ No access token received");
      throw new Error("Failed to get access token");
    }

    console.log("✅ Access token generated successfully:", {
      tokenLength: accessTokenResponse.token.length,
      tokenPrefix: accessTokenResponse.token.substring(0, 20) + "...",
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    });

    console.log("=== TOKEN REQUEST SUCCESS ===");

    return NextResponse.json({
      access_token: accessTokenResponse.token,
      token_type: "Bearer",
      expires_in: 3600,
      expiresAt: Date.now() + 3600 * 1000, // 1 hour from now
    });
  } catch (error) {
    console.log("=== TOKEN REQUEST ERROR ===");
    console.error("❌ Error getting access token:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        error: "Failed to get access token",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
