"use server";
import { DEFAULT_LOGIN_REDIRECT } from "@/src/lib/routes/routes";
import { EmailSchema } from "@/src/lib/types/zod-schemas";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/src/lib/actions/auth/config/auth";

export const emailLogin = async (
  values: z.infer<typeof EmailSchema>,
  callbackUrl?: string | null
) => {
  // Validar los campos de entrada
  const validatedFields = EmailSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Campos incorrectos!" };
  }

  const { email } = validatedFields.data;

  try {
    // Intentar iniciar sesión con email
    await signIn("email", {
      email,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    // Manejo de errores específicos de autenticación
    if (error instanceof AuthError) {
      switch (error.type) {
        case "EmailSignInError":
          return {
            error: `Error de inicio de sesión por email: ${error.message}`,
          };
        default:
          return { error: "Algo salió mal." };
      }
    }
    // Lanza el error si no es un AuthError
    throw error;
  }

  return { success: "Email enviado!" };
};
