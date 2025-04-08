"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Home,
  Server,
  Layout,
  Users,
  Code,
  Database,
  Workflow,
  ChevronRight,
  FileText,
  FolderTree,
  Type,
  Puzzle,
  FileCode,
  PackageOpen,
  CodeSquare,
  GitBranch,
  ClipboardList,
  PlusCircle,
  Layers,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Separator } from "@/src/components/ui/separator";
import { cn } from "@/src/lib/utils";

interface DocsLayoutProps {
  children: ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname?.includes(path);
  };

  // Restructurar los elementos de navegación como una lista plana
  const navItems = [
    {
      title: "Inicio",
      href: "/admin/drive/routes/docs",
      icon: Home,
      exact: true,
    },
    {
      title: "Frontend",
      href: "/admin/drive/routes/docs/frontend",
      icon: Layout,
      isSection: true,
    },
    {
      title: "Guía de Usuario Frontend",
      href: "/admin/drive/routes/docs/frontend/users",
      icon: Users,
      parent: "Frontend",
    },
    {
      title: "Convenciones de Nombres",
      href: "/admin/drive/routes/docs/frontend/users/naming-conventions",
      icon: Type,
      parent: "Frontend",
      subLevel: true,
    },
    {
      title: "Campo de Descripción",
      href: "/admin/drive/routes/docs/frontend/users/description-field",
      icon: FileText,
      parent: "Frontend",
      subLevel: true,
    },
    {
      title: "Estructura de Drive",
      href: "/admin/drive/routes/docs/frontend/users/drive-structure",
      icon: FolderTree,
      parent: "Frontend",
      subLevel: true,
    },
    {
      title: "Tipos de Componentes",
      href: "/admin/drive/routes/docs/frontend/users/component-types",
      icon: Puzzle,
      parent: "Frontend",
      subLevel: true,
    },
    {
      title: "Documentación Técnica Frontend",
      href: "/admin/drive/routes/docs/frontend/devs",
      icon: Code,
      parent: "Frontend",
    },
    {
      title: "Arquitectura",
      href: "/admin/drive/routes/docs/frontend/devs/architecture",
      icon: GitBranch,
      parent: "Frontend",
      subLevel: true,
    },
    {
      title: "Estructura de Archivos",
      href: "/admin/drive/routes/docs/frontend/devs/file-structure",
      icon: FolderTree,
      parent: "Frontend",
      subLevel: true,
    },
    {
      title: "Parser de Descripción",
      href: "/admin/drive/routes/docs/frontend/devs/description-parser",
      icon: FileCode,
      parent: "Frontend",
      subLevel: true,
    },
    {
      title: "Agregar Componentes",
      href: "/admin/drive/routes/docs/frontend/devs/adding-components",
      icon: PlusCircle,
      parent: "Frontend",
      subLevel: true,
    },
    {
      title: "Componentes Actuales",
      href: "/admin/drive/routes/docs/frontend/devs/current-components",
      icon: Layers,
      parent: "Frontend",
      subLevel: true,
    },
    {
      title: "Helpers de Tipado",
      href: "/admin/drive/routes/docs/frontend/devs/typing-helpers",
      icon: CodeSquare,
      parent: "Frontend",
      subLevel: true,
    },
    {
      title: "Backend",
      href: "/admin/drive/routes/docs/backend",
      icon: Server,
      isSection: true,
    },
    {
      title: "Guía de Usuario Backend",
      href: "/admin/drive/routes/docs/backend/users",
      icon: Users,
      parent: "Backend",
    },
    {
      title: "Documentación Técnica Backend",
      href: "/admin/drive/routes/docs/backend/devs",
      icon: Code,
      parent: "Backend",
    },
    {
      title: "Modelo de Datos",
      href: "/admin/drive/routes/docs/backend/devs#data-model",
      icon: Database,
      parent: "Backend",
    },
    {
      title: "Flujos de Trabajo",
      href: "/admin/drive/routes/docs/backend/devs#workflows",
      icon: Workflow,
      parent: "Backend",
    },
  ];

  return (
    <div className='flex min-h-screen flex-col'>
      <header className='sticky top-0 z-40 border-b bg-background'>
        <div className='container flex h-16 items-center justify-between py-4'>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              onClick={() => router.push("/admin/drive/routes")}
              className='mr-2'
            >
              <ArrowLeft className='mr-2 h-4 w-4' /> Volver
            </Button>
            <h1 className='text-xl font-semibold'>
              Documentación de Rutas de Drive
            </h1>
          </div>
        </div>
      </header>
      <div className='container flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10'>
        <aside className='fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block'>
          <ScrollArea className='h-full py-6 pr-6 lg:py-8'>
            <nav className='flex flex-col space-y-1'>
              {navItems.map((item) => {
                const isItemActive = item.exact
                  ? pathname === item.href
                  : isActive(item.href);

                return (
                  <div key={item.href} className='mb-1'>
                    <Button
                      variant={isItemActive ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start w-full",
                        item.parent &&
                          !item.subLevel &&
                          "pl-6 text-sm font-normal",
                        item.subLevel && "pl-10 text-xs font-normal",
                        item.isSection && "font-medium"
                      )}
                      onClick={() => router.push(item.href)}
                    >
                      <item.icon
                        className={cn(
                          "mr-2",
                          item.parent && !item.subLevel
                            ? "h-3.5 w-3.5"
                            : "h-4 w-4",
                          item.subLevel && "h-3 w-3"
                        )}
                      />
                      {item.title}
                    </Button>
                  </div>
                );
              })}
            </nav>
          </ScrollArea>
        </aside>
        <main className='flex w-full flex-col overflow-hidden'>
          <div className='flex-1 space-y-4 p-6 pt-6'>{children}</div>
        </main>
      </div>
    </div>
  );
}
