"use client";

import { use } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
} from "@shops/ui";
import { ArrowLeft, Plus, Package } from "lucide-react";

export default function StoreProductsPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = use(params);
  const { data: store } = trpc.store.getById.useQuery({ id: storeId });
  const { data, isLoading } = trpc.product.list.useQuery({ storeId });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/stores/${storeId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {store?.name} Products
          </h1>
          <p className="text-muted-foreground">
            Products assigned to this store.
          </p>
        </div>
        <Link href="/products/import">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Import Product
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-40 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !data?.products.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-medium">No products assigned</p>
              <p className="text-sm text-muted-foreground">
                Import products and assign them to this store.
              </p>
            </div>
            <Link href="/products/import">
              <Button>Import Product</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  <h3 className="font-medium">{product.title}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {product.variants.length} variant{product.variants.length !== 1 && "s"}
                    </span>
                    <span className="font-medium">
                      ${Number(product.variants[0]?.retailPrice || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {product.supplierType.replace("_", " ")}
                    </Badge>
                    {!product.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
