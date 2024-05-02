"use server";

import bcrypt from "bcryptjs";
import * as z from "zod";

import { auth, signIn, unstable_update as update } from "../actions/auth/auth";
import {
  EmailSchema,
  NewPasswordSchema,
  SettingsSchema,
} from "../types/zod-schemas";
import prisma from "../../../prisma/database";
import {
  generateVerificationToken,
} from "../actions/auth/tokens";
import { AuthError } from "next-auth";
import { DEFAULT_LOGIN_REDIRECT } from "../routes/routes";
import { sendVerificationEmailResend } from "../mail/mail";

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



export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return { error: "Sin autorización" };
  }

  if (user.id) {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return { error: "Sin autorización!" };

    // const account = await prisma.account.findFirst({
    //   where: { userId: dbUser.id },
    // });

    if (user.isOAuth) {
      values.email = undefined;
      values.password = undefined;
      values.newPassword = undefined;
      values.isTwoFactorEnabled = undefined;
    }

    if (values.email && values.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: values.email },
      });
      if (existingUser && existingUser.id !== user.id) {
        return { error: "Este correo esta en uso." };
      }

      const verifiationToken = await generateVerificationToken(values.email);
      await sendVerificationEmailResend(
        verifiationToken.identifier,
        verifiationToken.token
      );

      return { success: "Email de verificación enviado!" };
    }

    if (values.password && values.newPassword && dbUser.password) {
      const passwordsMatch = await bcrypt.compare(
        values.password,
        dbUser.password
      );

      if (!passwordsMatch) {
        return { error: "Contraseña incorrecta." };
      }

      const hashedPassword = await bcrypt.hash(values.newPassword, 10);
      values.password = hashedPassword;
      values.newPassword = undefined;
    }

    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        ...values,
      },
    });

    update({
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
      },
    });

    return { success: "Ajustes actualizados!" };
  }
};
