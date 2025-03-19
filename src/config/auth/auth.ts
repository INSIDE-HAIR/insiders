import NextAuth from "next-auth"; // Importa la librería NextAuth para la autenticación
import { PrismaAdapter } from "@auth/prisma-adapter"; // Importa el adaptador de Prisma para NextAuth
import Resend from "next-auth/providers/resend"; // Importa el proveedor de Resend para el envío de correos
import bcrypt from "bcryptjs"; // Importa bcryptjs para el hashing de contraseñas
import CredentialsProvider from "next-auth/providers/credentials"; // Importa el proveedor de autenticación por credenciales
import GithubProvider from "next-auth/providers/github"; // Importa el proveedor de autenticación de Github
import GoogleProvider from "next-auth/providers/google"; // Importa el proveedor de autenticación de Google
import authConfig from "./auth.config"; // Importa la configuración de autenticación
import prisma from "../../../prisma/database"; // Importa la instancia de Prisma para la base de datos

import { CredentialSigninSchema } from "../../types/zod-schemas"; // Importa el esquema de validación para el inicio de sesión
import { UserRole } from "@prisma/client"; // Importa el tipo UserRole de Prisma

// Funciones para plantillas de correo electrónico
function html({
  url,
  host,
  theme = { brandColor: "#346df1", buttonText: "#fff" },
}: {
  url: string;
  host: string;
  theme?: { brandColor: string; buttonText: string };
}) {
  // Genera el HTML para el correo de verificación
  const escapedHost = host.replace(/\./g, "&#8203;.");
  const brandColor = theme.brandColor;
  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText: theme.buttonText,
  };

  return `
    <body style="background: ${color.background};">
      <table width="100%" border="0" cellspacing="20" cellpadding="0"
        style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
        <tr>
          <td align="center"
            style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
            Iniciar sesión en <strong>${escapedHost}</strong>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}">
                  <a href="${url}"
                    target="_blank"
                    style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">
                    Iniciar sesión
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center"
            style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
            Si no has solicitado este correo, puedes ignorarlo.
          </td>
        </tr>
      </table>
    </body>
  `;
}

function text({ url, host }: { url: string; host: string }) {
  // Genera el texto para el correo de verificación
  return `Iniciar sesión en ${host}\n${url}\n\n`;
}

