import { DashboardRoutes } from "@/src/types/dashboard-routes";

/**
 * NOTA IMPORTANTE: Los roles deben usar minúsculas ("admin", "super-admin")
 * para mantener consistencia con el sistema de autenticación.
 * NO usar mayúsculas como "ADMIN" - esto causará problemas de acceso.
 */

export const dashboardRoutesData: DashboardRoutes = {
  version: "1.0.0",
  lastUpdated: "2025-01-01T00:00:00Z",
  teams: {
    gestion: {
      name: {
        en: "Management Team",
        es: "Equipo de Gestión",
      },
      plan: "Enterprise",
      routes: [
        "admin",
        "dashboard",
        "products",
        "users",
        "groups",
        "notifications",
        "drive",
        "holded",
        "calendar",
        "meet",
        "sitemap",
        "access-control",
        "operations-hub",
        "settings",
      ],
    },
    creativos: {
      name: {
        en: "Creative Team",
        es: "Equipo Creativo",
      },
      plan: "Pro",
      routes: ["pages", "drive", "calendar", "meet", "operations-hub"],
    },
    consultoria: {
      name: {
        en: "Consulting Team",
        es: "Equipo de Consultoría",
      },
      plan: "Pro",
      routes: ["users", "admin", "notifications"],
    },
    crecimiento: {
      name: {
        en: "Growth Team",
        es: "Equipo de Crecimiento",
      },
      plan: "Pro",
      routes: ["products", "admin", "notifications"],
    },
  },
  routes: [
    {
      id: "admin",
      label: {
        en: "Dashboard",
        es: "Dashboard",
      },
      href: "/admin",
      icon: "BarChart3",
      type: "direct",
      access: {
        roles: ["admin", "super-admin"],
        teams: ["gestion", "consultoria", "crecimiento"],
      },
    },
    {
      id: "users",
      label: {
        en: "Users",
        es: "Usuarios",
      },
      href: "/admin/users",
      icon: "Users",
      type: "accordion",
      access: {
        roles: ["admin", "super-admin"],
        teams: ["gestion", "consultoria"],
      },
      subItems: [
        {
          id: "users-list",
          label: {
            en: "User List",
            es: "Lista de Usuarios",
          },
          href: "/admin/users",
          icon: "List",
        },
        {
          id: "teams",
          label: {
            en: "Teams",
            es: "Equipos",
          },
          href: "/admin/teams",
          icon: "Users",
        },
      ],
    },
    {
      id: "products",
      label: {
        en: "Products",
        es: "Productos",
      },
      href: "/admin/products",
      icon: "Package",
      type: "accordion",
      access: {
        roles: ["admin", "super-admin", "editor"],
        teams: ["gestion", "crecimiento"],
      },
      subItems: [
        {
          id: "products-list",
          label: {
            en: "Product List",
            es: "Lista de Productos",
          },
          href: "/admin/products",
          icon: "List",
        },
        {
          id: "products-create",
          label: {
            en: "Create Product",
            es: "Crear Producto",
          },
          href: "/admin/products/create",
          icon: "Plus",
        },
      ],
    },
    {
      id: "drive",
      label: {
        en: "Google Drive",
        es: "Google Drive",
      },
      href: "/admin/drive",
      icon: "HardDrive",
      type: "accordion",
      access: {
        roles: ["admin", "super-admin"],
        teams: ["gestion", "creativos"],
      },
      subItems: [
        {
          id: "drive-routes",
          label: {
            en: "Drive Routes",
            es: "Rutas de Drive",
          },
          href: "/admin/drive/routes",
          icon: "Route",
        },
        {
          id: "drive-codes",
          label: {
            en: "Code Manager",
            es: "Gestor de Códigos",
          },
          href: "/admin/drive/codes",
          icon: "Code",
        },
        {
          id: "drive-explorer",
          label: {
            en: "Drive Explorer",
            es: "Explorador de Drive",
          },
          href: "/admin/drive",
          icon: "Folder",
        },
        {
          id: "drive-docs",
          label: {
            en: "Documentation",
            es: "Documentación",
          },
          href: "/admin/drive/routes/docs",
          icon: "Book",
        },
      ],
    },
    {
      id: "calendar",
      label: {
        en: "Google Calendar",
        es: "Google Calendar",
      },
      href: "/admin/calendar",
      icon: "Calendar",
      type: "accordion",
      access: {
        roles: ["admin", "super-admin"],
        teams: ["gestion", "creativos"],
      },
      subItems: [
        {
          id: "calendars",
          label: {
            en: "Calendars",
            es: "Calendarios",
          },
          href: "/admin/calendar",
          icon: "CalendarDays",
        },
      ],
    },
    {
      id: "meet",
      label: {
        en: "Google Meet",
        es: "Google Meet",
      },
      href: "/admin/meet",
      icon: "Video",
      type: "accordion",
      access: {
        roles: ["admin", "super-admin"],
        teams: ["gestion", "creativos"],
      },
      subItems: [
        {
          id: "meet-rooms",
          label: {
            en: "Rooms",
            es: "Salas",
          },
          href: "/admin/meet/rooms",
          icon: "Video",
        },
        {
          id: "meet-analytics",
          label: {
            en: "Analytics",
            es: "Analíticas",
          },
          href: "/admin/meet/analytics",
          icon: "BarChart3",
        },
        {
          id: "meet-settings",
          label: {
            en: "Settings",
            es: "Configuración",
          },
          href: "/admin/meet/settings",
          icon: "Settings",
        },
      ],
    },
    {
      id: "sitemap",
      label: {
        en: "Sitemap",
        es: "Mapa del Sitio",
      },
      href: "/admin/sitemap",
      icon: "Map",
      type: "direct",
      access: {
        roles: ["super-admin"],
        teams: ["gestion"],
        domains: ["@insidesalons.com"],
      },
    },
    {
      id: "holded",
      label: {
        en: "Holded",
        es: "Holded",
      },
      href: "/admin/holded",
      icon: "Building",
      type: "accordion",
      access: {
        roles: ["admin", "super-admin"],
        teams: ["gestion"],
      },
      subItems: [
        {
          id: "holded-panel",
          label: {
            en: "Holded Panel",
            es: "Panel de Holded",
          },
          href: "/admin/holded",
          icon: "Building",
        },
      ],
    },
    {
      id: "operations-hub",
      label: {
        en: "Operations Hub",
        es: "Centro de Operaciones",
      },
      href: "/admin/operations-hub",
      icon: "Layers",
      type: "accordion",
      access: {
        roles: ["admin", "super-admin"],
        teams: ["gestion", "creativos"],
      },
      subItems: [
        {
          id: "operations-tags",
          label: {
            en: "Tags",
            es: "Tags",
          },
          href: "/admin/operations-hub/tags",
          icon: "Tag",
        },
        {
          id: "operations-groups",
          label: {
            en: "Groups",
            es: "Grupos",
          },
          href: "/admin/operations-hub/groups",
          icon: "Users",
        },
        {
          id: "operations-sitemap",
          label: {
            en: "Sitemap",
            es: "Sitemap",
          },
          href: "/admin/operations-hub/sitemap",
          icon: "Map",
        },
        {
          id: "operations-navigation",
          label: {
            en: "Navigation",
            es: "Navegación",
          },
          href: "/admin/operations-hub/navigation",
          icon: "Navigation",
        },
      ],
    },
    {
      id: "access-control",
      label: {
        en: "Access Control",
        es: "Control de Acceso",
      },
      href: "/admin/access-control",
      icon: "Shield",
      type: "accordion",
      access: {
        roles: ["admin", "super-admin"],
        teams: ["gestion"],
      },
      subItems: [
        {
          id: "access-control-basic",
          label: {
            en: "Basic Control",
            es: "Control Básico",
          },
          href: "/admin/access-control",
          icon: "Settings",
        },
        {
          id: "user-exceptions",
          label: {
            en: "User Exceptions",
            es: "Excepciones de Usuario",
          },
          href: "/admin/user-exceptions",
          icon: "UserX",
        },
        {
          id: "complex-access-control",
          label: {
            en: "Complex Rules",
            es: "Reglas Complejas",
          },
          href: "/admin/complex-access-control",
          icon: "Layers",
        },
        {
          id: "complex-access-metrics",
          label: {
            en: "Access Metrics",
            es: "Métricas de Acceso",
          },
          href: "/admin/complex-access-control/metrics",
          icon: "BarChart3",
        },
        {
          id: "access-control-docs",
          label: {
            en: "Authentication Docs",
            es: "Documentación de Auth",
          },
          href: "/admin/access-control/docs",
          icon: "BookOpen",
        },
      ],
    },
    {
      id: "notifications",
      label: {
        en: "Notifications",
        es: "Notificaciones",
      },
      href: "/admin/notifications",
      icon: "BellRing",
      type: "accordion",
      access: {
        roles: ["admin", "super-admin"],
        teams: ["gestion", "consultoria", "crecimiento"],
      },
      subItems: [
        {
          id: "notifications-tickets",
          label: {
            en: "Tickets",
            es: "Tickets",
          },
          href: "/admin/notifications/tickets",
          icon: "AlertTriangle",
        },
        {
          id: "notifications-requests",
          label: {
            en: "Requests",
            es: "Solicitudes",
          },
          href: "/admin/notifications/requests",
          icon: "FileText",
        },
        {
          id: "notifications-system",
          label: {
            en: "System Logs",
            es: "Sistema",
          },
          href: "/admin/notifications/system",
          icon: "Terminal",
        },
      ],
    },
    {
      id: "settings",
      label: {
        en: "Settings",
        es: "Configuración",
      },
      href: "/admin/settings",
      icon: "Settings",
      type: "accordion",
      access: {
        roles: ["admin", "super-admin"],
        teams: ["gestion"],
      },
      subItems: [
        {
          id: "settings-general",
          label: {
            en: "General Settings",
            es: "Configuración General",
          },
          href: "/admin/settings",
          icon: "Settings",
        },
        {
          id: "api-keys",
          label: {
            en: "API Keys",
            es: "Claves API",
          },
          href: "/admin/settings/api-keys",
          icon: "Lock",
        },
      ],
    },
  ],
  directLinkRoutes: ["admin", "sitemap"],
  settings: {
    defaultTeam: "gestion",
    enableTeamSwitching: true,
    showTeamIndicator: true,
  },
};
