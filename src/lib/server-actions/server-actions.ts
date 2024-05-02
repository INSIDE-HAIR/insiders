"use server";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { auth, unstable_update as update } from "../actions/auth/auth";
import { SettingsSchema } from "../types/zod-schemas";
import prisma from "../../../prisma/database";
import { sendVerificationEmailResend } from "../mail/mail";
import { generateVerificationToken } from "@/actions/auth/tokens";

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
