export interface TranslatedLabel {
  en: string
  es: string
}

export interface RouteAccess {
  roles: string[]
  teams: string[]
  domains?: string[]
}

export interface RouteSubItem {
  id: string
  label: TranslatedLabel
  href: string
  icon: string
}

export interface DashboardRoute {
  id: string
  label: TranslatedLabel
  href: string
  icon: string
  type: 'direct' | 'accordion'
  access: RouteAccess
  subItems?: RouteSubItem[]
}

export interface TeamConfig {
  name: TranslatedLabel
  plan: string
  routes: string[]
}

export interface DashboardRoutes {
  version: string
  lastUpdated: string
  teams: Record<string, TeamConfig>
  routes: DashboardRoute[]
  directLinkRoutes: string[]
  settings: {
    defaultTeam: string
    enableTeamSwitching: boolean
    showTeamIndicator: boolean
  }
}

export interface ProcessedNavItem {
  title: string
  url: string
  icon: any
  items?: Array<{
    title: string
    url: string
  }>
  isActive?: boolean
}

export type Locale = 'en' | 'es'