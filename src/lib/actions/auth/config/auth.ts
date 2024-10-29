import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Resend } from "resend";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import authConfig from "./auth.config";
import prisma from "../../../../../prisma/database";
import { UserRole } from "@prisma/client"; 

import { CredentialSigninSchema } from "../../../types/zod-schemas";
import { html, text } from "../../../utils/utils";

const resend = new Resend(process.env.RESEND_API_KEY);

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
            return null; // Authentication failed
          }

          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) {
            // Update lastLogin on successful login
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
    EmailProvider({
      id: "email",
      name: "Email",
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { from },
      }) {
        const { host } = new URL(url);

        try {
          await resend.emails.send({
            from: from ?? process.env.EMAIL_FROM ?? "default@example.com" ,
            to: email,
            subject: `Inicia sesión en ${host}`,
            html: html({ url, host, email, label: "Iniciar sesión" }),
            text: text({ url, host }),
          });
        } catch (error) {
          console.error("Error al enviar el correo de verificación:", error);
          throw error;
        }
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
    maxAge: 24 * 60 * 60, // Expiration Session date 24 hours in seconds
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
          // If the user already exists but is not linked to the provider
          const existingAccount = await prisma.account.findFirst({
            where: {
              provider: account?.provider,
              providerAccountId: account?.providerAccountId,
            },
          });

          if (!existingAccount) {
            // Link the OAuth account to the existing user
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account?.type || "", // Add default value of an empty string
                provider: account?.provider || "",
                providerAccountId: account?.providerAccountId || "",
                refresh_token: account?.refresh_token,
                access_token: account?.access_token,
                expires_at: account?.expires_at,
                token_type: account?.token_type,
                scope: account?.scope,
                id_token: account?.id_token,
                session_state: account?.session_state?.toString() ?? "", // Convert session_state to string or use an empty string as default
              },
            });
          }

          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              lastLogin: new Date(),
              image: user.image || existingUser.image, // Update the image if it exists
            },
          });
        } else {
          // Create a new user if no account exists
          existingUser = await prisma.user.create({
            data: {
              name: user.name,
              email: user?.email ?? "",
              image: user.image, // Save the profile image
              emailVerified: user.emailVerified ?? new Date(), // Only set if not already set
              lastLogin: new Date(),
              accounts: {
                createMany: {
                  data: [
                    {
                      type: account?.type || "", // Add default value of an empty string
                      provider: account?.provider || "", // Add default value of an empty string
                      providerAccountId: account?.providerAccountId || "", // Add default value of an empty string
                      refresh_token: account?.refresh_token,
                      access_token: account?.access_token,
                      expires_at: account?.expires_at,
                      token_type: account?.token_type,
                      scope: account?.scope,
                      id_token: account?.id_token,
                      session_state: account?.session_state?.toString() ?? "", // Convert session_state to string or use an empty string as default
                    },
                  ],
                },
              },
            },
          });
        }

        return true;
      }

      const userId = user.id; // This will be a valid ObjectId for non-OAuth logins

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

        console.log("twoFactorConfirmation", twoFactorConfirmation);

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

      // Fetch user with relations
      const userWithRelations = await prisma.user.findUnique({
        where: { id: existingUser.id },
        include: { groups: true, tags: true, resources: true },
      });

      // Add group, tag, and service resource information to the token
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

      // Check if the user still exists in the database
      const userExists = await prisma.user.findUnique({
        where: { id: token.sub },
      });

      if (!userExists) {
        // Invalidate session if user no longer exists
        return null;
      }

      return session;
    },
  },
});
