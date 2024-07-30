import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/src/components/providers/Providers";
import { cn, inter } from "@/src/lib/utils/utils";
// import ToastContainerWrapper from "@/src/components/share/ToastContainerWrapper";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

export const metadata: Metadata = {
  title: "Plataforma INSIDERS | INSIDE HAIR",
  description:
    "En INSIDE HAIR nos dedicamos a ayudar a managers de Peluquería a conseguir sus objetivos en consultoría, formación y Marketing para salones de Peluquería.",
};

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <Providers>
          <main
            className={cn(
              "h-full bg-background font-sans antialiased max-w-full min-w-[360px] w-full flex flex-col items-center justify-center  overflow-x-hidden",
              inter.className
            )}
          >
            <NextIntlClientProvider messages={messages}>
              {children}
            </NextIntlClientProvider>{" "}
            <Analytics />
            <SpeedInsights />
          </main>
        </Providers>
      </body>
    </html>
  );
}
