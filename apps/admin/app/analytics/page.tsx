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
} from "@shops/ui";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
} from "lucide-react";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { StoreRevenueChart } from "@/components/charts/store-revenue-chart";
import { OrderStatusChart } from "@/components/charts/order-status-chart";

const TIME_PERIODS = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
];

export default function AnalyticsPage() {
  const [storeId, setStoreId] = useState<string>("ALL");
  const [days, setDays] = useState<string>("30");

  const storeInput = storeId === "ALL" ? undefined : { storeId };

  const { data: stores } = trpc.store.list.useQuery();
  const { data: overview, isLoading } = trpc.analytics.overview.useQuery(storeInput);
  const { data: topProducts } = trpc.analytics.topProducts.useQuery(
    storeId === "ALL" ? { limit: 10 } : { storeId, limit: 10 }
  );
  const { data: storeRevenue } = trpc.analytics.revenueByStore.useQuery();
  const { data: revenueOverTime } = trpc.analytics.revenueOverTime.useQuery(
    storeId === "ALL"
      ? { days: Number(days) }
      : { storeId, days: Number(days) }
  );
  const { data: ordersByStatus } = trpc.analytics.ordersByStatus.useQuery(storeInput);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Revenue, profit, and performance metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={storeId} onValueChange={setStoreId}>
            <SelectTrigger className="w-44">
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
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${overview.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  ${overview.totalProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                {overview.totalRevenue > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {((overview.totalProfit / overview.totalRevenue) * 100).toFixed(1)}% margin
                  </p>
                )}
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
                <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.totalProducts}</div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Profit Trend</CardTitle>
              <CardDescription>Daily revenue over the last {days} days</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueOverTime && revenueOverTime.length > 0 ? (
                <RevenueChart data={revenueOverTime} />
              ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                  No revenue data for this period.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Middle Row: Store Revenue + Order Status */}
          <div className="grid gap-4 md:grid-cols-2">
            {storeId === "ALL" && storeRevenue && storeRevenue.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Store</CardTitle>
                  <CardDescription>Total revenue comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <StoreRevenueChart data={storeRevenue} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Store</CardTitle>
                  <CardDescription>Select &quot;All Stores&quot; to compare</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                    {storeId !== "ALL"
                      ? "Switch to \"All Stores\" to see comparison."
                      : "No store data yet."}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
                <CardDescription>Current status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersByStatus && ordersByStatus.length > 0 ? (
                  <OrderStatusChart data={ordersByStatus} />
                ) : (
                  <p className="text-sm text-muted-foreground">No orders yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>By revenue — top 10</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts && topProducts.length > 0 ? (
                  topProducts.map((product, i) => {
                    const maxRevenue = topProducts[0]?.totalRevenue || 1;
                    const pct = (product.totalRevenue / maxRevenue) * 100;
                    return (
                      <div
                        key={product.variantId}
                        className="flex items-center gap-3"
                      >
                        <span className="text-sm font-bold text-muted-foreground w-6">
                          #{i + 1}
                        </span>
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.productTitle}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {product.productTitle}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.totalQuantity} sold
                          </p>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="font-medium tabular-nums">
                          ${product.totalRevenue.toFixed(2)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No sales data yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
