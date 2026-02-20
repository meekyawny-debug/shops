"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from "@shops/ui";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
} from "lucide-react";

export default function AnalyticsPage() {
  const [storeId, setStoreId] = useState<string>("ALL");
  const { data: stores } = trpc.store.list.useQuery();
  const { data: overview, isLoading } = trpc.analytics.overview.useQuery(
    storeId === "ALL" ? undefined : { storeId }
  );
  const { data: topProducts } = trpc.analytics.topProducts.useQuery(
    storeId === "ALL" ? undefined : { storeId }
  );
  const { data: storeRevenue } = trpc.analytics.revenueByStore.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Revenue, profit, and performance metrics.
          </p>
        </div>
        <Select value={storeId} onValueChange={setStoreId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All stores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Stores</SelectItem>
            {stores?.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : overview ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${overview.totalRevenue.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${overview.totalProfit.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  AOV: ${overview.averageOrderValue.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overview.totalProducts}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue by Store */}
            {storeId === "ALL" && storeRevenue && (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Store</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {storeRevenue.map((store) => (
                      <div
                        key={store.storeId}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{store.storeName}</p>
                          <p className="text-sm text-muted-foreground">
                            {store.orderCount} orders
                          </p>
                        </div>
                        <span className="text-lg font-bold">
                          ${store.totalRevenue.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>By revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts?.length ? (
                    topProducts.map((product, i) => (
                      <div
                        key={product.variantId}
                        className="flex items-center gap-3"
                      >
                        <span className="text-sm font-bold text-muted-foreground w-6">
                          #{i + 1}
                        </span>
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.productTitle}
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {product.productTitle}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.totalQuantity} sold
                          </p>
                        </div>
                        <span className="font-medium">
                          ${product.totalRevenue.toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No sales data yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
