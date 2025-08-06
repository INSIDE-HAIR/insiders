"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Shield, AlertTriangle, Settings } from "lucide-react";

interface ClientPageProps {
  children: React.ReactNode;
}

export default function SettingsClientPage({ children }: ClientPageProps) {
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
      <div className='container mx-auto p-6 space-y-8'>
        <div className='flex items-center space-x-3'>
          <Skeleton className='h-10 w-10 rounded-lg' />
          <div className='space-y-2'>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-4 w-96' />
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-3 w-full' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-20 w-full' />
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
      <div className='container mx-auto p-6'>
        <Card className='max-w-md mx-auto'>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2 text-orange-600'>
              <AlertTriangle className='h-5 w-5' />
              <span>Acceso Requerido</span>
            </CardTitle>
            <CardDescription>
              Necesitas iniciar sesión para acceder a esta página
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Insufficient permissions
  if (session.user?.role !== "ADMIN" && session.user?.role !== "EMPLOYEE") {
    return (
      <div className='container mx-auto p-6'>
        <Alert className='max-w-2xl mx-auto border-red-200 bg-red-50'>
          <Shield className='h-4 w-4' />
          <AlertDescription className='text-red-800'>
            <strong>Acceso Denegado:</strong> No tienes permisos suficientes
            para acceder a la configuración del sistema. Esta sección requiere
            permisos de administrador.
            <div className='mt-2 text-sm'>
              <div>
                Tu rol actual:{" "}
                <span className='font-semibold'>
                  {session.user?.role || "Sin definir"}
                </span>
              </div>
              <div>
                Roles requeridos:{" "}
                <span className='font-semibold'>ADMIN</span>
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
        <div className='container mx-auto px-6 pt-2'>
          <Alert className='mb-4 border-blue-200 bg-blue-50'>
            <Settings className='h-4 w-4' />
            <AlertDescription className='text-blue-800'>
              <strong>Debug Info:</strong> Usuario autenticado correctamente
              <div className='text-xs mt-1'>
                Usuario: {session.user?.email} | Rol: {session.user?.role} | ID:{" "}
                {session.user?.id}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {children}
    </>
  );
}
