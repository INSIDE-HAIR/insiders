"use client";

import React, { useState, useEffect } from "react";
import { TrueDirectUploadZone } from "./TrueDirectUploadZone";
import { EnhancedDropZone } from "./EnhancedDropZone";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import { RefreshCw, Shield, ExternalLink } from "lucide-react";
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
  const [useDirectUpload, setUseDirectUpload] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Function to open Google Drive folder
  const openInDrive = () => {
    const driveUrl = `https://drive.google.com/drive/folders/${folderId}`;
    window.open(driveUrl, "_blank", "noopener,noreferrer");
  };

  // Determine upload mode based on environment and user permissions
  const shouldUseDirectUpload = () => {
    // Check if we're in development mode using NODE_ENV
    const isDevelopment = process.env.NODE_ENV === "development";
    const isAdmin = session?.user?.role === "ADMIN";

    if (isDevelopment && isAdmin) {
      return true; // Development + Admin = Direct upload
    }

    return false; // Production or non-admin = Server upload
  };

  // Test direct upload capability (only in development)
  const testDirectUpload = async (): Promise<boolean> => {
    if (process.env.NODE_ENV !== "development") return false;
    if (session?.user?.role !== "ADMIN") return false;

    try {
      const response = await fetch("/api/drive/auth/token");
      if (response.ok) {
        setConnectionError(null);
        return true;
      } else {
        setConnectionError("Token service unavailable");
        return false;
      }
    } catch (error) {
      setConnectionError("Network error");
      return false;
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session) {
      const shouldUseDirect = shouldUseDirectUpload();

      if (shouldUseDirect) {
        testDirectUpload().then((canUse) => {
          setUseDirectUpload(canUse);
        });
      } else {
        setUseDirectUpload(false);
      }
    }
  }, [session, status]);

  // Loading state
  if (status === "loading") {
    return (
      <div className={className}>
        <div className='p-4 text-center text-zinc-500'>
          <RefreshCw className='w-5 h-5 animate-spin mx-auto mb-2' />
          Cargando...
        </div>
      </div>
    );
  }

  // No authentication
  if (!session?.user) {
    return (
      <div className={className}>
        <Alert variant='destructive'>
          <Shield className='h-4 w-4' />
          <AlertDescription>
            Necesitas estar autenticado para subir archivos.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Show error if any */}
      {connectionError && (
        <Alert variant='destructive' className='mb-4'>
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}

      {/* Drive Button */}
      <div className='flex justify-end mb-3'>
        <Button
          onClick={openInDrive}
          variant='outline'
          size='sm'
          className='text-zinc-700 border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400 transition-colors'
        >
          <ExternalLink className='w-4 h-4 mr-2' />
          Abrir en Drive
        </Button>
      </div>

      {/* Upload Component */}
      {useDirectUpload ? (
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
    </div>
  );
}
