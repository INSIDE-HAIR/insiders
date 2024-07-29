import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/src/components/providers/Providers";
import TopNavbar from "@/src/components/navigations/TopNavbar";
import { cn, inter } from "@/src/lib/utils/utils";
// import ToastContainerWrapper from "@/src/components/share/ToastContainerWrapper";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Plataforma INSIDERS | INSIDE HAIR",
  description:
    "En INSIDE HAIR nos dedicamos a ayudar a managers de Peluquería a conseguir sus objetivos en consultoría, formación y Marketing para salones de Peluquería.",
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
          {/* <TopNavbar /> */}

          <main
            className={cn(
              "h-full bg-background font-sans antialiased max-w-full min-w-[360px] w-full flex flex-col items-center justify-center  overflow-x-hidden",
              inter.className
            )}
          >
            {/* <ToastContainerWrapper /> */}
            {children}
            <Analytics />
          </main>
        </Providers>
      </body>
    </html>
  );
}
