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

// ─── Per-store data ──────────────────────────────────────────

interface StoreSocialData {
  instagram: string;
  tiktok: string;
  pinterest: string;
  heroCta1Label: string;
  heroCta1Link: string;
  accentColor: string;
}

const STORE_DATA: Record<string, StoreSocialData> = {
  glowhaven: {
    instagram: "https://instagram.com/glowhaven",
    tiktok: "https://tiktok.com/@glowhaven",
    pinterest: "",
    heroCta1Label: "Shop Bestsellers",
    heroCta1Link: "shopify://collections/skincare",
    accentColor: "#e91e8c",
  },
  aurae: {
    instagram: "https://instagram.com/aurae.jewelry",
    tiktok: "https://tiktok.com/@aurae.jewelry",
    pinterest: "https://pinterest.com/aurae_jewelry",
    heroCta1Label: "Explore Pieces",
    heroCta1Link: "shopify://collections/necklaces",
    accentColor: "#1a1a1a",
  },
  nestwell: {
    instagram: "https://instagram.com/nestwell.home",
    tiktok: "https://tiktok.com/@nestwell.home",
    pinterest: "https://pinterest.com/nestwell_home",
    heroCta1Label: "Shop Now",
    heroCta1Link: "shopify://collections/lighting",
    accentColor: "#2d5016",
  },
};

// ─── Bug 1: Double Announcement Bar ─────────────────────────

async function bug1_doubleAnnouncementBar(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  📢 Bug 1: Remove duplicate announcement bar from header-group...");

  const raw = await getThemeAsset(cfg.store, cfg.token, themeId, "sections/header-group.json");
  if (!raw) {
    console.log("    ⚠ Could not read sections/header-group.json — skipping");
    return;
  }

  let headerGroup: any;
  try {
    headerGroup = JSON.parse(raw);
  } catch {
    console.log("    ❌ Failed to parse header-group.json");
    return;
  }

  const sections = headerGroup.sections || {};
  const order: string[] = headerGroup.order || Object.keys(sections);
  let removed = false;

  // Find and remove section(s) with type === "announcement-bar"
  for (const key of Object.keys(sections)) {
    if (sections[key]?.type === "announcement-bar") {
      console.log(`    Found default announcement-bar: key="${key}"`);
      delete sections[key];
      const idx = order.indexOf(key);
      if (idx >= 0) order.splice(idx, 1);
      removed = true;
    }
  }

  if (!removed) {
    console.log("    ⊘ No default announcement-bar section found — already clean");
    return;
  }

  headerGroup.sections = sections;
  headerGroup.order = order;

  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "sections/header-group.json",
    JSON.stringify(headerGroup, null, 2),
  );
  console.log(ok ? "    ✓ Removed default announcement-bar from header-group" : "    ❌ Failed to update header-group.json");
}

// ─── Bug 2: Duplicate Product Recommendations ───────────────

async function bug2_duplicateProductRecs(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  🎯 Bug 2: Remove duplicate product recommendations...");

  const raw = await getThemeAsset(cfg.store, cfg.token, themeId, "templates/product.json");
  if (!raw) {
    console.log("    ⚠ Could not read templates/product.json — skipping");
    return;
  }

  let template: any;
  try {
    template = JSON.parse(raw);
  } catch {
    console.log("    ❌ Failed to parse product.json");
    return;
  }

  const sections = template.sections || {};
  const order: string[] = template.order || Object.keys(sections);
  let removed = false;

  // Find our custom recs section — it uses custom-liquid with recs-wrap or /recommendations/products.json
  for (const key of Object.keys(sections)) {
    const sec = sections[key];
    if (sec?.type !== "custom-liquid") continue;

    const liquid = sec.settings?.custom_liquid || "";
    if (liquid.includes("recs-wrap") || liquid.includes("/recommendations/products.json")) {
      console.log(`    Found custom recs section: key="${key}"`);
      delete sections[key];
      const idx = order.indexOf(key);
      if (idx >= 0) order.splice(idx, 1);
      removed = true;
    }
  }

  if (!removed) {
    console.log("    ⊘ No custom recs section found — already clean");
    return;
  }

  template.sections = sections;
  template.order = order;

  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "templates/product.json",
    JSON.stringify(template, null, 2),
  );
  console.log(ok ? "    ✓ Removed custom recs section (native one kept)" : "    ❌ Failed to update product.json");
}

