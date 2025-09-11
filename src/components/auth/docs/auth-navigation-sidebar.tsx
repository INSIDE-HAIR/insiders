"use client";

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
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

interface NavItem {
  title: string;
  url: string;
  icon?: React.ElementType;
  items?: NavItem[];
}

const authNavItems: NavItem[] = [
  {
    title: "Inicio",
    url: "/admin/access-control/docs",
    icon: Home,
  },
  {
    title: "Fundamentos",
    url: "/admin/access-control/docs/fundamentals",
    icon: BookOpen,
    items: [
      {
        title: "¿Qué es NextAuth.js?",
        url: "/admin/access-control/docs/fundamentals/what-is-nextauth",
      },
      {
        title: "Arquitectura del Sistema",
        url: "/admin/access-control/docs/fundamentals/architecture",
      },
      {
        title: "Flujos de Autenticación",
        url: "/admin/access-control/docs/fundamentals/auth-flows",
      },
      {
        title: "Tipos de Sesión",
        url: "/admin/access-control/docs/fundamentals/session-types",
      },
    ],
  },
  {
    title: "Configuración",
    url: "/admin/access-control/docs/configuration",
    icon: Settings,
    items: [
      {
        title: "Configuración Inicial",
        url: "/admin/access-control/docs/configuration/initial-setup",
      },
      {
        title: "Variables de Entorno",
        url: "/admin/access-control/docs/configuration/environment-variables",
      },
      {
        title: "Base de Datos",
        url: "/admin/access-control/docs/configuration/database",
      },
      {
        title: "JWT Configuration",
        url: "/admin/access-control/docs/configuration/jwt",
      },
    ],
  },
  {
    title: "Proveedores",
    url: "/admin/access-control/docs/providers",
    icon: Shield,
    items: [
      {
        title: "Google OAuth",
        url: "/admin/access-control/docs/providers/google",
      },
      {
        title: "GitHub OAuth",
        url: "/admin/access-control/docs/providers/github",
      },
      {
        title: "Credentials Provider",
        url: "/admin/access-control/docs/providers/credentials",
      },
      {
        title: "Resend Email",
        url: "/admin/access-control/docs/providers/resend",
      },
      {
        title: "Provider Configuration",
        url: "/admin/access-control/docs/providers/configuration",
      },
    ],
  },
  {
    title: "Gestión de Usuarios",
    url: "/admin/access-control/docs/user-management",
    icon: Users,
    items: [
      {
        title: "Modelo de Usuario",
        url: "/admin/access-control/docs/user-management/user-model",
      },
      {
        title: "Roles y Permisos",
        url: "/admin/access-control/docs/user-management/roles-permissions",
      },
      {
        title: "Registro de Usuarios",
        url: "/admin/access-control/docs/user-management/user-registration",
      },
      {
        title: "Verificación de Email",
        url: "/admin/access-control/docs/user-management/email-verification",
      },
      {
        title: "2FA (Two Factor Auth)",
        url: "/admin/access-control/docs/user-management/two-factor-auth",
      },
    ],
  },
  {
    title: "Sessiones y JWT",
    url: "/admin/access-control/docs/sessions-jwt",
    icon: Key,
    items: [
      {
        title: "JWT Tokens",
        url: "/admin/access-control/docs/sessions-jwt/jwt-tokens",
      },
      {
        title: "Session Management",
        url: "/admin/access-control/docs/sessions-jwt/session-management",
      },
      {
        title: "Refresh Tokens",
        url: "/admin/access-control/docs/sessions-jwt/refresh-tokens",
      },
      {
        title: "Token Validation",
        url: "/admin/access-control/docs/sessions-jwt/token-validation",
      },
    ],
  },
  {
    title: "Seguridad",
    url: "/admin/access-control/docs/security",
    icon: Lock,
    items: [
      {
        title: "CSRF Protection",
        url: "/admin/access-control/docs/security/csrf-protection",
      },
      {
        title: "Rate Limiting",
        url: "/admin/access-control/docs/security/rate-limiting",
      },
      {
        title: "Secure Headers",
        url: "/admin/access-control/docs/security/secure-headers",
      },
      {
        title: "Password Hashing",
        url: "/admin/access-control/docs/security/password-hashing",
      },
      {
        title: "Best Practices",
        url: "/admin/access-control/docs/security/best-practices",
      },
    ],
  },
  {
    title: "Middleware",
    url: "/admin/access-control/docs/middleware",
    icon: UserCheck,
    items: [
      {
        title: "Auth Middleware",
        url: "/admin/access-control/docs/middleware/auth-middleware",
      },
      {
        title: "Route Protection",
        url: "/admin/access-control/docs/middleware/route-protection",
      },
      {
        title: "Role-based Access",
        url: "/admin/access-control/docs/middleware/role-based-access",
      },
      {
        title: "API Key Authentication",
        url: "/admin/access-control/docs/middleware/api-key-auth",
      },
    ],
  },
  {
    title: "Troubleshooting",
    url: "/admin/access-control/docs/troubleshooting",
    icon: AlertTriangle,
    items: [
      {
        title: "Common Issues",
        url: "/admin/access-control/docs/troubleshooting/common-issues",
      },
      {
        title: "Debug Mode",
        url: "/admin/access-control/docs/troubleshooting/debug-mode",
      },
      {
        title: "Error Handling",
        url: "/admin/access-control/docs/troubleshooting/error-handling",
      },
      {
        title: "Logs and Monitoring",
        url: "/admin/access-control/docs/troubleshooting/logs-monitoring",
      },
    ],
  },
];

interface NavItemProps {
  item: NavItem;
  depth?: number;
}

const NavItemComponent: React.FC<NavItemProps> = ({ item, depth = 0 }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = pathname === item.url;
  const hasChildren = item.items && item.items.length > 0;
  const isParentActive = pathname.startsWith(item.url) && item.url !== "/admin/access-control/docs";

  // Auto-expand if current path is within this section
  useEffect(() => {
    if (hasChildren && (isParentActive || isActive)) {
      setIsOpen(true);
    }
  }, [pathname, item.url, hasChildren, isParentActive, isActive]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 font-normal",
              depth > 0 && `ml-${depth * 4}`,
              (isActive || isParentActive) && "bg-primary/10 text-primary",
              "hover:bg-primary/5"
            )}
            onClick={toggleOpen}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            <span className="flex-1 text-left">{item.title}</span>
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "transform rotate-90"
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1">
          {item.items?.map((subItem) => (
            <NavItemComponent key={subItem.url} item={subItem} depth={depth + 1} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2 font-normal",
        depth > 0 && `ml-${depth * 4}`,
        isActive && "bg-primary/10 text-primary",
        "hover:bg-primary/5"
      )}
      asChild
    >
      <Link href={item.url}>
        {item.icon && <item.icon className="h-4 w-4" />}
        {item.title}
      </Link>
    </Button>
  );
};

export function AuthNavigationSidebar() {
  return (
    <nav className="space-y-2">
      <div className="mb-4">
        <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
          Documentación de Auth
        </h2>
        <p className="px-2 text-sm text-muted-foreground">
          NextAuth.js v5 + Prisma + MongoDB
        </p>
      </div>
      {authNavItems.map((item) => (
        <NavItemComponent key={item.url} item={item} />
      ))}
    </nav>
  );
}