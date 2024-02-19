import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import { dbMongo } from "@/prisma";
interface RootLayoutProps {
  children: ReactNode;
}

export const fontSans = FontSans({
  subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Plataforma de Insiders",
  description: "Creado por www.insidesalons.com",
};

export default async function RootLayout(props: RootLayoutProps) {
  const { children } = props;
  // const user = await dbMongo.user.findMany();

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
