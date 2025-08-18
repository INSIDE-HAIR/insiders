/**
 * SystemStatus Component
 * Displays system status for video conferencing providers
 */
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Shield, AlertCircle } from "lucide-react";
import { useIntegrationAccounts } from "../hooks/useIntegrations";
import { VideoProvider } from "../types/video-conferencing";

export default function SystemStatus() {
  const { data: integrations, isLoading, error } = useIntegrationAccounts();

  const getProviderStatus = (provider: VideoProvider) => {
    const integration = integrations?.find((int) => int.provider === provider);

    if (!integration) {
      return {
        status: "not_configured",
        color: "bg-gray-500",
        text: "No configurado",
      };
    }

    switch (integration.status) {
      case "ACTIVE":
        return {
          status: "operational",
          color: "bg-green-500",
          text: "Operativo",
        };
      case "ERROR":
        return {
          status: "error",
          color: "bg-red-500",
          text: "Error",
        };
      case "EXPIRED":
        return {
          status: "expired",
          color: "bg-yellow-500",
          text: "Token expirado",
        };
      default:
        return {
          status: "unknown",
          color: "bg-gray-500",
          text: "Desconocido",
        };
    }
  };

  const providers: { name: string; provider: VideoProvider }[] = [
    { name: "Google Meet API", provider: "GOOGLE_MEET" },
    { name: "Zoom API", provider: "ZOOM" },
    { name: "Vimeo API", provider: "VIMEO" },
  ];

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            Estado del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-4'>
            <AlertCircle className='h-6 w-6 text-destructive mr-2' />
            <span className='text-sm text-muted-foreground'>
              Error al cargar estado del sistema
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Shield className='h-5 w-5' />
          Estado del Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {providers.map((provider) => {
            const status = getProviderStatus(provider.provider);

            return (
              <div key={provider.provider} className='flex items-center gap-3'>
                {isLoading ? (
                  <>
                    <Skeleton className='h-3 w-3 rounded-full' />
                    <div className='space-y-1'>
                      <Skeleton className='h-4 w-24' />
                      <Skeleton className='h-3 w-16' />
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={`h-3 w-3 ${status.color} rounded-full`}
                    ></div>
                    <div>
                      <p className='text-sm font-medium'>{provider.name}</p>
                      <p className='text-xs text-muted-foreground'>
                        {status.text}
                      </p>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Overall system health */}
        {!isLoading && integrations && (
          <div className='mt-4 pt-4 border-t'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>Estado general:</span>
              <div className='flex items-center gap-2'>
                {integrations.filter((int) => int.status === "ACTIVE")
                  .length === integrations.length ? (
                  <>
                    <div className='h-2 w-2 bg-green-500 rounded-full'></div>
                    <span className='text-green-600 font-medium'>
                      Todos los servicios operativos
                    </span>
                  </>
                ) : integrations.some((int) => int.status === "ACTIVE") ? (
                  <>
                    <div className='h-2 w-2 bg-yellow-500 rounded-full'></div>
                    <span className='text-yellow-600 font-medium'>
                      Servicios parcialmente operativos
                    </span>
                  </>
                ) : (
                  <>
                    <div className='h-2 w-2 bg-red-500 rounded-full'></div>
                    <span className='text-red-600 font-medium'>
                      Servicios con problemas
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
