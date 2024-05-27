"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { HoldedSyncSchema } from "@/src/lib/types/zod-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/src/components/ui/input";
import FormError from "@/src/components/share/MessageErrorBox";
import FormSuccess from "@/src/components/share/MessageSuccessBox";
import LoadingButton from "@/src/components/share/LoadingButton";
import { getHoldedContactById } from "@/src/server-actions/holded/contacts";
import moment from "moment-timezone";
import "moment/locale/es"; // Importar el idioma español
import ErrorMessageBox from "@/src/components/share/MessageErrorBox";
import SuccessMessageBox from "@/src/components/share/MessageSuccessBox";

type Props = {
  holdedId?: string | null | undefined;
  insidersId?: string | null | undefined;
};

const HoldedSyncForm = (props: Props) => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>("");
  const [successMessage, setSuccessMessage] = useState<string | undefined>("");
  const [holdedContact, setHoldedContact] = useState<any>({});
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isValidId, setIsValidId] = useState<boolean>(false);

  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof HoldedSyncSchema>>({
    resolver: zodResolver(HoldedSyncSchema),
    defaultValues: {
      holdedId: props.holdedId || "",
      insidersId: props.insidersId || "",
    },
  });

  useEffect(() => {
    if (props.holdedId) {
      form.setValue("holdedId", props.holdedId);
      checkConnection(props.holdedId);
    }
  }, [props.holdedId, form]);

  const onSubmitHoldedId = async (holdedId: string) => {
    setErrorMessage("");
    setSuccessMessage("");

    startTransition(async () => {
      const data = await getHoldedContactById(holdedId || "");
      if (data?.error) {
        setErrorMessage(data.error);
        setIsValidId(false);
      } else {
        setSuccessMessage("Holded ID encontrado con éxito");
        setIsValidId(true);
        setHoldedContact(data);
        setIsConnected(true);
      }
    });
  };

  const connectToHolded = async () => {
    // Lógica para conectar con Holded
    setIsConnected(true);
  };

  const disconnectFromHolded = async () => {
    // Lógica para desconectar de Holded
    setIsConnected(false);
  };

  const checkConnection = async (holdedId: string) => {
    // Lógica para comprobar si ya está conectado
    const data = await getHoldedContactById(holdedId);
    if (data && !data.error) {
      setIsConnected(true);
      setHoldedContact(data);
    } else {
      setIsConnected(false);
      setHoldedContact({});
    }
  };

  // Get the value of the custom field "CLIENTES - Insiders ID"
  const insidersIdValue = holdedContact.customFields?.find(
    (field: { field: string }) => field.field === "CLIENTES - Insiders ID"
  )?.value;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onSubmitHoldedId(values.holdedId || "")
        )}
        className="space-y-6"
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="holdedId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>holdedId</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Código de cliente en Holded"
                    type="text"
                    disabled={isPending}
                    value={field.value || ""} // Fix: Ensure value is always a string
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="insidersId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>insidersId</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={props.insidersId || ""}
                    type="text"
                    value={props.insidersId || ""}
                    disabled
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
          type="button"
          className="w-full relative"
          isLoading={isPending}
          onClick={() =>
            form.handleSubmit((values) => checkConnection(values.holdedId || ""))()
          }
        >
          Probar conexión
        </LoadingButton>
        {isValidId && !isConnected && (
          <LoadingButton
            type="button"
            className="w-full relative"
            isLoading={isPending}
            onClick={connectToHolded}
          >
            Conectar con Holded
          </LoadingButton>
        )}
        {isConnected && (
          <LoadingButton
            type="button"
            className="w-full relative bg-transparent text-red-800 border-red-800 hover:bg-red-800 hover:text-white hover:border-red-800"
            isLoading={isPending}
            onClick={disconnectFromHolded}
          >
            Desconectar de Holded
          </LoadingButton>
        )}
        <div className="text-tiny">
          <h3 className="font-bold text-center mb-2 font">
            Información del contacto
          </h3>
          {Object.keys(holdedContact).length > 0 ? (
            <>
              <p>
                <b>Nombre: </b>
                {holdedContact.name}
              </p>
              <p>
                <b>Email: </b>
                {holdedContact.email}
              </p>
              <p>
                <b>NIF/DNI/NIE: </b>
                {holdedContact.code}
              </p>
              <p>
                <b>Fecha de creación: </b>
                {holdedContact.createdAt
                  ? moment(holdedContact.createdAt * 1000)
                      .locale("es")
                      .format("dddd, D MMMM YYYY, h:mm:ss a")
                  : ""}
              </p>
              <p>
                <b>Insiders ID: </b>
                {insidersIdValue}
              </p>
              <div className="mt-4">
                {insidersIdValue === props.insidersId ? (
                  <SuccessMessageBox message={"Conexión correcta"} />
                ) : (
                  <ErrorMessageBox
                    message={"No se ha encontrado ningún contacto"}
                  />
                )}
              </div>
            </>
          ) : (
            <p>
              Sin conexión con Holded. Introduce un Holded ID y haz clic en
              &quot;Probar conexión&quot;
            </p>
          )}
        </div>
      </form>
    </Form>
  );
};

export default HoldedSyncForm;
