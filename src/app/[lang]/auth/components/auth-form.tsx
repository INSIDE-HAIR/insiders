"use client";

import * as React from "react";

import { cn } from "@/src/lib/utils/utils";

import EmailProvider from "@/src/components/auth/providers/email-provider";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/src/lib/routes";
import { Icons } from "@/src/components/icons";
import { Button } from "@/src/components/ui/buttons/chadcn-button";

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: "login" | "register";
}

// Definir la ruta completa usando la variable de entorno
const resetPasswordUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset`;

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
        </Button>{" "}
      </div>
      <div className="text-center mt-2">
        <a
          href={resetPasswordUrl}
          className="text-tiny text-primary hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </div>
  );
}
