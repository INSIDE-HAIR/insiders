import "./globals.css";
import { cn, inter } from "@/src/lib/utils/utils";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning={true} className={cn("bg-background font-sans antialiased", inter.className)}>
        {children}
      </body>
    </html>
  );
}
