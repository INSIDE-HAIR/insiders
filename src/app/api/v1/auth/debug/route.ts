import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Auth Debug - Starting comprehensive session check");

    // Test 1: auth() function
    console.log("1. Testing auth() function...");
    const session = await auth();
    console.log("Session from auth():", {
      exists: !!session,
      user: session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role,
            isOAuth: session.user.isOAuth,
          }
        : null,
    });

    // Test 2: getToken function
    console.log("2. Testing getToken() function...");
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    console.log("Token from getToken():", {
      exists: !!token,
      sub: token?.sub,
      email: token?.email,
      role: token?.role,
      name: token?.name,
    });

    // Test 3: Request headers
    console.log("3. Checking request headers...");
    const cookies = request.headers.get("cookie");
    console.log("Cookies present:", !!cookies);

    const authHeaders = {
      cookie: cookies ? "Present" : "Missing",
      authorization: request.headers.get("authorization")
        ? "Present"
        : "Missing",
      "user-agent": request.headers.get("user-agent")?.substring(0, 50) + "...",
    };
    console.log("Auth-related headers:", authHeaders);

    // Test 4: Environment check
    console.log("4. Environment variables...");
    const envCheck = {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
    };
    console.log("Environment:", envCheck);

    return NextResponse.json({
      success: true,
      message: "Auth debug completed",
      results: {
        session: session
          ? {
              userExists: !!session.user,
              email: session.user?.email,
              role: session.user?.role,
              id: session.user?.id,
            }
          : null,
        token: token
          ? {
              exists: true,
              email: token.email,
              role: token.role,
              sub: token.sub,
            }
          : null,
        headers: authHeaders,
        environment: envCheck,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Auth debug error:", error);
    return NextResponse.json(
      {
        error: "Auth debug failed",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack",
      },
      { status: 500 }
    );
  }
}
