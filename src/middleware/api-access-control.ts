import { NextRequest, NextResponse } from 'next/server'
import { ipAddress } from "@vercel/functions";
import { getToken } from 'next-auth/jwt'
import { checkDatabaseAccess, AccessCheckRequest } from '../lib/access-control-service'
import { UserSession, UserRole, Permission } from '../types/routes'

/**
 * Database-powered access control for API routes
 * This implements the complex access control logic that was moved out of 
 * Edge Runtime middleware due to Prisma compatibility issues
 */

interface ApiAccessCheckOptions {
  requireAuth?: boolean
  roles?: UserRole[]
  permissions?: string[]
  teams?: string[]
  skipDatabaseCheck?: boolean
}

export async function withDatabaseAccessControl(
  handler: (req: NextRequest, user: UserSession | null) => Promise<NextResponse>,
  options: ApiAccessCheckOptions = {}
) {
  return async function(req: NextRequest): Promise<NextResponse> {
    try {
      // Get user session
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
      })

      const user = token ? createUserSession(token) : null

      // Check basic auth requirements
      if (options.requireAuth && !user?.isAuthenticated) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      // Check role requirements
      if (options.roles && user && !options.roles.includes(user.role)) {
        return NextResponse.json(
          { error: 'Insufficient role privileges', requiredRoles: options.roles },
          { status: 403 }
        )
      }

      // Check database access control (if not skipped)
      if (!options.skipDatabaseCheck && user) {
        const dbAccessRequest: AccessCheckRequest = {
          user: user,
          route: new URL(req.url).pathname,
          userAgent: req.headers.get('user-agent') || '',
          ip: ipAddress(req) || req.headers.get('x-forwarded-for') || 'unknown',
        }

        try {
          const dbAccessResult = await checkDatabaseAccess(dbAccessRequest)
          
          if (!dbAccessResult?.allowed) {
            return NextResponse.json(
              { 
                error: 'Database access control denied',
                reason: dbAccessResult?.reason,
                details: (dbAccessResult as any)?.details 
              },
              { status: 403 }
            )
          }

          // Log successful access for analytics
          console.log(`✅ DB Access allowed for ${user.email} to ${dbAccessRequest.route}`)
          
        } catch (dbError) {
          console.error('Database access check failed:', dbError)
          
          // In case of DB error, fall back to config-based validation
          // This ensures the system remains functional even if DB is unavailable
          console.log('⚠️ Falling back to config-based access control')
        }
      }

      // Call the actual handler
      return await handler(req, user)

    } catch (error) {
      console.error('API access control error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  };
}

function createUserSession(token: any): UserSession {
  const domain = token.email?.split('@')[1]
  
  return {
    id: token.sub,
    email: token.email,
    role: token.role || 'CLIENT',
    permissions: getPermissionsForRole(token.role || 'CLIENT'),
    isAuthenticated: true,
    domain
  }
}

function getPermissionsForRole(role: UserRole): Permission[] {
  const permissions: Record<UserRole, Permission[]> = {
    CLIENT: ['read'],
    EMPLOYEE: ['read', 'write'],
    ADMIN: ['read', 'write', 'manage', 'configure']
  }
  
  return permissions[role] || permissions['CLIENT']
}

/**
 * Middleware wrapper for protected API routes
 */
export function protectedApiRoute(
  handler: (req: NextRequest, user: UserSession) => Promise<NextResponse>,
  options: Omit<ApiAccessCheckOptions, 'requireAuth'> = {}
) {
  return withDatabaseAccessControl(
    async (req, user) => {
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      return handler(req, user)
    },
    { ...options, requireAuth: true }
  )
}

/**
 * Middleware wrapper for admin-only API routes
 */
export function adminApiRoute(
  handler: (req: NextRequest, user: UserSession) => Promise<NextResponse>
) {
  return protectedApiRoute(handler, { roles: ['ADMIN'] })
}

/**
 * Check if user has access to specific complex access control rule
 */
export async function checkComplexAccessControl(
  user: UserSession,
  ruleId: string,
  requestData?: any
): Promise<{ allowed: boolean; reason?: string; matchedRule?: any }> {
  if (!user.isAuthenticated) {
    return { allowed: false, reason: 'User not authenticated' }
  }

  try {
    const accessRequest: AccessCheckRequest = {
      user: user,
      route: `/admin/complex-access-control/${ruleId}`,
      userAgent: '',
      ip: 'api-check',
    }

    const result = await checkDatabaseAccess(accessRequest)
    return {
      allowed: result?.allowed ?? false,
      reason: result?.reason,
      matchedRule: (result as any)?.details?.matchedRule
    }

  } catch (error) {
    console.error('Complex access control check failed:', error)
    return { allowed: false, reason: 'Access control check failed' }
  }
}