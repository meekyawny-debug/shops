import { serverTRPC } from "@/lib/trpc-server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from "@shops/ui";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  let analytics: Awaited<ReturnType<Awaited<ReturnType<typeof serverTRPC>>["analytics"]["overview"]>> | null = null;
  let storeRevenue: Awaited<ReturnType<Awaited<ReturnType<typeof serverTRPC>>["analytics"]["revenueByStore"]>> = [];

  try {
    const api = await serverTRPC();
    [analytics, storeRevenue] = await Promise.all([
      api.analytics.overview(),
      api.analytics.revenueByStore(),
    ]);
  } catch {
    // DB not connected yet — show placeholder
    analytics = null;
    storeRevenue = [];
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of all stores and operations.
        </p>
      </div>

      {!analytics ? (
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">Database not connected</p>
              <p className="text-sm text-muted-foreground">
                Set up your DATABASE_URL in .env and run &quot;pnpm db:push&quot; then &quot;pnpm db:seed&quot; to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analytics.totalRevenue.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalOrders}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.pendingOrders} need attention
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalProducts}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalCustomers}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Store Performance + Recent Orders */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Store Performance</CardTitle>
                <CardDescription>Revenue by store</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {storeRevenue.map((store) => (
                    <div
                      key={store.storeId}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Link
                          href={`/stores/${store.storeId}`}
                          className="font-medium hover:underline"
                        >
                          {store.storeName}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {store.orderCount} orders
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${store.totalRevenue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {storeRevenue.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No store data yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders across all stores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-medium hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="text-sm text-muted-foreground">
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
                        >
                          {order.status}
                        </Badge>
                        <span className="font-medium">
                          ${Number(order.total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {analytics.recentOrders.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No orders yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
