import { config } from "dotenv";
import { resolve } from "path";

// Load .env from monorepo root
config({ path: resolve(__dirname, "../../../.env") });

// ─── Config ──────────────────────────────────────────────────

const API_VERSION = "2026-01";
const DRY_RUN = process.argv.includes("--dry-run");

interface ShopifyStoreConfig {
  slug: string;
  store: string;
  token: string;
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

interface StoreV2Data {
  name: string;
  freeShipThreshold: string;
  freeShipAmount: number;
  accentColor: string;
  accentColorLight: string;
  textOnAccent: string;
  discountCode: string;
  discountPercent: number;
  instagram: string;
  customers: string;
  rating: string;
  tagline: string;
  privacyEmail: string;
}

const STORE_DATA: Record<string, StoreV2Data> = {
  glowhaven: {
    name: "Glowhaven",
    freeShipThreshold: "$40+",
    freeShipAmount: 40,
    accentColor: "#e91e8c",
    accentColorLight: "#fce4f1",
    textOnAccent: "#ffffff",
    discountCode: "GLOW15",
    discountPercent: 15,
    instagram: "glowhaven.co",
    customers: "25K+",
    rating: "4.9",
    tagline: "Clean Beauty, Delivered",
    privacyEmail: "privacy@glowhaven.co",
  },
  aurae: {
    name: "Aurae",
    freeShipThreshold: "$50+",
    freeShipAmount: 50,
    accentColor: "#1a1a1a",
    accentColorLight: "#f5f5f5",
    textOnAccent: "#ffffff",
    discountCode: "AURAE15",
    discountPercent: 15,
    instagram: "aurae.jewelry",
    customers: "18K+",
    rating: "4.8",
    tagline: "Handcrafted With Love",
    privacyEmail: "privacy@aurae.co",
  },
  nestwell: {
    name: "Nestwell",
    freeShipThreshold: "$50+",
    freeShipAmount: 50,
    accentColor: "#2d5016",
    accentColorLight: "#ecfce5",
    textOnAccent: "#ffffff",
    discountCode: "NEST15",
    discountPercent: 15,
    instagram: "nestwell.home",
    customers: "30K+",
    rating: "4.9",
    tagline: "Elevate Your Space",
    privacyEmail: "privacy@nestwell.co",
  },
};

// Store-specific testimonials
interface Testimonial {
  name: string;
  location: string;
  stars: number;
  product: string;
  text: string;
}

const STORE_TESTIMONIALS: Record<string, Testimonial[]> = {
  glowhaven: [
    { name: "Sarah M.", location: "New York, NY", stars: 5, product: "Vitamin C Serum", text: "My skin has never looked better! The glow is real. I've been using it for 3 weeks and already see a huge difference." },
    { name: "Jessica T.", location: "Los Angeles, CA", stars: 5, product: "Rosemary Oil", text: "This stuff works miracles for hair growth. My baby hairs are finally growing in. Absolutely obsessed!" },
    { name: "Emily R.", location: "Chicago, IL", stars: 5, product: "Acne Patches", text: "These patches are a game changer. Put them on at night and wake up with clear skin. My go-to now." },
    { name: "Mia L.", location: "Miami, FL", stars: 4, product: "Gua Sha Stone", text: "Love the de-puffing effect in the morning. It's become part of my daily routine. Great quality jade." },
    { name: "Olivia K.", location: "Austin, TX", stars: 5, product: "LED Face Mask", text: "Was skeptical but this actually works! My acne scars are fading and my skin texture has improved so much." },
    { name: "Ava P.", location: "Denver, CO", stars: 5, product: "Lip Oil", text: "The perfect glossy finish without being sticky. I've gotten so many compliments. Buying more colors!" },
    { name: "Sophia W.", location: "Seattle, WA", stars: 5, product: "Heatless Curls Set", text: "I wake up with salon-perfect curls every morning. No heat damage! My hair stylist was amazed." },
    { name: "Isabella N.", location: "Portland, OR", stars: 4, product: "Ice Roller", text: "So refreshing on puffy morning skin. I keep it in the freezer and use it daily. Great for under-eyes." },
  ],
  aurae: [
    { name: "Rachel H.", location: "San Francisco, CA", stars: 5, product: "Birth Flower Necklace", text: "The most thoughtful gift I've ever given. My mom cried when she opened it. Beautiful craftsmanship." },
    { name: "Amanda G.", location: "Nashville, TN", stars: 5, product: "Tennis Bracelet", text: "Looks way more expensive than it is. I wear it every day and it still sparkles like day one." },
    { name: "Taylor B.", location: "Dallas, TX", stars: 5, product: "Zodiac Necklace", text: "My Scorpio necklace is stunning. The detail is incredible for the price. Gets compliments everywhere." },
    { name: "Lauren D.", location: "Phoenix, AZ", stars: 4, product: "Evil Eye Bracelet", text: "Love the protection vibes and it's gorgeous. Stacks perfectly with my other bracelets." },
    { name: "Nicole F.", location: "Philadelphia, PA", stars: 5, product: "Couple Bracelet Set", text: "Got matching bracelets for my boyfriend and me. The magnetic clasp is such a cute detail!" },
    { name: "Christina M.", location: "San Diego, CA", stars: 5, product: "Croissant Ring", text: "This ring is my new everyday piece. So chic and comfortable. The gold hasn't tarnished at all." },
    { name: "Danielle S.", location: "Houston, TX", stars: 5, product: "Cuban Link Bracelet", text: "Heavy, solid feel. Doesn't look cheap at all. My husband loves his — ordering another for my brother." },
    { name: "Brittany J.", location: "Atlanta, GA", stars: 4, product: "Stackable Rings", text: "Perfect for mixing and matching. I bought 3 sets and create different combos daily. Great quality." },
  ],
  nestwell: [
    { name: "Jennifer L.", location: "Brooklyn, NY", stars: 5, product: "Moon Lamp", text: "The most beautiful lamp I own. The warm glow creates such a cozy atmosphere. Perfect bedside piece." },
    { name: "Stephanie C.", location: "Portland, OR", stars: 5, product: "Rain Cloud Diffuser", text: "I'm obsessed with watching the 'rain' fall. So relaxing and the essential oils smell amazing." },
    { name: "Ashley W.", location: "San Francisco, CA", stars: 5, product: "Sunset Lamp", text: "My Instagram photos have never looked better. This lamp creates the most beautiful golden hour vibes." },
    { name: "Kayla R.", location: "Chicago, IL", stars: 4, product: "Chunky Knit Blanket", text: "So cozy and looks gorgeous draped on my couch. Everyone who visits asks where I got it." },
    { name: "Morgan T.", location: "Denver, CO", stars: 5, product: "Incense Waterfall", text: "Mesmerizing to watch. The smoke cascading down is so calming. My meditation sessions are next level." },
    { name: "Heather A.", location: "Seattle, WA", stars: 5, product: "LED Strip Lights", text: "Transformed my bedroom completely. The app control is super easy and the colors are vivid." },
    { name: "Amber N.", location: "Austin, TX", stars: 5, product: "Flame Diffuser", text: "Looks like a real candle flame! I use it in my bathroom and it creates such a spa-like vibe." },
    { name: "Rebecca P.", location: "Miami, FL", stars: 4, product: "Candle Warmer", text: "No more worrying about open flames. My candles last twice as long and the scent fills the whole room." },
  ],
};

// Instagram lifestyle image placeholders (using Shopify's placeholder assets)
const STORE_INSTAGRAM: Record<string, { images: string[]; caption: string }> = {
  glowhaven: {
    images: [
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-lifestyle-1_large.png",
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-lifestyle-2_large.png",
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png",
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png",
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-lifestyle-1_large.png",
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-lifestyle-2_large.png",
    ],
    caption: "Join our glow-up community",
  },
  aurae: {
    images: [
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-1_large.png",
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-2_large.png",
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-3_large.png",
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-4_large.png",
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-1_large.png",
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-2_large.png",
    ],
    caption: "Discover your signature style",
  },
  nestwell: {
    images: [
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-lifestyle-1_large.png",
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-lifestyle-2_large.png",
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-3_large.png",
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-4_large.png",
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-lifestyle-1_large.png",
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-lifestyle-2_large.png",
    ],
    caption: "Create your dream space",
  },
};

// ─── 1. Testimonials Carousel ────────────────────────────────

function buildTestimonialsCarouselLiquid(d: StoreV2Data, testimonials: Testimonial[]): string {
  const starsHtml = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

  const cards = testimonials
    .map(
      (t, i) => `
    <div class="testi-card" style="min-width:300px;flex-shrink:0">
      <div class="testi-stars" style="color:${d.accentColor}">${starsHtml(t.stars)}</div>
      <p class="testi-text">"${t.text}"</p>
      <div class="testi-author">
        <div class="testi-avatar">${t.name.charAt(0)}</div>
        <div>
          <div class="testi-name">${t.name}</div>
          <div class="testi-meta">${t.location} · Verified Buyer</div>
          <div class="testi-product">Purchased: ${t.product}</div>
        </div>
      </div>
    </div>`,
    )
    .join("\n");

  return `
<style>
  .testi-section { max-width: 1200px; margin: 0 auto; padding: 40px 20px; text-align: center; }
  .testi-heading { font-size: 26px; font-weight: 700; color: #111; margin-bottom: 6px; }
  .testi-subheading { font-size: 15px; color: #666; margin-bottom: 28px; }
  .testi-track-wrap { overflow: hidden; position: relative; }
  .testi-track {
    display: flex;
    gap: 20px;
    animation: testi-scroll 40s linear infinite;
    width: max-content;
  }
  .testi-track:hover { animation-play-state: paused; }
  @keyframes testi-scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .testi-card {
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 14px;
    padding: 24px;
    text-align: left;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .testi-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
  .testi-stars { font-size: 16px; margin-bottom: 12px; letter-spacing: 2px; }
  .testi-text { font-size: 14px; line-height: 1.6; color: #333; margin-bottom: 16px; font-style: italic; }
  .testi-author { display: flex; align-items: center; gap: 12px; }
  .testi-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    background: ${d.accentColorLight}; color: ${d.accentColor};
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 16px; flex-shrink: 0;
  }
  .testi-name { font-size: 14px; font-weight: 600; color: #111; }
  .testi-meta { font-size: 12px; color: #999; }
  .testi-product { font-size: 11px; color: ${d.accentColor}; margin-top: 2px; }
  @media (max-width: 600px) {
    .testi-card { min-width: 260px !important; padding: 18px; }
    .testi-heading { font-size: 22px; }
  }
</style>
<div class="testi-section">
  <div class="testi-heading">What Our Customers Say</div>
  <div class="testi-subheading">Join ${d.customers} happy customers worldwide</div>
  <div class="testi-track-wrap">
    <div class="testi-track">
      ${cards}
      ${cards}
    </div>
  </div>
</div>`.trim();
}

// ─── 2. Instagram Feed Grid ─────────────────────────────────

function buildInstagramGridLiquid(d: StoreV2Data): string {
  const ig = STORE_INSTAGRAM[d.name.toLowerCase()] || STORE_INSTAGRAM.glowhaven;

  const gridItems = ig.images
    .map(
      (url, i) => `
    <a class="ig-grid-item" href="https://instagram.com/${d.instagram}" target="_blank" rel="noopener">
      <img src="${url}" alt="${d.name} lifestyle ${i + 1}" loading="lazy">
      <div class="ig-grid-overlay">
        <span class="ig-grid-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
        </span>
      </div>
    </a>`,
    )
    .join("\n");

  return `
<style>
  .ig-section { max-width: 1200px; margin: 0 auto; padding: 40px 20px; text-align: center; }
  .ig-heading { font-size: 26px; font-weight: 700; color: #111; margin-bottom: 6px; }
  .ig-subheading { font-size: 15px; color: #666; margin-bottom: 24px; }
  .ig-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
  }
  .ig-grid-item {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 8px;
    display: block;
  }
  .ig-grid-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  .ig-grid-item:hover img { transform: scale(1.08); }
  .ig-grid-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .ig-grid-item:hover .ig-grid-overlay { opacity: 1; }
  .ig-grid-icon { display: flex; }
  .ig-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
    padding: 12px 28px;
    background: ${d.accentColor};
    color: ${d.textOnAccent};
    text-decoration: none;
    border-radius: 30px;
    font-weight: 600;
    font-size: 14px;
    transition: opacity 0.2s;
  }
  .ig-cta:hover { opacity: 0.9; }
  @media (max-width: 768px) {
    .ig-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 480px) {
    .ig-grid { grid-template-columns: repeat(2, 1fr); }
  }
</style>
<div class="ig-section">
  <div class="ig-heading">Follow Us on Instagram</div>
  <div class="ig-subheading">${ig.caption} — @${d.instagram}</div>
  <div class="ig-grid">
    ${gridItems}
  </div>
  <a class="ig-cta" href="https://instagram.com/${d.instagram}" target="_blank" rel="noopener">
    Follow @${d.instagram}
  </a>
</div>`.trim();
}

// ─── 3. Complete Your Routine Upsell ─────────────────────────

function buildCompleteRoutineLiquid(d: StoreV2Data): string {
  return `
<style>
  .routine-wrap { max-width: 1000px; margin: 40px auto; padding: 0 20px; }
  .routine-title { font-size: 22px; font-weight: 700; text-align: center; margin-bottom: 6px; color: #111; }
  .routine-subtitle { font-size: 14px; color: #666; text-align: center; margin-bottom: 24px; }
  .routine-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .routine-card { text-decoration: none; color: inherit; display: block; position: relative; }
  .routine-card:hover .routine-img { transform: scale(1.03); }
  .routine-img-wrap { overflow: hidden; border-radius: 12px; aspect-ratio: 1; background: #f5f5f5; margin-bottom: 10px; }
  .routine-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
  .routine-card-title { font-size: 13px; font-weight: 600; color: #333; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .routine-card-price { font-size: 14px; font-weight: 700; color: ${d.accentColor}; margin-bottom: 8px; }
  .routine-card-compare { font-size: 12px; color: #999; text-decoration: line-through; margin-left: 6px; }
  .routine-quick-add {
    width: 100%;
    padding: 10px;
    background: ${d.accentColor};
    color: ${d.textOnAccent};
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .routine-quick-add:hover { opacity: 0.9; }
  .routine-quick-add:disabled { opacity: 0.5; cursor: not-allowed; }
  .routine-loading { text-align: center; padding: 30px; color: #999; }
  @media (max-width: 768px) { .routine-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; } }
  @media (max-width: 480px) { .routine-grid { grid-template-columns: 1fr; } }
</style>

<div class="routine-wrap" id="routine-upsell">
  <div class="routine-title">Complete Your Routine</div>
  <div class="routine-subtitle">Customers who bought this also loved these</div>
  <div class="routine-loading" id="routine-loading">Loading recommendations...</div>
  <div class="routine-grid" id="routine-grid" style="display:none"></div>
</div>

<script>
(function() {
  var productId = {{ product.id | json }};
  if (!productId) { document.getElementById('routine-upsell').style.display = 'none'; return; }

  fetch('/recommendations/products.json?product_id=' + productId + '&limit=3')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var products = data.products || [];
      if (products.length === 0) {
        document.getElementById('routine-upsell').style.display = 'none';
        return;
      }
      var grid = document.getElementById('routine-grid');
      var html = '';
      products.forEach(function(p) {
        var img = p.featured_image || (p.images && p.images[0]) || '';
        var price = (parseFloat(p.price) / 100).toFixed(2);
        var variantId = p.variants && p.variants[0] ? p.variants[0].id : '';
        var compareHtml = '';
        if (p.compare_at_price && parseFloat(p.compare_at_price) > parseFloat(p.price)) {
          compareHtml = '<span class="routine-card-compare">$' + (parseFloat(p.compare_at_price) / 100).toFixed(2) + '</span>';
        }
        html += '<div class="routine-card">';
        html += '<a href="' + p.url + '" style="text-decoration:none;color:inherit">';
        html += '<div class="routine-img-wrap"><img class="routine-img" src="' + img + '" alt="' + p.title.replace(/"/g, '&quot;') + '" loading="lazy"></div>';
        html += '<div class="routine-card-title">' + p.title + '</div>';
        html += '<div class="routine-card-price">$' + price + compareHtml + '</div>';
        html += '</a>';
        html += '<button class="routine-quick-add" data-variant="' + variantId + '" onclick="window._routineAdd(this)">Quick Add</button>';
        html += '</div>';
      });
      grid.innerHTML = html;
      grid.style.display = 'grid';
      document.getElementById('routine-loading').style.display = 'none';
    })
    .catch(function() {
      document.getElementById('routine-upsell').style.display = 'none';
    });

  window._routineAdd = function(btn) {
    var vid = btn.getAttribute('data-variant');
    if (!vid) return;
    btn.disabled = true;
    btn.textContent = 'Adding...';
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: parseInt(vid), quantity: 1 }] })
    })
    .then(function(r) { return r.json(); })
    .then(function() {
      btn.textContent = 'Added ✓';
      setTimeout(function() { btn.disabled = false; btn.textContent = 'Quick Add'; }, 2000);
    })
    .catch(function() {
      btn.disabled = false;
      btn.textContent = 'Quick Add';
    });
  };
})();
</script>`.trim();
}

// ─── 4. Urgency Countdown Timer ──────────────────────────────

function buildUrgencyTimerSnippet(d: StoreV2Data): string {
  return `{% comment %}
  Urgency Countdown Timer — auto-generated by shopify-enhance-v2
{% endcomment %}

{% if template == 'product' %}
<style>
  .urgency-timer {
    max-width: 600px;
    margin: 12px auto;
    padding: 12px 16px;
    background: ${d.accentColorLight};
    border-radius: 10px;
    text-align: center;
    font-size: 14px;
    color: #333;
  }
  .urgency-timer-icon { margin-right: 6px; }
  .urgency-timer-bold { font-weight: 700; color: ${d.accentColor}; }
  .urgency-timer-sub { font-size: 12px; color: #777; margin-top: 4px; }
</style>

<div class="urgency-timer" id="urgency-timer" style="display:none">
  <span class="urgency-timer-icon">⏰</span>
  Order within <span class="urgency-timer-bold" id="urgency-countdown"></span> for same-day processing
  <div class="urgency-timer-sub">Limited-time offer · Free shipping on orders ${d.freeShipThreshold}</div>
</div>

<script>
(function() {
  var el = document.getElementById('urgency-timer');
  var countdownEl = document.getElementById('urgency-countdown');
  if (!el || !countdownEl) return;

  function updateTimer() {
    var now = new Date();
    var cutoff = new Date();
    cutoff.setHours(18, 0, 0, 0); // 6 PM cutoff

    if (now >= cutoff) {
      // Past cutoff — show next day
      cutoff.setDate(cutoff.getDate() + 1);
    }

    var diff = cutoff - now;
    var hours = Math.floor(diff / 3600000);
    var mins = Math.floor((diff % 3600000) / 60000);
    var secs = Math.floor((diff % 60000) / 1000);

    countdownEl.textContent = hours + 'h ' + mins + 'm ' + secs + 's';
    el.style.display = 'block';
  }

  updateTimer();
  setInterval(updateTimer, 1000);
})();
</script>
{% endif %}`;
}

// ─── 5. Product Image Zoom ──────────────────────────────────

function buildImageZoomSnippet(d: StoreV2Data): string {
  return `{% comment %}
  Product Image Zoom — auto-generated by shopify-enhance-v2
{% endcomment %}

{% if template == 'product' %}
<style>
  .product__media-item .media img,
  .product__media img,
  .product-media-container img {
    transition: transform 0.2s ease;
  }
  .img-zoom-active {
    overflow: hidden !important;
    cursor: zoom-in;
  }
  .img-zoom-active img {
    transform-origin: var(--zoom-x, center) var(--zoom-y, center);
  }
  .img-zoom-active:hover img {
    transform: scale(2);
  }
  @media (max-width: 768px) {
    .img-zoom-active:hover img { transform: none; }
    .img-zoom-active { cursor: default; }
  }
</style>

<script>
(function() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return; // Skip on mobile

  function initZoom() {
    var containers = document.querySelectorAll('.product__media-item, .product-media-container, .product__media');
    if (containers.length === 0) return;

    containers.forEach(function(container) {
      if (container.classList.contains('img-zoom-active')) return;
      container.classList.add('img-zoom-active');

      container.addEventListener('mousemove', function(e) {
        var rect = container.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        container.style.setProperty('--zoom-x', x + '%');
        container.style.setProperty('--zoom-y', y + '%');
      });

      container.addEventListener('mouseleave', function() {
        container.style.setProperty('--zoom-x', 'center');
        container.style.setProperty('--zoom-y', 'center');
      });
    });
  }

  // Init on load and on variant change (Dawn re-renders media)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initZoom);
  } else {
    initZoom();
  }

  // Re-init on Shopify section re-render
  document.addEventListener('shopify:section:load', initZoom);

  // MutationObserver fallback for dynamic media changes
  var obs = new MutationObserver(function(mutations) {
    var hasNew = mutations.some(function(m) { return m.addedNodes.length > 0; });
    if (hasNew) setTimeout(initZoom, 100);
  });
  var productMedia = document.querySelector('.product__media-wrapper, .product-media-container');
  if (productMedia) {
    obs.observe(productMedia, { childList: true, subtree: true });
  }
})();
</script>
{% endif %}`;
}

// ─── 6. Breadcrumbs ──────────────────────────────────────────

function buildBreadcrumbsSnippet(d: StoreV2Data): string {
  return `{% comment %}
  Breadcrumbs with Schema.org — auto-generated by shopify-enhance-v2
{% endcomment %}

<style>
  .breadcrumbs {
    max-width: 1200px;
    margin: 0 auto;
    padding: 12px 20px;
    font-size: 13px;
    color: #999;
  }
  .breadcrumbs a {
    color: #666;
    text-decoration: none;
    transition: color 0.2s;
  }
  .breadcrumbs a:hover { color: ${d.accentColor}; }
  .breadcrumbs-sep { margin: 0 8px; color: #ccc; }
  .breadcrumbs-current { color: #333; font-weight: 500; }
</style>

{% if template == 'product' %}
<nav class="breadcrumbs" aria-label="Breadcrumb">
  <a href="/">Home</a>
  <span class="breadcrumbs-sep">›</span>
  {% if product.collections.size > 0 %}
    {% assign bc_collection = product.collections.first %}
    <a href="{{ bc_collection.url }}">{{ bc_collection.title }}</a>
    <span class="breadcrumbs-sep">›</span>
  {% endif %}
  <span class="breadcrumbs-current">{{ product.title }}</span>
</nav>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "{{ shop.url }}"
    }{% if product.collections.size > 0 %},
    {
      "@type": "ListItem",
      "position": 2,
      "name": {{ bc_collection.title | json }},
      "item": "{{ shop.url }}{{ bc_collection.url }}"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": {{ product.title | json }}
    }{% else %},
    {
      "@type": "ListItem",
      "position": 2,
      "name": {{ product.title | json }}
    }{% endif %}
  ]
}
</script>
{% elsif template == 'collection' %}
<nav class="breadcrumbs" aria-label="Breadcrumb">
  <a href="/">Home</a>
  <span class="breadcrumbs-sep">›</span>
  <a href="/collections">Collections</a>
  <span class="breadcrumbs-sep">›</span>
  <span class="breadcrumbs-current">{{ collection.title }}</span>
</nav>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "{{ shop.url }}"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Collections",
      "item": "{{ shop.url }}/collections"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": {{ collection.title | json }}
    }
  ]
}
</script>
{% endif %}`;
}

// ─── 7. Quick Add to Cart (Collection) ──────────────────────

function buildQuickAddCollectionSnippet(d: StoreV2Data): string {
  return `{% comment %}
  Quick Add to Cart for Collection Pages — auto-generated by shopify-enhance-v2
{% endcomment %}

{% if template == 'collection' %}
<style>
  .card__inner, .card-wrapper, .collection-product-card {
    position: relative;
  }
  .quick-add-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px;
    background: linear-gradient(transparent, rgba(0,0,0,0.05));
    opacity: 0;
    transition: opacity 0.25s;
    z-index: 5;
    pointer-events: none;
  }
  .card__inner:hover .quick-add-overlay,
  .card-wrapper:hover .quick-add-overlay {
    opacity: 1;
    pointer-events: auto;
  }
  .quick-add-btn {
    width: 100%;
    padding: 10px 16px;
    background: ${d.accentColor};
    color: ${d.textOnAccent};
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .quick-add-btn:hover { opacity: 0.9; }
  .quick-add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  @media (max-width: 768px) {
    .quick-add-overlay { opacity: 1; pointer-events: auto; background: none; position: relative; padding: 8px 0 0; }
  }
</style>

<script>
(function() {
  function initQuickAdd() {
    // Find product cards on collection page
    var cards = document.querySelectorAll('.card__inner, .card-wrapper, .collection-product-card');

    cards.forEach(function(card) {
      if (card.querySelector('.quick-add-overlay')) return; // Already initialized

      // Find the product link to get the handle
      var link = card.querySelector('a[href*="/products/"]');
      if (!link) return;

      var href = link.getAttribute('href');
      var match = href.match(/\\/products\\/([^?#]+)/);
      if (!match) return;

      var handle = match[1];

      // Create quick add overlay
      var overlay = document.createElement('div');
      overlay.className = 'quick-add-overlay';
      var btn = document.createElement('button');
      btn.className = 'quick-add-btn';
      btn.textContent = 'Add to Cart';
      btn.setAttribute('data-handle', handle);

      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var self = this;
        self.disabled = true;
        self.textContent = 'Adding...';

        // Fetch product JSON to get first variant ID
        fetch('/products/' + handle + '.js')
          .then(function(r) { return r.json(); })
          .then(function(product) {
            var variantId = product.variants[0].id;
            return fetch('/cart/add.js', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] })
            });
          })
          .then(function(r) { return r.json(); })
          .then(function() {
            self.textContent = 'Added ✓';
            // Dispatch cart update event for shipping bar
            document.dispatchEvent(new CustomEvent('cart:updated'));
            setTimeout(function() { self.disabled = false; self.textContent = 'Add to Cart'; }, 2000);
          })
          .catch(function() {
            self.disabled = false;
            self.textContent = 'Add to Cart';
          });
      });

      overlay.appendChild(btn);
      card.appendChild(overlay);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuickAdd);
  } else {
    initQuickAdd();
  }

  document.addEventListener('shopify:section:load', initQuickAdd);
})();
</script>
{% endif %}`;
}

// ─── 8. Free Shipping Progress Bar ──────────────────────────

function buildShippingProgressSnippet(d: StoreV2Data): string {
  return `{% comment %}
  Free Shipping Progress Bar — auto-generated by shopify-enhance-v2
{% endcomment %}

<style>
  .ship-bar-wrap {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  .ship-bar {
    background: ${d.accentColorLight};
    border-radius: 10px;
    padding: 12px 20px;
    text-align: center;
    font-size: 14px;
    color: #333;
    display: none;
  }
  .ship-bar.active { display: block; }
  .ship-bar-text { margin-bottom: 8px; font-weight: 500; }
  .ship-bar-text strong { color: ${d.accentColor}; }
  .ship-bar-track {
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    max-width: 400px;
    margin: 0 auto;
  }
  .ship-bar-fill {
    height: 100%;
    background: ${d.accentColor};
    border-radius: 4px;
    transition: width 0.5s ease;
    width: 0%;
  }
  .ship-bar-success { color: ${d.accentColor}; font-weight: 600; }
  .ship-bar-success svg { vertical-align: middle; margin-right: 4px; }
</style>

<div class="ship-bar-wrap">
  <div class="ship-bar" id="shipping-progress-bar">
    <div class="ship-bar-text" id="ship-bar-text"></div>
    <div class="ship-bar-track">
      <div class="ship-bar-fill" id="ship-bar-fill"></div>
    </div>
  </div>
</div>

<script>
(function() {
  var threshold = ${d.freeShipAmount * 100}; // in cents
  var bar = document.getElementById('shipping-progress-bar');
  var textEl = document.getElementById('ship-bar-text');
  var fillEl = document.getElementById('ship-bar-fill');

  if (!bar || !textEl || !fillEl) return;

  function updateBar() {
    fetch('/cart.js')
      .then(function(r) { return r.json(); })
      .then(function(cart) {
        var total = cart.total_price; // in cents
        if (total === 0) {
          bar.classList.remove('active');
          return;
        }

        bar.classList.add('active');
        var pct = Math.min((total / threshold) * 100, 100);
        fillEl.style.width = pct + '%';

        if (total >= threshold) {
          textEl.innerHTML = '<span class="ship-bar-success"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> You qualify for FREE shipping!</span>';
        } else {
          var remaining = ((threshold - total) / 100).toFixed(2);
          textEl.innerHTML = 'You\\u2019re <strong>$' + remaining + '</strong> away from FREE shipping!';
        }
      })
      .catch(function() {});
  }

  // Initial check
  updateBar();

  // Listen for cart updates
  document.addEventListener('cart:updated', updateBar);

  // Also poll on common AJAX cart events
  var origFetch = window.fetch;
  window.fetch = function() {
    var args = arguments;
    var result = origFetch.apply(this, args);
    if (typeof args[0] === 'string' && (args[0].indexOf('/cart/add') >= 0 || args[0].indexOf('/cart/change') >= 0 || args[0].indexOf('/cart/update') >= 0)) {
      result.then(function() { setTimeout(updateBar, 500); });
    }
    return result;
  };
})();
</script>`;
}

// ─── 9. Cart Upsell ─────────────────────────────────────────

function buildCartUpsellSnippet(d: StoreV2Data): string {
  return `{% comment %}
  Cart Upsell Recommendations — auto-generated by shopify-enhance-v2
{% endcomment %}

{% if template == 'cart' %}
<style>
  .cart-upsell { max-width: 1000px; margin: 24px auto; padding: 0 20px; }
  .cart-upsell-title { font-size: 18px; font-weight: 700; color: #111; margin-bottom: 16px; }
  .cart-upsell-grid { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px; -webkit-overflow-scrolling: touch; }
  .cart-upsell-grid::-webkit-scrollbar { height: 4px; }
  .cart-upsell-grid::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
  .cart-upsell-card {
    min-width: 180px;
    flex-shrink: 0;
    text-decoration: none;
    color: inherit;
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    overflow: hidden;
    transition: box-shadow 0.2s;
  }
  .cart-upsell-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
  .cart-upsell-img { width: 100%; aspect-ratio: 1; object-fit: cover; }
  .cart-upsell-info { padding: 10px 12px; }
  .cart-upsell-name { font-size: 13px; font-weight: 600; color: #333; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .cart-upsell-price { font-size: 14px; font-weight: 700; color: ${d.accentColor}; margin-bottom: 8px; }
  .cart-upsell-add {
    width: calc(100% - 24px);
    margin: 0 12px 12px;
    padding: 8px;
    background: ${d.accentColor};
    color: ${d.textOnAccent};
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .cart-upsell-add:hover { opacity: 0.9; }
  .cart-upsell-add:disabled { opacity: 0.5; }
</style>

<div class="cart-upsell" id="cart-upsell" style="display:none">
  <div class="cart-upsell-title">You Might Also Like</div>
  <div class="cart-upsell-grid" id="cart-upsell-grid"></div>
</div>

<script>
(function() {
  var wrap = document.getElementById('cart-upsell');
  var grid = document.getElementById('cart-upsell-grid');
  if (!wrap || !grid) return;

  // Get first item in cart to base recommendations on
  fetch('/cart.js')
    .then(function(r) { return r.json(); })
    .then(function(cart) {
      if (!cart.items || cart.items.length === 0) return;
      var productId = cart.items[0].product_id;
      var cartIds = cart.items.map(function(i) { return i.product_id; });

      return fetch('/recommendations/products.json?product_id=' + productId + '&limit=8')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var products = (data.products || []).filter(function(p) {
            return cartIds.indexOf(p.id) === -1;
          }).slice(0, 4);

          if (products.length === 0) return;

          var html = '';
          products.forEach(function(p) {
            var img = p.featured_image || (p.images && p.images[0]) || '';
            var price = (parseFloat(p.price) / 100).toFixed(2);
            var vid = p.variants && p.variants[0] ? p.variants[0].id : '';
            html += '<div class="cart-upsell-card">';
            html += '<a href="' + p.url + '"><img class="cart-upsell-img" src="' + img + '" alt="' + p.title.replace(/"/g, '&quot;') + '" loading="lazy"></a>';
            html += '<div class="cart-upsell-info">';
            html += '<div class="cart-upsell-name">' + p.title + '</div>';
            html += '<div class="cart-upsell-price">$' + price + '</div>';
            html += '</div>';
            html += '<button class="cart-upsell-add" data-vid="' + vid + '" onclick="window._cartUpsellAdd(this)">Add to Cart</button>';
            html += '</div>';
          });

          grid.innerHTML = html;
          wrap.style.display = 'block';
        });
    })
    .catch(function() {});

  window._cartUpsellAdd = function(btn) {
    var vid = btn.getAttribute('data-vid');
    if (!vid) return;
    btn.disabled = true;
    btn.textContent = 'Adding...';
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: parseInt(vid), quantity: 1 }] })
    })
    .then(function(r) { return r.json(); })
    .then(function() {
      btn.textContent = 'Added ✓';
      document.dispatchEvent(new CustomEvent('cart:updated'));
      setTimeout(function() { location.reload(); }, 1500);
    })
    .catch(function() { btn.disabled = false; btn.textContent = 'Add to Cart'; });
  };
})();
</script>
{% endif %}`;
}

// ─── 10. Legal Pages ─────────────────────────────────────────

function buildPrivacyPolicyHtml(d: StoreV2Data): string {
  return `<h1>Privacy Policy</h1>
<p><em>Last updated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</em></p>

<p>${d.name} ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.</p>

<h2>Information We Collect</h2>
<p>We collect information you provide directly to us, such as when you create an account, make a purchase, subscribe to our newsletter, or contact us. This may include:</p>
<ul>
<li>Name and email address</li>
<li>Billing and shipping address</li>
<li>Payment information (processed securely by Shopify Payments)</li>
<li>Phone number (optional)</li>
<li>Order history and preferences</li>
</ul>

<h2>How We Use Your Information</h2>
<ul>
<li>To process and fulfill your orders</li>
<li>To send order confirmations and shipping updates</li>
<li>To respond to your inquiries and provide customer support</li>
<li>To send marketing communications (with your consent)</li>
<li>To improve our website and product offerings</li>
<li>To comply with legal obligations</li>
</ul>

<h2>Cookies & Tracking</h2>
<p>We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings.</p>

<h2>Third-Party Services</h2>
<p>We may share your information with third-party service providers who assist us in operating our website, processing payments, and delivering orders. These include Shopify, payment processors, and shipping carriers.</p>

<h2>Data Retention</h2>
<p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.</p>

<h2>Your Rights (GDPR/CCPA)</h2>
<p>You have the right to:</p>
<ul>
<li>Access the personal data we hold about you</li>
<li>Request correction or deletion of your data</li>
<li>Opt out of marketing communications at any time</li>
<li>Request a copy of your data in a portable format</li>
<li>Lodge a complaint with a supervisory authority</li>
</ul>

<h2>Contact Us</h2>
<p>For privacy-related inquiries, contact us at <a href="mailto:${d.privacyEmail}">${d.privacyEmail}</a>.</p>`;
}

function buildTermsOfServiceHtml(d: StoreV2Data): string {
  return `<h1>Terms of Service</h1>
<p><em>Last updated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</em></p>

<p>Welcome to ${d.name}. By accessing or using our website, you agree to be bound by these Terms of Service. Please read them carefully.</p>

<h2>General Conditions</h2>
<p>We reserve the right to refuse service to anyone for any reason at any time. You agree not to reproduce, duplicate, copy, sell, or exploit any portion of the service without our express written permission.</p>

<h2>Products & Pricing</h2>
<ul>
<li>All prices are listed in USD and are subject to change without notice.</li>
<li>We reserve the right to limit quantities of any products.</li>
<li>Product images are for illustration purposes; actual products may vary slightly.</li>
<li>We do not guarantee that the quality of any products will meet your expectations.</li>
</ul>

<h2>Orders & Payment</h2>
<p>By placing an order, you represent that the information you provide is accurate and that you are authorized to use the payment method. We reserve the right to cancel any order for any reason, including suspected fraud.</p>

<h2>Shipping & Delivery</h2>
<ul>
<li>Free shipping on orders over ${d.freeShipThreshold} (domestic U.S. orders)</li>
<li>Standard processing time is 1-3 business days</li>
<li>Delivery times are estimates and are not guaranteed</li>
<li>We are not responsible for delays caused by shipping carriers</li>
</ul>

<h2>Returns & Refunds</h2>
<p>We offer a 30-day return policy. Items must be unused and in original packaging. Please see our Refund Policy for complete details.</p>

<h2>Intellectual Property</h2>
<p>All content on this website, including text, graphics, logos, and images, is the property of ${d.name} and is protected by applicable intellectual property laws.</p>

<h2>Limitation of Liability</h2>
<p>${d.name} shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services or products.</p>

<h2>Changes to Terms</h2>
<p>We reserve the right to update these terms at any time. Changes take effect immediately upon posting. Continued use of the site constitutes acceptance of the revised terms.</p>

<h2>Contact Us</h2>
<p>Questions about these Terms? Contact us at <a href="mailto:${d.privacyEmail}">${d.privacyEmail}</a>.</p>`;
}

function buildRefundPolicyHtml(d: StoreV2Data): string {
  return `<h1>Refund Policy</h1>
<p><em>Last updated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</em></p>

<p>At ${d.name}, your satisfaction is our priority. If you're not completely happy with your purchase, we're here to help.</p>

<h2>30-Day Return Window</h2>
<p>You have 30 days from the date of delivery to initiate a return. Items must be:</p>
<ul>
<li>Unused and in the same condition you received them</li>
<li>In the original packaging with all tags attached</li>
<li>Accompanied by your order confirmation or receipt</li>
</ul>

<h2>Non-Returnable Items</h2>
<ul>
<li>Gift cards</li>
<li>Items marked as "Final Sale"</li>
<li>Personal care items that have been opened or used (for hygiene reasons)</li>
</ul>

<h2>How to Initiate a Return</h2>
<ol>
<li>Email us at <a href="mailto:${d.privacyEmail}">${d.privacyEmail}</a> with your order number and reason for return</li>
<li>We'll provide you with a return shipping label and instructions</li>
<li>Ship the item(s) back to us within 7 days of receiving the label</li>
</ol>

<h2>Refund Process</h2>
<ul>
<li>Refunds are processed within 5-7 business days of receiving your return</li>
<li>The refund will be credited to your original payment method</li>
<li>Original shipping costs are non-refundable (unless the return is due to our error)</li>
</ul>

<h2>Exchanges</h2>
<p>We currently do not offer direct exchanges. To get a different item, please return the original and place a new order.</p>

<h2>Damaged or Defective Items</h2>
<p>If you receive a damaged or defective item, contact us within 48 hours of delivery with photos of the damage. We'll send a free replacement or issue a full refund.</p>

<h2>Contact Us</h2>
<p>For return or refund questions, reach us at <a href="mailto:${d.privacyEmail}">${d.privacyEmail}</a>.</p>`;
}

// ─── 11. Cookie Consent Banner ──────────────────────────────

function buildCookieConsentSnippet(d: StoreV2Data): string {
  return `{% comment %}
  Cookie Consent Banner — auto-generated by shopify-enhance-v2
{% endcomment %}

<style>
  .cookie-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #1a1a1a;
    color: #eee;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
    z-index: 99999;
    font-size: 14px;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
    transform: translateY(100%);
    transition: transform 0.4s ease;
  }
  .cookie-banner.cookie-show { transform: translateY(0); }
  .cookie-banner-text { max-width: 600px; line-height: 1.5; }
  .cookie-banner-text a { color: ${d.accentColor === "#1a1a1a" ? "#aaa" : d.accentColor}; text-decoration: underline; }
  .cookie-banner-actions { display: flex; gap: 10px; flex-shrink: 0; }
  .cookie-accept {
    padding: 10px 24px;
    background: ${d.accentColor === "#1a1a1a" ? "#fff" : d.accentColor};
    color: ${d.accentColor === "#1a1a1a" ? "#1a1a1a" : d.textOnAccent};
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .cookie-accept:hover { opacity: 0.9; }
  .cookie-decline {
    padding: 10px 24px;
    background: transparent;
    color: #aaa;
    border: 1px solid #555;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .cookie-decline:hover { color: #fff; border-color: #999; }
  @media (max-width: 600px) {
    .cookie-banner { flex-direction: column; text-align: center; padding: 20px 16px; }
    .cookie-banner-actions { width: 100%; justify-content: center; }
  }
</style>

<div class="cookie-banner" id="cookie-consent-banner">
  <div class="cookie-banner-text">
    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept," you consent to our use of cookies. <a href="/pages/privacy-policy">Learn more</a>
  </div>
  <div class="cookie-banner-actions">
    <button class="cookie-accept" id="cookie-accept">Accept</button>
    <button class="cookie-decline" id="cookie-decline">Decline</button>
  </div>
</div>

<script>
(function() {
  if (localStorage.getItem('cookie_consent') !== null) return;

  var banner = document.getElementById('cookie-consent-banner');
  if (!banner) return;

  // Show after a short delay
  setTimeout(function() {
    banner.classList.add('cookie-show');
  }, 1500);

  document.getElementById('cookie-accept').addEventListener('click', function() {
    localStorage.setItem('cookie_consent', 'accepted');
    banner.classList.remove('cookie-show');
  });

  document.getElementById('cookie-decline').addEventListener('click', function() {
    localStorage.setItem('cookie_consent', 'declined');
    banner.classList.remove('cookie-show');
  });
})();
</script>`;
}

// ─── 12. Loyalty/Rewards Teaser ─────────────────────────────

function buildLoyaltyTeaserLiquid(d: StoreV2Data): string {
  return `
<style>
  .loyalty-section {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 20px;
    text-align: center;
  }
  .loyalty-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: ${d.accentColorLight};
    color: ${d.accentColor};
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 16px;
  }
  .loyalty-heading { font-size: 28px; font-weight: 700; color: #111; margin-bottom: 8px; }
  .loyalty-sub { font-size: 15px; color: #666; margin-bottom: 32px; max-width: 500px; margin-left: auto; margin-right: auto; line-height: 1.5; }
  .loyalty-tiers {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  .loyalty-tier {
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 14px;
    padding: 24px 20px;
    min-width: 180px;
    flex: 1;
    max-width: 240px;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .loyalty-tier:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
  .loyalty-tier-icon { font-size: 32px; margin-bottom: 12px; }
  .loyalty-tier-name { font-size: 16px; font-weight: 700; color: #111; margin-bottom: 4px; }
  .loyalty-tier-desc { font-size: 13px; color: #666; line-height: 1.4; }
  .loyalty-tier-pts { font-size: 12px; color: ${d.accentColor}; font-weight: 600; margin-top: 8px; }
  .loyalty-cta {
    display: inline-block;
    margin-top: 28px;
    padding: 14px 36px;
    background: ${d.accentColor};
    color: ${d.textOnAccent};
    text-decoration: none;
    border-radius: 30px;
    font-weight: 600;
    font-size: 15px;
    transition: opacity 0.2s;
  }
  .loyalty-cta:hover { opacity: 0.9; }
  @media (max-width: 600px) {
    .loyalty-tier { min-width: 140px; padding: 18px 14px; }
    .loyalty-heading { font-size: 22px; }
  }
</style>
<div class="loyalty-section">
  <div class="loyalty-badge">✨ New</div>
  <div class="loyalty-heading">Earn Points on Every Purchase</div>
  <div class="loyalty-sub">Join the ${d.name} Rewards program and unlock exclusive perks, early access to new drops, and special discounts.</div>
  <div class="loyalty-tiers">
    <div class="loyalty-tier">
      <div class="loyalty-tier-icon">🌱</div>
      <div class="loyalty-tier-name">Starter</div>
      <div class="loyalty-tier-desc">1 point per $1 spent. Unlock birthday rewards.</div>
      <div class="loyalty-tier-pts">0 - 199 pts</div>
    </div>
    <div class="loyalty-tier">
      <div class="loyalty-tier-icon">⭐</div>
      <div class="loyalty-tier-name">Silver</div>
      <div class="loyalty-tier-desc">1.5x points. Early access to sales + free shipping.</div>
      <div class="loyalty-tier-pts">200 - 499 pts</div>
    </div>
    <div class="loyalty-tier">
      <div class="loyalty-tier-icon">👑</div>
      <div class="loyalty-tier-name">Gold</div>
      <div class="loyalty-tier-desc">2x points. Exclusive drops + VIP support.</div>
      <div class="loyalty-tier-pts">500+ pts</div>
    </div>
  </div>
  <a class="loyalty-cta" href="/pages/about">Start Earning →</a>
</div>`.trim();
}

// ─── 13. Updated Exit-Intent Popup ───────────────────────────

function buildUpdatedExitIntentSnippet(d: StoreV2Data): string {
  return `{% comment %}
  Exit-Intent Popup (V2 — 15% off) — auto-generated by shopify-enhance-v2
{% endcomment %}

<style>
  .exit-popup-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 100000;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .exit-popup-overlay.active {
    display: flex;
  }
  .exit-popup {
    background: #fff;
    border-radius: 16px;
    max-width: 440px;
    width: 100%;
    padding: 40px 32px;
    text-align: center;
    position: relative;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: exit-popup-in 0.3s ease-out;
  }
  @keyframes exit-popup-in {
    from { opacity: 0; transform: scale(0.9) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  .exit-popup-close {
    position: absolute;
    top: 12px;
    right: 16px;
    background: none;
    border: none;
    font-size: 24px;
    color: #999;
    cursor: pointer;
    padding: 4px 8px;
    line-height: 1;
  }
  .exit-popup-close:hover { color: #333; }
  .exit-popup-emoji { font-size: 40px; margin-bottom: 16px; }
  .exit-popup h2 {
    font-size: 24px;
    margin: 0 0 8px;
    color: #111;
  }
  .exit-popup p {
    font-size: 15px;
    color: #555;
    margin: 0 0 24px;
    line-height: 1.5;
  }
  .exit-popup-form {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  .exit-popup-input {
    flex: 1;
    padding: 14px 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
  }
  .exit-popup-input:focus { border-color: ${d.accentColor}; }
  .exit-popup-btn {
    background: ${d.accentColor};
    color: ${d.textOnAccent};
    border: none;
    border-radius: 8px;
    padding: 14px 20px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.2s;
  }
  .exit-popup-btn:hover { opacity: 0.9; }
  .exit-popup-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .exit-popup-code {
    display: inline-block;
    background: ${d.accentColorLight};
    padding: 8px 20px;
    border-radius: 6px;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 2px;
    color: ${d.accentColor};
    margin-top: 4px;
  }
  .exit-popup-skip {
    font-size: 12px;
    color: #999;
    background: none;
    border: none;
    cursor: pointer;
    margin-top: 8px;
    text-decoration: underline;
  }
  .exit-popup-success { display: none; }
  .exit-popup-success.show { display: block; }
  .exit-popup-form-wrap.hidden { display: none; }
  @media (max-width: 480px) {
    .exit-popup { padding: 32px 20px; }
    .exit-popup-form { flex-direction: column; }
  }
</style>

<div class="exit-popup-overlay" id="exit-popup-overlay">
  <div class="exit-popup">
    <button class="exit-popup-close" id="exit-popup-close" aria-label="Close">&times;</button>
    <div class="exit-popup-emoji">🎁</div>
    <h2>Wait! Get ${d.discountPercent}% Off</h2>
    <p>Don't leave empty-handed. Enter your email and get an exclusive ${d.discountPercent}% discount on your first order.</p>

    <div class="exit-popup-form-wrap" id="exit-popup-form-wrap">
      <div class="exit-popup-form" id="exit-popup-form">
        <input type="email" class="exit-popup-input" id="exit-popup-email" placeholder="Enter your email" required>
        <button class="exit-popup-btn" id="exit-popup-btn">Get ${d.discountPercent}% Off</button>
      </div>
      <button class="exit-popup-skip" id="exit-popup-skip">No thanks, I'll pay full price</button>
    </div>

    <div class="exit-popup-success" id="exit-popup-success">
      <p style="font-weight:600;color:#111;margin-bottom:16px">Your discount code:</p>
      <div class="exit-popup-code">${d.discountCode}</div>
      <p style="font-size:13px;color:#666;margin-top:16px">Apply at checkout for ${d.discountPercent}% off your order</p>
    </div>
  </div>
</div>

<script>
(function() {
  if (sessionStorage.getItem('exit_popup_shown')) return;
  if (localStorage.getItem('exit_popup_converted')) return;

  var overlay = document.getElementById('exit-popup-overlay');
  var closeBtn = document.getElementById('exit-popup-close');
  var skipBtn = document.getElementById('exit-popup-skip');
  var submitBtn = document.getElementById('exit-popup-btn');
  var emailInput = document.getElementById('exit-popup-email');
  var formWrap = document.getElementById('exit-popup-form-wrap');
  var successDiv = document.getElementById('exit-popup-success');

  if (!overlay) return;

  function showPopup() {
    if (sessionStorage.getItem('exit_popup_shown')) return;
    sessionStorage.setItem('exit_popup_shown', '1');
    overlay.classList.add('active');
  }

  function hidePopup() {
    overlay.classList.remove('active');
  }

  // Desktop: mouseout from top of viewport
  document.addEventListener('mouseout', function(e) {
    if (e.clientY <= 0) {
      showPopup();
    }
  });

  // Mobile: 30s timeout
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    setTimeout(showPopup, 30000);
  }

  closeBtn.addEventListener('click', hidePopup);
  skipBtn.addEventListener('click', hidePopup);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) hidePopup();
  });

  // Submit handler
  submitBtn.addEventListener('click', function() {
    var email = emailInput.value.trim();
    if (!email || email.indexOf('@') === -1) {
      emailInput.style.borderColor = 'red';
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    fetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'form_type=customer&utf8=✓&customer[email]=' + encodeURIComponent(email) + '&customer[tags]=exit-intent,discount-${d.discountPercent}'
    })
    .then(function() {
      formWrap.classList.add('hidden');
      successDiv.classList.add('show');
      localStorage.setItem('exit_popup_converted', '1');
    })
    .catch(function() {
      formWrap.classList.add('hidden');
      successDiv.classList.add('show');
      localStorage.setItem('exit_popup_converted', '1');
    });
  });
})();
</script>`;
}

// ─── Shared Helpers ──────────────────────────────────────────

const themeLayoutCache = new Map<string, string>();

interface InjectOptions {
  tag: string;
  after?: string;
  before?: string;
  label: string;
}

async function injectIntoThemeLayout(
  cfg: ShopifyStoreConfig,
  themeId: number,
  opts: InjectOptions,
) {
  const cacheKey = `${cfg.slug}:${themeId}`;

  let layout = themeLayoutCache.get(cacheKey);
  if (!layout) {
    const raw = await getThemeAsset(cfg.store, cfg.token, themeId, "layout/theme.liquid");
    if (!raw) {
      console.log("    ❌ Could not read layout/theme.liquid");
      return;
    }
    layout = raw;
  }

  // Idempotent
  if (layout.includes(opts.tag)) {
    console.log(`    ⊘ ${opts.label} render tag already in theme.liquid — skipping`);
    themeLayoutCache.set(cacheKey, layout);
    return;
  }

  let modified = layout;
  if (opts.after) {
    const idx = modified.indexOf(opts.after);
    if (idx >= 0) {
      const tagClose = modified.indexOf(">", idx);
      if (tagClose >= 0) {
        const insertPoint = tagClose + 1;
        modified = modified.slice(0, insertPoint) + "\n  " + opts.tag + modified.slice(insertPoint);
      }
    } else {
      console.log(`    ⚠ Could not find "${opts.after}" in theme.liquid — skipping ${opts.label} injection`);
      themeLayoutCache.set(cacheKey, layout);
      return;
    }
  } else if (opts.before) {
    const idx = modified.indexOf(opts.before);
    if (idx >= 0) {
      modified = modified.slice(0, idx) + "  " + opts.tag + "\n" + modified.slice(idx);
    } else {
      console.log(`    ⚠ Could not find "${opts.before}" in theme.liquid — skipping ${opts.label} injection`);
      themeLayoutCache.set(cacheKey, layout);
      return;
    }
  }

  const ok = await putThemeAsset(cfg.store, cfg.token, themeId, "layout/theme.liquid", modified);
  if (ok) {
    console.log(`    ✓ Injected ${opts.label} render tag into theme.liquid`);
    themeLayoutCache.set(cacheKey, modified);
  } else {
    console.log(`    ❌ Failed to write theme.liquid for ${opts.label}`);
    themeLayoutCache.set(cacheKey, layout);
  }
}

interface AddSectionOptions {
  sectionKey: string;
  section: any;
  afterSection?: string;
  beforeSection?: string;
  fallbackPosition: number;
  label: string;
}

async function addSectionToTemplate(
  cfg: ShopifyStoreConfig,
  themeId: number,
  templateKey: string,
  opts: AddSectionOptions,
) {
  const raw = await getThemeAsset(cfg.store, cfg.token, themeId, templateKey);

  let template: any;
  if (raw) {
    try {
      template = JSON.parse(raw);
    } catch {
      template = null;
    }
  }

  if (!template) {
    console.log(`    ⚠ Could not read ${templateKey} — creating minimal template`);
    template = {
      sections: { main: { type: "main-collection", settings: {} } },
      order: ["main"],
    };
  }

  // Idempotent check
  if (template.sections[opts.sectionKey]) {
    console.log(`    ⊘ ${opts.sectionKey} already exists in ${templateKey} (${opts.label}) — skipping`);
    return;
  }

  template.sections[opts.sectionKey] = opts.section;

  const order: string[] = template.order || Object.keys(template.sections);
  if (!order.includes(opts.sectionKey)) {
    let inserted = false;

    if (opts.afterSection) {
      const idx = order.indexOf(opts.afterSection);
      if (idx >= 0) {
        order.splice(idx + 1, 0, opts.sectionKey);
        inserted = true;
      }
    }

    if (!inserted && opts.beforeSection) {
      const idx = order.indexOf(opts.beforeSection);
      if (idx >= 0) {
        order.splice(idx, 0, opts.sectionKey);
        inserted = true;
      }
    }

    if (!inserted) {
      if (opts.fallbackPosition < 0) {
        order.splice(Math.max(0, order.length + opts.fallbackPosition + 1), 0, opts.sectionKey);
      } else {
        order.splice(Math.min(opts.fallbackPosition, order.length), 0, opts.sectionKey);
      }
    }

    template.order = order;
  }

  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    templateKey,
    JSON.stringify(template, null, 2),
  );
  console.log(ok
    ? `    ✓ Added ${opts.sectionKey} to ${templateKey} (${opts.label})`
    : `    ❌ Failed to update ${templateKey} (${opts.label})`);
}

