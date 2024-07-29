"use server";
import * as z from "zod";
import { RegisterSchema } from "@/src/lib/types/general-schemas";
import bcrypt from "bcryptjs";
import prisma from "@/prisma/database";
import { getUserByEmail } from "@/prisma/query/user";
import { sendVerificationEmailResend } from "@/src/lib/mail/mail";
import { generateVerificationToken } from "./tokens";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  // Validar los campos de entrada
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Credenciales Incorrectas :(" };
  }

  const { email, name, lastName, password, contactNumber, terms } =
    validatedFields.data;

  try {
    // Verificar si el usuario ya existe
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return {
        error: "El usuario ya existe. Por favor, intenta con otro correo.",
      };
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario en la base de datos
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        lastName,
        password: hashedPassword,
        contactNumber,
        terms,
      },
    });

    // Generar token de verificación
    const verificationToken = await generateVerificationToken(email);

    // Enviar correo de verificación
    await sendVerificationEmailResend(
      verificationToken.identifier,
      verificationToken.token
    );

    return {
      success:
        "¡Usuario creado con éxito! Se ha enviado un email de verificación a tu correo.",
    };
  } catch (error) {
    console.error("Error en el registro de usuario:", error);
    return {
      error: "Hubo un error en el registro. Inténtalo nuevamente más tarde.",
    };
  }
};
