"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Package, MapPin, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@shops/ui";
import { trpc } from "@/lib/trpc";
import { openAuthModal } from "@/components/auth-modal";

export default function AccountClient() {
  const params = useParams<{ storeSlug: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const storeSlug = params?.storeSlug;

  const customerId = (session?.user as { id?: string })?.id;

  const { data: account } = trpc.storefront.getCustomerAccount.useQuery(
    { customerId: customerId! },
    { enabled: !!customerId }
  );

  const { data: ordersData } = trpc.storefront.getCustomerOrders.useQuery(
    { customerId: customerId!, limit: 5 },
    { enabled: !!customerId }
  );

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-64" />
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold mb-3">My Account</h1>
        <p className="text-muted-foreground mb-6">
          Log in to view your orders and account details.
        </p>
        <Button className="rounded-full px-8" onClick={() => openAuthModal()}>
          Log In / Sign Up
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold">
            My Account
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {account?.firstName || session.user.name || session.user.email}
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => signOut({ redirect: false })}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Orders
            </h2>
            <Link
              href={`/${storeSlug}/account/orders`}
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          {ordersData && ordersData.orders.length > 0 ? (
            <div className="space-y-3">
              {ordersData.orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/${storeSlug}/account/orders/${order.id}`}
                  className="flex items-center justify-between py-2 hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">#{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} items
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.status === "DELIVERED"
                        ? "bg-green-100 text-green-700"
                        : order.status === "SHIPPED"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "PAID" || order.status === "PROCESSING"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "CANCELLED" || order.status === "REFUNDED"
                              ? "bg-red-100 text-red-700"
                              : "bg-muted text-muted-foreground"
                    }`}>
                      {order.status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
        </div>

        {/* Saved Address */}
        <div className="border rounded-xl p-6">
          <h2 className="font-heading text-lg font-semibold flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5" />
            Saved Address
          </h2>
          {account?.shippingAddress1 ? (
            <div className="text-sm space-y-1">
              <p>{account.firstName} {account.lastName}</p>
              <p>{account.shippingAddress1}</p>
              {account.shippingAddress2 && <p>{account.shippingAddress2}</p>}
              <p>
                {account.shippingCity}, {account.shippingState} {account.shippingZip}
              </p>
              {account.shippingCountry && <p>{account.shippingCountry}</p>}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No saved address. Your checkout address will be saved here automatically.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