// ─── Step Functions ──────────────────────────────────────────

async function step1_testimonialsCarousel(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  💬 Step 1: Testimonials Carousel...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const testimonials = STORE_TESTIMONIALS[cfg.slug] || STORE_TESTIMONIALS.glowhaven;
  const liquid = buildTestimonialsCarouselLiquid(d, testimonials);

  await addSectionToTemplate(cfg, themeId, "templates/index.json", {
    sectionKey: "testimonials_carousel",
    section: {
      type: "custom-liquid",
      settings: {
        custom_liquid: liquid,
        color_scheme: "scheme-1",
        section_width: "full-width",
        "padding-block-start": 0,
        "padding-block-end": 0,
      },
    },
    afterSection: "social_proof_stats",
    fallbackPosition: -3,
    label: "homepage",
  });
}

async function step2_instagramGrid(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  📸 Step 2: Instagram Feed Grid...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const liquid = buildInstagramGridLiquid(d);

  await addSectionToTemplate(cfg, themeId, "templates/index.json", {
    sectionKey: "instagram_grid",
    section: {
      type: "custom-liquid",
      settings: {
        custom_liquid: liquid,
        color_scheme: "scheme-1",
        section_width: "full-width",
        "padding-block-start": 0,
        "padding-block-end": 0,
      },
    },
    beforeSection: "newsletter",
    fallbackPosition: -2,
    label: "homepage",
  });
}

