import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@shops/db";
import { hash } from "crypto";

function hashPassword(password: string): string {
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

        const passwordHash = hashPassword(credentials.password as string);
        if (customer.passwordHash !== passwordHash) return null;

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
