import bcrypt from "bcryptjs"; // Importa la librería bcryptjs para el hashing de contraseñas
import type { NextAuthConfig } from "next-auth"; // Importa el tipo NextAuthConfig de next-auth
import Credentials from "next-auth/providers/credentials"; // Importa el proveedor de autenticación por credenciales
import Github from "next-auth/providers/github"; // Importa el proveedor de autenticación de Github
import Google from "next-auth/providers/google"; // Importa el proveedor de autenticación de Google

import { LoginSchema } from "@/src/types/inside-schemas"; // Importa el esquema de validación para el login
import prisma from "@/prisma/database";
import { Group, Resource, Tag } from "@prisma/client";

// Exporta la configuración de NextAuth
export default {
  providers: [
    // Configuración del proveedor de Google
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Configuración del proveedor de Github
    Github({
      clientId: process.env.GITHUB_CLIENT_ID, // ID del cliente de Github desde las variables de entorno
      clientSecret: process.env.GITHUB_CLIENT_SECRET, // Secreto del cliente de Github desde las variables de entorno
    }),
    // Configuración del proveedor de credenciales
    Credentials({
      async authorize(credentials, request) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              groups: true,
              tags: true,
              resources: true,
            },
          });

          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            return {
              ...user,
              isOAuth: false,
              groups: user.groups.map((g: Group) => g.name),
              tags: user.tags.map((t: Tag) => t.name),
              resources: user.resources.map((r: Resource) => r.name),
            };
          }
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login", // Página de inicio de sesión
    verifyRequest: "/auth/verify-request", // Página para verificar la solicitud
    error: "/auth/auth-error", // Página de error de autenticación
  },
} satisfies NextAuthConfig; // Asegura que la configuración cumple con el tipo NextAuthConfig
