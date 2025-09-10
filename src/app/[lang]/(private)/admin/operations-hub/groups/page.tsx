import { Metadata } from "next";
import { GroupsManagement } from "@/src/features/meet/components/GroupsManagement";
import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Grupos | Operations Hub",
  description: "Gestiona los grupos para organizar usuarios y contenido de forma jerárquica",
};

interface GroupsPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function GroupsPage({ params }: GroupsPageProps) {
  const { lang } = await params;

  return (
    <div>
      <DocHeader
        title="Gestión de Grupos"
        description="Sistema de grupos jerárquicos para organización centralizada de usuarios y contenido"
        icon={Users}
      />
      
      <DocContent>
        <div className="container mx-auto py-6">
          <GroupsManagement lang={lang} />
        </div>
      </DocContent>
    </div>
  );
}