"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shops/ui";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { StoreRevenueChart } from "@/components/charts/store-revenue-chart";
import { OrderStatusChart } from "@/components/charts/order-status-chart";

const TIME_PERIODS = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
];

export default function DashboardPage() {
  const [storeId, setStoreId] = useState<string>("ALL");
  const [days, setDays] = useState<string>("30");

  const storeInput = storeId === "ALL" ? undefined : { storeId };

  const { data: stores } = trpc.store.list.useQuery();
  const { data: overview, isLoading } = trpc.analytics.overview.useQuery(storeInput);
  const { data: storeRevenue } = trpc.analytics.revenueByStore.useQuery();
  const { data: revenueOverTime } = trpc.analytics.revenueOverTime.useQuery(
    storeId === "ALL"
      ? { days: Number(days) }
      : { storeId, days: Number(days) }
  );
  const { data: ordersByStatus } = trpc.analytics.ordersByStatus.useQuery(storeInput);
  const { data: topProducts } = trpc.analytics.topProducts.useQuery(
    storeId === "ALL" ? { limit: 5 } : { storeId, limit: 5 }
  );
  const { data: lowStock } = trpc.analytics.lowStockProducts.useQuery({ threshold: 10, limit: 8 });

  const profitMargin =
    overview && overview.totalRevenue > 0
      ? ((overview.totalProfit / overview.totalRevenue) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of all stores and operations.
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${overview.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 font-medium">{profitMargin}%</span> profit margin
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{overview.totalOrders}</span>
                  {overview.pendingOrders > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {overview.pendingOrders} pending
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  across all stores
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  registered customers
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${overview.averageOrderValue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  per order
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
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
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Store</CardTitle>
                <CardDescription>Total revenue comparison</CardDescription>
              </CardHeader>
              <CardContent>
                {storeRevenue && storeRevenue.length > 0 ? (
                  <StoreRevenueChart data={storeRevenue} />
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                    No store data yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Orders by Status */}
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

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>By revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts && topProducts.length > 0 ? (
                    topProducts.map((product, i) => {
                      const maxRevenue = topProducts[0]?.totalRevenue || 1;
                      const pct = (product.totalRevenue / maxRevenue) * 100;
                      return (
                        <div key={product.variantId} className="flex items-center gap-3">
                          <span className="text-sm font-bold text-muted-foreground w-5">
                            {i + 1}
                          </span>
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.productTitle}
                              className="h-9 w-9 rounded object-cover"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded bg-muted" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {product.productTitle}
                            </p>
                            <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-medium tabular-nums whitespace-nowrap">
                            ${product.totalRevenue.toFixed(0)}
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

            {/* Recent Orders + Low Stock */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overview.recentOrders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-sm font-medium hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                          <p className="text-xs text-muted-foreground truncate">
                            {order.store.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              order.status === "DELIVERED"
                                ? "success"
                                : order.status === "CANCELLED"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {order.status}
                          </Badge>
                          <span className="text-sm font-medium tabular-nums">
                            ${Number(order.total).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {overview.recentOrders.length === 0 && (
                      <p className="text-sm text-muted-foreground">No orders yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">Low Stock Alerts</CardTitle>
                    {lowStock && lowStock.length > 0 && (
                      <Badge variant="destructive" className="text-[10px]">
                        {lowStock.length}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    {lowStock && lowStock.length > 0 ? (
                      lowStock.slice(0, 5).map((item) => (
                        <div key={item.variantId} className="flex items-center gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{item.productTitle}</p>
                          </div>
                          <Badge
                            variant={item.stock === 0 ? "destructive" : "secondary"}
                            className="text-[10px] shrink-0"
                          >
                            {item.stock === 0 ? "Out" : `${item.stock} left`}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">All stock levels healthy.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Clock className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">Loading dashboard data...</p>
              <p className="text-sm text-muted-foreground">
                If this persists, check your database connection.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
