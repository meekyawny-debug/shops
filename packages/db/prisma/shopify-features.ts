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

// ─── Theme layout cache (shared across steps) ───────────────

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
    console.log(`    ⊘ ${opts.label} already in theme.liquid — skipping`);
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
      console.log(`    ⚠ Could not find "${opts.after}" in theme.liquid — skipping ${opts.label}`);
      themeLayoutCache.set(cacheKey, layout);
      return;
    }
  } else if (opts.before) {
    const idx = modified.indexOf(opts.before);
    if (idx >= 0) {
      modified = modified.slice(0, idx) + "  " + opts.tag + "\n" + modified.slice(idx);
    } else {
      console.log(`    ⚠ Could not find "${opts.before}" in theme.liquid — skipping ${opts.label}`);
      themeLayoutCache.set(cacheKey, layout);
      return;
    }
  }

  const ok = await putThemeAsset(cfg.store, cfg.token, themeId, "layout/theme.liquid", modified);
  if (ok) {
    console.log(`    ✓ Injected ${opts.label} into theme.liquid`);
    themeLayoutCache.set(cacheKey, modified);
  } else {
    console.log(`    ❌ Failed to write theme.liquid for ${opts.label}`);
    themeLayoutCache.set(cacheKey, layout);
  }
}

// ─── Template section helper ─────────────────────────────────

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

  // Add section
  template.sections[opts.sectionKey] = opts.section;

  // Insert into order
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

// ─── Per-store data ──────────────────────────────────────────

interface StoreFeatureData {
  name: string;
  freeShipThreshold: string;
  freeShipAmount: number;
  accentColor: string;
  accentColorLight: string;
  textOnAccent: string;
  pressNames: string[];
  email: string;
}

const STORE_DATA: Record<string, StoreFeatureData> = {
  glowhaven: {
    name: "Glowhaven",
    freeShipThreshold: "$40+",
    freeShipAmount: 40,
    accentColor: "#e91e8c",
    accentColorLight: "#fce4f1",
    textOnAccent: "#ffffff",
    pressNames: ["TikTok", "Instagram", "Allure", "Cosmopolitan", "Byrdie"],
    email: "hello@glowhaven.com",
  },
  aurae: {
    name: "Aurae",
    freeShipThreshold: "$50+",
    freeShipAmount: 50,
    accentColor: "#1a1a1a",
    accentColorLight: "#f5f5f5",
    textOnAccent: "#ffffff",
    pressNames: ["TikTok", "Instagram", "Vogue", "Elle", "Harper's Bazaar"],
    email: "hello@aurae.jewelry",
  },
  nestwell: {
    name: "Nestwell",
    freeShipThreshold: "$50+",
    freeShipAmount: 50,
    accentColor: "#2d5016",
    accentColorLight: "#ecfce5",
    textOnAccent: "#ffffff",
    pressNames: ["TikTok", "Instagram", "Architectural Digest", "House Beautiful", "Apartment Therapy"],
    email: "hello@nestwell.co",
  },
};

// ─── Feature 1: Estimated Delivery Date ──────────────────────

function buildEstimatedDeliveryLiquid(d: StoreFeatureData): string {
  return `
<style>
  .est-delivery {
    max-width: 800px;
    margin: 0 auto;
    padding: 16px 20px;
  }
  .est-delivery-box {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: ${d.accentColorLight};
    border-radius: 10px;
    border: 1px solid rgba(0,0,0,0.06);
  }
  .est-delivery-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${d.accentColor};
    color: ${d.textOnAccent};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .est-delivery-icon svg { width: 20px; height: 20px; }
  .est-delivery-label { font-size: 12px; color: #666; margin-bottom: 2px; }
  .est-delivery-date { font-size: 15px; font-weight: 700; color: #111; }
  .est-delivery-ship { font-size: 12px; color: #22c55e; margin-top: 2px; font-weight: 500; }
</style>

<div class="est-delivery">
  <div class="est-delivery-box">
    <div class="est-delivery-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="m16 8 4 2.5v6L16 19"/><path d="M1 10h15"/></svg>
    </div>
    <div>
      <div class="est-delivery-label">Estimated Delivery</div>
      <div class="est-delivery-date" id="est-delivery-date">Calculating...</div>
      <div class="est-delivery-ship">Free shipping on orders ${d.freeShipThreshold}</div>
    </div>
  </div>
</div>

<script>
(function() {
  var el = document.getElementById('est-delivery-date');
  if (!el) return;

  function addBusinessDays(date, days) {
    var result = new Date(date);
    var added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      var dow = result.getDay();
      if (dow !== 0 && dow !== 6) added++;
    }
    return result;
  }

  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var today = new Date();
  var minDate = addBusinessDays(today, 7);
  var maxDate = addBusinessDays(today, 15);

  var minStr = months[minDate.getMonth()] + ' ' + minDate.getDate();
  var maxStr = months[maxDate.getMonth()] + ' ' + maxDate.getDate();

  el.textContent = 'Order today, arrives by ' + minStr + ' - ' + maxStr;
})();
</script>`.trim();
}

