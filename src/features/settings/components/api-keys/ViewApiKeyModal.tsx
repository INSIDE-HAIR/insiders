"use client";

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/src/components/shared/ui/responsive-modal";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { 
  Key, 
  Eye, 
  Copy, 
  Clock,
  Activity,
  Shield,
  Calendar,
  User,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { ApiKey, ApiKeyStatus } from "../../types";
import { useToast } from "@/src/hooks/use-toast";
import { cn } from "@/src/lib/utils";

interface ViewApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: ApiKey | null;
}

export function ViewApiKeyModal({
  open,
  onOpenChange,
  apiKey
}: ViewApiKeyModalProps) {
  const { toast } = useToast();

  const getStatusColor = (status: keyof typeof ApiKeyStatus) => {
    switch (status) {
      case 'ACTIVE':
        return "bg-green-100 text-green-800 border-green-200";
      case 'INACTIVE':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'REVOKED':
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado",
        description: `${label} copiado al portapapeles`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!apiKey) return null;

  const isExpired = apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date();

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-2xl">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Detalles de API Key</span>
          </ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Información completa de la API Key "{apiKey.name}".
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="space-y-6">
          {/* Header con estado */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Key className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold truncate">
                  {apiKey.name}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {apiKey.description || "Sin descripción"}
                </p>
              </div>
            </div>
            
            <Badge 
              variant="outline" 
              className={getStatusColor(apiKey.status)}
            >
              {apiKey.status.toLowerCase()}
            </Badge>
          </div>

          {/* Key Prefix */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Key className="h-4 w-4 mr-2" />
                Clave API (prefijo)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <code className="text-sm font-mono">{apiKey.keyPrefix}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(apiKey.keyPrefix, "Prefijo de la clave")}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Por seguridad, solo se muestra el prefijo de la clave. La clave completa solo se mostró al crearla.
              </p>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Total Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apiKey.totalRequests?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">Solicitudes realizadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Creada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">{formatDate(apiKey.createdAt)}</div>
                <p className="text-xs text-muted-foreground">Fecha de creación</p>
              </CardContent>
            </Card>
          </div>

          {/* Detalles adicionales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {apiKey.expiresAt && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Expira:</span>
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    isExpired && "text-destructive"
                  )}>
                    {formatDate(apiKey.expiresAt)}
                  </span>
                </div>
              )}

              {apiKey.lastUsedAt && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Último uso:</span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatDate(apiKey.lastUsedAt)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Última modificación:</span>
                </div>
                <span className="text-sm font-medium">
                  {formatDate(apiKey.updatedAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">ID de clave:</span>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {apiKey.id}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(apiKey.id, "ID de la clave")}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warnings */}
          {isExpired && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Esta clave ha expirado</span>
                </div>
                <p className="text-sm text-destructive/80 mt-1">
                  La clave no funcionará hasta que actualices la fecha de expiración o la elimines.
                </p>
              </CardContent>
            </Card>
          )}

          {apiKey.status === 'REVOKED' && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-destructive">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Esta clave está revocada</span>
                </div>
                <p className="text-sm text-destructive/80 mt-1">
                  La clave no funcionará. Puedes reactivarla o eliminarla permanentemente.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <ResponsiveModalFooter>
          <Button onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}