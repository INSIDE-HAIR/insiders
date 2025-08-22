import { Metadata } from "next";
import { MeetRoomsClientRefactored } from "./client-page.refactored";

export const metadata: Metadata = {
  title: "Salas de Google Meet",
  description: "Gestión de salas y espacios de Google Meet",
};

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function MeetRoomsPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <MeetRoomsClientRefactored lang={resolvedParams.lang} />;
}
