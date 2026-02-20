import { NextResponse } from "next/server";
import { prisma } from "@shops/db";
import {
  CJDropshippingAdapter,
  AliExpressAdapter,
  syncProductInventory,
} from "@shops/suppliers";

// Vercel Cron: runs every 4 hours for inventory, every 12 for price
// Configure in vercel.json:
// { "crons": [{ "path": "/api/cron/sync?type=inventory", "schedule": "0 */4 * * *" }] }

const PRICE_CHANGE_THRESHOLD = 0.15; // 15% change triggers a flag

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "inventory";

  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const suppliers = await prisma.supplier.findMany({
    where: { isActive: true },
  });

  const results = [];

  for (const supplier of suppliers) {
    const syncLog = await prisma.syncLog.create({
      data: {
        supplierId: supplier.id,
        type: type === "price" ? "PRICE" : "INVENTORY",
        status: "STARTED",
      },
    });

    try {
      const adapter =
        supplier.type === "CJ_DROPSHIPPING"
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
          supplierType: supplier.type,
          supplierProductId: { not: null },
          isActive: true,
        },
        include: { variants: true },
      });

      let synced = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const product of products) {
        try {
          if (!product.supplierProductId) continue;

          if (type === "inventory") {
            await syncProductInventory(
              adapter,
              product.supplierProductId,
              product.id
            );
          } else {
            // Price sync: check for significant changes
            const inventory = await adapter.getInventory(
              product.supplierProductId
            );
            for (const item of inventory) {
              const variant = product.variants.find(
                (v) => v.supplierVariantId === item.variantId
              );
              if (!variant) continue;

              const currentCost = Number(variant.costPrice);
              const newCost = item.costPrice;
              const change = Math.abs(newCost - currentCost) / currentCost;

              if (change > PRICE_CHANGE_THRESHOLD) {
                // Flag for review — don't auto-update prices
                await prisma.syncLog.update({
                  where: { id: syncLog.id },
                  data: {
                    errors: {
                      push: `PRICE_ALERT: ${product.title} variant ${variant.name}: $${currentCost} → $${newCost} (${(change * 100).toFixed(1)}% change)`,
                    },
                  },
                });
              } else if (change > 0) {
                // Small change — auto-update cost
                await prisma.productVariant.update({
                  where: { id: variant.id },
                  data: { costPrice: newCost },
                });
              }
            }
          }
          synced++;
        } catch (err) {
          failed++;
          errors.push(
            `${product.title}: ${err instanceof Error ? err.message : "Unknown"}`
          );
        }
      }

      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: failed === products.length && products.length > 0 ? "FAILED" : "COMPLETED",
          itemsTotal: products.length,
          itemsSynced: synced,
          itemsFailed: failed,
          errors,
          completedAt: new Date(),
        },
      });

      results.push({
        supplier: supplier.name,
        total: products.length,
        synced,
        failed,
      });
    } catch (err) {
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: "FAILED",
          errors: [err instanceof Error ? err.message : "Unknown error"],
          completedAt: new Date(),
        },
      });

      results.push({
        supplier: supplier.name,
        error: err instanceof Error ? err.message : "Unknown",
      });
    }
  }

  return NextResponse.json({
    type,
    timestamp: new Date().toISOString(),
    results,
  });
}
