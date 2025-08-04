"use client";
import React from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/src/components/ui/sidebar";
import { AppSidebar } from "@/src/components/custom/dashboard/app-sidebar";
import Header from "@/src/app/[lang]/(private)/_components/layout/header";
import { useSidebarData } from "@/src/hooks/useDashboardRoutes";
import { useTranslations } from "@/src/context/TranslationContext";
import { useParams } from "next/navigation";
import { Icons } from "@/src/components/shared/icons";
import { useSession } from "next-auth/react";

interface DashboardProps {
  children?: React.ReactNode;
  userRole?: string;
  initialTeam?: string;
}

function Dashboard({
  children,
  userRole = "admin",
  initialTeam = "gestion",
}: DashboardProps) {
  const params = useParams();
  const locale = (params?.lang as "en" | "es") || "es";
  const [currentTeam, setCurrentTeam] = React.useState(initialTeam);
  const { data: session } = useSession();

  // Map session role to dashboard role format
  const mappedRole = React.useMemo(() => {
    if (session?.user?.role) {
      return session.user.role.toLowerCase();
    }
    return userRole;
  }, [session?.user?.role, userRole]);

  // Use centralized dashboard routes - this will update when currentTeam changes
  const sidebarData = useSidebarData({
    team: currentTeam,
    locale,
    userRole: mappedRole,
  });

  // Add logos to teams
  const teamsWithLogos = sidebarData.teams.map((team, index) => ({
    name: team.name,
    logo:
      [
        Icons.TeamLogo1, // Users
        Icons.TeamLogo2, // Building
        Icons.TeamLogo3, // Briefcase
        Icons.TeamLogo4, // Globe
        Icons.TeamLogo5, // Zap
      ][index % 5] || Icons.TeamLogo1,
    plan: team.plan,
    routes: [],
  }));

  // Update data when team changes
  const handleTeamChange = (teamName: string) => {
    // Map team names to IDs (since we know the structure)
    const teamMap: Record<string, string> = {
      "Equipo de Gestión": "gestion",
      "Management Team": "gestion",
      "Equipo Creativo": "creativos",
      "Creative Team": "creativos",
      "Equipo de Consultoría": "consultoria",
      "Consulting Team": "consultoria",
      "Equipo de Crecimiento": "crecimiento",
      "Growth Team": "crecimiento",
    };

    const teamId = teamMap[teamName] || "gestion";
    setCurrentTeam(teamId);
  };

  // Create user object from session
  const user = session?.user;

  return (
    <SidebarProvider>
      <AppSidebar
        navMain={sidebarData.navMain}
        user={user}
        teams={teamsWithLogos}
        onTeamChange={handleTeamChange}
      />

      <SidebarInset>
        <div className='z-10 flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4 w-full'>
          <SidebarTrigger className='-ml-1' />
          <div className='w-full col-start-1 col-end-full '>
            <Header
              type='admin'
              homeLabel='INSIDERS'
              dropdownSliceEnd={-1}
              separator
            />
          </div>
        </div>
        <div className='flex flex-1 flex-col gap-4'>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Dashboard;
