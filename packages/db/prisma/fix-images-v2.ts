import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env from monorepo root
config({ path: resolve(__dirname, "../../../.env") });

const prisma = new PrismaClient();

const pexels = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;

// ─── Shopify API helpers ─────────────────────────────────────

const API_VERSION = "2026-01";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function shopifyFetch(
  store: string,
  token: string,
  method: string,
  endpoint: string,
  body?: unknown,
): Promise<{ status: number; data: any }> {
  const url = `https://${store}/admin/api/${API_VERSION}/${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
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
    console.error(`    ❌ ${method} ${endpoint} → ${res.status}`, JSON.stringify(data?.errors ?? data, null, 2));
  }

  if (callLimit) {
    const [used, max] = callLimit.split("/").map(Number);
    if (used >= max - 5) await sleep(1000);
  }

  return { status: res.status, data };
}

interface StoreConfig {
  slug: string;
  store: string;
  token: string;
}

function getStoreConfigs(): StoreConfig[] {
  const stores: StoreConfig[] = [];
  for (const [slug, envPrefix] of [
    ["glowhaven", "SHOPIFY_GLOWHAVEN"],
    ["aurae", "SHOPIFY_AURAE"],
    ["nestwell", "SHOPIFY_NESTWELL"],
  ] as const) {
    const store = process.env[`${envPrefix}_STORE`];
    const token = process.env[`${envPrefix}_TOKEN`];
    if (store && token) {
      stores.push({ slug, store, token });
    }
  }
  return stores;
}

// ─── Image fixes ────────────────────────────────────────────

const IMAGE_FIXES: { title: string; storeSlug: string; newUrl: string }[] = [
  {
    title: "Silk Heatless Curling Ribbon Set",
    storeSlug: "glowhaven",
    newUrl: pexels(10483564),
  },
  {
    title: "Rain Cloud Aroma Diffuser",
    storeSlug: "nestwell",
    newUrl: pexels(6915261),
  },
  {
    title: "Honey Lip Sleeping Mask",
    storeSlug: "glowhaven",
    newUrl: pexels(8129894),
  },
  {
    title: "Ice Roller Face Massager",
    storeSlug: "glowhaven",
    newUrl: pexels(24738496),
  },
];

async function main() {
  console.log("═══ Fix Images v2 — DB + Shopify Sync ═══\n");

  // ─── Step 1: Update database ────────────────────────────
  console.log("1️⃣  Updating local database...\n");

  for (const fix of IMAGE_FIXES) {
    const product = await prisma.product.findFirst({
      where: { title: fix.title },
      include: { images: { orderBy: { position: "asc" } } },
    });

    if (!product) {
      console.log(`  ⚠ "${fix.title}" not found in DB, skipping`);
      continue;
    }

    if (product.images.length === 0) {
      console.log(`  ⚠ "${fix.title}" has no images, skipping`);
      continue;
    }

    // Update primary image (position 0)
    await prisma.productImage.update({
      where: { id: product.images[0].id },
      data: { url: fix.newUrl },
    });
    console.log(`  ✓ Updated "${fix.title}" image in DB`);
  }

  // ─── Step 2: Sync to Shopify ────────────────────────────
  console.log("\n2️⃣  Syncing to Shopify...\n");

  const storeConfigs = getStoreConfigs();
  if (storeConfigs.length === 0) {
    console.log("  ⚠ No Shopify store configs found. Set SHOPIFY_*_STORE and SHOPIFY_*_TOKEN env vars.");
    return;
  }

  for (const sc of storeConfigs) {
    const fixes = IMAGE_FIXES.filter((f) => f.storeSlug === sc.slug);
    if (fixes.length === 0) continue;

    console.log(`  📦 ${sc.slug} (${fixes.length} product(s) to update)`);

    for (const fix of fixes) {
      // Find the product on Shopify by title
      const searchUrl = `products.json?title=${encodeURIComponent(fix.title)}&fields=id,title,images`;
      const { data, status } = await shopifyFetch(sc.store, sc.token, "GET", searchUrl);

      if (status !== 200 || !data?.products?.length) {
        console.log(`    ⚠ "${fix.title}" not found on Shopify ${sc.slug}`);
        continue;
      }

      const shopifyProduct = data.products.find(
        (p: any) => p.title.toLowerCase() === fix.title.toLowerCase(),
      );
      if (!shopifyProduct) {
        console.log(`    ⚠ "${fix.title}" not found (exact match) on Shopify ${sc.slug}`);
        continue;
      }

      const productId = shopifyProduct.id;
      const existingImages = shopifyProduct.images || [];

      if (existingImages.length > 0) {
        // Delete existing images first, then add new one
        for (const img of existingImages) {
          await shopifyFetch(sc.store, sc.token, "DELETE", `products/${productId}/images/${img.id}.json`);
        }
      }

      // Add new image
      const { status: imgStatus } = await shopifyFetch(
        sc.store,
        sc.token,
        "POST",
        `products/${productId}/images.json`,
        { image: { src: fix.newUrl, alt: fix.title } },
      );

      if (imgStatus === 200 || imgStatus === 201) {
        console.log(`    ✓ Updated "${fix.title}" on Shopify`);
      } else {
        console.log(`    ❌ Failed to update "${fix.title}" on Shopify (status: ${imgStatus})`);
      }

      await sleep(500);
    }
  }

  console.log("\n✅ All image fixes applied!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  });
