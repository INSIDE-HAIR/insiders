"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/buttons/chadcn-button";
import FormError from "@/src/components/share/MessageErrorBox";
import FormSuccess from "@/src/components/share/MessageSuccessBox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { HoldedDataDeleteSchema } from "@/src/lib/types/zod-schemas";
import { deleteUser } from "@/src/lib/actions/auth/user/settings/user-delete";
import { useRouter } from "next/navigation";

type DeleteFormValues = z.infer<typeof HoldedDataDeleteSchema>;

const DeleteUserForm = ({ userId }: { userId: string | undefined | null }) => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>("");
  const [successMessage, setSuccessMessage] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<DeleteFormValues>({
    resolver: zodResolver(HoldedDataDeleteSchema),
  });

  const onSubmitHoldedDeleteData = async (data: DeleteFormValues) => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    if (data.confirmation.toLowerCase() !== "borrar") {
      setErrorMessage("Debes escribir 'borrar' para confirmar.");
      setLoading(false);
      return;
    }
    try {
      const result = await deleteUser(userId ?? "");
      if (result.success) {
        router.push("/insiders/admin/users");
      } else {
        setErrorMessage(result.error);
      }
    } catch (error) {
      setErrorMessage("Error al eliminar los datos de Holded.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-x-1 text-tiny">
                  Confirmación
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="Escribe 'borrar' para confirmar"
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {errorMessage && <FormError message={errorMessage} />}
          {successMessage && <FormSuccess message={successMessage} />}
          <Button
            className="w-full"
            disabled={loading}
            onClick={() =>
              onSubmitHoldedDeleteData({
                confirmation: form.getValues().confirmation,
              })
            }
          >
            {loading ? "Eliminando..." : "Confirmar"}
          </Button>

          <p className="text-center mb-6 text-tiny">
            Para eliminar los datos importados de Holded, escribe <b>borrar</b>{" "}
            en el campo a continuación y presiona el botón de eliminar.
          </p>
        </form>
      </Form>
    </div>
  );
};

export default DeleteUserForm;