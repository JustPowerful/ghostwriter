import { NextAuthConfig } from "next-auth";
import { db } from "../prisma/db";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface User {
    id?: string;
    email?: string | null;
  }
  interface Session {
    user: User;
  }
}

export const authOptions = {
  providers: [
    Credentials({
      credentials: {
        email: { type: "email", label: "Email", required: true },
        password: { type: "password", label: "Password", required: true },
      },
      async authorize(
        credentials: Partial<Record<"email" | "password", unknown>>
      ) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
