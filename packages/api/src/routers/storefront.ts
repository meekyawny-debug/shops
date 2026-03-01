import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc";
import { prisma } from "@shops/db";
import { sendCAPIPurchaseEvent } from "../lib/meta-capi";
import { stripe } from "../lib/stripe";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (entry.count >= limit) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please try again later.",
    });
  }
  entry.count++;
}

// Legacy wrapper
const orderRateMap = rateLimitMap;
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
        tags: z.array(z.string()).optional(),
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
          ...(input.tags?.length && {
            tags: { hasSome: input.tags },
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

  getFrequentlyBoughtTogether: publicProcedure
    .input(
      z.object({
        storeSlug: z.string(),
        productId: z.string(),
        limit: z.number().default(3),
      })
    )
    .query(async ({ input }) => {
      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      const product = await prisma.product.findUniqueOrThrow({
        where: { id: input.productId },
        select: { category: true, baseCost: true },
      });

      // Find products from the same category at a different price tier
      const currentCost = Number(product.baseCost);
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
        orderBy: { position: "asc" },
        take: input.limit,
      });
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

  getProductReviews: publicProcedure
    .input(
      z.object({
        storeSlug: z.string(),
        productId: z.string(),
        sort: z.enum(["newest", "highest", "lowest"]).default("newest"),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      const where = { productId: input.productId, storeId: store.id };

      const orderBy = (() => {
        switch (input.sort) {
          case "highest":
            return { rating: "desc" as const };
          case "lowest":
            return { rating: "asc" as const };
          default:
            return { createdAt: "desc" as const };
        }
      })();

      const [reviews, total, agg] = await Promise.all([
        prisma.review.findMany({
          where,
          orderBy,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        prisma.review.count({ where }),
        prisma.review.aggregate({
          where,
          _avg: { rating: true },
          _count: { rating: true },
        }),
      ]);

      // Star distribution
      const distribution = await prisma.review.groupBy({
        by: ["rating"],
        where,
        _count: { rating: true },
      });

      const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      for (const d of distribution) {
        starCounts[d.rating] = d._count.rating;
      }

      return {
        reviews,
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
        avgRating: agg._avg.rating ?? 0,
        reviewCount: agg._count.rating,
        starCounts,
      };
    }),

  getProductRatingsSummary: publicProcedure
    .input(
      z.object({
        storeSlug: z.string(),
        productId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      const agg = await prisma.review.aggregate({
        where: { productId: input.productId, storeId: store.id },
        _avg: { rating: true },
        _count: { rating: true },
      });

      return {
        avgRating: agg._avg.rating ?? 0,
        reviewCount: agg._count.rating,
      };
    }),

  getProductsRatingsSummary: publicProcedure
    .input(
      z.object({
        storeSlug: z.string(),
        productIds: z.array(z.string()).min(1),
      })
    )
    .query(async ({ input }) => {
      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      const grouped = await prisma.review.groupBy({
        by: ["productId"],
        where: {
          storeId: store.id,
          productId: { in: input.productIds },
        },
        _avg: { rating: true },
        _count: { rating: true },
      });

      const result: Record<string, { avgRating: number; reviewCount: number }> =
        {};
      for (const g of grouped) {
        result[g.productId] = {
          avgRating: g._avg.rating ?? 0,
          reviewCount: g._count.rating,
        };
      }

      return result;
    }),

  validateCoupon: publicProcedure
    .input(
      z.object({
        storeSlug: z.string(),
        code: z.string(),
        orderSubtotal: z.number(),
      })
    )
    .query(async ({ input }) => {
      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      const coupon = await prisma.coupon.findUnique({
        where: { storeId_code: { storeId: store.id, code: input.code.toUpperCase() } },
      });

      if (!coupon || !coupon.isActive) {
        return { valid: false as const, error: "Invalid coupon code." };
      }

      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return { valid: false as const, error: "This coupon has expired." };
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return { valid: false as const, error: "This coupon has been fully redeemed." };
      }

      const minOrder = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
      if (input.orderSubtotal < minOrder) {
        return {
          valid: false as const,
          error: `Minimum order of $${minOrder.toFixed(2)} required.`,
        };
      }

      let discountAmount = 0;
      if (coupon.discountType === "PERCENTAGE") {
        discountAmount = input.orderSubtotal * (Number(coupon.value) / 100);
      } else if (coupon.discountType === "FIXED_AMOUNT") {
        discountAmount = Math.min(Number(coupon.value), input.orderSubtotal);
      } else if (coupon.discountType === "FREE_SHIPPING") {
        discountAmount = 0; // Handled at checkout level
      }

      return {
        valid: true as const,
        discountType: coupon.discountType,
        discountAmount: Math.round(discountAmount * 100) / 100,
        code: coupon.code,
      };
    }),

  createReview: publicProcedure
    .input(
      z.object({
        storeSlug: z.string(),
        productId: z.string(),
        rating: z.number().int().min(1).max(5),
        title: z.string().min(1).max(200),
        body: z.string().min(10).max(2000),
        authorName: z.string().min(1).max(100),
        authorEmail: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      // Rate limit: 3 reviews per hour per email
      checkRateLimit(`review:${input.authorEmail.toLowerCase()}`, 3, 60 * 60 * 1000);

      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      // Verify product exists in store
      await prisma.storeProduct.findFirstOrThrow({
        where: {
          storeId: store.id,
          productId: input.productId,
          isActive: true,
        },
      });

      return prisma.review.create({
        data: {
          productId: input.productId,
          storeId: store.id,
          rating: input.rating,
          title: input.title,
          body: input.body,
          authorName: input.authorName,
          authorEmail: input.authorEmail.toLowerCase(),
          verified: false,
        },
      });
    }),

  registerCustomer: publicProcedure
    .input(
      z.object({
        storeSlug: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      checkRateLimit(`register:${input.email.toLowerCase()}`, 3, 60 * 60 * 1000);

      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      // Check if customer already exists with a password
      const existing = await prisma.customer.findUnique({
        where: { storeId_email: { storeId: store.id, email: input.email.toLowerCase() } },
      });

      if (existing?.passwordHash) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists.",
        });
      }

      const { hash: cryptoHash } = await import("crypto");
      const passwordHash = cryptoHash("sha256", input.password);

      const customer = await prisma.customer.upsert({
        where: { storeId_email: { storeId: store.id, email: input.email.toLowerCase() } },
        create: {
          storeId: store.id,
          email: input.email.toLowerCase(),
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
        },
        update: {
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
        },
      });

      return { id: customer.id, email: customer.email };
    }),

  getCustomerAccount: publicProcedure
    .input(
      z.object({
        customerId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const customer = await prisma.customer.findUniqueOrThrow({
        where: { id: input.customerId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          shippingAddress1: true,
          shippingAddress2: true,
          shippingCity: true,
          shippingState: true,
          shippingZip: true,
          shippingCountry: true,
        },
      });
      return customer;
    }),

  getCustomerOrders: publicProcedure
    .input(
      z.object({
        customerId: z.string(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { customerId: input.customerId },
          include: { items: true },
          orderBy: { createdAt: "desc" },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        prisma.order.count({ where: { customerId: input.customerId } }),
      ]);

      return {
        orders,
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  updateCustomerAddress: publicProcedure
    .input(
      z.object({
        customerId: z.string(),
        shippingAddress1: z.string().optional(),
        shippingAddress2: z.string().optional(),
        shippingCity: z.string().optional(),
        shippingState: z.string().optional(),
        shippingZip: z.string().optional(),
        shippingCountry: z.string().optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { customerId, ...data } = input;
      return prisma.customer.update({
        where: { id: customerId },
        data,
      });
    }),

  syncAbandonedCart: publicProcedure
    .input(
      z.object({
        storeSlug: z.string(),
        email: z.string().email(),
        cartData: z.array(
          z.object({
            variantId: z.string(),
            productId: z.string(),
            productTitle: z.string(),
            variantName: z.string(),
            price: z.number(),
            quantity: z.number(),
            image: z.string().nullable(),
          })
        ),
        subtotal: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      // Find customer if exists
      const customer = await prisma.customer.findUnique({
        where: {
          storeId_email: {
            storeId: store.id,
            email: input.email.toLowerCase(),
          },
        },
      });

      await prisma.abandonedCart.upsert({
        where: {
          storeId_email: {
            storeId: store.id,
            email: input.email.toLowerCase(),
          },
        },
        create: {
          storeId: store.id,
          email: input.email.toLowerCase(),
          customerId: customer?.id,
          cartData: input.cartData,
          subtotal: input.subtotal,
          lastActiveAt: new Date(),
        },
        update: {
          cartData: input.cartData,
          subtotal: input.subtotal,
          lastActiveAt: new Date(),
          // Reset status to ACTIVE if cart was updated (user came back)
          status: "ACTIVE",
          customerId: customer?.id,
        },
      });

      return { success: true };
    }),

  getAbandonedCart: publicProcedure
    .input(z.object({ recoveryToken: z.string() }))
    .query(async ({ input }) => {
      const cart = await prisma.abandonedCart.findUnique({
        where: { recoveryToken: input.recoveryToken },
        include: { store: true },
      });

      if (!cart || cart.status === "RECOVERED" || cart.status === "EXPIRED") {
        return null;
      }

      return {
        storeSlug: cart.store.slug,
        cartData: cart.cartData as Array<{
          variantId: string;
          productId: string;
          productTitle: string;
          variantName: string;
          price: number;
          quantity: number;
          image: string | null;
        }>,
      };
    }),

  subscribeNewsletter: publicProcedure
    .input(
      z.object({
        storeSlug: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      await prisma.newsletterSubscriber.upsert({
        where: { storeId_email: { storeId: store.id, email: input.email.toLowerCase() } },
        create: { storeId: store.id, email: input.email.toLowerCase() },
        update: {},
      });

      return { success: true };
    }),

  getUpsellProducts: publicProcedure
    .input(
      z.object({
        storeSlug: z.string(),
        purchasedProductIds: z.array(z.string()),
        limit: z.number().default(2),
      })
    )
    .query(async ({ input }) => {
      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      // Get categories from purchased products
      const purchasedProducts = await prisma.product.findMany({
        where: { id: { in: input.purchasedProductIds } },
        select: { category: true },
      });
      const categories = [
        ...new Set(
          purchasedProducts
            .map((p) => p.category)
            .filter((c): c is string => c !== null)
        ),
      ];

      // Find complementary products from same categories, excluding purchased
      const upsellProducts = await prisma.storeProduct.findMany({
        where: {
          storeId: store.id,
          isActive: true,
          productId: { notIn: input.purchasedProductIds },
          product: {
            isActive: true,
            ...(categories.length > 0 && { category: { in: categories } }),
          },
        },
        include: {
          product: {
            include: {
              variants: { where: { isActive: true }, take: 1 },
              images: { orderBy: { position: "asc" }, take: 1 },
            },
          },
        },
        orderBy: { position: "asc" },
        take: input.limit,
      });

      return upsellProducts
        .filter((sp) => sp.product.variants.length > 0)
        .map((sp) => {
          const variant = sp.product.variants[0]!;
          const originalPrice = Number(sp.priceOverride ?? variant.retailPrice);
          return {
            id: sp.product.id,
            title: sp.product.title,
            image: sp.product.images[0]?.url || null,
            originalPrice,
            discountedPrice: Math.round(originalPrice * 0.7 * 100) / 100, // 30% off
            variantId: variant.id,
            variantName: variant.name,
          };
        });
    }),

  acceptUpsell: publicProcedure
    .input(
      z.object({
        storeSlug: z.string(),
        parentOrderId: z.string(),
        variantId: z.string(),
        discountedPrice: z.number(),
        stripeCustomerId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      const parentOrder = await prisma.order.findUniqueOrThrow({
        where: { id: input.parentOrderId },
        include: { customer: true },
      });

      const variant = await prisma.productVariant.findUniqueOrThrow({
        where: { id: input.variantId },
        include: { product: true },
      });

      // Charge via Stripe if customer has saved payment method
      let stripePaymentId: string | null = null;
      if (stripe && input.stripeCustomerId) {
        try {
          const paymentMethods = await stripe.paymentMethods.list({
            customer: input.stripeCustomerId,
            type: "card",
            limit: 1,
          });

          if (paymentMethods.data.length > 0) {
            const paymentIntent = await stripe.paymentIntents.create({
              amount: Math.round(input.discountedPrice * 100),
              currency: "usd",
              customer: input.stripeCustomerId,
              payment_method: paymentMethods.data[0].id,
              off_session: true,
              confirm: true,
              metadata: {
                storeSlug: input.storeSlug,
                storeId: store.id,
                isUpsell: "true",
                parentOrderId: input.parentOrderId,
              },
            });
            stripePaymentId = paymentIntent.id;
          }
        } catch (err) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Payment failed. Please try again.",
          });
        }
      }

      const orderNumber = `${store.slug.toUpperCase().slice(0, 3)}-U-${Date.now().toString(36).toUpperCase()}`;

      const order = await prisma.$transaction(async (tx) => {
        // Decrement stock
        await tx.productVariant.updateMany({
          where: { id: input.variantId, stock: { gte: 1 } },
          data: { stock: { decrement: 1 } },
        });

        return tx.order.create({
          data: {
            storeId: store.id,
            customerId: parentOrder.customerId,
            orderNumber,
            status: stripePaymentId ? "PAID" : "PENDING",
            subtotal: input.discountedPrice,
            shippingCost: 0,
            tax: 0,
            total: input.discountedPrice,
            stripePaymentId,
            isUpsell: true,
            parentOrderId: input.parentOrderId,
            shippingName: parentOrder.shippingName,
            shippingAddress1: parentOrder.shippingAddress1,
            shippingAddress2: parentOrder.shippingAddress2,
            shippingCity: parentOrder.shippingCity,
            shippingState: parentOrder.shippingState,
            shippingZip: parentOrder.shippingZip,
            shippingCountry: parentOrder.shippingCountry,
            items: {
              create: [
                {
                  variantId: variant.id,
                  quantity: 1,
                  unitPrice: input.discountedPrice,
                  unitCost: Number(variant.costPrice),
                  totalPrice: input.discountedPrice,
                  productTitle: variant.product.title,
                  variantName: variant.name,
                },
              ],
            },
          },
          include: { items: true },
        });
      });

      return order;
    }),

  getOrderByStripeSession: publicProcedure
    .input(z.object({ stripeSessionId: z.string() }))
    .query(async ({ input }) => {
      if (!stripe) return null;

      try {
        const session = await stripe.checkout.sessions.retrieve(input.stripeSessionId);
        if (!session.payment_intent) return null;

        const paymentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent.id;

        const order = await prisma.order.findFirst({
          where: { stripePaymentId: paymentId },
          include: {
            items: true,
            customer: true,
          },
        });

        return order;
      } catch {
        return null;
      }
    }),

  createCheckoutSession: publicProcedure
    .input(
      z.object({
        storeSlug: z.string(),
        items: z
          .array(
            z.object({
              variantId: z.string(),
              quantity: z.number().int().min(1),
              productTitle: z.string(),
              variantName: z.string(),
              price: z.number(), // in dollars
              image: z.string().nullable(),
            })
          )
          .min(1),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
        couponCode: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!stripe) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Payment processing is not configured.",
        });
      }

      const store = await prisma.store.findUniqueOrThrow({
        where: { slug: input.storeSlug },
      });

      if (!store.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This store is not currently accepting orders.",
        });
      }

      // Validate stock
      const variantIds = input.items.map((i) => i.variantId);
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds }, isActive: true },
      });

      for (const item of input.items) {
        const variant = variants.find((v) => v.id === item.variantId);
        if (!variant || variant.stock < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient stock for "${item.productTitle}".`,
          });
        }
      }

      const subtotal = input.items.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      const freeShipping = subtotal >= 40;

      const lineItems = input.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.productTitle,
            description: item.variantName,
            ...(item.image && { images: [item.image] }),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      // Add shipping line if applicable
      const shippingOptions = [
        {
          shipping_rate_data: {
            type: "fixed_amount" as const,
            fixed_amount: {
              amount: freeShipping ? 0 : 599,
              currency: "usd",
            },
            display_name: freeShipping ? "Free Shipping" : "Standard Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day" as const, value: 5 },
              maximum: { unit: "business_day" as const, value: 10 },
            },
          },
        },
      ];

      const sessionConfig: Record<string, unknown> = {
        mode: "payment",
        line_items: lineItems,
        shipping_address_collection: { allowed_countries: ["US", "CA", "GB"] },
        shipping_options: shippingOptions,
        automatic_tax: { enabled: false },
        payment_intent_data: { setup_future_usage: "off_session" },
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: {
          storeSlug: input.storeSlug,
          storeId: store.id,
          items: JSON.stringify(
            input.items.map((i) => ({
              variantId: i.variantId,
              quantity: i.quantity,
            }))
          ),
        },
      };

      // Apply coupon if provided
      if (input.couponCode) {
        try {
          const promotionCodes = await stripe.promotionCodes.list({
            code: input.couponCode,
            active: true,
            limit: 1,
          });
          if (promotionCodes.data.length > 0) {
            sessionConfig.discounts = [
              { promotion_code: promotionCodes.data[0].id },
            ];
          }
        } catch {
          // Ignore invalid coupon — checkout continues without discount
        }
      }

      const session = await stripe.checkout.sessions.create(
        sessionConfig as Parameters<typeof stripe.checkout.sessions.create>[0]
      );

      return { url: session.url };
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
        couponCode: z.string().optional(),
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
      let shippingCost = subtotal >= 40 ? 0 : 5.99;
      let discountAmount = 0;
      let appliedCouponCode: string | null = null;

      // Validate and apply coupon
      if (input.couponCode) {
        const coupon = await prisma.coupon.findUnique({
          where: { storeId_code: { storeId: store.id, code: input.couponCode.toUpperCase() } },
        });

        if (coupon && coupon.isActive) {
          const notExpired = !coupon.expiresAt || coupon.expiresAt > new Date();
          const notExhausted = !coupon.maxUses || coupon.usedCount < coupon.maxUses;
          const meetsMinimum = !coupon.minOrderAmount || subtotal >= Number(coupon.minOrderAmount);

          if (notExpired && notExhausted && meetsMinimum) {
            appliedCouponCode = coupon.code;
            if (coupon.discountType === "PERCENTAGE") {
              discountAmount = subtotal * (Number(coupon.value) / 100);
            } else if (coupon.discountType === "FIXED_AMOUNT") {
              discountAmount = Math.min(Number(coupon.value), subtotal);
            } else if (coupon.discountType === "FREE_SHIPPING") {
              shippingCost = 0;
            }
            discountAmount = Math.round(discountAmount * 100) / 100;
          }
        }
      }

      const tax = (subtotal - discountAmount) * 0.08;
      const total = subtotal - discountAmount + shippingCost + tax;

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

        // Increment coupon usage
        if (appliedCouponCode) {
          await tx.coupon.update({
            where: { storeId_code: { storeId: store.id, code: appliedCouponCode } },
            data: { usedCount: { increment: 1 } },
          });
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
            couponCode: appliedCouponCode,
            discountAmount,
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

      // Mark abandoned cart as recovered (fire-and-forget)
      prisma.abandonedCart
        .updateMany({
          where: {
            storeId: store.id,
            email: input.email.toLowerCase(),
            status: { notIn: ["RECOVERED", "EXPIRED"] },
          },
          data: { status: "RECOVERED", recoveredAt: new Date() },
        })
        .catch(() => {});

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
