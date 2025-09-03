import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Meet Config | INSIDERS",
  description: "Configuración de Google Meet",
};

interface MeetConfigPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function MeetConfigPage({ params }: MeetConfigPageProps) {
  const { lang } = await params;
  
  // Redirect to meet settings since config is deprecated
  redirect(`/${lang}/admin/meet/settings`);
}