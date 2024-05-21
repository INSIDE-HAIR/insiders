"use client";

import React from "react";
import { Button } from "../ui/buttons/chadcn-button";
import { logout } from "@/src/server-actions/auth/logout";
import { LogOutIcon } from "lucide-react";

type Props = {};

const LogoutButton = (props: Props) => {
  return (
    <div>
      <Button onClick={async () => await logout()}>
        <LogOutIcon className="h-4 w-4 mr-2 max-w-full" />
        Cerrar sesión
      </Button>
    </div>
  );
};

export default LogoutButton;
