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
  DocumentTextIcon,
  Squares2X2Icon,
  UserGroupIcon,
  TagIcon,
  FolderIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CubeTransparentIcon,
  ArrowRightIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  LockClosedIcon,
  GlobeAltIcon,
  AdjustmentsHorizontalIcon,
  ViewColumnsIcon,
  CommandLineIcon,
  ServerStackIcon,
  CpuChipIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";
import {
  Menu,
  Columns3,
  Navigation,
  PanelLeft,
  Users,
  Shield,
  Settings,
  Layers,
  GitBranch,
  Database,
  Globe,
  Palette,
  Zap,
  Target,
  Package,
  FileText,
  BarChart3,
} from "lucide-react";

interface MenuUnderConstructionProps {
  lang: string;
}

type MenuSection = "footer" | "header" | "sidebar" | "architecture";

const rolesList = [
  { role: "ADMIN", color: "bg-purple-500", description: "Administrador completo del sistema" },
  { role: "CLIENT", color: "bg-blue-500", description: "Clientes con acceso a servicios" },
  { role: "EMPLOYEE", color: "bg-green-500", description: "Empleados de la organización" },
  { role: "DEBTOR", color: "bg-orange-500", description: "Deudores con acceso limitado" },
  { role: "PROVIDER", color: "bg-indigo-500", description: "Proveedores de servicios" },
  { role: "LEAD", color: "bg-pink-500", description: "Leads y prospectos" },
];

const teams = [
  { key: "gestion", name: "Equipo de Gestión", modules: 16, color: "bg-purple-500" },
  { key: "creativos", name: "Equipo Creativo", modules: 5, color: "bg-pink-500" },
  { key: "consultoria", name: "Equipo de Consultoría", modules: 5, color: "bg-blue-500" },
  { key: "crecimiento", name: "Equipo de Crecimiento", modules: 5, color: "bg-green-500" },
];

const developmentPhases = [
  { phase: 1, name: "Configuración Base", duration: "1 semana", progress: 0, status: "pending" },
  { phase: 2, name: "Gestión de Footers", duration: "1 semana", progress: 0, status: "pending" },
  { phase: 3, name: "Gestión de Headers", duration: "1 semana", progress: 0, status: "pending" },
  { phase: 4, name: "Sidebars por Equipo", duration: "1 semana", progress: 0, status: "pending" },
  { phase: 5, name: "Integración y Polish", duration: "1 semana", progress: 0, status: "pending" },
];

