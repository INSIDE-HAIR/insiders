"use client";

import { PanelLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useSidebar } from "@/src/components/ui/sidebar";

export function SidebarToggle() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={toggleSidebar}
      className='fixed z-20 left-4 bottom-4 bg-[#CEFF66] hover:bg-[#bfef33] text-zinc-900 shadow-lg rounded-full h-12 w-12 flex items-center justify-center md:hidden'
      title='Mostrar panel lateral'
    >
      <PanelLeft className='h-5 w-5' />
    </Button>
  );
}
