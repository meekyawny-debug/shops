interface CartItem {
  productTitle: string;
  variantName: string;
  price: number;
  quantity: number;
  image: string | null;
}

interface AbandonedCartEmailProps {
  storeName: string;
  storeSlug: string;
  recoveryUrl: string;
  items: CartItem[];
  subtotal: number;
  variant: "reminder1" | "reminder2" | "reminder3";
  couponCode?: string;
}

const subjects: Record<string, string> = {
  reminder1: "You left something behind!",
  reminder2: "Your cart is waiting for you",
  reminder3: "Last chance! Here's 10% off to complete your order",
};

export function getAbandonedCartSubject(
  storeName: string,
  variant: "reminder1" | "reminder2" | "reminder3"
) {
  return `${storeName} — ${subjects[variant]}`;
}

export function generateAbandonedCartEmail({
  storeName,
  storeSlug,
  recoveryUrl,
  items,
  subtotal,
  variant,
  couponCode,
}: AbandonedCartEmailProps): string {
  const greeting =
    variant === "reminder1"
      ? "Hey there! Looks like you left some great items in your cart."
      : variant === "reminder2"
        ? "Just a friendly reminder — your cart is still waiting for you."
        : "This is your last chance! We've added a special 10% discount just for you.";

  const ctaText =
    variant === "reminder3" && couponCode
      ? `Complete My Order (Use code: ${couponCode})`
      : "Complete My Order";

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
        <strong>${item.productTitle}</strong><br/>
        <span style="color: #666; font-size: 14px;">${item.variantName} × ${item.quantity}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #000; color: #fff; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700;">${storeName}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 24px;">
              <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 24px;">
                ${greeting}
              </p>

              <!-- Cart items -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                ${itemsHtml}
                <tr>
                  <td style="padding: 16px 0; font-weight: bold; font-size: 18px;">Subtotal</td>
                  <td style="padding: 16px 0; font-weight: bold; font-size: 18px; text-align: right;">$${subtotal.toFixed(2)}</td>
                </tr>
              </table>

              ${
                variant === "reminder3" && couponCode
                  ? `<div style="background-color: #f0fdf4; border: 2px dashed #22c55e; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
                      <p style="margin: 0 0 4px; color: #333; font-weight: bold;">Special Offer: 10% Off</p>
                      <p style="margin: 0; font-size: 24px; font-weight: bold; color: #22c55e; letter-spacing: 2px;">${couponCode}</p>
                    </div>`
                  : ""
              }

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0;">
                    <a href="${recoveryUrl}" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 16px; font-weight: 600;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; text-align: center; background-color: #fafafa; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                You received this email because you added items to your cart at ${storeName}.
                <br/>If you didn't do this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
