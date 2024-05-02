"use server";
import prisma from "../../../prisma/database";
import { ResetSchema } from "@/src/lib/types/zod-schemas";

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
