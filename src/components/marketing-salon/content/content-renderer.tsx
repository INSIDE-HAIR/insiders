"use client";

import { useContent } from "@/src/context/marketing-salon/content-context";
import { ContentHeader } from "@/src/components/marketing-salon/layout/content-header";
import { RecursiveContentRenderer } from "@/src/components/marketing-salon/content/recursive-content-renderer";

/**
 * ContentRenderer
 *
 * Componente principal que inicia la renderización del contenido.
 * Actúa como punto de entrada para la visualización de contenido seleccionado
 * en la navegación. Muestra el encabezado y el contenido principal.
 *
 * Utiliza RecursiveContentRenderer para mostrar el contenido de forma jerárquica.
 *
 * @returns El contenido completo con encabezado y área de contenido
 */
export function ContentRenderer() {
  const { navigationPath, getItemById } = useContent();

  // Si no hay elementos seleccionados, mostrar mensaje
  if (navigationPath.length === 0) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-muted-foreground'>No hay contenido disponible</p>
      </div>
    );
  }

  // Obtener el elemento de la barra lateral seleccionado
  const sidebarItem = getItemById(navigationPath[0].id);
  if (!sidebarItem) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-muted-foreground'>No hay contenido disponible</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full overflow-hidden'>
      <ContentHeader title={sidebarItem.displayName} />
      <div className='flex-1 overflow-auto bg-white'>
        <div className='w-full overflow-hidden py-6'>
          <RecursiveContentRenderer
            level={1}
            parentId={navigationPath[0].id}
            parentType='sidebar'
          />
        </div>
      </div>
    </div>
  );
}
