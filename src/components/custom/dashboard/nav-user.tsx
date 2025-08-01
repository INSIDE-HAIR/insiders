"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/src/components/ui/sidebar";
import Image from "next/image";

interface NavUserProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const fallbackImage =
    "https://lh3.googleusercontent.com/d/1C2OO4r3kGDhvEp-yw-cS9vRiSiVBZpae";
  const userInitials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/auth/login",
      redirect: true,
    });
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage
                  src={user.image || fallbackImage}
                  alt={user.name || "User"}
                />
                <AvatarFallback className='rounded-lg'>
                  <Image
                    src={fallbackImage}
                    width={32}
                    height={32}
                    alt='Avatar'
                    className='w-full h-full object-cover rounded-lg'
                  />
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {user.name || "Usuario"}
                </span>
                <span className='truncate text-xs'>
                  {user.email || "Sin email"}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? "bottom" : "right"}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage
                    src={user.image || fallbackImage}
                    alt={user.name || "User"}
                  />
                  <AvatarFallback className='rounded-lg'>
                    <img
                      src={fallbackImage}
                      alt='Avatar'
                      className='w-full h-full object-cover rounded-lg'
                    />
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>
                    {user.name || "Usuario"}
                  </span>
                  <span className='truncate text-xs'>
                    {user.email || "Sin email"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={handleProfileClick}
                className='cursor-pointer'
              >
                <UserIcon className='mr-2 h-4 w-4' />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer'>
                <BadgeCheck className='mr-2 h-4 w-4' />
                Cuenta
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer'>
                <Bell className='mr-2 h-4 w-4' />
                Notificaciones
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className='cursor-pointer text-red-600 focus:text-red-600'
            >
              <LogOut className='mr-2 h-4 w-4' />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
