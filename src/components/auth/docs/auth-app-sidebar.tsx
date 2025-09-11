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
import { 
  Home, 
  Shield, 
  Users, 
  Key, 
  Settings, 
  BookOpen, 
  FileText, 
  Code, 
  Database,
  Lock,
  UserCheck,
  Eye,
  Zap,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/components/ui/sidebar";

interface AuthAppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

const authNavItems: NavItem[] = [
  {
    title: "Inicio",
    url: "/admin/auth/docs",
    icon: Home,
  },
  {
    title: "Fundamentos",
    url: "/admin/auth/docs/fundamentals",
    icon: BookOpen,
    items: [
      {
        title: "¿Qué es NextAuth.js?",
        url: "/admin/auth/docs/fundamentals/what-is-nextauth",
      },
      {
        title: "Arquitectura de Autenticación",
        url: "/admin/auth/docs/fundamentals/architecture",
      },
      {
        title: "Flujos de Autenticación",
        url: "/admin/auth/docs/fundamentals/auth-flows",
      },
      {
        title: "Tipos de Sesión",
        url: "/admin/auth/docs/fundamentals/session-types",
      },
    ],
  },
  {
    title: "Configuración",
    url: "/admin/auth/docs/configuration",
    icon: Settings,
    items: [
      {
        title: "Configuración Básica",
        url: "/admin/auth/docs/configuration/basic",
      },
      {
        title: "Variables de Entorno",
        url: "/admin/auth/docs/configuration/environment",
      },
      {
        title: "Base de Datos",
        url: "/admin/auth/docs/configuration/database",
      },
      {
        title: "Callbacks y Eventos",
        url: "/admin/auth/docs/configuration/callbacks",
      },
    ],
  },
  {
    title: "Proveedores",
    url: "/admin/auth/docs/providers",
    icon: Users,
    items: [
      {
        title: "Google OAuth",
        url: "/admin/auth/docs/providers/google",
      },
      {
        title: "GitHub OAuth",
        url: "/admin/auth/docs/providers/github",
      },
      {
        title: "Credentials Provider",
        url: "/admin/auth/docs/providers/credentials",
      },
      {
        title: "Resend (Email)",
        url: "/admin/auth/docs/providers/resend",
      },
      {
        title: "Configurar Nuevos Proveedores",
        url: "/admin/auth/docs/providers/custom",
      },
    ],
  },
  {
    title: "Roles y Permisos",
    url: "/admin/auth/docs/roles",
    icon: Shield,
    items: [
      {
        title: "Sistema de Roles",
        url: "/admin/auth/docs/roles/system",
      },
      {
        title: "Control de Acceso",
        url: "/admin/auth/docs/roles/access-control",
      },
      {
        title: "Middleware de Rutas",
        url: "/admin/auth/docs/roles/route-middleware",
      },
      {
        title: "Permisos Granulares",
        url: "/admin/auth/docs/roles/permissions",
      },
    ],
  },
  {
    title: "Sesiones",
    url: "/admin/auth/docs/sessions",
    icon: Key,
    items: [
      {
        title: "Gestión de Sesiones",
        url: "/admin/auth/docs/sessions/management",
      },
      {
        title: "JWT vs Database Sessions",
        url: "/admin/auth/docs/sessions/jwt-vs-database",
      },
      {
        title: "Expiración y Renovación",
        url: "/admin/auth/docs/sessions/expiration",
      },
      {
        title: "Hooks de Sesión",
        url: "/admin/auth/docs/sessions/hooks",
      },
    ],
  },
  {
    title: "Seguridad",
    url: "/admin/auth/docs/security",
    icon: Lock,
    items: [
      {
        title: "Mejores Prácticas",
        url: "/admin/auth/docs/security/best-practices",
      },
      {
        title: "CSRF Protection",
        url: "/admin/auth/docs/security/csrf",
      },
      {
        title: "Autenticación 2FA",
        url: "/admin/auth/docs/security/two-factor",
      },
      {
        title: "Rate Limiting",
        url: "/admin/auth/docs/security/rate-limiting",
      },
    ],
  },
  {
    title: "API y Desarrollo",
    url: "/admin/auth/docs/api",
    icon: Code,
    items: [
      {
        title: "API Routes",
        url: "/admin/auth/docs/api/routes",
      },
      {
        title: "Server Actions",
        url: "/admin/auth/docs/api/server-actions",
      },
      {
        title: "Tipos TypeScript",
        url: "/admin/auth/docs/api/types",
      },
      {
        title: "Testing Auth",
        url: "/admin/auth/docs/api/testing",
      },
    ],
  },
  {
    title: "Troubleshooting",
    url: "/admin/auth/docs/troubleshooting",
    icon: AlertTriangle,
    items: [
      {
        title: "Errores Comunes",
        url: "/admin/auth/docs/troubleshooting/common-errors",
      },
      {
        title: "Debug Mode",
        url: "/admin/auth/docs/troubleshooting/debug",
      },
      {
        title: "Logs y Monitoreo",
        url: "/admin/auth/docs/troubleshooting/monitoring",
      },
    ],
  },
];

export function AuthAppSidebar({ ...props }: AuthAppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/auth/docs">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Documentación Auth
                  </span>
                  <span className="truncate text-xs">NextAuth.js v5</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMainMultilevel items={authNavItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}