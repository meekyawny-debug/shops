"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import {
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shops/ui";
import { ShoppingCart } from "lucide-react";

const statuses = [
  "ALL",
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

const statusColors: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "outline"> = {
  PENDING: "warning",
  PAID: "default",
  PROCESSING: "secondary",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
  REFUNDED: "destructive",
};

export default function OrdersPage() {
  const [status, setStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const { data: stores } = trpc.store.list.useQuery();
  const [storeId, setStoreId] = useState<string>("ALL");

  const { data, isLoading } = trpc.order.list.useQuery({
    status: status === "ALL" ? undefined : (status as "PENDING"),
    storeId: storeId === "ALL" ? undefined : storeId,
    page,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          All orders across all stores.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "ALL" ? "All Statuses" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={storeId} onValueChange={(v) => { setStoreId(v); setPage(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter store" />
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

        {data && (
          <span className="text-sm text-muted-foreground">
            {data.total} order{data.total !== 1 && "s"}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 rounded bg-muted" />
          ))}
        </div>
      ) : !data?.orders.length ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No orders found.</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left font-medium">Order</th>
                  <th className="p-4 text-left font-medium">Store</th>
                  <th className="p-4 text-left font-medium">Customer</th>
                  <th className="p-4 text-left font-medium">Status</th>
                  <th className="p-4 text-left font-medium">Items</th>
                  <th className="p-4 text-right font-medium">Total</th>
                  <th className="p-4 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-medium hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {order.store.name}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {order.customer.email}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={statusColors[order.status] || "secondary"}
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {order.items.length}
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

          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
