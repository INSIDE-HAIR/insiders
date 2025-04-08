"use client";

import { useState, useRef } from "react";
import type { HierarchyItem } from "@/src/features/drive/types/index";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Eye, Copy, Check } from "lucide-react";
import Image from "next/image";

// Importar la utilidad para extraer el texto a copiar
import { extractCopyText } from "@/src/features/drive/utils/marketing-salon/description-parser";
import { getPreviewUrl } from "@/src/features/drive/utils/marketing-salon/hierarchy-helpers";

/**
 * ModalRenderer
 *
 * Componente especializado para renderizar modales con contenido dinámico.
 * Muestra un botón que al hacer clic abre un modal con los contenidos de una carpeta.
 *
 * Características:
 * - Botón con efecto de hover y animación suave
 * - Modal con tamaño adaptable al contenido
 * - Soporte para copiar texto al portapapeles
 * - Visualización optimizada de imágenes y otros contenidos
 * - Gestión de estados para feedback visual (hover, copiado)
 *
 * @param {HierarchyItem} item - Elemento de tipo carpeta con prefijo "modal"
 * @returns Botón que abre un modal con los contenidos de la carpeta
 */
export function ModalRenderer({ item }: { item: HierarchyItem }) {
  // Estados para controlar la interacción y feedback visual
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const copyTextRef = useRef<HTMLTextAreaElement>(null);

  // Extraer el texto a copiar desde el campo description
  const copyText = extractCopyText(item);

  /**
   * Maneja la copia de texto al portapapeles
   * Proporciona feedback visual temporal cuando se completa la copia
   */
  const handleCopyText = () => {
    if (copyTextRef.current && copyText) {
      navigator.clipboard.writeText(copyText).then(
        () => {
          // Feedback visual de éxito
          setIsCopied(true);
          // Restablecer después de 2 segundos
          setTimeout(() => setIsCopied(false), 2000);
        },
        (err) => {
          console.error("Error al copiar texto:", err);
        }
      );
    }
  };

  // Verificar si el elemento tiene hijos para mostrar en el modal
  const hasChildren = item.children && item.children.length > 0;

  // Preparar el título del modal (eliminar comillas adicionales si existen)
  const modalTitle = item.displayName
    ? item.displayName.replace(/"/g, "")
    : "Ver contenido";

  return (
    <>
      {/* Botón para abrir el modal con efectos de hover */}
      <Button
        className={`bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center gap-2 px-4 py-2 rounded transition-all duration-200 ${
          isHovered ? "shadow-lg translate-y-[-2px]" : "shadow"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsOpen(true)}
      >
        <Eye className='h-4 w-4 text-[#CEFF66]' />
        <span>{item.displayName}</span>
      </Button>

      {/* Modal con contenido dinámico */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='bg-white text-zinc-900 border-zinc-200 p-0 max-w-4xl w-full'>
          <DialogHeader className='p-4 border-b border-zinc-200'>
            <DialogTitle>{item.displayName}</DialogTitle>
          </DialogHeader>

          {/* Área de contenido principal del modal */}
          <div
            className='flex flex-col items-center justify-center p-4 overflow-auto'
            style={{ maxHeight: "calc(90vh - 160px)" }}
          >
            {/* Renderizar los hijos del modal (generalmente imágenes) */}
            {item.children && item.children.length > 0 && (
              <div className='w-full h-full flex items-center justify-center'>
                {item.children.map((child, index) => (
                  <div
                    key={child.id}
                    className='w-full h-full flex items-center justify-center'
                  >
                    {getPreviewUrl(child) ? (
                      <Image
                        src={getPreviewUrl(child) || "/placeholder.svg"}
                        alt={child.displayName}
                        className='max-w-full max-h-full object-contain'
                        style={{
                          maxHeight: "calc(90vh - 200px)",
                          width: "auto",
                          height: "auto",
                        }}
                        width={800}
                        height={600}
                        unoptimized={true}
                      />
                    ) : (
                      <div className='h-40 bg-zinc-100 rounded-md flex items-center justify-center'>
                        <span className='text-zinc-400'>
                          {child.displayName}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pie del modal con botones de acción */}
          <DialogFooter className='p-4 border-t border-zinc-200 flex justify-between'>
            {/* Botón de copiar (solo si hay texto para copiar) */}
            {copyText && (
              <Button
                className='bg-zinc-200 hover:bg-zinc-300 text-zinc-900'
                onClick={handleCopyText}
              >
                {isCopied ? (
                  <>
                    <Check className='h-4 w-4 mr-2' />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className='h-4 w-4 mr-2' />
                    Copiar Texto
                  </>
                )}
              </Button>
            )}
            {/* Botón para cerrar el modal */}
            <Button variant='destructive' onClick={() => setIsOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>

          {/* Textarea oculto para facilitar la copia de texto */}
          {copyText && (
            <textarea
              ref={copyTextRef}
              defaultValue={copyText}
              className='hidden'
              readOnly
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
