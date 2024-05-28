"use server";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { auth, unstable_update as update } from "../../config/auth";
import prisma from "@/prisma/database";
import { sendVerificationEmailResend } from "../../../../mail/mail";
import { generateVerificationToken } from "@/src/lib/server-actions/auth/user/register/tokens";
import { UserSchema } from "../../../../types/inside-schemas";

export const updateUser = async (values: z.infer<typeof UserSchema>) => {
  // Ensure the user is authenticated
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return { error: "Sin autorización" };
  }

  // Fetch the authenticated user from the database
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return { error: "Sin autorización!" };

  // If the user is an admin, allow them to update any user
  const isAdmin = dbUser.role === "ADMIN";
  const targetUserId = values.id;

  // Fetch the target user from the database
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });
  if (!targetUser) {
    return { error: "User not found." };
  }

  // Check if the user has permission to update the target user
  if (!isAdmin && user.id !== targetUserId) {
    return { error: "Sin autorización para actualizar este usuario." };
  }

  // Prevent changes to protected fields
  if (values.role && values.role !== targetUser.role) {
    return { error: "No se puede cambiar el rol del usuario." };
  }
  if (values.id) {
    delete values.id;
  }

  // Handle password change securely
  if (values.password && values.newPassword) {
    if (targetUser.password === null) {
      return { error: "Contraseña incorrecta." };
    }

    const passwordsMatch = await bcrypt.compare(
      values.password,
      targetUser.password
    );
    if (!passwordsMatch) {
      return { error: "Contraseña incorrecta." };
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);
    values.password = hashedPassword;
    delete values.newPassword;
  } else {
    delete values.password;
    delete values.newPassword;
  }

  // Handle email change verification
  if (values.email && values.email !== targetUser.email) {
    // Check if the new email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: values.email },
    });
    if (existingUser && existingUser.id !== targetUserId) {
      return { error: "Este correo esta en uso." };
    }

    // Generate a verification token
    const verificationToken = await generateVerificationToken(values.email);

    // Send the verification email
    await sendVerificationEmailResend(
      verificationToken.identifier,
      verificationToken.token
    );

    // Do not update the email in the database yet, inform the user to verify
    return { success: "Email de verificación enviado!" };
  }

  // Update user data
  const updateValues = { ...values };
  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: updateValues,
  });

  // Update session if the current user is updated
  if (user.id === targetUserId) {
    update({
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
      },
    });
  }

  return { success: "Ajustes actualizados!" };
};
