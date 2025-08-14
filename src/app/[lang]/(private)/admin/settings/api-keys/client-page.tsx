"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Shield, AlertTriangle, Key } from "lucide-react";

interface ClientPageProps {
  children: React.ReactNode;
}

export default function ApiKeysClientPage({ children }: ClientPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    // Verificar que el usuario tenga rol ADMIN
    if (session.user?.role !== "ADMIN") {
      router.push("/admin");
      return;
    }
  }, [session, status, router]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-3 gap-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="max-w-md mx-auto border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-orange-800">
            <strong>Acceso Requerido:</strong> Necesitas iniciar sesión para gestionar las API Keys.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Insufficient permissions
  if (session.user?.role !== "ADMIN") {
    return (
      <div className="container mx-auto p-6">
        <Alert className="max-w-2xl mx-auto border-red-200 bg-red-50">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            <strong>Acceso Denegado:</strong> No tienes permisos para gestionar API Keys. 
            Esta funcionalidad requiere permisos de administrador ya que las API Keys 
            proporcionan acceso programático a todo el sistema.
            <div className="mt-3 p-3 bg-red-100 rounded-lg">
              <div className="text-sm">
                <div className="flex items-center space-x-2 mb-1">
                  <Key className="h-3 w-3" />
                  <span className="font-semibold">Información de acceso:</span>
                </div>
                <div>Tu rol: <span className="font-semibold">{session.user?.role || 'Sin definir'}</span></div>
                <div>Roles requeridos: <span className="font-semibold">ADMIN</span></div>
                <div className="mt-2 text-xs">
                  Las API Keys permiten acceso completo a la API, por lo que están restringidas 
                  a administradores para mantener la seguridad del sistema.
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Authorized - render the page content
  return (
    <>
      {/* Debug info in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="container mx-auto px-6 pt-2">
          <Alert className="mb-4 border-primarys bg-primary/10 text-primary">
            <Key className="h-6 w-6 p-1 stroke-primary bg-primary/20 " />
            <AlertDescription className="text-primary ml-2">
              <strong>API Keys Access:</strong> Usuario autorizado para gestionar API Keys
              <div className="text-xs mt-1">
                Usuario: {session.user?.email} | Rol: {session.user?.role}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {children}
    </>
  );
}