"use client";
import React from "react";
import { Button } from "../../../ui/button";
import { logout } from "@/src/lib/actions/auth/user/login/logout";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();

  return (
    <div>
      <Button
        className="hover:text-zinc-900 text-primary bg-zinc-900 hover:bg-primary border-none rounded-none"
        onClick={async () => {
          await logout();
          await router.push("/auth/login");
        }}
      >
        <LogOutIcon className="h-4 w-4 mr-2 max-w-full" />
        Cerrar sesión
      </Button>
    </div>
  );
};

export default LogoutButton;
