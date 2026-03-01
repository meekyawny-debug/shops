"use client";

import Link from "next/link";
import { Instagram, ChevronUp } from "lucide-react";
import { useStore } from "@/lib/store-context";

export function StoreFooter() {
  const store = useStore();
  const config = store.config;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-foreground text-background mt-16">
      {/* Back to top */}
      <div className="flex justify-center -mt-5">
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-foreground border-2 border-background/20 flex items-center justify-center text-background/70 hover:text-background hover:border-background/40 transition-colors"
          aria-label="Back to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-heading text-xl font-bold tracking-widest uppercase mb-4 text-background">
              {store.name}
            </h3>
            <p className="text-sm text-background/60 leading-relaxed max-w-xs">
              {config?.metaDescription || `Shop the best at ${store.name}`}
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-medium text-sm uppercase tracking-wider mb-4 text-background/80">
              Shop
            </h4>
            <nav className="flex flex-col gap-3">
              <Link
                href={`/${store.slug}/products`}
                className="text-sm text-background/50 hover:text-background transition-colors"
              >
                All Products
              </Link>
              <Link
                href={`/${store.slug}/products`}
                className="text-sm text-background/50 hover:text-background transition-colors"
              >
                New Arrivals
              </Link>
              <Link
                href={`/${store.slug}/products`}
                className="text-sm text-background/50 hover:text-background transition-colors"
              >
                Best Sellers
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-medium text-sm uppercase tracking-wider mb-4 text-background/80">
              Customer Service
            </h4>
            <nav className="flex flex-col gap-3">
              <Link
                href={`/${store.slug}/contact`}
                className="text-sm text-background/50 hover:text-background transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href={`/${store.slug}/shipping-returns`}
                className="text-sm text-background/50 hover:text-background transition-colors"
              >
                Shipping & Returns
              </Link>
              <Link
                href={`/${store.slug}/faq`}
                className="text-sm text-background/50 hover:text-background transition-colors"
              >
                FAQ
              </Link>
            </nav>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-medium text-sm uppercase tracking-wider mb-4 text-background/80">
              Follow Us
            </h4>
            <div className="flex gap-3">
              {config?.socialInstagram && (
                <a
                  href={config.socialInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center text-background/60 hover:text-background hover:bg-background/20 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {config?.socialFacebook && (
                <a
                  href={config.socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center text-background/60 hover:text-background hover:bg-background/20 transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}
              {config?.socialTiktok && (
                <a
                  href={config.socialTiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center text-background/60 hover:text-background hover:bg-background/20 transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Payment icons & copyright */}
        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Visa */}
            <div className="h-8 w-12 rounded bg-background/10 flex items-center justify-center" aria-label="Visa">
              <svg viewBox="0 0 750 471" className="h-4 w-auto" fill="currentColor" role="img">
                <path d="M278.198 334.228l33.36-195.763h53.358L331.57 334.228h-53.372zm246.11-191.06c-10.57-3.966-27.135-8.222-47.822-8.222-52.725 0-89.864 26.55-90.18 64.604-.632 28.12 26.508 43.822 46.754 53.186 20.77 9.57 27.752 15.713 27.654 24.283-.14 13.121-16.586 19.116-31.924 19.116-21.355 0-32.701-2.966-50.225-10.274l-6.878-3.112-7.487 43.822c12.463 5.467 35.508 10.2 59.438 10.456 56.09 0 92.502-26.246 92.965-66.884.222-22.276-14.016-39.237-44.8-53.218-18.65-9.056-30.073-15.098-29.952-24.27 0-8.137 9.668-16.838 30.56-16.838 17.43-.27 30.072 3.534 39.936 7.5l4.782 2.26 7.23-42.41h-.05zm137.31-4.223h-41.234c-12.773 0-22.332 3.487-27.942 16.234l-79.245 179.4h56.032s9.16-24.122 11.232-29.418c6.124 0 60.555.083 68.337.083 1.596 6.854 6.492 29.335 6.492 29.335h49.52l-43.19-195.635zm-65.417 126.408c4.414-11.28 21.26-54.724 21.26-54.724-.316.524 4.382-11.334 7.074-18.684l3.606 16.878s10.217 46.728 12.353 56.53h-44.293zM209.394 138.465l-52.24 133.496-5.566-27.13c-9.726-31.274-40.025-65.157-73.898-82.12l47.767 171.204 56.456-.063 84.004-195.39h-56.523v.003z" className="opacity-50" />
                <path d="M131.92 138.465H49.503l-.682 4.073c66.938 16.204 111.232 55.363 129.618 102.415l-18.71-89.96c-3.23-12.396-12.597-16.095-27.81-16.528z" className="opacity-50" />
              </svg>
            </div>
            {/* Mastercard */}
            <div className="h-8 w-12 rounded bg-background/10 flex items-center justify-center" aria-label="Mastercard">
              <svg viewBox="0 0 131.39 86.9" className="h-5 w-auto" role="img">
                <circle cx="47.54" cy="43.45" r="24" className="fill-red-500/60" />
                <circle cx="83.85" cy="43.45" r="24" className="fill-amber-500/60" />
                <path d="M65.7 25.06a24 24 0 0 0-8.85 18.39A24 24 0 0 0 65.7 61.84a24 24 0 0 0 8.85-18.39A24 24 0 0 0 65.7 25.06z" className="fill-orange-500/60" />
              </svg>
            </div>
            {/* Amex */}
            <div className="h-8 w-12 rounded bg-background/10 flex items-center justify-center" aria-label="American Express">
              <svg viewBox="0 0 24 24" className="h-5 w-auto opacity-50" fill="currentColor" role="img">
                <path d="M22 4H2v16h20V4zm-1 15H3v-5.5h1.2l.7-1 .7 1H8v-1.2l.5 1.2h1.6l.5-1.2V18.5h6.4l.8-1 .8 1H21V19zm0-5.5h-2.1l-.8 1-.8-1h-5.4l-.5 1.2-.5-1.2H9.2l-.5 1.2V13.5H6.4l-.7 1-.7-1H3V5h2.1l.8 1 .8-1h3.6l.5 1 .5-1h7.5l.8 1 .8-1H21v8.5z" />
                <path d="m15.4 14.5 2.4-3h-1.5l-1.6 2-1.6-2h-1.5l2.4 3-2.4 3h1.5l1.6-2 1.6 2h1.5l-2.4-3zm-7.7 0 .8 1.7.8-1.7h1.3l-1.5 3h-1.2l-1.5-3h1.3zm-.9-3h1.8l.8 2 .8-2h1.8l-1.8 3.5h-1.6L6.8 11.5z" />
              </svg>
            </div>
            {/* PayPal */}
            <div className="h-8 w-12 rounded bg-background/10 flex items-center justify-center" aria-label="PayPal">
              <svg viewBox="0 0 24 24" className="h-5 w-auto opacity-50" fill="currentColor" role="img">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.773.773 0 0 1 .763-.659h6.256c2.043 0 3.478.394 4.263 1.163.735.72 1.06 1.82.963 3.28-.01.14-.026.283-.046.43a8.18 8.18 0 0 1-.098.586l-.013.068v.197l.155.089c.376.207.683.467.92.781.286.381.472.847.553 1.384.084.548.062 1.198-.063 1.93-.144.846-.378 1.583-.696 2.186a4.453 4.453 0 0 1-1.092 1.408 4.068 4.068 0 0 1-1.528.805c-.58.17-1.25.258-1.99.258h-.473a1.43 1.43 0 0 0-1.009.418 1.429 1.429 0 0 0-.405 1.019l-.036.197-.606 3.838-.027.142c-.007.05-.02.074-.038.093a.104.104 0 0 1-.076.035z" />
                <path d="M18.429 7.706a8.963 8.963 0 0 0-.097-.392c-1.237 5.632-5.484 7.582-10.905 7.582H5.06l-1.362 8.636.385-.002h4.606c.332 0 .614-.24.667-.567l.028-.14.526-3.335.034-.184a.675.675 0 0 1 .667-.567h.42c2.722 0 4.854-1.105 5.478-4.302.26-1.336.126-2.452-.563-3.235a2.694 2.694 0 0 0-.771-.578l.254.084z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-background/40">
            &copy; {new Date().getFullYear()} {store.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
