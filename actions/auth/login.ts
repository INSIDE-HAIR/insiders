"use server";
import * as z from "zod";
import { LoginSchema } from "@/src/schemas/index";
import { AuthError } from "next-auth";
import { signIn } from "@/src/lib/actions/auth/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/src/lib/routes/routes";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmailResend } from "@/src/lib/mail/mail";
import { generateVerificationToken } from "./tokens";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Credenciales Incorrectas :(" };
  }
  const { email, password } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "El email o la contraseña son incorrectos :(" };
  }

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
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales Incorrectas :()" };
        default:
          return { error: "Algo salio mal :(" };
      }
    }

    throw error;
  }
};
