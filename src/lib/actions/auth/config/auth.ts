import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import authConfig from "./auth.config";
import prisma from "../../../../../prisma/database";

import { CredentialSigninSchema } from "../../../types/zod-schemas";
import { UserRole } from "@prisma/client";

// Email template functions
function html({
  url,
  host,
  theme = { brandColor: "#346df1", buttonText: "#fff" },
}: {
  url: string;
  host: string;
  theme?: { brandColor: string; buttonText: string };
}) {
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
  return `Iniciar sesión en ${host}\n${url}\n\n`;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "UserEmail", type: "email", placeholder: "your email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
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
            return user;
          }
        }
        return null;
      },
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.EMAIL_FROM ?? "noreply@insidehair.es",
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { from },
      }) {
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
            html: html({ url, host }),
            text: text({ url, host }),
          }),
        });

        if (!response.ok) {
          throw new Error(
            "Error al enviar el correo de verificación: " +
              JSON.stringify(await response.json())
          );
        }
      },
      normalizeIdentifier(identifier: string): string {
        let [local, domain] = identifier.toLowerCase().trim().split("@");
        domain = domain.split(",")[0];
        return `${local}@${domain}`;
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  events: {
    async linkAccount({ user }) {
      console.log("linkAccount event called");
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: user.emailVerified ?? new Date(),
          lastLogin: new Date(),
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
                createMany: {
                  data: [
                    {
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
                  ],
                },
              },
            },
          });
        }

        return true;
      }

      const userId = user.id;

      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!existingUser || !existingUser.emailVerified) {
        return false;
      }

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation =
          await prisma.twoFactorConfirmation.findUnique({
            where: { userId: existingUser.id },
          });

        if (!twoFactorConfirmation) {
          return false;
        }

        await prisma.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { lastLogin: new Date() },
      });

      return true;
    },
    async jwt({ token, user }) {
      if (!token.sub) return token;

      const existingUser = await prisma.user.findUnique({
        where: { id: token.sub },
      });

      if (!existingUser) return token;

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
