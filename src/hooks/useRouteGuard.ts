"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import type { UserSession, AccessCheckResult, RouteConfig, UserRole, Permission } from '../types/routes';
import { 
  checkRouteAccess, 
  getAccessibleRoutes, 
  getEffectiveRole,
  isValidDomain 
} from '../lib/route-guard';

interface UseRouteGuardReturn {
  isLoading: boolean
  hasAccess: boolean
  accessResult: AccessCheckResult | null
  user: UserSession | null
  effectiveRole: UserRole
  canAccess: (path: string) => Promise<boolean>
  getAccessibleRoutes: () => RouteConfig[]
  redirectToAuthorized: () => void
}

export function useRouteGuard(): UseRouteGuardReturn {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  
  const [accessResult, setAccessResult] = useState<AccessCheckResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Convert NextAuth session to UserSession
  const user: UserSession | null = useMemo(() => {
    if (!session?.user) return null;
    return {
      id: session.user.email || '',
      email: session.user.email || '',
      role: (session.user as any).role || 'CLIENT',
      permissions: getPermissionsForRole((session.user as any).role || 'CLIENT'),
      isAuthenticated: true,
      domain: session.user.email?.split('@')[1]
    };
  }, [session])

  const effectiveRole = useMemo(() => getEffectiveRole(user), [user])

  // Check current route access
  useEffect(() => {
    if (status === 'loading' || !pathname) {
      setIsLoading(true)
      return
    }

    checkRouteAccess(pathname, user).then(result => {
      setAccessResult(result)
      setIsLoading(false)

      // Auto-redirect if access denied and redirect is specified
      if (!result.allowed && result.redirect) {
        router.push(result.redirect)
      }
    })
  }, [pathname, user, status, router])

  // Function to check access to any path (async version)
  const canAccess = useCallback(async (path: string): Promise<boolean> => {
    const result = await checkRouteAccess(path, user)
    return result.allowed
  }, [user])

  // Function to get all accessible routes
  const getAccessibleRoutesCallback = useCallback((): RouteConfig[] => {
    return getAccessibleRoutes(user)
  }, [user])

  // Function to redirect to an authorized route
  const redirectToAuthorized = useCallback(() => {
    const accessibleRoutes = getAccessibleRoutesCallback()
    
    if (accessibleRoutes.length > 0) {
      // Try to find a suitable route based on user role
      let targetRoute = '/'
      
      if (user?.role === 'ADMIN') {
        const adminRoute = accessibleRoutes.find(r => r.path.startsWith('/admin'))
        if (adminRoute) targetRoute = adminRoute.path
      } else if (user?.isAuthenticated) {
        const profileRoute = accessibleRoutes.find(r => r.path === '/profile')
        if (profileRoute) targetRoute = profileRoute.path
      }
      
      router.push(targetRoute)
    } else {
      router.push('/')
    }
  }, [user, router, getAccessibleRoutesCallback])

  return {
    isLoading,
    hasAccess: accessResult?.allowed ?? false,
    accessResult,
    user,
    effectiveRole,
    canAccess,
    getAccessibleRoutes: getAccessibleRoutesCallback,
    redirectToAuthorized
  }
}

// Hook specifically for admin routes
export function useAdminRouteGuard() {
  const routeGuard = useRouteGuard()
  const pathname = usePathname()

  const isAdminRoute = pathname?.startsWith('/admin') ?? false
  const canAccessAdmin = routeGuard.user?.role === 'ADMIN'

  return {
    ...routeGuard,
    isAdminRoute,
    canAccessAdmin,
    isAdminUser: canAccessAdmin
  }
}

// Hook for checking specific features
export function useFeatureAccess() {
  const { user } = useRouteGuard()

  const canAccessFeature = useCallback((feature: string): boolean => {
    if (!user?.isAuthenticated) return false

    const featurePermissions = {
      'user-management': ['ADMIN'],
      'calendar-management': ['ADMIN'],
      'drive-management': ['ADMIN'],
      'holded-integration': ['ADMIN'],
      'sitemap-management': ['ADMIN'],
      'system-configuration': ['ADMIN'],
      'content-editing': ['EMPLOYEE', 'ADMIN'],
      'analytics': ['ADMIN']
    }

    const requiredRoles = featurePermissions[feature as keyof typeof featurePermissions]
    return requiredRoles ? requiredRoles.includes(user.role) : false
  }, [user])

  const hasPermission = useCallback((permission: Permission): boolean => {
    return user?.permissions.includes(permission) ?? false
  }, [user])

  return {
    canAccessFeature,
    hasPermission,
    user
  }
}

// Hook for domain validation
export function useDomainValidation() {
  const { user } = useRouteGuard()

  const validateUserDomain = useCallback((email: string): boolean => {
    return isValidDomain(email)
  }, [])

  const isUserDomainValid = user ? isValidDomain(user.email) : false

  return {
    validateUserDomain,
    isUserDomainValid,
    userDomain: user?.domain
  }
}

// Utility function to get permissions for role
function getPermissionsForRole(role: UserRole): Permission[] {
  const permissions: Record<UserRole, Permission[]> = {
    'CLIENT': ['read'],
    'EMPLOYEE': ['read', 'write'],
    'ADMIN': ['read', 'write', 'manage', 'configure'],
    'DEBTOR': ['read'],
    'PROVIDER': ['read', 'write'],
    'LEAD': ['read', 'write', 'manage']
  }
  
  return permissions[role] || permissions['CLIENT']
}