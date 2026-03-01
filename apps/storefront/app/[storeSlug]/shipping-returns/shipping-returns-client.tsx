"use client";

import { useStore } from "@/lib/store-context";

export default function ShippingReturnsClient() {
  const store = useStore();

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold mb-2">Shipping & Returns</h1>
      <p className="text-muted-foreground mb-10">
        Everything you need to know about shipping and returns at {store.name}.
      </p>

      <section className="mb-10">
        <h2 className="font-heading text-xl font-semibold mb-4">Shipping Policy</h2>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>We offer standard shipping on all orders. Estimated delivery time is <strong className="text-foreground">7-14 business days</strong> from the date of purchase.</p>
          <p><strong className="text-foreground">Free shipping</strong> is available on all orders over $40.</p>
          <p>Once your order ships, you&apos;ll receive a confirmation email with tracking information so you can follow your package every step of the way.</p>
          <p>Please note that delivery times may vary depending on your location and customs processing for international orders.</p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-heading text-xl font-semibold mb-4">Return Policy</h2>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>We want you to love your purchase! If you&apos;re not completely satisfied, we offer a <strong className="text-foreground">30-day return policy</strong> from the date of delivery.</p>
          <p>Items must be in their original condition and packaging to be eligible for a return.</p>
          <p>Refunds will be processed to your original payment method within 5-10 business days after we receive your return.</p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-heading text-xl font-semibold mb-4">How to Return an Item</h2>
        <ol className="list-decimal list-inside space-y-3 text-muted-foreground leading-relaxed">
          <li>Contact our support team at <strong className="text-foreground">support@{store.slug}.shop</strong> with your order number.</li>
          <li>We&apos;ll provide you with a return shipping label and instructions.</li>
          <li>Pack the item securely in its original packaging and ship it back.</li>
          <li>Once we receive and inspect the item, we&apos;ll process your refund.</li>
        </ol>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold mb-4">Exchanges</h2>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>Need a different size or color? We&apos;re happy to help with exchanges. Contact us within 30 days of delivery and we&apos;ll arrange an exchange at no additional cost.</p>
          <p>If the replacement item is a different price, we&apos;ll adjust the charge accordingly.</p>
        </div>
      </section>
    </div>
  );
}
