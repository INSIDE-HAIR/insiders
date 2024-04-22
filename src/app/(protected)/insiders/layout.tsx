import type { Metadata } from "next";
import Dashboard from "@/src/components/dashboard/dashboard";
import TailwindGrid from "@/src/components/grid/TailwindGrid";
// import ToastContainerWrapper from "@/src/components/share/ToastContainerWrapper";
import BreadcrumbAdmin from "@/src/components/ui/breadcrumbs/breadcrumb-admin";
import AdminHeader from "@/src/components/admin-header/AdminHeader";

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
      <div className=" flex-col flex col-span-full items-start">
        <AdminHeader />
        {children}
      </div>
    </TailwindGrid>
  );
}
