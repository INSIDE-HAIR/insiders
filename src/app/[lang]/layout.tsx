import "../globals.css";
import Providers from "@/src/context/providers/Providers";
import { cn, inter } from "@/src/lib/utils/utils";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ReactQueryProvider from "@/src/context/ReactQueryProvider";
import { Toaster } from "@/src/components/ui/toaster";
import { TranslationsProvider } from "@/src/context/TranslationContext";
import defaultTranslations from "@/src/locales/es/common.json";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang='es' suppressHydrationWarning>
      <body suppressHydrationWarning={true}>
        <TranslationsProvider
          initialLocale='es'
          initialTranslations={defaultTranslations}
        >
          <Providers>
            <main
              className={cn(
                "h-full bg-background font-sans antialiased max-w-full min-w-[360px] w-full flex flex-col items-center justify-center overflow-x-hidden",
                inter.className
              )}
            >
                <ReactQueryProvider>
                  {children}
                  <Toaster />
                </ReactQueryProvider>
                <Analytics />
                <SpeedInsights />
            </main>
          </Providers>
        </TranslationsProvider>
      </body>
    </html>
  );
}
