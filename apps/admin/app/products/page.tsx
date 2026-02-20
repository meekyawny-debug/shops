"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Input,
} from "@shops/ui";
import { Plus, Search, Package } from "lucide-react";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = trpc.product.list.useQuery({
    search: search || undefined,
    page,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Global product catalog across all stores.
          </p>
        </div>
        <Link href="/products/import">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Import Product
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        {data && (
          <span className="text-sm text-muted-foreground">
            {data.total} product{data.total !== 1 && "s"}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-square rounded bg-muted" />
                <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !data?.products.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-medium">No products yet</p>
              <p className="text-sm text-muted-foreground">
                Import your first product from CJ Dropshipping or AliExpress.
              </p>
            </div>
            <Link href="/products/import">
              <Button>Import Product</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data.products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  {product.images[0] && (
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-medium line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold">
                        ${Number(
                          product.variants[0]?.retailPrice || 0
                        ).toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Cost: ${Number(product.baseCost).toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {product.supplierType.replace("_", " ")}
                      </Badge>
                      {product.storeProducts.map((sp) => (
                        <Badge
                          key={sp.store.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {sp.store.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
