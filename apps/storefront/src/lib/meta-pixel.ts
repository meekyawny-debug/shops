// Meta Pixel helper functions — client-side only
// All helpers no-op safely if window.fbq doesn't exist

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function generateEventId(): string {
  return crypto.randomUUID();
}

function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  }
}

export function trackPageView() {
  fbq("track", "PageView");
}

export function trackViewContent(
  contentId: string,
  contentName: string,
  category: string | null,
  value: number
) {
  fbq("track", "ViewContent", {
    content_ids: [contentId],
    content_name: contentName,
    content_category: category || undefined,
    content_type: "product",
    value,
    currency: "USD",
  });
}

export function trackAddToCart(
  contentId: string,
  contentName: string,
  value: number
) {
  fbq("track", "AddToCart", {
    content_ids: [contentId],
    content_name: contentName,
    content_type: "product",
    value,
    currency: "USD",
  });
}

export function trackInitiateCheckout(
  contentIds: string[],
  value: number,
  numItems: number
) {
  fbq("track", "InitiateCheckout", {
    content_ids: contentIds,
    value,
    currency: "USD",
    num_items: numItems,
  });
}

export function trackPurchase(
  contentIds: string[],
  value: number,
  numItems: number,
  eventId: string
) {
  fbq("track", "Purchase", {
    content_ids: contentIds,
    value,
    currency: "USD",
    num_items: numItems,
  }, { eventID: eventId });
}
