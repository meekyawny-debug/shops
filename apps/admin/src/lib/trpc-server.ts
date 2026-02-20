import "server-only";
import { appRouter, createContext } from "@shops/api";
import { auth } from "./auth";

export async function serverTRPC() {
  const session = await auth();
  const ctx = createContext(
    session?.user
      ? {
          user: {
            id: session.user.id!,
            email: session.user.email!,
            name: session.user.name!,
            role: (session.user as { role: string }).role,
          },
        }
      : null
  );
  return appRouter.createCaller(ctx);
}
