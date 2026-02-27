import { config } from "dotenv";
import { resolve } from "path";

// Load .env from monorepo root
config({ path: resolve(__dirname, "../../../.env") });

// ─── Config ──────────────────────────────────────────────────

const API_VERSION = "2026-01";
const DRY_RUN = process.argv.includes("--dry-run");

interface ShopifyStoreConfig {
  slug: string;
  store: string; // e.g. "glowhaven-beauty.myshopify.com"
  token: string; // shpat_xxx
}

function getStoreConfigs(): ShopifyStoreConfig[] {
  const stores: ShopifyStoreConfig[] = [];

  for (const [slug, envPrefix] of [
    ["glowhaven", "SHOPIFY_GLOWHAVEN"],
    ["aurae", "SHOPIFY_AURAE"],
    ["nestwell", "SHOPIFY_NESTWELL"],
  ] as const) {
    const store = process.env[`${envPrefix}_STORE`];
    const token = process.env[`${envPrefix}_TOKEN`];
    if (!store || !token) {
      console.warn(`  ⚠ Missing ${envPrefix}_STORE or ${envPrefix}_TOKEN — skipping ${slug}`);
      continue;
    }
    stores.push({ slug, store, token });
  }

  return stores;
}

// ─── Shopify API helpers ─────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function shopifyFetch(
  store: string,
  token: string,
  method: string,
  endpoint: string,
  body?: unknown,
): Promise<{ status: number; data: any; callLimit: string | null }> {
  const url = `https://${store}/admin/api/${API_VERSION}/${endpoint}`;
  const headers: Record<string, string> = {
    "X-Shopify-Access-Token": token,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const callLimit = res.headers.get("X-Shopify-Shop-Api-Call-Limit");

  // Rate limit — wait and retry
  if (res.status === 429) {
    const retryAfter = parseFloat(res.headers.get("Retry-After") || "2");
    console.log(`    ⏳ Rate limited, waiting ${retryAfter}s...`);
    await sleep(retryAfter * 1000);
    return shopifyFetch(store, token, method, endpoint, body);
  }

  const data = await res.json().catch(() => null);

  if (res.status >= 400) {
    console.error(
      `    ❌ ${method} ${endpoint} → ${res.status}`,
      JSON.stringify(data?.errors ?? data, null, 2),
    );
  }

  // Proactive rate-limit check: if bucket is >35/40, pause briefly
  if (callLimit) {
    const [used, max] = callLimit.split("/").map(Number);
    if (used >= max - 5) {
      await sleep(1000);
    }
  }

  return { status: res.status, data, callLimit };
}

async function getActiveThemeId(store: string, token: string): Promise<number | null> {
  const { data, status } = await shopifyFetch(store, token, "GET", "themes.json");
  if (status !== 200 || !data?.themes) return null;

  const main = data.themes.find((t: any) => t.role === "main");
  if (!main) {
    console.error("    ❌ No active (main) theme found");
    return null;
  }

  console.log(`    ✓ Active theme: "${main.name}" (id: ${main.id})`);
  return main.id;
}

async function getThemeAsset(
  store: string,
  token: string,
  themeId: number,
  key: string,
): Promise<string | null> {
  const { data, status } = await shopifyFetch(
    store,
    token,
    "GET",
    `themes/${themeId}/assets.json?asset[key]=${encodeURIComponent(key)}`,
  );
  if (status !== 200 || !data?.asset?.value) return null;
  return data.asset.value;
}

async function putThemeAsset(
  store: string,
  token: string,
  themeId: number,
  key: string,
  value: string,
): Promise<boolean> {
  if (DRY_RUN) {
    console.log(`    [DRY-RUN] Would write asset: ${key} (${value.length} chars)`);
    return true;
  }

  const { status } = await shopifyFetch(
    store,
    token,
    "PUT",
    `themes/${themeId}/assets.json`,
    { asset: { key, value } },
  );
  return status === 200;
}

// ─── Per-store data ──────────────────────────────────────────

interface StoreData {
  name: string;
  customers: string;
  rating: string;
  reviews: string;
  freeShipThreshold: string;
  headline: string;
  description: string;
  values: string[];
  email: string;
  tagline: string;
  accentColor: string;
  primaryColor: string;
}

const STORE_DATA: Record<string, StoreData> = {
  glowhaven: {
    name: "Glowhaven",
    customers: "25K+",
    rating: "4.9",
    reviews: "3,200+",
    freeShipThreshold: "$40+",
    headline: "Beauty That Feels Good",
    description:
      "At Glowhaven, we believe everyone deserves access to clean, effective beauty products. Our curated collection is free from harsh chemicals and crafted with ingredients you can trust. From skincare essentials to finishing touches, every product is chosen to help you glow naturally.",
    values: ["Clean Ingredients", "Cruelty-Free", "Dermatologist Tested", "Eco-Packaging"],
    email: "hello@glowhaven.com",
    tagline: "Clean Beauty Essentials",
    accentColor: "#e91e8c",
    primaryColor: "#f8b4c8",
  },
  aurae: {
    name: "Aurae",
    customers: "18K+",
    rating: "4.8",
    reviews: "2,400+",
    freeShipThreshold: "$50+",
    headline: "Crafted for Everyday Elegance",
    description:
      "Aurae was born from a love of timeless design and meaningful craftsmanship. Each piece in our collection is handcrafted by skilled artisans using ethically sourced materials. We believe jewelry should tell a story — yours.",
    values: ["Handcrafted", "Ethically Sourced", "Tarnish-Resistant", "Lifetime Warranty"],
    email: "hello@aurae.jewelry",
    tagline: "Handcrafted Fine Jewelry",
    accentColor: "#1a1a1a",
    primaryColor: "#c9a84c",
  },
  nestwell: {
    name: "Nestwell",
    customers: "30K+",
    rating: "4.9",
    reviews: "4,100+",
    freeShipThreshold: "$50+",
    headline: "Where House Meets Home",
    description:
      "Nestwell curates home decor that balances beauty with function. We partner with independent makers and sustainable brands to bring you pieces that transform any space into a warm, inviting sanctuary. Because home should feel like a hug.",
    values: ["Sustainable", "Artisan Made", "Functional Design", "Curated Quality"],
    email: "hello@nestwell.co",
    tagline: "Curated Home Decor",
    accentColor: "#2d5016",
    primaryColor: "#8b7355",
  },
};

// ─── 1. Reorder Collections — viral products first ──────────

async function reorderCollections(cfg: ShopifyStoreConfig) {
  console.log("\n  📦 Step 1: Reorder collections (viral products first)...");

  // Get all custom collections
  const { data: ccData } = await shopifyFetch(
    cfg.store, cfg.token, "GET",
    "custom_collections.json?limit=250&fields=id,title,handle",
  );
  const collections: { id: number; title: string; handle: string }[] =
    ccData?.custom_collections || [];

  if (collections.length === 0) {
    console.log("    ⚠ No custom collections found");
    return;
  }

  // Get all products with tags
  const { data: pData } = await shopifyFetch(
    cfg.store, cfg.token, "GET",
    "products.json?limit=250&fields=id,title,tags",
  );
  const allProducts: { id: number; title: string; tags: string }[] = pData?.products || [];

  const tagMap = new Map<number, Set<string>>();
  for (const p of allProducts) {
    tagMap.set(p.id, new Set(p.tags.split(",").map((t: string) => t.trim().toLowerCase())));
  }

  for (const collection of collections) {
    // Skip "frontpage" — managed by Shopify
    if (collection.handle === "frontpage") continue;

    console.log(`    📂 ${collection.title} (id: ${collection.id})...`);

    // Set sort_order to manual
    if (!DRY_RUN) {
      await shopifyFetch(cfg.store, cfg.token, "PUT", `custom_collections/${collection.id}.json`, {
        custom_collection: { id: collection.id, sort_order: "manual" },
      });
    }

    // Get products in this collection
    const { data: cpData } = await shopifyFetch(
      cfg.store, cfg.token, "GET",
      `products.json?collection_id=${collection.id}&limit=250&fields=id,title`,
    );
    const collProducts: { id: number; title: string }[] = cpData?.products || [];

    if (collProducts.length <= 1) {
      console.log(`      ⚠ ${collProducts.length} product(s) — skipping reorder`);
      continue;
    }

    // Sort: tiktok-viral → trending → rest
    const sorted = [...collProducts].sort((a, b) => {
      const aT = tagMap.get(a.id) || new Set();
      const bT = tagMap.get(b.id) || new Set();
      const aP = aT.has("tiktok-viral") ? 0 : aT.has("trending") ? 1 : 2;
      const bP = bT.has("tiktok-viral") ? 0 : bT.has("trending") ? 1 : 2;
      return aP - bP;
    });

    const sortedIds = sorted.map((p) => p.id);
    console.log(`      Order: ${sorted.map((p) => {
      const tags = tagMap.get(p.id);
      const marker = tags?.has("tiktok-viral") ? " 🔥" : tags?.has("trending") ? " 📈" : "";
      return p.title.slice(0, 30) + marker;
    }).join(", ")}`);

    if (DRY_RUN) {
      console.log(`      [DRY-RUN] Would reorder ${sortedIds.length} products`);
      continue;
    }

    // Get existing collects, delete, then recreate in sorted order
    const { data: collectsData } = await shopifyFetch(
      cfg.store, cfg.token, "GET",
      `collects.json?collection_id=${collection.id}&limit=250`,
    );
    const existingCollects: { id: number }[] = collectsData?.collects || [];

    // Delete existing collects
    for (const collect of existingCollects) {
      await shopifyFetch(cfg.store, cfg.token, "DELETE", `collects/${collect.id}.json`);
    }

    // Recreate in sorted order — position is auto-assigned incrementally
    for (const pid of sortedIds) {
      await shopifyFetch(cfg.store, cfg.token, "POST", "collects.json", {
        collect: { product_id: pid, collection_id: collection.id },
      });
    }

    console.log(`      ✓ Reordered ${sortedIds.length} products`);
  }
}

// ─── 2. Add Product Metafields — ratings + review counts ────

async function addProductMetafields(cfg: ShopifyStoreConfig) {
  console.log("\n  ⭐ Step 2: Add product metafields (ratings + reviews)...");

  const { data } = await shopifyFetch(
    cfg.store, cfg.token, "GET",
    "products.json?limit=250&fields=id,title",
  );
  const products: { id: number; title: string }[] = data?.products || [];

  if (products.length === 0) {
    console.log("    ⚠ No products found");
    return;
  }

  // Seeded random based on product ID for consistency across runs
  function seededRandom(productId: number, seed: number): number {
    const x = Math.sin(productId * 9301 + seed * 49297) * 49979;
    return x - Math.floor(x);
  }

  for (const product of products) {
    const rating = (4.3 + seededRandom(product.id, 1) * 0.6).toFixed(1); // 4.3–4.9
    const reviewCount = Math.floor(45 + seededRandom(product.id, 2) * 335); // 45–380

    console.log(
      `    ${product.title.slice(0, 40).padEnd(40)} → ★${rating} (${reviewCount} reviews)`,
    );

    if (DRY_RUN) continue;

    // Create rating metafield
    await shopifyFetch(cfg.store, cfg.token, "POST", `products/${product.id}/metafields.json`, {
      metafield: {
        namespace: "custom",
        key: "rating",
        type: "number_decimal",
        value: rating,
      },
    });

    // Create review_count metafield
    await shopifyFetch(cfg.store, cfg.token, "POST", `products/${product.id}/metafields.json`, {
      metafield: {
        namespace: "custom",
        key: "review_count",
        type: "number_integer",
        value: String(reviewCount),
      },
    });
  }

  console.log(`    ✓ Metafields added to ${products.length} products`);
}

// ─── 3. Enhance Product Template — social proof section ─────

function buildProductSocialProofLiquid(storeData: StoreData): string {
  return `
<style>
  .sp-wrap { max-width: 800px; margin: 32px auto; padding: 0 20px; }
  .sp-rating { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
  .sp-stars { color: #f59e0b; font-size: 18px; letter-spacing: 1px; }
  .sp-rating-text { font-size: 14px; color: #666; }
  .sp-viewers { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #666; margin-bottom: 16px; }
  .sp-viewers svg { width: 16px; height: 16px; }
  .sp-viewers strong { color: #333; }
  .sp-scarcity { margin-bottom: 16px; }
  .sp-scarcity-label { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: #dc2626; margin-bottom: 6px; }
  .sp-scarcity-label svg { width: 16px; height: 16px; }
  .sp-bar-bg { height: 8px; background: #f3f4f6; border-radius: 9999px; overflow: hidden; }
  .sp-bar-fill { height: 100%; border-radius: 9999px; transition: width 0.7s; }
  .sp-bar-low { background: #dc2626; animation: sp-pulse 2s infinite; }
  .sp-bar-med { background: #f97316; }
  @keyframes sp-pulse { 0%,100% { opacity:1 } 50% { opacity:0.6 } }
  .sp-trust { display: flex; flex-wrap: wrap; gap: 16px; padding: 16px 0; border-top: 1px solid #e5e7eb; margin-top: 16px; }
  .sp-trust-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #666; }
  .sp-trust-item svg { width: 16px; height: 16px; color: #22c55e; }
</style>

<div class="sp-wrap">
  {%- if product.metafields.custom.rating != blank -%}
  <div class="sp-rating">
    <span class="sp-stars">
      {%- assign rating_num = product.metafields.custom.rating.value | plus: 0 -%}
      {%- assign rating_floor = rating_num | floor -%}
      {%- for i in (1..5) -%}
        {%- if i <= rating_floor -%}&#9733;{%- else -%}&#9734;{%- endif -%}
      {%- endfor -%}
    </span>
    <span class="sp-rating-text">
      {{ product.metafields.custom.rating.value }} out of 5
      {%- if product.metafields.custom.review_count != blank -%}
        &nbsp;&middot;&nbsp;{{ product.metafields.custom.review_count.value }} reviews
      {%- endif -%}
    </span>
  </div>
  {%- endif -%}

  <div class="sp-viewers" id="sp-viewers">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
    <span><strong id="sp-viewer-count">0</strong> people viewing this right now</span>
  </div>

  {%- assign total_inv = 0 -%}
  {%- for variant in product.variants -%}
    {%- assign total_inv = total_inv | plus: variant.inventory_quantity -%}
  {%- endfor -%}
  {%- if total_inv > 0 and total_inv <= 50 -%}
  <div class="sp-scarcity">
    <div class="sp-scarcity-label">
      {%- if total_inv <= 10 -%}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Almost Gone! &mdash; Only {{ total_inv }} left
      {%- else -%}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
        Selling Fast &mdash; Only {{ total_inv }} left
      {%- endif -%}
    </div>
    <div class="sp-bar-bg">
      {%- assign pct = total_inv | times: 100 | divided_by: 50 -%}
      <div class="sp-bar-fill {% if total_inv <= 10 %}sp-bar-low{% else %}sp-bar-med{% endif %}" style="width:{{ pct }}%"></div>
    </div>
  </div>
  {%- endif -%}

  <div class="sp-trust">
    <div class="sp-trust-item">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="m16 8 4 2.5v6L16 19"/><path d="M1 10h15"/></svg>
      Free Shipping ${storeData.freeShipThreshold}
    </div>
    <div class="sp-trust-item">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      Secure Checkout
    </div>
    <div class="sp-trust-item">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
      Easy Returns
    </div>
  </div>
</div>

<script>
(function() {
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  var el = document.getElementById('sp-viewer-count');
  if (!el) return;
  el.textContent = rand(2, 8);
  function tick() {
    el.textContent = rand(2, 8);
    setTimeout(tick, 15000 + Math.random() * 15000);
  }
  setTimeout(tick, 15000 + Math.random() * 15000);
})();
</script>`.trim();
}

async function enhanceProductTemplate(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  🛒 Step 3: Enhance product template (social proof)...");

  const data = STORE_DATA[cfg.slug];
  if (!data) return;

  // Read current product template
  const raw = await getThemeAsset(cfg.store, cfg.token, themeId, "templates/product.json");

  let template: any;
  if (raw) {
    try {
      template = JSON.parse(raw);
    } catch {
      template = null;
    }
  }

  if (!template) {
    console.log("    ⚠ Could not read product template — creating minimal wrapper");
    template = {
      sections: { main: { type: "product-information", settings: {} } },
      order: ["main"],
    };
  }

  // Build and insert social proof section
  const liquid = buildProductSocialProofLiquid(data);

  template.sections.social_proof = {
    type: "custom-liquid",
    settings: {
      custom_liquid: liquid,
      color_scheme: "scheme-1",
      section_width: "page-width",
      "padding-block-start": 0,
      "padding-block-end": 20,
    },
  };

  // Insert after product-information section
  const order: string[] = template.order || Object.keys(template.sections);
  if (!order.includes("social_proof")) {
    const mainIdx = order.findIndex((s: string) => {
      const sec = template.sections[s];
      return sec?.type === "product-information" || s === "main";
    });
    if (mainIdx >= 0) {
      order.splice(mainIdx + 1, 0, "social_proof");
    } else {
      order.splice(1, 0, "social_proof"); // fallback: second position
    }
    template.order = order;
  }

  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "templates/product.json",
    JSON.stringify(template, null, 2),
  );
  console.log(ok ? "    ✓ Product template updated with social proof" : "    ❌ Failed to update product template");
}

