import { Metadata } from "next";
import { MeetRoomsClient } from "./client-page";

export const metadata: Metadata = {
  title: "Salas de Google Meet",
  description: "Gestión de salas y espacios de Google Meet",
};

interface PageProps {
  params: {
    lang: string;
  };
}

export default async function MeetRoomsPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <MeetRoomsClient lang={resolvedParams.lang} />;
}