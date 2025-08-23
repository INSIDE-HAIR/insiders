/**
 * SECTIONNAVIGATIONMODAL - Modal responsivo con navegación SOLID
 * Integra el sistema de navegación foundation con ResponsiveModal
 *
 * Características:
 * ✅ ResponsiveModal base con variantes direccionales
 * ✅ Sistema de navegación SOLID integrado
 * ✅ Secciones independientes con lazy loading
 * ✅ Responsive design automático
 * ✅ Keyboard shortcuts globales
 * ✅ Estado persistente
 *
 * @author Claude Code
 * @version 1.0.0
 */

import React, { Suspense } from "react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
} from "@/src/components/ui/responsive-modal";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Skeleton } from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";
import { VideoCameraIcon } from "@heroicons/react/24/outline";

import { CompactSectionSelector } from "../../atoms/modal/CompactSectionSelector";
import { useModalNavigation } from "../../../hooks/useModalNavigation";

interface Section {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  searchable?: boolean;
  keywords?: string[];
  // Lazy loading del componente
  component:
    | React.LazyExoticComponent<React.ComponentType<any>>
    | React.ComponentType<any>;
  // Props específicas de la sección
  props?: Record<string, any>;
}

interface SectionNavigationModalProps {
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Lista de secciones del modal */
  sections: Section[];
  /** Título del modal */
  title?: string;
  /** Descripción del modal */
  description?: string;
  /** Sección inicial */
  initialSectionId?: string;
  /** Variante de posición del modal */
  variant?: "top" | "bottom" | "left" | "right";
  /** Props globales para todas las secciones */
  globalProps?: Record<string, any>;
  /** Callback cuando cambia de sección */
  onSectionChange?: (sectionId: string) => void;
  /** Custom footer */
  customFooter?: React.ReactNode;
  /** Ancho máximo personalizado */
  maxWidth?: string;
  /** Altura máxima personalizada */
  maxHeight?: string;
  /** Clases CSS adicionales */
  className?: string;
}

