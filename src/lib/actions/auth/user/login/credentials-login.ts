"use server";
import prisma from "@/prisma/database";
import { CredentialSigninSchema } from "@/src/lib/types/general-schemas";
import { z } from "zod";
import {
  sendTwoFactorTokenEmailResend,
  sendVerificationEmailResend,
} from "@/src/lib/mail/mail";
import { signIn } from "@/src/lib/actions/auth/config/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/src/lib/routes/routes";
import { AuthError } from "next-auth";
import {
  generateTwoFactorToken,
  generateVerificationToken,
} from "../register/tokens";

// Definición de tipo para el esquema de inicio de sesión
type CredentialSigninType = z.infer<typeof CredentialSigninSchema>;

// Función principal de inicio de sesión
export const credentialsLogin = async (
  values: CredentialSigninType,
  callbackUrl?: string | null
) => {
  // Validar los campos de entrada
  const validatedFields = CredentialSigninSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Campos incorrectos." };
  }
  const { email, password, code } = validatedFields.data;

  // Verificar si el usuario existe
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Usuario con este correo no existe." };
  }

  // Verificar si el email ha sido verificado
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );
    await sendVerificationEmailResend(email, verificationToken.token);
    return { success: "Correo de confirmación enviado!" };
  }

  // Manejar la verificación de dos factores (2FA)
  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    const twoFactorResult = await handleTwoFactorAuthentication(
      existingUser,
      code
    );
    if (twoFactorResult) return twoFactorResult;
  }

  // Intentar iniciar sesión
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return handleAuthError(error);
    }
    throw error;
  }

  return { success: "Inicio de sesión exitoso!" };
};

// Función para manejar la autenticación de dos factores (2FA)
const handleTwoFactorAuthentication = async (user: any, code?: string) => {
  if (code) {
    const twoFactorToken = await prisma.twoFactorToken.findFirst({
      where: { email: user.email },
    });

    if (!twoFactorToken || twoFactorToken.token !== code) {
      return { error: "Código incorrecto." };
    }

    if (new Date(twoFactorToken.expires) < new Date()) {
      await prisma.twoFactorToken.delete({ where: { id: twoFactorToken.id } });
      return { error: "Código expirado." };
    }

    await prisma.twoFactorToken.delete({ where: { id: twoFactorToken.id } });
    const existingConfirmation = await prisma.twoFactorConfirmation.findUnique({
      where: { userId: user.id },
    });

    if (existingConfirmation) {
      await prisma.twoFactorConfirmation.delete({
        where: { id: existingConfirmation.id },
      });
    }

    await prisma.twoFactorConfirmation.create({ data: { userId: user.id } });
  } else {
    const twoFactorToken = await generateTwoFactorToken(user.email);
    await sendTwoFactorTokenEmailResend(user.email, twoFactorToken.token);
    return { twoFactor: true };
  }
};

// Función para manejar errores de autenticación
const handleAuthError = (error: AuthError) => {
  switch (error.type) {
    case "CredentialsSignin":
      return { error: "Credenciales incorrectas." };
    default:
      return { error: "Algo salió mal." };
  }
};
