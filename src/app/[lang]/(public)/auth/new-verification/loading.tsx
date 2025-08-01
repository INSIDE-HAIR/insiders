import CardWrapper from "@/src/components/custom/auth/card/auth-card-wrapper";
import { Spinner } from "@/src/components/ui/spinner";
import React from "react";

type Props = {};

const NewVerificationPageLoading = (props: Props) => {
  return (
    <div className="pagewrapper shadow-2xl">
      <CardWrapper
        headerLabel="Confirm you verification"
        backButtonLabel="Regresar a página de iniciar sesión"
        backButtonHref="/auth/login"
      >
        <div className="flex items-center justify-center w-full">
          <Spinner size="xl" className="w-24 h-24 text-primary dark:text-primary-foreground" />
        </div>
      </CardWrapper>
    </div>
  );
};

export default NewVerificationPageLoading;
