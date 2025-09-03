import { Metadata } from "next";
import { OperationsHubMain } from "./components/OperationsHubMain";

export const metadata: Metadata = {
  title: "Operations Hub | INSIDERS",
  description: "Centro de Operaciones - Gestión centralizada de grupos, tags, sitemap y navegación",
};

interface OperationsHubPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function OperationsHubPage({ params }: OperationsHubPageProps) {
  const { lang } = await params;

  return (
    <div className="container mx-auto py-6">
      <OperationsHubMain lang={lang} />
    </div>
  );
}