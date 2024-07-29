import NextAuth from "next-auth";
import authConfig from "./lib/actions/auth/config/auth.config";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Crear el middleware de next-intl
const intlMiddleware = createIntlMiddleware({
  locales: ["en", "es"],
  defaultLocale: "es",
});

// Combinar NextAuth y next-intl
export default auth((req: NextRequest) => {
  const { nextUrl } = req;

  // No aplicar internacionalización a las rutas de API
  if (nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Manejar las redirecciones de autenticación
  if (nextUrl.pathname === "/register")
    return Response.redirect(new URL("/auth/register", nextUrl));

  if (nextUrl.pathname === "/login" || nextUrl.pathname === "/signin")
    return Response.redirect(new URL("/auth/login", nextUrl));

  // Aplicar el middleware de next-intl para rutas que no son API
  return intlMiddleware(req);
});

// Ajustar el matcher para excluir explícitamente las rutas de API
export const config = {
  matcher: [
    // Rutas internacionalizadas
    "/",
    "/((?!api|_next|.*\\..*).*)",
    // Incluir explícitamente rutas de autenticación si es necesario
    "/auth/:path*",
  ],
};
