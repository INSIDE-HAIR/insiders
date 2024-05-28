import { DEFAULT_LOGIN_REDIRECT } from "@/src/lib/routes/routes";
import { EmailSchema } from "@/src/lib/types/zod-schemas";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/src/lib/server-actions/auth/config/auth";

export const emailLogin = async (
  values: z.infer<typeof EmailSchema>,
  callbackUrl?: string | null
) => {
  const validatedFields = EmailSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campos incorrectos!" };
  }

  const { email } = validatedFields.data;
  console.log("email", email);

  try {
    await signIn("email", {
      email,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      console.log(error);
      switch (error.type) {
        case "EmailSignInError":
          return { error: `Email SignIn Error: ${error.message}` };
        default:
          return { error: "Algo salio mal." };
      }
    }

    throw error; // if not throw error, next-auth doesn't redirect
  }

  return { success: "Email enviado!" };
};
