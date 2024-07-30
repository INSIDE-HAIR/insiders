import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/src/components/providers/Providers";
import { cn, inter } from "@/src/lib/utils/utils";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  getTranslations,
  getMessages,
  unstable_setRequestLocale,
} from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

// Definir los locales soportados
const locales = ["en", "es"]; // Ajusta esto según tus idiomas soportados

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title") || "Plataforma INSIDERS | INSIDE HAIR",
    description:
      t("description") ||
      "En INSIDE HAIR nos dedicamos a ayudar a managers de Peluquería a conseguir sus objetivos en consultoría, formación y Marketing para salones de Peluquería.",
  };
}

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  unstable_setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <Providers>
          <main
            className={cn(
              "h-full bg-background font-sans antialiased max-w-full min-w-[360px] w-full flex flex-col items-center justify-center overflow-x-hidden",
              inter.className
            )}
          >
            <NextIntlClientProvider messages={messages} locale={locale}>
              {children}
            </NextIntlClientProvider>
            <Analytics />
            <SpeedInsights />
          </main>
        </Providers>
      </body>
    </html>
  );
}