async function step3_completeRoutine(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  🛍 Step 3: Complete Your Routine Upsell...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const liquid = buildCompleteRoutineLiquid(d);

  await addSectionToTemplate(cfg, themeId, "templates/product.json", {
    sectionKey: "complete_routine",
    section: {
      type: "custom-liquid",
      settings: {
        custom_liquid: liquid,
        color_scheme: "scheme-1",
        section_width: "page-width",
        "padding-block-start": 0,
        "padding-block-end": 20,
      },
    },
    afterSection: "product_recommendations",
    fallbackPosition: -1,
    label: "product page",
  });
}

async function step4_urgencyTimer(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  ⏰ Step 4: Urgency Countdown Timer...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const snippet = buildUrgencyTimerSnippet(d);
  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "snippets/urgency-timer.liquid",
    snippet,
  );
  console.log(ok ? "    ✓ Uploaded snippets/urgency-timer.liquid" : "    ❌ Failed to upload snippet");

  await injectIntoThemeLayout(cfg, themeId, {
    tag: "{% render 'urgency-timer' %}",
    before: "</body>",
    label: "urgency-timer",
  });
}

async function step5_imageZoom(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  🔍 Step 5: Product Image Zoom...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const snippet = buildImageZoomSnippet(d);
  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "snippets/image-zoom.liquid",
    snippet,
  );
  console.log(ok ? "    ✓ Uploaded snippets/image-zoom.liquid" : "    ❌ Failed to upload snippet");

  await injectIntoThemeLayout(cfg, themeId, {
    tag: "{% render 'image-zoom' %}",
    before: "</body>",
    label: "image-zoom",
  });
}

