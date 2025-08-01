import type { Metadata } from "next";
import TailwindGrid from "@/src/components/grid/TailwindGrid";
import Header from "../../(private)/_components/layout/header";

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
        <Header type="auth" homeLabel="INSIDE HAIR" dropdownSliceEnd={-2} />
        {children}
      </div>
    </TailwindGrid>
  );
}
