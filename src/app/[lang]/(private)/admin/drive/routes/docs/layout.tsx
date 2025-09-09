"use client";

import { ReactNode } from "react";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import TailwindGrid from "@/src/components/shared/grid/TailwindGrid";
import { DocsNavigationSidebar } from "@/src/components/drive/docs/docs-navigation-sidebar";

interface DocsLayoutProps {
  children: ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <TailwindGrid fullSize padding='' className='z-0'>
      <div className='z-0 col-start-1 max-w-full w-full col-end-full md:col-start-1  lg:col-start-1 lg:col-end-13  order-2 md:order-1 col-span-full'>
        <div className=' flex-1 px-4 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)]  lg:grid-cols-[280px_minmax(0,1fr)] '>
          <aside className=' fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block'>
            <ScrollArea className='h-full py-6  lg:py-8'>
              <DocsNavigationSidebar />
            </ScrollArea>
          </aside>
          <main className='flex w-full flex-col overflow-hidden'>
            <div className='flex-1 space-y-4 '>{children}</div>
          </main>
        </div>
      </div>
    </TailwindGrid>
  );
}