async function step6_breadcrumbs(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  🔗 Step 6: Breadcrumbs...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const snippet = buildBreadcrumbsSnippet(d);
  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "snippets/breadcrumbs.liquid",
    snippet,
  );
  console.log(ok ? "    ✓ Uploaded snippets/breadcrumbs.liquid" : "    ❌ Failed to upload snippet");

  await injectIntoThemeLayout(cfg, themeId, {
    tag: "{% render 'breadcrumbs' %}",
    after: "<body",
    label: "breadcrumbs",
  });
}

async function step7_quickAddCollection(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  ⚡ Step 7: Quick Add to Cart (Collection)...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const snippet = buildQuickAddCollectionSnippet(d);
  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "snippets/quick-add-collection.liquid",
    snippet,
  );
  console.log(ok ? "    ✓ Uploaded snippets/quick-add-collection.liquid" : "    ❌ Failed to upload snippet");

  await injectIntoThemeLayout(cfg, themeId, {
    tag: "{% render 'quick-add-collection' %}",
    before: "</body>",
    label: "quick-add-collection",
  });
}

async function step8_shippingProgressBar(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  🚚 Step 8: Free Shipping Progress Bar...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const snippet = buildShippingProgressSnippet(d);
  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "snippets/shipping-progress.liquid",
    snippet,
  );
  console.log(ok ? "    ✓ Uploaded snippets/shipping-progress.liquid" : "    ❌ Failed to upload snippet");

  await injectIntoThemeLayout(cfg, themeId, {
    tag: "{% render 'shipping-progress' %}",
    after: "<body",
    label: "shipping-progress",
  });
}

