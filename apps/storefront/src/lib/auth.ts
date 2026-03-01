import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@shops/db";
import { hash } from "crypto";
import bcrypt from "bcryptjs";

function legacySha256(password: string): string {
  return hash("sha256", password);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        storeId: { label: "Store ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.storeId) {
          return null;
        }

        const customer = await prisma.customer.findUnique({
          where: {
            storeId_email: {
              storeId: credentials.storeId as string,
              email: credentials.email as string,
            },
          },
        });

        if (!customer || !customer.passwordHash) return null;

        const password = credentials.password as string;
        const isBcrypt = customer.passwordHash.startsWith("$2");

        if (isBcrypt) {
          // Modern bcrypt hash
          const match = await bcrypt.compare(password, customer.passwordHash);
          if (!match) return null;
        } else {
          // Legacy SHA256 — verify then upgrade
          const sha256Hash = legacySha256(password);
          if (customer.passwordHash !== sha256Hash) return null;

          // Opportunistically rehash to bcrypt
          const bcryptHash = await bcrypt.hash(password, 12);
          await prisma.customer.update({
            where: { id: customer.id },
            data: { passwordHash: bcryptHash },
          });
        }

        return {
          id: customer.id,
          email: customer.email,
          name: [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
