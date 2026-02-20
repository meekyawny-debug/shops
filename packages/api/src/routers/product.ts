import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@shops/db";
import {
  createProductSchema,
  updateProductSchema,
  assignToStoreSchema,
} from "@shops/types";
import {
  CJDropshippingAdapter,
  AliExpressAdapter,
  importProduct,
} from "@shops/suppliers";

export const productRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        storeId: z.string().cuid().optional(),
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const { storeId, search, page = 1, limit = 20 } = input || {};

      const where = {
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { category: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(storeId && {
          storeProducts: { some: { storeId } },
        }),
      };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            variants: true,
            images: { orderBy: { position: "asc" } },
            storeProducts: { include: { store: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);

      return { products, total, page, totalPages: Math.ceil(total / limit) };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      return prisma.product.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          variants: true,
          images: { orderBy: { position: "asc" } },
          storeProducts: { include: { store: true } },
        },
      });
    }),

  create: protectedProcedure
    .input(createProductSchema)
    .mutation(async ({ input }) => {
      const { variants, images, ...productData } = input;
      return prisma.product.create({
        data: {
          ...productData,
          variants: { create: variants },
          images: { create: images },
        },
        include: { variants: true, images: true },
      });
    }),

  update: protectedProcedure
    .input(updateProductSchema)
    .mutation(async ({ input }) => {
      const { id, variants, images, ...productData } = input;
      return prisma.product.update({
        where: { id },
        data: productData,
        include: { variants: true, images: true },
      });
    }),

  assignToStore: protectedProcedure
    .input(assignToStoreSchema)
    .mutation(async ({ input }) => {
      return prisma.storeProduct.upsert({
        where: {
          storeId_productId: {
            storeId: input.storeId,
            productId: input.productId,
          },
        },
        create: input,
        update: {
          priceOverride: input.priceOverride,
          isActive: input.isActive,
          isFeatured: input.isFeatured,
          position: input.position,
        },
      });
    }),

  removeFromStore: protectedProcedure
    .input(
      z.object({
        storeId: z.string().cuid(),
        productId: z.string().cuid(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.storeProduct.delete({
        where: {
          storeId_productId: {
            storeId: input.storeId,
            productId: input.productId,
          },
        },
      });
    }),

  importFromSupplier: protectedProcedure
    .input(
      z.object({
        supplierType: z.enum(["CJ_DROPSHIPPING", "ALIEXPRESS"]),
        productId: z.string(),
        retailPriceMultiplier: z.number().min(1).default(2.5),
        storeIds: z.array(z.string().cuid()).default([]),
      })
    )
    .mutation(async ({ input }) => {
      let adapter;
      if (input.supplierType === "CJ_DROPSHIPPING") {
        adapter = new CJDropshippingAdapter({
          apiKey: process.env.CJ_API_KEY || "",
          email: process.env.CJ_EMAIL || "",
        });
      } else {
        adapter = new AliExpressAdapter({
          appKey: process.env.AE_APP_KEY || "",
          appSecret: process.env.AE_APP_SECRET || "",
          accessToken: process.env.AE_ACCESS_TOKEN || "",
        });
      }

      return importProduct({
        adapter,
        productId: input.productId,
        retailPriceMultiplier: input.retailPriceMultiplier,
        storeIds: input.storeIds,
      });
    }),

  previewFromSupplier: protectedProcedure
    .input(
      z.object({
        supplierType: z.enum(["CJ_DROPSHIPPING", "ALIEXPRESS"]),
        productId: z.string(),
      })
    )
    .query(async ({ input }) => {
      let adapter;
      if (input.supplierType === "CJ_DROPSHIPPING") {
        adapter = new CJDropshippingAdapter({
          apiKey: process.env.CJ_API_KEY || "",
          email: process.env.CJ_EMAIL || "",
        });
      } else {
        adapter = new AliExpressAdapter({
          appKey: process.env.AE_APP_KEY || "",
          appSecret: process.env.AE_APP_SECRET || "",
          accessToken: process.env.AE_ACCESS_TOKEN || "",
        });
      }

      return adapter.getProductDetails(input.productId);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      return prisma.product.delete({ where: { id: input.id } });
    }),
});
