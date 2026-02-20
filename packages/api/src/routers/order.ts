import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@shops/db";
import { updateOrderSchema } from "@shops/types";

export const orderRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        storeId: z.string().cuid().optional(),
        status: z.enum([
          "PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
        ]).optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const { storeId, status, page = 1, limit = 20 } = input || {};

      const where = {
        ...(storeId && { storeId }),
        ...(status && { status }),
      };

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            store: true,
            customer: true,
            items: { include: { variant: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.order.count({ where }),
      ]);

      return { orders, total, page, totalPages: Math.ceil(total / limit) };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      return prisma.order.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          store: true,
          customer: true,
          items: {
            include: {
              variant: { include: { product: true } },
            },
          },
        },
      });
    }),

  update: protectedProcedure
    .input(updateOrderSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.order.update({
        where: { id },
        data,
        include: { store: true, customer: true, items: true },
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        status: z.enum([
          "PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
        ]),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.order.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  getRecentByStore: protectedProcedure
    .input(z.object({ storeId: z.string().cuid(), limit: z.number().default(5) }))
    .query(async ({ input }) => {
      return prisma.order.findMany({
        where: { storeId: input.storeId },
        include: { customer: true, items: true },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),
});
