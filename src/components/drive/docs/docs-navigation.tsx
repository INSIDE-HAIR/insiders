"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, FileText, Code, Home, Users, Cog } from "lucide-react"
import { useCallback } from "react"
import { cn } from "@/src/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/src/components/ui/sidebar"

// Definición de los elementos del menú
const userMenuItems = [
  {
    title: "Introducción",
    href: "/docs/marketing-salon/users",
    icon: BookOpen,
  },
  {
    title: "Estructura de Google Drive",
    href: "/docs/marketing-salon/users/drive-structure",
    icon: FileText,
  },
  {
    title: "Prefijos y Sufijos",
    href: "/docs/marketing-salon/users/naming-conventions",
    icon: FileText,
  },
  {
    title: "Campo Description",
    href: "/docs/marketing-salon/users/description-field",
    icon: FileText,
  },
  {
    title: "Tipos de Componentes",
    href: "/docs/marketing-salon/users/component-types",
    icon: Cog,
  },
]

const devMenuItems = [
  {
    title: "Guía para Desarrolladores",
    href: "/docs/marketing-salon/devs",
    icon: Code,
  },
  {
    title: "Arquitectura del Sistema",
    href: "/docs/marketing-salon/devs/architecture",
    icon: Code,
  },
  {
    title: "Campo Description",
    href: "/docs/marketing-salon/devs/description-parser",
    icon: Code,
  },
  {
    title: "Añadir Componentes",
    href: "/docs/marketing-salon/devs/adding-components",
    icon: Code,
  },
  {
    title: "Estructura de Archivos",
    href: "/docs/marketing-salon/devs/file-structure",
    icon: Code,
  },
  {
    title: "Componentes Actuales",
    href: "/docs/marketing-salon/devs/current-components",
    icon: Code,
  },
]

export function DocsNavigation() {
  const pathname = usePathname()

  // Function to check if a route is currently active (exact match)
  const isRouteActive = useCallback((routePath: string): boolean => {
    // Remove language prefix from pathname for comparison
    const cleanPathname = pathname ? pathname.replace(/^\/[a-z]{2}/, "") : "";
    return cleanPathname === routePath;
  }, [pathname]);

  return (
    <Sidebar collapsible="icon" className="border-r shadow-sm">
      <SidebarHeader className="h-14 lg:h-[60px] py-0 m-auto w-full text-background [&>button]:hover:text-background">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                <span className="font-semibold">Marketing Salón</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manual para Usuarios</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userMenuItems.map((item) => {
                const isActive = isRouteActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span className={cn(
                          "transition-colors",
                          isActive && "text-primary font-medium"
                        )}>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Manual para Desarrolladores</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {devMenuItems.map((item) => {
                const isActive = isRouteActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span className={cn(
                          "transition-colors",
                          isActive && "text-primary font-medium"
                        )}>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