// ─── Bug 3: Duplicate Collection Heading ─────────────────────

async function bug3_duplicateCollectionHeading(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  📂 Bug 3: Remove duplicate collection heading...");

  const raw = await getThemeAsset(cfg.store, cfg.token, themeId, "templates/collection.json");
  if (!raw) {
    console.log("    ⚠ Could not read templates/collection.json — skipping");
    return;
  }

  let template: any;
  try {
    template = JSON.parse(raw);
  } catch {
    console.log("    ❌ Failed to parse collection.json");
    return;
  }

  const sections = template.sections || {};
  const order: string[] = template.order || Object.keys(sections);
  let removed = false;

  // Find collection_banner — custom-liquid with collection.title
  for (const key of Object.keys(sections)) {
    if (key !== "collection_banner") continue;

    const sec = sections[key];
    if (sec?.type === "custom-liquid") {
      const liquid = sec.settings?.custom_liquid || "";
      if (liquid.includes("collection.title")) {
        console.log(`    Found collection_banner with collection.title`);
        delete sections[key];
        const idx = order.indexOf(key);
        if (idx >= 0) order.splice(idx, 1);
        removed = true;
      }
    }
  }

  if (!removed) {
    console.log("    ⊘ No duplicate collection_banner found — already clean");
    return;
  }

  template.sections = sections;
  template.order = order;

  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "templates/collection.json",
    JSON.stringify(template, null, 2),
  );
  console.log(ok ? "    ✓ Removed duplicate collection_banner" : "    ❌ Failed to update collection.json");
}

// ─── Bug 4: Hero CTA Inconsistency ──────────────────────────

async function bug4_heroCTAInconsistency(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  🔗 Bug 4: Fix hero CTA inconsistency...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const raw = await getThemeAsset(cfg.store, cfg.token, themeId, "templates/index.json");
  if (!raw) {
    console.log("    ⚠ Could not read templates/index.json — skipping");
    return;
  }

  let template: any;
  try {
    template = JSON.parse(raw);
  } catch {
    console.log("    ❌ Failed to parse index.json");
    return;
  }

  // Find hero section — try hero_brand first, then any section with type "hero"
  let heroKey: string | null = null;
  if (template.sections?.hero_brand) {
    heroKey = "hero_brand";
  } else {
    for (const key of Object.keys(template.sections || {})) {
      if (template.sections[key]?.type === "hero") {
        heroKey = key;
        break;
      }
    }
  }

  if (!heroKey) {
    console.log("    ⚠ No hero section found — skipping");
    return;
  }

  const hero = template.sections[heroKey];
  const blocks = hero.blocks || {};

  // Fix CTA buttons
  let changed = false;

  // Keep first CTA as store-specific
  if (blocks.cta) {
    blocks.cta.settings.label = d.heroCta1Label;
    blocks.cta.settings.link = d.heroCta1Link;
    console.log(`    CTA1: "${d.heroCta1Label}" → ${d.heroCta1Link}`);
    changed = true;
  }

  // Change second CTA to "New Arrivals" → /collections/all
  if (blocks.cta2) {
    blocks.cta2.settings.label = "New Arrivals";
    blocks.cta2.settings.link = "/collections/all";
    console.log(`    CTA2: "New Arrivals" → /collections/all`);
    changed = true;
  }

  if (!changed) {
    console.log("    ⊘ No CTA blocks found to update");
    return;
  }

  hero.blocks = blocks;
  template.sections[heroKey] = hero;

  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "templates/index.json",
    JSON.stringify(template, null, 2),
  );
  console.log(ok ? "    ✓ Hero CTAs fixed (distinct labels + links)" : "    ❌ Failed to update index.json");
}