async function feature1_estimatedDelivery(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  📦 Feature 1: Estimated Delivery Date...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const liquid = buildEstimatedDeliveryLiquid(d);

  await addSectionToTemplate(cfg, themeId, "templates/product.json", {
    sectionKey: "estimated_delivery",
    section: {
      type: "custom-liquid",
      settings: {
        custom_liquid: liquid,
        color_scheme: "scheme-1",
        section_width: "page-width",
        "padding-block-start": 0,
        "padding-block-end": 0,
      },
    },
    afterSection: "social_proof",
    fallbackPosition: 2,
    label: "product page",
  });
}

// ─── Feature 2: Product Badges ───────────────────────────────

async function feature2_productBadges(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  🏷 Feature 2: Product Badges...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  // Step 2a: Append badge CSS to visual-polish.css
  const cssRaw = await getThemeAsset(cfg.store, cfg.token, themeId, "assets/visual-polish.css");
  if (cssRaw) {
    // Only append if not already present
    if (!cssRaw.includes(".product-badge")) {
      const badgeCSS = `
/* Product Badges — auto-generated by shopify-features */
.product-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 3;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  line-height: 1.4;
  pointer-events: none;
}

.product-badge--viral {
  background: #111;
  color: #fff;
}

.product-badge--bestseller {
  background: #f59e0b;
  color: #fff;
}

.product-badge--new {
  background: #22c55e;
  color: #fff;
}

.product-badge--sale {
  background: #ef4444;
  color: #fff;
}

/* Stack multiple badges vertically */
.product-badge + .product-badge {
  top: auto;
  margin-top: 4px;
}

product-card .card-gallery {
  position: relative;
}

.product-badges-wrap {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-badges-wrap .product-badge {
  position: static;
}
`;
      const css = cssRaw + badgeCSS;
      const cssOk = await putThemeAsset(cfg.store, cfg.token, themeId, "assets/visual-polish.css", css);
      console.log(cssOk ? "    ✓ Appended badge CSS to visual-polish.css" : "    ❌ Failed to update CSS");
    } else {
      console.log("    ⊘ Badge CSS already in visual-polish.css — skipping");
    }
  }

  // Step 2b: Upload product badges JS snippet
  const badgesSnippet = `{% comment %}
  Product Badges — auto-generated by shopify-features
{% endcomment %}

<script>
(function() {
  function injectBadges() {
    fetch('/products.json?limit=250')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var products = data.products || [];
        var tagMap = {};

        products.forEach(function(p) {
          // Build tag set
          var tags = (p.tags || []).map(function(t) { return t.toLowerCase().trim(); });
          tagMap[p.handle] = tags;
        });

        var cards = document.querySelectorAll('product-card');
        cards.forEach(function(card) {
          var gallery = card.querySelector('.card-gallery');
          if (!gallery || gallery.querySelector('.product-badges-wrap')) return;

          // Find product handle from card link
          var link = card.querySelector('a[href*="/products/"]');
          if (!link) return;

          var href = link.getAttribute('href');
          var match = href.match(/\\/products\\/([^?#/]+)/);
          if (!match) return;

          var handle = match[1];
          var tags = tagMap[handle] || [];

          var badges = [];

          if (tags.indexOf('tiktok-viral') >= 0) {
            badges.push('<span class="product-badge product-badge--viral">TikTok Viral</span>');
          }
          if (tags.indexOf('bestseller') >= 0) {
            badges.push('<span class="product-badge product-badge--bestseller">Bestseller</span>');
          }
          if (tags.indexOf('new') >= 0 || tags.indexOf('new-arrival') >= 0) {
            badges.push('<span class="product-badge product-badge--new">New</span>');
          }

          // Check for sale price
          var product = products.find(function(p) { return p.handle === handle; });
          if (product && product.variants) {
            var onSale = product.variants.some(function(v) {
              return v.compare_at_price && parseFloat(v.compare_at_price) > parseFloat(v.price);
            });
            if (onSale) {
              badges.push('<span class="product-badge product-badge--sale">Sale</span>');
            }
          }

          if (badges.length > 0) {
            var wrap = document.createElement('div');
            wrap.className = 'product-badges-wrap';
            wrap.innerHTML = badges.join('');
            gallery.appendChild(wrap);
          }
        });
      })
      .catch(function() {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectBadges);
  } else {
    injectBadges();
  }

  document.addEventListener('shopify:section:load', injectBadges);
})();
</script>`;

  const snippetOk = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "snippets/product-badges.liquid",
    badgesSnippet,
  );
  console.log(snippetOk ? "    ✓ Uploaded snippets/product-badges.liquid" : "    ❌ Failed to upload snippet");

  // Step 2c: Inject render tag in theme.liquid before </body>
  await injectIntoThemeLayout(cfg, themeId, {
    tag: "{% render 'product-badges' %}",
    before: "</body>",
    label: "product-badges",
  });
}

