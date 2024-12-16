import React from "react";
import { Icons } from "@/src/components/icons";
import { Button } from "@/src/components/ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/src/lib/routes";
import { signIn } from "next-auth/react";

export default function ProvidersButtons() {
  const onClick = (provider: "google" | "github") => {
    signIn(provider, {
      callbackUrl: DEFAULT_LOGIN_REDIRECT,
    });
  };

  return (
    <div className="grid grid-cols-2 gap-2 first:gap-0 w-full">
      <Button
        variant="outline"
        type="button"
        className="w-full"
        onClick={() => onClick("github")}
      >
        <Icons.GitHubIcon className="mr-2 h-4 w-4" />
        GitHub
      </Button>{" "}
      <Button
        variant="outline"
        type="button"
        className="w-full"
        onClick={() => onClick("google")}
      >
        <Icons.GoogleIcon className="mr-2 h-4 w-4" />
        Google
      </Button>{" "}
    </div>
  );
}