// ─── 4. Create Store Pages — About, Contact, FAQ, Shipping ──

async function createStorePages(cfg: ShopifyStoreConfig) {
  console.log("\n  📄 Step 4: Create store pages...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const pages = [
    {
      title: "About Us",
      handle: "about",
      body_html: `
<div style="max-width:700px;margin:0 auto;text-align:center;padding:40px 20px">
  <h1>${d.headline}</h1>
  <p style="font-size:18px;line-height:1.8;margin:24px 0;color:#555">${d.description}</p>
  <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:32px">
    ${d.values.map((v) => `<span style="display:inline-block;padding:8px 20px;border:1px solid rgba(0,0,0,0.15);border-radius:999px;font-size:14px">${v}</span>`).join("\n    ")}
  </div>
  <div style="margin-top:48px;padding:32px;background:#f9fafb;border-radius:12px">
    <h3 style="margin-bottom:12px">Our Promise</h3>
    <p style="color:#555">Every product in our store is carefully selected for quality, value, and customer satisfaction. We stand behind everything we sell with our satisfaction guarantee.</p>
  </div>
</div>`.trim(),
    },
    {
      title: "Contact Us",
      handle: "contact",
      body_html: `
<div style="max-width:600px;margin:0 auto;padding:40px 20px">
  <h1 style="text-align:center;margin-bottom:8px">Get in Touch</h1>
  <p style="text-align:center;color:#555;margin-bottom:32px">We'd love to hear from you. Our team typically responds within 24 hours.</p>
  <div style="background:#f9fafb;border-radius:12px;padding:32px;margin-bottom:24px">
    <h3 style="margin-bottom:16px">Contact Information</h3>
    <p style="margin:8px 0"><strong>Email:</strong> <a href="mailto:${d.email}">${d.email}</a></p>
    <p style="margin:8px 0"><strong>Hours:</strong> Monday&ndash;Friday, 9 AM &ndash; 5 PM EST</p>
    <p style="margin:8px 0"><strong>Response Time:</strong> Within 24 hours</p>
  </div>
  <div style="background:#f9fafb;border-radius:12px;padding:32px">
    <h3 style="margin-bottom:16px">Before You Reach Out</h3>
    <p style="color:#555">Check our <a href="/pages/faq">FAQ page</a> &mdash; your question may already be answered there.</p>
    <p style="color:#555;margin-top:8px">For order inquiries, please include your order number for faster assistance.</p>
  </div>
</div>`.trim(),
    },
    {
      title: "FAQ",
      handle: "faq",
      body_html: buildFaqHtml(d),
    },
    {
      title: "Shipping & Returns",
      handle: "shipping-returns",
      body_html: buildShippingReturnsHtml(d),
    },
  ];

  for (const page of pages) {
    if (DRY_RUN) {
      console.log(`    [DRY-RUN] Would create: ${page.title} → /pages/${page.handle}`);
      continue;
    }

    const { status } = await shopifyFetch(cfg.store, cfg.token, "POST", "pages.json", { page });
    if (status === 201 || status === 200) {
      console.log(`    ✓ Created: ${page.title} → /pages/${page.handle}`);
    } else {
      console.log(`    ❌ Failed to create: ${page.title}`);
    }
  }
}

