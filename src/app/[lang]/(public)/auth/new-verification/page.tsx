import NewVerificationForm from "@/src/components/custom/auth/forms/new-verification-form";
import prisma from "@/prisma/database";
import React from "react";

type Props = {
  searchParams: { token: string };
};

const NewVerificationPage = async ({ searchParams: { token } }: Props) => {
  // await new Promise((resolve, reject) => {
  //   setTimeout(resolve, 3000);
  // });

  const existingToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  let message: string = "";
  let success: boolean = false;

  if (!existingToken) {
    message =
      "Fallo inesperado en la verificación. Vuelva a intentar, si el problema persiste contacte al soporte.";
  } else {
    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      // remove expired token
      await prisma.verificationToken.delete({
        where: { id: existingToken.id },
      });

      message =
        "!Tiempo expirado, vuelva a solicitar otro correo de verificación. Intenta ingresar de nuevo a tu cuenta.";
    } else {
      const existingUser = await prisma.user.findUnique({
        where: { email: existingToken.identifier },
      });
      if (!existingUser) {
        message = "¡El email no existe!";
      } else {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            emailVerified: new Date(),
            email: existingToken.identifier, // for users change their email
          },
        });

        await prisma.verificationToken.delete({
          where: { id: existingToken.id },
        });

        message = "¡Email verificado con éxito!";
        success = true;
      }
    }
  }

  return (
    <section className="shadow-2xl h-screen flex items-center justify-center w-screen">
      <NewVerificationForm message={message} success={success} />
    </section>
  );
};

export default NewVerificationPage;
