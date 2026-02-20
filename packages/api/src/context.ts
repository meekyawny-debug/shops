import { prisma } from "@shops/db";

export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface Context {
  prisma: typeof prisma;
  session: Session | null;
}

export function createContext(session: Session | null): Context {
  return {
    prisma,
    session,
  };
}