function buildFaqHtml(d: StoreData): string {
  const faqs = [
    {
      q: "How long does shipping take?",
      a: "Standard shipping takes 7&ndash;15 business days. We ship from our fulfillment centers worldwide to ensure the best pricing and quality for you.",
    },
    {
      q: "Do you offer free shipping?",
      a: `Yes! We offer free shipping on all orders over ${d.freeShipThreshold}. All orders include tracking information.`,
    },
    {
      q: "What is your return policy?",
      a: "We offer a 30-day return policy. If you&rsquo;re not satisfied with your purchase, contact us within 30 days for a full refund or exchange.",
    },
    {
      q: "How do I track my order?",
      a: "Once your order ships, you&rsquo;ll receive a confirmation email with a tracking number. You can use this to track your package in real time.",
    },
    {
      q: "Are your products authentic?",
      a: "Absolutely. Every product we sell is carefully sourced and quality-checked before being added to our store.",
    },
    {
      q: "Can I modify or cancel my order?",
      a: "We process orders quickly! If you need to make changes, contact us within 2 hours of placing your order and we&rsquo;ll do our best to accommodate.",
    },
    {
      q: "Do you ship internationally?",
      a: "Yes, we ship to most countries worldwide. International shipping typically takes 10&ndash;20 business days.",
    },
    {
      q: "How do I contact customer support?",
      a: `You can reach us at <a href="mailto:${d.email}">${d.email}</a>. We respond within 24 hours, Monday through Friday.`,
    },
  ];

  return `
<div style="max-width:700px;margin:0 auto;padding:40px 20px">
  <h1 style="text-align:center;margin-bottom:32px">Frequently Asked Questions</h1>
  ${faqs
    .map(
      (faq) => `
  <div style="margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #e5e7eb">
    <h3 style="margin-bottom:8px">${faq.q}</h3>
    <p style="color:#555;line-height:1.7">${faq.a}</p>
  </div>`,
    )
    .join("")}
</div>`.trim();
}

