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
import Image from "next/image";
import Link from "next/link";

type Props = {};

const MyAccountButton = (props: Props) => {
  const { data: session } = useSession();
  const router = useRouter();

  // Si no hay sesión, no mostrar el botón
  if (!session?.user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className=''>
        <Avatar className='w-8 h-8 rounded-none'>
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
        <DropdownMenuItem asChild>
          <Link href='/profile' className='flex items-center cursor-pointer'>
            <User className='mr-2 h-4 w-4' />
            Mi Perfil
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href='/admin/dashboard'
            className='flex items-center cursor-pointer'
          >
            <LayoutGrid className='mr-2 h-4 w-4' />
            Dashboard
          </Link>
        </DropdownMenuItem>

        {session?.user?.role === "ADMIN" && (
          <DropdownMenuItem onClick={() => router.push("/admin/users")}>
            <Users className='mr-2 h-4 w-4' />
            <span>Usuarios</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className='mr-2 h-4 w-4' />
          <span>Configuración</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={async () => {
            await logout();
          }}
        >
          <ExitIcon className='w-4 h-4 mr-2' />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MyAccountButton;