// ─── Feature 3: "As Seen On" Press Strip ─────────────────────

function buildPressStripLiquid(d: StoreFeatureData): string {
  const logos = d.pressNames
    .map(
      (name) =>
        `<span style="font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;opacity:0.35;white-space:nowrap">${name}</span>`,
    )
    .join('\n      <span style="opacity:0.2;font-size:18px">&bull;</span>\n      ');

  return `
<div style="text-align:center;padding:24px 20px">
  <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:16px;font-weight:500">As Seen On</p>
  <div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:20px 32px;max-width:800px;margin:0 auto">
    ${logos}
  </div>
</div>`.trim();
}

async function feature3_pressStrip(cfg: ShopifyStoreConfig, themeId: number) {
  console.log('\n  📰 Feature 3: "As Seen On" Press Strip...');

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const liquid = buildPressStripLiquid(d);

  await addSectionToTemplate(cfg, themeId, "templates/index.json", {
    sectionKey: "press_strip",
    section: {
      type: "custom-liquid",
      settings: {
        custom_liquid: liquid,
        color_scheme: "scheme-1",
        section_width: "page-width",
        "padding-block-start": 0,
        "padding-block-end": 0,
      },
    },
    afterSection: "hero_brand",
    beforeSection: "featured_products",
    fallbackPosition: 1,
    label: "homepage",
  });
}

// ─── Feature 4: Product JSON-LD Schema (SEO) ─────────────────

