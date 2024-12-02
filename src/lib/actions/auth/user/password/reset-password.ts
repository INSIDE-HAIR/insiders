"use server";
import prisma from "@/prisma/database";
import { ResetSchema } from "@/src/types/zod-schemas";
import { z } from "zod";
import { generatePasswordResetToken } from "../register/tokens";
import { sendPasswordResetEmail } from "@/src/config/email/templates/password-reset-email";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Email incorrecto." };
  }

  const { email } = validatedFields.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (!existingUser) {
    return { error: "Email no encontrado." };
  }

  // generate token & send email
  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  return { success: "Correo para reestablecer la contraseña enviado!" };
};
