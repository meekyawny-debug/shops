import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-6xl mb-6">404</p>
      <h1 className="font-heading text-2xl font-bold mb-3">
        Page Not Found
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It may
        have been moved or no longer exists.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