export function MenuUnderConstruction({ lang }: MenuUnderConstructionProps) {
  const [activeSection, setActiveSection] = useState<MenuSection>("footer");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>("gestion");

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <WrenchScrewdriverIcon className="h-10 w-10" />
            <Badge className="bg-yellow-500 text-black border-0">EN CONSTRUCCIÓN</Badge>
          </div>
          <h1 className="text-4xl font-bold mb-3">Sistema de Gestión de Menús Dinámicos</h1>
          <p className="text-xl opacity-90 mb-6">
            Configuración centralizada de Headers, Footers y Sidebars por rol y equipo
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5" />
              <span>Multi-idioma (ES/EN)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5" />
              <span>Control de acceso integrado</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowPathIcon className="h-5 w-5" />
              <span>Herencia configurable</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-10">
          <Menu className="h-64 w-64" />
        </div>
      </div>

      {/* Alert de desarrollo */}
      <Alert className="border-yellow-500 bg-yellow-50">
        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Sistema en desarrollo:</strong> Esta página muestra el diseño y funcionalidades planificadas 
          del nuevo sistema de gestión de menús. Tiempo estimado de desarrollo: 5 semanas.
        </AlertDescription>
      </Alert>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="features">Funcionalidades</TabsTrigger>
          <TabsTrigger value="architecture">Arquitectura</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Footer Card */}
            <Card className="border-2 hover:border-purple-500 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Columns3 className="h-8 w-8 text-purple-500" />
                  <Badge variant="outline">6 variantes</Badge>
                </div>
                <CardTitle>Gestión de Footers</CardTitle>
                <CardDescription>
                  Configura footers públicos, privados y específicos por rol
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <GlobeAltIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Footer Público</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LockClosedIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Footer Privado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Por Rol (6 roles)</span>
                  </div>
                  <Separator />
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      Sistema de herencia: Público → Privado → Rol
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Header Card */}
            <Card className="border-2 hover:border-blue-500 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Navigation className="h-8 w-8 text-blue-500" />
                  <Badge variant="outline">Mega-menús</Badge>
                </div>
                <CardTitle>Gestión de Headers</CardTitle>
                <CardDescription>
                  Navbars dinámicos con dropdowns y mega-menús
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ViewColumnsIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Dropdowns multinivel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">CTAs configurables</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CubeTransparentIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Mobile responsive</span>
                  </div>
                  <Separator />
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      Soporte para badges y notificaciones
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar Card */}
            <Card className="border-2 hover:border-green-500 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <PanelLeft className="h-8 w-8 text-green-500" />
                  <Badge variant="outline">4 equipos</Badge>
                </div>
                <CardTitle>Sidebars por Equipo</CardTitle>
                <CardDescription>
                  Módulos personalizados según equipo y permisos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Selector de equipo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Squares2X2Icon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Módulos disponibles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Validación de permisos</span>
                  </div>
                  <Separator />
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
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
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sistema de Roles
              </CardTitle>
              <CardDescription>
                Cada rol puede tener su propia configuración de menús
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {rolesList.map((role) => (
                  <div
                    key={role.role}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedRole === role.role
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    onClick={() => setSelectedRole(role.role === selectedRole ? null : role.role)}
                  >
                    <div className={`h-2 w-2 rounded-full ${role.color} mb-2`} />
                    <div className="font-medium text-sm">{role.role}</div>
                    <div className="text-xs text-muted-foreground mt-1">{role.description}</div>
                  </div>
                ))}
              </div>
              {selectedRole && (
                <Alert className="mt-4">
                  <AlertDescription>
                    El rol <strong>{selectedRole}</strong> tendrá acceso a menús personalizados 
                    que heredan del menú privado pero pueden sobrescribirse completamente.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Teams Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserGroupIcon className="h-5 w-5" />
                Equipos y Sidebars
              </CardTitle>
              <CardDescription>
                Configuración de sidebars administrativos por equipo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {teams.map((team) => (
                  <div
                    key={team.key}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedTeam === team.key
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    onClick={() => setSelectedTeam(team.key)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`h-3 w-3 rounded-full ${team.color}`} />
                      <Badge variant="secondary">{team.modules} módulos</Badge>
                    </div>
                    <div className="font-medium">{team.name}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      dashboard-routes.ts
                    </div>
                  </div>
                ))}
              </div>
              {selectedTeam && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Módulos disponibles para {teams.find(t => t.key === selectedTeam)?.name}:</h4>
                  <div className="flex flex-wrap gap-2">
                    {["admin", "dashboard", "products", "users", "analytics", "drive", "meet", "calendar"].map((module) => (
                      <Badge key={module} variant="outline">{module}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Sistema de Herencia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">1</div>
                    <div className="flex-1">
                      <div className="font-medium">Menú Público</div>
                      <div className="text-sm text-muted-foreground">Base para todos los usuarios</div>
                    </div>
                  </div>
                  <div className="ml-4 border-l-2 border-dashed h-4" />
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">2</div>
                    <div className="flex-1">
                      <div className="font-medium">Menú Privado</div>
                      <div className="text-sm text-muted-foreground">Hereda o rompe con público</div>
                    </div>
                  </div>
                  <div className="ml-4 border-l-2 border-dashed h-4" />
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">3</div>
                    <div className="flex-1">
                      <div className="font-medium">Menú por Rol</div>
                      <div className="text-sm text-muted-foreground">6 roles disponibles</div>
                    </div>
                  </div>
                  <div className="ml-4 border-l-2 border-dashed h-4" />
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">4</div>
                    <div className="flex-1">
                      <div className="font-medium">Sidebar por Equipo</div>
                      <div className="text-sm text-muted-foreground">Máxima prioridad</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Control de Acceso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Integración con AccessControl</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Validación server-side</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Ocultación automática de items</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Logs de acceso denegado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Warnings de permisos</span>
                </div>
                <Separator className="my-3" />
                <Alert>
                  <AlertDescription className="text-xs">
                    Reutiliza el sistema ComplexAccessControl existente para validación granular
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Interfaz de Usuario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Componentes reutilizados:</div>
                  <div className="pl-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <CodeBracketIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">GroupsManagement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CodeBracketIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">TagsManagement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CodeBracketIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">HierarchyTree</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CodeBracketIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">ComplexRuleBuilder</span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">UI consistente con Meet</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Características Adicionales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Multi-idioma (ES/EN)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Preview antes de publicar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Sistema draft/published</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Iconos Lucide React</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Cache de menús</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Architecture Tab */}
        <TabsContent value="architecture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Arquitectura Técnica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="models">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <ServerStackIcon className="h-4 w-4" />
                      Modelos de Datos (Prisma)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <div className="font-mono text-sm">
                        <div className="font-bold text-purple-600">MenuConfiguration</div>
                        <ul className="ml-4 mt-2 space-y-1">
                          <li>• type: HEADER | FOOTER | SIDEBAR</li>
                          <li>• scope: PUBLIC | PRIVATE | ROLE | TEAM</li>
                          <li>• inheritsFrom: Herencia configurable</li>
                          <li>• items: MenuItem[]</li>
                          <li>• accessControl: Integración permisos</li>
                        </ul>
                      </div>
                      <div className="font-mono text-sm">
                        <div className="font-bold text-blue-600">MenuItem</div>
                        <ul className="ml-4 mt-2 space-y-1">
                          <li>• label: Multi-idioma JSON</li>
                          <li>• href: Ruta del enlace</li>
                          <li>• icon: Lucide icon name</li>
                          <li>• children: Jerarquía</li>
                          <li>• requiredRoles: Permisos</li>
                        </ul>
                      </div>
                      <div className="font-mono text-sm">
                        <div className="font-bold text-green-600">TeamSidebar</div>
                        <ul className="ml-4 mt-2 space-y-1">
                          <li>• teamKey: ID del equipo</li>
                          <li>• availableRoutes: Módulos</li>
                          <li>• priority: Orden de prioridad</li>
                          <li>• userIds: Usuarios asignados</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="api">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <CommandLineIcon className="h-4 w-4" />
                      API Routes
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 p-4 bg-gray-50 rounded-lg font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">GET</Badge>
                        <span>/api/admin/menu/[type]</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">POST</Badge>
                        <span>/api/admin/menu/[type]</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">PUT</Badge>
                        <span>/api/admin/menu/[type]/[id]</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">DELETE</Badge>
                        <span>/api/admin/menu/[type]/[id]</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">POST</Badge>
                        <span>/api/admin/menu/publish</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">GET</Badge>
                        <span>/api/admin/menu/preview</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="integration">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <CpuChipIcon className="h-4 w-4" />
                      Integraciones
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Sistemas Existentes</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            dashboard-routes.ts
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            AccessControl
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            NextAuth roles
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            i18n system
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Componentes UI</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            shadcn/ui
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            Radix UI
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            Lucide icons
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            HeroIcons
                          </li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RocketLaunchIcon className="h-5 w-5" />
                Plan de Desarrollo
              </CardTitle>
              <CardDescription>
                5 sprints de 1 semana cada uno - Total: 5 semanas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {developmentPhases.map((phase, index) => (
                <div key={phase.phase} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                        phase.status === "completed" ? "bg-green-500 text-white" :
                        phase.status === "in-progress" ? "bg-blue-500 text-white" :
                        "bg-gray-200 text-gray-600"
                      }`}>
                        {phase.phase}
                      </div>
                      <div>
                        <div className="font-medium">{phase.name}</div>
                        <div className="text-sm text-muted-foreground">{phase.duration}</div>
                      </div>
                    </div>
                    <Badge variant={
                      phase.status === "completed" ? "default" :
                      phase.status === "in-progress" ? "secondary" :
                      "outline"
                    }>
                      {phase.status === "completed" ? "Completado" :
                       phase.status === "in-progress" ? "En Progreso" :
                       "Pendiente"}
                    </Badge>
                  </div>
                  
                  {/* Progress bar */}
                  <Progress value={phase.progress} className="h-2" />
                  
                  {/* Phase details */}
                  <div className="ml-13 pl-4 border-l-2 border-gray-200">
                    {phase.phase === 1 && (
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Setup de esquema Prisma</li>
                        <li>• Página base de gestión</li>
                        <li>• API Routes CRUD</li>
                      </ul>
                    )}
                    {phase.phase === 2 && (
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Footer Management Component</li>
                        <li>• Footer Item Builder</li>
                        <li>• Footer Preview</li>
                      </ul>
                    )}
                    {phase.phase === 3 && (
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Header Management Component</li>
                        <li>• Header Navigation Builder</li>
                        <li>• Mega-menús y dropdowns</li>
                      </ul>
                    )}
                    {phase.phase === 4 && (
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Team Sidebar Manager</li>
                        <li>• Module Permission Checker</li>
                        <li>• Sidebar Priority System</li>
                      </ul>
                    )}
                    {phase.phase === 5 && (
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Menu Inheritance System</li>
                        <li>• Access Control Integration</li>
                        <li>• Publishing System</li>
                        <li>• Testing y Documentación</li>
                      </ul>
                    )}
                  </div>
                  
                  {index < developmentPhases.length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* KPIs Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5" />
                Métricas de Éxito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">KPIs Técnicos</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Target className="h-3 w-3" />
                      Carga de menú {"<"} 100ms
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="h-3 w-3" />
                      Cache hit rate {">"} 90%
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="h-3 w-3" />
                      Error rate {"<"} 0.1%
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">KPIs de Negocio</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Target className="h-3 w-3" />
                      Tiempo config -50%
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="h-3 w-3" />
                      Tickets soporte -30%
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="h-3 w-3" />
                      Adopción 100% en 30 días
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Beneficios</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Zap className="h-3 w-3" />
                      Gestión centralizada
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-3 w-3" />
                      Permisos granulares
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-3 w-3" />
                      Herencia inteligente
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer CTA */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">¿Listo para comenzar el desarrollo?</h3>
              <p className="text-sm text-muted-foreground">
                Este sistema reutilizará componentes existentes de Meet y AccessControl
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Ver PRD
              </Button>
              <Button>
                <RocketLaunchIcon className="h-4 w-4 mr-2" />
                Iniciar Sprint 1
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}