import { Metadata } from "next";
import { GroupsManagement } from "@/src/features/meet/components/GroupsManagement";

export const metadata: Metadata = {
  title: "Meet Groups | INSIDERS",
  description: "Gestiona los grupos para organizar las salas de Meet",
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
      <GroupsManagement lang={lang} />
    </div>
  );
}