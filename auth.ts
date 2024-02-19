import NextAuth from "next-auth"
// import { UserRole } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";

import  prisma from "@/prisma"
import authConfig from "@/auth.config";
import { getUserById } from "@/data/user"



export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  events: {
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
  },callbacks: {
  async session({ session, token }) {
    if (token.sub && session.user) {
      session.user.id = token.sub
    }

    if (token.role && session.user) {
      session.user.role = token.role as any;
    }

    if (token.image && session.user) {
      session.user.image = token.image as string;
    }

    return session
  },
  async jwt({ token } ) {


    if (!token.sub) {
      return token
    }

    const existingUser = await getUserById(token.sub)

    if (!existingUser) {
      return token
    }

    token.role= existingUser.role


    return token
  },
  },
  adapter: PrismaAdapter(prisma),
  session: {strategy: "jwt"},
  ...authConfig
})