async function feature4_productSchema(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  🔍 Feature 4: Product JSON-LD Schema...");

  const schemaSnippet = `{% comment %}
  Product JSON-LD Schema — auto-generated by shopify-features
{% endcomment %}

{% if template == 'product' %}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": {{ product.title | json }},
  "description": {{ product.description | strip_html | truncate: 500 | json }},
  "image": {{ product.featured_image | image_url: width: 1024 | json }},
  "url": {{ shop.url | append: product.url | json }},
  "brand": {
    "@type": "Brand",
    "name": {{ shop.name | json }}
  },
  "sku": {{ product.selected_or_first_available_variant.sku | json }},
  "offers": {
    "@type": "Offer",
    "url": {{ shop.url | append: product.url | json }},
    "priceCurrency": {{ shop.currency | json }},
    "price": {{ product.selected_or_first_available_variant.price | money_without_currency | remove: ',' | json }},
    {% if product.selected_or_first_available_variant.compare_at_price > product.selected_or_first_available_variant.price %}
    "discount": {{ product.selected_or_first_available_variant.compare_at_price | minus: product.selected_or_first_available_variant.price | money_without_currency | remove: ',' | json }},
    {% endif %}
    "availability": "{% if product.available %}https://schema.org/InStock{% else %}https://schema.org/OutOfStock{% endif %}",
    "seller": {
      "@type": "Organization",
      "name": {{ shop.name | json }}
    }
  }
  {% if product.metafields.custom.rating != blank and product.metafields.custom.review_count != blank %}
  ,"aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": {{ product.metafields.custom.rating.value | json }},
    "reviewCount": {{ product.metafields.custom.review_count.value | json }},
    "bestRating": "5",
    "worstRating": "1"
  }
  {% endif %}
}
</script>
{% endif %}`;

  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "snippets/product-schema.liquid",
    schemaSnippet,
  );
  console.log(ok ? "    ✓ Uploaded snippets/product-schema.liquid" : "    ❌ Failed to upload snippet");

  // Inject in <head> of theme.liquid
  await injectIntoThemeLayout(cfg, themeId, {
    tag: "{% render 'product-schema' %}",
    before: "</head>",
    label: "product-schema",
  });
}

// ─── Feature 5: TikTok Viral Homepage Section ────────────────

async function feature5_tiktokViralSection(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  🔥 Feature 5: TikTok Viral Homepage Section...");

  // Step 5a: Create smart collection via API (idempotent — check if exists first)
  const { data: existingCollections } = await shopifyFetch(
    cfg.store, cfg.token, "GET",
    "smart_collections.json?limit=250&fields=id,handle",
  );
  const existing = (existingCollections?.smart_collections || []).find(
    (c: any) => c.handle === "tiktok-viral",
  );

  if (existing) {
    console.log(`    ⊘ Smart collection "tiktok-viral" already exists (id: ${existing.id})`);
  } else {
    if (DRY_RUN) {
      console.log('    [DRY-RUN] Would create smart collection "tiktok-viral"');
    } else {
      const { status, data } = await shopifyFetch(
        cfg.store, cfg.token, "POST",
        "smart_collections.json",
        {
          smart_collection: {
            title: "TikTok Viral",
            rules: [
              {
                column: "tag",
                relation: "equals",
                condition: "tiktok-viral",
              },
            ],
            disjunctive: false,
            published: true,
            sort_order: "best-selling",
          },
        },
      );

      if (status === 201 || status === 200) {
        console.log(`    ✓ Created smart collection "tiktok-viral" (id: ${data?.smart_collection?.id})`);
      } else {
        console.log("    ❌ Failed to create smart collection");
      }
    }
  }

  // Step 5b: Add product-list section to index.json referencing the collection
  // We use the collection handle in the product-list section
  const tiktokSectionLiquid = `
<div style="text-align:center;margin-bottom:8px">
  <h2 style="font-size:24px;margin:0">Trending on TikTok 🔥</h2>
  <p style="color:#666;font-size:14px;margin-top:8px">The most viral products our customers can't stop buying</p>
</div>`.trim();

  // Read existing index.json to add a section
  const raw = await getThemeAsset(cfg.store, cfg.token, themeId, "templates/index.json");
  if (!raw) {
    console.log("    ⚠ Could not read templates/index.json — skipping section add");
    return;
  }

  let template: any;
  try {
    template = JSON.parse(raw);
  } catch {
    console.log("    ❌ Failed to parse index.json");
    return;
  }

  if (template.sections?.tiktok_viral) {
    console.log("    ⊘ tiktok_viral section already exists in index.json — skipping");
    return;
  }

  // Add tiktok header section
  template.sections.tiktok_viral_header = {
    type: "custom-liquid",
    settings: {
      custom_liquid: tiktokSectionLiquid,
      color_scheme: "scheme-1",
      section_width: "page-width",
      "padding-block-start": 40,
      "padding-block-end": 0,
    },
  };

  // Add tiktok product list section
  template.sections.tiktok_viral = {
    type: "product-list",
    blocks: {
      "static-product-card": {
        type: "_product-card",
        static: true,
        settings: {
          product_card_gap: 4,
          inherit_color_scheme: true,
          border: "none",
          border_width: 1,
          border_opacity: 100,
          border_radius: 0,
          "padding-block-start": 0,
          "padding-block-end": 0,
          "padding-inline-start": 0,
          "padding-inline-end": 0,
        },
        blocks: {
          gallery: {
            type: "_product-card-gallery",
            settings: {
              image_ratio: "adapt",
              border: "none",
              border_width: 1,
              border_opacity: 100,
              border_radius: 0,
              "padding-block-start": 0,
              "padding-block-end": 0,
              "padding-inline-start": 0,
              "padding-inline-end": 0,
            },
          },
          title: {
            type: "product-title",
            settings: {
              width: "100%",
              max_width: "normal",
              alignment: "left",
              type_preset: "rte",
              color: "var(--color-foreground)",
              "padding-block-start": 4,
              "padding-block-end": 0,
              "padding-inline-start": 0,
              "padding-inline-end": 0,
            },
          },
          price: {
            type: "price",
            settings: {
              show_sale_price_first: true,
              show_installments: false,
              show_tax_info: false,
              type_preset: "h6",
              width: "100%",
              alignment: "left",
              color: "var(--color-foreground)",
              "padding-block-start": 0,
              "padding-block-end": 0,
              "padding-inline-start": 0,
              "padding-inline-end": 0,
            },
          },
        },
        block_order: ["gallery", "title", "price"],
      },
    },
    settings: {
      collection: "tiktok-viral",
      layout_type: "grid",
      carousel_on_mobile: false,
      max_products: 8,
      columns: 4,
      mobile_columns: "2",
      columns_gap: 8,
      rows_gap: 24,
      section_width: "page-width",
      horizontal_alignment: "flex-start",
      gap: 12,
      color_scheme: "scheme-1",
      "padding-block-start": 12,
      "padding-block-end": 48,
    },
  };

  // Insert into order — after featured_products or social_proof_stats
  const order: string[] = template.order || Object.keys(template.sections);
  if (!order.includes("tiktok_viral_header")) {
    const afterKey = order.includes("social_proof_stats")
      ? "social_proof_stats"
      : order.includes("featured_products")
        ? "featured_products"
        : null;

    if (afterKey) {
      const idx = order.indexOf(afterKey);
      order.splice(idx + 1, 0, "tiktok_viral_header", "tiktok_viral");
    } else {
      // Fallback: insert near position 2
      order.splice(Math.min(2, order.length), 0, "tiktok_viral_header", "tiktok_viral");
    }
    template.order = order;
  }

  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "templates/index.json",
    JSON.stringify(template, null, 2),
  );
  console.log(ok ? '    ✓ Added "Trending on TikTok" section to homepage' : "    ❌ Failed to update index.json");
}

