"use client";

import React from "react";
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
import { useRouter } from "next/navigation";
import {
  CommandLineIcon,
  CogIcon,
  UsersIcon,
  TagIcon,
  MapIcon,
  ArrowRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  Users,
  Tag,
  Map,
  Navigation,
  ArrowRight,
  Settings,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";

interface OperationsHubMainProps {
  lang: string;
}

const operationsModules = [
  {
    id: "groups",
    title: "Grupos",
    titleEn: "Groups",
    description: "Gestión de grupos jerárquicos para organización de usuarios y contenido",
    descriptionEn: "Hierarchical group management for user and content organization",
    href: "/admin/operations-hub/groups",
    icon: Users,
    heroIcon: UsersIcon,
    color: "bg-blue-500",
    borderColor: "border-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    features: [
      "Jerarquía ilimitada",
      "Auto-assignment de tags",
      "Descripción interna/pública",
      "Organización por equipos",
    ],
    stats: {
      label: "Grupos activos",
      value: "12",
    },
    badge: "Sistema Meet",
    badgeColor: "bg-purple-100 text-purple-800",
  },
  {
    id: "tags",
    title: "Tags",
    titleEn: "Tags",
    description: "Sistema de etiquetas jerárquico para clasificación y filtrado rápido",
    descriptionEn: "Hierarchical tag system for classification and quick filtering",
    href: "/admin/operations-hub/tags",
    icon: Tag,
    heroIcon: TagIcon,
    color: "bg-green-500",
    borderColor: "border-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    features: [
      "Clasificación por colores",
      "Path completo para navegación",
      "Iconos personalizables",
      "Multi-nivel ilimitado",
    ],
    stats: {
      label: "Tags disponibles",
      value: "45",
    },
    badge: "Sistema Meet",
    badgeColor: "bg-purple-100 text-purple-800",
  },
  {
    id: "sitemap",
    title: "Sitemap",
    titleEn: "Sitemap",
    description: "Gestión de múltiples sitemaps para SEO optimizado (Blog, Web, Custom)",
    descriptionEn: "Multiple sitemap management for optimized SEO (Blog, Web, Custom)",
    href: "/admin/operations-hub/sitemap",
    icon: Map,
    heroIcon: MapIcon,
    color: "bg-orange-500",
    borderColor: "border-orange-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    features: [
      "Sitemaps múltiples",
      "SEO optimizado",
      "Indexación específica",
      "Gestión jerárquica",
    ],
    stats: {
      label: "Páginas indexadas",
      value: "127",
    },
    badge: "SEO Ready",
    badgeColor: "bg-orange-100 text-orange-800",
  },
  {
    id: "navigation",
    title: "Navegación",
    titleEn: "Navigation",
    description: "Sistema de menús dinámicos (Headers, Footers, Sidebars) por rol y equipo",
    descriptionEn: "Dynamic menu system (Headers, Footers, Sidebars) by role and team",
    href: "/admin/operations-hub/navigation",
    icon: Navigation,
    heroIcon: ArrowRightIcon,
    color: "bg-purple-500",
    borderColor: "border-purple-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    features: [
      "Herencia configurable",
      "Multi-idioma (ES/EN)",
      "Control de acceso",
      "Preview en tiempo real",
    ],
    stats: {
      label: "Menús configurados",
      value: "8",
    },
    badge: "En Construcción",
    badgeColor: "bg-yellow-100 text-yellow-800",
  },
];

const benefits = [
  {
    icon: Target,
    title: "Gestión Centralizada",
    description: "Todos los elementos de organización en un solo lugar",
  },
  {
    icon: Zap,
    title: "Reutilización Inteligente",
    description: "Componentes coherentes entre diferentes módulos",
  },
  {
    icon: TrendingUp,
    title: "Escalabilidad",
    description: "Sistemas preparados para crecer con tu organización",
  },
];

export function OperationsHubMain({ lang }: OperationsHubMainProps) {
  const router = useRouter();
  const isSpanish = lang === "es";

  const handleNavigate = (href: string) => {
    router.push(`/${lang}${href}`);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <CommandLineIcon className="h-12 w-12" />
            <div>
              <h1 className="text-4xl font-bold">
                {isSpanish ? "Centro de Operaciones" : "Operations Hub"}
              </h1>
              <p className="text-xl opacity-90 mt-2">
                {isSpanish 
                  ? "Gestión centralizada de la estructura organizacional"
                  : "Centralized organizational structure management"
                }
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5" />
              <span>{isSpanish ? "Control de acceso integrado" : "Integrated access control"}</span>
            </div>
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5" />
              <span>{isSpanish ? "Componentes reutilizables" : "Reusable components"}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              <span>{isSpanish ? "Gestión en tiempo real" : "Real-time management"}</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-10">
          <CogIcon className="h-64 w-64" />
        </div>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-500 bg-blue-50">
        <ChartBarIcon className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>{isSpanish ? "Centro unificado:" : "Unified hub:"}</strong>{" "}
          {isSpanish 
            ? "Aquí encontrarás todos los sistemas de organización que antes estaban distribuidos en diferentes secciones. Grupos y Tags han sido movidos desde Meet para crear una gestión más coherente."
            : "Here you'll find all organizational systems that were previously distributed across different sections. Groups and Tags have been moved from Meet to create more coherent management."
          }
        </AlertDescription>
      </Alert>

      {/* Operations Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {operationsModules.map((module) => (
          <Card 
            key={module.id} 
            className={`group relative overflow-hidden border-2 hover:${module.borderColor} transition-all duration-200 cursor-pointer hover:shadow-lg`}
            onClick={() => handleNavigate(module.href)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${module.color} text-white`}>
                    <module.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {isSpanish ? module.title : module.titleEn}
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {isSpanish ? module.description : module.descriptionEn}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={module.badgeColor}>
                  {module.badge}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Features List */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    {isSpanish ? "Características principales:" : "Key features:"}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {module.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className={`p-3 rounded-lg ${module.bgColor} ${module.textColor} flex items-center justify-between`}>
                  <span className="text-sm font-medium">{module.stats.label}</span>
                  <span className="text-2xl font-bold">{module.stats.value}</span>
                </div>

                {/* Action Button */}
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate(module.href);
                  }}
                >
                  {isSpanish ? "Gestionar" : "Manage"}
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" />
            {isSpanish ? "Beneficios del Centro de Operaciones" : "Operations Hub Benefits"}
          </CardTitle>
          <CardDescription>
            {isSpanish 
              ? "¿Por qué centralizar la gestión organizacional?"
              : "Why centralize organizational management?"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-4">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-4">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">
              {isSpanish ? "Grupos Activos" : "Active Groups"}
            </p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Tag className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">45</div>
            <p className="text-sm text-muted-foreground">
              {isSpanish ? "Tags Disponibles" : "Available Tags"}
            </p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Map className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">127</div>
            <p className="text-sm text-muted-foreground">
              {isSpanish ? "Páginas Indexadas" : "Indexed Pages"}
            </p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Navigation className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">8</div>
            <p className="text-sm text-muted-foreground">
              {isSpanish ? "Menús Configurados" : "Configured Menus"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}