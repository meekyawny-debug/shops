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

// ─── Per-store data ──────────────────────────────────────────

interface StoreData {
  name: string;
  discountCode: string;
  email: string;
  freeShipThreshold: string;
}

const STORE_DATA: Record<string, StoreData> = {
  glowhaven: {
    name: "Glowhaven",
    discountCode: "GLOW10",
    email: "hello@glowhaven.com",
    freeShipThreshold: "$40+",
  },
  aurae: {
    name: "Aurae",
    discountCode: "AURAE10",
    email: "hello@aurae.jewelry",
    freeShipThreshold: "$50+",
  },
  nestwell: {
    name: "Nestwell",
    discountCode: "NEST10",
    email: "hello@nestwell.co",
    freeShipThreshold: "$50+",
  },
};

// ─── Collection image + description data ─────────────────────

interface CollectionData {
  image: string;
  description: string;
}

// Curated Pexels images — direct image URLs that Shopify can ingest
const COLLECTION_DATA: Record<string, Record<string, CollectionData>> = {
  glowhaven: {
    Tools: {
      image: "https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Professional-grade beauty tools to elevate your skincare and makeup routine. From gua sha stones to facial rollers, every tool is designed for real results.",
    },
    Skincare: {
      image: "https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Clean, effective skincare essentials for every skin type. Serums, moisturizers, and treatments formulated with ingredients you can trust.",
    },
    Masks: {
      image: "https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Treat yourself to a spa-worthy experience at home. Sheet masks, clay masks, and LED treatments for glowing, refreshed skin.",
    },
    "Body Care": {
      image: "https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Luxurious body care for silky-smooth skin from head to toe. Lotions, scrubs, and oils made with clean, nourishing ingredients.",
    },
    Accessories: {
      image: "https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "The finishing touches for your beauty routine. Headbands, makeup bags, mirrors, and more to keep you organized and glowing.",
    },
    "Hair Care": {
      image: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Healthy hair starts here. Rosemary oils, heatless curlers, and treatments for stronger, shinier hair — naturally.",
    },
    Lips: {
      image: "https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Lip oils, glosses, and balms for soft, hydrated lips with a hint of color. Clean formulas that feel as good as they look.",
    },
    Makeup: {
      image: "https://images.pexels.com/photos/2587370/pexels-photo-2587370.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Everyday makeup essentials that enhance your natural beauty. Lightweight, buildable coverage with clean ingredients.",
    },
    Brows: {
      image: "https://images.pexels.com/photos/3373716/pexels-photo-3373716.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Define and shape your brows with precision tools and growth serums. Everything you need for full, natural-looking brows.",
    },
    "Oral Care": {
      image: "https://images.pexels.com/photos/3762940/pexels-photo-3762940.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Brighten your smile with clean oral care essentials. Whitening strips, charcoal toothpaste, and fresh breath solutions.",
    },
    "TikTok Viral": {
      image: "https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "The beauty products TikTok can't stop talking about. Trending skincare, makeup, and tools that actually live up to the hype.",
    },
  },
  aurae: {
    Necklaces: {
      image: "https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Timeless necklaces handcrafted for everyday elegance. From delicate pendants to bold statement pieces, find the perfect layer.",
    },
    Earrings: {
      image: "https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Earrings that frame your face beautifully. Studs, hoops, and drops crafted with tarnish-resistant materials for lasting shine.",
    },
    "Hair Accessories": {
      image: "https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Elegant hair accessories to elevate any look. Clips, pins, and headbands designed with the same care as our fine jewelry.",
    },
    Bracelets: {
      image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Stackable bracelets and meaningful bangles for your wrist story. Handcrafted, tarnish-resistant, and made to be worn every day.",
    },
    Rings: {
      image: "https://images.pexels.com/photos/1616096/pexels-photo-1616096.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Statement rings and everyday bands crafted for lasting beauty. Signet rings, croissant bands, and stackable styles to express yourself.",
    },
    "TikTok Viral": {
      image: "https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "The jewelry pieces trending on TikTok right now. From birth flower necklaces to magnetic couple bracelets — get them before they sell out.",
    },
  },
  nestwell: {
    Lighting: {
      image: "https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Set the mood with warm, ambient lighting. Sunset lamps, moon lights, and LED strips to transform any room into a cozy retreat.",
    },
    "Room Ambiance": {
      image: "https://images.pexels.com/photos/3049121/pexels-photo-3049121.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Create the perfect atmosphere with incense waterfalls, flame diffusers, and rain cloud humidifiers. Relaxation made beautiful.",
    },
    Textiles: {
      image: "https://images.pexels.com/photos/6032280/pexels-photo-6032280.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Soft, luxurious textiles to make your home feel like a hug. Chunky knit blankets, cushion covers, and cozy throws for every season.",
    },
    Decor: {
      image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Curated home decor pieces that balance beauty with function. Wall art, vases, and accent pieces to make your space uniquely yours.",
    },
    Storage: {
      image: "https://images.pexels.com/photos/6969831/pexels-photo-6969831.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Stylish storage solutions that keep clutter at bay without sacrificing aesthetics. Woven baskets, decorative boxes, and organizers.",
    },
    Wellness: {
      image: "https://images.pexels.com/photos/3188/love-romantic-bath-candlelight.jpg?auto=compress&cs=tinysrgb&w=1200",
      description: "Home wellness essentials for mind and body. Candle warmers, aromatherapy diffusers, and relaxation accessories for your sanctuary.",
    },
    Aromatherapy: {
      image: "https://images.pexels.com/photos/4207707/pexels-photo-4207707.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Fill your space with calming scents. Essential oil diffusers, incense burners, and soy candles for everyday relaxation.",
    },
    "Wall Decor": {
      image: "https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Transform bare walls into statement pieces. Mirrors, macrame hangings, and art prints curated for modern living spaces.",
    },
    "TikTok Viral": {
      image: "https://images.pexels.com/photos/3049121/pexels-photo-3049121.jpeg?auto=compress&cs=tinysrgb&w=1200",
      description: "Home decor pieces that went viral on TikTok. Sunset lamps, rain cloud diffusers, and cozy essentials everyone is obsessing over.",
    },
  },
};

