import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import authConfig from "./auth.config";
import prisma from "../../../../prisma/database";

import { CredentialSigninSchema } from "../../types/zod-schemas";
import { html, text } from "../../utils/utils";

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
      server: {
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.GOOGLE_USER_EMAIL,
          pass: process.env.GOOGLE_USER_APP_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from },
      }) {
        const { host } = new URL(url);
        const transport = nodemailer.createTransport(server);
        await transport.sendMail({
          to: email,
          from,
          subject: `Login to ${host}`,
          text: text({ url, host }),
          html: html({ url, host, email, label: "Sign in" }),
        });
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
  session: { strategy: "jwt" },
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

      const existingUser = await prisma.user.findFirst({
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

      return token;
    },
    //@ts-expect-error
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role;
      }

      if (token.image && session.user) {
        session.user.image = token.image;
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.isOAuth = token.isOAuth;
      }

      return session;
    },
  },
});
