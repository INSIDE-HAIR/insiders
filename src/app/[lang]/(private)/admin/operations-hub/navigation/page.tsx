import { Metadata } from "next";
import { MenuUnderConstruction } from "./components/MenuUnderConstruction";
import { DocHeader } from "@/src/components/drive/docs/doc-header";
import { DocContent } from "@/src/components/drive/docs/doc-content";
import { Navigation } from "lucide-react";

export const metadata: Metadata = {
  title: "Gestión de Menús | INSIDERS",
  description: "Sistema de gestión de menús dinámicos - Headers, Footers y Sidebars",
};

interface MenuPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { lang } = await params;

  return (
    <div>
      <DocHeader
        title="Gestión de Menús"
        description="Sistema de gestión de menús dinámicos para Headers, Footers y Sidebars"
        icon={Navigation}
      />
      
      <DocContent>
        <div className="container mx-auto py-6 space-y-6">
          <MenuUnderConstruction lang={lang} />
        </div>
      </DocContent>
    </div>
  );
}