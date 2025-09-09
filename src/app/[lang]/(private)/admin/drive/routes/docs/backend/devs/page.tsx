"use client";

import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import {
  ArrowRight,
  Database,
  Server,
  Workflow,
  PlusCircle,
  GitBranch,
  Code,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useRouter } from "next/navigation";

export default function BackendDevsDocsPage() {
  const router = useRouter();

  const backendSections = [
    {
      title: "Tecnologías Principales",
      description: "Stack tecnológico del backend",
      icon: Database,
      href: "/admin/drive/routes/docs/backend/devs/technologies",
      color: "blue",
      items: [
        "Next.js API Routes",
        "Prisma ORM",
        "TypeScript",
        "Google Drive API",
        "MongoDB",
      ],
    },
    {
      title: "Arquitectura Backend",
      description: "Diseño en capas y patrones arquitectónicos",
      icon: PlusCircle,
      href: "/admin/drive/routes/docs/backend/devs/architecture",
      color: "purple",
      items: [
        "Arquitectura en Capas",
        "Patrones",
        "Services Layer",
        "Data Layer",
      ],
    },
    {
      title: "Servicios Principales",
      description: "Servicios core del sistema backend",
      icon: GitBranch,
      href: "/admin/drive/routes/docs/backend/devs/services",
      color: "green",
      items: [
        "DriveSyncService",
        "FileAnalyzerService",
        "HierarchyService",
        "AuthService",
      ],
    },
    {
      title: "Modelo de Datos",
      description:
        "Esquemas de Prisma, estructura de base de datos y relaciones",
      icon: Database,
      href: "/admin/drive/routes/docs/backend/devs/data-model",
      color: "orange",
      items: [
        "DriveRoute Schema",
        "DriveRouteLog Schema",
        "Campos principales",
        "Relaciones",
      ],
    },
    {
      title: "API Endpoints",
      description: "Rutas REST, operaciones CRUD y ejemplos de uso",
      icon: Server,
      href: "/admin/drive/routes/docs/backend/devs/api",
      color: "red",
      items: [
        "Operaciones CRUD",
        "Sincronización",
        "Ejemplos de requests",
        "Responses",
      ],
    },
    {
      title: "Flujos de Trabajo",
      description: "Procesos de sincronización y manejo de datos",
      icon: Workflow,
      href: "/admin/drive/routes/docs/backend/devs/workflows",
      color: "blue",
      items: ["Sincronización", "Procesamiento", "Logs", "Monitoreo"],
    },
    {
      title: "Extensiones",
      description: "Cómo extender el sistema con nuevas funcionalidades",
      icon: PlusCircle,
      href: "/admin/drive/routes/docs/backend/devs/extensions",
      color: "green",
      items: [
        "Personalización",
        "Servicios modulares",
        "Componentes UI",
        "Custom Settings",
      ],
    },
    {
      title: "Sincronización",
      description: "Sistema automático de sincronización con Google Drive",
      icon: GitBranch,
      href: "/admin/drive/routes/docs/backend/devs/synchronization",
      color: "purple",
      items: ["Mecanismos", "Cron Jobs", "Logs", "Monitoreo"],
    },
  ];

  return (
    <div>
      <DocHeader
        title='Documentación Técnica Backend'
        description='Guía completa para desarrolladores del sistema backend'
        icon={Code}
      />

      <DocContent>
        <div className='mb-8'>
          <p className='text-lg text-slate-300'>
            El backend está construido con Next.js API Routes, Prisma ORM y
            TypeScript, utilizando una arquitectura modular que facilita la
            extensión y mantenimiento.
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
          {backendSections.map((section) => {
            const Icon = section.icon;
            const colorClasses = {
              blue: "border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30",
              green:
                "border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30",
              purple:
                "border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30",
              orange:
                "border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30",
              red: "border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30",
            };

            const iconColorClasses = {
              blue: "text-primary",
              green: "text-primary",
              purple: "text-primary",
              orange: "text-primary",
              red: "text-primary",
            };

            return (
              <Card
                key={section.title}
                className={`cursor-pointer transition-all duration-200 ${colorClasses[section.color as keyof typeof colorClasses]}`}
                onClick={() => router.push(section.href)}
              >
                <CardHeader>
                  <div className='flex items-center gap-3 mb-2'>
                    <Icon
                      className={`h-6 w-6 ${iconColorClasses[section.color as keyof typeof iconColorClasses]}`}
                    />
                    <CardTitle className='text-lg'>{section.title}</CardTitle>
                  </div>
                  <CardDescription className='text-sm'>
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2 mb-4'>
                    {section.items.map((item, index) => (
                      <div
                        key={index}
                        className='flex items-center gap-2 text-sm text-slate-300'
                      >
                        <div className='w-1.5 h-1.5 bg-current rounded-full' />
                        {item}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant='outline'
                    className='w-full group'
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(section.href);
                    }}
                  >
                    Ver Detalles
                    <ArrowRight className='ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className='bg-primary/5 border border-primary/20 rounded-lg p-6 mt-8'>
          <h4 className='font-semibold mb-2 flex items-center gap-2 text-primary'>
            ⚠️ Prerrequisitos
          </h4>
          <p className='text-sm text-slate-300'>
            Esta documentación asume conocimientos básicos de{" "}
            <strong>Node.js</strong>,<strong>TypeScript</strong>,{" "}
            <strong>Prisma ORM</strong> y <strong>APIs RESTful</strong>. Cada
            sección incluye ejemplos prácticos y casos de uso reales.
          </p>
        </div>
      </DocContent>
    </div>
  );
}
