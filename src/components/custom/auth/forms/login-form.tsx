"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/src/types/general-schemas";
import * as z from "zod";
import { login } from "@/src/lib/actions/auth/user/login/login";
import { useState, useTransition } from "react";
import { Icons } from "../../../shared/icons";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Label } from "../../../ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../../ui/form";
import { FormError } from "../../../shared/messages/form-error";
import { FormSuccess } from "../../../shared/messages/form-success";
import { useRouter } from "next/navigation";
import NonPasswordLogins from "../providers/email-provider";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const router = useRouter();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      login(values).then((data) => {
        setError(data?.error);
      });
    });
  };

  const handleRedirect = () => {
    router.push("/auth/login");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-6'>
        <div className='grid gap-3'>
          <div className='grid gap-3'>
            <Label htmlFor='email'>Email</Label>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      id='email'
                      placeholder='nombre@ejemplo.com'
                      type='email'
                      autoCapitalize='none'
                      autoComplete='email'
                      autoCorrect='off'
                      disabled={isPending}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='grid gap-3'>
            <div className='flex items-center'>
              <Label htmlFor='password'>Contraseña</Label>
              <a
                href='#'
                className='ml-auto text-sm underline-offset-4 hover:underline'
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      id='password'
                      placeholder='******'
                      type='password'
                      autoComplete='current-password'
                      disabled={isPending}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          onClick={handleRedirect}
          disabled={isPending}
          className='w-full'
          type='submit'
        >
          {isPending && (
            <Icons.SpinnerIcon className='mr-2 h-4 w-4 animate-spin' />
          )}
          Iniciar sesión
        </Button>

        <FormError message={error} />
        <FormSuccess message={success} />
      </form>
      <NonPasswordLogins />
    </Form>
  );
}
