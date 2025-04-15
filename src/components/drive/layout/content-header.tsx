"use client";

import { PanelLeft, BookOpen, Code } from "lucide-react";
import { useSidebar } from "@/src/components/ui/sidebar";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useContent } from "@/src/context/DriveCompoentesContext";
import { useSession } from "next-auth/react";

interface ContentHeaderProps {
  title?: string;
  subtitle?: string;
}

/**
 * ContentHeader
 *
 * Componente que muestra el encabezado del contenido.
 * Incluye el botón para mostrar/ocultar la barra lateral, el título y
 * un enlace a la documentación.
 *
 * @param {string} title - Título a mostrar en el encabezado principal
 * @param {string} subtitle - Subtítulo a mostrar en la barra secundaria
 * @returns Encabezado del contenido con navegación
 */
export function ContentHeader({ title, subtitle }: ContentHeaderProps) {
  const { toggleSidebar } = useSidebar();
  const { navigationPath } = useContent();
  const searchParams = useSearchParams();

  // Verificar si el usuario está logueado y es admin
  const { data: session } = useSession();
  const isAdmin = searchParams?.get("role") === "admin" || !!session?.user;

  // Valores por defecto para título y subtítulo
  const displayTitle = title || "Sin título";
  const displaySubtitle = subtitle || "Sin subtítulo";

  return (
    <div className='flex flex-col shrink-0 w-full'>
      {/* Top navigation bar - dark zinc-700 */}
      <div className='flex h-auto items-center justify-center bg-zinc-700 text-zinc-50 py-2 relative'>
        <div className='absolute left-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={toggleSidebar}
            className='text-zinc-300 hover:text-zinc-100 hover:bg-zinc-600'
          >
            <PanelLeft className='h-5 w-5' />
            <span className='sr-only'>Mostrar/ocultar sidebar</span>
          </Button>
        </div>

        <h2 className='text-zinc-50 font-bold text-center'>{displayTitle}</h2>

        {isAdmin && (
          <div className='absolute right-4 flex gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='text-zinc-300 hover:text-zinc-100 hover:bg-zinc-600'
              asChild
            >
              <Link href='/admin/drive/routes/docs'>
                <BookOpen className='h-5 w-5' />
                <span className='sr-only'>Documentación</span>
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Green title bar */}
      <div className='bg-[#CEFF66] py-2 flex items-center justify-center'>
        <h1 className='text-zinc-900 font-bold text-center'>
          {displaySubtitle}
        </h1>
      </div>
    </div>
  );
}
