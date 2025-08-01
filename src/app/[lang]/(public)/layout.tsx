import type React from "react";
import PublicHeader from "@/src/app/[lang]/(public)/_components/public-header";
import Footer from "@/src/app/[lang]/(public)/_components/footer";
// The SubNavbar is specific to the homepage, so it's rendered in app/(public)/page.tsx

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
