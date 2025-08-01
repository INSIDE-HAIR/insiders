import { RouteConfig, UserSession, AccessCheckResult, RoutesConfiguration, RouteMatch, UserRole } from '../types/routes';
import routesConfig from '@/config/routes-config.json'

class RouteGuard {
  private config: RoutesConfiguration
  private cache: Map<string, AccessCheckResult> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.config = routesConfig as RoutesConfiguration
  }

  /**
   * Check if user has access to a specific route
   */
  checkAccess(path: string, user: UserSession | null): AccessCheckResult {
    // Check cache first
    const cacheKey = `${path}-${user?.id || 'anonymous'}-${user?.role || 'none'}`
    const cached = this.cache.get(cacheKey)
    if (cached) {
      return cached
    }

    const result = this.performAccessCheck(path, user)
    
    // Cache the result
    this.cache.set(cacheKey, result)
    setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout)

    return result
  }

  private performAccessCheck(path: string, user: UserSession | null): AccessCheckResult {
    // Check maintenance mode
    if (this.config.exceptions.maintenance.enabled) {
      if (!this.isMaintenanceAllowed(user)) {
        return {
          allowed: false,
          reason: 'Site is under maintenance',
          redirect: this.config.redirects.maintenance
        }
      }
    }

    // Find matching route
    const routeMatch = this.findRoute(path)
    if (!routeMatch) {
      return {
        allowed: false,
        reason: 'Route not found',
        redirect: this.config.redirects.notFound
      }
    }

    const { route } = routeMatch

    // Check email exceptions first
    if (user?.email && this.config.exceptions.byEmail[user.email]) {
      const exception = this.config.exceptions.byEmail[user.email]
      if (this.matchesRoutePattern(path, exception.allowedRoutes)) {
        return { allowed: true }
      }
    }

    // Check domain exceptions
    if (user?.domain) {
      const domainKey = `@${user.domain}`
      const domainException = this.config.exceptions.byDomain[domainKey]
      if (domainException && this.matchesRoutePattern(path, domainException.allowedRoutes)) {
        return { allowed: true }
      }
    }

    // Check basic access requirements
    return this.checkRouteAccess(route, user)
  }

  private checkRouteAccess(route: RouteConfig, user: UserSession | null): AccessCheckResult {
    const { access } = route

    // Public routes - always accessible
    if (access.type === 'public' && !access.requireAuth) {
      // Check if authenticated user should be redirected
      if (user?.isAuthenticated && access.redirectIfAuthenticated) {
        return {
          allowed: true,
          redirect: access.redirectIfAuthenticated
        }
      }
      return { allowed: true }
    }

    // Auth routes - only for non-authenticated users
    if (access.type === 'auth') {
      if (user?.isAuthenticated && access.redirectIfAuthenticated) {
        return {
          allowed: true,
          redirect: access.redirectIfAuthenticated
        }
      }
      return { allowed: true }
    }

    // All other routes require authentication
    if (!user?.isAuthenticated) {
      return {
        allowed: false,
        reason: 'Authentication required',
        redirect: this.config.redirects.unauthorized
      }
    }

    // Check role requirements
    if (access.roles && access.roles.length > 0) {
      if (!access.roles.includes(user.role)) {
        return {
          allowed: false,
          reason: 'Insufficient role privileges',
          redirect: this.config.redirects.forbidden,
          requiredRole: access.roles[0]
        }
      }
    }

    // Check email requirements
    if (access.emails && access.emails.length > 0) {
      if (!access.emails.includes(user.email)) {
        return {
          allowed: false,
          reason: 'Email not authorized',
          redirect: this.config.redirects.forbidden,
          requiredEmail: access.emails[0]
        }
      }
    }

    // Check domain requirements
    if (access.domains && access.domains.length > 0) {
      const userDomain = user.email.split('@')[1]
      const allowedDomains = access.domains.map(d => d.replace('@', ''))
      
      if (!allowedDomains.includes(userDomain)) {
        return {
          allowed: false,
          reason: 'Domain not authorized',
          redirect: this.config.redirects.forbidden,
          requiredDomain: access.domains[0]
        }
      }
    }

    return { allowed: true }
  }

  private findRoute(path: string): RouteMatch | null {
    // Remove query parameters and hash
    const cleanPath = path.split('?')[0].split('#')[0]
    
    // Check all route categories
    for (const category of Object.values(this.config.routes)) {
      const match = this.searchRoutes(category, cleanPath)
      if (match) return match
    }

    return null
  }

  private searchRoutes(routes: RouteConfig[], targetPath: string, parentPath = ''): RouteMatch | null {
    for (const route of routes) {
      const fullPath = parentPath + route.path
      
      // Exact match
      if (fullPath === targetPath) {
        return {
          route,
          params: {},
          query: {}
        }
      }

      // Dynamic route matching (basic implementation)
      if (this.matchesDynamicRoute(fullPath, targetPath)) {
        return {
          route,
          params: this.extractParams(fullPath, targetPath),
          query: {}
        }
      }

      // Search children
      if (route.children) {
        const childMatch = this.searchRoutes(route.children, targetPath, fullPath)
        if (childMatch) return childMatch
      }
    }

    return null
  }

  private matchesDynamicRoute(routePath: string, targetPath: string): boolean {
    const routeSegments = routePath.split('/')
    const targetSegments = targetPath.split('/')

    if (routeSegments.length !== targetSegments.length) return false

    return routeSegments.every((segment, index) => {
      if (segment.startsWith('[') && segment.endsWith(']')) return true
      if (segment.startsWith('[...') && segment.endsWith(']')) return true
      return segment === targetSegments[index]
    })
  }

  private extractParams(routePath: string, targetPath: string): Record<string, string> {
    const routeSegments = routePath.split('/')
    const targetSegments = targetPath.split('/')
    const params: Record<string, string> = {}

    routeSegments.forEach((segment, index) => {
      if (segment.startsWith('[') && segment.endsWith(']')) {
        const paramName = segment.slice(1, -1)
        if (paramName.startsWith('...')) {
          // Catch-all route
          const catchAllName = paramName.slice(3)
          params[catchAllName] = targetSegments.slice(index).join('/')
        } else {
          params[paramName] = targetSegments[index]
        }
      }
    })

    return params
  }

  private matchesRoutePattern(path: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
      if (pattern === '*') return true
      if (pattern.endsWith('/*')) {
        const prefix = pattern.slice(0, -2)
        return path.startsWith(prefix)
      }
      return path === pattern
    })
  }

  private isMaintenanceAllowed(user: UserSession | null): boolean {
    if (!user) return false
    
    const maintenance = this.config.exceptions.maintenance
    
    // Check allowed roles
    if (maintenance.allowedRoles.includes(user.role)) return true
    
    // Check allowed emails
    if (maintenance.allowedEmails.includes(user.email)) return true
    
    return false
  }

  /**
   * Get all routes that user can access
   */
  getAccessibleRoutes(user: UserSession | null): RouteConfig[] {
    const accessible: RouteConfig[] = []
    
    for (const category of Object.values(this.config.routes)) {
      for (const route of category) {
        if (this.checkAccess(route.path, user).allowed) {
          accessible.push(route)
        }
      }
    }
    
    return accessible
  }

  /**
   * Get user's effective role (considering exceptions)
   */
  getEffectiveRole(user: UserSession | null): UserRole {
    if (!user) return this.config.settings.defaultRole

    // Check email exceptions
    if (this.config.exceptions.byEmail[user.email]) {
      return this.config.exceptions.byEmail[user.email].accessLevel
    }

    // Check domain exceptions
    if (user.domain) {
      const domainKey = `@${user.domain}`
      const domainException = this.config.exceptions.byDomain[domainKey]
      if (domainException) {
        return domainException.defaultRole
      }
    }

    return user.role
  }

  /**
   * Clear access cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get route configuration
   */
  getConfig(): RoutesConfiguration {
    return this.config
  }

  /**
   * Validate email domain
   */
  isValidDomain(email: string): boolean {
    const domain = email.split('@')[1]
    return this.config.settings.allowedDomains.some(
      allowedDomain => allowedDomain === `@${domain}` || allowedDomain === '*'
    )
  }
}

// Singleton instance
export const routeGuard = new RouteGuard()

// Helper functions
export function checkRouteAccess(path: string, user: UserSession | null): AccessCheckResult {
  return routeGuard.checkAccess(path, user)
}

export function getAccessibleRoutes(user: UserSession | null): RouteConfig[] {
  return routeGuard.getAccessibleRoutes(user)
}

export function getEffectiveRole(user: UserSession | null): UserRole {
  return routeGuard.getEffectiveRole(user)
}

export function isValidDomain(email: string): boolean {
  return routeGuard.isValidDomain(email)
}