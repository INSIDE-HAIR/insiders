import { NextMiddleware, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export function withAuthMiddleware(next: NextMiddleware): NextMiddleware {
  return async function middleware(request, event) {
    const token = await getToken({ req: request, secret });

    const publicPaths = ['/login', '/register', '/forgot-password'];
    const isPublicPath = publicPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );

    if (isPublicPath) {
      return next(request, event);
    }

    if (request.nextUrl.pathname.startsWith('/insiders')) {
      if (!token) {
        const locale = request.nextUrl.pathname.split('/')[1] || 'en';
        return NextResponse.redirect(
          new URL(`/${locale}/login`, request.url)
        );
      }
    }

    return next(request, event);
  };
} 