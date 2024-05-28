"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useTransition, useEffect } from "react";
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
import { updateUser } from "@/src/lib/server-actions/auth/user/settings/update-settings";
import LoadingButton from "../share/LoadingButton";
import { UserSchema } from "@/src/lib/types/inside-schemas";
import Image from "next/image";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import ModalResetPassword from "../modals/modal-reset-password";
import ModalHoldedSync from "../modals/holded-sync/modal-holded-sync";
import { useHolded } from "@/src/components/providers/HoldedProvider";
import { User } from "@prisma/client";

type Props = {
  user: User;
};

export default function UpdateUserForm({ user }: Props) {
  const { holdedId, insidersId, setHoldedId, setInsidersId } = useHolded();
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
      holdedId: user?.holdedId || "",
      createdAt: user?.createdAt ? new Date(user.createdAt) : undefined,
      updatedAt: user?.updatedAt ? new Date(user.updatedAt) : undefined,
      lastLogin: user?.lastLogin ? new Date(user.lastLogin) : undefined,
    },
  });

  useEffect(() => {
    setHoldedId(user?.holdedId || "");
    setInsidersId(user?.id || "");
  }, [user, setHoldedId, setInsidersId]);

  useEffect(() => {
    form.setValue("holdedId", holdedId || "");
  }, [holdedId, form]);

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
            setHoldedId(values.holdedId); // Update context when form is submitted
          }
        })
        .catch((err) => setError(`Something went wrong: ${err.message}`));
    });
  };

  return (
    <>
      <Form {...form}>
        <form
          className="space-y-6 w-full flex flex-col justify-center items-center py-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex flex-col items-center space-y-4 w-full">
            {/* Image */}
            <Image
              src={user?.image || "/default-profile.png"}
              alt="Profile Image"
              width={96}
              height={96}
              className="rounded-full"
            />
          </div>
          <hr className="w-full border-t-2 border-gray-200" />

          <ContactInfoSection form={form} user={user} isPending={isPending} />
          <hr className="w-full border-t-2 border-gray-200" />

          <DateSection form={form} user={user} isPending={isPending} />
          <hr className="w-full border-t-2 border-gray-200" />

          <InsidersSection form={form} user={user} isPending={isPending} />
          <hr className="w-full border-t-2 border-gray-200" />

          <LegalAgreementsSection
            form={form}
            user={user}
            isPending={isPending}
          />
          {/*  // TODO: Implement Two Factor Authentication
          {user?.isOAuth === false && (
            <TwoFactorSection form={form} user={user} isPending={isPending} />
          )} */}

          <FormError message={error} />
          <FormSuccess message={success} />
          <LoadingButton type="submit" isLoading={isPending} className="w-full">
            Guardar
          </LoadingButton>
        </form>
      </Form>
    </>
  );
}

const ContactInfoSection = ({
  form,
  user,
  isPending,
}: {
  form: ReturnType<typeof useForm<z.infer<typeof UserSchema>>>;
  user: User;
  isPending: boolean;
}) => {
  return (
    <fieldset className="space-y-4 w-full">
      <legend className="font-bold">Informacion de Contacto</legend>
      <div className="flex flex-wrap gap-x-2 gap-y-4">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-x-1 text-tiny">
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
              <FormLabel className="flex items-center gap-x-1 text-tiny">
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
        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-x-1 text-tiny">
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
              <FormLabel className="flex items-center gap-x-1 text-tiny">
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
  );
};
const DateSection = ({
  form,
  user,
  isPending,
}: {
  form: ReturnType<typeof useForm<z.infer<typeof UserSchema>>>;
  user: User;
  isPending: boolean;
}) => (
  <fieldset className="space-y-4 w-full">
    <legend className="font-bold">Fechas de Interés</legend>
    <div className="flex flex-wrap gap-x-2 gap-y-4">
      {/* Email Verified */}
      <FormField
        control={form.control}
        name="emailVerified"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-x-1 text-tiny">
              Verificación de Email:
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
            <FormLabel className="flex items-center gap-x-1 text-tiny">
              Última Conexión:
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
                placeholder="Last Login"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Created At */}
      <FormField
        control={form.control}
        name="createdAt"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-x-1 text-tiny">
              Creación del contacto:
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
            <FormLabel className="flex items-center gap-x-1 text-tiny">
              Fecha de Actualización:
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
);

const InsidersSection = ({
  form,
  user,
  isPending,
}: {
  form: ReturnType<typeof useForm<z.infer<typeof UserSchema>>>;
  user: User;
  isPending: boolean;
}) => {
  const { setHoldedId } = useHolded();
  return (
    <fieldset className="space-y-4 w-full">
      <legend className="font-bold">INSIDERS:</legend>
      <div className="flex flex-wrap gap-x-2 gap-y-4">
        {/* Role */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-x-1 text-tiny">
                Nivel de Acceso:
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
        {/* ID INSIDERS */}
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-x-1 text-tiny">
                ID:
              </FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* ID Holded */}
        <FormField
          control={form.control}
          name="holdedId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-x-1 text-tiny">
                ID de Holded:
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  disabled={isPending}
                  onChange={(e) => {
                    field.onChange(e);
                    setHoldedId(e.target.value);
                  }}
                  placeholder="Holded ID"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-x-2 gap-y-2">
          <FormLabel className="flex items-center gap-x-1 text-tiny">
            Acciones:
          </FormLabel>
          <div className="flex flex-wrap gap-x-2 gap-y-4">
            <ModalHoldedSync holdedId={user?.holdedId} insidersId={user?.id} />
            <ModalResetPassword email={user?.email} />
          </div>
        </div>
      </div>
    </fieldset>
  );
};

const LegalAgreementsSection = ({
  form,
  user,
  isPending,
}: {
  form: ReturnType<typeof useForm<z.infer<typeof UserSchema>>>;
  user: User;
  isPending: boolean;
}) => (
  <fieldset className="space-y-4 w-full">
    <legend className="font-bold">Acuerdos legales:</legend>
    <div className="flex flex-wrap gap-x-2 gap-y-4">
      {/* Terms */}
      <FormField
        control={form.control}
        name="terms"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-x-1 text-tiny">
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
    </div>
  </fieldset>
);

const TwoFactorSection = ({
  form,
  user,
  isPending,
}: {
  form: ReturnType<typeof useForm<z.infer<typeof UserSchema>>>;
  user: User;
  isPending: boolean;
}) => (
  <FormField
    control={form.control}
    name="isTwoFactorEnabled"
    render={({ field }) => (
      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
        <div className="space-y-0.5">
          <FormLabel className="flex items-center gap-x-1 text-tiny">
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
);
