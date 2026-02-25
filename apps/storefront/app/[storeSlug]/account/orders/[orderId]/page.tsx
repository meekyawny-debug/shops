"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Package, Truck, ExternalLink } from "lucide-react";
import { Button } from "@shops/ui";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@/lib/utils";
import { openAuthModal } from "@/components/auth-modal";

export default function OrderDetailPage() {
  const params = useParams<{ storeSlug: string; orderId: string }>();
  const { data: session, status } = useSession();
  const storeSlug = params?.storeSlug;
  const orderId = params?.orderId;
  const customerId = (session?.user as { id?: string })?.id;

  const { data: ordersData } = trpc.storefront.getCustomerOrders.useQuery(
    { customerId: customerId!, limit: 100 },
    { enabled: !!customerId }
  );

  const order = ordersData?.orders.find((o) => o.id === orderId);

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-40 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold mb-3">Order Details</h1>
        <p className="text-muted-foreground mb-6">Log in to view this order.</p>
        <Button className="rounded-full px-8" onClick={() => openAuthModal()}>
          Log In / Sign Up
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="font-heading text-2xl font-bold mb-3">Order Not Found</h1>
        <Link href={`/${storeSlug}/account/orders`}>
          <Button variant="outline" className="rounded-full">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link
        href={`/${storeSlug}/account/orders`}
        className="text-sm text-primary hover:underline mb-4 block"
      >
        &larr; Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">
            Order #{order.orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
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
      </div>

      {/* Tracking */}
      {order.trackingNumber && (
        <div className="border rounded-xl p-4 mb-6 flex items-center gap-3">
          <Truck className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Tracking Number</p>
            <p className="text-sm text-muted-foreground font-mono">
              {order.trackingNumber}
            </p>
          </div>
          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="rounded-full">
                Track
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </Button>
            </a>
          )}
        </div>
      )}

      {/* Items */}
      <div className="border rounded-xl overflow-hidden mb-6">
        <div className="p-4 border-b bg-muted/30">
          <h2 className="font-medium">
            Items ({order.items.length})
          </h2>
        </div>
        <div className="divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{item.productTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {item.variantName} × {item.quantity}
                </p>
              </div>
              <p className="text-sm font-medium">
                {formatPrice(Number(item.totalPrice))}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="border rounded-xl p-4 space-y-2 text-sm mb-6">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(Number(order.subtotal))}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>
            {Number(order.shippingCost) === 0
              ? "Free"
              : formatPrice(Number(order.shippingCost))}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatPrice(Number(order.tax))}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
          <span>Total</span>
          <span>{formatPrice(Number(order.total))}</span>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shippingName && (
        <div className="border rounded-xl p-4">
          <h2 className="font-medium mb-2">Shipping Address</h2>
          <div className="text-sm text-muted-foreground space-y-0.5">
            <p>{order.shippingName}</p>
            {order.shippingAddress1 && <p>{order.shippingAddress1}</p>}
            {order.shippingAddress2 && <p>{order.shippingAddress2}</p>}
            <p>
              {[order.shippingCity, order.shippingState, order.shippingZip]
                .filter(Boolean)
                .join(", ")}
            </p>
            {order.shippingCountry && <p>{order.shippingCountry}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
