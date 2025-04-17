"use client";

import React, { useState, useMemo, useCallback } from "react";
import { HierarchyItem } from "@drive/types/hierarchy";
import { DriveType } from "@/src/features/drive/types";
import { ContentProvider } from "@/src/context/DriveCompoentesContext";
import ContentLayout from "@/src/components/drive/layout/content-layout";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Check, Copy } from "lucide-react";

interface ClientViewProps {
  title?: string | null;
  subtitle?: string | null;
  hierarchy: HierarchyItem[];
  lastUpdated: Date;
  isAdmin?: boolean;
}

// Función más completa para adaptar los datos a lo que espera ContentProvider
function adaptContentData(data: any[]): HierarchyItem[] {
  return data.map((item) => {
    // Asegurarse de que las propiedades básicas existan
    const adaptedItem = {
      ...item,
      // Asegurarse de que driveType sea el enum correcto
      driveType:
        item.driveType === "folder" ? DriveType.FOLDER : DriveType.FILE,
      // Si no tiene estas propiedades, asignarles valores por defecto
      prefixes: item.prefixes || [],
      suffixes: item.suffixes || [],
      order: typeof item.order === "number" ? item.order : 0,
      displayName: item.displayName || item.name || "",
      originalName: item.originalName || item.name || "",
      depth: typeof item.depth === "number" ? item.depth : 0,
      // Procesar los hijos recursivamente
      children: item.children ? adaptContentData(item.children) : [],
    };

    return adaptedItem;
  });
}

export default function ClientView({
  title,
  subtitle,
  hierarchy,
  lastUpdated,
  isAdmin = false,
}: ClientViewProps) {
  const [viewMode, setViewMode] = useState<"json" | "content">("content");
  const [copied, setCopied] = useState(false);

  // Adaptar los datos para el ContentProvider - memoizado para evitar recálculos
  const adaptedHierarchy = useMemo(() => {
    return adaptContentData(hierarchy);
  }, [hierarchy]);

  // ID del elemento raíz para la navegación
  const rootId = useMemo(() => hierarchy[0]?.id || "", [hierarchy]);

  // Función para copiar JSON - memoizada para evitar recreación en cada render
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(hierarchy, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [hierarchy]);

  return (
    <div className='flex flex-col h-full'>
      {isAdmin && (
        <header className='bg-zinc-900 pt-4'>
          {(title || subtitle) && (
            <div className='text-center'>
              {title && (
                <h1 className='text-3xl font-bold mb-2 text-zinc-100'>
                  {title}
                </h1>
              )}
              {subtitle && <p className='text-xl text-zinc-400'>{subtitle}</p>}
            </div>
          )}
          {/* Botones para cambiar el modo de vista - solo visibles para administradores */}
          <div className='mt-2 flex justify-center space-x-2 border-b-1 border-white mb-0 pb-4'>
            <Button
              size='sm'
              onClick={() => setViewMode("content")}
              className={
                viewMode === "content"
                  ? "bg-inside text-zinc-900 hover:bg-inside/90"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border-zinc-100 border-1 hover:border-zinc-800 hover:text-zinc-800 hover:bg-inside/90"
              }
            >
              Ver Contenido
            </Button>
            <Button
              size='sm'
              onClick={() => setViewMode("json")}
              className={
                viewMode === "json"
                  ? "bg-inside text-zinc-900 hover:bg-inside/90"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border-zinc-100 border-1 hover:border-zinc-800 hover:text-zinc-800 hover:bg-inside/90"
              }
            >
              Ver JSON
            </Button>
          </div>
        </header>
      )}

      {/* Contenido principal */}
      <main className='flex-1'>
        {viewMode === "content" || !isAdmin ? (
          // Vista de contenido usando ContentProvider
          <ContentProvider
            initialData={adaptedHierarchy}
            routeParams={{ id: rootId }}
            title={title || undefined}
            subtitle={subtitle || undefined}
          >
            <ContentLayout />
          </ContentProvider>
        ) : (
          // Vista JSON - solo para administradores
          <Card className='overflow-hidden bg-zinc-900 border-zinc-800 m-4'>
            <CardContent className='p-0 relative'>
              <Button
                variant='ghost'
                size='sm'
                className='absolute top-2 right-2 z-10 bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
                onClick={copyToClipboard}
              >
                {copied ? (
                  <>
                    <Check className='h-4 w-4 mr-1' /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className='h-4 w-4 mr-1' /> Copiar JSON
                  </>
                )}
              </Button>
              <div className='bg-zinc-950 text-zinc-100 p-4 overflow-y-auto max-h-[calc(100vh-180px)] font-mono text-sm'>
                <pre>{JSON.stringify(hierarchy, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Pie de página con fecha de actualización - visible solo para administradores */}
      {isAdmin && (
        <footer className='text-center text-sm text-zinc-800 py-2 bg-inside'>
          Última actualización: {lastUpdated.toLocaleString()}
        </footer>
      )}
    </div>
  );
}
