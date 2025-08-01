import type React from "react";
import PublicHeader from "@/src/app/[lang]/(public)/_components/public-header";
import Footer from "@/src/app/[lang]/(public)/_components/footer";
import TailwindGrid from "@/src/components/shared/grid/TailwindGrid";
// The SubNavbar is specific to the homepage, so it's rendered in app/(public)/page.tsx

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TailwindGrid fullSize>
      <PublicHeader />
      < >
        <main className='col-span-full'>{children}</main>
      </>
      <Footer />
    </TailwindGrid>
  );
}
