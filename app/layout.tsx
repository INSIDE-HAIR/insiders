import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Plataforma de Insiders",
  description: "Creado por www.insidesalons.com",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className=''>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
