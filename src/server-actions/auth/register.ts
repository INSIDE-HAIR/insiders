"use server";
import * as z from "zod";
import { RegisterSchema } from "@/src/schemas/index";
import bcrypt from "bcryptjs";
import prisma from "@/prisma/database";
import { getUserByEmail } from "@/prisma/query/user";
import { sendVerificationEmailResend } from "@/src/lib/mail/mail";
import { generateVerificationToken } from "./tokens";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Credenciales Incorrectas :(" };
  }

  const {
    email,
    name,
    lastName,
    password,
    contactNumber,
    confirmPassword,
    terms,
  } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "El usuario ya existe" };
  }

  await prisma.user.create({
    data: {
      email,
      name,
      lastName,
      password: hashedPassword,
      contactNumber,
      terms,
    },
  });

  const verificationToken = await generateVerificationToken(email);

  await sendVerificationEmailResend(
    verificationToken.identifier,
    verificationToken.token
  );

  return {
    success:
      "¡Usuario creado con exito!. Se ha enviado un email de verificación a tu correo.",
  };
};
