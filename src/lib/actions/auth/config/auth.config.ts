import bcrypt from "bcryptjs"; // Importa la librería bcryptjs para el hashing de contraseñas
import type { NextAuthConfig } from "next-auth"; // Importa el tipo NextAuthConfig de next-auth
import Credentials from "next-auth/providers/credentials"; // Importa el proveedor de autenticación por credenciales
import Github from "next-auth/providers/github"; // Importa el proveedor de autenticación de Github
import Google from "next-auth/providers/google"; // Importa el proveedor de autenticación de Google

import { LoginSchema } from "@/src/lib/types/inside-schemas"; // Importa el esquema de validación para el login
import { getUserByEmail } from "@/prisma/query/user"; // Importa la función para obtener un usuario por email

// Exporta la configuración de NextAuth
export default {
  providers: [
    // Configuración del proveedor de Google
    Google({
      clientId: "1014725709960-j00f1pdf5n4o503a95npudkk151upfq8.apps.googleusercontent.com",
      clientSecret: "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",
    }),
    // Configuración del proveedor de Github
    Github({
      clientId: process.env.GITHUB_CLIENT_ID, // ID del cliente de Github desde las variables de entorno
      clientSecret: process.env.GITHUB_CLIENT_SECRET, // Secreto del cliente de Github desde las variables de entorno
    }),
    // Configuración del proveedor de credenciales
    Credentials({
      async authorize(credentials) {
        // Valida las credenciales usando el esquema de login
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data; // Extrae email y contraseña de las credenciales
          
          const user = await getUserByEmail(email); // Obtiene el usuario por email
          if (!user || !user.password) return null; // Si no existe el usuario o no tiene contraseña, retorna null

          // Compara la contraseña ingresada con la almacenada
          const passwordsMatch = await bcrypt.compare(
            password,
            user.password,
          );

          if (passwordsMatch) return user; // Si las contraseñas coinciden, retorna el usuario
        }

        return null; // Si la validación falla, retorna null
      }
    })
  ],
  pages: {
    signIn: "/auth/login", // Página de inicio de sesión
    verifyRequest: "/auth/verify-request", // Página para verificar la solicitud
    error: "/auth/auth-error", // Página de error de autenticación
  },
} satisfies NextAuthConfig; // Asegura que la configuración cumple con el tipo NextAuthConfig