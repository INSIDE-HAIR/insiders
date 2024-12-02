import CardWrapper from "@/src/components/custom/auth/card/auth-card-wrapper";
import NewPasswordForm from "@/src/components/custom/auth/forms/new-password-form";
import React from "react";

type Props = {};

const NewPasswordPage = (props: Props) => {
  return (
    <section className="shadow-2xl h-screen flex items-center justify-center w-screen">
      <CardWrapper
        headerLabel="Enter a new password"
        backButtonLabel="Regresar a página de iniciar sesión"
        backButtonHref="/auth/login"
      >
        <NewPasswordForm />
      </CardWrapper>
    </section>
  );
};

export default NewPasswordPage;
