"use client";

import * as React from "react";
import { NavMainMultilevel } from "@/src/components/drive/docs/nav-main-multilevel";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/src/components/ui/sidebar";
import type { NavItem } from "@/src/types";
import { Home, Layout, Server, Users, Code, BookOpen, FileText, Cog, Database, Workflow } from "lucide-react";
import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/components/ui/sidebar";

interface DocsAppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

const docsNavItems: NavItem[] = [
  {
    title: "Inicio",
    url: "/admin/drive/routes/docs",
    icon: Home,
  },
  {
    title: "Frontend",
    url: "/admin/drive/routes/docs/frontend",
    icon: Layout,
    items: [
      {
        title: "Guía de Usuario Frontend",
        url: "/admin/drive/routes/docs/frontend/users",
        items: [
          {
            title: "Estructura de Drive",
            url: "/admin/drive/routes/docs/frontend/users/drive-structure",
          },
          {
            title: "Convenciones de Nombres",
            url: "/admin/drive/routes/docs/frontend/users/naming-conventions",
          },
          {
            title: "Campo Description",
            url: "/admin/drive/routes/docs/frontend/users/description-field",
          },
          {
            title: "Tipos de Componentes",
            url: "/admin/drive/routes/docs/frontend/users/component-types",
            items: [
              {
                title: "Componentes de Navegación",
                url: "/admin/drive/routes/docs/frontend/users/component-types/navigation-components",
              },
              {
                title: "Componentes de Contenido",
                url: "/admin/drive/routes/docs/frontend/users/component-types/content-components",
              },
              {
                title: "Componentes Adicionales",
                url: "/admin/drive/routes/docs/frontend/users/component-types/additional-components",
              },
            ],
          },
        ],
      },
      {
        title: "Documentación Técnica Frontend",
        url: "/admin/drive/routes/docs/frontend/devs",
        items: [
          {
            title: "Arquitectura",
            url: "/admin/drive/routes/docs/frontend/devs/architecture",
          },
          {
            title: "Parser de Description",
            url: "/admin/drive/routes/docs/frontend/devs/description-parser",
          },
          {
            title: "Añadir Componentes",
            url: "/admin/drive/routes/docs/frontend/devs/adding-components",
          },
          {
            title: "Estructura de Archivos",
            url: "/admin/drive/routes/docs/frontend/devs/file-structure",
          },
          {
            title: "Componentes Actuales",
            url: "/admin/drive/routes/docs/frontend/devs/current-components",
          },
          {
            title: "Typing Helpers",
            url: "/admin/drive/routes/docs/frontend/devs/typing-helpers",
          },
        ],
      },
    ],
  },
  {
    title: "Backend",
    url: "/admin/drive/routes/docs/backend",
    icon: Server,
    items: [
      {
        title: "Guía de Usuario Backend",
        url: "/admin/drive/routes/docs/backend/users",
      },
      {
        title: "Documentación Técnica Backend",
        url: "/admin/drive/routes/docs/backend/devs",
        items: [
          {
            title: "Arquitectura",
            url: "/admin/drive/routes/docs/backend/devs/architecture",
          },
          {
            title: "Modelo de Datos",
            url: "/admin/drive/routes/docs/backend/devs/data-model",
          },
          {
            title: "Servicios Principales",
            url: "/admin/drive/routes/docs/backend/devs/services",
          },
          {
            title: "API Endpoints",
            url: "/admin/drive/routes/docs/backend/devs/api",
          },
          {
            title: "Flujos de Trabajo",
            url: "/admin/drive/routes/docs/backend/devs/workflows",
          },
          {
            title: "Tecnologías Principales",
            url: "/admin/drive/routes/docs/backend/devs/technologies",
          },
          {
            title: "Sincronización",
            url: "/admin/drive/routes/docs/backend/devs/synchronization",
          },
          {
            title: "Extensiones",
            url: "/admin/drive/routes/docs/backend/devs/extensions",
          },
        ],
      },
    ],
  },
];

export function DocsAppSidebar({ ...props }: DocsAppSidebarProps) {
  return (
    <Sidebar 
      collapsible="icon" 
      variant="sidebar"
      className="relative border-r bg-sidebar text-sidebar-foreground"
      {...props}
    >
      <SidebarHeader className="h-14 lg:h-[60px] py-0 m-auto w-full text-background [&>button]:hover:text-background border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/admin/drive/routes/docs" className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span className="font-semibold">Documentación Drive</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-auto">
        <NavMainMultilevel items={docsNavItems} />
      </SidebarContent>
    </Sidebar>
  );
}