// ─── Bug 5: Footer Social Links are Placeholder ─────────────

async function bug5_footerSocialLinks(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  🔗 Bug 5: Fix placeholder social links...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  const raw = await getThemeAsset(cfg.store, cfg.token, themeId, "config/settings_data.json");
  if (!raw) {
    console.log("    ❌ Could not read config/settings_data.json — skipping");
    return;
  }

  let settings: any;
  try {
    settings = JSON.parse(raw);
  } catch {
    console.log("    ❌ Failed to parse settings_data.json");
    return;
  }

  const current = settings.current || {};

  // Set proper social links
  current.social_instagram_link = d.instagram;
  current.social_tiktok_link = d.tiktok;
  current.social_pinterest_link = d.pinterest;

  // Clear unused platforms
  current.social_facebook_link = "";
  current.social_twitter_link = "";
  current.social_youtube_link = "";
  current.social_snapchat_link = "";
  current.social_tumblr_link = "";
  current.social_vimeo_link = "";

  settings.current = current;

  console.log(`    Instagram: ${d.instagram}`);
  console.log(`    TikTok: ${d.tiktok}`);
  if (d.pinterest) console.log(`    Pinterest: ${d.pinterest}`);

  const ok = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "config/settings_data.json",
    JSON.stringify(settings, null, 2),
  );
  console.log(ok ? "    ✓ Social links updated" : "    ❌ Failed to update settings_data.json");
}

// ─── Bug 6: Quick View Overlay Non-Functional ────────────────

async function bug6_quickViewOverlay(cfg: ShopifyStoreConfig, themeId: number) {
  console.log("\n  👁 Bug 6: Fix non-functional quick view overlay...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  // Step 6a: Read and patch visual-polish.css — remove the ::after pseudo-element rules
  const cssRaw = await getThemeAsset(cfg.store, cfg.token, themeId, "assets/visual-polish.css");
  if (!cssRaw) {
    console.log("    ⚠ Could not read assets/visual-polish.css — skipping CSS patch");
  } else {
    let css = cssRaw;

    // Remove the ::after block and the hover ::after block
    // Pattern: "product-card .card-gallery::after { ... }" and "product-card:hover .card-gallery::after { ... }"
    css = css.replace(
      /\/\* Quick View overlay on product card image.*?\*\/\s*/s,
      "",
    );
    css = css.replace(
      /product-card\s+\.card-gallery::after\s*\{[^}]*\}\s*/g,
      "",
    );
    css = css.replace(
      /product-card:hover\s+\.card-gallery::after\s*\{[^}]*\}\s*/g,
      "",
    );

    // Add real quick-view-link styles
    css += `
/* Quick View link (replaces non-functional ::after pseudo-element) */
.quick-view-link {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  text-align: center;
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-decoration: none;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 2;
  display: block;
}

product-card:hover .quick-view-link {
  transform: translateY(0);
}

.quick-view-link:hover {
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
}
`;

    const cssOk = await putThemeAsset(cfg.store, cfg.token, themeId, "assets/visual-polish.css", css);
    console.log(cssOk ? "    ✓ Patched visual-polish.css (removed ::after, added .quick-view-link)" : "    ❌ Failed to update CSS");
  }

  // Step 6b: Upload JS snippet that creates real <a> quick view links
  const quickViewSnippet = `{% comment %}
  Quick View Link Injector — auto-generated by shopify-bugfix
{% endcomment %}

<script>
(function() {
  function injectQuickViewLinks() {
    var cards = document.querySelectorAll('product-card');
    cards.forEach(function(card) {
      var gallery = card.querySelector('.card-gallery');
      if (!gallery || gallery.querySelector('.quick-view-link')) return;

      // Find the product link from the card
      var productLink = card.querySelector('a[href*="/products/"]');
      if (!productLink) return;

      var href = productLink.getAttribute('href');
      var link = document.createElement('a');
      link.className = 'quick-view-link';
      link.href = href;
      link.textContent = 'Quick View';
      link.setAttribute('aria-label', 'Quick view product');

      gallery.appendChild(link);
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectQuickViewLinks);
  } else {
    injectQuickViewLinks();
  }

  // Re-run after Shopify section rendering (AJAX navigation)
  document.addEventListener('shopify:section:load', injectQuickViewLinks);

  // Also observe for dynamically loaded product cards
  var observer = new MutationObserver(function(mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].addedNodes.length > 0) {
        injectQuickViewLinks();
        break;
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
</script>`;

  const snippetOk = await putThemeAsset(
    cfg.store, cfg.token, themeId,
    "snippets/quick-view-link.liquid",
    quickViewSnippet,
  );
  console.log(snippetOk ? "    ✓ Uploaded snippets/quick-view-link.liquid" : "    ❌ Failed to upload snippet");

  // Step 6c: Inject render tag in theme.liquid before </body>
  await injectIntoThemeLayout(cfg, themeId, {
    tag: "{% render 'quick-view-link' %}",
    before: "</body>",
    label: "quick-view-link",
  });
}

