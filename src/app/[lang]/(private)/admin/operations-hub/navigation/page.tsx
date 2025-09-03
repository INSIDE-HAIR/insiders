import { Metadata } from "next";
import { MenuUnderConstruction } from "./components/MenuUnderConstruction";

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
    <div className="container mx-auto py-6 space-y-6">
      <MenuUnderConstruction lang={lang} />
    </div>
  );
}