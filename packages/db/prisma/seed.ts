import { PrismaClient, AdminRole, SupplierType } from "@prisma/client";
import { hash } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return hash("sha256", password);
}

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Admin User ───────────────────────────────────────
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@shops.dev" },
    update: {},
    create: {
      email: "admin@shops.dev",
      name: "Admin",
      passwordHash: hashPassword("admin123"),
      role: AdminRole.OWNER,
    },
  });
  console.log(`  ✓ Admin user: ${admin.email}`);

  // ─── Stores ───────────────────────────────────────────
  const stores = await Promise.all([
    prisma.store.upsert({
      where: { slug: "glowhaven" },
      update: {},
      create: {
        name: "GLOWHAVEN",
        slug: "glowhaven",
        domain: "glowhaven.com",
        isActive: true,
        config: {
          create: {
            primaryColor: "#f8b4c8",
            secondaryColor: "#fff5f7",
            accentColor: "#e91e8c",
            fontHeading: "Playfair Display",
            fontBody: "Inter",
            metaTitle: "GLOWHAVEN — Glass Skin Beauty",
            metaDescription:
              "Premium skincare tools and serums for the glass skin aesthetic.",
            socialInstagram: "https://instagram.com/glowhaven",
          },
        },
      },
    }),
    prisma.store.upsert({
      where: { slug: "aurae" },
      update: {},
      create: {
        name: "AURAE",
        slug: "aurae",
        domain: "aurae.co",
        isActive: true,
        config: {
          create: {
            primaryColor: "#c9a84c",
            secondaryColor: "#faf8f0",
            accentColor: "#1a1a1a",
            fontHeading: "Cormorant Garamond",
            fontBody: "Inter",
            metaTitle: "AURAE — Elegant Jewelry & Accessories",
            metaDescription:
              "Affordable luxury jewelry that makes the perfect gift.",
            socialInstagram: "https://instagram.com/aurae.jewelry",
          },
        },
      },
    }),
    prisma.store.upsert({
      where: { slug: "nestwell" },
      update: {},
      create: {
        name: "NESTWELL",
        slug: "nestwell",
        domain: "nestwell.co",
        isActive: true,
        config: {
          create: {
            primaryColor: "#8b7355",
            secondaryColor: "#f5f0ea",
            accentColor: "#2d5016",
            fontHeading: "DM Serif Display",
            fontBody: "Inter",
            metaTitle: "NESTWELL — Cozy Home Aesthetic",
            metaDescription:
              "Curated home decor for the aesthetic lifestyle.",
            socialInstagram: "https://instagram.com/nestwell.home",
          },
        },
      },
    }),
  ]);
  console.log(`  ✓ Stores: ${stores.map((s) => s.name).join(", ")}`);

  // ─── Suppliers ────────────────────────────────────────
  await Promise.all([
    prisma.supplier.upsert({
      where: { type: SupplierType.CJ_DROPSHIPPING },
      update: {},
      create: {
        name: "CJ Dropshipping",
        type: SupplierType.CJ_DROPSHIPPING,
        isActive: true,
      },
    }),
    prisma.supplier.upsert({
      where: { type: SupplierType.ALIEXPRESS },
      update: {},
      create: {
        name: "AliExpress",
        type: SupplierType.ALIEXPRESS,
        isActive: true,
      },
    }),
  ]);
  console.log("  ✓ Suppliers: CJ Dropshipping, AliExpress");

  // ─── Sample Products (GLOWHAVEN) ─────────────────────
  const glowhavenStore = stores[0];

  const product1 = await prisma.product.create({
    data: {
      title: "Peeling Exfoliating Serum",
      description:
        "Gentle AHA/BHA peeling serum for smooth, radiant skin. Removes dead skin cells and unclogs pores for a glass-skin finish.",
      supplierType: SupplierType.CJ_DROPSHIPPING,
      baseCost: 4.5,
      category: "Skincare",
      tags: ["serum", "exfoliant", "glass-skin", "aha", "bha"],
      variants: {
        create: [
          {
            sku: "GH-PEEL-30ML",
            name: "30ml",
            costPrice: 4.5,
            retailPrice: 24.99,
            stock: 100,
            weight: 0.15,
          },
        ],
      },
      images: {
        create: [
          {
            url: "https://via.placeholder.com/600x600?text=Peeling+Serum",
            alt: "Peeling Exfoliating Serum",
            position: 0,
          },
        ],
      },
      storeProducts: {
        create: [
          {
            storeId: glowhavenStore.id,
            isActive: true,
            isFeatured: true,
            position: 0,
          },
        ],
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      title: "LED Light Therapy Face Mask",
      description:
        "7-color LED therapy mask for anti-aging, acne treatment, and skin rejuvenation. Professional-grade at-home skincare device.",
      supplierType: SupplierType.CJ_DROPSHIPPING,
      baseCost: 18.0,
      category: "Skincare",
      tags: ["led", "face-mask", "anti-aging", "therapy", "device"],
      variants: {
        create: [
          {
            sku: "GH-LED-MASK",
            name: "Standard",
            costPrice: 18.0,
            retailPrice: 69.99,
            stock: 50,
            weight: 0.45,
          },
        ],
      },
      images: {
        create: [
          {
            url: "https://via.placeholder.com/600x600?text=LED+Mask",
            alt: "LED Light Therapy Face Mask",
            position: 0,
          },
        ],
      },
      storeProducts: {
        create: [
          {
            storeId: glowhavenStore.id,
            isActive: true,
            isFeatured: true,
            position: 1,
          },
        ],
      },
    },
  });

  console.log(
    `  ✓ Products: ${product1.title}, ${product2.title}`
  );

  // ─── Sample Products (AURAE) ─────────────────────────
  const auraeStore = stores[1];

  const product3 = await prisma.product.create({
    data: {
      title: "Hidden Love Projection Necklace",
      description:
        'Elegant gold-plated necklace with a hidden photo projection. Light shines through the pendant to reveal a custom "I Love You" message.',
      supplierType: SupplierType.CJ_DROPSHIPPING,
      baseCost: 4.0,
      category: "Jewelry",
      tags: ["necklace", "projection", "gift", "love", "gold"],
      variants: {
        create: [
          {
            sku: "AU-PROJ-GOLD",
            name: "Gold",
            costPrice: 4.0,
            retailPrice: 29.99,
            stock: 200,
            weight: 0.05,
          },
          {
            sku: "AU-PROJ-SILVER",
            name: "Silver",
            costPrice: 4.0,
            retailPrice: 29.99,
            stock: 200,
            weight: 0.05,
          },
        ],
      },
      images: {
        create: [
          {
            url: "https://via.placeholder.com/600x600?text=Projection+Necklace",
            alt: "Hidden Love Projection Necklace",
            position: 0,
          },
        ],
      },
      storeProducts: {
        create: [
          {
            storeId: auraeStore.id,
            isActive: true,
            isFeatured: true,
            position: 0,
          },
        ],
      },
    },
  });

  console.log(`  ✓ Products: ${product3.title}`);

  // ─── Sample Products (NESTWELL) ───────────────────────
  const nestwellStore = stores[2];

  const product4 = await prisma.product.create({
    data: {
      title: "Rain Cloud Aroma Diffuser",
      description:
        "Mesmerizing rain cloud humidifier with water dripping effect. Includes essential oil diffuser, LED mood light, and whisper-quiet operation.",
      supplierType: SupplierType.CJ_DROPSHIPPING,
      baseCost: 17.0,
      category: "Home Decor",
      tags: ["diffuser", "humidifier", "rain-cloud", "aroma", "aesthetic"],
      variants: {
        create: [
          {
            sku: "NW-RAIN-WHITE",
            name: "White",
            costPrice: 17.0,
            retailPrice: 54.99,
            stock: 75,
            weight: 0.8,
          },
        ],
      },
      images: {
        create: [
          {
            url: "https://via.placeholder.com/600x600?text=Rain+Cloud+Diffuser",
            alt: "Rain Cloud Aroma Diffuser",
            position: 0,
          },
        ],
      },
      storeProducts: {
        create: [
          {
            storeId: nestwellStore.id,
            isActive: true,
            isFeatured: true,
            position: 0,
          },
        ],
      },
    },
  });

  console.log(`  ✓ Products: ${product4.title}`);
  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