async function step9_cartUpsell(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  🎯 Step 9: Cart Upsell Recommendations...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const snippet = buildCartUpsellSnippet(d);
  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "snippets/cart-upsell.liquid",
    snippet,
  );
  console.log(ok ? "    ✓ Uploaded snippets/cart-upsell.liquid" : "    ❌ Failed to upload snippet");

  await injectIntoThemeLayout(cfg, themeId, {
    tag: "{% render 'cart-upsell' %}",
    before: "</body>",
    label: "cart-upsell",
  });
}

async function step10_legalPages(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  📄 Step 10: Legal Pages (Privacy, Terms, Refund)...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const pages = [
    { title: "Privacy Policy", handle: "privacy-policy", body: buildPrivacyPolicyHtml(d) },
    { title: "Terms of Service", handle: "terms-of-service", body: buildTermsOfServiceHtml(d) },
    { title: "Refund Policy", handle: "refund-policy", body: buildRefundPolicyHtml(d) },
  ];

  // Get existing pages
  const { data: pagesData } = await shopifyFetch(
    cfg.store, cfg.token, "GET",
    "pages.json?limit=250&fields=id,title,handle",
  );
  const existingHandles = new Set(
    (pagesData?.pages || []).map((p: any) => p.handle),
  );

  for (const page of pages) {
    if (existingHandles.has(page.handle)) {
      console.log(`    ⊘ Page "${page.title}" already exists — skipping`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`    [DRY-RUN] Would create page: ${page.title}`);
      continue;
    }

    const { status } = await shopifyFetch(
      cfg.store, cfg.token, "POST", "pages.json",
      {
        page: {
          title: page.title,
          handle: page.handle,
          body_html: page.body,
          published: true,
        },
      },
    );

    console.log(
      status === 201
        ? `    ✓ Created page: ${page.title}`
        : `    ❌ Failed to create page: ${page.title}`,
    );
  }
}

