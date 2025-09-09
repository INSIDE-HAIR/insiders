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
import { Home, Layout, Server, Users, Code, FileText, Cog, Database, Workflow } from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon?: React.ElementType;
  items?: NavItem[];
}

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

export function DocsNavigationSidebar() {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  // Function to check if a route is currently active (exact match only)
  const isRouteActive = useCallback((routePath: string): boolean => {
    const cleanPathname = pathname ? pathname.replace(/^\/[a-z]{2}/, "") : "";
    return cleanPathname === routePath;
  }, [pathname]);

  // Function to check if any child route is active
  const hasActiveChild = useCallback((item: NavItem): boolean => {
    if (!item.items) return false;
    
    for (const child of item.items) {
      if (isRouteActive(child.url)) return true;
      if (hasActiveChild(child)) return true;
    }
    return false;
  }, [isRouteActive]);

  // Auto-expand items that have active children
  useEffect(() => {
    const newOpenItems: Record<string, boolean> = { ...openItems };
    let hasChanges = false;

    const checkAndExpand = (items: NavItem[], prefix = "") => {
      items.forEach(item => {
        const key = `${prefix}${item.title}`;
        const shouldBeOpen = hasActiveChild(item) || isRouteActive(item.url);
        if (shouldBeOpen && !newOpenItems[key]) {
          newOpenItems[key] = true;
          hasChanges = true;
        }
        if (item.items) {
          checkAndExpand(item.items, `${key}-`);
        }
      });
    };

    checkAndExpand(docsNavItems);

    if (hasChanges) {
      setOpenItems(newOpenItems);
    }
  }, [pathname, hasActiveChild, isRouteActive, openItems]);

  const handleCollapsibleClick = useCallback((title: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  }, []);

  // Render navigation items recursively
  const renderNavItems = (navItems: NavItem[], level: number = 0) => {
    return navItems.map((item) => {
      const hasSubItems = item.items && item.items.length > 0;
      const itemKey = `${level}-${item.title}`;
      const isActive = isRouteActive(item.url);
      const hasActiveSub = hasActiveChild(item);
      
      if (!hasSubItems) {
        return (
          <div key={item.title} className="mb-1 relative">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start gap-2 h-8 overflow-hidden rounded-md text-left text-sm outline-none transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground peer",
                level === 0 ? "font-medium pl-4 pr-2 py-2 text-sm" : level === 1 ? "pl-10 pr-2 py-2 text-sm font-normal" : level === 2 ? "pl-16 pr-2 py-2 text-xs font-normal" : "pl-20 pr-2 py-2 text-xs font-light",
                isActive && "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
              )}
              asChild
            >
              <Link href={item.url}>
                {item.icon && level === 0 && <item.icon className="h-4 w-4 shrink-0" />}
                <span className={cn(
                  "transition-colors truncate",
                  isActive && "text-primary font-medium"
                )}>
                  {item.title}
                </span>
              </Link>
            </Button>
            {/* Vertical connecting line for sub-items that changes color when active or on hover */}
            {level > 0 && (
              <div 
                className={cn(
                  "absolute top-0 h-full w-px translate-x-px transition-colors peer-hover:bg-primary",
                  level === 1 ? "left-[18px]" : level === 2 ? "left-[32px]" : "left-[40px]",
                  isActive ? "bg-primary" : "bg-sidebar-border"
                )} 
              />
            )}
          </div>
        );
      }

      // Render collapsible items
      const isOpen = openItems[itemKey];
      const shouldHighlight = isActive && !hasActiveSub;
      
      return (
        <div key={item.title} className="mb-1 relative">
          <Collapsible
            open={isOpen}
            onOpenChange={() => handleCollapsibleClick(itemKey)}
            className="group/collapsible"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start gap-2 h-8 overflow-hidden rounded-md text-left text-sm outline-none transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground peer",
                  level === 0 ? "font-medium pl-4 pr-2 py-2 text-sm" : level === 1 ? "pl-10 pr-2 py-2 text-sm font-normal" : level === 2 ? "pl-16 pr-2 py-2 text-xs font-normal" : "pl-20 pr-2 py-2 text-xs font-light",
                  shouldHighlight && "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                )}
                asChild
              >
                <Link href={item.url}>
                  {item.icon && level === 0 && <item.icon className="h-4 w-4 shrink-0" />}
                  <span className={cn(
                    "transition-colors flex-1 text-left truncate",
                    shouldHighlight && "text-primary font-medium"
                  )}>
                    {item.title}
                  </span>
                  <ChevronRight className={cn(
                    "h-3 w-3 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90",
                    isOpen && "rotate-90"
                  )} />
                </Link>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0">
              <div className="mt-1">
                {renderNavItems(item.items!, level + 1)}
              </div>
            </CollapsibleContent>
          </Collapsible>
          {/* Vertical connecting line for sub-items that changes color when active or on hover */}
          {level > 0 && (
            <div 
              className={cn(
                "absolute top-0 h-8 w-px translate-x-px transition-colors peer-hover:bg-primary",
                level === 1 ? "left-[18px]" : level === 2 ? "left-[32px]" : "left-[40px]",
                shouldHighlight ? "bg-primary" : "bg-sidebar-border"
              )} 
            />
          )}
        </div>
      );
    });
  };

  return (
    <nav className="flex flex-col space-y-1">
      {renderNavItems(docsNavItems)}
    </nav>
  );
}