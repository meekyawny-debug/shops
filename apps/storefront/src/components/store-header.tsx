"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, Search, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@shops/ui";
import { useStore } from "@/lib/store-context";
import { useCart } from "@/lib/cart-context";
import { CartSidebar } from "./cart-sidebar";
import { SearchModal } from "./search-modal";
import { openAuthModal } from "./auth-modal";

export function StoreHeader() {
  const store = useStore();
  const { itemCount, toggleCart } = useCart();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link
              href={`/${store.slug}`}
              className="font-heading text-2xl font-bold tracking-widest uppercase"
            >
              {store.name}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href={`/${store.slug}`}
                className="text-sm font-medium uppercase tracking-wider hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                href={`/${store.slug}/products`}
                className="text-sm font-medium uppercase tracking-wider hover:text-primary transition-colors"
              >
                Shop All
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
              {session?.user ? (
                <Link href={`/${store.slug}/account`}>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => openAuthModal()}>
                  <User className="h-5 w-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={toggleCart}
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t pb-4">
              <nav className="flex flex-col gap-2 pt-4">
                <Link
                  href={`/${store.slug}`}
                  className="text-sm font-medium uppercase tracking-wider py-2 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href={`/${store.slug}/products`}
                  className="text-sm font-medium uppercase tracking-wider py-2 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Shop All
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
      <CartSidebar />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
