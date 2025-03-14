"use client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { DriveMarketingContent } from "@/src/features/marketing-salon-drive/components/DriveMarketingContent";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

// Create a client
const queryClient = new QueryClient();

export default function MarketingSalonDrivePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Obtener los parámetros actuales o usar valores por defecto
    const year =
      searchParams?.get("year") ?? new Date().getFullYear().toString();
    const campaign = searchParams?.get("campaign") ?? "january";
    const client = searchParams?.get("client"); // Cliente es opcional

    // Verificar si faltan los parámetros requeridos
    const hasRequiredParams =
      searchParams?.has("year") && searchParams?.has("campaign");

    // Si faltan parámetros requeridos, redirigir con los parámetros necesarios
    if (!hasRequiredParams) {
      const params = new URLSearchParams();
      params.set("year", year);
      params.set("campaign", campaign);

      // Añadir cliente solo si está presente
      if (client) {
        params.set("client", client);
      }

      // Redirigir a la misma ruta pero con los parámetros necesarios
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, router, pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <DriveMarketingContent />
    </QueryClientProvider>
  );
}
