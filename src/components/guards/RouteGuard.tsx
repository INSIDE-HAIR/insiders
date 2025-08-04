"use client"

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRouteGuard } from '@/src/hooks/useRouteGuard'
import { Spinner } from '@/src/components/ui/spinner'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Button } from '@/src/components/ui/button'
import { Shield, AlertTriangle, Lock, Users } from 'lucide-react'

interface RouteGuardProps {
  children: ReactNode
  fallback?: ReactNode
  showAccessDenied?: boolean
  redirectOnDenied?: boolean
  requiredRole?: 'user' | 'editor' | 'admin' | 'super-admin'
  requiredPermission?: string
  allowedEmails?: string[]
  allowedDomains?: string[]
}

export function RouteGuard({
  children,
  fallback,
  showAccessDenied = true,
  redirectOnDenied = true,
  requiredRole,
  requiredPermission,
  allowedEmails,
  allowedDomains
}: RouteGuardProps) {
  const {
    isLoading,
    hasAccess,
    accessResult,
    user,
    redirectToAuthorized
  } = useRouteGuard()

  const router = useRouter()

  // Additional checks based on props
  const hasRequiredRole = !requiredRole || (user?.role && getRoleHierarchy().indexOf(user.role) >= getRoleHierarchy().indexOf(requiredRole))
  const hasRequiredPermission = !requiredPermission || user?.permissions.includes(requiredPermission as any)
  const hasAllowedEmail = !allowedEmails || (user?.email && allowedEmails.includes(user.email))
  const hasAllowedDomain = !allowedDomains || (user?.domain && allowedDomains.some(domain => domain.replace('@', '') === user.domain))

  const finalAccess = hasAccess && hasRequiredRole && hasRequiredPermission && hasAllowedEmail && hasAllowedDomain

  useEffect(() => {
    if (!isLoading && !finalAccess && redirectOnDenied && accessResult?.redirect) {
      router.push(accessResult.redirect)
    }
  }, [isLoading, finalAccess, redirectOnDenied, accessResult, router])

  if (isLoading) {
    return fallback || <RouteGuardLoading />
  }

  if (!finalAccess) {
    if (showAccessDenied) {
      return <AccessDeniedComponent 
        accessResult={accessResult}
        onRedirect={redirectToAuthorized}
        requiredRole={requiredRole}
        user={user}
      />
    }
    return fallback || null
  }

  return <>{children}</>
}

// Specialized guards for different access levels
export function AdminRouteGuard({ children, ...props }: Omit<RouteGuardProps, 'requiredRole'>) {
  return (
    <RouteGuard requiredRole="admin" {...props}>
      {children}
    </RouteGuard>
  )
}

export function SuperAdminRouteGuard({ children, ...props }: Omit<RouteGuardProps, 'requiredRole'>) {
  return (
    <RouteGuard requiredRole="super-admin" {...props}>
      {children}
    </RouteGuard>
  )
}

export function EditorRouteGuard({ children, ...props }: Omit<RouteGuardProps, 'requiredRole'>) {
  return (
    <RouteGuard requiredRole="editor" {...props}>
      {children}
    </RouteGuard>
  )
}

export function AuthenticatedRouteGuard({ children, ...props }: RouteGuardProps) {
  return (
    <RouteGuard {...props}>
      {children}
    </RouteGuard>
  )
}

// Domain-specific guards
export function InsideSalonsGuard({ children, ...props }: Omit<RouteGuardProps, 'allowedDomains'>) {
  return (
    <RouteGuard allowedDomains={['@insidesalons.com']} {...props}>
      {children}
    </RouteGuard>
  )
}

// Loading component
function RouteGuardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Spinner className="mx-auto mb-4" size="lg" show={true} />
        <p className="text-gray-600">Verificando acceso...</p>
      </div>
    </div>
  )
}

// Access denied component
interface AccessDeniedProps {
  accessResult: any
  onRedirect: () => void
  requiredRole?: string
  user: any
}

