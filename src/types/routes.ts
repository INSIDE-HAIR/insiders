export type AccessType = 'public' | 'private' | 'auth' | 'admin' | 'api'
export type UserRole = 'user' | 'editor' | 'admin' | 'super-admin'
export type Permission = 'read' | 'write' | 'manage' | 'configure'

export interface RoleDefinition {
  name: string
  description: string
  permissions: Permission[]
}

export interface RouteAccess {
  type: AccessType
  requireAuth: boolean
  roles?: UserRole[]
  emails?: string[]
  domains?: string[]
  redirectIfAuthenticated?: string
}

export interface RouteMetadata {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
  noIndex?: boolean
}

export interface RouteConfig {
  path: string
  label: string
  access: RouteAccess
  component?: string
  redirect?: string
  children?: RouteConfig[]
  metadata?: RouteMetadata
  params?: Record<string, string>
  query?: Record<string, string>
}

export interface EmailException {
  accessLevel: UserRole
  bypassDomainCheck: boolean
  allowedRoutes: string[]
}

export interface DomainException {
  defaultRole: UserRole
  allowedRoutes: string[]
}

export interface MaintenanceConfig {
  enabled: boolean
  allowedRoles: UserRole[]
  allowedEmails: string[]
  maintenancePage: string
}

export interface RouteExceptions {
  byEmail: Record<string, EmailException>
  byDomain: Record<string, DomainException>
  maintenance: MaintenanceConfig
}

export interface RouteRedirects {
  unauthorized: string
  forbidden: string
  notFound: string
  maintenance: string
}

export interface RouteSettings {
  defaultRole: UserRole
  allowedDomains: string[]
  roles: Record<UserRole, RoleDefinition>
}

export interface RoutesConfiguration {
  version: string
  lastUpdated: string
  settings: RouteSettings
  routes: {
    public: RouteConfig[]
    auth: RouteConfig[]
    private: RouteConfig[]
    admin: RouteConfig[]
    api: RouteConfig[]
    marketing: RouteConfig[]
  }
  exceptions: RouteExceptions
  redirects: RouteRedirects
}

// Helper types for route matching
export interface RouteMatch {
  route: RouteConfig
  params: Record<string, string>
  query: Record<string, string>
}

export interface AccessCheckResult {
  allowed: boolean
  reason?: string
  redirect?: string
  requiredRole?: UserRole
  requiredEmail?: string
  requiredDomain?: string
}

// User session types
export interface UserSession {
  id: string
  email: string
  role: UserRole
  permissions: Permission[]
  isAuthenticated: boolean
  domain?: string
}

// Route guard configuration
export interface RouteGuardConfig {
  enableLogging: boolean
  strictMode: boolean
  cacheDuration: number
  redirectDelay: number
}