// ─── Feature 6: Product Tabs/Accordions ──────────────────────

function buildProductTabsLiquid(d: StoreFeatureData): string {
  return `
<style>
  .product-accordion {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px 32px;
  }
  .product-accordion-item {
    border-bottom: 1px solid #e5e7eb;
  }
  .product-accordion-trigger {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 18px 0;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;
    color: #111;
    text-align: left;
    line-height: 1.4;
  }
  .product-accordion-trigger:hover {
    color: ${d.accentColor};
  }
  .product-accordion-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }
  .product-accordion-item.active .product-accordion-icon {
    transform: rotate(180deg);
  }
  .product-accordion-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }
  .product-accordion-inner {
    padding: 0 0 20px;
    font-size: 14px;
    line-height: 1.7;
    color: #555;
  }
  .product-accordion-inner p { margin: 0 0 12px; }
  .product-accordion-inner p:last-child { margin: 0; }
  .product-accordion-inner ul { padding-left: 20px; margin: 8px 0; }
  .product-accordion-inner li { margin: 4px 0; }
</style>

<div class="product-accordion" id="product-accordion">
  <div class="product-accordion-item active">
    <button class="product-accordion-trigger" data-accordion-trigger>
      <span>Description</span>
      <svg class="product-accordion-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div class="product-accordion-content" style="max-height:500px">
      <div class="product-accordion-inner">
        {{ product.description }}
      </div>
    </div>
  </div>

  <div class="product-accordion-item">
    <button class="product-accordion-trigger" data-accordion-trigger>
      <span>Shipping Information</span>
      <svg class="product-accordion-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div class="product-accordion-content">
      <div class="product-accordion-inner">
        <p><strong>Standard Shipping:</strong> 7&ndash;15 business days</p>
        <p><strong>Free Shipping:</strong> On all orders over ${d.freeShipThreshold}</p>
        <p>All orders include tracking information so you can follow your package every step of the way.</p>
        <p>We ship to most countries worldwide. International orders may take 10&ndash;20 business days.</p>
      </div>
    </div>
  </div>

  <div class="product-accordion-item">
    <button class="product-accordion-trigger" data-accordion-trigger>
      <span>Returns &amp; Exchanges</span>
      <svg class="product-accordion-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div class="product-accordion-content">
      <div class="product-accordion-inner">
        <p>We offer a <strong>30-day return policy</strong> from the date of delivery.</p>
        <ul>
          <li>Items must be unused and in their original packaging</li>
          <li>Contact us at <a href="mailto:${d.email}">${d.email}</a> to start a return</li>
          <li>Refunds are processed within 5&ndash;7 business days</li>
          <li>Exchanges are free of charge (subject to availability)</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<script>
(function() {
  var triggers = document.querySelectorAll('[data-accordion-trigger]');
  triggers.forEach(function(trigger) {
    trigger.addEventListener('click', function() {
      var item = trigger.closest('.product-accordion-item');
      var content = item.querySelector('.product-accordion-content');
      var inner = content.querySelector('.product-accordion-inner');
      var isActive = item.classList.contains('active');

      // Close all
      var allItems = document.querySelectorAll('.product-accordion-item');
      allItems.forEach(function(ai) {
        ai.classList.remove('active');
        ai.querySelector('.product-accordion-content').style.maxHeight = '0';
      });

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
        content.style.maxHeight = inner.scrollHeight + 'px';
      }
    });
  });
})();
</script>`.trim();
}

