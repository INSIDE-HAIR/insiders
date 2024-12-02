import React, { ReactNode } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../../../ui/card";
import Header from "./auth-card-header";
import GoBackButton from "../../../share/go-back-button";

type Props = {
  children: ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
};

const AuthCardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial,
}: Props) => {
  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader>
        <Header label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && <CardFooter></CardFooter>}
      <CardFooter>
        <GoBackButton label={backButtonLabel} href={backButtonHref} />
      </CardFooter>
    </Card>
  );
};

export default AuthCardWrapper;