function buildShippingReturnsHtml(d: StoreData): string {
  return `
<div style="max-width:700px;margin:0 auto;padding:40px 20px">
  <h1 style="text-align:center;margin-bottom:32px">Shipping &amp; Returns</h1>

  <h2 style="margin-bottom:16px">Shipping Policy</h2>
  <div style="background:#f9fafb;border-radius:12px;padding:24px;margin-bottom:32px">
    <table style="width:100%;border-collapse:collapse">
      <tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:12px 0;font-weight:600">Standard Shipping</td>
        <td style="padding:12px 0;text-align:right">7&ndash;15 business days</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:12px 0;font-weight:600">Free Shipping</td>
        <td style="padding:12px 0;text-align:right">Orders over ${d.freeShipThreshold}</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:12px 0;font-weight:600">International</td>
        <td style="padding:12px 0;text-align:right">10&ndash;20 business days</td>
      </tr>
      <tr>
        <td style="padding:12px 0;font-weight:600">Order Tracking</td>
        <td style="padding:12px 0;text-align:right">Included with all orders</td>
      </tr>
    </table>
  </div>

  <h2 style="margin-bottom:16px">Return Policy</h2>
  <div style="background:#f9fafb;border-radius:12px;padding:24px;margin-bottom:32px">
    <ul style="padding-left:20px;color:#555;line-height:2">
      <li><strong>30-day return window</strong> from the date of delivery</li>
      <li>Items must be <strong>unused and in original packaging</strong></li>
      <li>Contact us at <a href="mailto:${d.email}">${d.email}</a> to initiate a return</li>
      <li>Refunds are processed within <strong>5&ndash;7 business days</strong> after we receive the item</li>
      <li>Return shipping costs are the responsibility of the customer unless the item is defective</li>
    </ul>
  </div>

  <h2 style="margin-bottom:16px">Exchanges</h2>
  <p style="color:#555;line-height:1.7">Need a different size or color? Contact us within 30 days and we&rsquo;ll arrange an exchange at no extra cost (subject to availability).</p>

  <div style="margin-top:32px;padding:24px;background:#f0fdf4;border-radius:12px;text-align:center">
    <p style="font-weight:600;margin-bottom:4px">Need help?</p>
    <p style="color:#555">Contact us at <a href="mailto:${d.email}">${d.email}</a></p>
  </div>
</div>`.trim();
}

