import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/src/lib/utils/utils";
import { AuthForm } from "../../../../../components/custom/auth/forms/auth-form";
import { GalleryVerticalEnd } from "lucide-react";

export const metadata: Metadata = {
  title: "Insiders - Login Page",
  description: "Login page for the application.",
};

export default function LoginPage() {
  return (
    <div className='grid min-h-svh lg:grid-cols-2 w-full'>
      {/* Left side - Login Form */}
      <div className='flex flex-col gap-4 p-6 md:p-10'>
        <div className='flex justify-center gap-2 md:justify-start'>
          <Link href='/' className='flex items-center gap-2 font-medium'>
            <div className='bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md'>
              <GalleryVerticalEnd className='size-4' />
            </div>
            INSIDERS <small className='text-xs ml-1'>by INSIDE HAIR</small>
          </Link>
        </div>

        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-xs'>
            <div className='flex flex-col items-center gap-2 text-center mb-6'>
              <h1 className='text-2xl font-bold'>Iniciar sesión</h1>
              <p className='text-muted-foreground text-sm text-balance'>
                Ingresa los datos de tu cuenta para continuar
              </p>
            </div>
            <AuthForm action='login' />

            <div className='text-center text-sm mt-6'>
              ¿No tienes una cuenta?{" "}
              <Link
                href='/auth/register'
                className='underline underline-offset-4 hover:text-primary'
              >
                Regístrate
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Background Image */}
      <div className='bg-muted relative hidden lg:block'>
        <Image
          src='/placeholder.svg'
          alt='Insiders Background'
          className='absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale'
          width={800}
          height={600}
        />
        <div className='absolute inset-0 bg-black/20' />
        <div className='absolute inset-0 flex flex-col justify-end p-10 text-white'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;Impulsamos tu negocio a través de nuestros servicios de
              formación, consultoría y marketing enfocados en generar un alto
              impacto en salones de peluquerías.&rdquo;
            </p>
            <footer className='text-sm font-medium'>Pablo Sánchez</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
