import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc";
import { prisma } from "@shops/db";
import { sendCAPIPurchaseEvent } from "../lib/meta-capi";

// Simple in-memory rate limiter per IP-like key (order creation)
const orderRateMap = new Map<string, { count: number; resetAt: number }>();
const ORDER_RATE_LIMIT = 5; // max orders per window
const ORDER_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkOrderRateLimit(key: string) {
  const now = Date.now();
  const entry = orderRateMap.get(key);
  if (!entry || now > entry.resetAt) {
    orderRateMap.set(key, { count: 1, resetAt: now + ORDER_RATE_WINDOW_MS });
    return;
  }
  if (entry.count >= ORDER_RATE_LIMIT) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many orders. Please try again later.",
    });
  }
  entry.count++;
}

export const storefrontRouter = router({
  getStore: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return prisma.store.findUniqueOrThrow({
        where: { slug: input.slug, isActive: true },
        include: { config: true },
      });
    }),

  getProducts: publicProcedure
    .input(
      z.object({
        storeSlug: z.string(),
        search: z.string().optional(),
        category: z.string().optional(),
        sort: z.enum(["newest", "best-selling", "price-asc", "price-desc", "name"]).default("newest"),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(12),
      })
    )
    .query(async ({ input }) => {
      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      const where = {
        storeId: store.id,
        isActive: true,
        product: {
          isActive: true,
          ...(input.search && {
            OR: [
              { title: { contains: input.search, mode: "insensitive" as const } },
              { description: { contains: input.search, mode: "insensitive" as const } },
            ],
          }),
          ...(input.category && {
            category: { equals: input.category, mode: "insensitive" as const },
          }),
        },
      };

      // Best-selling sort: rank by order revenue, then fall back to position
      if (input.sort === "best-selling") {
        const allProducts = await prisma.storeProduct.findMany({
          where,
          include: {
            product: {
              include: {
                variants: { where: { isActive: true } },
                images: { orderBy: { position: "asc" } },
              },
            },
          },
          orderBy: { position: "asc" },
        });

        // Aggregate revenue per product from non-cancelled/refunded orders
        const revenueByProduct = new Map<string, number>();
        const variantToProduct = new Map<string, string>();
        for (const sp of allProducts) {
          for (const v of sp.product.variants) {
            variantToProduct.set(v.id, sp.productId);
          }
        }

        const orderItems = await prisma.orderItem.findMany({
          where: {
            variantId: { in: [...variantToProduct.keys()] },
            order: {
              storeId: (await prisma.store.findUniqueOrThrow({ where: { slug: input.storeSlug } })).id,
              status: { notIn: ["CANCELLED", "REFUNDED"] },
            },
          },
          select: { variantId: true, totalPrice: true },
        });

        for (const item of orderItems) {
          const productId = variantToProduct.get(item.variantId);
          if (productId) {
            revenueByProduct.set(productId, (revenueByProduct.get(productId) || 0) + Number(item.totalPrice));
          }
        }

        // Sort: products with revenue first (desc), then no-revenue by position
        allProducts.sort((a, b) => {
          const revA = revenueByProduct.get(a.productId) || 0;
          const revB = revenueByProduct.get(b.productId) || 0;
          if (revA !== revB) return revB - revA;
          return a.position - b.position;
        });

        const total = allProducts.length;
        const start = (input.page - 1) * input.limit;
        return {
          products: allProducts.slice(start, start + input.limit),
          total,
          page: input.page,
          totalPages: Math.ceil(total / input.limit),
        };
      }

      const orderBy = (() => {
        switch (input.sort) {
          case "price-asc":
            return { product: { baseCost: "asc" as const } };
          case "price-desc":
            return { product: { baseCost: "desc" as const } };
          case "name":
            return { product: { title: "asc" as const } };
          default:
            return { createdAt: "desc" as const };
        }
      })();

      const [storeProducts, total] = await Promise.all([
        prisma.storeProduct.findMany({
          where,
          include: {
            product: {
              include: {
                variants: { where: { isActive: true } },
                images: { orderBy: { position: "asc" } },
              },
            },
          },
          orderBy,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        prisma.storeProduct.count({ where }),
      ]);

      return {
        products: storeProducts,
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  getFeaturedProducts: publicProcedure
    .input(z.object({ storeSlug: z.string(), limit: z.number().default(8) }))
    .query(async ({ input }) => {
      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      return prisma.storeProduct.findMany({
        where: {
          storeId: store.id,
          isActive: true,
          isFeatured: true,
          product: { isActive: true },
        },
        include: {
          product: {
            include: {
              variants: { where: { isActive: true } },
              images: { orderBy: { position: "asc" } },
            },
          },
        },
        orderBy: { position: "asc" },
        take: input.limit,
      });
    }),

  getBestSellingProducts: publicProcedure
    .input(z.object({ storeSlug: z.string(), limit: z.number().default(8) }))
    .query(async ({ input }) => {
      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      // Aggregate revenue per variant from non-cancelled/refunded orders
      const topVariants = await prisma.orderItem.groupBy({
        by: ["variantId"],
        where: {
          order: {
            storeId: store.id,
            status: { notIn: ["CANCELLED", "REFUNDED"] },
          },
        },
        _sum: { totalPrice: true },
        orderBy: { _sum: { totalPrice: "desc" } },
      });

      if (topVariants.length > 0) {
        // Map variants → products, deduplicate by productId, keep revenue rank
        const variantIds = topVariants.map((v) => v.variantId);
        const variants = await prisma.productVariant.findMany({
          where: { id: { in: variantIds } },
          select: { id: true, productId: true },
        });
        const variantToProduct = new Map(variants.map((v) => [v.id, v.productId]));

        const seenProducts = new Set<string>();
        const rankedProductIds: string[] = [];
        for (const tv of topVariants) {
          const productId = variantToProduct.get(tv.variantId);
          if (productId && !seenProducts.has(productId)) {
            seenProducts.add(productId);
            rankedProductIds.push(productId);
          }
          if (rankedProductIds.length >= input.limit) break;
        }

        if (rankedProductIds.length > 0) {
          const storeProducts = await prisma.storeProduct.findMany({
            where: {
              storeId: store.id,
              isActive: true,
              productId: { in: rankedProductIds },
              product: { isActive: true },
            },
            include: {
              product: {
                include: {
                  variants: { where: { isActive: true } },
                  images: { orderBy: { position: "asc" } },
                },
              },
            },
          });

          // Sort by revenue rank order
          const rankMap = new Map(rankedProductIds.map((id, i) => [id, i]));
          storeProducts.sort((a, b) => (rankMap.get(a.productId) ?? 999) - (rankMap.get(b.productId) ?? 999));
          return storeProducts;
        }
      }

      // Fallback: featured products (same as getFeaturedProducts)
      return prisma.storeProduct.findMany({
        where: {
          storeId: store.id,
          isActive: true,
          isFeatured: true,
          product: { isActive: true },
        },
        include: {
          product: {
            include: {
              variants: { where: { isActive: true } },
              images: { orderBy: { position: "asc" } },
            },
          },
        },
        orderBy: { position: "asc" },
        take: input.limit,
      });
    }),

  getCategories: publicProcedure
    .input(z.object({ storeSlug: z.string() }))
    .query(async ({ input }) => {
      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      const storeProducts = await prisma.storeProduct.findMany({
        where: {
          storeId: store.id,
          isActive: true,
          product: { isActive: true },
        },
        include: { product: { select: { category: true } } },
      });

      const categories = [
        ...new Set(
          storeProducts
            .map((sp) => sp.product.category)
            .filter((c): c is string => c !== null)
        ),
      ];

      return categories.sort();
    }),

  getProduct: publicProcedure
    .input(z.object({ storeSlug: z.string(), productId: z.string() }))
    .query(async ({ input }) => {
      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      const storeProduct = await prisma.storeProduct.findFirstOrThrow({
        where: {
          storeId: store.id,
          productId: input.productId,
          isActive: true,
          product: { isActive: true },
        },
        include: {
          product: {
            include: {
              variants: { where: { isActive: true } },
              images: { orderBy: { position: "asc" } },
            },
          },
        },
      });

      return storeProduct;
    }),

  getRelatedProducts: publicProcedure
    .input(
      z.object({
        storeSlug: z.string(),
        productId: z.string(),
        limit: z.number().default(4),
      })
    )
    .query(async ({ input }) => {
      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      const product = await prisma.product.findUniqueOrThrow({
        where: { id: input.productId },
        select: { category: true },
      });

      return prisma.storeProduct.findMany({
        where: {
          storeId: store.id,
          isActive: true,
          productId: { not: input.productId },
          product: {
            isActive: true,
            ...(product.category && { category: product.category }),
          },
        },
        include: {
          product: {
            include: {
              variants: { where: { isActive: true } },
              images: { orderBy: { position: "asc" } },
            },
          },
        },
        take: input.limit,
      });
    }),

  createOrder: publicProcedure
    .input(
      z.object({
        storeSlug: z.string(),
        email: z.string().email(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        phone: z.string().optional(),
        shippingAddress1: z.string().min(1),
        shippingAddress2: z.string().optional(),
        shippingCity: z.string().min(1),
        shippingState: z.string().min(1),
        shippingZip: z.string().min(1),
        shippingCountry: z.string().default("US"),
        fbEventId: z.string().optional(),
        items: z.array(
          z.object({
            variantId: z.string(),
            quantity: z.number().int().min(1),
          })
        ).min(1),
      })
    )
    .mutation(async ({ input }) => {
      // Rate limit by email
      checkOrderRateLimit(input.email.toLowerCase());

      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      // Verify store is active
      if (!store.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This store is not currently accepting orders.",
        });
      }

      // Upsert customer
      const customer = await prisma.customer.upsert({
        where: {
          storeId_email: { storeId: store.id, email: input.email },
        },
        create: {
          storeId: store.id,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
        },
        update: {
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
        },
      });

      // Fetch variants with prices and validate stock
      const variants = await prisma.productVariant.findMany({
        where: {
          id: { in: input.items.map((i) => i.variantId) },
          isActive: true,
        },
        include: { product: true },
      });

      if (variants.length !== input.items.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "One or more items are no longer available.",
        });
      }

      // Validate stock for each item
      for (const item of input.items) {
        const variant = variants.find((v) => v.id === item.variantId)!;
        if (variant.stock < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient stock for "${variant.product.title}" (${variant.name}). Only ${variant.stock} left.`,
          });
        }
      }

      // Calculate totals
      const orderItems = input.items.map((item) => {
        const variant = variants.find((v) => v.id === item.variantId)!;
        const unitPrice = Number(variant.retailPrice);
        const unitCost = Number(variant.costPrice);
        return {
          variantId: variant.id,
          quantity: item.quantity,
          unitPrice,
          unitCost,
          totalPrice: unitPrice * item.quantity,
          productTitle: variant.product.title,
          variantName: variant.name,
        };
      });

      const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const shippingCost = subtotal >= 40 ? 0 : 5.99;
      const tax = subtotal * 0.08;
      const total = subtotal + shippingCost + tax;

      // Generate order number
      const orderNumber = `${store.slug.toUpperCase().slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`;

      // Create order and decrement stock in a transaction
      const order = await prisma.$transaction(async (tx) => {
        // Decrement stock for each variant
        for (const item of input.items) {
          const updated = await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          if (updated.count === 0) {
            const variant = variants.find((v) => v.id === item.variantId)!;
            throw new TRPCError({
              code: "CONFLICT",
              message: `"${variant.product.title}" (${variant.name}) just went out of stock. Please refresh and try again.`,
            });
          }
        }

        return tx.order.create({
          data: {
            storeId: store.id,
            customerId: customer.id,
            orderNumber,
            status: "PENDING",
            subtotal,
            shippingCost,
            tax,
            total,
            shippingName: `${input.firstName} ${input.lastName}`,
            shippingAddress1: input.shippingAddress1,
            shippingAddress2: input.shippingAddress2,
            shippingCity: input.shippingCity,
            shippingState: input.shippingState,
            shippingZip: input.shippingZip,
            shippingCountry: input.shippingCountry,
            items: {
              create: orderItems,
            },
          },
          include: {
            items: true,
            customer: true,
          },
        });
      });

      // Fire Meta CAPI Purchase event (fire-and-forget)
      if (input.fbEventId) {
        prisma.storeConfig
          .findUnique({ where: { storeId: store.id } })
          .then((config) => {
            const pixelId = config?.fbPixelId;
            const accessToken =
              config?.fbCapiAccessToken ||
              process.env.FB_CAPI_ACCESS_TOKEN;
            if (pixelId && accessToken) {
              sendCAPIPurchaseEvent({
                pixelId,
                accessToken,
                eventId: input.fbEventId!,
                email: input.email,
                phone: input.phone,
                firstName: input.firstName,
                lastName: input.lastName,
                city: input.shippingCity,
                state: input.shippingState,
                zip: input.shippingZip,
                country: input.shippingCountry,
                value: Number(order.total),
                currency: "USD",
                contentIds: input.items.map((i) => i.variantId),
                numItems: input.items.reduce(
                  (n, i) => n + i.quantity,
                  0
                ),
              });
            }
          })
          .catch((err) => {
            console.error("[Meta CAPI] Failed to fetch store config:", err);
          });
      }

      return order;
    }),
});
