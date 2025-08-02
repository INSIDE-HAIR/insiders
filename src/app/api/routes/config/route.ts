import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import routesConfig from "@/src/config/routes-config.json";
import { RoutesConfiguration } from "@/src/types/routes";

export async function GET(request: NextRequest) {
  try {
    // Check if user has permission to view route configuration
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role or is from allowed domain
    const userEmail = session.user.email;
    const userDomain = userEmail.split("@")[1];
    const userRole = (session.user as any).role || "user";

    const hasAccess =
      userRole === "admin" ||
      userRole === "super-admin" ||
      userDomain === "insidesalons.com";

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Return the routes configuration
    const config: RoutesConfiguration = routesConfig as RoutesConfiguration;

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching routes config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role || "user";

    // Only super-admin can update route configuration
    if (userRole !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedConfig = await request.json();

    // TODO: Implement actual file/database update
    // For now, we'll just validate the structure
    if (!isValidRoutesConfiguration(updatedConfig)) {
      return NextResponse.json(
        { error: "Invalid configuration structure" },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Validate the configuration thoroughly
    // 2. Save to file or database
    // 3. Potentially restart the application or invalidate caches

    return NextResponse.json({
      success: true,
      message: "Configuration updated successfully",
    });
  } catch (error) {
    console.error("Error updating routes config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function isValidRoutesConfiguration(config: any): boolean {
  // Basic validation - in a real app, use a schema validator like Joi or Zod
  return (
    typeof config === "object" &&
    config.version &&
    config.settings &&
    config.routes &&
    typeof config.routes === "object" &&
    config.exceptions &&
    config.redirects
  );
}
