"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Loader2 } from "lucide-react";
import { Button } from "@shops/ui";
import { trpc } from "@/lib/trpc";
import { useStore } from "@/lib/store-context";
import { PriceDisplay } from "./price-display";

export function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const store = useStore();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setDebouncedQuery("");
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const { data, isLoading } = trpc.storefront.getProducts.useQuery(
    { storeSlug: store.slug, search: debouncedQuery, limit: 6 },
    { enabled: open && debouncedQuery.length >= 2 }
  );

  if (!open) return null;

  const results = data?.products || [];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-[10vh]">
        <div className="w-full max-w-lg mx-4 bg-background rounded-xl shadow-2xl border overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {debouncedQuery.length < 2 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Start typing to search...
              </div>
            ) : results.length === 0 && !isLoading ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No products found for &ldquo;{debouncedQuery}&rdquo;
              </div>
            ) : (
              <div className="py-2">
                {results.map((sp) => {
                  const firstVariant = sp.product.variants[0];
                  if (!firstVariant) return null;
                  const price = Number(sp.priceOverride ?? firstVariant.retailPrice);
                  const compareAtPrice = firstVariant.compareAtPrice
                    ? Number(firstVariant.compareAtPrice)
                    : null;
                  const image = sp.product.images[0];

                  return (
                    <Link
                      key={sp.id}
                      href={`/${store.slug}/products/${sp.product.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                        {image ? (
                          <Image
                            src={image.url}
                            alt={image.alt || sp.product.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {sp.product.title}
                        </p>
                        {sp.product.category && (
                          <p className="text-xs text-muted-foreground">
                            {sp.product.category}
                          </p>
                        )}
                      </div>
                      <PriceDisplay
                        price={price}
                        compareAtPrice={compareAtPrice}
                        size="sm"
                      />
                    </Link>
                  );
                })}
                {results.length > 0 && (
                  <Link
                    href={`/${store.slug}/products?search=${encodeURIComponent(debouncedQuery)}`}
                    onClick={onClose}
                    className="block text-center text-sm text-primary font-medium py-3 hover:underline border-t mt-1"
                  >
                    View all results &rarr;
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
