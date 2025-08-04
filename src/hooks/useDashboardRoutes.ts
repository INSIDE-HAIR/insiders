"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslations } from '@/src/context/TranslationContext'
import { DashboardRoutes, DashboardRoute, ProcessedNavItem, Locale } from '@/src/types/dashboard-routes'
import dashboardRoutesData from '@/src/routes/dashboard-routes.json'
import { Icons } from '@/src/components/shared/icons'
import { 
  Home, 
  Package, 
  Users, 
  BarChart3, 
  Mail, 
  FileText, 
  Menu, 
  HardDrive, 
  Building, 
  Calendar,
  Map,
  List,
  Plus,
  UserPlus,
  Folder,
  Code,
  AlertTriangle,
  Route,
  Book,
  Upload,
  UploadCloud,
  Settings,
  CalendarDays,
  Shield,
  UserX,
  Layers
} from 'lucide-react'

// Mapeo de iconos string a componentes
const iconMap = {
  Home,
  Package,
  Users,
  BarChart3,
  Mail,
  FileText,
  Menu,
  HardDrive,
  Building,
  Calendar,
  Map,
  List,
  Plus,
  UserPlus,
  Folder,
  Code,
  AlertTriangle,
  Route,
  Book,
  Upload,
  UploadCloud,
  Settings,
  CalendarDays,
  Shield,
  UserX,
  Layers,
  // Compatibility with existing icons
  HomeIcon: Icons.HomeIcon,
  PackageIcon: Icons.PackageIcon,
  UsersIcon: Icons.UsersIcon,
  LineChartIcon: Icons.LineChartIcon,
  EnvelopeClosedIcon: Icons.EnvelopeClosedIcon,
  FilesIcon: Icons.FilesIcon,
  WorkflowIcon: Icons.WorkflowIcon,
  DatabaseIcon: Icons.DatabaseIcon,
  FolderIcon: Folder,
  RouteIcon: Route,
  FileTextIcon: FileText,
  CalendarIcon: Calendar,
} as const

interface UseDashboardRoutesOptions {
  team?: string
  locale?: Locale
  userRole?: string
}

export function useDashboardRoutes({ 
  team = 'gestion', 
  locale = 'es',
  userRole = 'admin'
}: UseDashboardRoutesOptions = {}) {
  
  const t = useTranslations()
  const [currentTeam, setCurrentTeam] = useState(team)
  const [routes, setRoutes] = useState<DashboardRoutes>(dashboardRoutesData as DashboardRoutes)

  // Filter routes based on team access
  const getRoutesForTeam = useCallback((teamId: string): DashboardRoute[] => {
    const teamConfig = routes.teams[teamId]
    if (!teamConfig) return []

    return routes.routes.filter(route => 
      teamConfig.routes.includes(route.id) &&
      route.access.teams.includes(teamId) &&
      route.access.roles.includes(userRole)
    )
  }, [routes, userRole])

  // Convert routes to navigation items with translations
  const createNavItems = useCallback((routesToProcess: DashboardRoute[]): ProcessedNavItem[] => {
    return routesToProcess.map(route => {
      const icon = iconMap[route.icon as keyof typeof iconMap]
      const title = route.label[locale] || route.label.es

      // Check if route should be direct link
      const isDirectLink = routes.directLinkRoutes.includes(route.id)

      if (isDirectLink || route.type === 'direct') {
        return {
          title,
          url: route.href,
          icon,
          items: []
        }
      }

      // Create accordion with subitems
      const subItems = route.subItems?.map(subItem => ({
        title: subItem.label[locale] || subItem.label.es,
        url: subItem.href
      })) || []

      return {
        title,
        url: route.href,
        icon,
        items: subItems,
        isActive: false
      }
    })
  }, [locale, routes.directLinkRoutes])

  // Get current team routes
  const currentTeamRoutes = useMemo(() => {
    return getRoutesForTeam(currentTeam)
  }, [currentTeam, getRoutesForTeam])

  // Get processed navigation items
  const navItems = useMemo(() => {
    return createNavItems(currentTeamRoutes)
  }, [currentTeamRoutes, createNavItems])

  // Get all teams with translations
  const teams = useMemo(() => {
    return Object.entries(routes.teams).map(([id, teamConfig]) => ({
      id,
      name: teamConfig.name[locale] || teamConfig.name.es,
      plan: teamConfig.plan,
      routes: teamConfig.routes
    }))
  }, [routes.teams, locale])

  // Change team
  const changeTeam = useCallback((teamId: string) => {
    if (routes.teams[teamId]) {
      setCurrentTeam(teamId)
    }
  }, [routes.teams])

  // Check if user can access route
  const canAccessRoute = useCallback((routeId: string): boolean => {
    const route = routes.routes.find(r => r.id === routeId)
    if (!route) return false

    return route.access.roles.includes(userRole) &&
           route.access.teams.includes(currentTeam)
  }, [routes.routes, userRole, currentTeam])

  // Get route by ID with translations
  const getRoute = useCallback((routeId: string): DashboardRoute | null => {
    return routes.routes.find(r => r.id === routeId) || null
  }, [routes.routes])

  // Get translated route label
  const getRouteLabel = useCallback((routeId: string): string => {
    const route = getRoute(routeId)
    if (!route) return routeId
    return route.label[locale] || route.label.es
  }, [getRoute, locale])

  return {
    // Data
    routes: currentTeamRoutes,
    navItems,
    teams,
    currentTeam,
    
    // Actions
    changeTeam,
    canAccessRoute,
    getRoute,
    getRouteLabel,
    
    // Utilities
    isDirectLink: (routeId: string) => routes.directLinkRoutes.includes(routeId),
    getTeamConfig: (teamId: string) => routes.teams[teamId],
    settings: routes.settings
  }
}

// Hook específico para obtener datos transformados para el sidebar
export function useSidebarData(options: UseDashboardRoutesOptions = {}) {
  const dashboardRoutes = useDashboardRoutes(options)
  const [routes] = useState<DashboardRoutes>(dashboardRoutesData as DashboardRoutes)
  
  const sidebarData = useMemo(() => ({
    navMain: dashboardRoutes.navItems,
    projects: [], // Empty as requested
    user: {
      name: "Usuario",
      email: "usuario@example.com", 
      avatar: "/avatars/default.jpg"
    },
    teams: dashboardRoutes.teams.map(team => ({
      name: team.name,
      logo: Home, // Default logo, could be made configurable
      plan: team.plan,
      routes: team.routes.map(routeId => {
        const route = routes.routes.find(r => r.id === routeId)
        return route ? {
          id: route.id,
          icon: route.icon,
          path: route.href.replace('/admin', ''),
          translations: {
            en: route.label.en,
            es: route.label.es
          }
        } : {
          id: routeId,
          icon: 'Home',
          path: `/${routeId}`,
          translations: {
            en: routeId,
            es: routeId
          }
        }
      })
    }))
  }), [dashboardRoutes, routes])

  return {
    ...sidebarData,
    ...dashboardRoutes
  }
}