async function feature6_productTabs(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  📋 Feature 6: Product Tabs/Accordion...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const liquid = buildProductTabsLiquid(d);

  await addSectionToTemplate(cfg, themeId, "templates/product.json", {
    sectionKey: "product_tabs",
    section: {
      type: "custom-liquid",
      settings: {
        custom_liquid: liquid,
        color_scheme: "scheme-1",
        section_width: "page-width",
        "padding-block-start": 10,
        "padding-block-end": 10,
      },
    },
    afterSection: "main",
    fallbackPosition: 1,
    label: "product page",
  });
}

// ─── Feature 7: Exit-Intent Popup ────────────────────────────

function buildExitIntentPopupSnippet(d: StoreFeatureData): string {
  return `{% comment %}
  Exit-Intent Popup — auto-generated by shopify-features
{% endcomment %}

<style>
  .exit-popup-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 99999;
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
    cursor: pointer;
    color: #999;
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
    padding: 14px 24px;
    font-size: 14px;
    font-weight: 700;
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
    font-weight: 700;
    font-size: 18px;
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
    <h2>Wait! Get 10% Off</h2>
    <p>Don't leave empty-handed. Enter your email and get an exclusive discount on your first order.</p>

    <div class="exit-popup-form-wrap" id="exit-popup-form-wrap">
      <div class="exit-popup-form" id="exit-popup-form">
        <input type="email" class="exit-popup-input" id="exit-popup-email" placeholder="Enter your email" required>
        <button class="exit-popup-btn" id="exit-popup-btn">Get 10% Off</button>
      </div>
      <button class="exit-popup-skip" id="exit-popup-skip">No thanks, I'll pay full price</button>
    </div>

    <div class="exit-popup-success" id="exit-popup-success">
      <p style="font-weight:600;color:#111;margin-bottom:16px">Your discount code:</p>
      <div class="exit-popup-code">WELCOME10</div>
      <p style="font-size:13px;color:#666;margin-top:16px">Apply at checkout for 10% off your order</p>
    </div>
  </div>
</div>

<script>
(function() {
  // Only show once per session
  if (sessionStorage.getItem('exit_popup_shown')) return;

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

  // Close handlers
  closeBtn.addEventListener('click', hidePopup);
  skipBtn.addEventListener('click', hidePopup);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) hidePopup();
  });

  // Submit handler
  submitBtn.addEventListener('click', function() {
    var email = emailInput.value.trim();
    if (!email || !email.includes('@')) {
      emailInput.style.borderColor = '#ef4444';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    // Create customer via Shopify AJAX
    fetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'form_type=customer&utf8=✓&customer[email]=' + encodeURIComponent(email) + '&customer[tags]=exit-intent,discount-10'
    })
    .then(function() {
      formWrap.classList.add('hidden');
      successDiv.classList.add('show');
    })
    .catch(function() {
      // Still show code even if signup fails
      formWrap.classList.add('hidden');
      successDiv.classList.add('show');
    });
  });

  // Enter key submits
  emailInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitBtn.click();
    }
  });
})();
</script>`;
}

