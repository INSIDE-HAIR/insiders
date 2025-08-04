import { RouteConfig, UserSession, AccessCheckResult, RoutesConfiguration, RouteMatch, UserRole } from '../types/routes';
import routesConfig from '../../config/routes-config.json'
import { checkDatabaseAccess, AccessCheckRequest } from './access-control-service';

class RouteGuard {
  private config: RoutesConfiguration
  private cache: Map<string, AccessCheckResult> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.config = routesConfig as unknown as RoutesConfiguration
  }

  /**
   * Check database exceptions for user - DISABLED for Edge Runtime
   * Database checks will be performed in API routes and server components
   */
  private async checkDatabaseExceptions(email: string, path: string): Promise<AccessCheckResult | null> {
    // Disabled in middleware due to Edge Runtime limitations
    // Database exceptions will be checked in:
    // 1. API route middleware
    // 2. Server components 
    // 3. Page-level access checks
    return null
  }

  /**
   * Check if user has access to a specific route
   */
  async checkAccess(path: string, user: UserSession | null, request?: {
    ip?: string;
    userAgent?: string;
    geo?: { country?: string; region?: string; city?: string };
  }): Promise<AccessCheckResult> {
    // Check cache first
    const cacheKey = `${path}-${user?.id || 'anonymous'}-${user?.role || 'none'}`
    const cached = this.cache.get(cacheKey)
    if (cached) {
      return cached
    }

    const result = await this.performAccessCheck(path, user, request)
    
    // Cache the result
    this.cache.set(cacheKey, result)
    setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout)

    return result
  }

  private async performAccessCheck(path: string, user: UserSession | null, request?: {
    ip?: string;
    userAgent?: string;
    geo?: { country?: string; region?: string; city?: string };
  }): Promise<AccessCheckResult> {
    // Debug logging for route guard
    if (process.env.NODE_ENV === 'production' || process.env.DEBUG_AUTH) {
      console.log(`\n======= ROUTE ACCESS CHECK =======`);
      console.log(`Checking access for path: ${path}`);
      console.log(`User:`, user ? {
        id: user.id,
        email: user.email,
        role: user.role,
        domain: user.domain,
        permissions: user.permissions,
        isAuthenticated: user.isAuthenticated
      } : 'null');
    }

    // Prevent infinite redirects by allowing specific paths
    const allowedPaths = ['/404', '/unauthorized', '/maintenance', '/es', '/en', '/', '/es/auth', '/en/auth', '/es/auth/login', '/en/auth/login'];
    if (allowedPaths.includes(path)) {
      if (process.env.NODE_ENV === 'production' || process.env.DEBUG_AUTH) {
        console.log(`Path ${path} is in allowed system paths`);
        console.log(`=================================\n`);
      }
      return { allowed: true, reason: 'System path allowed' };
    }

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
      // If it's a localized path starting with /es/ or /en/, try to find the generic pattern
      if (path.startsWith('/es/') || path.startsWith('/en/')) {
        const genericPath = path.replace(/^\/[a-z]{2}/, '/[lang]');
        const genericMatch = this.findRoute(genericPath);
        if (genericMatch) {
          return this.checkRouteAccess(genericMatch.route, user);
        }
        
        // Try with catch-all patterns for content routes
        const pathSegments = path.split('/').slice(2); // Remove /es/ or /en/
        if (pathSegments.length > 0) {
          const baseSection = pathSegments[0]; // formaciones, consultoria, etc.
          const catchAllPattern = `/[lang]/${baseSection}/[...slug]`;
          const catchAllMatch = this.findRoute(catchAllPattern);
          if (catchAllMatch) {
            return this.checkRouteAccess(catchAllMatch.route, user);
          }
        }
      }
      
      return {
        allowed: false,
        reason: 'Route not found',
        redirect: this.config.redirects.notFound
      }
    }

    const { route } = routeMatch

    // PRIORITY 1: Database access control disabled in middleware (Edge Runtime incompatible)
    // Will be checked in API routes and server components instead
    
    // PRIORITY 2: Database exceptions disabled in middleware (Edge Runtime incompatible)
    // Will be checked in API routes and server components instead

    // PRIORITY 3: Check email exceptions from config (fallback)
    if (user?.email && this.config.exceptions.byEmail[user.email]) {
      const exception = this.config.exceptions.byEmail[user.email]
      if (exception && this.matchesRoutePattern(path, exception.allowedRoutes)) {
        return { allowed: true, reason: 'Config email exception allows access' }
      }
    }

    // PRIORITY 4: Check domain exceptions
    if (user?.domain) {
      const domainKey = `@${user.domain}`
      const domainException = this.config.exceptions.byDomain[domainKey]
      if (domainException && this.matchesRoutePattern(path, domainException.allowedRoutes)) {
        return { allowed: true, reason: 'Config domain exception allows access' }
      }
    }

    // PRIORITY 5: Check basic access requirements (default)
    return this.checkRouteAccess(route, user)
  }

  private checkRouteAccess(route: RouteConfig, user: UserSession | null): AccessCheckResult {
    const { access } = route

    if (process.env.NODE_ENV === 'production' || process.env.DEBUG_AUTH) {
      console.log(`\n======= ROUTE CONFIG CHECK =======`);
      console.log(`Route path: ${route.path}`);
      console.log(`Route access type: ${access.type}`);
      console.log(`Route required roles:`, access.roles);
      console.log(`Route required emails:`, access.emails);
      console.log(`Route required domains:`, access.domains);
      console.log(`User role: ${user?.role}`);
      console.log(`User email: ${user?.email}`);
      console.log(`User domain: ${user?.domain}`);
    }

    // Public routes - always accessible
    if (access.type === 'public' && !access.requireAuth) {
      // Check if authenticated user should be redirected
      if (user?.isAuthenticated && access.redirectIfAuthenticated) {
        if (process.env.NODE_ENV === 'production' || process.env.DEBUG_AUTH) {
          console.log(`Public route with redirect for authenticated users to: ${access.redirectIfAuthenticated}`);
          console.log(`=================================\n`);
        }
        return {
          allowed: true,
          redirect: access.redirectIfAuthenticated
        }
      }
      if (process.env.NODE_ENV === 'production' || process.env.DEBUG_AUTH) {
        console.log(`Public route - access granted`);
        console.log(`=================================\n`);
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
      const hasRole = access.roles.includes(user.role);
      if (process.env.NODE_ENV === 'production' || process.env.DEBUG_AUTH) {
        console.log(`Role check - Required: ${JSON.stringify(access.roles)}, User has: "${user.role}", Match: ${hasRole}`);
      }
      if (!hasRole) {
        if (process.env.NODE_ENV === 'production' || process.env.DEBUG_AUTH) {
          console.log(`Access denied - insufficient role privileges`);
          console.log(`=================================\n`);
        }
        return {
          allowed: false,
          reason: `Insufficient role privileges. Required: ${access.roles.join(', ')}, User has: ${user.role}`,
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
      const userDomain = user.email.split('@')[1] || ''
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
    const cleanPath = (path.split('?')[0] || '').split('#')[0] || ''
    
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

    // Handle catch-all routes [...slug]
    const hasCatchAll = routeSegments.some(segment => segment.startsWith('[...') && segment.endsWith(']'))
    if (hasCatchAll) {
      const catchAllIndex = routeSegments.findIndex(segment => segment.startsWith('[...') && segment.endsWith(']'))
      // Check segments before catch-all
      for (let i = 0; i < catchAllIndex; i++) {
        const routeSegment = routeSegments[i]
        const targetSegment = targetSegments[i]
        
        if (!targetSegment) return false
        
        if (routeSegment && routeSegment.startsWith('[') && routeSegment.endsWith(']')) {
          continue // Dynamic segment matches
        }
        if (routeSegment !== targetSegment) {
          return false
        }
      }
      // If we have more target segments than route segments up to catch-all, it matches
      return targetSegments.length >= catchAllIndex
    }

    // Normal dynamic route matching
    if (routeSegments.length !== targetSegments.length) return false

    return routeSegments.every((segment, index) => {
      if (segment.startsWith('[') && segment.endsWith(']')) return true
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
          params[paramName] = targetSegments[index] || ''
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
   * Get all routes that user can access (synchronous - uses config only)
   */
  getAccessibleRoutes(user: UserSession | null): RouteConfig[] {
    const accessible: RouteConfig[] = []
    
    for (const category of Object.values(this.config.routes)) {
      for (const route of category) {
        // Use synchronous route check (config only, no DB)
        const result = this.checkRouteAccess(route, user)
        if (result.allowed) {
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
      return this.config.exceptions.byEmail[user.email]?.accessLevel || this.config.settings.defaultRole
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
export async function checkRouteAccess(path: string, user: UserSession | null, request?: {
  ip?: string;
  userAgent?: string;
  geo?: { country?: string; region?: string; city?: string };
}): Promise<AccessCheckResult> {
  return await routeGuard.checkAccess(path, user, request)
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