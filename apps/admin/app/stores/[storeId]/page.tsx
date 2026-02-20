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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@shops/ui";
import { Package, ShoppingCart, Settings, Users } from "lucide-react";

export default function StoreDetailPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = use(params);
  const { data: store, isLoading } = trpc.store.getById.useQuery({ id: storeId });

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="h-64 rounded bg-muted" />
    </div>;
  }

  if (!store) return <p>Store not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{store.name}</h1>
            <Badge variant={store.isActive ? "success" : "secondary"}>
              {store.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            /{store.slug}
            {store.domain && ` · ${store.domain}`}
          </p>
        </div>
        <Link href={`/stores/${storeId}/settings`}>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{store._count.storeProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{store._count.orders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{store._count.customers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Branding Preview */}
      {store.config && (
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex gap-2">
                <div
                  className="h-10 w-10 rounded-full border"
                  style={{ backgroundColor: store.config.primaryColor }}
                  title="Primary"
                />
                <div
                  className="h-10 w-10 rounded-full border"
                  style={{ backgroundColor: store.config.secondaryColor }}
                  title="Secondary"
                />
                <div
                  className="h-10 w-10 rounded-full border"
                  style={{ backgroundColor: store.config.accentColor }}
                  title="Accent"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Heading: {store.config.fontHeading}</p>
                <p>Body: {store.config.fontBody}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="flex gap-3">
        <Link href={`/stores/${storeId}/products`}>
          <Button variant="outline">View Products</Button>
        </Link>
        <Link href={`/stores/${storeId}/orders`}>
          <Button variant="outline">View Orders</Button>
        </Link>
      </div>
    </div>
  );
}
