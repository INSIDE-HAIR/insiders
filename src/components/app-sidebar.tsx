"use client";

import * as React from "react";
import { NavMain } from "@/src/components/nav-main";
import { NavUser } from "@/src/components/nav-user";
import { TeamSwitcher } from "@/src/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/src/components/ui/sidebar";
import { LucideIcon } from "lucide-react";
import type { NavItem, User, Team } from "@/src/types";
import { IconType } from "react-icons";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navMain?: NavItem[];
  user?: User;
  teams?: {
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

export function AppSidebar({
  navMain,
  user,
  teams,
  onTeamChange,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        {teams && <TeamSwitcher teams={teams} onTeamChange={onTeamChange} />}
      </SidebarHeader>
      <SidebarContent>{navMain && <NavMain items={navMain} />}</SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
