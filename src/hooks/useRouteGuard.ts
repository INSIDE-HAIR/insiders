"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  UserSession, 
  AccessCheckResult, 
  RouteConfig,
  UserRole 
} from '@/types/routes'
import { 
  checkRouteAccess, 
  getAccessibleRoutes, 
  getEffectiveRole,
  isValidDomain 
} from '@/lib/route-guard'

interface UseRouteGuardReturn {
  isLoading: boolean
  hasAccess: boolean
  accessResult: AccessCheckResult | null
  user: UserSession | null
  effectiveRole: UserRole
  canAccess: (path: string) => boolean
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
  const user: UserSession | null = session?.user ? {
    id: session.user.email || '',
    email: session.user.email || '',
    role: (session.user as any).role || 'user',
    permissions: getPermissionsForRole((session.user as any).role || 'user'),
    isAuthenticated: true,
    domain: session.user.email?.split('@')[1]
  } : null

  const effectiveRole = getEffectiveRole(user)

  // Check current route access
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
      return
    }

    const result = checkRouteAccess(pathname, user)
    setAccessResult(result)
    setIsLoading(false)

    // Auto-redirect if access denied and redirect is specified
    if (!result.allowed && result.redirect) {
      router.push(result.redirect)
    }
  }, [pathname, user, status, router])

  // Function to check access to any path
  const canAccess = useCallback((path: string): boolean => {
    return checkRouteAccess(path, user).allowed
  }, [user])

  // Function to get all accessible routes
  const getAccessibleRoutesCallback = useCallback((): RouteConfig[] => {
    return getAccessibleRoutes(user)
  }, [user])

  // Function to redirect to an authorized route
  const redirectToAuthorized = useCallback(() => {
    const accessibleRoutes = getAccessibleRoutes(user)
    
    if (accessibleRoutes.length > 0) {
      // Try to find a suitable route based on user role
      let targetRoute = '/'
      
      if (user?.role === 'admin' || user?.role === 'super-admin') {
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
  }, [user, router])

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

  const isAdminRoute = pathname.startsWith('/admin')
  const canAccessAdmin = routeGuard.user?.role === 'admin' || routeGuard.user?.role === 'super-admin'

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
      'user-management': ['admin', 'super-admin'],
      'calendar-management': ['admin', 'super-admin'],
      'drive-management': ['admin', 'super-admin'],
      'holded-integration': ['admin', 'super-admin'],
      'sitemap-management': ['super-admin'],
      'system-configuration': ['super-admin'],
      'content-editing': ['editor', 'admin', 'super-admin'],
      'analytics': ['admin', 'super-admin']
    }

    const requiredRoles = featurePermissions[feature as keyof typeof featurePermissions]
    return requiredRoles ? requiredRoles.includes(user.role) : false
  }, [user])

  const hasPermission = useCallback((permission: string): boolean => {
    return user?.permissions.includes(permission as any) ?? false
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
function getPermissionsForRole(role: UserRole) {
  const permissions = {
    'user': ['read'],
    'editor': ['read', 'write'],
    'admin': ['read', 'write', 'manage'],
    'super-admin': ['read', 'write', 'manage', 'configure']
  }
  
  return permissions[role] || permissions['user']
}