import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@shops/db";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutCompleted(session);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const storeId = session.metadata?.storeId;
  const storeSlug = session.metadata?.storeSlug;
  const itemsJson = session.metadata?.items;

  if (!storeId || !itemsJson) {
    console.error("[Stripe Webhook] Missing metadata on session", session.id);
    return;
  }

  const items: { variantId: string; quantity: number }[] = JSON.parse(itemsJson);
  const email = session.customer_details?.email;
  const name = session.customer_details?.name || "";
  const shipping = (session as unknown as { shipping_details?: { address?: Record<string, string | null> } }).shipping_details?.address;

  if (!email) {
    console.error("[Stripe Webhook] No email on session", session.id);
    return;
  }

  const [firstName, ...lastParts] = name.split(" ");
  const lastName = lastParts.join(" ") || "";

  // Upsert customer
  const customer = await prisma.customer.upsert({
    where: { storeId_email: { storeId, email } },
    create: {
      storeId,
      email,
      firstName: firstName || null,
      lastName: lastName || null,
    },
    update: {
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    },
  });

  // Fetch variants
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: items.map((i) => i.variantId) }, isActive: true },
    include: { product: true },
  });

  const orderItems = items.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId);
    const unitPrice = variant ? Number(variant.retailPrice) : 0;
    const unitCost = variant ? Number(variant.costPrice) : 0;
    return {
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice,
      unitCost,
      totalPrice: unitPrice * item.quantity,
      productTitle: variant?.product.title || "Unknown",
      variantName: variant?.name || "Unknown",
    };
  });

  const subtotal = orderItems.reduce((sum, i) => sum + i.totalPrice, 0);
  const shippingCost = Number(session.total_details?.amount_shipping || 0) / 100;
  const tax = Number(session.total_details?.amount_tax || 0) / 100;
  const total = Number(session.amount_total || 0) / 100;

  const orderNumber = `${(storeSlug || "ORD").toUpperCase().slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`;

  await prisma.$transaction(async (tx) => {
    // Decrement stock
    for (const item of items) {
      await tx.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.order.create({
      data: {
        storeId,
        customerId: customer.id,
        orderNumber,
        status: "PAID",
        subtotal,
        shippingCost,
        tax,
        total,
        stripePaymentId: session.payment_intent as string,
        shippingName: name,
        shippingAddress1: shipping?.line1 || null,
        shippingAddress2: shipping?.line2 || null,
        shippingCity: shipping?.city || null,
        shippingState: shipping?.state || null,
        shippingZip: shipping?.postal_code || null,
        shippingCountry: shipping?.country || null,
        items: { create: orderItems },
      },
    });
  });

  console.log(`[Stripe Webhook] Order ${orderNumber} created for ${email} (PAID)`);
}