// Configuración de NextAuth
export const {
  handlers: { GET, POST }, // Exporta los manejadores GET y POST
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  ...authConfig, // Configuración de autenticación importada
  providers: [
    CredentialsProvider({
      id: "credentials", // ID del proveedor de credenciales
      name: "Credentials", // Nombre del proveedor
      credentials: {
        email: { label: "UserEmail", type: "email", placeholder: "your email" }, // Campo de email
        password: { label: "Password", type: "password" }, // Campo de contraseña
      },
      async authorize(credentials, request) {
        const validatedFields = CredentialSigninSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const user = await prisma.user.findUnique({ where: { email } });

          if (!user || !user.password) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) {
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLogin: new Date() },
            });

            return {
              ...user,
              isOAuth: false,
              groups: [],
              tags: [],
              resources: [],
            };
          }
        }
        return null;
      },
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY, // Clave API para Resend
      from: process.env.EMAIL_FROM ?? "noreply@insidehair.es", // Dirección de envío del correo
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { from },
      }) {
        // Lógica para enviar el correo de verificación
        const { host } = new URL(url);

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: email,
            subject: `Iniciar sesión en ${host}`,
            html: html({ url, host }), // Genera el HTML del correo
            text: text({ url, host }), // Genera el texto del correo
          }),
        });

        if (!response.ok) {
          throw new Error(
            "Error al enviar el correo de verificación: " +
              JSON.stringify(await response.json())
          ); // Maneja errores al enviar el correo
        }
      },
      normalizeIdentifier(identifier: string): string {
        // Normaliza el identificador del usuario
        let [local, domain] = identifier.toLowerCase().trim().split("@");
        domain = domain.split(",")[0];
        return `${local}@${domain}`; // Retorna el identificador normalizado
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID, // ID del cliente de Github
      clientSecret: process.env.GITHUB_CLIENT_SECRET, // Secreto del cliente de Github
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID, // ID del cliente de Google
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Secreto del cliente de Google
    }),
  ],
  adapter: PrismaAdapter(prisma), // Configura el adaptador de Prisma
  session: {
    strategy: "jwt", // Estrategia de sesión basada en JWT
    maxAge: 24 * 60 * 60, // Duración máxima de la sesión en segundos
  },
  events: {
    async linkAccount({ user }) {
      // Evento al vincular una cuenta
      console.log("linkAccount event called");
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: user.emailVerified ?? new Date(), // Actualiza la fecha de verificación del email
          lastLogin: new Date(), // Actualiza la fecha del último inicio de sesión
        },
      });
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("callback signIn", { user, account, profile });

      if (account?.provider !== "credentials") {
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email ?? "" },
        });

        if (existingUser) {
          const existingAccount = await prisma.account.findFirst({
            where: {
              provider: account?.provider,
              providerAccountId: account?.providerAccountId,
            },
          });

          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account?.type || "",
                provider: account?.provider || "",
                providerAccountId: account?.providerAccountId || "",
                refresh_token: account?.refresh_token,
                access_token: account?.access_token,
                expires_at: account?.expires_at,
                token_type: account?.token_type,
                scope: account?.scope,
                id_token: account?.id_token,
                session_state: account?.session_state?.toString() ?? "",
              },
            });
          } else {
            // Update existing account with new tokens
            await prisma.account.update({
              where: { id: existingAccount.id },
              data: {
                access_token: account?.access_token,
                refresh_token: account?.refresh_token,
                expires_at: account?.expires_at,
              },
            });
          }

          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              lastLogin: new Date(),
              image: user.image || existingUser.image,
            },
          });
        } else {
          existingUser = await prisma.user.create({
            data: {
              name: user.name,
              email: user?.email ?? "",
              image: user.image,
              emailVerified: user.emailVerified ?? new Date(),
              lastLogin: new Date(),
              accounts: {
                create: {
                  type: account?.type || "",
                  provider: account?.provider || "",
                  providerAccountId: account?.providerAccountId || "",
                  refresh_token: account?.refresh_token,
                  access_token: account?.access_token,
                  expires_at: account?.expires_at,
                  token_type: account?.token_type,
                  scope: account?.scope,
                  id_token: account?.id_token,
                  session_state: account?.session_state?.toString() ?? "",
                },
              },
            },
          });
        }

        return true;
      }

      const userId = user.id;

      const existingUser = await prisma.user.findUnique({
        where: { id: userId }, // Busca el usuario por ID
      });
      if (!existingUser || !existingUser.emailVerified) {
        return false; // Retorna false si el usuario no existe o no está verificado
      }

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation =
          await prisma.twoFactorConfirmation.findUnique({
            where: { userId: existingUser.id },
          });

        if (!twoFactorConfirmation) {
          return false; // Retorna false si la confirmación de dos factores no existe
        }

        await prisma.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        }); // Elimina la confirmación de dos factores
      }

      await prisma.user.update({
        where: { id: userId },
        data: { lastLogin: new Date() }, // Actualiza la fecha del último inicio de sesión
      });

      return true; // Retorna true si el inicio de sesión es exitoso
    },
    async jwt({ token, user, account }) {
      if (account && account.access_token) {
        token.accessToken = account.access_token;
      }

      if (!token.sub) return token;

      const existingUser = await prisma.user.findUnique({
        where: { id: token.sub },
      });

      if (!existingUser) return token;

      // Get the most recent Google account
      const googleAccount = await prisma.account.findFirst({
        where: {
          userId: existingUser.id,
          provider: "google",
        },
        orderBy: {
          expires_at: "desc",
        },
      });

      if (googleAccount?.access_token) {
        token.accessToken = googleAccount.access_token;
      }

      const existingAccount = await prisma.account.findFirst({
        where: { userId: existingUser.id },
      });

      token.isOAuth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;

      const userWithRelations = await prisma.user.findUnique({
        where: { id: existingUser.id },
        include: { groups: true, tags: true, resources: true },
      });

      token.groups = userWithRelations?.groups.map((g) => g.name) || [];
      token.tags = userWithRelations?.tags.map((t) => t.name) || [];
      token.resources = userWithRelations?.resources.map((sr) => sr.name) || [];

      return token;
    },
    //@ts-expect-error
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (session.user) {
        session.user.role = token.role as UserRole;
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.isOAuth = token.isOAuth as boolean;
        session.user.groups = token.groups as string[];
        session.user.tags = token.tags as string[];
        session.user.resources = token.resources as string[];
        session.user.accessToken = token.accessToken as string;
      }

      const userExists = await prisma.user.findUnique({
        where: { id: token.sub },
      });

      if (!userExists) {
        return null;
      }

      return session;
    },
  },
});
