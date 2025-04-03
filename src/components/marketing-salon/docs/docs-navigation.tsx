"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, FileText, Code, Home, Users, Cog } from "lucide-react"
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

  return (
    <Sidebar variant="sidebar" className="bg-zinc-50 text-zinc-900 border-r border-zinc-200 shadow-sm">
      <SidebarHeader className="border-b border-zinc-200">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-5 w-5 text-black" />
                <span className="font-semibold">Marketing Salón</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Users className="h-4 w-4 mr-2" />
            Manual para Usuarios
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>
            <Code className="h-4 w-4 mr-2" />
            Manual para Desarrolladores
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {devMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

