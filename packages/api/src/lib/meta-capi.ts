import { createHash } from "crypto";

function hashForMeta(value: string): string {
  return createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

interface CAPIPurchaseEvent {
  pixelId: string;
  accessToken: string;
  eventId: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  value: number;
  currency: string;
  contentIds: string[];
  numItems: number;
  sourceUrl?: string;
}

export function sendCAPIPurchaseEvent(event: CAPIPurchaseEvent): void {
  const userData: Record<string, string> = {
    em: hashForMeta(event.email),
    fn: hashForMeta(event.firstName),
    ln: hashForMeta(event.lastName),
    ct: hashForMeta(event.city),
    st: hashForMeta(event.state),
    zp: hashForMeta(event.zip),
    country: hashForMeta(event.country),
  };
  if (event.phone) {
    userData.ph = hashForMeta(event.phone);
  }

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        action_source: "website",
        user_data: userData,
        custom_data: {
          value: event.value,
          currency: event.currency,
          content_ids: event.contentIds,
          content_type: "product",
          num_items: event.numItems,
        },
        ...(event.sourceUrl && { event_source_url: event.sourceUrl }),
      },
    ],
  };

  const url = `https://graph.facebook.com/v21.0/${event.pixelId}/events?access_token=${event.accessToken}`;

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((body) => {
          console.error(`[Meta CAPI] Error ${res.status}:`, body);
        });
      }
      console.log("[Meta CAPI] Purchase event sent successfully");
    })
    .catch((err) => {
      console.error("[Meta CAPI] Failed to send purchase event:", err);
    });
}
