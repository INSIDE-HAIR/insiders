"use client";

import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import prisma from "../../../lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/src/components/ui/card";
import { ViewSelector } from "@/src/app/[lang]/admin/drive/components/views";
import { HierarchyItem } from "@drive/types/hierarchy";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Badge } from "@/src/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

// Definir el tipo para el componente dinámico
interface ClientViewSelectorProps {
  hierarchy: HierarchyItem[];
}

// Componentes dinámicos
const ClientViewSelector = dynamic<ClientViewSelectorProps>(
  () => import("./components/ClientViewSelector"),
  { ssr: false }
);

const ViewModeSelector = dynamic(
  () => import("./components/ViewModeSelector"),
  { ssr: false }
);

const ClientView = dynamic(() => import("./components/ClientView"), {
  ssr: false,
});

// Función para obtener datos del servidor con datos simulados para cliente
async function getDriveRouteData(slug: string) {
  try {
    const encodedSlug = encodeURIComponent(slug);
    const response = await fetch(`/api/drive/public/${encodedSlug}`);
    if (!response.ok) {
      throw new Error("No se pudo cargar la ruta");
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading drive route:", error);
    return null;
  }
}

// Componente principal
export default function DynamicDrivePage({
  params,
}: {
  params: { path: string[]; lang: string };
}) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  // Estado para el modo de vista
  const [viewMode, setViewMode] = useState<"admin" | "client">("client");
  const [routeData, setRouteData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Construir slug a partir del path
  const slug = params.path.join("/");

  // Cargar datos
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getDriveRouteData(slug);
        if (!data) {
          setError("No se pudo encontrar la ruta especificada");
          return;
        }
        setRouteData(data);
      } catch (err) {
        setError("Error al cargar los datos");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [slug]);

  // Manejador para cambiar el modo de vista
  const handleViewModeChange = (mode: "admin" | "client") => {
    if (!isAdmin) return;
    setViewMode(mode);
  };

  // Mostrar carga
  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[50vh]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p>Cargando contenido...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error || !routeData) {
    return (
      <div className=''>
        <Card className='border-destructive'>
          <CardHeader>
            <CardTitle className='text-destructive'>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "No se pudo cargar el contenido"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Obtener jerarquía
  const hierarchyData = routeData.hierarchyData as any;
  const hierarchy = hierarchyData[0]?.root || hierarchyData[0];

  // Información de diagnóstico
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <div className='w-screen'>
      {/* Selector de modo de vista - solo visible para administradores */}
      {isAdmin && (
        <ViewModeSelector mode={viewMode} onChange={handleViewModeChange} />
      )}

      {/* Vista de cliente */}
      {(!isAdmin || viewMode === "client") && (
        <ClientView
          title={routeData.title}
          subtitle={routeData.subtitle}
          hierarchy={Array.isArray(hierarchy) ? hierarchy : [hierarchy]}
          lastUpdated={new Date(routeData.lastUpdated)}
        />
      )}

      {/* Vista de administrador - solo visible para administradores */}
      {isAdmin && viewMode === "admin" && (
        <div className='container py-10'>
          {routeData.title && (
            <div className='mb-8 text-center'>
              <h1 className='text-4xl font-bold mb-2'>{routeData.title}</h1>
              {routeData.subtitle && (
                <p className='text-xl text-muted-foreground'>
                  {routeData.subtitle}
                </p>
              )}
              <div className='flex justify-center mt-2'>
                <Badge variant='warning' className='ml-2'>
                  Slug: {slug}
                </Badge>
                <Badge variant='default' className='ml-2'>
                  Vistas: {routeData.viewCount}
                </Badge>
              </div>
            </div>
          )}

          {routeData.description && (
            <Card className='mb-8'>
              <CardContent className='pt-6'>
                <p>{routeData.description}</p>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue='content' className='mb-8'>
            <TabsList>
              <TabsTrigger value='content'>Contenido</TabsTrigger>
              <TabsTrigger value='debug' disabled={isProduction}>
                Debug
              </TabsTrigger>
            </TabsList>

            <TabsContent value='content'>
              <Card>
                <CardContent className='p-0 sm:p-6'>
                  <ClientViewSelector
                    hierarchy={
                      Array.isArray(hierarchy) ? hierarchy : [hierarchy]
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='debug'>
              <Card>
                <CardHeader>
                  <CardTitle>Información de Diagnóstico</CardTitle>
                  <CardDescription>
                    Datos de la ruta y parámetros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type='single' collapsible className='w-full'>
                    <AccordionItem value='route-params'>
                      <AccordionTrigger>Parámetros de ruta</AccordionTrigger>
                      <AccordionContent>
                        <pre className='bg-muted p-4 rounded-md overflow-x-auto'>
                          {JSON.stringify(
                            {
                              path: params.path,
                              slug,
                              lang: params.lang,
                            },
                            null,
                            2
                          )}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value='route-data'>
                      <AccordionTrigger>Datos de DriveRoute</AccordionTrigger>
                      <AccordionContent>
                        <pre className='bg-muted p-4 rounded-md overflow-x-auto'>
                          {JSON.stringify(
                            {
                              id: routeData.id,
                              slug: routeData.slug,
                              title: routeData.title,
                              subtitle: routeData.subtitle,
                              description: routeData.description,
                              folderIds: routeData.folderIds,
                              lastUpdated: routeData.lastUpdated,
                              viewCount: routeData.viewCount,
                              isActive: routeData.isActive,
                            },
                            null,
                            2
                          )}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value='hierarchy-data'>
                      <AccordionTrigger>
                        Estructura de jerarquía
                      </AccordionTrigger>
                      <AccordionContent>
                        <pre className='bg-muted p-4 rounded-md overflow-x-auto'>
                          {JSON.stringify(hierarchy, null, 2)}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className='mt-4 text-center text-sm text-muted-foreground'>
            Última actualización:{" "}
            {new Date(routeData.lastUpdated).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