// ─── Step 1: Fix Collection Images & Descriptions ────────────

async function step1_fixCollections(cfg: ShopifyStoreConfig) {
  console.log("\n  🖼️  Step 1: Fix collection images & descriptions...");

  // Fetch custom collections
  const { data: ccData } = await shopifyFetch(
    cfg.store, cfg.token, "GET",
    "custom_collections.json?limit=250",
  );
  const customCollections: any[] = ccData?.custom_collections || [];

  // Also fetch smart collections
  const { data: scData } = await shopifyFetch(
    cfg.store, cfg.token, "GET",
    "smart_collections.json?limit=250",
  );
  const smartCollections: any[] = scData?.smart_collections || [];

  const allCollections = [
    ...customCollections.map((c: any) => ({ ...c, type: "custom" })),
    ...smartCollections.map((c: any) => ({ ...c, type: "smart" })),
  ];

  if (allCollections.length === 0) {
    console.log("    ⚠ No collections found");
    return;
  }

  console.log(`    Found ${allCollections.length} collections (${customCollections.length} custom, ${smartCollections.length} smart)`);

  const storeCollectionData = COLLECTION_DATA[cfg.slug] || {};
  let updated = 0;

  for (const coll of allCollections) {
    // Skip frontpage collection
    if (coll.handle === "frontpage") {
      console.log(`    ⊘ Skipping "frontpage" (managed by Shopify)`);
      continue;
    }

    const collData = storeCollectionData[coll.title];
    if (!collData) {
      console.log(`    ⚠ No data for collection "${coll.title}" — skipping`);
      continue;
    }

    const hasImage = !!coll.image;
    const hasDesc = !!coll.body_html && coll.body_html.trim().length > 0;

    if (hasImage && hasDesc) {
      console.log(`    ⊘ "${coll.title}" already has image + description — skipping`);
      continue;
    }

    const updatePayload: any = { id: coll.id };
    const changes: string[] = [];

    if (!hasImage) {
      updatePayload.image = { src: collData.image, alt: `${coll.title} collection` };
      changes.push("image");
    }
    if (!hasDesc) {
      updatePayload.body_html = `<p>${collData.description}</p>`;
      changes.push("description");
    }

    if (DRY_RUN) {
      console.log(`    [DRY-RUN] Would update "${coll.title}": ${changes.join(" + ")}`);
      updated++;
      continue;
    }

    const endpoint = coll.type === "custom"
      ? `custom_collections/${coll.id}.json`
      : `smart_collections/${coll.id}.json`;
    const bodyKey = coll.type === "custom" ? "custom_collection" : "smart_collection";

    const { status } = await shopifyFetch(
      cfg.store, cfg.token, "PUT", endpoint,
      { [bodyKey]: updatePayload },
    );

    if (status === 200) {
      console.log(`    ✓ "${coll.title}" — updated ${changes.join(" + ")}`);
      updated++;
    } else {
      console.log(`    ❌ Failed to update "${coll.title}"`);
    }
  }

  console.log(`    📊 Updated ${updated}/${allCollections.length} collections`);
}

// ─── Step 2: Fix Contact Pages ───────────────────────────────