export const SectionNavigationModal: React.FC<SectionNavigationModalProps> = ({
  isOpen,
  onClose,
  sections,
  title = "Configuración",
  description,
  initialSectionId,
  variant = "bottom",
  globalProps = {},
  onSectionChange,
  customFooter,
  maxWidth = "4xl",
  maxHeight = "90vh",
  className,
}) => {
  const navigation = useModalNavigation({
    sections,
    initialSectionId: initialSectionId || sections[0]?.id,
    enableHistory: true,
    persistState: true,
    storageKey: `modal-navigation-${title.toLowerCase().replace(/\s+/g, "-")}`,
    onSectionChange: (sectionId, previousSectionId) => {
      console.log(`🧭 Modal Navigation: ${previousSectionId} → ${sectionId}`);
      if (onSectionChange) {
        onSectionChange(sectionId);
      }
    },
  });

  const {
    currentSectionId,
    currentIndex,
    totalSections,
    goToSection,
    canGoPrevious,
    canGoNext,
    goToPrevious,
    goToNext,
  } = navigation;

  // Componente actual a renderizar
  const currentSectionData = sections.find((s) => s.id === currentSectionId);
  const CurrentSectionComponent = currentSectionData?.component;

  console.log('🧭 SectionNavigationModal: Rendering section', {
    currentSectionId,
    sectionFound: !!currentSectionData,
    componentFound: !!CurrentSectionComponent,
    sectionTitle: currentSectionData?.title
  });

  // Props combinadas para la sección actual
  const combinedProps = {
    ...globalProps,
    ...currentSectionData?.props,
    // Props de navegación disponibles para las secciones
    navigation: {
      currentSectionId,
      currentIndex,
      totalSections,
      canGoPrevious,
      canGoNext,
      goToPrevious,
      goToNext,
      goToSection,
    },
  };

  // Loading fallback para lazy loading
  const SectionLoadingFallback = () => (
    <div className='space-y-4 p-4'>
      <Skeleton className='h-6 w-3/4' />
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-4 w-2/3' />
      <div className='space-y-2'>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
      </div>
    </div>
  );

  // Responsive modal size
  const getResponsiveClasses = () => {
    const baseClasses = "w-full";
    const sizeClasses = {
      sm: "lg:max-w-sm",
      md: "lg:max-w-md",
      lg: "lg:max-w-lg",
      xl: "lg:max-w-xl",
      "2xl": "lg:max-w-2xl",
      "3xl": "lg:max-w-3xl",
      "4xl": "lg:max-w-4xl",
      "5xl": "lg:max-w-5xl",
      "6xl": "lg:max-w-6xl",
      "7xl": "lg:max-w-7xl",
    };

    return cn(
      baseClasses,
      sizeClasses[maxWidth as keyof typeof sizeClasses] || sizeClasses["4xl"],
      className
    );
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose}>
      <ResponsiveModalContent
        side={variant}
        className={getResponsiveClasses()}
        style={{ maxHeight }}
      >
        {/* Header ultra compacto con navegación integrada */}
        <ResponsiveModalHeader className='pb-4 mt-4'>
          {/* Layout responsive: Desktop = fila única, Mobile = título + selector abajo */}
          <div className='flex  flex-col sm:flex-row space-y-3 justify-between items-center'>
            <div>
              <div className='flex items-center justify-between min-h-[2rem]'>
                <ResponsiveModalTitle className='flex items-center gap-2 relative m-auto sm:m-0'>
                  <VideoCameraIcon className='h-5 w-5 text-primary flex-shrink-0 ' />
                  <span className='truncate'>{title}</span>

                </ResponsiveModalTitle>
              </div>

              {/* Segunda fila condicional: Descripción si existe */}
              {description && (
                <p className='text-sm text-muted-foreground '>{description}</p>
              )}
            </div>
            {/* Primera fila: Título + Badge superíndice */}

            {/* Selector compacto - responsive y con mejor alineación */}
            <div className='flex justify-end w-[100%] sm:w-[50%] '>
              <div className='w-full max-w-md m-auto sm:m-0'>
                <CompactSectionSelector
                  sections={sections}
                  currentSectionId={currentSectionId}
                  onSectionChange={goToSection}
                  placeholder='Seleccionar sección...'
                  searchPlaceholder='Buscar sección...'
                  disabled={false}
                />
              </div>
            </div>
          </div>
        </ResponsiveModalHeader>

        {/* Contenido de la sección actual con scroll */}
        <div className='flex-1 overflow-hidden'>
          <ScrollArea className='h-full px-1'>
            <div className='pb-6'>
              {CurrentSectionComponent ? (
                <Suspense fallback={
                  (() => {
                    console.log('🧭 SectionNavigationModal: Showing loading fallback for section:', currentSectionId);
                    return <SectionLoadingFallback />;
                  })()
                }>
                  {(() => {
                    console.log('🧭 SectionNavigationModal: Attempting to render component for section:', currentSectionId);
                    try {
                      return <CurrentSectionComponent {...combinedProps} />;
                    } catch (error) {
                      console.error('🧭 SectionNavigationModal: Error rendering component for section:', currentSectionId, error);
                      return (
                        <div className="text-center py-8">
                          <div className="text-red-500 mb-2">Error al cargar la sección</div>
                          <div className="text-xs text-muted-foreground">
                            {error instanceof Error ? error.message : 'Error desconocido'}
                          </div>
                        </div>
                      );
                    }
                  })()}
                </Suspense>
              ) : (
                <div className='text-center py-12'>
                  <div className='text-muted-foreground'>
                    <div className='text-lg font-medium mb-2'>
                      Sección no encontrada
                    </div>
                    <p className='text-sm'>
                      La sección "{currentSectionId}" no está disponible.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer eliminado - solo botón cerrar en header */}
        {customFooter && (
          <ResponsiveModalFooter className='border-t pt-4'>
            {customFooter}
          </ResponsiveModalFooter>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};
