import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { LoginSchema } from "@/src/lib/types/inside-schemas";
import { getUserByEmail } from "@/src/lib/actions/user/get-user";


export default {
  providers: [
    Google({
      clientId: "1014725709960-j00f1pdf5n4o503a95npudkk151upfq8.apps.googleusercontent.com",
      clientSecret: "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",
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          
          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(
            password,
            user.password,
          );

          if (passwordsMatch) return user;
        }

        return null;
      }
    })
  ],
  pages: {
    signIn: "/auth/login",
    verifyRequest: "/auth/verify-request",
    error: "/auth/auth-error",
  },
} satisfies NextAuthConfig;
