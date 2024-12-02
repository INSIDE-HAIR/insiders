"use client";
import * as React from "react";
import { cn } from "@/src/lib/utils/utils";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import ForgotPasswordButton from "../buttons/forgot-password-button";
import ProvidersButtons from "../buttons/providers-buttons";

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  action: "login" | "register";
}

export function AuthForm({ className, action, ...props }: AuthFormProps) {
  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {action === "login" ? <LoginForm /> : <RegisterForm />}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">O</span>
        </div>
      </div>

      <ProvidersButtons />

      {action === "login" && (
        <div className="text-center mt-2">
          <ForgotPasswordButton />
        </div>
      )}
    </div>
  );
}
