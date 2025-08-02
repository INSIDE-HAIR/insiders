"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../../../components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { AvatarIcon, ExitIcon } from "@radix-ui/react-icons";
import { FaRegUser } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { Settings, Users, LayoutGrid, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { logout } from "@/src/lib/actions/auth/user/login/logout";
import { Icons } from "@/src/components/shared/icons";
import Image from "next/image";
import Link from "next/link";

import userMenuData from "@/src/routes/user-menu-routes.json";

type Props = {};

type UserMenuRoute = {
  id: string;
  label: string;
  href: string | null;
  icon: string;
  requiredRoles: string[];
  type: "link" | "action" | "logout";
  separator?: boolean;
};

const userMenuRoutes = userMenuData.userMenuRoutes as UserMenuRoute[];

const MyAccountButton = (props: Props) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);

  // Si no hay sesión, no mostrar el botón
  if (!session?.user) {
    return null;
  }

  // Función para verificar si el usuario tiene permisos para una ruta
  const hasPermission = (requiredRoles: string[]) => {
    const userRole = session?.user?.role?.toLowerCase() || 'user';
    return requiredRoles.includes(userRole);
  };

  // Función para obtener el icono
  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as any;
    return IconComponent ? <IconComponent className='w-4 h-4 mr-2 inline' /> : null;
  };

  // Función para manejar clicks
  const handleItemClick = async (route: UserMenuRoute) => {
    if (route.type === 'logout') {
      await logout();
    } else if (route.type === 'action' && route.href) {
      router.push(route.href);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="relative"
      >
        <DropdownMenuTrigger className=''>
          <Avatar className='w-8 h-8 rounded-none hover:bg-primary'>
            <AvatarImage
              src={session?.user?.image || undefined}
              alt={session?.user?.name || "Usuario"}
            />
            <AvatarFallback className='bg-primary text-primary-foreground text-xs font-medium rounded-none'>
              {session?.user?.name?.charAt(0) ||
                session?.user?.email?.charAt(0) ||
                "U"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-48' align='end'>
          {userMenuRoutes
            .filter(route => hasPermission(route.requiredRoles))
            .map((route) => {
              if (route.type === 'link') {
                return (
                  <DropdownMenuItem key={route.id} asChild className='focus:bg-primary'>
                    <Link 
                      href={route.href!} 
                      className='block w-full px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer'
                    >
                      {getIcon(route.icon)}
                      {route.label}
                    </Link>
                  </DropdownMenuItem>
                );
              } else {
                return (
                  <DropdownMenuItem 
                    key={route.id}
                    onClick={() => handleItemClick(route)}
                    className='focus:bg-primary'
                  >
                    <div className='block w-full px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer'>
                      {getIcon(route.icon)}
                      <span>{route.label}</span>
                    </div>
                  </DropdownMenuItem>
                );
              }
            })}
        </DropdownMenuContent>
      </div>
    </DropdownMenu>
  );
};

export default MyAccountButton;
