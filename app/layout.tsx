import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Plataforma de Insiders",
  description: "Creado por www.insidesalons.com",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout(props: RootLayoutProps) {
  const { children } = props;

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>{children}</body>

    </html>
  );
}
