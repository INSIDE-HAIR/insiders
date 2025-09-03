import { Metadata } from "next";
import { GroupsManagement } from "@/src/features/meet/components/GroupsManagement";

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
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">Gestión de Grupos</h1>
        </div>
        <p className="text-muted-foreground">
          Sistema de grupos jerárquicos para organización de usuarios y contenido. 
          Moved from Meet to Operations Hub for centralized management.
        </p>
      </div>
      <GroupsManagement lang={lang} />
    </div>
  );
}