async function step2_fixContactPages(cfg: ShopifyStoreConfig) {
  console.log("\n  📧 Step 2: Fix Contact page content...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  // Fetch all pages
  const { data } = await shopifyFetch(cfg.store, cfg.token, "GET", "pages.json?limit=250");
  const pages: any[] = data?.pages || [];

  const contactPage = pages.find(
    (p: any) => p.handle === "contact" || p.title.toLowerCase().includes("contact"),
  );

  if (!contactPage) {
    console.log("    ⚠ No Contact page found — creating one");

    const contactHtml = buildContactHtml(d);

    if (DRY_RUN) {
      console.log("    [DRY-RUN] Would create Contact page");
      return;
    }

    const { status } = await shopifyFetch(cfg.store, cfg.token, "POST", "pages.json", {
      page: {
        title: "Contact Us",
        handle: "contact",
        body_html: contactHtml,
      },
    });
    console.log(status === 201 ? "    ✓ Created Contact page" : "    ❌ Failed to create Contact page");
    return;
  }

  // Check if page already has content
  if (contactPage.body_html && contactPage.body_html.trim().length > 50) {
    console.log(`    ⊘ Contact page already has content (${contactPage.body_html.length} chars) — skipping`);
    return;
  }

  const contactHtml = buildContactHtml(d);

  if (DRY_RUN) {
    console.log(`    [DRY-RUN] Would update Contact page (id: ${contactPage.id})`);
    return;
  }

  const { status } = await shopifyFetch(
    cfg.store, cfg.token, "PUT", `pages/${contactPage.id}.json`,
    { page: { id: contactPage.id, body_html: contactHtml } },
  );
  console.log(status === 200 ? "    ✓ Updated Contact page with full content" : "    ❌ Failed to update Contact page");
}

function buildContactHtml(d: StoreData): string {
  return `
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
</div>`.trim();
}

// ─── Step 3: Create Store-Specific Discount Codes ────────────

async function step3_createDiscountCodes(cfg: ShopifyStoreConfig) {
  console.log("\n  🎟️  Step 3: Create store-specific discount codes...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  // Check existing price rules
  const { data: prData } = await shopifyFetch(cfg.store, cfg.token, "GET", "price_rules.json?limit=250");
  const existingRules: any[] = prData?.price_rules || [];
  const existingTitles = new Set(existingRules.map((r: any) => r.title));

  if (existingTitles.has(d.discountCode)) {
    console.log(`    ⊘ Discount code "${d.discountCode}" already exists — skipping`);
    return;
  }

  if (DRY_RUN) {
    console.log(`    [DRY-RUN] Would create discount: ${d.discountCode} (10% off, all products)`);
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
        value: "-10.0",
        customer_selection: "all",
        starts_at: new Date().toISOString(),
      },
    },
  );

  if (prStatus !== 201 || !newPrData?.price_rule) {
    console.log(`    ❌ Failed to create price rule for ${d.discountCode}`);
    return;
  }

  const priceRuleId = newPrData.price_rule.id;

  // Create discount code
  const { status: dcStatus } = await shopifyFetch(
    cfg.store, cfg.token, "POST", `price_rules/${priceRuleId}/discount_codes.json`,
    { discount_code: { code: d.discountCode } },
  );

  if (dcStatus === 201) {
    console.log(`    ✓ Created discount: ${d.discountCode} → 10% off all products, no minimum`);
  } else {
    console.log(`    ❌ Failed to create discount code ${d.discountCode}`);
  }
}

// ─── Step 4: Add Product SEO Metadata ────────────────────────

