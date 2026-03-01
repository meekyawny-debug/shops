"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@shops/ui";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { trpc } from "@/lib/trpc";

export default function CartRecoverPage() {
  const params = useParams<{ storeSlug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { addItemSilent } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  const { data: cart, isError } = trpc.storefront.getAbandonedCart.useQuery(
    { recoveryToken: token! },
    { enabled: !!token }
  );

  useEffect(() => {
    if (isError) {
      setStatus("error");
      return;
    }

    if (!cart) {
      if (isError) setStatus("error");
      return;
    }

    if (cart.cartData && cart.cartData.length > 0) {
      // Restore cart items
      for (const item of cart.cartData) {
        addItemSilent({
          variantId: item.variantId,
          productId: item.productId,
          productTitle: item.productTitle,
          variantName: item.variantName,
          price: item.price,
          compareAtPrice: null,
          quantity: item.quantity,
          image: item.image,
          stock: 99, // We don't store stock in cart data, use a high number
        });
      }
      setStatus("success");
      // Redirect to cart after a brief delay
      setTimeout(() => {
        router.push(`/${params.storeSlug}/cart`);
      }, 1500);
    } else {
      setStatus("error");
    }
  }, [cart, isError]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-heading text-2xl font-bold mb-3">Invalid Link</h1>
        <p className="text-muted-foreground mb-6">
          This recovery link is invalid or has expired.
        </p>
        <Link href={`/${params.storeSlug}/products`}>
          <Button className="rounded-full px-8">Browse Products</Button>
        </Link>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
        <h1 className="font-heading text-2xl font-bold mb-2">
          Restoring Your Cart
        </h1>
        <p className="text-muted-foreground">
          Hang tight, we&apos;re putting your items back...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-heading text-2xl font-bold mb-3">
          Cart Not Found
        </h1>
        <p className="text-muted-foreground mb-6">
          This recovery link may have expired or the cart has already been completed.
        </p>
        <Link href={`/${params.storeSlug}/products`}>
          <Button className="rounded-full px-8">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <ShoppingBag className="h-8 w-8 text-primary" />
      </div>
      <h1 className="font-heading text-2xl font-bold mb-2">
        Cart Restored!
      </h1>
      <p className="text-muted-foreground mb-4">
        Your items are back in your cart. Redirecting...
      </p>
      <Link href={`/${params.storeSlug}/cart`}>
        <Button className="rounded-full px-8">Go to Cart</Button>
      </Link>
    </div>
  );
}
