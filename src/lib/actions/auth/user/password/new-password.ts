"use server";
import prisma from "@/prisma/database";
import { NewPasswordSchema } from "@/src/types/zod-schemas";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null
) => {
  if (!token) {
    return { error: "Token perdido." };
  }

  // Validamos los campos utilizando el esquema de Zod
  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Contraseña incorrecta." };
  }

  const { password } = validatedFields.data;

  try {
    // Buscamos el token en la base de datos
    const existingToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    // Si el token no existe, devolvemos un error
    if (!existingToken) {
      return { error: "Token invalido." };
    }

    // Verificamos si el token ha expirado
    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      // Eliminamos el token expirado de la base de datos
      await prisma.passwordResetToken.delete({
        where: { id: existingToken.id },
      });

      return { error: "Token expirado." };
    }

    // Buscamos el usuario correspondiente al email del token
    const existingUser = await prisma.user.findUnique({
      where: { email: existingToken.email },
    });

    // Si el usuario no existe, devolvemos un error
    if (!existingUser) {
      return { error: "El email no existe." };
    }

    // Hashamos la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizamos la contraseña del usuario en la base de datos
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        password: hashedPassword,
      },
    });

    // Eliminamos el token de restablecimiento de contraseña de la base de datos
    await prisma.passwordResetToken.delete({
      where: { id: existingToken.id },
    });

    return { success: "Contraseña actualizada!" };
  } catch (error) {
    // Registramos cualquier error inesperado
    console.error("Error al actualizar la contraseña:", error);
    return {
      error:
        "Hubo un problema al actualizar la contraseña. Por favor, inténtalo de nuevo más tarde.",
    };
  }
};
