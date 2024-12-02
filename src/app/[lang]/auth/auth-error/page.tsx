import CardWrapper from "@/src/components/custom/auth/card/auth-card-wrapper";
import React from "react";

type Props = {
  searchParams: { error: string };
};

const AuthErrorPage = ({ searchParams: { error } }: Props) => {
  if (error === "Verification") {
    return (
      <section className="shadow-2xl h-screen flex items-center justify-center w-screen">
        <CardWrapper
          headerLabel="No se puede iniciar sesión"
          backButtonHref="/auth/login"
          backButtonLabel={"Regresar a página de iniciar sesión"}
        >
          <p className="text-center text-lg mb-4">
            El enlace de registro ya no es válido.
          </p>
          <p className="text-center">
            Puede que ya se haya utilizado o <br /> que haya caducado.
          </p>
        </CardWrapper>
      </section>
    );
  } else {
    return (
      <section className="shadow-2xl h-screen flex items-center justify-center w-screen">
        <CardWrapper
          headerLabel="No se puede iniciar sesión"
          backButtonHref="/auth/login"
          backButtonLabel="Regresar a página de iniciar sesión"
        >
          <p className="text-center text-lg mb-4">{error}</p>
        </CardWrapper>
      </section>
    );
  }
};

export default AuthErrorPage;
