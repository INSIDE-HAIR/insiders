"use client";
import React from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import translations from "@/db/translations.json";
import { Home, Palette, LineChart, Rocket, LucideIcon } from "lucide-react";
import { AppSidebar } from "../app-sidebar";
import { Icons } from "@/src/components/icons";
import Header from "../layout/header";

// Mapeo de strings a componentes de iconos
const iconMap = {
  HomeIcon: Icons.HomeIcon,
  PaletteIcon: Icons.PaletteIcon,
  LineChartIcon: Icons.LineChartIcon,
  RocketIcon: Icons.RocketIcon,
  DashboardIcon: Icons.HomeIcon,
  PackageIcon: Icons.PackageIcon,
  UsersIcon: Icons.UsersIcon,
  AnalyticsIcon: Icons.LineChartIcon,
  EnvelopeClosedIcon: Icons.EnvelopeClosedIcon,
  FilesIcon: Icons.FilesIcon,
  WorkflowIcon: Icons.WorkflowIcon,
  DatabaseIcon: Icons.DatabaseIcon,
  GitHubIcon: Icons.GitHubIcon,
  GoogleIcon: Icons.GoogleIcon,
} as const;

// Definimos un tipo para las rutas de traducción
type TranslationRoute = {
  id: string;
  icon: string;
  path: string;
  translations: {
    en: string;
    es: string;
  };
};

// Definir las páginas que tienen subpáginas estáticas
// Solo las páginas que realmente necesitan submenús deberían estar aquí
const pagesWithSubpages: Record<
  string,
  Array<{ title: string; url: string }>
> = {
  users: [
    { title: "Lista de Usuarios", url: "/admin/users" },
    { title: "Crear Usuario", url: "/admin/users/create" },
  ],
  users2: [
    { title: "Lista de Usuarios 2", url: "/admin/users2" },
    { title: "Crear Usuario", url: "/admin/users2/create" },
  ],
  products: [
    { title: "Lista de Productos", url: "/admin/products" },
    { title: "Crear Producto", url: "/admin/products/create" },
  ],
  pages: [{ title: "Lista de Páginas", url: "/admin/pages" }],
  menu: [{ title: "Configuración de Menú", url: "/admin/menu" }],
  messages: [{ title: "Todos los Mensajes", url: "/admin/messages" }],
  holded: [{ title: "Panel de Holded", url: "/admin/holded" }],
};

// Definir las rutas por equipo
const teamRoutes = {
  gestion: translations.adminRoutes, // Acceso completo
  creativos: translations.adminRoutes.filter((route) =>
    ["pages", "menu", "drive-routes"].includes(route.id)
  ),
  consultoria: translations.adminRoutes.filter((route) =>
    ["analytics", "users", "users2", "dashboard", "messages"].includes(route.id)
  ),
  crecimiento: translations.adminRoutes.filter((route) =>
    ["analytics", "products", "dashboard", "messages"].includes(route.id)
  ),
};

// Lista de páginas que NO deben ser acordiones (enlaces directos)
const directLinkPages = ["admin", "dashboard", "analytics", "drive-routes"];

// Función para crear los elementos de navegación con subpáginas cuando existen
const createNavItems = (routes: TranslationRoute[]) => {
  return routes.map((route) => {
    const icon = iconMap[route.icon as keyof typeof iconMap] as LucideIcon;

    // Verificar si esta página debe ser un enlace directo
    if (directLinkPages.includes(route.id)) {
      return {
        title: route.translations.es,
        url: `/admin/${route.path}`,
        icon,
        items: [], // Sin subítems para enlaces directos
      };
    }

    // Para otras páginas, verificar si tienen subpáginas definidas
    const hasSubpages = pagesWithSubpages[route.id];

    if (hasSubpages) {
      return {
        title: route.translations.es,
        url: `/admin/${route.path}`,
        icon,
        items: hasSubpages,
        isActive: false, // Se puede cambiar basado en la ruta actual
      };
    }

    // Por defecto, si no está en ninguna de las categorías anteriores, hacerlo acordión con un solo elemento
    return {
      title: route.translations.es,
      url: `/admin/${route.path}`,
      icon,
      items: [
        {
          title: `Lista de ${route.translations.es}`,
          url: `/admin/${route.path}`,
        },
      ],
    };
  });
};

// Transformar los datos de translations a la estructura esperada por los componentes
const transformedData = {
  navMain: createNavItems(teamRoutes.gestion),
  projects: [], // Vaciar los proyectos ya que solo necesitamos la sección Platform
  user: {
    name: "Usuario",
    email: "usuario@example.com",
    avatar: "/avatars/default.jpg",
  },
  teams: [
    {
      name: "Equipo de Gestión",
      logo: Home,
      plan: "Enterprise",
      routes: teamRoutes.gestion,
    },
    {
      name: "Equipo Creativo",
      logo: Palette,
      plan: "Pro",
      routes: teamRoutes.creativos,
    },
    {
      name: "Equipo de Consultoría",
      logo: LineChart,
      plan: "Pro",
      routes: teamRoutes.consultoria,
    },
    {
      name: "Equipo de Crecimiento",
      logo: Rocket,
      plan: "Pro",
      routes: teamRoutes.crecimiento,
    },
  ],
};

// Función para actualizar las rutas según el equipo seleccionado
const updateRoutesByTeam = (teamName: string) => {
  const team = transformedData.teams.find((t) => t.name === teamName);
  if (!team?.routes) return;

  return {
    ...transformedData,
    navMain: createNavItems(team.routes as TranslationRoute[]),
    projects: [], // Mantener vacío el arreglo de proyectos
  };
};

interface DashboardProps {
  children?: React.ReactNode;
}

function Dashboard({ children }: DashboardProps) {
  const [currentData, setCurrentData] = React.useState(transformedData);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleTeamChange = (teamName: string) => {
    const updatedData = updateRoutesByTeam(teamName);
    if (updatedData) {
      setCurrentData(updatedData);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar {...currentData} onTeamChange={handleTeamChange} />

      <SidebarInset>
        <div className='flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4 w-full'>
          <SidebarTrigger className='-ml-1' />
          <div className='w-full col-start-1 col-end-full '>
            <Header
              type='admin'
              homeLabel='INSIDERS'
              dropdownSliceEnd={-1}
              separator
            />
          </div>
        </div>
        <div className='flex flex-1 flex-col gap-4'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Dashboard;
