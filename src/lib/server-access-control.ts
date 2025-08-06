import { redirect } from 'next/navigation'
import { auth } from '@/src/config/auth/auth'
import { checkDatabaseAccess, AccessCheckRequest } from './access-control-service'
import { UserSession, UserRole, Permission } from '../types/routes'
import { headers } from 'next/headers'

/**
 * Server-side access control for pages and server components
 * This implements database-powered access control that was moved out of middleware
 */

interface PageAccessOptions {
  requiredRole?: UserRole | UserRole[]
  requiredPermissions?: string[]
  teams?: string[]
  redirectTo?: string
  skipDatabaseCheck?: boolean
}

/**
 * Server action to validate page access with database checks
 * Use this in server components and pages that need complex access control
 */
export async function validatePageAccess(
  path: string,
  options: PageAccessOptions = {}
): Promise<UserSession> {
  const session = await auth()
  
  if (!session?.user) {
    redirect(options.redirectTo || '/es/auth/login')
  }

  const user = createUserSessionFromServerSession(session)
  
  // Check role requirements
  const requiredRoles = Array.isArray(options.requiredRole) 
    ? options.requiredRole 
    : options.requiredRole ? [options.requiredRole] : []
    
  if (requiredRoles.length > 0 && !requiredRoles.map(r => r.toLowerCase()).includes(user.role.toLowerCase())) {
    console.log(`❌ Role check failed for ${user.email}: required ${requiredRoles}, has ${user.role}`)
    redirect('/es/unauthorized')
  }

  // Check database access control (if not skipped)
  if (!options.skipDatabaseCheck) {
    try {
      const headersList = await headers()
      const userAgent = headersList.get('user-agent') || ''
      const forwardedFor = headersList.get('x-forwarded-for')
      const realIP = headersList.get('x-real-ip')
      const ipAddress = forwardedFor || realIP || 'unknown'

      const dbAccessRequest: AccessCheckRequest = {
        user: user,
        route: path,
        userAgent,
        ip: ipAddress,
      }

      const dbAccessResult = await checkDatabaseAccess(dbAccessRequest)
      
      if (dbAccessResult && !dbAccessResult.allowed) {
        console.log(`❌ DB Access denied for ${user.email} to ${path}: ${dbAccessResult.reason}`)
        redirect('/es/unauthorized')
      }

      console.log(`✅ DB Access granted for ${user.email} to ${path}`)
      
    } catch (dbError) {
      console.error('Database access check failed in server component:', dbError)
      
      // In case of DB error, continue with config-based validation
      // This ensures pages remain accessible even if DB is temporarily unavailable
      console.log('⚠️ Server component falling back to config-based access control')
    }
  }

  return user
}

/**
 * Validate admin access for admin pages
 */
export async function validateAdminAccess(path: string): Promise<UserSession> {
  return validatePageAccess(path, {
    requiredRole: 'ADMIN',
    redirectTo: '/es/auth/login'
  })
}

/**
 * Validate complex access control rule access
 */
export async function validateComplexAccessControl(
  ruleId: string,
  path: string
): Promise<{ user: UserSession; hasAccess: boolean; reason?: string }> {
  const user = await validatePageAccess(path, { requiredRole: 'ADMIN' })
  
  try {
    const accessRequest: AccessCheckRequest = {
      user: user,
      route: path,
      userAgent: '',
      ip: 'server-component',
    }

    const result = await checkDatabaseAccess(accessRequest)
    
    return {
      user,
      hasAccess: result?.allowed ?? false,
      reason: result?.reason
    }
    
  } catch (error) {
    console.error('Complex access validation failed:', error)
    return {
      user,
      hasAccess: false,
      reason: 'Access validation failed'
    }
  }
}

/**
 * Check if user can access specific admin feature
 */
export async function canAccessAdminFeature(
  feature: string,
  user?: UserSession
): Promise<boolean> {
  if (!user) {
    const session = await auth()
    if (!session?.user) return false
    user = createUserSessionFromServerSession(session)
  }

  const adminFeatures = {
    'users': ['ADMIN'],
    'calendar': ['ADMIN'],
    'drive': ['ADMIN'],
    'holded': ['ADMIN'],
    'sitemap': ['ADMIN'],
    'system-config': ['ADMIN'],
    'access-control': ['ADMIN'],
    'complex-access-control': ['ADMIN'],
    'user-exceptions': ['ADMIN'],
    'analytics': ['ADMIN']
  }

  const requiredRoles = adminFeatures[feature as keyof typeof adminFeatures]
  if (!requiredRoles) return false

  // Basic role check
  if (!requiredRoles.map(r => r.toLowerCase()).includes(user.role.toLowerCase())) return false

  // Database check for enhanced security
  try {
    const accessRequest: AccessCheckRequest = {
      user: user,
      route: `/admin/${feature}`,
      userAgent: '',
      ip: 'server-component',
    }

    const result = await checkDatabaseAccess(accessRequest)
    return result?.allowed ?? false

  } catch (error) {
    console.error(`Feature access check failed for ${feature}:`, error)
    // Fall back to role-based check if DB fails
    return requiredRoles.map(r => r.toLowerCase()).includes(user.role.toLowerCase())
  }
}

/**
 * Get user session for server components
 */
export async function getServerUserSession(): Promise<UserSession | null> {
  const session = await auth()
  return session?.user ? createUserSessionFromServerSession(session) : null
}

function createUserSessionFromServerSession(session: any): UserSession {
  const email = session.user.email
  const domain = email?.split('@')[1]
  
  return {
    id: session.user.id || session.user.email,
    email: email,
    role: session.user.role || 'CLIENT',
    permissions: getPermissionsForRole(session.user.role || 'CLIENT'),
    isAuthenticated: true,
    domain
  }
}

function getPermissionsForRole(role: UserRole): Permission[] {
  const permissions: Record<UserRole, Permission[]> = {
    CLIENT: ["read"],
    EMPLOYEE: ["read", "write"],
    ADMIN: ["read", "write", "manage", "configure"]
  }
  
  return permissions[role] || permissions['CLIENT']
}

/**
 * Type for page access validation results
 */
export interface PageAccessValidationResult {
  user: UserSession;
  hasAccess: boolean;
  redirectUrl?: string;
}