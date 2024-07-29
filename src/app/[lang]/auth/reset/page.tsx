import CardWrapper from "@/src/components/auth/CardWrapper";
import ResetPasswordForm from "@/src/components/auth/ResetPasswordForm";
import React from "react";

type Props = {};

const ResetPasswordPage = (props: Props) => {
  return (
    <section className="shadow-2xl h-screen flex items-center justify-center w-screen">
      <CardWrapper
        headerLabel="¿Olvidaste tu contraseña?"
        backButtonLabel="<- Regresar a página de iniciar sesión"
        backButtonHref="/auth/login"
      >
        <ResetPasswordForm />
      </CardWrapper>
    </section>
  );
};

export default ResetPasswordPage;
