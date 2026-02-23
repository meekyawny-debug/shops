import { appRouter, createContext } from "@shops/api";

export const serverTrpc = appRouter.createCaller(createContext(null));
