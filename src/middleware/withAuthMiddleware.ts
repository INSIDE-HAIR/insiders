// Importaciones necesarias para el middleware
import { NextMiddleware, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Clave secreta para verificar los tokens JWT
const secret = process.env.NEXTAUTH_SECRET;

// Función de orden superior que envuelve el middleware de autenticación
export function withAuthMiddleware(next: NextMiddleware): NextMiddleware {
  // Retorna una nueva función middleware que maneja la autenticación
  return async function middleware(request, event) {
    // Obtiene el token de autenticación de la solicitud
    const token = await getToken({ req: request, secret });

    // Define las rutas públicas que no requieren autenticación
    const publicPaths = ["/login", "/register", "/forgot-password"];

    // Verifica si la ruta actual es una ruta pública
    const isPublicPath = publicPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );

    // Si es una ruta pública, permite el acceso sin verificación
    if (isPublicPath) {
      return next(request, event);
    }

    // Verifica el acceso a rutas protegidas (/admin)
    if (request.nextUrl.pathname.startsWith("/admin")) {
      // Si no hay token, redirige al login manteniendo el idioma
      if (!token) {
        const locale = request.nextUrl.pathname.split("/")[1] || "en";
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
      }
    }

    // Si todo está bien, continúa con el siguiente middleware
    return next(request, event);
  };
}
