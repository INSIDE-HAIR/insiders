import type { Metadata } from "next";
import Dashboard from "@/src/components/dashboard/dashboard";
import TailwindGrid from "@/src/components/grid/TailwindGrid";
import Header from "@/src/components/layout/header";

export const metadata: Metadata = {
  title: "DASHBOARD | INSIDERS",
  description:
    "En INSIDE HAIR nos dedicamos a ayudar a managers de Peluquería a conseguir sus objetivos en consultoría, formación y Marketing para salones de Peluquería.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-screen h-screen">
      <Dashboard>{children}</Dashboard>
    </div>
  );
}
