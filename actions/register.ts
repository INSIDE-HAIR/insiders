"use server"
import * as z from "zod";
import { RegisterSchema } from "@/schemas/index";
import bcrypt from "bcryptjs";
import { dbMongo } from "@/prisma/db-mongo";
import { getUserByEmail } from "@/data/user";

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

await dbMongo.user.create({
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

//TODO: Send email confirmation

return {success: "Usuario Creado con exito!"}
}