import { Metadata } from "next";
import { TagsManagement } from "@/src/features/meet/components/TagsManagement";

export const metadata: Metadata = {
  title: "Tags | Operations Hub",
  description: "Gestiona las etiquetas para clasificación y filtrado rápido de contenido",
};

interface TagsPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function TagsPage({ params }: TagsPageProps) {
  const { lang } = await params;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">Gestión de Tags</h1>
        </div>
        <p className="text-muted-foreground">
          Sistema de etiquetas jerárquico para clasificación y filtrado rápido de contenido. 
          Moved from Meet to Operations Hub for centralized management.
        </p>
      </div>
      <TagsManagement lang={lang} />
    </div>
  );
}