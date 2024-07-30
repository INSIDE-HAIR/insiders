"use server";
import * as z from "zod";
import { LoginSchema } from "@/src/lib/types/general-schemas";
import { AuthError } from "next-auth";
import { signIn } from "@/src/lib/actions/auth/config/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/src/lib/routes/routes";
import { getUserByEmail } from "@/prisma/query/user";
import { sendVerificationEmailResend } from "@/src/lib/mail/mail";
import { generateVerificationToken } from "../register/tokens";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  // Validar los campos de entrada
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Credenciales Incorrectas :(" };
  }
  const { email, password } = validatedFields.data;

  // Verificar si el usuario existe
  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "El email o la contraseña son incorrectos :(" };
  }

  // Verificar si el email ha sido verificado
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );

    await sendVerificationEmailResend(
      verificationToken.identifier,
      verificationToken.token
    );

    return {
      error:
        "El email no ha sido verificado, por favor revisa tu bandeja de entrada.",
    };
  }

  try {
    // Iniciar sesión con las credenciales proporcionadas
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales Incorrectas :(" };
        default:
          return { error: "Algo salio mal :(" };
      }
    }

    throw error;
  }
};