async function feature7_exitIntentPopup(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  🚪 Feature 7: Exit-Intent Popup...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const snippet = buildExitIntentPopupSnippet(d);
  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "snippets/exit-intent-popup.liquid",
    snippet,
  );
  console.log(ok ? "    ✓ Uploaded snippets/exit-intent-popup.liquid" : "    ❌ Failed to upload snippet");

  // Inject render tag in theme.liquid before </body>
  await injectIntoThemeLayout(cfg, themeId, {
    tag: "{% render 'exit-intent-popup' %}",
    before: "</body>",
    label: "exit-intent-popup",
  });
}

// ─── Main ────────────────────────────────────────────────────

async function processStore(cfg: ShopifyStoreConfig) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ✨ Features: ${cfg.slug.toUpperCase()} → ${cfg.store}`);
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
    { fn: () => feature1_estimatedDelivery(cfg, themeId), label: "Feature 1" },
    { fn: () => feature2_productBadges(cfg, themeId), label: "Feature 2" },
    { fn: () => feature3_pressStrip(cfg, themeId), label: "Feature 3" },
    { fn: () => feature4_productSchema(cfg, themeId), label: "Feature 4" },
    { fn: () => feature5_tiktokViralSection(cfg, themeId), label: "Feature 5" },
    { fn: () => feature6_productTabs(cfg, themeId), label: "Feature 6" },
    { fn: () => feature7_exitIntentPopup(cfg, themeId), label: "Feature 7" },
  ];

  for (const step of steps) {
    try {
      await step.fn();
    } catch (e: any) {
      console.error(`    ❌ ${step.label} failed: ${e.message}`);
    }
  }

  console.log(`\n  ✅ ${cfg.slug.toUpperCase()} features complete`);
}

async function main() {
  console.log("✨ Shopify Features Script");
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}`);
  console.log(`   API version: ${API_VERSION}\n`);

  const configs = getStoreConfigs();

  if (configs.length === 0) {
    console.error("❌ No Shopify store credentials found in environment.");
    console.error("   Set SHOPIFY_GLOWHAVEN_STORE, SHOPIFY_GLOWHAVEN_TOKEN, etc.");
    console.error("   Required scopes: read_products, write_products, read_themes, write_themes");
    process.exit(1);
  }

  console.log(`   Stores: ${configs.map((c) => c.slug.toUpperCase()).join(", ")}`);
  console.log(`   Features: delivery estimate, product badges, press strip,`);
  console.log(`             JSON-LD schema, TikTok viral section, product tabs,`);
  console.log(`             exit-intent popup\n`);

  for (const cfg of configs) {
    await processStore(cfg);
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log("✅ All stores enhanced with new features!");
  console.log(`${"═".repeat(60)}\n`);

  console.log("📋 VERIFICATION CHECKLIST:");
  console.log('   □ Product page: "Order today, arrives by [date range]"');
  console.log("   □ Product cards: colored badges (TikTok Viral, Bestseller, New, Sale)");
  console.log('   □ Homepage: "As Seen On" press strip after hero');
  console.log("   □ Google: product pages have JSON-LD structured data");
  console.log('   □ Homepage: "Trending on TikTok" section with viral products');
  console.log("   □ Product page: accordion tabs (Description, Shipping, Returns)");
  console.log("   □ Exit-intent popup: appears when mouse leaves viewport, captures email");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  });
