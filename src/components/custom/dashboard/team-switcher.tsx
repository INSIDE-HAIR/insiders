"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, LucideIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/src/components/ui/sidebar";

import type { Team } from "@/src/types";
import { IconType } from "react-icons";
import { Icons } from "@/src/components/shared/icons";

interface TeamSwitcherProps {
  teams: {
    name: string;
    logo: LucideIcon | IconType;
    plan: string;
    routes: {
      id: string;
      icon: string;
      path: string;
      translations: {
        en: string;
        es: string;
      };
    }[];
  }[];
  onTeamChange?: (teamName: string) => void;
}

export function TeamSwitcher({ teams, onTeamChange }: TeamSwitcherProps) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);

  // Ejemplo de cómo configurar los equipos con logos:
  // const teams = [
  //   {
  //     name: "Equipo 1",
  //     logo: Icons.TeamLogo1, // Users icon
  //     plan: "Pro",
  //     routes: []
  //   },
  //   {
  //     name: "Equipo 2",
  //     logo: Icons.TeamLogo2, // Building icon
  //     plan: "Basic",
  //     routes: []
  //   }
  // ];

  const handleTeamChange = (team: (typeof teams)[0]) => {
    setActiveTeam(team);
    onTeamChange?.(team.name);
  };

  // Verificar que activeTeam existe
  if (!activeTeam || !teams.length) {
    return null;
  }

  return (
    <SidebarMenu className=''>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='px-0 py-2 h-14 lg:h-[60px] bg-primary hover:transition-none hover:delay-0 text-black transition-transform duration-300 delay-300 ease-in-out data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[state=expanded]:bg-black group-data-[state=expanded]:text-white group-data-[state=collapsed]:bg-primary group-data-[state=collapsed]:text-black hover:bg-primary/90 hover:text-background'
            >
              <div className='flex aspect-square max-w-full  max-h-full size-6  items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                {React.createElement(activeTeam.logo, { className: 'size-4' })}
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {activeTeam.name}
                </span>
                <span className='truncate text-xs'>{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className='ml-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => handleTeamChange(team)}
                className='gap-2 p-2'
              >
                <div className='flex size-6 items-center justify-center rounded-sm border'>
                  {React.createElement(team.logo, { className: 'size-4 shrink-0' })}
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className='gap-2 p-2'>
              <div className='flex size-6 items-center justify-center rounded-md border bg-background'>
                <Plus className='size-4' />
              </div>
              <div className='font-medium text-muted-foreground'>Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
