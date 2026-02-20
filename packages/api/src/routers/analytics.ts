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
});
