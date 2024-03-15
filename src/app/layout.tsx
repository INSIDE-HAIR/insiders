import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/src/components/providers/Providers";
import TopNavbar from "@/src/components/navigations/TopNavbar";
import { cn, inter } from "@/src/lib/utils/utils";
// import ToastContainerWrapper from "@/src/components/share/ToastContainerWrapper";

export const metadata: Metadata = {
  title: "Plataforma INSIDERS | INSIDE HAIR",
  description: "En INSIDE HAIR nos dedicamos a ayudar a managers de Peluquería a conseguir sus objetivos en consultoría, formación y Marketing para salones de Peluquería.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main
            className={cn(
              "h-full min-h-screen bg-background flex flex-col min-w-80 font-sans antialiased ",
              inter.className
            )}
          >
            {/* <ToastContainerWrapper /> */}
            <TopNavbar />
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
