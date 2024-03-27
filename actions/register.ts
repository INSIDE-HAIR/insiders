"use server"
import * as z from "zod";
import { RegisterSchema } from "@/src/schemas/index";
import bcrypt from "bcryptjs";
import prisma from "@/prisma/database";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/src/lib/actions/auth/tokens";
import { sendVerificationEmail } from "@/src/lib/actions/mailer/mailer";
import { sendVerificationEmailResend } from "@/src/lib/mail/mail";

export const register = async (values:z.infer<typeof RegisterSchema>)=>{
  const validatedFields = RegisterSchema.safeParse(values)

if(!validatedFields.success){
  return {error: "Credenciales Incorrectas :("}
}

const {email, name, lastName, password, contactNumber, confirmPassword, terms } = validatedFields.data
const hashedPassword = await bcrypt.hash(password,10)


const existingUser = await getUserByEmail(email)

if (existingUser){
  return {error: "El usuario ya existe"}
}

await prisma.user.create({
  data: {
    email,
    name,
    lastName,
    password: hashedPassword,
    contactNumber,
    terms
  }
})

console.log(values)
const verificationToken = await generateVerificationToken(email);

await sendVerificationEmailResend(
  verificationToken.identifier,
  verificationToken.token
);

return {success: "Usuario Creado con exito!"}
}