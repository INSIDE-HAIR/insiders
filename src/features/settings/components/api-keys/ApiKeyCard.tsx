"use client";

import { useState } from "react";
import { ApiKey, ApiKeyStatus } from "../../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import {
  Key,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Copy,
  Clock,
  Globe,
  Activity,
  Shield,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useToast } from "@/src/hooks/use-toast";

import { EyeOff } from "lucide-react";

interface ApiKeyCardProps {
  apiKey: ApiKey;
  onEdit: (apiKey: ApiKey) => void;
  onView: (apiKey: ApiKey) => void;
  onRevoke: (apiKey: ApiKey) => void;
  onReactivate: (apiKey: ApiKey) => void;
  onDelete: (apiKey: ApiKey) => void;
  className?: string;
}

export function ApiKeyCard({
  apiKey,
  onEdit,
  onView,
  onRevoke,
  onReactivate,
  onDelete,
  className,
}: ApiKeyCardProps) {
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: keyof typeof ApiKeyStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "INACTIVE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "REVOKED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Simplified - just use Key icon for all API keys
  const getKeyIcon = () => {
    return <Key className='h-4 w-4' />;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado",
        description: "API Key copiada al portapapeles",
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
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date();

  return (
    <>
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardHeader className='pb-3'>
          <div className='flex items-start justify-between'>
            <div className='flex items-start space-x-3'>
              <div className='p-2 bg-primary/10 rounded-lg'>{getKeyIcon()}</div>
              <div className='flex-1 min-w-0'>
                <CardTitle className='text-lg font-semibold truncate'>
                  {apiKey.name}
                </CardTitle>
                <CardDescription className='mt-1'>
                  {apiKey.description || "Sin descripción"}
                </CardDescription>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Badge
                variant='outline'
                className={getStatusColor(apiKey.status)}
              >
                {apiKey.status.toLowerCase()}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  <DropdownMenuItem
                    onClick={() => onView(apiKey)}
                    className='text-foreground focus:text-foreground focus:bg-foreground/20'
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    Ver Detalles
                  </DropdownMenuItem>

                  {apiKey.status !== "REVOKED" && (
                    <>
                      <DropdownMenuItem
                        onClick={() => onEdit(apiKey)}
                        className='text-foreground focus:text-foreground focus:bg-foreground/20'
                      >
                        <Edit className='mr-2 h-4 w-4' />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setShowRevokeDialog(true)}
                        className='text-warning focus:text-warning focus:bg-warning/20'
                      >
                        <Shield className='mr-2 h-4 w-4' />
                        Revocar
                      </DropdownMenuItem>
                    </>
                  )}

                  {apiKey.status === "REVOKED" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setShowReactivateDialog(true)}
                        className='text-success focus:text-success focus:bg-success/20'
                      >
                        <RefreshCw className='mr-2 h-4 w-4' />
                        Reactivar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className='text-destructive focus:text-destructive focus:bg-destructive/20'
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        Eliminar Permanentemente
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* Key */}
          <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
            <div className='flex items-center space-x-2'>
              <Key className='h-4 w-4 text-muted-foreground' />
              <code className='text-sm font-mono'>
                {keyVisible ? apiKey.key : "•".repeat(apiKey.key?.length || 0)}
              </code>
            </div>
            <div className='flex items-center space-x-1'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setKeyVisible(!keyVisible)}
                className='h-8 w-8 p-0'
              >
                {keyVisible ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => copyToClipboard(apiKey.key || "")}
                className='h-8 w-8 p-0'
              >
                <Copy className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Stats - Simplified */}
          <div className='grid grid-cols-2 gap-3 text-center'>
            <div className='space-y-1'>
              <div className='text-sm text-muted-foreground'>
                Total Requests
              </div>
              <div className='text-lg font-semibold'>
                {apiKey.totalRequests?.toLocaleString() || 0}
              </div>
            </div>
            <div className='space-y-1'>
              <div className='text-sm text-muted-foreground'>Creada</div>
              <div className='text-sm font-medium'>
                {formatDate(apiKey.createdAt)}
              </div>
            </div>
          </div>

          {/* Details - Simplified */}
          <div className='space-y-2 text-sm'>
            {apiKey.expiresAt && (
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Expira:</span>
                <div className='flex items-center space-x-1'>
                  <Clock className='h-3 w-3' />
                  <span
                    className={cn("text-xs", isExpired && "text-destructive")}
                  >
                    {formatDate(apiKey.expiresAt)}
                  </span>
                </div>
              </div>
            )}

            {apiKey.lastUsedAt && (
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Último uso:</span>
                <span className='text-xs'>{formatDate(apiKey.lastUsedAt)}</span>
              </div>
            )}
          </div>

          {/* Warnings */}
          {isExpired && (
            <div className='flex items-center space-x-2 p-2 bg-destructive/5 border border-destructive rounded'>
              <Clock className='h-4 w-4 text-destructive' />
              <span className='text-sm text-destructive'>
                Esta clave ha expirado
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revoke Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Revocar API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción revocará la API Key &quot;
              <strong>{apiKey.name}</strong>&quot;. Las aplicaciones que usen
              esta clave dejarán de funcionar inmediatamente. Podrás eliminarla
              permanentemente después de revocarla.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onRevoke(apiKey);
                setShowRevokeDialog(false);
              }}
              className='bg-yellow-600 hover:bg-yellow-700'
            >
              Revocar Clave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar API Key Permanentemente?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la API Key &quot;
              <strong>{apiKey.name}</strong>&quot; de la base de datos. Esta
              acción <strong>no se puede deshacer</strong> y todos los registros
              históricos se perderán. Solo se pueden eliminar claves que hayan
              sido revocadas previamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(apiKey);
                setShowDeleteDialog(false);
              }}
              className='bg-destructive hover:bg-destructive/90'
            >
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Dialog */}
      <AlertDialog
        open={showReactivateDialog}
        onOpenChange={setShowReactivateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Reactivar API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción reactivará la API Key &quot;
              <strong>{apiKey.name}</strong>&quot; cambiando su estado de
              REVOKED a ACTIVE. La clave volverá a funcionar inmediatamente con
              el mismo valor que tenía antes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onReactivate(apiKey);
                setShowReactivateDialog(false);
              }}
              className='bg-green-600 hover:bg-green-700'
            >
              Reactivar Clave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
