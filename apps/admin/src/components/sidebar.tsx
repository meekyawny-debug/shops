"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  BarChart3,
  LogOut,
  Import,
  ChevronDown,
} from "lucide-react";
import { cn, Button, Separator, Badge } from "@shops/ui";
import { trpc } from "@/lib/trpc";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/stores", label: "Stores", icon: Store },
  { href: "/products", label: "Products", icon: Package },
  { href: "/products/import", label: "Import", icon: Import },
  { href: "/orders", label: "Orders", icon: ShoppingCart, badgeKey: "orders" as const },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [storesOpen, setStoresOpen] = useState(true);

  const { data: stores } = trpc.store.list.useQuery(undefined, {
    staleTime: 60_000,
  });
  const { data: overview } = trpc.analytics.overview.useQuery(undefined, {
    staleTime: 30_000,
  });

  const pendingOrders = overview?.pendingOrders ?? 0;

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            S
          </div>
          <span className="text-lg font-bold">Shops Admin</span>
        </Link>
      </div>
      <Separator />
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary-foreground" />
              )}
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.badgeKey === "orders" && pendingOrders > 0 && (
                <Badge
                  variant={isActive ? "secondary" : "destructive"}
                  className="h-5 min-w-5 px-1.5 text-[10px] font-bold"
                >
                  {pendingOrders}
                </Badge>
              )}
            </Link>
          );
        })}

        {/* Store Quick Links */}
        {stores && stores.length > 0 && (
          <>
            <div className="pt-3" />
            <button
              onClick={() => setStoresOpen(!storesOpen)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  !storesOpen && "-rotate-90"
                )}
              />
              Stores
            </button>
            {storesOpen && (
              <div className="space-y-0.5 pl-2">
                {stores.map((store) => {
                  const storeActive =
                    pathname === `/stores/${store.id}`;
                  return (
                    <Link
                      key={store.id}
                      href={`/stores/${store.id}`}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                        storeActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full shrink-0",
                          store.isActive ? "bg-green-500" : "bg-muted-foreground/40"
                        )}
                      />
                      <span className="truncate">{store.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </nav>
      <Separator />
      <div className="p-4">
        <form action="/api/auth/signout" method="POST">
          <Button variant="ghost" className="w-full justify-start gap-3" type="submit">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  );
}
