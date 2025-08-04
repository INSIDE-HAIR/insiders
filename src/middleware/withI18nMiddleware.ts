import { NextMiddleware, NextResponse } from 'next/server';

const DEFAULT_LOCALE = "es";
const SUPPORTED_LOCALES = ["es", "en"];
const COOKIE_NAME = "NEXT_LOCALE";

export function withI18nMiddleware(next: NextMiddleware): NextMiddleware {
  return async function middleware(request, event) {
    const { pathname, search } = request.nextUrl;
    let currentLocale = request.cookies.get(COOKIE_NAME)?.value || DEFAULT_LOCALE;

    // Si es una ruta de API o archivos estáticos, continuar
    if (pathname.match(/^\/(?:api|_next|.*\..*)/) || pathname === "/not-found") {
      return next(request, event);
    }

    const pathLocale = getLocaleFromPath(pathname);
    let response: NextResponse;

    // Manejar ruta raíz
    if (pathname === "/") {
      response = NextResponse.redirect(new URL(`/${currentLocale}${search}`, request.url));
    }
    // Manejar rutas con prefijo de idioma soportado
    else if (pathLocale) {
      let result = await next(request, event) || NextResponse.next();
      if (!(result instanceof NextResponse)) {
        result = NextResponse.next(result);
      }
      response = result as NextResponse;
      currentLocale = pathLocale;
    }
    // Manejar rutas sin prefijo de idioma
    else if (!pathLocale && pathname !== "/") {
      const newPathname = `/${currentLocale}${pathname}${search}`;
      response = NextResponse.redirect(new URL(newPathname, request.url));
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