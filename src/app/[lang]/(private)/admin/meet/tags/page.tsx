import { Metadata } from "next";
import { TagsManagement } from "@/src/features/meet/components/TagsManagement";

export const metadata: Metadata = {
  title: "Meet Tags | INSIDERS",
  description: "Gestiona las etiquetas para organizar las salas de Meet",
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
      <TagsManagement lang={lang} />
    </div>
  );
}