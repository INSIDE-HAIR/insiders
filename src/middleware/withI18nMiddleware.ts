import { NextMiddleware, NextResponse } from 'next/server';

const DEFAULT_LOCALE = "es";
const SUPPORTED_LOCALES = ["es", "en"];
const COOKIE_NAME = "NEXT_LOCALE";

export function withI18nMiddleware(next: NextMiddleware): NextMiddleware {
  return async function middleware(request, event) {
    const { pathname, search } = request.nextUrl;
    let currentLocale = request.cookies.get(COOKIE_NAME)?.value || DEFAULT_LOCALE;

    // Debug logging
    if (process.env.NODE_ENV === 'production' || process.env.DEBUG_AUTH) {
      console.log(`[I18N DEBUG] Path: ${pathname}, Locale: ${currentLocale}`);
    }

    // Si es una ruta de API, archivos estáticos o service worker, continuar
    if (pathname.match(/^\/(?:api|_next|sw\.js|.*\..*)/) || pathname === "/not-found") {
      return next(request, event);
    }

    const pathLocale = getLocaleFromPath(pathname);
    let response: NextResponse;

    // Manejar ruta raíz
    if (pathname === "/") {
      const redirectUrl = new URL(`/${currentLocale}${search}`, request.url);
      response = NextResponse.redirect(redirectUrl, { status: 302 });
    }
    // Manejar rutas con prefijo de idioma soportado
    else if (pathLocale) {
      let result = await next(request, event) || NextResponse.next();
      if (!(result instanceof NextResponse)) {
        result = NextResponse.next(result);
      }
      response = result as NextResponse;
      currentLocale = pathLocale;
      
      // Debug: check if next middleware returned a redirect
      if (process.env.NODE_ENV === 'production' || process.env.DEBUG_AUTH) {
        console.log(`[I18N DEBUG] Next middleware response status: ${response.status}`);
      }
    }
    // Manejar rutas sin prefijo de idioma
    else if (!pathLocale && pathname !== "/") {
      const newPathname = `/${currentLocale}${pathname}${search}`;
      response = NextResponse.redirect(new URL(newPathname, request.url), { status: 302 });
    }
    // Para todos los demás casos
    else {
      response = (await next(request, event)) as NextResponse || NextResponse.next();
    }

    // Establecer cookie de idioma
    response.cookies.set(COOKIE_NAME, currentLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "strict",
    });

    return response;
  };
}

function getLocaleFromPath(pathname: string): string | null {
  const firstSegment = pathname.split("/")[1];
  return SUPPORTED_LOCALES.includes(firstSegment || '') ? firstSegment || null : null;
} 