"use server";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { auth, unstable_update as update } from "../actions/auth/auth";
import prisma from "@/prisma/database";
import { sendVerificationEmailResend } from "../mail/mail";
import { generateVerificationToken } from "@/src/server-actions/auth/tokens";
import { SettingsSchema, UserSchema } from "../types/inside-schemas";
import { ObjectId } from "mongodb";

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return { error: "Sin autorización" };
  }

  if (user.id) {
    if (!ObjectId.isValid(user.id)) {
      return { error: "Invalid user ID." };
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return { error: "Sin autorización!" };

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

      const verificationToken = await generateVerificationToken(values.email);
      await sendVerificationEmailResend(
        verificationToken.identifier,
        verificationToken.token
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
      data: values,
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

export const updateUser = async (values: z.infer<typeof UserSchema>) => {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return { error: "Sin autorización" };
  }

  if (user.id) {
    if (!ObjectId.isValid(user.id)) {
      return { error: "Invalid user ID." };
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return { error: "Sin autorización!" };

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
        return { error: "Este correo está en uso." };
      }

      const verificationToken = await generateVerificationToken(values.email);
      await sendVerificationEmailResend(
        verificationToken.identifier,
        verificationToken.token
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

    const { id, ...updateValues } = values;

    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: updateValues,
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
