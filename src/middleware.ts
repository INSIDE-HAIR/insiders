import { NextRequest, NextResponse } from "next/server";

function setLocaleCookie(response: NextResponse, locale: string) {
  response.cookies.set("NEXT_LOCALE", locale);
}

function setCorsHeaders(response: NextResponse) {
  response.headers.set(
    "Access-Control-Allow-Origin",
    "https://www.insidehair.es"
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Max-Age", "86400");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const currentLocale = req.cookies.get("NEXT_LOCALE")?.value || "es"; // Default to 'es' if no cookie

  // Handle CORS for API routes
  if (pathname.startsWith("/api")) {
    // For OPTIONS requests (preflight)
    if (req.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 204 });
      setCorsHeaders(response);
      return response;
    }

    // For other API requests
    const response = NextResponse.next();
    setCorsHeaders(response);
    return response;
  }

  // Existing logic for handling locales and redirections
  if (pathname === "/") {
    const response = NextResponse.redirect(
      new URL(`/${currentLocale}`, req.url)
    );
    setLocaleCookie(response, currentLocale);
    return response;
  }

  // Exclude static files and not-found page
  if (pathname.startsWith("/_next") || pathname === "/not-found") {
    return NextResponse.next();
  }

  // Handle language-specific routes and update cookie
  if (pathname.startsWith("/es") || pathname.startsWith("/en")) {
    const lang = pathname.startsWith("/es") ? "es" : "en";
    const response = NextResponse.next();
    setLocaleCookie(response, lang);
    return response;
  }

  // Handle redirections for routes without language prefix
  if (!pathname.startsWith("/es") && !pathname.startsWith("/en")) {
    const newPathname = `/${currentLocale}${pathname}`;
    const response = NextResponse.redirect(new URL(newPathname, req.url));
    setLocaleCookie(response, currentLocale);
    return response;
  }

  return NextResponse.next();
}

// Adjust the matcher to include API routes
export const config = {
  matcher: [
    // Routes that need to be handled by the middleware
    "/",
    "/((?!_next|.*\\..*).*)",
    // Explicitly include API routes
    "/api/:path*",
  ],
};