async function step11_cookieConsent(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  🍪 Step 11: Cookie Consent Banner...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const snippet = buildCookieConsentSnippet(d);
  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "snippets/cookie-consent.liquid",
    snippet,
  );
  console.log(ok ? "    ✓ Uploaded snippets/cookie-consent.liquid" : "    ❌ Failed to upload snippet");

  await injectIntoThemeLayout(cfg, themeId, {
    tag: "{% render 'cookie-consent' %}",
    before: "</body>",
    label: "cookie-consent",
  });
}

async function step12_loyaltyTeaser(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  🏅 Step 12: Loyalty/Rewards Teaser...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const liquid = buildLoyaltyTeaserLiquid(d);

  await addSectionToTemplate(cfg, themeId, "templates/index.json", {
    sectionKey: "loyalty_teaser",
    section: {
      type: "custom-liquid",
      settings: {
        custom_liquid: liquid,
        color_scheme: "scheme-4",
        section_width: "full-width",
        "padding-block-start": 0,
        "padding-block-end": 0,
      },
    },
    afterSection: "testimonials_carousel",
    fallbackPosition: -3,
    label: "homepage",
  });
}

async function step13_discountCodes(cfg: ShopifyStoreConfig) {
  console.log("\n  🎟 Step 13: 15% Discount Codes...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  // Check existing price rules
  const { data: prData } = await shopifyFetch(
    cfg.store, cfg.token, "GET", "price_rules.json?limit=250",
  );
  const existingRules: any[] = prData?.price_rules || [];
  const existingTitles = new Set(existingRules.map((r: any) => r.title));

  if (existingTitles.has(d.discountCode)) {
    console.log(`    ⊘ Discount code "${d.discountCode}" already exists — skipping`);
    return;
  }

  if (DRY_RUN) {
    console.log(`    [DRY-RUN] Would create discount: ${d.discountCode} → ${d.discountPercent}% off`);
    return;
  }

  // Create price rule
  const { data: newPrData, status: prStatus } = await shopifyFetch(
    cfg.store, cfg.token, "POST", "price_rules.json",
    {
      price_rule: {
        title: d.discountCode,
        target_type: "line_item",
        target_selection: "all",
        allocation_method: "across",
        value_type: "percentage",
        value: `-${d.discountPercent}.0`,
        customer_selection: "all",
        starts_at: new Date().toISOString(),
        usage_limit: null,
        once_per_customer: true,
      },
    },
  );

  if (prStatus !== 201 && prStatus !== 200) {
    console.log(`    ❌ Failed to create price rule for ${d.discountCode}`);
    return;
  }

  const priceRuleId = newPrData.price_rule.id;

  // Create discount code
  const { status: dcStatus } = await shopifyFetch(
    cfg.store, cfg.token, "POST",
    `price_rules/${priceRuleId}/discount_codes.json`,
    { discount_code: { code: d.discountCode } },
  );

  if (dcStatus === 201) {
    console.log(`    ✓ Created discount: ${d.discountCode} → ${d.discountPercent}% off all products, once per customer`);
  } else {
    console.log(`    ❌ Failed to create discount code: ${d.discountCode}`);
  }
}

async function step14_updateExitIntent(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  🚪 Step 14: Update Exit-Intent Popup (15% code)...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const snippet = buildUpdatedExitIntentSnippet(d);
  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "snippets/exit-intent-popup.liquid",
    snippet,
  );
  console.log(ok
    ? `    ✓ Updated exit-intent popup → now shows ${d.discountCode} (${d.discountPercent}% off)`
    : "    ❌ Failed to update exit-intent popup");
}

