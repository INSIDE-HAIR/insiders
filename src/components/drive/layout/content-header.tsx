"use client";

import { PanelLeft, BookOpen, Code } from "lucide-react";
import { useSidebar } from "@/src/components/ui/sidebar";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useContent } from "@/src/context/DriveCompoentesContext";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ReportErrorButton } from "@/src/components/drive/report-error-button";

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
export function ContentHeader({
  title: propTitle,
  subtitle: propSubtitle,
}: ContentHeaderProps) {
  const { toggleSidebar, open: sidebarOpen } = useSidebar();
  const {
    navigationPath,
    title: contextTitle,
    subtitle: contextSubtitle,
  } = useContent();
  const searchParams = useSearchParams();
  const [isInIframe, setIsInIframe] = useState(false);

  // Verificar si el usuario está logueado y es admin
  const { data: session } = useSession();
  const isAdmin = searchParams?.get("role") === "admin" || !!session?.user;

  // Detectar si estamos en un iframe
  useEffect(() => {
    setIsInIframe(window.self !== window.top);
  }, []);

  // Priorizar props s obre el contexto
  const displayTitle = contextTitle || propTitle || "Sin título";
  const displaySubtitle = contextSubtitle || propSubtitle || "Sin subtítulo";

  // Obtener clases CSS según el estado del sidebar
  const getHeaderClasses = () => {
    if (!isInIframe) return "";

    const baseClass = "iframe-fixed z-50";
    const stateClass = sidebarOpen
      ? "iframe-fixed-with-sidebar"
      : "iframe-fixed-without-sidebar";

    return `${baseClass} ${stateClass}`;
  };

  return (
    <div
      className={`flex flex-col shrink-0 w-full ${getHeaderClasses()}`}
      style={{
        position: isInIframe ? "fixed" : "relative",
        top: 0,
        zIndex: 4,
      }}
    >
      {/* Top navigation bar - dark zinc-700 */}
      <div className="flex h-auto items-center justify-center bg-zinc-700 text-zinc-50 py-2 relative">
        <div className="absolute left-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={`text-zinc-300 hover:text-zinc-100 hover:bg-zinc-600 ${
              isInIframe ? "header-button-iframe" : ""
            }`}
            data-header-sidebar-toggle="true"
            aria-label="Mostrar/ocultar sidebar"
          >
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Mostrar/ocultar sidebar</span>
          </Button>
        </div>

        <h2 className="text-zinc-50 font-bold text-center">{displayTitle}</h2>

        <div className="absolute right-4 flex gap-2 items-center">
          <ReportErrorButton isFileReport={false} />

          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-600"
              asChild
            >
              <Link href="/admin/drive/routes/docs">
                <BookOpen className="h-5 w-5" />
                <span className="sr-only">Documentación</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Green title bar */}
      <div className="bg-inside py-2 flex items-center justify-center">
        <h1 className="text-zinc-900 font-bold text-center">
          {displaySubtitle}
        </h1>
      </div>
    </div>
  );
}
