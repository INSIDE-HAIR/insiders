import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { RouteConfig, UserSession, UserRole } from '../types/routes';
import { checkRouteAccess, getEffectiveRole } from '@/lib/route-guard';

// Routes that should be excluded from middleware processing
const EXCLUDED_PATHS = [
  '/api/auth',
  '/auth/login',
  '/auth/register', 
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json'
]

// Public paths that don't require any checks
const PUBLIC_PATHS = [
  '/',
  '/formaciones',
  '/consultoria',
  '/herramientas',
  '/eventos',
  '/recursos',
  '/empresa',
  '/contacto',
  '/legal'
]

interface AuthToken {
  sub?: string
  email?: string
  role?: UserRole
  name?: string
  picture?: string
}

export async function routeGuardMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for excluded paths
  if (shouldExcludePath(pathname)) {
    return NextResponse.next()
  }

  try {
    // Get user session from token
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    }) as AuthToken | null

    const user = token ? await createUserSession(token) : null

    // Check access using route guard
    const accessResult = checkRouteAccess(pathname, user)

    // Handle access result
    if (!accessResult.allowed) {
      console.log(`Access denied for ${pathname}: ${accessResult.reason}`)
      
      if (accessResult.redirect) {
        const redirectUrl = new URL(accessResult.redirect, request.url)
        
        // Add query parameters for better UX
        if (accessResult.reason) {
          redirectUrl.searchParams.set('error', encodeURIComponent(accessResult.reason))
        }
        
        if (pathname !== '/auth/login') {
          redirectUrl.searchParams.set('callbackUrl', pathname)
        }

        return NextResponse.redirect(redirectUrl)
      }
      
      // Return 403 if no redirect specified
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Handle redirects for authenticated users
    if (accessResult.redirect && user?.isAuthenticated) {
      return NextResponse.redirect(new URL(accessResult.redirect, request.url))
    }

    // Add user info to headers for use in pages
    const response = NextResponse.next()
    
    if (user) {
      response.headers.set('x-user-id', user.id)
      response.headers.set('x-user-role', user.role)
      response.headers.set('x-user-email', user.email)
      response.headers.set('x-user-authenticated', 'true')
    }

    return response

  } catch (error) {
    console.error('Route guard middleware error:', error)
    
    // In case of error, allow public paths and redirect others to login
    if (isPublicPath(pathname)) {
      return NextResponse.next()
    }
    
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

async function createUserSession(token: AuthToken): Promise<UserSession | null> {
  if (!token.sub || !token.email) return null

  const domain = token.email.split('@')[1]

  return {
    id: token.sub,
    email: token.email,
    role: token.role || 'user',
    permissions: getPermissionsForRole(token.role || 'user'),
    isAuthenticated: true,
    domain
  }
}

function getPermissionsForRole(role: UserRole) {
  const permissions = {
    'user': ['read'],
    'editor': ['read', 'write'],
    'admin': ['read', 'write', 'manage'],
    'super-admin': ['read', 'write', 'manage', 'configure']
  }
  
  return permissions[role] || permissions['user']
}

function shouldExcludePath(pathname: string): boolean {
  return EXCLUDED_PATHS.some(excluded => {
    if (excluded.endsWith('*')) {
      return pathname.startsWith(excluded.slice(0, -1))
    }
    return pathname.startsWith(excluded)
  })
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(publicPath => {
    if (publicPath === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(publicPath)
  })
}

// Enhanced middleware with domain validation
export async function enhancedRouteGuardMiddleware(request: NextRequest) {
  const response = await routeGuardMiddleware(request)
  
  // Add additional security headers
  if (response instanceof NextResponse) {
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // Add CSP header for admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
      )
    }
  }
  
  return response
}

// Utility function to check if user can access specific admin features
export function canAccessAdminFeature(user: UserSession | null, feature: string): boolean {
  if (!user?.isAuthenticated) return false
  
  const adminFeatures = {
    'users': ['admin', 'super-admin'],
    'calendar': ['admin', 'super-admin'],
    'drive': ['admin', 'super-admin'],
    'holded': ['admin', 'super-admin'],
    'sitemap': ['super-admin'],
    'system-config': ['super-admin']
  }
  
  const requiredRoles = adminFeatures[feature as keyof typeof adminFeatures]
  return requiredRoles ? requiredRoles.includes(user.role) : false
}

// Middleware configuration for Next.js
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}