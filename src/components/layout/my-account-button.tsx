"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { AvatarIcon, ExitIcon } from "@radix-ui/react-icons";
import { FaRegUser } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { Settings, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { logout } from "@/src/lib/actions/auth/user/login/logout";

type Props = {};

const MyAccountButton = (props: Props) => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="">
        <Avatar>
          <AvatarImage src={session?.user?.image || ""} />
          
          <AvatarFallback className="group transition-all duration-300 bg-zinc-900 dark:bg-zinc-500 hover:bg-zinc-600 rounded-full dark:hover:bg-zinc-700 border-none dark:border-none w-8 h-8 m-auto">
            <FaRegUser className="text-white dark:text-zinc-900 transition-all text-sm" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        {session?.user.role === "ADMIN" && (
          <DropdownMenuItem onClick={() => router.push("/admin/users")}>
            <Users className="mr-2 h-4 w-4" />
            <span>Users</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={async () => {
            await logout();
          }}
        >
          <ExitIcon className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MyAccountButton;