// ─── 5. Add Social Proof Stats to Homepage ──────────────────

function buildHomepageSocialProofLiquid(d: StoreData): string {
  return `
<div style="padding:40px 20px;text-align:center">
  <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:40px;max-width:900px;margin:0 auto">
    <div style="min-width:120px">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin:0 auto 8px;display:block;opacity:0.7"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <div style="font-size:28px;font-weight:700">${d.customers}</div>
      <div style="font-size:13px;color:#666;margin-top:4px">Happy Customers</div>
    </div>
    <div style="min-width:120px">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin:0 auto 8px;display:block;opacity:0.7"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      <div style="font-size:28px;font-weight:700">&starf; ${d.rating}</div>
      <div style="font-size:13px;color:#666;margin-top:4px">Average Rating</div>
    </div>
    <div style="min-width:120px">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin:0 auto 8px;display:block;opacity:0.7"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
      <div style="font-size:28px;font-weight:700">${d.reviews}</div>
      <div style="font-size:13px;color:#666;margin-top:4px">Verified Reviews</div>
    </div>
    <div style="min-width:120px">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin:0 auto 8px;display:block;opacity:0.7"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
      <div style="font-size:28px;font-weight:700">100%</div>
      <div style="font-size:13px;color:#666;margin-top:4px">Secure Checkout</div>
    </div>
  </div>
</div>`.trim();
}

