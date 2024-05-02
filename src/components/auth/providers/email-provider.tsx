"use client";
import React from "react";
import { Icons } from "../../icons";
import { LoginButton } from "../login-button";
import { Input } from "../../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, RegisterSchema } from "@/src/schemas/index";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import * as z from "zod";
import { login } from "@/actions/auth/login";
import { register } from "@/actions/auth/register";
import { useTransition } from "react";
import { Button } from "../../ui/buttons/chadcn-button";
import { FormError } from "../../messages/form-error";
import { FormSuccess } from "../../messages/form-success";

type EmailProviderProps = {
  action?: "login" | "register";
};

export default function EmailProvider({
  action = "login",
}: EmailProviderProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | undefined>("");
  const [success, setSuccess] = React.useState<string | undefined>("");

  const registerForm = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      lastName: "",
      contactNumber: "+34000000000",
      terms: true,
    },
  });

  const registerOnSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      register(values).then((data) => {
        setSuccess(data.success);
        setError(data.error);
      });
    });
  };

  const loginForm = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginOnSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      login(values).then((data) => {
        setError(data?.error);
        // setSuccess(data?.success);
      });
    });
  };

  if (action === "register") {
    return (
      <Form {...registerForm}>
        <form
          className=""
          onSubmit={registerForm.handleSubmit(registerOnSubmit)}
        >
          <div className="grid gap-y-4">
            <div className="grid gap-1">
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="nombre@ejemplo.com"
                          type="email"
                          autoCapitalize="none"
                          autoComplete="email"
                          autoCorrect="off"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <div className="grid gap-x-2 grid-cols-2">
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-col mt-2">
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="******"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="password"
                            autoCorrect="off"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-col mt-2">
                        <FormLabel>Confirmar contraseña</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="******"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="password"
                            autoCorrect="off"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div className="grid gap-x-2 grid-cols-2">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-col mt-2">
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Nombre"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="name"
                            autoCorrect="off"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={registerForm.control}
                  name="lastName"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-col mt-2">
                        <FormLabel>Apellido</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Apellido"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="name"
                            autoCorrect="off"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <FormField
                control={registerForm.control}
                name="contactNumber"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel>Número de contacto</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="+34000000000"
                          type="tel"
                          autoCapitalize="none"
                          autoComplete="tel"
                          autoCorrect="off"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
            <Button disabled={isPending} className="w-full">
              {isPending && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Registrate con correo
            </Button>
            <FormError message={error} />
            <FormSuccess message={success} />
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Form {...loginForm}>
      <form className="" onSubmit={loginForm.handleSubmit(loginOnSubmit)}>
        <div className="grid gap-y-4">
          <div className="grid gap-1">
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-col mt-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="nombre@ejemplo.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-col mt-2">
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="******"
                        type="password"
                        autoCapitalize="none"
                        autoComplete="password"
                        autoCorrect="off"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
          <LoginButton>
            <Button disabled={isPending} className="w-full">
              {isPending && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Inicia sesión con correo
            </Button>
            <FormError message={error} />
            <FormSuccess message={success} />
          </LoginButton>
        </div>
      </form>
    </Form>
  );
}
