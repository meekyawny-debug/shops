import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/** Helper: create a Prisma client scoped to a specific store */
export function storeScoped(storeId: string) {
  return prisma.$extends({
    query: {
      $allOperations({ args, query }) {
        const argsWithStore = args as Record<string, unknown>;
        if ("where" in args) {
          (argsWithStore.where as Record<string, unknown>).storeId = storeId;
        }
        return query(argsWithStore);
      },
    },
  });
}
