import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createContext } from "@shops/api";
import { auth } from "@/lib/auth";

const handler = async (req: Request) => {
  const session = await auth();

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () =>
      createContext(
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
      ),
  });
};

export { handler as GET, handler as POST };
