"use client";

import { use } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { Button, Badge } from "@shops/ui";
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

export default function StoreOrdersPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = use(params);
  const { data: store } = trpc.store.getById.useQuery({ id: storeId });
  const { data, isLoading } = trpc.order.list.useQuery({ storeId });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/stores/${storeId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {store?.name} Orders
          </h1>
          <p className="text-muted-foreground">
            Orders placed through this store.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded bg-muted" />
          ))}
        </div>
      ) : !data?.orders.length ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">Order</th>
                <th className="p-4 text-left font-medium">Customer</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-right font-medium">Total</th>
                <th className="p-4 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="p-4">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-medium hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {order.customer.email}
                  </td>
                  <td className="p-4">
                    <Badge variant={statusColors[order.status] || "secondary"}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right font-medium">
                    ${Number(order.total).toFixed(2)}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
