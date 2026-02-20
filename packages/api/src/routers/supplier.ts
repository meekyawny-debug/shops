import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@shops/db";
import {
  CJDropshippingAdapter,
  AliExpressAdapter,
  syncProductInventory,
} from "@shops/suppliers";

export const supplierRouter = router({
  list: protectedProcedure.query(async () => {
    return prisma.supplier.findMany({
      orderBy: { name: "asc" },
    });
  }),

  syncLogs: protectedProcedure
    .input(
      z.object({
        supplierId: z.string().cuid().optional(),
        type: z.enum(["INVENTORY", "PRICE", "PRODUCT"]).optional(),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      return prisma.syncLog.findMany({
        where: {
          ...(input?.supplierId && { supplierId: input.supplierId }),
          ...(input?.type && { type: input.type }),
        },
        include: { supplier: true },
        orderBy: { startedAt: "desc" },
        take: input?.limit || 20,
      });
    }),

  triggerSync: protectedProcedure
    .input(
      z.object({
        supplierId: z.string().cuid(),
        type: z.enum(["INVENTORY", "PRICE"]),
      })
    )
    .mutation(async ({ input }) => {
      const supplier = await prisma.supplier.findUniqueOrThrow({
        where: { id: input.supplierId },
      });

      const syncLog = await prisma.syncLog.create({
        data: {
          supplierId: input.supplierId,
          type: input.type,
          status: "STARTED",
        },
      });

      // Run sync in background (non-blocking)
      runSync(supplier.type, input.type, syncLog.id).catch(console.error);

      return syncLog;
    }),

  search: protectedProcedure
    .input(
      z.object({
        supplierType: z.enum(["CJ_DROPSHIPPING", "ALIEXPRESS"]),
        query: z.string().min(1),
        page: z.number().default(1),
      })
    )
    .query(async ({ input }) => {
      const adapter =
        input.supplierType === "CJ_DROPSHIPPING"
          ? new CJDropshippingAdapter({
              apiKey: process.env.CJ_API_KEY || "",
              email: process.env.CJ_EMAIL || "",
            })
          : new AliExpressAdapter({
              appKey: process.env.AE_APP_KEY || "",
              appSecret: process.env.AE_APP_SECRET || "",
              accessToken: process.env.AE_ACCESS_TOKEN || "",
            });

      return adapter.searchProducts(input.query, input.page);
    }),
});

async function runSync(
  supplierType: string,
  syncType: string,
  syncLogId: string
) {
  const adapter =
    supplierType === "CJ_DROPSHIPPING"
      ? new CJDropshippingAdapter({
          apiKey: process.env.CJ_API_KEY || "",
          email: process.env.CJ_EMAIL || "",
        })
      : new AliExpressAdapter({
          appKey: process.env.AE_APP_KEY || "",
          appSecret: process.env.AE_APP_SECRET || "",
          accessToken: process.env.AE_ACCESS_TOKEN || "",
        });

  const products = await prisma.product.findMany({
    where: {
      supplierType: supplierType as "CJ_DROPSHIPPING" | "ALIEXPRESS",
      supplierProductId: { not: null },
      isActive: true,
    },
    select: { id: true, supplierProductId: true },
  });

  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const product of products) {
    try {
      if (!product.supplierProductId) continue;
      await syncProductInventory(adapter, product.supplierProductId, product.id);
      synced++;
    } catch (err) {
      failed++;
      errors.push(`Product ${product.id}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  await prisma.syncLog.update({
    where: { id: syncLogId },
    data: {
      status: failed === products.length ? "FAILED" : "COMPLETED",
      itemsTotal: products.length,
      itemsSynced: synced,
      itemsFailed: failed,
      errors,
      completedAt: new Date(),
    },
  });
}
