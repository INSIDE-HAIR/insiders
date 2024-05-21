"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import FormError from "@/src/components/share/MessageErrorBox";
import FormSuccess from "@/src/components/share/MessageSuccessBox";
import { Switch } from "@/src/components/ui/switch";
import { updateUser } from "@/src/lib/server-actions/server-actions";
import LoadingButton from "../share/LoadingButton";
import { UserSchema } from "@/src/lib/types/inside-schemas";
import { UpdateUser } from "@/src/next-auth";
import Image from "next/image";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";

type Props = {
  user: UpdateUser;
};

const UpdateUserForm = ({ user }: Props) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<z.infer<typeof UserSchema>>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      id: user?.id || undefined,
      name: user?.name || undefined,
      isTwoFactorEnabled: user?.isTwoFactorEnabled || undefined,
      lastName: user?.lastName || null,
      email: user?.email || undefined,
      emailVerified: user?.emailVerified ? new Date(user.emailVerified) : null,
      image: user?.image || null,
      contactNumber: user?.contactNumber || null,
      terms: user?.terms || undefined,
      role: user?.role || undefined,
      holdedId: user?.holdedId || null,
      createdAt: user?.createdAt ? new Date(user.createdAt) : undefined,
      updatedAt: user?.updatedAt ? new Date(user.updatedAt) : undefined,
      lastLogin: user?.lastLogin ? new Date(user.lastLogin) : undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof UserSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      updateUser(values)
        .then((data) => {
          if (data?.error) {
            setError(data.error);
          }
          if (data?.success) {
            setSuccess(data.success);
          }
        })
        .catch((err) => setError(`Something went wrong: ${err.message}`));
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col items-center space-y-4">
          {/* Image */}
          <Image
            src={user?.image || "/default-profile.png"}
            alt="Profile Image"
            width={96}
            height={96}
            className="rounded-full"
          />
          {/* Role */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-x-1">
                  Role
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    disabled
                    placeholder="Role"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <fieldset className="space-y-4">
          <legend className="text-lg font-medium">Personal Information</legend>
          <div className="flex space-x-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-x-1">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      disabled={isPending}
                      placeholder="John"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Last Name */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-x-1">
                    Last Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      disabled={isPending}
                      placeholder="Doe"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-medium">
            Informacion de Contacto
          </legend>
          <div className="flex space-x-4">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-x-1">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      disabled
                      type="email"
                      placeholder="john.doe@gmail.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Contact Number */}
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-x-1">
                    Telefono
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      disabled={isPending}
                      placeholder="+1234567890"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-medium">Fechas de Interés</legend>
          <div className="flex space-x-4">
            {/* Email Verified */}
            <FormField
              control={form.control}
              name="emailVerified"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-x-1">
                    Email Verified
                    {user.emailVerified ? (
                      <CheckCircleIcon className="text-green-500 w-3 h-3" />
                    ) : (
                      <XCircleIcon className="text-red-500" />
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().substring(0, 10)
                          : ""
                      }
                      disabled
                      type="date"
                      placeholder="Email Verified"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Last Connection */}
            <FormField
              control={form.control}
              name="lastLogin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-x-1">
                    Last Connection
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().substring(0, 10)
                          : ""
                      }
                      disabled
                      type="date"
                      placeholder="Last Connection"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex space-x-4">
            {/* Created At */}
            <FormField
              control={form.control}
              name="createdAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-x-1">
                    Created At
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().substring(0, 10)
                          : ""
                      }
                      disabled
                      type="date"
                      placeholder="Created At"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Updated At */}
            <FormField
              control={form.control}
              name="updatedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-x-1">
                    Updated At
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().substring(0, 10)
                          : ""
                      }
                      disabled
                      type="date"
                      placeholder="Updated At"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>

        {/* Terms */}
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-x-1">
                Acuerdos & Condiciones aceptados:
              </FormLabel>
              <FormControl>
                <div className="flex items-center gap-x-2 text-xs">
                  <p>No</p>
                  <Switch
                    disabled
                    checked={field.value || true}
                    onCheckedChange={field.onChange}
                  />
                  <p>Si</p>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {user?.isOAuth === false && (
          <FormField
            control={form.control}
            name="isTwoFactorEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="flex items-center gap-x-1">
                    Two Factor Authentication
                  </FormLabel>
                </div>
                <FormControl>
                  <Switch
                    disabled={isPending}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <FormError message={error} />
        <FormSuccess message={success} />
        <LoadingButton type="submit" isLoading={isPending} className="w-full">
          Save
        </LoadingButton>
      </form>
    </Form>
  );
};

export default UpdateUserForm;