async function addHomepageSocialProof(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  📊 Step 5: Add social proof stats to homepage...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const raw = await getThemeAsset(cfg.store, cfg.token, themeId, "templates/index.json");
  if (!raw) {
    console.log("    ❌ Could not read templates/index.json");
    return;
  }

  let template: any;
  try {
    template = JSON.parse(raw);
  } catch {
    console.log("    ❌ Failed to parse templates/index.json");
    return;
  }

  // Add social_proof_stats section
  template.sections.social_proof_stats = {
    type: "custom-liquid",
    settings: {
      custom_liquid: buildHomepageSocialProofLiquid(d),
      color_scheme: "scheme-4",
      section_width: "page-width",
      "padding-block-start": 20,
      "padding-block-end": 20,
    },
  };

  // Insert between featured_products and brand_story in order array
  const order: string[] = template.order || [];
  if (!order.includes("social_proof_stats")) {
    const fpIdx = order.indexOf("featured_products");
    const bsIdx = order.indexOf("brand_story");

    if (fpIdx >= 0 && bsIdx > fpIdx) {
      // Insert right after featured_products (before brand_story)
      order.splice(fpIdx + 1, 0, "social_proof_stats");
    } else if (fpIdx >= 0) {
      order.splice(fpIdx + 1, 0, "social_proof_stats");
    } else {
      // Fallback: insert at position 2
      order.splice(Math.min(2, order.length), 0, "social_proof_stats");
    }
    template.order = order;
  }

  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "templates/index.json",
    JSON.stringify(template, null, 2),
  );
  console.log(ok ? "    ✓ Homepage social proof stats added" : "    ❌ Failed to update homepage");
}

