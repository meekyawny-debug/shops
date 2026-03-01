"use client";

import { useEffect } from "react";
import { Button } from "@shops/ui";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-6xl mb-6">Oops</p>
      <h1 className="font-heading text-2xl font-bold mb-3">
        Something went wrong
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We ran into an unexpected error. Please try again.
      </p>
      <Button onClick={reset} className="rounded-full px-8">
        Try Again
      </Button>
    </div>
  );
}
