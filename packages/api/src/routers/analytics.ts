import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@shops/db";

export const analyticsRouter = router({
  overview: protectedProcedure
    .input(z.object({ storeId: z.string().cuid().optional() }).optional())
    .query(async ({ input }) => {
      const storeFilter = input?.storeId ? { storeId: input.storeId } : {};

      const [
        totalOrders,
        pendingOrders,
        totalRevenue,
        totalProducts,
        totalCustomers,
        recentOrders,
      ] = await Promise.all([
        prisma.order.count({ where: storeFilter }),
        prisma.order.count({
          where: { ...storeFilter, status: { in: ["PENDING", "PAID", "PROCESSING"] } },
        }),
        prisma.order.aggregate({
          where: { ...storeFilter, status: { notIn: ["CANCELLED", "REFUNDED"] } },
          _sum: { total: true },
        }),
        input?.storeId
          ? prisma.storeProduct.count({ where: { storeId: input.storeId, isActive: true } })
          : prisma.product.count({ where: { isActive: true } }),
        prisma.customer.count({ where: storeFilter }),
        prisma.order.findMany({
          where: storeFilter,
          include: { store: true, customer: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

      // Calculate profit from order items
      const orderItems = await prisma.orderItem.findMany({
        where: {
          order: {
            ...storeFilter,
            status: { notIn: ["CANCELLED", "REFUNDED"] },
          },
        },
        select: { totalPrice: true, unitCost: true, quantity: true },
      });

      const totalCost = orderItems.reduce(
        (sum, item) => sum + Number(item.unitCost) * item.quantity,
        0
      );
      const revenue = Number(totalRevenue._sum.total || 0);

      return {
        totalOrders,
        pendingOrders,
        totalRevenue: revenue,
        totalProfit: revenue - totalCost,
        totalProducts,
        totalCustomers,
        averageOrderValue: totalOrders > 0 ? revenue / totalOrders : 0,
        recentOrders,
      };
    }),

  revenueByStore: protectedProcedure.query(async () => {
    const stores = await prisma.store.findMany({
      include: {
        orders: {
          where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
          select: { total: true },
        },
        _count: { select: { orders: true } },
      },
    });

    return stores.map((store) => ({
      storeId: store.id,
      storeName: store.name,
      slug: store.slug,
      totalRevenue: store.orders.reduce(
        (sum, o) => sum + Number(o.total),
        0
      ),
      orderCount: store._count.orders,
    }));
  }),

  topProducts: protectedProcedure
    .input(
      z.object({
        storeId: z.string().cuid().optional(),
        limit: z.number().default(10),
      }).optional()
    )
    .query(async ({ input }) => {
      const items = await prisma.orderItem.groupBy({
        by: ["variantId"],
        where: input?.storeId
          ? { order: { storeId: input.storeId } }
          : undefined,
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { totalPrice: "desc" } },
        take: input?.limit || 10,
      });

      const variantIds = items.map((i) => i.variantId);
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: { include: { images: { take: 1 } } } },
      });

      const variantMap = new Map(variants.map((v) => [v.id, v]));

      return items.map((item) => {
        const variant = variantMap.get(item.variantId);
        return {
          variantId: item.variantId,
          productTitle: variant?.product.title || "Unknown",
          variantName: variant?.name || "",
          imageUrl: variant?.product.images[0]?.url || null,
          totalQuantity: item._sum.quantity || 0,
          totalRevenue: Number(item._sum.totalPrice || 0),
        };
      });
    }),

  revenueOverTime: protectedProcedure
    .input(
      z
        .object({
          storeId: z.string().cuid().optional(),
          days: z.number().min(1).max(365).default(30),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const days = input?.days ?? 30;
      const since = new Date();
      since.setDate(since.getDate() - days);

      const storeFilter = input?.storeId ? { storeId: input.storeId } : {};

      const orders = await prisma.order.findMany({
        where: {
          ...storeFilter,
          status: { notIn: ["CANCELLED", "REFUNDED"] },
          createdAt: { gte: since },
        },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      });

      const byDate = new Map<string, { revenue: number; orders: number }>();

      // Pre-fill all dates so chart has no gaps
      for (let d = 0; d < days; d++) {
        const date = new Date(since);
        date.setDate(date.getDate() + d + 1);
        const key = date.toISOString().slice(0, 10);
        byDate.set(key, { revenue: 0, orders: 0 });
      }

      for (const order of orders) {
        const key = order.createdAt.toISOString().slice(0, 10);
        const entry = byDate.get(key) || { revenue: 0, orders: 0 };
        entry.revenue += Number(order.total);
        entry.orders += 1;
        byDate.set(key, entry);
      }

      return Array.from(byDate.entries()).map(([date, data]) => ({
        date,
        revenue: Math.round(data.revenue * 100) / 100,
        orders: data.orders,
      }));
    }),

  ordersByStatus: protectedProcedure
    .input(z.object({ storeId: z.string().cuid().optional() }).optional())
    .query(async ({ input }) => {
      const storeFilter = input?.storeId ? { storeId: input.storeId } : {};

      const grouped = await prisma.order.groupBy({
        by: ["status"],
        where: storeFilter,
        _count: { _all: true },
      });

      return grouped.map((g) => ({
        status: g.status,
        count: g._count._all,
      }));
    }),

  lowStockProducts: protectedProcedure
    .input(
      z
        .object({
          threshold: z.number().default(10),
          limit: z.number().default(20),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const threshold = input?.threshold ?? 10;
      const limit = input?.limit ?? 20;

      const variants = await prisma.productVariant.findMany({
        where: { stock: { lt: threshold } },
        include: {
          product: {
            include: { images: { take: 1 } },
          },
        },
        orderBy: { stock: "asc" },
        take: limit,
      });

      return variants.map((v) => ({
        variantId: v.id,
        productTitle: v.product.title,
        variantName: v.name,
        sku: v.sku,
        stock: v.stock,
        imageUrl: v.product.images[0]?.url || null,
      }));
    }),
});
