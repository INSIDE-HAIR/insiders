"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import EmailProvider from "@/components/auth/providers/email-provider";
import GithubProvider from "@/components/auth/providers/github-provider";
import GoogleProvider from "@/components/auth/providers/google-provider";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: "login" | "register";
}

export function AuthForm({ className, ...props }: AuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { action } = props;
  const onClick = (provider: "google" | "github") => {
    signIn(provider, {
      callbackUrl: DEFAULT_LOGIN_REDIRECT,
    });
  };

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <EmailProvider action={action} />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">O</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 first:gap-0 w-full">
        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={() => onClick("github")}
        >
          <Icons.gitHub className="mr-2 h-4 w-4" />
          GitHub
        </Button>{" "}
        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={() => onClick("google")}
        >
          <Icons.google className="mr-2 h-4 w-4" />
          Google
        </Button>{" "}      </div>
    </div>
  );
}