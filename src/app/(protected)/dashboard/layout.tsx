import type { Metadata } from "next";
import Providers from "@/src/components/providers/Providers";
import TopNavbar from "@/src/components/navigations/TopNavbar";
import { cn, inter } from "@/src/lib/utils/utils";
import { DashboardIcon } from "@radix-ui/react-icons";
import Dashboard from "@/src/components/dashboard/dashboard";
import TailwindGrid from "@/src/components/grid/TailwindGrid";
// import ToastContainerWrapper from "@/src/components/share/ToastContainerWrapper";

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
    <TailwindGrid fullSize>
      <Dashboard />
      {/* <ToastContainerWrapper /> */}
      {children}
    </TailwindGrid>
  );
}
