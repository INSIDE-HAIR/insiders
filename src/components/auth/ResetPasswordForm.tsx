"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { ResetSchema } from "@/src/lib/types/zod-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import FormError from "@/src/components/share/MessageErrorBox";
import FormSuccess from "@/src/components/share/MessageSuccessBox";
import LoadingButton from "@/src/components/share/LoadingButton";
import { reset } from "@/src/lib/server-actions/auth/user/password/reset-password";

type Props = {
  email?: string | null | undefined;
};

const ResetPasswordForm = (props: Props) => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>("");
  const [successMessage, setSuccessMessage] = useState<string | undefined>("");

  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: { email: props.email || "" },
  });

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    // reset states
    setErrorMessage("");
    setSuccessMessage("");

    // console.log(values);
    startTransition(() => {
      reset(values).then((data) => {
        if (data?.error) setErrorMessage(data.error);
        if (data?.success) setSuccessMessage(data.success);
      });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="johs.doe@example.com"
                    type="email"
                    disabled={(props?.email && true) || isPending}
                    value={props?.email || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormError message={errorMessage} />
        <FormSuccess message={successMessage} />
        <LoadingButton
          type="submit"
          className="w-full relative"
          isLoading={isPending}
        >
          Enviar email de recuperación
        </LoadingButton>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
