import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@shops/db";
import { createStoreSchema, updateStoreSchema, storeConfigSchema } from "@shops/types";

export const storeRouter = router({
  list: protectedProcedure.query(async () => {
    return prisma.store.findMany({
      include: { config: true, _count: { select: { storeProducts: true, orders: true } } },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      return prisma.store.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          config: true,
          _count: {
            select: { storeProducts: true, orders: true, customers: true },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(createStoreSchema)
    .mutation(async ({ input }) => {
      const { config, ...storeData } = input;
      return prisma.store.create({
        data: {
          ...storeData,
          config: config ? { create: config } : undefined,
        },
        include: { config: true },
      });
    }),

  update: protectedProcedure
    .input(updateStoreSchema)
    .mutation(async ({ input }) => {
      const { id, config, ...storeData } = input;
      return prisma.store.update({
        where: { id },
        data: {
          ...storeData,
          config: config
            ? {
                upsert: {
                  create: config,
                  update: config,
                },
              }
            : undefined,
        },
        include: { config: true },
      });
    }),

  updateConfig: protectedProcedure
    .input(
      z.object({
        storeId: z.string().cuid(),
        config: storeConfigSchema,
      })
    )
    .mutation(async ({ input }) => {
      return prisma.storeConfig.upsert({
        where: { storeId: input.storeId },
        create: { storeId: input.storeId, ...input.config },
        update: input.config,
      });
    }),

  toggleActive: protectedProcedure
    .input(z.object({ id: z.string().cuid(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      return prisma.store.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      return prisma.store.delete({ where: { id: input.id } });
    }),
});
