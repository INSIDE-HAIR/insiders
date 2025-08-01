"use client";
import React from "react";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import translations from "@/db/translations.json";
import { Home, Palette, LineChart, Rocket, LucideIcon } from "lucide-react";
import { AppSidebar } from "../app-sidebar";
import { Icons } from "@/src/components/shared/icons";
import { IconKeys } from "@/src/types";
import TailwindGrid from "../grid/TailwindGrid";

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
} as const;

// Definir las rutas por equipo
const teamRoutes = {
  gestion: translations.adminRoutes, // Acceso completo
  creativos: translations.adminRoutes.filter((route) =>
    ["pages", "menu"].includes(route.id)
  ),
  consultoria: translations.adminRoutes.filter((route) =>
    ["analytics", "users", "messages"].includes(route.id)
  ),
  crecimiento: translations.adminRoutes.filter((route) =>
    ["analytics", "products", "messages"].includes(route.id)
  ),
};

// Transformar los datos de translations a la estructura esperada por los componentes
const transformedData = {
  navMain: teamRoutes.gestion.map((route) => ({
    title: route.translations.es,
    url: `/admin/${route.path}`,
    icon: Icons[route.icon as IconKeys] as LucideIcon,
    items: [],
  })),
  projects: teamRoutes.gestion.map((route) => ({
    name: route.translations.es,
    url: `/admin/${route.path}`,
    icon: Icons[route.icon as IconKeys] as LucideIcon,
  })),
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
    navMain: team.routes.map((route) => ({
      title: route.translations.es,
      url: `/admin/${route.path}`,
      icon: iconMap[route.icon as keyof typeof iconMap] as LucideIcon,
      items: [],
    })),
    projects: team.routes.map((route) => ({
      name: route.translations.es,
      url: `/admin/${route.path}`,
      icon: iconMap[route.icon as keyof typeof iconMap] as LucideIcon,
    })),
  };
};

function Dashboard() {
  const [currentData, setCurrentData] = React.useState(transformedData);

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
        <TailwindGrid fullSize>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"></header>
        </TailwindGrid>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Dashboard;
