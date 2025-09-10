import { Metadata } from "next";
import { TagsManagement } from "@/src/features/meet/components/TagsManagement";
import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Tag } from "lucide-react";

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
    <div>
      <DocHeader
        title="Gestión de Tags"
        description="Sistema de etiquetas jerárquico para clasificación y filtrado rápido de contenido centralizado"
        icon={Tag}
      />
      
      <DocContent>
        <div className="container mx-auto py-6">
          <TagsManagement lang={lang} />
        </div>
      </DocContent>
    </div>
  );
}