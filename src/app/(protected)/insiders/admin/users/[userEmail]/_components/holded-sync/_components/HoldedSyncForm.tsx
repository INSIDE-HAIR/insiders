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
import { Input } from "@/src/components/ui/input";
import FormError from "@/src/components/share/MessageErrorBox";
import FormSuccess from "@/src/components/share/MessageSuccessBox";
import { getHoldedContactById } from "@/src/lib/server-actions/vendors/holded/contacts";
import moment from "moment-timezone";
import "moment/locale/es"; // Importar el idioma español
import ErrorMessageBox from "@/src/components/share/MessageErrorBox";
import SuccessMessageBox from "@/src/components/share/MessageSuccessBox";
import { useHolded } from "@/src/components/providers/HoldedProvider";
import { useDebounce } from "@uidotdev/usehooks";
import LoadingSpinner from "@/src/components/share/LoadingSpinner";
import { z } from "zod";
import { updateUserHoldedData } from "@/src/lib/server-actions/auth/user/settings/user-holded-data-update";
import { Button } from "@/src/components/ui/buttons/chadcn-button";

type Props = {
  holdedId?: string | null;
  insidersId?: string | null;
};

const HoldedSyncForm = ({
  holdedId: initialHoldedId,
  insidersId: initialInsidersId,
}: Props) => {
  const { holdedId, insidersId, setHoldedId } = useHolded();
  const [errorMessage, setErrorMessage] = useState<string | undefined>("");
  const [successMessage, setSuccessMessage] = useState<string | undefined>("");
  const [holdedContact, setHoldedContact] = useState<any>({});
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [isValidId, setIsValidId] = useState<boolean>(false);

  const form = useForm<z.infer<typeof HoldedSyncSchema>>({
    resolver: zodResolver(HoldedSyncSchema),
    defaultValues: {
      holdedId: initialHoldedId || "",
      insidersId: initialInsidersId || "",
    },
  });

  const debouncedHoldedId = useDebounce(holdedId, 500);

  useEffect(() => {
    form.setValue("holdedId", holdedId || "");
    form.setValue("insidersId", insidersId || "");

    if (debouncedHoldedId?.length === 24) {
      checkConnection(debouncedHoldedId);
    }
  }, [debouncedHoldedId, insidersId, form, holdedId]);

  const onSubmitHoldedId = async (holdedId: string) => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    if (holdedId.length !== 24) {
      setErrorMessage("El Holded ID debe tener al menos 24 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const data = await getHoldedContactById(holdedId || "");
      if (data?.error) {
        setErrorMessage(data.error);
      } else {
        setSuccessMessage("Holded ID encontrado con éxito");
        setHoldedContact(data);
        setHoldedId(holdedId);
      }
    } catch (error) {
      setErrorMessage("Error al conectar con Holded.");
    } finally {
      setLoading(false);
    }
  };

  const onUpdateHoldedId = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const result = await updateUserHoldedData(
        insidersId ?? "",
        holdedId ?? ""
      );
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage("Holded ID actualizado exitosamente");
      }
    } catch (error) {
      setErrorMessage("Error al actualizar el Holded ID.");
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = async (holdedId: string) => {
    setLoading(true);
    try {
      const data = await getHoldedContactById(holdedId);
      if (data && !data.error) {
        setIsValidId(true);
        setHoldedContact(data);
      } else {
        setIsValidId(false);
        setHoldedContact({});
      }
    } catch (error) {
      setIsValidId(false);
      setHoldedContact({});
    } finally {
      setLoading(false);
    }
  };

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
          <HoldedIdField
            form={form}
            setHoldedId={setHoldedId}
            isPending={isPending}
          />
          <InsidersIdField form={form} insidersId={insidersId} />
        </div>

        <FormError message={errorMessage} />
        <FormSuccess message={successMessage} />

        {debouncedHoldedId?.length === 24 && (
          <ContactInfo
            loading={loading}
            holdedContact={holdedContact}
            insidersId={insidersId}
            insidersIdValue={insidersIdValue}
            isValidId={isValidId}
            onUpdateHoldedId={onUpdateHoldedId}
          />
        )}
        {debouncedHoldedId?.length !== 24 && <NoContactFoundMessage />}
      </form>
    </Form>
  );
};

const HoldedIdField = ({
  form,
  setHoldedId,
  isPending,
}: {
  form: any;
  setHoldedId: (holdedId: string) => void;
  isPending: boolean;
}) => (
  <FormField
    control={form.control}
    name="holdedId"
    render={({ field }) => (
      <FormItem>
        <FormLabel className="flex items-center gap-x-1 text-tiny">
          Holded ID
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
);

const InsidersIdField = ({
  form,
  insidersId,
}: {
  form: any;
  insidersId: any;
}) => (
  <FormField
    control={form.control}
    name="insidersId"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Insiders ID</FormLabel>
        <FormControl>
          <Input
            {...field}
            placeholder={insidersId || ""}
            type="text"
            value={insidersId || ""}
            disabled
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const ContactInfo = ({
  loading,
  holdedContact,
  insidersId,
  insidersIdValue,
  isValidId,
  onUpdateHoldedId,
}: {
  loading: boolean;
  holdedContact: any; // Replace 'any' with the appropriate type for holdedContact
  insidersId: any;
  insidersIdValue: any;
  isValidId: boolean;
  onUpdateHoldedId: () => void;
}) => (
  <div className="text-tiny">
    <h3 className="font-bold text-center mb-2">Información del contacto</h3>
    {loading ? (
      <LoadingIndicator />
    ) : (
      <>
        {isValidId && Object.keys(holdedContact).length > 0 ? (
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
              {insidersIdValue === insidersId ? (
                <>
                  <SuccessMessageBox message={"ID correcto."} />
                  <div className="flex">
                    <Button onClick={onUpdateHoldedId} className="mt-4 mx-auto">
                      Actualizar Holded ID en el servidor
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {insidersId === "" ? (
                    <ErrorMessageBox
                      message={"El contacto no tiene un Insiders ID"}
                    />
                  ) : (
                    <ErrorMessageBox
                      message={"No coinciden los Insiders ID."}
                    />
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <NoContactFoundMessage />
        )}
      </>
    )}
  </div>
);

const LoadingIndicator = () => (
  <div className="w-full h-10 flex justify-center max-w-full overflow-hidden">
    <div className="text-center h-8 w-8 items-center justify-center content-center flex overflow-hidden m-auto">
      <LoadingSpinner />
    </div>
  </div>
);

const NoContactFoundMessage = () => (
  <p className="text-tiny">
    <b>No se ha encontrado ningún contacto en Holded.</b> Introduce un Holded ID
    para buscarlo, recuerda que tiene que tener <b> 24 caracteres.</b>
  </p>
);

export default HoldedSyncForm;
