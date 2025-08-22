import { Metadata } from "next";
import { MeetRoomsClientWrapper } from "./client-wrapper";

export const metadata: Metadata = {
  title: "Salas de Google Meet - Gestión Avanzada",
  description: "Sistema de gestión completo para salas y espacios de Google Meet con arquitectura SOLID",
  keywords: ["Google Meet", "Salas", "Videoconferencias", "Gestión", "Analytics", "SOLID"],
};

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

/**
 * Página principal refactorizada para gestión de salas Meet
 * Utiliza arquitectura SOLID y componentes completamente refactorizados
 */
export default async function MeetRoomsPageRefactored({ params }: PageProps) {
  const resolvedParams = await params;
  
  return (
    <div className="min-h-screen bg-background">
      <MeetRoomsClientWrapper lang={resolvedParams.lang} />
    </div>
  );
}