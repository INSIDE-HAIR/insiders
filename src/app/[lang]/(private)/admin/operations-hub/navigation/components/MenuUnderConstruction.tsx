"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Progress } from "@/src/components/ui/progress";
import { Separator } from "@/src/components/ui/separator";
import {
  WrenchScrewdriverIcon,
  UsersIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CubeTransparentIcon,
  CodeBracketIcon,
  LockClosedIcon,
  GlobeAltIcon,
  AdjustmentsHorizontalIcon,
  ViewColumnsIcon,
  CommandLineIcon,
  ServerStackIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import {
  Columns3,
  Navigation,
  PanelLeft,
  Users,
  Shield,
  Settings,
  GitBranch,
  Database,
  Globe,
  Palette,
  Zap,
  Target,
  FileText,
  CheckCircle,
} from "lucide-react";
import { MermaidDiagram } from "@/src/components/drive/docs/mermaid-diagram";

interface MenuUnderConstructionProps {
  lang: string;
}

const rolesList = [
  {
    role: "ADMIN",
    description: "Administrador completo del sistema",
  },
  {
    role: "CLIENT",
    description: "Clientes con acceso a servicios",
  },
  {
    role: "EMPLOYEE",
    description: "Empleados de la organización",
  },
  {
    role: "DEBTOR",
    description: "Deudores con acceso limitado",
  },
  {
    role: "PROVIDER",
    description: "Proveedores de servicios",
  },
  { role: "LEAD", description: "Leads y prospectos" },
];

const teams = [
  {
    key: "gestion",
    name: "Equipo de Gestión",
    modules: 16,
  },
  {
    key: "creativos",
    name: "Equipo Creativo",
    modules: 5,
  },
  {
    key: "consultoria",
    name: "Equipo de Consultoría",
    modules: 5,
  },
  {
    key: "crecimiento",
    name: "Equipo de Crecimiento",
    modules: 5,
  },
];

const developmentPhases = [
  {
    phase: 1,
    name: "Configuración Base",
    duration: "1 semana",
    progress: 0,
    status: "pending",
  },
  {
    phase: 2,
    name: "Gestión de Footers",
    duration: "1 semana",
    progress: 0,
    status: "pending",
  },
  {
    phase: 3,
    name: "Gestión de Headers",
    duration: "1 semana",
    progress: 0,
    status: "pending",
  },
  {
    phase: 4,
    name: "Sidebars por Equipo",
    duration: "1 semana",
    progress: 0,
    status: "pending",
  },
  {
    phase: 5,
    name: "Integración y Polish",
    duration: "1 semana",
    progress: 0,
    status: "pending",
  },
];

export function MenuUnderConstruction({ }: MenuUnderConstructionProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>("gestion");

  return (
    <div className='space-y-6'>
      {/* Status Badge and Features */}
      <div className='flex items-center justify-between mb-6'>
        <Badge className='bg-primary text-primary-foreground border-0 text-sm px-3 py-1'>
          <WrenchScrewdriverIcon className='h-4 w-4 mr-2' />
          EN CONSTRUCCIÓN
        </Badge>
        <div className='flex flex-wrap gap-3'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <CheckCircleIcon className='h-4 w-4 text-primary' />
            <span>Multi-idioma (ES/EN)</span>
          </div>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <ShieldCheckIcon className='h-4 w-4 text-primary' />
            <span>Control de acceso integrado</span>
          </div>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <ArrowPathIcon className='h-4 w-4 text-primary' />
            <span>Herencia configurable</span>
          </div>
        </div>
      </div>

      {/* Alert de desarrollo */}
      <Alert className='border-primary/20 bg-primary/5'>
        <ExclamationTriangleIcon className='h-4 w-4 text-primary' />
        <AlertDescription className='text-foreground'>
          <strong>Sistema en desarrollo:</strong> Esta página muestra el diseño
          y funcionalidades planificadas del nuevo sistema de gestión de menús.
          Tiempo estimado de desarrollo: 5 semanas.
        </AlertDescription>
      </Alert>

      {/* Main Content Tabs */}
      <Tabs defaultValue='overview' className='space-y-6'>
        <TabsList className='grid grid-cols-4 w-full'>
          <TabsTrigger value='overview'>Vista General</TabsTrigger>
          <TabsTrigger value='features'>Funcionalidades</TabsTrigger>
          <TabsTrigger value='architecture'>Arquitectura</TabsTrigger>
          <TabsTrigger value='roadmap'>Roadmap</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Footer Card */}
            <Card className='border border-border hover:border-primary/50 transition-colors cursor-pointer'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <Columns3 className='h-8 w-8 text-primary' />
                  <Badge variant='outline'>6 variantes</Badge>
                </div>
                <CardTitle className='text-white'>Gestión de Footers</CardTitle>
                <CardDescription className='text-white/80'>
                  Configura footers públicos, privados y específicos por rol
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <GlobeAltIcon className='h-4 w-4 text-primary' />
                    <span className='text-sm text-white'>Footer Público</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <LockClosedIcon className='h-4 w-4 text-primary' />
                    <span className='text-sm text-white'>Footer Privado</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <UsersIcon className='h-4 w-4 text-primary' />
                    <span className='text-sm text-white'>Por Rol (6 roles)</span>
                  </div>
                  <Separator />
                  <div className='pt-2'>
                    <p className='text-xs text-white/70'>
                      Sistema de herencia: Público → Privado → Rol
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Header Card */}
            <Card className='border border-border hover:border-primary/50 transition-colors cursor-pointer'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <Navigation className='h-8 w-8 text-primary' />
                  <Badge variant='outline'>Mega-menús</Badge>
                </div>
                <CardTitle className='text-white'>Gestión de Headers</CardTitle>
                <CardDescription className='text-white/80'>
                  Navbars dinámicos con dropdowns y mega-menús
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <ViewColumnsIcon className='h-4 w-4 text-primary' />
                    <span className='text-sm text-white'>Dropdowns multinivel</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <AdjustmentsHorizontalIcon className='h-4 w-4 text-primary' />
                    <span className='text-sm text-white'>CTAs configurables</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <CubeTransparentIcon className='h-4 w-4 text-primary' />
                    <span className='text-sm text-white'>Mobile responsive</span>
                  </div>
                  <Separator />
                  <div className='pt-2'>
                    <p className='text-xs text-white/70'>
                      Soporte para badges y notificaciones
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar Card */}
            <Card className='border border-border hover:border-primary/50 transition-colors cursor-pointer'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <PanelLeft className='h-8 w-8 text-primary' />
                  <Badge variant='outline'>4 equipos</Badge>
                </div>
                <CardTitle className='text-white'>Sidebars por Equipo</CardTitle>
                <CardDescription className='text-white/80'>
                  Módulos personalizados según equipo y permisos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <UserGroupIcon className='h-4 w-4 text-primary' />
                    <span className='text-sm text-white'>Selector de equipo</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Squares2X2Icon className='h-4 w-4 text-primary' />
                    <span className='text-sm text-white'>Módulos disponibles</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <ShieldCheckIcon className='h-4 w-4 text-primary' />
                    <span className='text-sm text-white'>Validación de permisos</span>
                  </div>
                  <Separator />
                  <div className='pt-2'>
                    <p className='text-xs text-white/70'>
                      Prioridad: Equipo {">"} Rol {">"} General
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Roles Section */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-white'>
                <Users className='h-5 w-5 text-primary' />
                Sistema de Roles
              </CardTitle>
              <CardDescription className='text-white/80'>
                Cada rol puede tener su propia configuración de menús
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
                {rolesList.map((role) => (
                  <div
                    key={role.role}
                    className={`border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors bg-card cursor-pointer ${
                      selectedRole === role.role
                        ? "ring-2 ring-primary bg-primary/10"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedRole(
                        role.role === selectedRole ? null : role.role
                      )
                    }
                  >
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <h3 className='font-semibold text-foreground text-sm'>{role.role}</h3>
                        {selectedRole === role.role && (
                          <CheckCircle className='w-4 h-4 text-primary' />
                        )}
                      </div>
                      <p className='text-xs text-muted-foreground leading-relaxed'>
                        {role.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {selectedRole && (
                <Alert className='mt-4 border-primary/20 bg-primary/10'>
                  <AlertDescription className='text-foreground'>
                    <strong>Rol seleccionado: {selectedRole}</strong>
                    <br />
                    Este rol tendrá acceso a menús personalizados que heredan del menú privado pero pueden sobrescribirse completamente.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Teams Section */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-white'>
                <UserGroupIcon className='h-5 w-5 text-primary' />
                Equipos y Sidebars
              </CardTitle>
              <CardDescription className='text-white/80'>
                Configuración de sidebars administrativos por equipo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                {teams.map((team) => (
                  <div
                    key={team.key}
                    className={`border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors bg-card cursor-pointer ${
                      selectedTeam === team.key
                        ? "ring-2 ring-primary bg-primary/10"
                        : ""
                    }`}
                    onClick={() => setSelectedTeam(team.key)}
                  >
                    <div className='flex justify-between items-start mb-2'>
                      {selectedTeam === team.key && (
                        <CheckCircle className='w-4 h-4 text-primary' />
                      )}
                      <Badge variant='secondary'>
                        {team.modules} módulos
                      </Badge>
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-foreground mb-1'>{team.name}</h3>
                      <p className='text-xs text-muted-foreground leading-relaxed'>
                        dashboard-routes.ts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {selectedTeam && (
                <div className='mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg'>
                  <h4 className='font-semibold text-foreground mb-3'>
                    Módulos disponibles para{" "}
                    <span className='text-primary'>{teams.find((t) => t.key === selectedTeam)?.name}</span>:
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {[
                      "admin",
                      "dashboard",
                      "products",
                      "users",
                      "analytics",
                      "drive",
                      "meet",
                      "calendar",
                    ].map((module) => (
                      <Badge key={module} variant='secondary' className='hover:bg-accent'>
                        {module}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value='features' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-white'>
                  <GitBranch className='h-5 w-5 text-primary' />
                  Sistema de Herencia
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <div className='h-8 w-8 rounded-full bg-primary flex items-center justify-center'>
                      <span className='font-bold text-black'>1</span>
                    </div>
                    <div className='flex-1'>
                      <div className='font-medium text-white'>Menú Público</div>
                      <div className='text-sm text-white/80'>
                        Base para todos los usuarios
                      </div>
                    </div>
                  </div>
                  <div className='ml-4 border-l-2 border-dashed border-primary h-4' />
                  <div className='flex items-center gap-2'>
                    <div className='h-8 w-8 rounded-full bg-primary flex items-center justify-center'>
                      <span className='font-bold text-black'>2</span>
                    </div>
                    <div className='flex-1'>
                      <div className='font-medium text-white'>Menú Privado</div>
                      <div className='text-sm text-white/80'>
                        Hereda o rompe con público
                      </div>
                    </div>
                  </div>
                  <div className='ml-4 border-l-2 border-dashed border-primary h-4' />
                  <div className='flex items-center gap-2'>
                    <div className='h-8 w-8 rounded-full bg-primary flex items-center justify-center'>
                      <span className='font-bold text-black'>3</span>
                    </div>
                    <div className='flex-1'>
                      <div className='font-medium text-white'>Menú por Rol</div>
                      <div className='text-sm text-white/80'>
                        6 roles disponibles
                      </div>
                    </div>
                  </div>
                  <div className='ml-4 border-l-2 border-dashed border-primary h-4' />
                  <div className='flex items-center gap-2'>
                    <div className='h-8 w-8 rounded-full bg-primary flex items-center justify-center'>
                      <span className='font-bold text-black'>4</span>
                    </div>
                    <div className='flex-1'>
                      <div className='font-medium text-white'>Sidebar por Equipo</div>
                      <div className='text-sm text-white/80'>
                        Máxima prioridad
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-white'>
                  <Shield className='h-5 w-5 text-primary' />
                  Control de Acceso
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-primary' />
                  <span className='text-sm text-white'>Integración con AccessControl</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-primary' />
                  <span className='text-sm text-white'>Validación server-side</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-primary' />
                  <span className='text-sm text-white'>
                    Ocultación automática de items
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-primary' />
                  <span className='text-sm text-white'>Logs de acceso denegado</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-primary' />
                  <span className='text-sm text-white'>Warnings de permisos</span>
                </div>
                <Separator className='my-3' />
                <Alert>
                  <AlertDescription className='text-xs'>
                    Reutiliza el sistema ComplexAccessControl existente para
                    validación granular
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-white'>
                  <Palette className='h-5 w-5 text-primary' />
                  Interfaz de Usuario
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='space-y-2'>
                  <div className='text-sm font-medium text-white'>
                    Componentes reutilizados:
                  </div>
                  <div className='pl-4 space-y-1'>
                    <div className='flex items-center gap-2'>
                      <CodeBracketIcon className='h-4 w-4 text-primary' />
                      <span className='text-sm text-white'>GroupsManagement</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <CodeBracketIcon className='h-4 w-4 text-primary' />
                      <span className='text-sm text-white'>TagsManagement</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <CodeBracketIcon className='h-4 w-4 text-primary' />
                      <span className='text-sm text-white'>HierarchyTree</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <CodeBracketIcon className='h-4 w-4 text-primary' />
                      <span className='text-sm text-white'>ComplexRuleBuilder</span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className='flex items-center gap-2'>
                  <SparklesIcon className='h-4 w-4 text-primary' />
                  <span className='text-sm text-white'>UI consistente con Meet</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-white'>
                  <Globe className='h-5 w-5 text-primary' />
                  Características Adicionales
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-primary' />
                  <span className='text-sm text-white'>Multi-idioma (ES/EN)</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-primary' />
                  <span className='text-sm text-white'>Preview antes de publicar</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-primary' />
                  <span className='text-sm text-white'>Sistema draft/published</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-primary' />
                  <span className='text-sm text-white'>Iconos Lucide React</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircleIcon className='h-4 w-4 text-primary' />
                  <span className='text-sm text-white'>Cache de menús</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Architecture Tab */}
        <TabsContent value='architecture' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-white'>
                <Database className='h-5 w-5 text-primary' />
                Arquitectura Técnica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type='single' collapsible className='w-full'>
                <AccordionItem value='models'>
                  <AccordionTrigger>
                    <div className='flex items-center gap-2 text-white'>
                      <ServerStackIcon className='h-4 w-4 text-primary' />
                      Modelos de Datos (Prisma)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className='space-y-6'>
                      <MermaidDiagram
                        chart={`
erDiagram
    MenuConfiguration {
        string id PK "cuid()"
        MenuType type "HEADER|FOOTER|SIDEBAR"
        MenuScope scope "PUBLIC|PRIVATE|ROLE|TEAM"
        string scopeValue "Role/Team identifier"
        string inheritsFrom FK "Parent menu ID"
        boolean isActive "Default: true"
        int priority "Default: 0"
        datetime createdAt
        datetime updatedAt
    }

    MenuItem {
        string id PK "cuid()"
        json label "Multi-language {es, en}"
        string href "Optional URL"
        string icon "Lucide icon name"
        string parentId FK "Self-reference"
        int order "Default: 0"
        string[] requiredRoles "Role restrictions"
        string[] requiredPermissions "Permission checks"
        boolean isVisible "Default: true"
        boolean openInNewTab "Default: false"
        string menuConfigId FK
    }

    TeamSidebarConfig {
        string id PK "cuid()"
        string teamKey UK "Unique team identifier"
        string[] availableRoutes "dashboard-routes modules"
        string customMenuId FK "Override menu"
        int priority "Default: 0"
        string[] userIds "Assigned users"
        boolean isActive "Default: true"
        InheritanceMode inheritanceMode "Enum"
    }

    User {
        string id PK
        string email
        string role "ADMIN|EMPLOYEE|CLIENT..."
        string teamKey FK "Optional team assignment"
    }

    MenuConfiguration ||--o{ MenuItem : "contains"
    MenuConfiguration ||--o| MenuConfiguration : "inherits from"
    TeamSidebarConfig ||--o| MenuConfiguration : "custom menu"
    User ||--o| TeamSidebarConfig : "assigned to"
    MenuItem ||--o{ MenuItem : "children"
                        `}
                        className="mb-6"
                      />
                      
                      <div className='bg-card p-4 rounded-lg border border-border'>
                        <h4 className='font-semibold text-sm text-foreground mb-3 flex items-center gap-2'>
                          <Database className='h-4 w-4 text-primary' />
                          Esquema de Base de Datos - Características Clave
                        </h4>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                          <div className='space-y-2'>
                            <div className='flex items-start gap-2'>
                              <span className='text-blue-600 font-semibold'>•</span>
                              <div>
                                <span className='font-medium text-foreground'>Herencia Configurable:</span>
                                <div className='text-muted-foreground text-xs'>MenuConfiguration puede heredar de otro menú padre</div>
                              </div>
                            </div>
                            <div className='flex items-start gap-2'>
                              <span className='text-purple-600 font-semibold'>•</span>
                              <div>
                                <span className='font-medium text-foreground'>Jerarquía de Items:</span>
                                <div className='text-muted-foreground text-xs'>MenuItem soporta estructura de árbol con parentId</div>
                              </div>
                            </div>
                            <div className='flex items-start gap-2'>
                              <span className='text-green-600 font-semibold'>•</span>
                              <div>
                                <span className='font-medium text-foreground'>Multi-idioma:</span>
                                <div className='text-muted-foreground text-xs'>Labels almacenados como JSON {"{"}es, en{"}"}</div>
                              </div>
                            </div>
                          </div>
                          <div className='space-y-2'>
                            <div className='flex items-start gap-2'>
                              <span className='text-orange-600 font-semibold'>•</span>
                              <div>
                                <span className='font-medium text-foreground'>Control de Acceso:</span>
                                <div className='text-muted-foreground text-xs'>Roles y permisos granulares por item</div>
                              </div>
                            </div>
                            <div className='flex items-start gap-2'>
                              <span className='text-red-600 font-semibold'>•</span>
                              <div>
                                <span className='font-medium text-foreground'>Equipos Específicos:</span>
                                <div className='text-muted-foreground text-xs'>TeamSidebarConfig para sidebars personalizados</div>
                              </div>
                            </div>
                            <div className='flex items-start gap-2'>
                              <span className='text-indigo-600 font-semibold'>•</span>
                              <div>
                                <span className='font-medium text-foreground'>Prioridades:</span>
                                <div className='text-muted-foreground text-xs'>Sistema de prioridades para resolución de conflictos</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='api'>
                  <AccordionTrigger>
                    <div className='flex items-center gap-2 text-white'>
                      <CommandLineIcon className='h-4 w-4 text-primary' />
                      API Routes
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className='space-y-4 p-4 bg-accent/20 rounded-lg border border-border'>
                      <div className='space-y-3'>
                        <div className='bg-card p-3 rounded border border-border'>
                          <h4 className='font-semibold text-sm mb-2 text-foreground'>
                            Gestión de Menús
                          </h4>
                          <div className='space-y-2 font-mono text-xs'>
                            <div className='flex items-center gap-2'>
                              <Badge
                                variant='outline'
                                className='font-mono text-xs bg-green-100 text-green-800 border-green-300'
                              >
                                GET
                              </Badge>
                              <span className='text-foreground'>/api/admin/menu/[type]</span>
                              <span className='text-muted-foreground'>
                                {/* Lista menús por tipo */}
                              </span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Badge
                                variant='outline'
                                className='font-mono text-xs bg-blue-100 text-blue-800 border-blue-300'
                              >
                                POST
                              </Badge>
                              <span className='text-foreground'>/api/admin/menu/[type]</span>
                              <span className='text-muted-foreground'>
                                // Crear menú
                              </span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Badge
                                variant='outline'
                                className='font-mono text-xs bg-yellow-100 text-yellow-800 border-yellow-300'
                              >
                                PUT
                              </Badge>
                              <span className='text-foreground'>/api/admin/menu/[type]/[id]</span>
                              <span className='text-muted-foreground'>
                                // Actualizar menú
                              </span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Badge
                                variant='outline'
                                className='font-mono text-xs bg-red-100 text-red-800 border-red-300'
                              >
                                DELETE
                              </Badge>
                              <span className='text-foreground'>/api/admin/menu/[type]/[id]</span>
                              <span className='text-muted-foreground'>
                                // Eliminar menú
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className='bg-card p-3 rounded border border-border'>
                          <h4 className='font-semibold text-sm mb-2 text-foreground'>
                            Publishing & Preview
                          </h4>
                          <div className='space-y-2 font-mono text-xs'>
                            <div className='flex items-center gap-2'>
                              <Badge
                                variant='outline'
                                className='font-mono text-xs bg-purple-100 text-purple-800 border-purple-300'
                              >
                                POST
                              </Badge>
                              <span className='text-foreground'>/api/admin/menu/publish</span>
                              <span className='text-muted-foreground'>
                                // Publicar cambios
                              </span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Badge
                                variant='outline'
                                className='font-mono text-xs bg-green-100 text-green-800 border-green-300'
                              >
                                GET
                              </Badge>
                              <span className='text-foreground'>/api/admin/menu/preview</span>
                              <span className='text-muted-foreground'>
                                // Vista previa
                              </span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Badge
                                variant='outline'
                                className='font-mono text-xs bg-orange-100 text-orange-800 border-orange-300'
                              >
                                POST
                              </Badge>
                              <span className='text-foreground'>/api/admin/menu/rollback</span>
                              <span className='text-muted-foreground'>
                                // Revertir cambios
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className='bg-card p-3 rounded border border-border'>
                          <h4 className='font-semibold text-sm mb-2 text-foreground'>
                            Team & Inheritance
                          </h4>
                          <div className='space-y-2 font-mono text-xs'>
                            <div className='flex items-center gap-2'>
                              <Badge
                                variant='outline'
                                className='font-mono text-xs bg-green-100 text-green-800 border-green-300'
                              >
                                GET
                              </Badge>
                              <span className='text-foreground'>/api/admin/menu/team/[teamKey]</span>
                              <span className='text-muted-foreground'>
                                // Menú por equipo
                              </span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Badge
                                variant='outline'
                                className='font-mono text-xs bg-blue-100 text-blue-800 border-blue-300'
                              >
                                POST
                              </Badge>
                              <span className='text-foreground'>/api/admin/menu/inherit</span>
                              <span className='text-muted-foreground'>
                                // Configurar herencia
                              </span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Badge
                                variant='outline'
                                className='font-mono text-xs bg-yellow-100 text-yellow-800 border-yellow-300'
                              >
                                PUT
                              </Badge>
                              <span className='text-foreground'>/api/admin/menu/permissions</span>
                              <span className='text-muted-foreground'>
                                // Actualizar permisos
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='integration'>
                  <AccordionTrigger>
                    <div className='flex items-center gap-2 text-white'>
                      <CpuChipIcon className='h-4 w-4 text-primary' />
                      Integraciones
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className='space-y-4 p-4 bg-accent/20 rounded-lg border border-border'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='bg-card p-3 rounded border border-border space-y-3'>
                          <h4 className='font-semibold text-sm text-foreground flex items-center gap-2'>
                            <Settings className='h-4 w-4 text-primary' />
                            Sistemas Backend
                          </h4>
                          <ul className='space-y-2 text-sm'>
                            <li className='flex items-center gap-2'>
                              <CheckCircleIcon className='h-4 w-4 text-primary' />
                              <div>
                                <span className='font-mono text-xs text-foreground'>
                                  dashboard-routes.ts
                                </span>
                                <div className='text-xs text-muted-foreground'>
                                  Configuración actual de rutas por equipo
                                </div>
                              </div>
                            </li>
                            <li className='flex items-center gap-2'>
                              <CheckCircleIcon className='h-4 w-4 text-primary' />
                              <div>
                                <span className='font-mono text-xs text-foreground'>
                                  ComplexAccessControl
                                </span>
                                <div className='text-xs text-muted-foreground'>
                                  Sistema de permisos granulares
                                </div>
                              </div>
                            </li>
                            <li className='flex items-center gap-2'>
                              <CheckCircleIcon className='h-4 w-4 text-primary' />
                              <div>
                                <span className='font-mono text-xs text-foreground'>
                                  NextAuth.js roles
                                </span>
                                <div className='text-xs text-muted-foreground'>
                                  ADMIN, EMPLOYEE, CLIENT, etc.
                                </div>
                              </div>
                            </li>
                            <li className='flex items-center gap-2'>
                              <CheckCircleIcon className='h-4 w-4 text-primary' />
                              <div>
                                <span className='font-mono text-xs text-foreground'>
                                  i18n Context
                                </span>
                                <div className='text-xs text-muted-foreground'>
                                  Sistema multi-idioma ES/EN
                                </div>
                              </div>
                            </li>
                          </ul>
                        </div>

                        <div className='bg-card p-3 rounded border border-border space-y-3'>
                          <h4 className='font-semibold text-sm text-foreground flex items-center gap-2'>
                            <Palette className='h-4 w-4 text-primary' />
                            Componentes UI
                          </h4>
                          <ul className='space-y-2 text-sm'>
                            <li className='flex items-center gap-2'>
                              <CheckCircleIcon className='h-4 w-4 text-primary' />
                              <div>
                                <span className='font-mono text-xs text-foreground'>
                                  shadcn/ui
                                </span>
                                <div className='text-xs text-muted-foreground'>
                                  Card, Button, Dialog, etc.
                                </div>
                              </div>
                            </li>
                            <li className='flex items-center gap-2'>
                              <CheckCircleIcon className='h-4 w-4 text-primary' />
                              <div>
                                <span className='font-mono text-xs text-foreground'>
                                  Radix UI
                                </span>
                                <div className='text-xs text-muted-foreground'>
                                  Primitives accesibles
                                </div>
                              </div>
                            </li>
                            <li className='flex items-center gap-2'>
                              <CheckCircleIcon className='h-4 w-4 text-primary' />
                              <div>
                                <span className='font-mono text-xs text-foreground'>
                                  Lucide React
                                </span>
                                <div className='text-xs text-muted-foreground'>
                                  Iconografía consistente
                                </div>
                              </div>
                            </li>
                            <li className='flex items-center gap-2'>
                              <CheckCircleIcon className='h-4 w-4 text-primary' />
                              <div>
                                <span className='font-mono text-xs text-foreground'>
                                  HeroIcons
                                </span>
                                <div className='text-xs text-muted-foreground'>
                                  Iconos alternativos
                                </div>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className='bg-card p-3 rounded border border-border'>
                        <h4 className='font-semibold text-sm text-foreground flex items-center gap-2 mb-3'>
                          <GitBranch className='h-4 w-4 text-primary' />
                          Arquitectura de Integración
                        </h4>
                        <div className='space-y-2 text-xs'>
                          <div className='flex items-center gap-2 p-2 bg-accent/30 rounded border border-border'>
                            <span className='font-mono text-foreground'>1. MenuResolver</span>
                            <span className='text-muted-foreground'>
                              → Determina qué menú mostrar según contexto
                            </span>
                          </div>
                          <div className='flex items-center gap-2 p-2 bg-accent/30 rounded border border-border'>
                            <span className='font-mono text-foreground'>
                              2. PermissionChecker
                            </span>
                            <span className='text-muted-foreground'>
                              → Valida acceso usando ComplexAccessControl
                            </span>
                          </div>
                          <div className='flex items-center gap-2 p-2 bg-accent/30 rounded border border-border'>
                            <span className='font-mono text-foreground'>
                              3. InheritanceProcessor
                            </span>
                            <span className='text-muted-foreground'>
                              → Aplica herencia y override de configuraciones
                            </span>
                          </div>
                          <div className='flex items-center gap-2 p-2 bg-accent/30 rounded border border-border'>
                            <span className='font-mono text-foreground'>4. MenuRenderer</span>
                            <span className='text-muted-foreground'>
                              → Genera componentes React finales
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roadmap Tab */}
        <TabsContent value='roadmap' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-white'>
                <RocketLaunchIcon className='h-5 w-5 text-primary' />
                Plan de Desarrollo
              </CardTitle>
              <CardDescription className='text-white/80'>
                5 sprints de 1 semana cada uno - Total: 5 semanas
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {developmentPhases.map((phase, index) => (
                <div key={phase.phase} className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                          phase.status === "completed"
                            ? "bg-green-500 text-white"
                            : phase.status === "in-progress"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {phase.phase}
                      </div>
                      <div>
                        <div className='font-medium text-white'>{phase.name}</div>
                        <div className='text-sm text-white/70'>
                          {phase.duration}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        phase.status === "completed"
                          ? "default"
                          : phase.status === "in-progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {phase.status === "completed"
                        ? "Completado"
                        : phase.status === "in-progress"
                          ? "En Progreso"
                          : "Pendiente"}
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <Progress value={phase.progress} className='h-2' />

                  {/* Phase details */}
                  <div className='ml-13 pl-4 border-l-2 border-gray-200'>
                    {phase.phase === 1 && (
                      <ul className='space-y-1 text-sm text-white/80'>
                        <li>• Setup de esquema Prisma</li>
                        <li>• Página base de gestión</li>
                        <li>• API Routes CRUD</li>
                      </ul>
                    )}
                    {phase.phase === 2 && (
                      <ul className='space-y-1 text-sm text-white/80'>
                        <li>• Footer Management Component</li>
                        <li>• Footer Item Builder</li>
                        <li>• Footer Preview</li>
                      </ul>
                    )}
                    {phase.phase === 3 && (
                      <ul className='space-y-1 text-sm text-white/80'>
                        <li>• Header Management Component</li>
                        <li>• Header Navigation Builder</li>
                        <li>• Mega-menús y dropdowns</li>
                      </ul>
                    )}
                    {phase.phase === 4 && (
                      <ul className='space-y-1 text-sm text-white/80'>
                        <li>• Team Sidebar Manager</li>
                        <li>• Module Permission Checker</li>
                        <li>• Sidebar Priority System</li>
                      </ul>
                    )}
                    {phase.phase === 5 && (
                      <ul className='space-y-1 text-sm text-white/80'>
                        <li>• Menu Inheritance System</li>
                        <li>• Access Control Integration</li>
                        <li>• Publishing System</li>
                        <li>• Testing y Documentación</li>
                      </ul>
                    )}
                  </div>

                  {index < developmentPhases.length - 1 && (
                    <Separator className='mt-6' />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* KPIs Card */}
          <Card className='bg-primary/5 border-primary/20'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-white'>
                <ChartBarIcon className='h-5 w-5 text-primary' />
                Métricas de Éxito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='space-y-2 bg-card p-3 rounded-md border border-border'>
                  <h4 className='font-medium text-sm text-white'>
                    KPIs Técnicos
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li className='flex items-center gap-2'>
                      <Target className='h-3 w-3 text-primary' />
                      <span className='text-white/90'>
                        Carga de menú {"<"} 100ms
                      </span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <Target className='h-3 w-3 text-primary' />
                      <span className='text-white/90'>
                        Cache hit rate {">"} 90%
                      </span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <Target className='h-3 w-3 text-primary' />
                      <span className='text-white/90'>
                        Error rate {"<"} 0.1%
                      </span>
                    </li>
                  </ul>
                </div>
                <div className='space-y-2 bg-card p-3 rounded-md border border-border'>
                  <h4 className='font-medium text-sm text-white'>
                    KPIs de Negocio
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li className='flex items-center gap-2'>
                      <Target className='h-3 w-3 text-primary' />
                      <span className='text-white/90'>
                        Tiempo config -50%
                      </span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <Target className='h-3 w-3 text-primary' />
                      <span className='text-white/90'>
                        Tickets soporte -30%
                      </span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <Target className='h-3 w-3 text-primary' />
                      <span className='text-white/90'>
                        Adopción 100% en 30 días
                      </span>
                    </li>
                  </ul>
                </div>
                <div className='space-y-2 bg-card p-3 rounded-md border border-border'>
                  <h4 className='font-medium text-sm text-white'>
                    Beneficios
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li className='flex items-center gap-2'>
                      <Zap className='h-3 w-3 text-primary' />
                      <span className='text-white/90'>
                        Gestión centralizada
                      </span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <Zap className='h-3 w-3 text-primary' />
                      <span className='text-white/90'>
                        Permisos granulares
                      </span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <Zap className='h-3 w-3 text-primary' />
                      <span className='text-white/90'>
                        Herencia inteligente
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer CTA */}
      <Card className='bg-primary/5 border-primary/20'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-semibold mb-2 text-white'>
                ¿Listo para comenzar el desarrollo?
              </h3>
              <p className='text-sm text-white/80'>
                Este sistema reutilizará componentes existentes de Meet y
                AccessControl
              </p>
            </div>
            <div className='flex gap-3'>
              <Button variant='outline'>
                <FileText className='h-4 w-4 mr-2' />
                Ver PRD
              </Button>
              <Button>
                <RocketLaunchIcon className='h-4 w-4 mr-2' />
                Iniciar Sprint 1
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
