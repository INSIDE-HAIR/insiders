import type { Metadata } from "next";
import Dashboard from "@/src/components/dashboard/dashboard";
import TailwindGrid from "@/src/components/grid/TailwindGrid";
import AuthHeader from "@/src/components/auth-header/AuthHeader";

export const metadata: Metadata = {
  title: "AUTH | INSIDERS",
  description:
    "En INSIDE HAIR nos dedicamos a ayudar a managers de Peluquería a conseguir sus objetivos en consultoría, formación y Marketing para salones de Peluquería.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TailwindGrid fullSize>
      <div className=" flex-col flex col-span-full items-start">
        <AuthHeader />
        {children}
      </div>
    </TailwindGrid>
  );
}
