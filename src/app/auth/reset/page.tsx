import CardWrapper from "@/src/components/auth/CardWrapper";
import ResetPasswordForm from "@/src/components/auth/ResetPasswordForm";
import React from "react";

type Props = {};

const ResetPasswordPage = (props: Props) => {
  return (
    <div className="pagewrapper ">
      <CardWrapper
        headerLabel="¿Olvidaste tu contraseña?"
        backButtonLabel="<- Regresar a página de login"
        backButtonHref="/auth/login"
      >
        <ResetPasswordForm />
      </CardWrapper>
    </div>
  );
};

export default ResetPasswordPage;
