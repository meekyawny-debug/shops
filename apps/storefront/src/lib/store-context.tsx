"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StoreWithConfig } from "./types";

const StoreContext = createContext<StoreWithConfig | null>(null);

export function StoreProvider({
  store,
  children,
}: {
  store: StoreWithConfig;
  children: ReactNode;
}) {
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreWithConfig {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return store;
}
