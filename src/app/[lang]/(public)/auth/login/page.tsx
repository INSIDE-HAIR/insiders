import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/src/lib/utils/utils";
import { AuthForm } from "../../../../../components/custom/auth/forms/auth-form";
import { buttonVariants } from "@/src/components/ui/button";

export const metadata: Metadata = {
  title: "Insiders - Login Page",
  description: "Login page for the application.",
};

export default function LoginPage() {
  return (
    <>
      <div className="md:hidden">
        {/* <Image
          src="/examples/authentication-light.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="block dark:hidden"
        />
        <Image
          src="/examples/authentication-dark.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="hidden dark:block"
        /> */}
      </div>
      <div className="container relative hidden min-h-[800px] h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/auth/register"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute right-4 top-4 md:right-8 md:top-8"
          )}
        >
          ¿Quiéres crear una cuenta? Registrate
        </Link>
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            INSIDERS <small className="text-xs ml-1">by INSIDE HAIR</small>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Impulsamos tu negocio atraves de nuestros servicios de
                formación, consultoría y marketing enfocados en generar un alto
                impacto en salones de peluquerías.&rdquo;
              </p>
              <footer className="text-sm">Pablo Sánchez</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Iniciar sesión
              </h1>
              <p className="text-sm text-muted-foreground">
                Ingresa los datos de tu cuenta para continuar
              </p>
            </div>
            <AuthForm action="login" />
          </div>
        </div>
      </div>
    </>
  );
}
