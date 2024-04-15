import CardWrapper from "@/src/components/auth/CardWrapper";
import NewPasswordForm from "@/src/components/auth/NewPasswordForm";
import React from "react";

type Props = {};

const NewPasswordPage = (props: Props) => {
  return (
    <section className="pagewrapper">
      <CardWrapper
        headerLabel="Enter a new password"
        backButtonLabel="<- Regresar a página de login"
        backButtonHref="/auth/login"
      >
        <NewPasswordForm />
      </CardWrapper>
    </section>
  );
};

export default NewPasswordPage;
