"use client";

import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/src/components/ui/toggle-group";
import { Crown, User } from "lucide-react";

interface ViewModeSelectorProps {
  mode: "admin" | "client";
  onChange: (mode: "admin" | "client") => void;
}

export default function ViewModeSelector({
  mode,
  onChange,
}: ViewModeSelectorProps) {
  return (
    <div className='w-full bg-zinc-900 py-2 px-4 flex items-center justify-between border-b border-zinc-800'>
      <div className='flex items-center'>
        <span className='text-sm font-medium mr-3 text-white'>
          Modo de visualización:
        </span>
        <ToggleGroup
          type='single'
          value={mode}
          onValueChange={(value: string) =>
            value && onChange(value as "admin" | "client")
          }
          className='bg-zinc-800  shadow-md'
        >
          <ToggleGroupItem
            value='admin'
            aria-label='Modo administrador'
            className='data-[state=on]:bg-zinc-700 text-white data-[state=on]:text-inside hover:bg-zinc-700 hover:text-inside'
          >
            <Crown className='h-4 w-4 mr-2' />
            <span>Administrador</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value='client'
            aria-label='Modo cliente'
            className='data-[state=on]:bg-zinc-700 text-white data-[state=on]:text-inside hover:bg-zinc-700 hover:text-inside'
          >
            <User className='h-4 w-4 mr-2' />
            <span>Cliente</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>


        <div className='flex items-center'>
          <span className='bg-inside text-zinc-800 text-xs font-medium px-2.5 py-0.5  border border-zinc-700 '>
            {mode === "admin" ? "Vista de administrador" : "Vista de cliente"}
          </span>
        </div>
    </div>
  );
}
