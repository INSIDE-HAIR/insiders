import { NextRequest, NextResponse } from "next/server";

function setLocaleCookie(response: NextResponse, locale: string) {
  response.cookies.set("NEXT_LOCALE", locale);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const currentLocale = req.cookies.get("NEXT_LOCALE")?.value || "es"; // Default to 'es' if no cookie

  // Redirect root to current locale
  if (pathname === "/") {
    const response = NextResponse.redirect(
      new URL(`/${currentLocale}`, req.url)
    );
    setLocaleCookie(response, currentLocale);
    return response;
  }

  // Exclude API routes, static files, and not-found page
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/not-found"
  ) {
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

  // Add any other custom redirection logic here if needed

  return NextResponse.next();
}

// Adjust the matcher to explicitly exclude API routes
export const config = {
  matcher: [
    // Routes that need to be handled by the middleware
    "/",
    "/((?!api|_next|.*\\..*).*)",
    // Explicitly include authentication routes if necessary
    "/auth/:path*",
  ],
};
