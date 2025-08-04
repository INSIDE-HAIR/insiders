import { NextRequest, NextResponse, NextFetchEvent, NextMiddleware } from "next/server";
import { geolocation, ipAddress } from "@vercel/functions";
import { getToken } from "next-auth/jwt";
import {
  RouteConfig,
  UserSession,
  UserRole,
  Permission,
} from "../types/routes";
import { checkRouteAccess, getEffectiveRole } from "../lib/route-guard";

type MiddlewareFactory = (middleware: NextMiddleware) => NextMiddleware;

// Routes that should be excluded from middleware processing
const EXCLUDED_PATHS = [
  "/api",
  "/auth/login",
  "/auth/register",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
  "/404",
  "/unauthorized",
  "/maintenance",
  "/.well-known",
];

// Public paths that don't require any checks
const PUBLIC_PATHS = [
  "/",
  "/es",
  "/en",
  "/404",
  "/unauthorized",
  "/maintenance",
  "/auth",
  "/formaciones",
  "/consultoria",
  "/herramientas",
  "/eventos",
  "/recursos",
  "/empresa",
  "/contacto",
  "/legal",
];

interface AuthToken {
  sub?: string;
  email?: string;
  role?: UserRole;
  name?: string;
  picture?: string;
}

async function routeGuardHandler(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for excluded paths
  if (shouldExcludePath(pathname)) {
    return NextResponse.next();
  }

  try {
    // Get user session from token
    const token = (await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })) as AuthToken | null;

    const user = token ? await createUserSession(token) : null;

    // Extract request information for database access control
    const clientIP =
      ipAddress(request) ||
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "";

    // Basic geo info (in production, use proper geo IP service)
    const geo = {
      country: geolocation(request)?.country || undefined,
      region: geolocation(request)?.region || undefined,
      city: geolocation(request)?.city || undefined,
    };

    // Check access using route guard with request context
    const accessResult = await checkRouteAccess(pathname, user, {
      ip: clientIP,
      userAgent,
      geo,
    });

    // Handle access result
    if (!accessResult.allowed) {
      console.log(`Access denied for ${pathname}: ${accessResult.reason}`);

      if (accessResult.redirect) {
        const redirectUrl = new URL(accessResult.redirect, request.url);

        // Add query parameters for better UX
        if (accessResult.reason) {
          redirectUrl.searchParams.set(
            "error",
            encodeURIComponent(accessResult.reason)
          );
        }

        if (pathname !== "/auth/login") {
          redirectUrl.searchParams.set("callbackUrl", pathname);
        }

        return NextResponse.redirect(redirectUrl);
      }

      // Return 403 if no redirect specified
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Handle redirects for authenticated users
    if (accessResult.redirect && user?.isAuthenticated) {
      return NextResponse.redirect(new URL(accessResult.redirect, request.url));
    }

    // Add user info to headers for use in pages
    const response = NextResponse.next();

    if (user) {
      response.headers.set("x-user-id", user.id);
      response.headers.set("x-user-role", user.role);
      response.headers.set("x-user-email", user.email);
      response.headers.set("x-user-authenticated", "true");
    }

    return response;
  } catch (error) {
    console.error("Route guard middleware error:", error);

    // In case of error, allow public paths and redirect others to login
    if (isPublicPath(pathname)) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

async function createUserSession(
  token: AuthToken
): Promise<UserSession | null> {
  if (!token.sub || !token.email) return null;

  const domain = token.email.split("@")[1];

  return {
    id: token.sub,
    email: token.email,
    role: token.role || "user",
    permissions: getPermissionsForRole(token.role || "user"),
    isAuthenticated: true,
    domain,
  };
}

function getPermissionsForRole(role: UserRole): Permission[] {
  const permissions: Record<UserRole, Permission[]> = {
    user: ["read"],
    editor: ["read", "write"],
    admin: ["read", "write", "manage", "configure"],
    "super-admin": ["read", "write", "manage", "configure"],
  };

  return permissions[role] || permissions["user"];
}

function shouldExcludePath(pathname: string): boolean {
  return EXCLUDED_PATHS.some((excluded) => {
    if (excluded.endsWith("*")) {
      return pathname.startsWith(excluded.slice(0, -1));
    }
    return pathname.startsWith(excluded);
  });
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((publicPath) => {
    if (publicPath === "/") {
      return pathname === "/" || pathname === "/es" || pathname === "/en";
    }
    return pathname.startsWith(publicPath) || pathname === publicPath;
  });
}

// Enhanced middleware with domain validation
export async function enhancedRouteGuardMiddleware(request: NextRequest) {
  const dummyNext: NextMiddleware = async () => NextResponse.next();
  const response = await routeGuardMiddleware(dummyNext)(request, {} as NextFetchEvent);

  // Add additional security headers
  if (response instanceof NextResponse) {
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // Add CSP header for admin routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
      response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
      );
    }
  }

  return response;
}

// Utility function to check if user can access specific admin features
export function canAccessAdminFeature(
  user: UserSession | null,
  feature: string
): boolean {
  if (!user?.isAuthenticated) return false;

  const adminFeatures = {
    users: ["admin"],
    calendar: ["admin"],
    drive: ["admin"],
    holded: ["admin"],
    sitemap: ["admin"],
    "system-config": ["admin"],
    "access-control": ["admin"],
    "complex-access-control": ["admin"],
  };

  const requiredRoles = adminFeatures[feature as keyof typeof adminFeatures];
  return requiredRoles ? requiredRoles.includes(user.role) : false;
}

// Export middleware factory
export const routeGuardMiddleware: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    // Check if request and nextUrl are properly defined
    if (!request || !request.nextUrl) {
      console.error('Invalid request object in route guard middleware');
      return NextResponse.next();
    }

    // Handle route guard logic
    const guardResponse = await routeGuardHandler(request);
    
    // If guard response is a redirect or error, return it
    if (guardResponse.status !== 200 || guardResponse.headers.get('location')) {
      return guardResponse;
    }
    
    // Otherwise, continue to next middleware
    return next(request, event);
  };
};