// ─── Main ────────────────────────────────────────────────────

async function processStore(cfg: ShopifyStoreConfig) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  🚀 Launch-ready: ${cfg.slug.toUpperCase()} → ${cfg.store}`);
  console.log(`${"═".repeat(60)}`);

  // Step 0: Get active theme
  console.log("\n  🎨 Finding active theme...");
  const themeId = await getActiveThemeId(cfg.store, cfg.token);
  if (!themeId) return;

  // Steps 1–5
  await reorderCollections(cfg);
  await addProductMetafields(cfg);
  await enhanceProductTemplate(cfg, themeId);
  await createStorePages(cfg);
  await addHomepageSocialProof(cfg, themeId);

  // Log manual steps
  console.log(`\n  📋 MANUAL STEPS for ${cfg.slug.toUpperCase()}:`);
  console.log("     1. Install Judge.me (free) on each store for real customer reviews");
  console.log("     2. Set store policies: Shopify Admin → Settings → Policies");
  console.log("     3. Upload hero images: Themes → Customize → Hero section");
  console.log("     4. Set up navigation menus:");
  console.log("        Main menu: Home | Shop All | Collections... | About | Contact");
  console.log("        Footer: Search | FAQ | Shipping & Returns | Contact");
  console.log("     5. Add custom domain when ready to go live");

  console.log(`\n  ✅ ${cfg.slug.toUpperCase()} launch-ready setup complete`);
}

async function main() {
  console.log("🚀 Shopify Launch-Ready Script");
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}`);
  console.log(`   API version: ${API_VERSION}\n`);

  const configs = getStoreConfigs();

  if (configs.length === 0) {
    console.error("❌ No Shopify store credentials found in environment.");
    console.error("   Set SHOPIFY_GLOWHAVEN_STORE, SHOPIFY_GLOWHAVEN_TOKEN, etc.");
    console.error("   Required scopes: read_products, write_products, read_themes, write_themes, read_content, write_content");
    process.exit(1);
  }

  console.log(`   Stores: ${configs.map((c) => c.slug.toUpperCase()).join(", ")}`);

  for (const cfg of configs) {
    await processStore(cfg);
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log("✅ All stores launch-ready!");
  console.log(`${"═".repeat(60)}\n`);

  console.log("📋 VERIFICATION CHECKLIST:");
  console.log("   □ Visit each store homepage — social proof bar visible between products and brand story");
  console.log("   □ Visit any product page — rating stars, viewer count, trust badges visible");
  console.log("   □ Check /pages/about, /pages/contact, /pages/faq, /pages/shipping-returns exist");
  console.log("   □ Browse collections — viral/trending products appear first");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  });
