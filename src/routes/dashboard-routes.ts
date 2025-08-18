import { DashboardRoutes } from "@/src/types/dashboard-routes";

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
        "analytics",
        "messages",
        "pages",
        "menu",
        "drive",
        "holded",
        "calendar",
        "meet",
        "sitemap",
        "access-control",
        "settings",
      ],
    },
    creativos: {
      name: {
        en: "Creative Team",
        es: "Equipo Creativo",
      },
      plan: "Pro",
      routes: ["pages", "menu", "drive", "calendar", "meet"],
    },
    consultoria: {
      name: {
        en: "Consulting Team",
        es: "Equipo de Consultoría",
      },
      plan: "Pro",
      routes: ["analytics", "users", "admin", "dashboard", "messages"],
    },
    crecimiento: {
      name: {
        en: "Growth Team",
        es: "Equipo de Crecimiento",
      },
      plan: "Pro",
      routes: ["analytics", "products", "admin", "dashboard", "messages"],
    },
  },
  routes: [
    {
      id: "admin",
      label: {
        en: "Home",
        es: "Inicio",
      },
      href: "/admin",
      icon: "Home",
      type: "direct",
      access: {
        roles: ["admin", "super-admin"],
        teams: ["gestion", "consultoria", "crecimiento"],
      },
    },
    {
      id: "dashboard",
      label: {
        en: "Dashboard",
        es: "Dashboard",
      },
      href: "/admin/dashboard",
      icon: "BarChart3",
      type: "direct",
      access: {
        roles: ["admin", "super-admin"],
        teams: ["gestion", "consultoria", "crecimiento"],
      },
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
          id: "users-create",
          label: {
            en: "Create User",
            es: "Crear Usuario",
          },
          href: "/admin/users/create",
          icon: "UserPlus",
        },
        {
          id: "groups",
          label: {
            en: "Groups",
            es: "Grupos",
          },
          href: "/admin/groups",
          icon: "Users",
        },
      ],
    },
    {
      id: "analytics",
      label: {
        en: "Analytics",
        es: "Analíticas",
      },
      href: "/admin/analytics",
      icon: "BarChart3",
      type: "direct",
      access: {
        roles: ["admin", "super-admin"],
        teams: ["gestion", "consultoria", "crecimiento"],
      },
    },
    {
      id: "messages",
      label: {
        en: "Messages",
        es: "Mensajes",
      },
      href: "/admin/messages",
      icon: "Mail",
      type: "accordion",
      access: {
        roles: ["admin", "super-admin"],
        teams: ["gestion", "consultoria", "crecimiento"],
      },
      subItems: [
        {
          id: "messages-all",
          label: {
            en: "All Messages",
            es: "Todos los Mensajes",
          },
          href: "/admin/messages",
          icon: "Mail",
        },
      ],
    },
    {
      id: "pages",
      label: {
        en: "Pages",
        es: "Páginas",
      },
      href: "/admin/pages",
      icon: "FileText",
      type: "accordion",
      access: {
        roles: ["admin", "super-admin", "editor"],
        teams: ["gestion", "creativos"],
      },
      subItems: [
        {
          id: "pages-list",
          label: {
            en: "Page List",
            es: "Lista de Páginas",
          },
          href: "/admin/pages",
          icon: "FileText",
        },
      ],
    },
    {
      id: "menu",
      label: {
        en: "Menu",
        es: "Menú",
      },
      href: "/admin/menu",
      icon: "Menu",
      type: "accordion",
      access: {
        roles: ["admin", "super-admin"],
        teams: ["gestion", "creativos"],
      },
      subItems: [
        {
          id: "menu-config",
          label: {
            en: "Menu Configuration",
            es: "Configuración de Menú",
          },
          href: "/admin/menu",
          icon: "Settings",
        },
      ],
    },
    {
      id: "drive",
      label: {
        en: "Drive",
        es: "Drive",
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
          id: "drive-explorer",
          label: {
            en: "Drive Explorer",
            es: "Explorador de Drive",
          },
          href: "/admin/drive",
          icon: "Folder",
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
          id: "drive-errors",
          label: {
            en: "Error Reports",
            es: "Reportes de Errores",
          },
          href: "/admin/drive/errors",
          icon: "AlertTriangle",
        },
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
      id: "calendar",
      label: {
        en: "Calendar",
        es: "Calendario",
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
          id: "calendar-dashboard",
          label: {
            en: "Calendar Dashboard",
            es: "Dashboard de Calendario",
          },
          href: "/admin/calendar",
          icon: "Calendar",
        },
        {
          id: "calendar-events",
          label: {
            en: "Event List",
            es: "Lista de Eventos",
          },
          href: "/admin/calendar/events",
          icon: "CalendarDays",
        },
        {
          id: "meet-rooms",
          label: {
            en: "Meet Rooms",
            es: "Salas de Meet",
          },
          href: "/admin/meet/rooms",
          icon: "Video",
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
  directLinkRoutes: ["admin", "analytics", "sitemap"],
  settings: {
    defaultTeam: "gestion",
    enableTeamSwitching: true,
    showTeamIndicator: true,
  },
};
