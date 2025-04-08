import React from "react";
import { auth } from "@/src/config/auth/auth";

export const metadata = {
  title: "Visor de Drive",
  description: "Visor dinámico de contenido de Google Drive",
};

export default function CatchAllLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
