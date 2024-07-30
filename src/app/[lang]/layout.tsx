import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/src/components/providers/Providers";
import { cn, inter } from "@/src/lib/utils/utils";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { TranslationProvider } from "@/src/context/TranslationContext";

const locales = ["en", "es"] as const;
type Locale = (typeof locales)[number];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return {
    title: "Plataforma INSIDERS | INSIDE HAIR",
    description:
      "En INSIDE HAIR nos dedicamos a ayudar a managers de Peluquería a conseguir sus objetivos en consultoría, formación y Marketing para salones de Peluquería.",
  };
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) locale = "es"; // default to Spanish if locale is invalid

  let messages;
  try {
    messages = await import(`@/public/locales/${locale}/common.json`).then(
      (module) => module.default
    );
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    messages = {}; // Provide empty object as fallback
  }

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
            <TranslationProvider
              initialLocale={locale as Locale}
              initialMessages={messages}
            >
              {children}
            </TranslationProvider>
            <Analytics />
            <SpeedInsights />
          </main>
        </Providers>
      </body>
    </html>
  );
}
