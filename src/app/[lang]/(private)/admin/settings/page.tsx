"use client";

import { useState } from "react";
import SettingsClientPage from "./client-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { 
  Settings, 
  Key, 
  Shield, 
  Database, 
  Bell, 
  Palette, 
  Globe, 
  Users,
  Activity,
  ChevronRight,
  Lock,
  Zap,
  Code
} from "lucide-react";
import Link from "next/link";
import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";

interface SettingCard {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  category: 'security' | 'integration' | 'system' | 'appearance';
  adminOnly?: boolean;
  comingSoon?: boolean;
  featured?: boolean;
}

const settingsCards: SettingCard[] = [
  {
    title: "API Keys",
    description: "Gestiona las claves de acceso programático a tu API",
    icon: Key,
    href: "/admin/settings/api-keys",
    category: "integration",
    featured: true
  },
  {
    title: "Control de Acceso",
    description: "Configura permisos y roles de usuario",
    icon: Shield,
    href: "/admin/access-control",
    category: "security",
    adminOnly: true
  },
  {
    title: "Webhooks",
    description: "Configura notificaciones automáticas a servicios externos",
    icon: Zap,
    href: "/admin/settings/webhooks",
    category: "integration",
    comingSoon: true
  },
  {
    title: "Configuración General",
    description: "Ajustes generales del sistema y aplicación",
    icon: Settings,
    href: "/admin/settings/general",
    category: "system",
    comingSoon: true
  },
  {
    title: "Base de Datos",
    description: "Administra conexiones y configuración de la base de datos",
    icon: Database,
    href: "/admin/settings/database",
    category: "system",
    adminOnly: true,
    comingSoon: true
  },
  {
    title: "Notificaciones",
    description: "Configura alertas y notificaciones del sistema",
    icon: Bell,
    href: "/admin/settings/notifications",
    category: "system",
    comingSoon: true
  },
  {
    title: "Personalización",
    description: "Personaliza la apariencia y branding",
    icon: Palette,
    href: "/admin/settings/appearance",
    category: "appearance",
    comingSoon: true
  },
  {
    title: "Localización",
    description: "Configuración de idiomas y regiones",
    icon: Globe,
    href: "/admin/settings/localization",
    category: "system",
    comingSoon: true
  },
  {
    title: "Gestión de Usuarios",
    description: "Configuración avanzada de usuarios y equipos",
    icon: Users,
    href: "/admin/users",
    category: "security"
  },
  {
    title: "Logs del Sistema",
    description: "Visualiza y administra los logs de actividad",
    icon: Activity,
    href: "/admin/settings/logs",
    category: "system",
    adminOnly: true,
    comingSoon: true
  },
  {
    title: "Integraciones",
    description: "Configura conexiones con servicios externos",
    icon: Code,
    href: "/admin/settings/integrations",
    category: "integration",
    comingSoon: true
  }
];

const categoryInfo = {
  security: {
    name: "Seguridad",
    description: "Configuración de seguridad y acceso",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  integration: {
    name: "Integraciones",
    description: "APIs y conexiones externas",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  system: {
    name: "Sistema",
    description: "Configuración del sistema",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  appearance: {
    name: "Apariencia",
    description: "Personalización visual",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  }
};

function SettingsPageContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCards = selectedCategory 
    ? settingsCards.filter(card => card.category === selectedCategory)
    : settingsCards;

  const featuredCards = settingsCards.filter(card => card.featured);
  const categorizedCards = Object.keys(categoryInfo).map(category => ({
    category,
    ...categoryInfo[category as keyof typeof categoryInfo],
    cards: settingsCards.filter(card => card.category === category)
  }));

  const renderSettingCard = (card: SettingCard, featured = false) => {
    const IconComponent = card.icon;
    const categoryColors = categoryInfo[card.category];

    return (
      <Card 
        key={card.title}
        className={`group hover:shadow-md transition-all duration-200 ${
          card.comingSoon ? 'opacity-60' : 'hover:scale-[1.02] cursor-pointer'
        } ${featured ? 'border-primary' : ''}`}
      >
        {card.comingSoon ? (
          <div className="p-6">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${categoryColors.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${categoryColors.color}`} />
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant="secondary" className="text-xs">
                    Próximamente
                  </Badge>
                  {card.adminOnly && (
                    <Badge variant="outline" className="text-xs flex items-center space-x-1">
                      <Lock className="h-3 w-3" />
                      <span>Admin</span>
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="text-lg font-semibold text-muted-foreground">
                {card.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {card.description}
              </CardDescription>
            </CardHeader>
          </div>
        ) : (
          <Link href={card.href}>
            <div className="p-6">
              <CardHeader className="p-0 pb-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${categoryColors.bgColor} group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`h-6 w-6 ${categoryColors.color}`} />
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {featured && (
                      <Badge variant="default" className="text-xs">
                        Destacado
                      </Badge>
                    )}
                    {card.adminOnly && (
                      <Badge variant="outline" className="text-xs flex items-center space-x-1">
                        <Lock className="h-3 w-3" />
                        <span>Admin</span>
                      </Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {card.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {card.description}
                </CardDescription>
              </CardHeader>
            </div>
          </Link>
        )}
      </Card>
    );
  };

  return (
    <div>
      <DocHeader
        title="Configuración"
        description="Administra la configuración del sistema, integraciones y seguridad de manera centralizada"
        icon={Settings}
      />
      
      <DocContent>
          <div className="container mx-auto p-6 space-y-8">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Todas las configuraciones
              </Button>
              {Object.entries(categoryInfo).map(([key, info]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className="flex items-center space-x-2"
                >
                  <span>{info.name}</span>
                  <Badge variant="secondary" className="ml-1">
                    {settingsCards.filter(card => card.category === key).length}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Featured Cards */}
            {!selectedCategory && featuredCards.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Configuración Destacada</h2>
                  <p className="text-sm text-muted-foreground">
                    Configuraciones más importantes y utilizadas
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredCards.map(card => renderSettingCard(card, true))}
                </div>
              </div>
            )}

            {/* All Settings by Category */}
            {selectedCategory ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {categoryInfo[selectedCategory as keyof typeof categoryInfo].name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {categoryInfo[selectedCategory as keyof typeof categoryInfo].description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCards.map(card => renderSettingCard(card))}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {categorizedCards.map(({ category, name, description, cards }) => (
                  <div key={category} className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{name}</h2>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cards.map(card => renderSettingCard(card))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Resumen de Configuración</CardTitle>
                <CardDescription>
                  Estado actual de las configuraciones del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {settingsCards.filter(c => !c.comingSoon).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Disponibles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {settingsCards.filter(c => c.comingSoon).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Próximamente</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {settingsCards.filter(c => c.adminOnly).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Solo Admin</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {Object.keys(categoryInfo).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Categorías</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="border-primarys bg-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-primary">
                  <Activity className="h-5 w-5" />
                  <span>¿Necesitas ayuda?</span>
                </CardTitle>
                <CardDescription className="text-primary">
                  Si tienes dudas sobre alguna configuración, consulta la documentación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/admin/access-control/docs">
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Code className="h-4 w-4" />
                      <span>Documentación</span>
                    </Button>
                  </Link>
                  <Button variant="outline" disabled className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <span>Soporte (Próximamente)</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DocContent>
      </div>
    );
}

export default function SettingsPage() {
  return (
    <SettingsClientPage>
      <SettingsPageContent />
    </SettingsClientPage>
  );
}