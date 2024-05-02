"use server";
import prisma from "@/prisma/database";
import { CredentialSigninSchema } from "@/src/lib/types/zod-schemas";
import { z } from "zod";
import { generateTwoFactorToken, generateVerificationToken } from "./tokens";
import {
  sendTwoFactorTokenEmailResend,
  sendVerificationEmailResend,
} from "@/src/lib/mail/mail";
import { signIn } from "@/src/lib/actions/auth/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/src/lib/routes/routes";
import { AuthError } from "next-auth";

export const credentialsLogin = async (
  values: z.infer<typeof CredentialSigninSchema>,
  callbackUrl?: string | null
) => {
  const validatedFields = CredentialSigninSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campos incorrectos." };
  }

  const { email, password, code } = validatedFields.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Usuario con este correo no existe." };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );

    // send email with verificationToken
    await sendVerificationEmailResend(email, verificationToken.token);

    return { success: "Correo de confirmación enviado!" };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await prisma.twoFactorToken.findFirst({
        where: { email: existingUser.email },
      });

      if (!twoFactorToken) {
        return { error: "Código incorrecto." };
      }

      if (twoFactorToken.token !== code) {
        return { error: "Código incorrecto." };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();
      if (hasExpired) {
        // delete expired token
        await prisma.twoFactorToken.delete({
          where: { id: twoFactorToken.id },
        });

        return { error: "Código expiradado." };
      }

      // when 2FA is valid, still remove twoFactorToken
      await prisma.twoFactorToken.delete({ where: { id: twoFactorToken.id } });

      const existingConfirmation =
        await prisma.twoFactorConfirmation.findUnique({
          where: { userId: existingUser.id },
        });

      if (existingConfirmation) {
        await prisma.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await prisma.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      const result = await sendTwoFactorTokenEmailResend(
        existingUser.email,
        twoFactorToken.token
      );
      console.log("credentialsLogin result ", result);
      return { twoFactor: true };
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales incorrectas." };
        default:
          return { error: "Algo salio mal." };
      }
    }

    throw error; // if not throw error, next-auth doesn't redirect
  }

  return { success: "Email enviado!" };
};
