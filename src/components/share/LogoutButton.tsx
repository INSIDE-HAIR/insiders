"use client";

import React from "react";
import { Button } from "../ui/buttons/chadcn-button";
import  {logout} from "@/actions/logout"

type Props = {};

const LogoutButton = (props: Props) => {
  return (
    <div>
      <Button onClick={async () => await logout()}>Sign out</Button>
    </div>
  );
};

export default LogoutButton;
