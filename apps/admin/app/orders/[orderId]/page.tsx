"use client";

import { use } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "@shops/ui";
import { ArrowLeft } from "lucide-react";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "outline"> = {
  PENDING: "warning",
  PAID: "default",
  PROCESSING: "secondary",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
  REFUNDED: "destructive",
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const { data: order, isLoading, refetch } = trpc.order.getById.useQuery({
    id: orderId,
  });
  const updateStatus = trpc.order.updateStatus.useMutation({
    onSuccess: () => refetch(),
  });

  if (isLoading) {
    return <div className="animate-pulse h-96 rounded bg-muted" />;
  }

  if (!order) return <p>Order not found.</p>;

  const profit = order.items.reduce(
    (sum, item) =>
      sum + (Number(item.totalPrice) - Number(item.unitCost) * item.quantity),
    0
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {order.orderNumber}
          </h1>
          <p className="text-muted-foreground">
            {order.store.name} &middot;{" "}
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge
          variant={statusColors[order.status] || "secondary"}
          className="text-base px-3 py-1"
        >
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Customer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>{order.customer.email}</p>
            {order.customer.firstName && (
              <p>
                {order.customer.firstName} {order.customer.lastName}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Shipping */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {order.shippingName && <p>{order.shippingName}</p>}
            {order.shippingAddress1 && <p>{order.shippingAddress1}</p>}
            {order.shippingAddress2 && <p>{order.shippingAddress2}</p>}
            <p>
              {[order.shippingCity, order.shippingState, order.shippingZip]
                .filter(Boolean)
                .join(", ")}
            </p>
            {order.shippingCountry && <p>{order.shippingCountry}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-right">Cost</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-3">
                      <p className="font-medium">{item.productTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.variantName}
                      </p>
                    </td>
                    <td className="p-3 text-right">{item.quantity}</td>
                    <td className="p-3 text-right">
                      ${Number(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
                      ${Number(item.unitCost).toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-medium">
                      ${Number(item.totalPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-2 text-right text-sm">
            <p>Subtotal: ${Number(order.subtotal).toFixed(2)}</p>
            <p>Shipping: ${Number(order.shippingCost).toFixed(2)}</p>
            <p>Tax: ${Number(order.tax).toFixed(2)}</p>
            <Separator />
            <p className="text-lg font-bold">
              Total: ${Number(order.total).toFixed(2)}
            </p>
            <p className="text-green-600 font-medium">
              Profit: ${profit.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status & Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Status & Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Update Status:</Label>
            <Select
              value={order.status}
              onValueChange={(v) =>
                updateStatus.mutate({
                  id: orderId,
                  status: v as "PENDING",
                })
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].map(
                  (s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {order.trackingNumber && (
            <div className="text-sm">
              <p>
                <span className="font-medium">Tracking:</span>{" "}
                {order.trackingNumber}
              </p>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Track shipment
                </a>
              )}
            </div>
          )}

          {order.supplierOrderId && (
            <p className="text-sm text-muted-foreground">
              Supplier Order: {order.supplierOrderId}
            </p>
          )}

          {order.notes && (
            <div className="text-sm">
              <p className="font-medium">Notes:</p>
              <p className="text-muted-foreground">{order.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={className}>{children}</span>;
}
