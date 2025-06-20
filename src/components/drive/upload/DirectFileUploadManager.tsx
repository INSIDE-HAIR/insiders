"use client";

import React, { useState } from "react";
import { TrueDirectUploadZone } from "./TrueDirectUploadZone";
import { EnhancedDropZone } from "./EnhancedDropZone";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Shield,
  AlertTriangle,
  Server,
} from "lucide-react";
import { useSession } from "next-auth/react";
import type { UploadFileItem } from "./EnhancedDropZone";

interface DirectFileUploadManagerProps {
  folderId: string;
  folderName: string;
  className?: string;
  disabled?: boolean;
  onUploadComplete?: (files: UploadFileItem[]) => void;
}

export function DirectFileUploadManager({
  folderId,
  folderName,
  className,
  disabled = false,
  onUploadComplete,
}: DirectFileUploadManagerProps) {
  const { data: session, status } = useSession();
  const [useDirectUpload, setUseDirectUpload] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Check if user can use direct upload
  const canUseDirectUpload = () => {
    if (status === "loading") return false;
    if (!session?.user) return false;
    return session.user.role === "ADMIN";
  };

  // Test direct upload capability
  const testDirectUpload = async (): Promise<boolean> => {
    if (!canUseDirectUpload()) {
      setConnectionError(
        "Se requiere acceso de administrador para uploads directos"
      );
      return false;
    }

    try {
      const response = await fetch("/api/drive/auth/token");
      if (response.ok) {
        setConnectionError(null);
        return true;
      } else {
        const error = await response.json();
        setConnectionError(error.error || "Token service unavailable");
        return false;
      }
    } catch (error) {
      setConnectionError("Network error - cannot reach token service");
      return false;
    }
  };

  // Handle upload mode switch
  const handleModeSwitch = async () => {
    if (!useDirectUpload) {
      // Switching to direct upload - test capability first
      const canUseDirectUpload = await testDirectUpload();
      if (canUseDirectUpload) {
        setUseDirectUpload(true);
      }
    } else {
      // Switching to server upload
      setUseDirectUpload(false);
      setConnectionError(null);
    }
  };

  // Auto-fallback on direct upload failure
  const handleDirectUploadError = async () => {
    console.warn("Direct upload failed, falling back to server upload");
    setUseDirectUpload(false);
    setConnectionError("Direct upload failed - using server fallback");
  };

  React.useEffect(() => {
    // Test direct upload capability on mount
    if (canUseDirectUpload()) {
      testDirectUpload().then((canUse) => {
        if (!canUse) {
          setUseDirectUpload(false);
        }
      });
    } else {
      setUseDirectUpload(false);
    }
  }, [session, status]);

  // Show auth warning if needed
  if (status === "loading") {
    return (
      <div className={className}>
        <Alert>
          <RefreshCw className='h-4 w-4 animate-spin' />
          <AlertDescription>Verificando permisos...</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className={className}>
        <Alert variant='destructive'>
          <Shield className='h-4 w-4' />
          <AlertDescription>
            <strong>Autenticación Requerida:</strong> Necesitas estar
            autenticado para subir archivos.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Auth/Permission Info */}
      {session.user.role !== "ADMIN" && (
        <Alert variant='destructive' className='mb-4'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>
            <strong>Solo Servidor Disponible:</strong> Los uploads directos
            requieren permisos de administrador. Usando modo servidor (límite
            4.5MB).
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Mode Info */}
      <div className='mb-4 flex items-center justify-between'>
        <Alert className='flex-1 mr-4'>
          {useDirectUpload && canUseDirectUpload() ? (
            <>
              <Wifi className='h-4 w-4' />
              <AlertDescription>
                <strong>Modo Directo:</strong> Archivos se suben directamente a
                Google Drive via proxy, sin límites de tamaño (recomendado para
                archivos grandes).
              </AlertDescription>
            </>
          ) : (
            <>
              <WifiOff className='h-4 w-4' />
              <AlertDescription>
                <strong>Modo Servidor:</strong> Archivos pasan por el servidor
                (límite 4.5MB por Vercel).
                {connectionError && (
                  <span className='text-red-600 block mt-1'>
                    Razón: {connectionError}
                  </span>
                )}
              </AlertDescription>
            </>
          )}
        </Alert>

        <Button
          onClick={handleModeSwitch}
          variant='outline'
          size='sm'
          disabled={disabled || !canUseDirectUpload()}
        >
          <RefreshCw className='w-4 h-4 mr-2' />
          {useDirectUpload && canUseDirectUpload()
            ? "Usar Servidor"
            : "Usar Directo"}
        </Button>
      </div>

      {/* Upload Component */}
      {useDirectUpload && canUseDirectUpload() ? (
        <TrueDirectUploadZone
          folderId={folderId}
          folderName={folderName}
          disabled={disabled}
          onUploadComplete={onUploadComplete}
        />
      ) : (
        <EnhancedDropZone
          folderId={folderId}
          folderName={folderName}
          disabled={disabled}
          onUploadComplete={onUploadComplete}
        />
      )}

      {/* Help Information */}
      <div className='mt-4 text-xs text-gray-500'>
        <p>
          💡 <strong>Tip:</strong> Para archivos mayores a 4.5MB, usa el modo
          directo. El modo servidor es útil para archivos pequeños y cuando hay
          problemas de conectividad.
        </p>
      </div>
    </div>
  );
}
