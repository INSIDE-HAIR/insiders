import Dashboard from "@/src/components/custom/dashboard/dashboard";
import type { Metadata } from "next";

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
    <div className='w-screen h-screen'>
      <Dashboard>{children}</Dashboard>
    </div>
  );
}
