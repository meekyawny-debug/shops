import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shops/db";
import {
  resend,
  FROM_EMAIL,
  generateAbandonedCartEmail,
  getAbandonedCartSubject,
} from "@shops/api";
import { getSiteUrl } from "@/lib/site-url";

// Protect cron endpoint with a secret
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!resend) {
    return NextResponse.json({ error: "Email not configured" }, { status: 500 });
  }

  const siteUrl = getSiteUrl();
  const now = new Date();
  let sent = 0;

  // Reminder 1: 1 hour after last activity, status = ACTIVE
  const reminder1Carts = await prisma.abandonedCart.findMany({
    where: {
      status: "ACTIVE",
      lastActiveAt: { lte: new Date(now.getTime() - 60 * 60 * 1000) },
    },
    include: { store: true },
    take: 50,
  });

  for (const cart of reminder1Carts) {
    try {
      const items = cart.cartData as Array<{
        productTitle: string;
        variantName: string;
        price: number;
        quantity: number;
        image: string | null;
      }>;

      const recoveryUrl = `${siteUrl}/${cart.store.slug}/cart/recover?token=${cart.recoveryToken}`;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: cart.email,
        subject: getAbandonedCartSubject(cart.store.name, "reminder1"),
        html: generateAbandonedCartEmail({
          storeName: cart.store.name,
          storeSlug: cart.store.slug,
          recoveryUrl,
          items,
          subtotal: Number(cart.subtotal),
          variant: "reminder1",
        }),
      });

      await prisma.abandonedCart.update({
        where: { id: cart.id },
        data: { status: "REMINDED_1", remindedAt1: now },
      });

      sent++;
    } catch (err) {
      console.error(`[Abandoned Cart] Failed to send reminder 1 for ${cart.id}:`, err);
    }
  }

  // Reminder 2: 24 hours after reminder 1
  const reminder2Carts = await prisma.abandonedCart.findMany({
    where: {
      status: "REMINDED_1",
      remindedAt1: { lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    },
    include: { store: true },
    take: 50,
  });

  for (const cart of reminder2Carts) {
    try {
      const items = cart.cartData as Array<{
        productTitle: string;
        variantName: string;
        price: number;
        quantity: number;
        image: string | null;
      }>;

      const recoveryUrl = `${siteUrl}/${cart.store.slug}/cart/recover?token=${cart.recoveryToken}`;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: cart.email,
        subject: getAbandonedCartSubject(cart.store.name, "reminder2"),
        html: generateAbandonedCartEmail({
          storeName: cart.store.name,
          storeSlug: cart.store.slug,
          recoveryUrl,
          items,
          subtotal: Number(cart.subtotal),
          variant: "reminder2",
        }),
      });

      await prisma.abandonedCart.update({
        where: { id: cart.id },
        data: { status: "REMINDED_2", remindedAt2: now },
      });

      sent++;
    } catch (err) {
      console.error(`[Abandoned Cart] Failed to send reminder 2 for ${cart.id}:`, err);
    }
  }

  // Reminder 3: 72 hours after reminder 2, include 10% coupon
  const reminder3Carts = await prisma.abandonedCart.findMany({
    where: {
      status: "REMINDED_2",
      remindedAt2: { lte: new Date(now.getTime() - 72 * 60 * 60 * 1000) },
    },
    include: { store: true },
    take: 50,
  });

  for (const cart of reminder3Carts) {
    try {
      const items = cart.cartData as Array<{
        productTitle: string;
        variantName: string;
        price: number;
        quantity: number;
        image: string | null;
      }>;

      // Generate a unique coupon code for this recovery
      const couponCode = `SAVE10-${cart.recoveryToken.slice(-6).toUpperCase()}`;

      // Create coupon in database
      await prisma.coupon.upsert({
        where: {
          storeId_code: { storeId: cart.storeId, code: couponCode },
        },
        create: {
          storeId: cart.storeId,
          code: couponCode,
          discountType: "PERCENTAGE",
          value: 10,
          maxUses: 1,
          expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
          isActive: true,
        },
        update: {},
      });

      const recoveryUrl = `${siteUrl}/${cart.store.slug}/cart/recover?token=${cart.recoveryToken}`;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: cart.email,
        subject: getAbandonedCartSubject(cart.store.name, "reminder3"),
        html: generateAbandonedCartEmail({
          storeName: cart.store.name,
          storeSlug: cart.store.slug,
          recoveryUrl,
          items,
          subtotal: Number(cart.subtotal),
          variant: "reminder3",
          couponCode,
        }),
      });

      await prisma.abandonedCart.update({
        where: { id: cart.id },
        data: { status: "REMINDED_3", remindedAt3: now },
      });

      sent++;
    } catch (err) {
      console.error(`[Abandoned Cart] Failed to send reminder 3 for ${cart.id}:`, err);
    }
  }

  // Expire carts older than 30 days
  await prisma.abandonedCart.updateMany({
    where: {
      status: { in: ["REMINDED_3"] },
      remindedAt3: { lte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
    },
    data: { status: "EXPIRED" },
  });

  return NextResponse.json({ sent, timestamp: now.toISOString() });
}