function AccessDeniedComponent({ accessResult, onRedirect, requiredRole, user }: AccessDeniedProps) {
  const getIcon = () => {
    if (accessResult?.reason?.includes('Authentication')) return <Lock className="h-8 w-8" />
    if (accessResult?.reason?.includes('role') || requiredRole) return <Shield className="h-8 w-8" />
    if (accessResult?.reason?.includes('Email') || accessResult?.reason?.includes('Domain')) return <Users className="h-8 w-8" />
    return <AlertTriangle className="h-8 w-8" />
  }

  const getTitle = () => {
    if (accessResult?.reason?.includes('Authentication')) return 'Autenticación Requerida'
    if (accessResult?.reason?.includes('role') || requiredRole) return 'Permisos Insuficientes'
    if (accessResult?.reason?.includes('Email')) return 'Email No Autorizado'
    if (accessResult?.reason?.includes('Domain')) return 'Dominio No Autorizado'
    if (accessResult?.reason?.includes('maintenance')) return 'Sitio en Mantenimiento'
    return 'Acceso Denegado'
  }

  const getMessage = () => {
    if (accessResult?.reason?.includes('Authentication')) {
      return 'Necesitas iniciar sesión para acceder a esta página.'
    }
    if (accessResult?.reason?.includes('role') || requiredRole) {
      return `Se requiere el rol "${requiredRole || accessResult?.requiredRole}" para acceder a esta página. Tu rol actual es "${user?.role}".`
    }
    if (accessResult?.reason?.includes('Email')) {
      return `Tu email "${user?.email}" no está autorizado para acceder a esta página.`
    }
    if (accessResult?.reason?.includes('Domain')) {
      return `Tu dominio "${user?.domain}" no está autorizado para acceder a esta página.`
    }
    if (accessResult?.reason?.includes('maintenance')) {
      return 'El sitio se encuentra temporalmente en mantenimiento. Por favor, inténtalo más tarde.'
    }
    return accessResult?.reason || 'No tienes permisos para acceder a esta página.'
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-red-600">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">
                {getTitle()}
              </h3>
            </div>
          </div>
          <AlertDescription className="text-red-700 mb-4">
            {getMessage()}
          </AlertDescription>
          <div className="flex gap-2 flex-wrap">
            {accessResult?.reason?.includes('Authentication') ? (
              <Button onClick={() => window.location.href = '/auth/login'}>
                Iniciar Sesión
              </Button>
            ) : (
              <Button variant="outline" onClick={onRedirect}>
                Ir a Página Autorizada
              </Button>
            )}
            <Button variant="outline" onClick={() => window.history.back()}>
              Volver
            </Button>
          </div>
        </Alert>
        
        {user && (
          <div className="mt-4 p-4 bg-white rounded-lg border text-sm text-gray-600">
            <p><strong>Usuario:</strong> {user.email}</p>
            <p><strong>Rol:</strong> {user.role}</p>
            <p><strong>Dominio:</strong> {user.domain}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Utility function to get role hierarchy
function getRoleHierarchy() {
  return ['user', 'editor', 'admin', 'super-admin']
}

// Hook for conditional rendering based on access
export function useConditionalRender() {
  const { user, canAccess } = useRouteGuard()

  const renderIfRole = (requiredRole: string, component: ReactNode) => {
    const hierarchy = getRoleHierarchy()
    const hasRole = user?.role && hierarchy.indexOf(user.role) >= hierarchy.indexOf(requiredRole)
    return hasRole ? component : null
  }

  const renderIfAccess = (path: string, component: ReactNode) => {
    // Para renderizado síncrono, usamos una versión simplificada
    // que solo verifica permisos básicos del usuario
    const hasBasicAccess = user?.role === 'ADMIN'
    return hasBasicAccess ? component : null
  }

  const renderIfPermission = (permission: string, component: ReactNode) => {
    return user?.permissions.includes(permission as any) ? component : null
  }

  return {
    renderIfRole,
    renderIfAccess,
    renderIfPermission,
    user
  }
}