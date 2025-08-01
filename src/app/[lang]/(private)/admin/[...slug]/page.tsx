"use client";
import DynamicAdminPage from "@/src/components/admin/DynamicAdminPage";
import { useSession } from "next-auth/react";

export default function DynamicPage() {
  const { data: session } = useSession();
  
  // Get user role from session, default to 'admin'
  const userRole = (session?.user as any)?.role || 'admin';
  
  // You could also get team from user preferences, session, or props
  const team = 'gestion'; // This could be dynamic based on user/session

  return (
    <DynamicAdminPage 
      userRole={userRole}
      team={team}
    />
  );
}