async function step4_productSEO(cfg: ShopifyStoreConfig) {
  console.log("\n  🔍 Step 4: Add product SEO metadata...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  // Fetch all products
  const { data } = await shopifyFetch(
    cfg.store, cfg.token, "GET",
    "products.json?limit=250&fields=id,title,body_html,handle",
  );
  const products: any[] = data?.products || [];

  if (products.length === 0) {
    console.log("    ⚠ No products found");
    return;
  }

  console.log(`    Found ${products.length} products`);

  let updated = 0;
  for (const product of products) {
    // Build SEO title: "Product Title | Store Name"
    const seoTitle = `${product.title} | ${d.name}`;

    // Build SEO description from body_html (strip tags, truncate to ~155 chars)
    const plainText = (product.body_html || "")
      .replace(/<[^>]*>/g, "")
      .replace(/&[^;]+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const seoDescription = plainText.length > 155
      ? plainText.slice(0, 152) + "..."
      : plainText || `Shop ${product.title} at ${d.name}. Free shipping on orders ${d.freeShipThreshold}. Fast delivery & easy returns.`;

    if (DRY_RUN) {
      console.log(`    [DRY-RUN] ${product.title.slice(0, 35).padEnd(35)} → SEO title + desc`);
      updated++;
      continue;
    }

    const { status } = await shopifyFetch(
      cfg.store, cfg.token, "PUT", `products/${product.id}.json`,
      {
        product: {
          id: product.id,
          metafields_global_title_tag: seoTitle,
          metafields_global_description_tag: seoDescription,
        },
      },
    );

    if (status === 200) {
      console.log(`    ✓ ${product.title.slice(0, 35).padEnd(35)} → SEO updated`);
      updated++;
    } else {
      console.log(`    ❌ ${product.title.slice(0, 35)} — failed`);
    }
  }

  console.log(`    📊 SEO updated for ${updated}/${products.length} products`);
}

// ─── Step 5: Print Manual Steps ──────────────────────────────

function step5_printManualSteps(cfg: ShopifyStoreConfig) {
  console.log("\n  📋 Step 5: Manual steps required...");

  const d = STORE_DATA[cfg.slug];
  if (!d) return;

  console.log(`
    ┌─────────────────────────────────────────────────────────┐
    │  MANUAL STEPS for ${d.name.toUpperCase().padEnd(38)}│
    ├─────────────────────────────────────────────────────────┤
    │                                                         │
    │  1. STORE POLICIES (Settings → Policies):               │
    │     • Refund Policy: 30-day returns, unused condition    │
    │     • Terms of Service: Standard e-commerce terms        │
    │     • Shipping Policy: 7-15 days standard, free ${d.freeShipThreshold.padEnd(6)}│
    │     • Privacy Policy: Update placeholder values          │
    │                                                         │
    │  2. CHECKOUT SETTINGS:                                  │
    │     • Enable ${d.discountCode.padEnd(8)} code at checkout               │
    │     • Test the full checkout flow                        │
    │                                                         │
    │  3. DOMAIN SETUP:                                       │
    │     • Connect custom domain when ready to launch         │
    │                                                         │
    └─────────────────────────────────────────────────────────┘`);
}

// ─── Main ────────────────────────────────────────────────────

async function processStore(cfg: ShopifyStoreConfig) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ✨ Perfect Store: ${cfg.slug.toUpperCase()} → ${cfg.store}`);
  console.log(`${"═".repeat(60)}`);

  const steps = [
    { fn: () => step1_fixCollections(cfg), label: "Fix collections" },
    { fn: () => step2_fixContactPages(cfg), label: "Fix Contact page" },
    { fn: () => step3_createDiscountCodes(cfg), label: "Create discount codes" },
    { fn: () => step4_productSEO(cfg), label: "Product SEO" },
    { fn: () => Promise.resolve(step5_printManualSteps(cfg)), label: "Manual steps" },
  ];

  for (const step of steps) {
    try {
      await step.fn();
    } catch (e: any) {
      console.error(`    ❌ ${step.label} failed: ${e.message}`);
    }
  }

  console.log(`\n  ✅ ${cfg.slug.toUpperCase()} perfected!`);
}

async function main() {
  console.log("✨ Shopify Perfect Store Script");
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}`);
  console.log(`   API version: ${API_VERSION}\n`);

  const configs = getStoreConfigs();

  if (configs.length === 0) {
    console.error("❌ No Shopify store credentials found in environment.");
    console.error("   Set SHOPIFY_GLOWHAVEN_STORE, SHOPIFY_GLOWHAVEN_TOKEN, etc.");
    console.error("   Required scopes: read_products, write_products, read_content, write_content,");
    console.error("                    read_price_rules, write_price_rules, read_discounts, write_discounts");
    process.exit(1);
  }

  console.log(`   Stores: ${configs.map((c) => c.slug.toUpperCase()).join(", ")}`);
  console.log(`   Features:`);
  console.log(`     1. Collection images + SEO descriptions (all collections)`);
  console.log(`     2. Contact page content (email, hours, FAQ link)`);
  console.log(`     3. Store-specific discount codes (GLOW10/AURAE10/NEST10)`);
  console.log(`     4. Product SEO metadata (title tags + meta descriptions)`);
  console.log(`     5. Manual step checklist (policies, checkout, domain)\n`);

  for (const cfg of configs) {
    await processStore(cfg);
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log("✅ All stores perfected!");
  console.log(`${"═".repeat(60)}\n`);

  console.log("📋 VERIFICATION CHECKLIST:");
  console.log("   □ Collections: Visit /collections — each has an image and description");
  console.log("   □ Contact: Visit /pages/contact — shows email, hours, FAQ link");
  console.log("   □ Discounts: Try GLOW10/AURAE10/NEST10 at checkout → 10% off");
  console.log("   □ SEO: View page source on any product → <title> and <meta description> present");
  console.log("   □ Policies: Manually set in Shopify Admin → Settings → Policies");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  });