// ─── Main ────────────────────────────────────────────────────

async function processStore(cfg: ShopifyStoreConfig) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  🔧 Bugfix: ${cfg.slug.toUpperCase()} → ${cfg.store}`);
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
    { fn: () => bug1_doubleAnnouncementBar(cfg, themeId), label: "Bug 1" },
    { fn: () => bug2_duplicateProductRecs(cfg, themeId), label: "Bug 2" },
    { fn: () => bug3_duplicateCollectionHeading(cfg, themeId), label: "Bug 3" },
    { fn: () => bug4_heroCTAInconsistency(cfg, themeId), label: "Bug 4" },
    { fn: () => bug5_footerSocialLinks(cfg, themeId), label: "Bug 5" },
    { fn: () => bug6_quickViewOverlay(cfg, themeId), label: "Bug 6" },
  ];

  for (const step of steps) {
    try {
      await step.fn();
    } catch (e: any) {
      console.error(`    ❌ ${step.label} failed: ${e.message}`);
    }
  }

  console.log(`\n  ✅ ${cfg.slug.toUpperCase()} bugfixes complete`);
}

async function main() {
  console.log("🔧 Shopify Bugfix Script");
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}`);
  console.log(`   API version: ${API_VERSION}\n`);

  const configs = getStoreConfigs();

  if (configs.length === 0) {
    console.error("❌ No Shopify store credentials found in environment.");
    console.error("   Set SHOPIFY_GLOWHAVEN_STORE, SHOPIFY_GLOWHAVEN_TOKEN, etc.");
    console.error("   Required scopes: read_themes, write_themes");
    process.exit(1);
  }

  console.log(`   Stores: ${configs.map((c) => c.slug.toUpperCase()).join(", ")}`);
  console.log(`   Fixes: announcement bar, product recs, collection heading,`);
  console.log(`          hero CTAs, social links, quick view overlay\n`);

  for (const cfg of configs) {
    await processStore(cfg);
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log("✅ All stores bugfixed!");
  console.log(`${"═".repeat(60)}\n`);

  console.log("📋 VERIFICATION CHECKLIST:");
  console.log('   □ Only one announcement bar visible (marquee, no "Welcome to our store")');
  console.log('   □ Product page: single "You May Also Like" section (native)');
  console.log("   □ Collection page: single heading (no duplicate title)");
  console.log('   □ Hero: two distinct CTAs (store-specific + "New Arrivals")');
  console.log("   □ Footer: real social links (Instagram, TikTok show correct URLs)");
  console.log('   □ Product cards: clickable "Quick View" link on hover opens product page');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  });