// ─── Main ────────────────────────────────────────────────────

async function processStore(cfg: ShopifyStoreConfig) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ✨ Enhance V2: ${cfg.slug.toUpperCase()} → ${cfg.store}`);
  console.log(`${"═".repeat(60)}`);

  // Get active theme
  console.log("\n  🎨 Finding active theme...");
  const themeId = await getActiveThemeId(cfg.store, cfg.token);
  if (!themeId) {
    console.log("    ⚠ Skipping store — no active theme");
    return;
  }

  // Clear theme layout cache for this store
  themeLayoutCache.delete(`${cfg.slug}:${themeId}`);

  const steps = [
    { fn: () => step1_testimonialsCarousel(cfg, themeId), label: "Step 1 (Testimonials)" },
    { fn: () => step2_instagramGrid(cfg, themeId), label: "Step 2 (Instagram Grid)" },
    { fn: () => step3_completeRoutine(cfg, themeId), label: "Step 3 (Complete Routine)" },
    { fn: () => step4_urgencyTimer(cfg, themeId), label: "Step 4 (Urgency Timer)" },
    { fn: () => step5_imageZoom(cfg, themeId), label: "Step 5 (Image Zoom)" },
    { fn: () => step6_breadcrumbs(cfg, themeId), label: "Step 6 (Breadcrumbs)" },
    { fn: () => step7_quickAddCollection(cfg, themeId), label: "Step 7 (Quick Add)" },
    { fn: () => step8_shippingProgressBar(cfg, themeId), label: "Step 8 (Shipping Bar)" },
    { fn: () => step9_cartUpsell(cfg, themeId), label: "Step 9 (Cart Upsell)" },
    { fn: () => step10_legalPages(cfg, themeId), label: "Step 10 (Legal Pages)" },
    { fn: () => step11_cookieConsent(cfg, themeId), label: "Step 11 (Cookie Consent)" },
    { fn: () => step12_loyaltyTeaser(cfg, themeId), label: "Step 12 (Loyalty Teaser)" },
    { fn: () => step13_discountCodes(cfg), label: "Step 13 (Discount Codes)" },
    { fn: () => step14_updateExitIntent(cfg, themeId), label: "Step 14 (Exit-Intent)" },
  ];

  for (const step of steps) {
    try {
      await step.fn();
    } catch (e: any) {
      console.error(`    ❌ ${step.label} failed: ${e.message}`);
    }
  }

  console.log(`\n  ✅ ${cfg.slug.toUpperCase()} V2 enhancement complete`);
}

async function main() {
  console.log("✨ Shopify Enhance V2 Script");
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}`);
  console.log(`   API version: ${API_VERSION}\n`);

  const configs = getStoreConfigs();

  if (configs.length === 0) {
    console.error("❌ No Shopify store credentials found in environment.");
    console.error("   Set SHOPIFY_GLOWHAVEN_STORE, SHOPIFY_GLOWHAVEN_TOKEN, etc.");
    console.error("   Required scopes: read_products, write_products, read_themes, write_themes,");
    console.error("                    read_content, write_content, read_price_rules, write_price_rules,");
    console.error("                    read_discounts, write_discounts");
    process.exit(1);
  }

  console.log(`   Stores: ${configs.map((c) => c.slug.toUpperCase()).join(", ")}`);
  console.log(`   14 Enhancement Steps:`);
  console.log(`    1. Testimonials carousel       8. Free shipping progress bar`);
  console.log(`    2. Instagram feed grid          9. Cart upsell recommendations`);
  console.log(`    3. Complete your routine       10. Legal pages (Privacy/Terms/Refund)`);
  console.log(`    4. Urgency countdown timer     11. Cookie consent banner`);
  console.log(`    5. Product image zoom          12. Loyalty/rewards teaser`);
  console.log(`    6. Breadcrumbs + Schema.org    13. 15% discount codes`);
  console.log(`    7. Quick add to cart           14. Update exit-intent popup\n`);

  for (const cfg of configs) {
    await processStore(cfg);
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log("✅ All stores enhanced with V2!");
  console.log(`${"═".repeat(60)}\n`);

  console.log("📋 VERIFICATION CHECKLIST:");
  console.log("   □ Homepage: testimonials carousel after social proof stats");
  console.log("   □ Homepage: Instagram grid before newsletter");
  console.log("   □ Homepage: loyalty/rewards teaser section");
  console.log("   □ Product page: 'Complete Your Routine' upsell section");
  console.log("   □ Product page: urgency countdown timer (resets at 6 PM)");
  console.log("   □ Product page: hover-to-zoom on product images");
  console.log("   □ Product + collection pages: breadcrumbs with Schema.org JSON-LD");
  console.log("   □ Collection page: Quick Add buttons on product cards");
  console.log("   □ All pages: free shipping progress bar below header");
  console.log("   □ Cart page: 'You Might Also Like' upsell recommendations");
  console.log("   □ Footer: links to Privacy Policy, Terms, Refund Policy");
  console.log("   □ Cookie consent banner on first visit (bottom of page)");
  console.log("   □ Exit-intent popup shows store-specific 15% code");
  console.log("   □ Discount codes: GLOW15, AURAE15, NEST15 work at checkout");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  });
