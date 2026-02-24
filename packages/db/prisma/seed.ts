import { PrismaClient, AdminRole, SupplierType } from "@prisma/client";
import { hash } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return hash("sha256", password);
}

// ─── Product Data ─────────────────────────────────────────────

interface VariantData {
  sku: string;
  name: string;
  costPrice: number;
  retailPrice: number;
  compareAtPrice?: number;
  stock: number;
  weight: number;
}

interface ImageData {
  url: string;
  alt: string;
}

interface ProductData {
  title: string;
  description: string;
  supplierType: SupplierType;
  supplierUrl?: string;
  supplierProductId?: string;
  baseCost: number;
  category: string;
  tags: string[];
  variants: VariantData[];
  images: ImageData[];
  storeIndex: number; // 0=glowhaven, 1=aurae, 2=nestwell
  isFeatured: boolean;
  position: number;
}

function unsplash(id: string): string {
  return `https://images.unsplash.com/${id}?w=800&h=800&fit=crop&q=80`;
}

const products: ProductData[] = [
  // ═══════════════════════════════════════════════════════════
  // GLOWHAVEN — Beauty / Skincare (20 products)
  // ═══════════════════════════════════════════════════════════
  {
    title: "Peeling Exfoliating Serum",
    description:
      "Gentle AHA/BHA peeling serum for smooth, radiant skin. Removes dead skin cells and unclogs pores for a glass-skin finish.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/facial-exfoliating-serum-repair-hyaluronic-acid-facial-skin-care-30ml-p-1514435521135783936.html",
    supplierProductId: "1514435521135783936",
    baseCost: 4.5,
    category: "Skincare",
    tags: ["serum", "exfoliant", "glass-skin", "aha", "bha"],
    variants: [
      { sku: "GH-PEEL-30ML", name: "30ml", costPrice: 4.5, retailPrice: 24.99, compareAtPrice: 32.99, stock: 100, weight: 0.15 },
    ],
    images: [
      { url: unsplash("photo-1693734488312-87b12f1cbac2"), alt: "Peeling Exfoliating Serum bottle" },
      { url: unsplash("photo-1767256046031-743d33937c4e"), alt: "Peeling Exfoliating Serum product" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 0,
  },
  {
    title: "LED Light Therapy Face Mask",
    description:
      "7-color LED therapy mask for anti-aging, acne treatment, and skin rejuvenation. Professional-grade at-home skincare device.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/led-face-mask-facial-care-tool-red-light-therapy-mask-for-face-for-home-travel-p-1938842441202827265.html",
    supplierProductId: "1938842441202827265",
    baseCost: 18.0,
    category: "Tools",
    tags: ["led", "face-mask", "anti-aging", "therapy", "device"],
    variants: [
      { sku: "GH-LED-MASK", name: "Standard", costPrice: 18.0, retailPrice: 69.99, compareAtPrice: 89.99, stock: 50, weight: 0.45 },
    ],
    images: [
      { url: unsplash("photo-1637920447022-87655fb06f58"), alt: "LED Light Therapy Face Mask" },
      { url: unsplash("photo-1643032530381-ca4945a4638f"), alt: "LED Face Mask glowing" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 1,
  },
  {
    title: "Ice Roller Face Massager",
    description:
      "Stainless steel ice roller for de-puffing, pore tightening, and soothing redness. Keep in freezer for an instant cryo facial at home.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/ice-roller-massager-facial-ice-head-roller-massage-p-2407110543301603300.html",
    supplierProductId: "2407110543301603300",
    baseCost: 2.8,
    category: "Tools",
    tags: ["ice-roller", "de-puff", "facial-tool", "cryo", "skincare-tool"],
    variants: [
      { sku: "GH-ICER-PINK", name: "Pink", costPrice: 2.8, retailPrice: 12.99, compareAtPrice: 18.99, stock: 300, weight: 0.18 },
      { sku: "GH-ICER-WHITE", name: "White", costPrice: 2.8, retailPrice: 12.99, compareAtPrice: 18.99, stock: 300, weight: 0.18 },
    ],
    images: [
      { url: unsplash("photo-1722350766824-f8520e9676ac"), alt: "Ice Roller Face Massager" },
      { url: unsplash("photo-1722351053599-fd3adf134c61"), alt: "Ice Roller skincare tool" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 2,
  },
  {
    title: "Rose Quartz Gua Sha & Jade Roller Set",
    description:
      "Premium rose quartz gua sha stone paired with a dual-ended jade roller. Promotes lymphatic drainage, reduces puffiness, and sculpts facial contours. Gift-boxed.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-rose-quartz-gua-sha-jade-roller-set.html",
    baseCost: 3.5,
    category: "Tools",
    tags: ["gua-sha", "jade-roller", "rose-quartz", "facial-massage", "gift-set"],
    variants: [
      { sku: "GH-GUAJ-ROSE", name: "Rose Quartz", costPrice: 3.5, retailPrice: 16.99, compareAtPrice: 24.99, stock: 250, weight: 0.22 },
      { sku: "GH-GUAJ-GREEN", name: "Green Jade", costPrice: 3.5, retailPrice: 16.99, compareAtPrice: 24.99, stock: 250, weight: 0.22 },
    ],
    images: [
      { url: unsplash("photo-1678565555430-f8640bf41628"), alt: "Rose Quartz Gua Sha and Jade Roller" },
      { url: unsplash("photo-1591918185368-d6fae07c0630"), alt: "Gua Sha stone close-up" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 3,
  },
  {
    title: "Snail Mucin 96% Power Repairing Essence",
    description:
      "K-beauty cult favorite. 96% snail secretion filtrate repairs damaged skin, fades dark spots, and delivers intense hydration for the ultimate glass skin glow.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/creativity-snail-mucin-set-p-1688366418749820928.html",
    supplierProductId: "1688366418749820928",
    baseCost: 5.2,
    category: "Skincare",
    tags: ["snail-mucin", "essence", "k-beauty", "glass-skin", "hydrating"],
    variants: [
      { sku: "GH-SNML-100ML", name: "100ml", costPrice: 5.2, retailPrice: 22.99, compareAtPrice: 29.99, stock: 180, weight: 0.18 },
    ],
    images: [
      { url: unsplash("photo-1610109790326-9a21dfe969b7"), alt: "Snail Mucin Essence bottle" },
      { url: unsplash("photo-1647859157131-246f0ce05634"), alt: "Snail Mucin skincare" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 4,
  },
  {
    title: "20% Vitamin C Brightening Serum",
    description:
      "High-potency L-ascorbic acid serum with hyaluronic acid and vitamin E. Targets dark spots, uneven tone, and dullness. Visible results in 2 weeks.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/vitamin-c-serum-vc-30ml-p-1A50D498-9C28-40C3-B209-16530EE787BC.html",
    supplierProductId: "1A50D498-9C28-40C3-B209-16530EE787BC",
    baseCost: 3.8,
    category: "Skincare",
    tags: ["vitamin-c", "brightening", "serum", "dark-spots", "anti-aging"],
    variants: [
      { sku: "GH-VITC-30ML", name: "30ml", costPrice: 3.8, retailPrice: 18.99, compareAtPrice: 24.99, stock: 200, weight: 0.12 },
      { sku: "GH-VITC-60ML", name: "60ml", costPrice: 5.5, retailPrice: 28.99, compareAtPrice: 36.99, stock: 120, weight: 0.2 },
    ],
    images: [
      { url: unsplash("photo-1648139347040-857f024f8da4"), alt: "Vitamin C Brightening Serum bottle" },
      { url: unsplash("photo-1614858819016-2d5e6006f29a"), alt: "Vitamin C serum dropper" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 5,
  },
  {
    title: "Professional Derma Pen Microneedling Device",
    description:
      "Adjustable needle depth (0.25-2.0mm) electric microneedling pen for collagen induction, scar reduction, and product absorption. Includes 12-pin cartridges.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-derma-roller.html",
    baseCost: 12.0,
    category: "Tools",
    tags: ["derma-pen", "microneedling", "collagen", "anti-aging", "professional"],
    variants: [
      { sku: "GH-DRMP-STD", name: "Device + 3 Cartridges", costPrice: 12.0, retailPrice: 44.99, compareAtPrice: 59.99, stock: 80, weight: 0.25 },
      { sku: "GH-DRMP-PRO", name: "Device + 7 Cartridges", costPrice: 15.0, retailPrice: 59.99, compareAtPrice: 79.99, stock: 50, weight: 0.3 },
    ],
    images: [
      { url: unsplash("photo-1655361166052-a65fa7633820"), alt: "Derma Pen Microneedling Device" },
      { url: unsplash("photo-1609009631378-8b8be31f84fb"), alt: "Microneedling pen with cartridges" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 6,
  },
  {
    title: "Peel-Off Hydro Jelly Face Mask Kit",
    description:
      "Salon-grade peel-off jelly mask powder kit. Mix, apply, and peel for deeply hydrated, bouncy skin. Includes mixing bowl and spatula. 6 treatments per jar.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-jelly-mask-peel-off.html",
    baseCost: 4.0,
    category: "Masks",
    tags: ["jelly-mask", "peel-off", "hydrating", "spa", "k-beauty"],
    variants: [
      { sku: "GH-JELY-ROSE", name: "Rose", costPrice: 4.0, retailPrice: 16.99, compareAtPrice: 22.99, stock: 150, weight: 0.35 },
      { sku: "GH-JELY-GOLD", name: "24K Gold", costPrice: 4.5, retailPrice: 18.99, compareAtPrice: 24.99, stock: 150, weight: 0.35 },
      { sku: "GH-JELY-LAVEN", name: "Lavender", costPrice: 4.0, retailPrice: 16.99, compareAtPrice: 22.99, stock: 150, weight: 0.35 },
    ],
    images: [
      { url: unsplash("photo-1670201203150-bf8771401590"), alt: "Hydro Jelly Face Mask Kit" },
      { url: unsplash("photo-1670201202784-ec638a82bca8"), alt: "Jelly mask application" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 7,
  },
  {
    title: "Electric Silicone Face Cleansing Brush",
    description:
      "Sonic vibration silicone cleansing brush with 5 speed settings. Waterproof, USB-rechargeable. Deep cleans pores while being gentle on sensitive skin.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/silicone-face-cleansing-brush-sonic-vibration-p-1457892610235678720.html",
    supplierProductId: "1457892610235678720",
    baseCost: 6.5,
    category: "Tools",
    tags: ["cleansing-brush", "sonic", "silicone", "pore-cleaner", "electric"],
    variants: [
      { sku: "GH-CLBR-PINK", name: "Pink", costPrice: 6.5, retailPrice: 24.99, compareAtPrice: 34.99, stock: 120, weight: 0.15 },
      { sku: "GH-CLBR-MINT", name: "Mint", costPrice: 6.5, retailPrice: 24.99, compareAtPrice: 34.99, stock: 120, weight: 0.15 },
    ],
    images: [
      { url: unsplash("photo-1630325459372-36f3f86281cf"), alt: "Silicone Face Cleansing Brush" },
      { url: unsplash("photo-1666070617662-12503a064081"), alt: "Electric cleansing brush pink" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 8,
  },
  {
    title: "2.5% Retinol Anti-Aging Night Cream",
    description:
      "Encapsulated retinol night cream with peptides and squalane. Reduces fine lines, firms skin, and accelerates cell turnover while you sleep. Non-irritating formula.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/retinol-anti-aging-night-cream-moisturizer-p-1523891045129830400.html",
    supplierProductId: "1523891045129830400",
    baseCost: 4.8,
    category: "Skincare",
    tags: ["retinol", "anti-aging", "night-cream", "peptides", "firming"],
    variants: [
      { sku: "GH-RETN-50ML", name: "50ml", costPrice: 4.8, retailPrice: 19.99, compareAtPrice: 28.99, stock: 160, weight: 0.18 },
    ],
    images: [
      { url: unsplash("photo-1767360963892-3353defd6584"), alt: "Retinol Anti-Aging Night Cream" },
      { url: unsplash("photo-1594813591867-02e797aa4581"), alt: "Night cream jar on vanity" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 9,
  },
  {
    title: "Honey Lip Sleeping Mask",
    description:
      "Overnight lip repair mask with berry complex, vitamin C, and shea butter. Wake up to soft, plump, hydrated lips. K-beauty dupe for the viral lip mask trend.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-lip-sleeping-mask-honey.html",
    baseCost: 2.2,
    category: "Skincare",
    tags: ["lip-mask", "overnight", "honey", "lip-care", "k-beauty"],
    variants: [
      { sku: "GH-LIPM-HONEY", name: "Honey", costPrice: 2.2, retailPrice: 9.99, compareAtPrice: 14.99, stock: 400, weight: 0.08 },
      { sku: "GH-LIPM-BERRY", name: "Mixed Berry", costPrice: 2.2, retailPrice: 9.99, compareAtPrice: 14.99, stock: 400, weight: 0.08 },
    ],
    images: [
      { url: unsplash("photo-1730320800577-1d7e2134fc74"), alt: "Honey Lip Sleeping Mask pot" },
      { url: unsplash("photo-1667723462743-d27a9ef7dd0d"), alt: "Lip mask application" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 10,
  },
  {
    title: "24K Gold Collagen Under-Eye Patches",
    description:
      "Hydrogel under-eye patches infused with collagen, gold, and hyaluronic acid. Reduces dark circles, puffiness, and fine lines in 20 minutes. 30 pairs per jar.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/eelhoe-collagen-gold-eye-mask-firming-eye-patches-for-dark-circles-and-puffy-eyes-p-1831952624384888832.html",
    supplierProductId: "1831952624384888832",
    baseCost: 3.0,
    category: "Masks",
    tags: ["eye-patches", "collagen", "gold", "dark-circles", "hydrogel"],
    variants: [
      { sku: "GH-EYEP-GOLD", name: "24K Gold (30 pairs)", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 19.99, stock: 250, weight: 0.2 },
    ],
    images: [
      { url: unsplash("photo-1711349171739-ed8fb290d051"), alt: "Gold Collagen Under-Eye Patches" },
      { url: unsplash("photo-1646770267004-c1f630da05b7"), alt: "Eye patches in jar" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 11,
  },
  {
    title: "Korean Exfoliating Body Scrub Glove",
    description:
      "Authentic Korean Italy towel exfoliating mitt. Removes dead skin, keratosis pilaris, and ingrown hairs. The viral skin-peeling glove that shows instant results.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-korean-exfoliating-glove.html",
    baseCost: 1.5,
    category: "Body Care",
    tags: ["body-scrub", "exfoliating-glove", "korean", "kp", "body-care"],
    variants: [
      { sku: "GH-EXGL-3PK", name: "3-Pack", costPrice: 1.5, retailPrice: 7.99, compareAtPrice: 11.99, stock: 500, weight: 0.06 },
      { sku: "GH-EXGL-6PK", name: "6-Pack", costPrice: 2.8, retailPrice: 12.99, compareAtPrice: 18.99, stock: 300, weight: 0.12 },
    ],
    images: [
      { url: unsplash("photo-1691165174077-c4566ab5cdf6"), alt: "Exfoliating Body Scrub Glove" },
      { url: unsplash("photo-1606619523819-1d0ccaf5190d"), alt: "Korean scrub mitt" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 12,
  },
  {
    title: "Spa Headband & Wrist Washband Set",
    description:
      "Fluffy microfiber spa headband with matching wrist towels. Keeps hair dry and prevents water from running down arms during skincare routine.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-spa-headband-wrist-washband-set.html",
    baseCost: 2.5,
    category: "Accessories",
    tags: ["headband", "spa", "wristband", "skincare-accessory", "aesthetic"],
    variants: [
      { sku: "GH-SPAH-PINK", name: "Pink", costPrice: 2.5, retailPrice: 11.99, compareAtPrice: 16.99, stock: 350, weight: 0.1 },
      { sku: "GH-SPAH-WHITE", name: "White", costPrice: 2.5, retailPrice: 11.99, compareAtPrice: 16.99, stock: 350, weight: 0.1 },
      { sku: "GH-SPAH-LAVEN", name: "Lavender", costPrice: 2.5, retailPrice: 11.99, compareAtPrice: 16.99, stock: 350, weight: 0.1 },
    ],
    images: [
      { url: unsplash("photo-1631715053570-602a2fdcbfc6"), alt: "Spa Headband and Wrist Set" },
      { url: unsplash("photo-1731514908704-43ce3a5de4e9"), alt: "Fluffy spa headband" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 13,
  },
  {
    title: "Glass Skin Dewy SPF 50+ Sunscreen",
    description:
      "Weightless K-beauty sunscreen with a dewy glass-skin finish. No white cast, no pilling. PA++++ broad spectrum protection with centella and niacinamide.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/spf50-sunscreen-dewy-glass-skin-finish-p-1562340891023945728.html",
    supplierProductId: "1562340891023945728",
    baseCost: 4.0,
    category: "Skincare",
    tags: ["sunscreen", "spf50", "glass-skin", "k-beauty", "dewy"],
    variants: [
      { sku: "GH-SPF-50ML", name: "50ml", costPrice: 4.0, retailPrice: 18.99, compareAtPrice: 26.99, stock: 200, weight: 0.12 },
    ],
    images: [
      { url: unsplash("photo-1741896135701-f4fbb6c3953d"), alt: "Glass Skin SPF 50 Sunscreen" },
      { url: unsplash("photo-1686831451910-be038fcaa48c"), alt: "Dewy sunscreen tube" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 14,
  },
  {
    title: "Nano Ionic Facial Steamer",
    description:
      "Professional-grade nano ionic facial steamer that produces ultra-fine steam particles 10x more effective at penetrating pores than regular steam. Large water tank for 15+ minutes of continuous steaming. Deep cleanses, detoxifies, and enhances product absorption.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/nano-ionic-facial-steamer-moisturizing-p-1489201653045288960.html",
    supplierProductId: "1489201653045288960",
    baseCost: 11.0,
    category: "Tools",
    tags: ["facial-steamer", "nano-ionic", "pore-cleansing", "spa", "self-care"],
    variants: [
      { sku: "GH-STMR-WHITE", name: "White", costPrice: 11.0, retailPrice: 44.99, compareAtPrice: 59.99, stock: 70, weight: 0.65 },
      { sku: "GH-STMR-PINK", name: "Pink", costPrice: 11.0, retailPrice: 44.99, compareAtPrice: 59.99, stock: 70, weight: 0.65 },
    ],
    images: [
      { url: unsplash("photo-1616394584738-fc6e612e71b9"), alt: "Nano Ionic Facial Steamer" },
      { url: unsplash("photo-1570172619644-dfd03ed5d881"), alt: "Facial steamer in use" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 15,
  },
  {
    title: "Silk Heatless Curling Ribbon Set",
    description:
      "Premium satin heatless curling ribbon with scrunchies and styling clips. Wrap damp hair before bed and wake up with bouncy, defined curls — zero heat damage. Includes silk scrunchie, curling rod, and clips in a reusable pouch.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-heatless-curling-ribbon-silk.html",
    baseCost: 3.0,
    category: "Hair Care",
    tags: ["heatless-curls", "silk", "curling-ribbon", "hair-care", "no-damage"],
    variants: [
      { sku: "GH-CURL-PINK", name: "Pink", costPrice: 3.0, retailPrice: 22.99, compareAtPrice: 29.99, stock: 250, weight: 0.1 },
      { sku: "GH-CURL-BLACK", name: "Black", costPrice: 3.0, retailPrice: 22.99, compareAtPrice: 29.99, stock: 250, weight: 0.1 },
      { sku: "GH-CURL-CHAMP", name: "Champagne", costPrice: 3.0, retailPrice: 22.99, compareAtPrice: 29.99, stock: 250, weight: 0.1 },
    ],
    images: [
      { url: unsplash("photo-1522337360788-8b13dee7a37e"), alt: "Silk Heatless Curling Ribbon Set" },
      { url: unsplash("photo-1519699047748-de8e457a634e"), alt: "Heatless curls result" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 16,
  },
  {
    title: "22-Momme Mulberry Silk Beauty Pillowcase",
    description:
      "100% Grade 6A mulberry silk pillowcase in 22-momme weight with hidden zipper closure. Reduces hair breakage, prevents sleep creases, and helps skin retain moisture overnight. Hypoallergenic and temperature-regulating.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-22-momme-mulberry-silk-pillowcase.html",
    baseCost: 6.5,
    category: "Beauty Sleep",
    tags: ["silk-pillowcase", "mulberry-silk", "beauty-sleep", "anti-wrinkle", "hair-care"],
    variants: [
      { sku: "GH-SILK-IVORY", name: "Ivory - Standard", costPrice: 6.5, retailPrice: 34.99, compareAtPrice: 44.99, stock: 150, weight: 0.2 },
      { sku: "GH-SILK-BLUSH", name: "Blush - Standard", costPrice: 6.5, retailPrice: 34.99, compareAtPrice: 44.99, stock: 150, weight: 0.2 },
      { sku: "GH-SILK-CHARCOAL", name: "Charcoal - Standard", costPrice: 6.5, retailPrice: 34.99, compareAtPrice: 44.99, stock: 150, weight: 0.2 },
    ],
    images: [
      { url: unsplash("photo-1631049307264-da0ec9d70304"), alt: "Mulberry Silk Pillowcase" },
      { url: unsplash("photo-1629140727571-9b5c6f6267b4"), alt: "Silk pillowcase on bed" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 17,
  },
  {
    title: "Ultrasonic Facial Skin Scrubber",
    description:
      "Rechargeable ultrasonic skin spatula with 28,000 Hz vibrations. 4 modes: deep cleansing, nutrient infusion, EMS lifting, and moisture mode. Stainless steel spatula gently exfoliates, removes blackheads, and pushes serums deeper into skin. USB-C rechargeable.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/ultrasonic-skin-scrubber-facial-peeling-ems-p-1501823940123598848.html",
    supplierProductId: "1501823940123598848",
    baseCost: 8.0,
    category: "Tools",
    tags: ["skin-scrubber", "ultrasonic", "ems", "blackhead-removal", "pore-cleaner"],
    variants: [
      { sku: "GH-SCRB-WHITE", name: "White", costPrice: 8.0, retailPrice: 34.99, compareAtPrice: 44.99, stock: 100, weight: 0.12 },
      { sku: "GH-SCRB-GOLD", name: "Gold", costPrice: 8.0, retailPrice: 34.99, compareAtPrice: 44.99, stock: 100, weight: 0.12 },
    ],
    images: [
      { url: unsplash("photo-1616394584738-fc6e612e71b9"), alt: "Ultrasonic Facial Skin Scrubber" },
      { url: unsplash("photo-1598440947619-2c35fc9aa908"), alt: "Skin scrubber tool" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 18,
  },
  {
    title: "Hydra-Plump Crystal Lip Oil",
    description:
      "Moisturizing lip oil with a crystal-clear, non-sticky finish that hydrates, plumps, and adds a glass-like shine. Infused with vitamin E, jojoba oil, and hyaluronic acid. The affordable dupe for the viral Dior Lip Oil trend.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-crystal-lip-oil-plumping.html",
    baseCost: 1.5,
    category: "Skincare",
    tags: ["lip-oil", "plumping", "hydrating", "glass-lips", "clean-girl"],
    variants: [
      { sku: "GH-LIPO-CLEAR", name: "Crystal Clear", costPrice: 1.5, retailPrice: 12.99, compareAtPrice: 16.99, stock: 500, weight: 0.04 },
      { sku: "GH-LIPO-ROSE", name: "Rose Tint", costPrice: 1.5, retailPrice: 12.99, compareAtPrice: 16.99, stock: 500, weight: 0.04 },
      { sku: "GH-LIPO-BERRY", name: "Berry Tint", costPrice: 1.5, retailPrice: 12.99, compareAtPrice: 16.99, stock: 500, weight: 0.04 },
    ],
    images: [
      { url: unsplash("photo-1586495777744-4413f21062fa"), alt: "Crystal Lip Oil" },
      { url: unsplash("photo-1631214524020-7e18db9a8f92"), alt: "Lip oil application" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 19,
  },

  // ═══════════════════════════════════════════════════════════
  // AURAE — Jewelry / Accessories (20 products)
  // ═══════════════════════════════════════════════════════════
  {
    title: "Hidden Love Projection Necklace",
    description:
      'Elegant gold-plated necklace with a hidden photo projection. Light shines through the pendant to reveal a custom "I Love You" message.',
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/necklace-nano-projection-customized-color-picture-photo-p-1425758597723328512.html",
    supplierProductId: "1425758597723328512",
    baseCost: 4.0,
    category: "Necklaces",
    tags: ["necklace", "projection", "gift", "love", "gold"],
    variants: [
      { sku: "AU-PROJ-GOLD", name: "Gold", costPrice: 4.0, retailPrice: 29.99, compareAtPrice: 39.99, stock: 200, weight: 0.05 },
      { sku: "AU-PROJ-SILVER", name: "Silver", costPrice: 4.0, retailPrice: 29.99, compareAtPrice: 39.99, stock: 200, weight: 0.05 },
    ],
    images: [
      { url: unsplash("photo-1763256614647-14abbc578252"), alt: "Hidden Love Projection Necklace" },
      { url: unsplash("photo-1671663906664-9586041c3aa1"), alt: "Gold projection pendant" },
    ],
    storeIndex: 1,
    isFeatured: true,
    position: 0,
  },
  {
    title: "18K Gold-Plated Chunky Hoop Earrings",
    description:
      "Bold, lightweight 18K gold-plated hoops that elevate any outfit. Tarnish-resistant with a high-polish finish. The everyday hoop that goes with everything.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-chunky-hoop-earrings-18k-gold-plated.html",
    baseCost: 3.5,
    category: "Earrings",
    tags: ["hoops", "gold", "chunky", "everyday", "tarnish-resistant"],
    variants: [
      { sku: "AU-HOOP-25MM", name: "25mm - Gold", costPrice: 3.5, retailPrice: 16.99, compareAtPrice: 22.99, stock: 300, weight: 0.02 },
      { sku: "AU-HOOP-35MM", name: "35mm - Gold", costPrice: 3.8, retailPrice: 18.99, compareAtPrice: 24.99, stock: 250, weight: 0.03 },
      { sku: "AU-HOOP-25SLV", name: "25mm - Silver", costPrice: 3.5, retailPrice: 16.99, compareAtPrice: 22.99, stock: 300, weight: 0.02 },
    ],
    images: [
      { url: unsplash("photo-1708389828544-b394501c5700"), alt: "Gold Chunky Hoop Earrings" },
      { url: unsplash("photo-1708389828307-53f7813cbd0c"), alt: "18K hoop earrings pair" },
    ],
    storeIndex: 1,
    isFeatured: true,
    position: 1,
  },
  {
    title: "Dainty Birth Flower Pendant Necklace",
    description:
      "Delicate gold-plated pendant engraved with your birth month flower. Adjustable 16-18 inch chain. The perfect personalized gift for birthdays and anniversaries.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-birth-flower-necklace.html",
    baseCost: 3.0,
    category: "Necklaces",
    tags: ["birth-flower", "pendant", "personalized", "gift", "dainty"],
    variants: [
      { sku: "AU-BFLR-GOLD", name: "Gold", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 22.99, stock: 400, weight: 0.02 },
      { sku: "AU-BFLR-SILVER", name: "Silver", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 22.99, stock: 400, weight: 0.02 },
      { sku: "AU-BFLR-ROSE", name: "Rose Gold", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 22.99, stock: 400, weight: 0.02 },
    ],
    images: [
      { url: unsplash("photo-1758995115518-26f90aa61b97"), alt: "Birth Flower Pendant Necklace" },
      { url: unsplash("photo-1611583027838-515a1087afdb"), alt: "Dainty gold flower pendant" },
    ],
    storeIndex: 1,
    isFeatured: true,
    position: 2,
  },
  {
    title: "Vintage Gold Signet Pinky Ring",
    description:
      "Minimalist vintage-inspired signet ring with a high-polish oval face. Stackable, tarnish-resistant. Old-money aesthetic essential.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-gold-signet-pinky-ring.html",
    baseCost: 2.5,
    category: "Rings",
    tags: ["signet", "vintage", "stackable", "old-money", "minimalist"],
    variants: [
      { sku: "AU-SGNT-6G", name: "Size 6 - Gold", costPrice: 2.5, retailPrice: 12.99, compareAtPrice: 18.99, stock: 200, weight: 0.01 },
      { sku: "AU-SGNT-7G", name: "Size 7 - Gold", costPrice: 2.5, retailPrice: 12.99, compareAtPrice: 18.99, stock: 200, weight: 0.01 },
      { sku: "AU-SGNT-8G", name: "Size 8 - Gold", costPrice: 2.5, retailPrice: 12.99, compareAtPrice: 18.99, stock: 200, weight: 0.01 },
    ],
    images: [
      { url: unsplash("photo-1758297679736-2e6ff92d2021"), alt: "Vintage Gold Signet Ring" },
      { url: unsplash("photo-1758297679778-d308606a3f51"), alt: "Gold pinky ring close-up" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 3,
  },
  {
    title: "3-Layer Gold Chain Necklace Set",
    description:
      "Pre-layered set with a choker, pendant chain, and long paperclip chain. No tangling, no fuss. Instant effortless-chic layered look in seconds.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-layered-necklace-gold.html",
    baseCost: 5.0,
    category: "Necklaces",
    tags: ["layered", "chain", "necklace-set", "choker", "paperclip"],
    variants: [
      { sku: "AU-LAYR-GOLD", name: "Gold", costPrice: 5.0, retailPrice: 24.99, compareAtPrice: 34.99, stock: 180, weight: 0.04 },
      { sku: "AU-LAYR-SILVER", name: "Silver", costPrice: 5.0, retailPrice: 24.99, compareAtPrice: 34.99, stock: 180, weight: 0.04 },
    ],
    images: [
      { url: unsplash("photo-1769909953707-31840816c5b3"), alt: "3-Layer Gold Chain Necklace Set" },
      { url: unsplash("photo-1770643661899-bf150b61789e"), alt: "Layered gold chains" },
    ],
    storeIndex: 1,
    isFeatured: true,
    position: 4,
  },
  {
    title: "Oversized Pearl Claw Clip",
    description:
      "Large acetate claw clip adorned with faux pearl accents. Strong hold for thick hair. The clean-girl hair accessory that doubles as a statement piece.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-oversized-pearl-claw-clip.html",
    baseCost: 2.2,
    category: "Hair Accessories",
    tags: ["claw-clip", "pearl", "hair-clip", "clean-girl", "oversized"],
    variants: [
      { sku: "AU-PCLW-CREAM", name: "Cream", costPrice: 2.2, retailPrice: 11.99, compareAtPrice: 16.99, stock: 350, weight: 0.04 },
      { sku: "AU-PCLW-BLACK", name: "Black Pearl", costPrice: 2.2, retailPrice: 11.99, compareAtPrice: 16.99, stock: 350, weight: 0.04 },
    ],
    images: [
      { url: unsplash("photo-1616879304294-073ce739e349"), alt: "Oversized Pearl Claw Clip" },
      { url: unsplash("photo-1657896057109-a3dfb705170c"), alt: "Pearl hair clip styling" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 5,
  },
  {
    title: "CZ Diamond Tennis Bracelet - Waterproof",
    description:
      "Sparkling cubic zirconia tennis bracelet with waterproof PVD gold plating. Shower-safe, sweat-proof, never tarnishes. Luxury look at a fraction of the price.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-tennis-bracelet-cubic-zirconia.html",
    baseCost: 6.0,
    category: "Bracelets",
    tags: ["tennis-bracelet", "cz", "waterproof", "pvd", "diamond"],
    variants: [
      { sku: "AU-TENB-GOLD", name: "Gold", costPrice: 6.0, retailPrice: 26.99, compareAtPrice: 39.99, stock: 150, weight: 0.03 },
      { sku: "AU-TENB-SILVER", name: "Silver", costPrice: 6.0, retailPrice: 26.99, compareAtPrice: 39.99, stock: 150, weight: 0.03 },
    ],
    images: [
      { url: unsplash("photo-1758297679736-2e6ff92d2021"), alt: "CZ Diamond Tennis Bracelet" },
      { url: unsplash("photo-1758297679778-d308606a3f51"), alt: "Waterproof tennis bracelet" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 6,
  },
  {
    title: "Mini Huggie Earring Set (4 Pairs)",
    description:
      "Curated set of four mini huggie hoops: plain, CZ-encrusted, twisted, and beaded. Mix-and-match for stacked ear looks. Hypoallergenic, nickel-free.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-huggie-earring-set-gold.html",
    baseCost: 4.5,
    category: "Earrings",
    tags: ["huggie", "earring-set", "stacking", "hypoallergenic", "mini"],
    variants: [
      { sku: "AU-HUGG-GOLD", name: "Gold Set", costPrice: 4.5, retailPrice: 19.99, compareAtPrice: 28.99, stock: 200, weight: 0.02 },
      { sku: "AU-HUGG-SILVER", name: "Silver Set", costPrice: 4.5, retailPrice: 19.99, compareAtPrice: 28.99, stock: 200, weight: 0.02 },
    ],
    images: [
      { url: unsplash("photo-1771173652661-8245a9d94095"), alt: "Mini Huggie Earring Set" },
      { url: unsplash("photo-1705326453273-1c35d7dad309"), alt: "Gold huggie hoops set" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 7,
  },
  {
    title: "18K Gold Croissant Dome Ring",
    description:
      "The viral croissant ring with a bold twisted dome design. Comfortable fit, solid weight, luxurious look. The quiet-luxury ring that goes with everything.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-croissant-ring-gold-plated.html",
    baseCost: 3.2,
    category: "Rings",
    tags: ["croissant", "dome-ring", "quiet-luxury", "bold", "statement"],
    variants: [
      { sku: "AU-CRST-6G", name: "Size 6 - Gold", costPrice: 3.2, retailPrice: 14.99, compareAtPrice: 21.99, stock: 200, weight: 0.02 },
      { sku: "AU-CRST-7G", name: "Size 7 - Gold", costPrice: 3.2, retailPrice: 14.99, compareAtPrice: 21.99, stock: 200, weight: 0.02 },
      { sku: "AU-CRST-8G", name: "Size 8 - Gold", costPrice: 3.2, retailPrice: 14.99, compareAtPrice: 21.99, stock: 200, weight: 0.02 },
    ],
    images: [
      { url: unsplash("photo-1655707063092-5c4509de41b8"), alt: "18K Gold Croissant Dome Ring" },
      { url: unsplash("photo-1655707063473-3ee2e5b5eeb8"), alt: "Gold dome ring on hand" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 8,
  },
  {
    title: "Dainty Butterfly Charm Anklet",
    description:
      "Delicate gold chain anklet with tiny butterfly charms that catch the light. Adjustable length with 2-inch extender. Summer essential for sandal season.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-butterfly-anklet-gold.html",
    baseCost: 2.0,
    category: "Bracelets",
    tags: ["anklet", "butterfly", "dainty", "summer", "charm"],
    variants: [
      { sku: "AU-BFLY-GOLD", name: "Gold", costPrice: 2.0, retailPrice: 9.99, compareAtPrice: 14.99, stock: 400, weight: 0.01 },
      { sku: "AU-BFLY-SILVER", name: "Silver", costPrice: 2.0, retailPrice: 9.99, compareAtPrice: 14.99, stock: 400, weight: 0.01 },
    ],
    images: [
      { url: unsplash("photo-1763400126795-d83e07d3449e"), alt: "Dainty Butterfly Charm Anklet" },
      { url: unsplash("photo-1658597610657-463f08214b98"), alt: "Gold butterfly anklet" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 9,
  },
  {
    title: "Bubble Letter Initial Necklace",
    description:
      "Puffy 3D bubble letter pendant on a dainty cable chain. Bold yet playful. The personalized necklace that went viral for gifting season. A-Z available.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/bubble-letter-initial-necklace-gold-plated-p-1567823401289543680.html",
    supplierProductId: "1567823401289543680",
    baseCost: 3.5,
    category: "Necklaces",
    tags: ["initial", "bubble-letter", "personalized", "gift", "pendant"],
    variants: [
      { sku: "AU-BUBL-GOLD", name: "Gold", costPrice: 3.5, retailPrice: 16.99, compareAtPrice: 24.99, stock: 300, weight: 0.02 },
      { sku: "AU-BUBL-SILVER", name: "Silver", costPrice: 3.5, retailPrice: 16.99, compareAtPrice: 24.99, stock: 300, weight: 0.02 },
    ],
    images: [
      { url: unsplash("photo-1554392784-e86d6ec83022"), alt: "Bubble Letter Initial Necklace" },
      { url: unsplash("photo-1715838482923-70b2f1c48679"), alt: "Gold bubble letter pendant" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 10,
  },
  {
    title: "100% Mulberry Silk Scrunchie Set (6 Pack)",
    description:
      "Genuine 6A grade mulberry silk scrunchies that prevent hair breakage, creasing, and frizz. Six neutral tones in a reusable organza pouch.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-mulberry-silk-scrunchie-set.html",
    baseCost: 3.8,
    category: "Hair Accessories",
    tags: ["silk", "scrunchie", "mulberry", "hair-care", "anti-breakage"],
    variants: [
      { sku: "AU-SLKS-NEUT", name: "Neutral Tones", costPrice: 3.8, retailPrice: 18.99, compareAtPrice: 26.99, stock: 250, weight: 0.05 },
      { sku: "AU-SLKS-JEWL", name: "Jewel Tones", costPrice: 3.8, retailPrice: 18.99, compareAtPrice: 26.99, stock: 250, weight: 0.05 },
    ],
    images: [
      { url: unsplash("photo-1630243826951-3424a9523e5b"), alt: "Silk Scrunchie Set 6 Pack" },
      { url: unsplash("photo-1770457732642-505ffd11c062"), alt: "Mulberry silk scrunchies" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 11,
  },
  {
    title: "Evil Eye Protection Charm Bracelet",
    description:
      "Handcrafted evil eye bracelet with genuine cubic zirconia halo. Adjustable slider clasp fits all wrists. Meaningful gift symbolizing protection and good luck.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/evil-eye-charm-bracelet-adjustable-gold-p-1478923601234567891.html",
    supplierProductId: "1478923601234567891",
    baseCost: 3.0,
    category: "Bracelets",
    tags: ["evil-eye", "charm", "protection", "adjustable", "gift"],
    variants: [
      { sku: "AU-EVIL-GOLD", name: "Gold", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 19.99, stock: 250, weight: 0.02 },
      { sku: "AU-EVIL-SILVER", name: "Silver", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 19.99, stock: 250, weight: 0.02 },
      { sku: "AU-EVIL-ROSE", name: "Rose Gold", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 19.99, stock: 250, weight: 0.02 },
    ],
    images: [
      { url: unsplash("photo-1647638162212-51180c35deae"), alt: "Evil Eye Charm Bracelet" },
      { url: unsplash("photo-1748017741116-6c53196ba9d0"), alt: "Evil eye bracelet close-up" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 12,
  },
  {
    title: "Gold Ear Cuff Set - No Piercing Required",
    description:
      "Set of 5 clip-on ear cuffs in assorted styles: chain, CZ bar, twisted wire, huggie, and star. Create a curated ear stack without any piercings.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-ear-cuff-set-gold.html",
    baseCost: 2.8,
    category: "Earrings",
    tags: ["ear-cuff", "no-piercing", "clip-on", "stacking", "set"],
    variants: [
      { sku: "AU-ECUF-GOLD", name: "Gold (5-piece)", costPrice: 2.8, retailPrice: 13.99, compareAtPrice: 19.99, stock: 300, weight: 0.02 },
      { sku: "AU-ECUF-SILVER", name: "Silver (5-piece)", costPrice: 2.8, retailPrice: 13.99, compareAtPrice: 19.99, stock: 300, weight: 0.02 },
    ],
    images: [
      { url: unsplash("photo-1771173652661-8245a9d94095"), alt: "Gold Ear Cuff Set" },
      { url: unsplash("photo-1671644730555-916aa8d8157f"), alt: "Ear cuffs on ear" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 13,
  },
  {
    title: "Flat Herringbone Chain Necklace",
    description:
      "Sleek, flat herringbone chain with a liquid-gold drape. The sophisticated everyday necklace that layers beautifully or stuns alone. PVD waterproof coating.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-herringbone-chain-necklace-gold.html",
    baseCost: 4.5,
    category: "Necklaces",
    tags: ["herringbone", "chain", "flat", "waterproof", "everyday"],
    variants: [
      { sku: "AU-HERB-16G", name: '16" - Gold', costPrice: 4.5, retailPrice: 21.99, compareAtPrice: 29.99, stock: 180, weight: 0.03 },
      { sku: "AU-HERB-18G", name: '18" - Gold', costPrice: 5.0, retailPrice: 23.99, compareAtPrice: 32.99, stock: 180, weight: 0.04 },
      { sku: "AU-HERB-16S", name: '16" - Silver', costPrice: 4.5, retailPrice: 21.99, compareAtPrice: 29.99, stock: 180, weight: 0.03 },
    ],
    images: [
      { url: unsplash("photo-1761211106346-939cb32005d7"), alt: "Flat Herringbone Chain Necklace" },
      { url: unsplash("photo-1558038785-4fe65c791c99"), alt: "Gold herringbone chain" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 14,
  },
  {
    title: "Personalized Script Name Necklace",
    description:
      "Custom cursive script name necklace in stainless steel with 18K gold plating. Made to order with any name or word. Adjustable 16-20 inch chain. The ultimate personalized gift for birthdays, anniversaries, and holidays.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/custom-name-necklace-personalized-script-gold-p-1534892710345678912.html",
    supplierProductId: "1534892710345678912",
    baseCost: 4.5,
    category: "Necklaces",
    tags: ["name-necklace", "personalized", "custom", "script", "gift"],
    variants: [
      { sku: "AU-NAME-GOLD", name: "Gold", costPrice: 4.5, retailPrice: 29.99, compareAtPrice: 39.99, stock: 200, weight: 0.02 },
      { sku: "AU-NAME-SILVER", name: "Silver", costPrice: 4.5, retailPrice: 29.99, compareAtPrice: 39.99, stock: 200, weight: 0.02 },
      { sku: "AU-NAME-ROSE", name: "Rose Gold", costPrice: 4.5, retailPrice: 29.99, compareAtPrice: 39.99, stock: 200, weight: 0.02 },
    ],
    images: [
      { url: unsplash("photo-1611591437281-460bfbe1220a"), alt: "Personalized Script Name Necklace" },
      { url: unsplash("photo-1515562141589-67f0d569b34e"), alt: "Custom gold name pendant" },
    ],
    storeIndex: 1,
    isFeatured: true,
    position: 15,
  },
  {
    title: "Baroque Freshwater Pearl Pendant Necklace",
    description:
      "A single organic-shaped baroque freshwater pearl pendant on a dainty gold-plated stainless steel chain. Each pearl is unique in shape, making every piece one-of-a-kind. Minimalist elegance inspired by the Vivienne Westwood pearl trend.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-baroque-pearl-pendant-necklace.html",
    baseCost: 2.5,
    category: "Necklaces",
    tags: ["pearl", "baroque", "freshwater", "pendant", "minimalist"],
    variants: [
      { sku: "AU-BPRL-GOLD", name: "Gold Chain", costPrice: 2.5, retailPrice: 22.99, compareAtPrice: 29.99, stock: 250, weight: 0.02 },
      { sku: "AU-BPRL-SILVER", name: "Silver Chain", costPrice: 2.5, retailPrice: 22.99, compareAtPrice: 29.99, stock: 250, weight: 0.02 },
    ],
    images: [
      { url: unsplash("photo-1611107683227-e9060eccd846"), alt: "Baroque Pearl Pendant Necklace" },
      { url: unsplash("photo-1573408301185-9146fe634ad0"), alt: "Pearl pendant close-up" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 16,
  },
  {
    title: "Adjustable Birthstone Ring",
    description:
      "Delicate adjustable ring featuring a colored cubic zirconia stone for your birth month. Set in 18K gold-plated or sterling silver. The adjustable design eliminates sizing issues — perfect for gifting. Available in all 12 birth months.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/adjustable-birthstone-ring-cz-gold-plated-p-1512345678901234567.html",
    supplierProductId: "1512345678901234567",
    baseCost: 2.5,
    category: "Rings",
    tags: ["birthstone", "adjustable", "personalized", "gift", "cz"],
    variants: [
      { sku: "AU-BSTN-GOLD", name: "Gold", costPrice: 2.5, retailPrice: 18.99, compareAtPrice: 26.99, stock: 300, weight: 0.01 },
      { sku: "AU-BSTN-SILVER", name: "Silver", costPrice: 2.5, retailPrice: 18.99, compareAtPrice: 26.99, stock: 300, weight: 0.01 },
      { sku: "AU-BSTN-ROSE", name: "Rose Gold", costPrice: 2.5, retailPrice: 18.99, compareAtPrice: 26.99, stock: 300, weight: 0.01 },
    ],
    images: [
      { url: unsplash("photo-1605100804763-247f67b3557e"), alt: "Adjustable Birthstone Ring" },
      { url: unsplash("photo-1603561596112-0a132b757442"), alt: "Birthstone ring on hand" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 17,
  },
  {
    title: "Zodiac Constellation Layering Necklace Set",
    description:
      "Two-piece necklace set featuring a zodiac sign pendant on a shorter chain and a constellation star-map disc on a longer chain. Gold-plated stainless steel with engraved details. Wear layered or separately. All 12 signs available.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-zodiac-constellation-necklace-set.html",
    baseCost: 3.0,
    category: "Necklaces",
    tags: ["zodiac", "constellation", "layering-set", "astrology", "personalized"],
    variants: [
      { sku: "AU-ZODC-GOLD", name: "Gold", costPrice: 3.0, retailPrice: 24.99, compareAtPrice: 34.99, stock: 250, weight: 0.03 },
      { sku: "AU-ZODC-SILVER", name: "Silver", costPrice: 3.0, retailPrice: 24.99, compareAtPrice: 34.99, stock: 250, weight: 0.03 },
    ],
    images: [
      { url: unsplash("photo-1602173574767-37ac01994b2a"), alt: "Zodiac Constellation Necklace Set" },
      { url: unsplash("photo-1611085583191-a3b181a88401"), alt: "Zodiac pendant close-up" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 18,
  },
  {
    title: "Cuban Link Chain Bracelet - Unisex",
    description:
      "Bold Cuban link chain bracelet in 18K PVD gold-plated stainless steel. Unisex design with a secure fold-over clasp. Waterproof and built for everyday wear. Available in 5mm and 8mm widths for subtle or statement styling.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-cuban-link-bracelet-gold-stainless-steel.html",
    baseCost: 2.8,
    category: "Bracelets",
    tags: ["cuban-link", "chain", "unisex", "waterproof", "streetwear"],
    variants: [
      { sku: "AU-CUBN-5G", name: "5mm - Gold", costPrice: 2.8, retailPrice: 19.99, compareAtPrice: 26.99, stock: 200, weight: 0.03 },
      { sku: "AU-CUBN-8G", name: "8mm - Gold", costPrice: 3.5, retailPrice: 24.99, compareAtPrice: 32.99, stock: 150, weight: 0.05 },
      { sku: "AU-CUBN-5S", name: "5mm - Silver", costPrice: 2.8, retailPrice: 19.99, compareAtPrice: 26.99, stock: 200, weight: 0.03 },
    ],
    images: [
      { url: unsplash("photo-1611591437281-460bfbe1220a"), alt: "Cuban Link Chain Bracelet" },
      { url: unsplash("photo-1573408301185-9146fe634ad0"), alt: "Gold Cuban link on wrist" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 19,
  },

  // ═══════════════════════════════════════════════════════════
  // NESTWELL — Home Decor / Cozy Living (20 products)
  // ═══════════════════════════════════════════════════════════
  {
    title: "Rain Cloud Aroma Diffuser",
    description:
      "Mesmerizing rain cloud humidifier with water dripping effect. Includes essential oil diffuser, LED mood light, and whisper-quiet operation.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/new-rain-cloud-humidifier-aromatherapy-machine-air-humidifier-ultrasonic-aroma-diffuser-p-1686619034869051392.html",
    supplierProductId: "1686619034869051392",
    baseCost: 17.0,
    category: "Aromatherapy",
    tags: ["diffuser", "humidifier", "rain-cloud", "aroma", "aesthetic"],
    variants: [
      { sku: "NW-RAIN-WHITE", name: "White", costPrice: 17.0, retailPrice: 54.99, compareAtPrice: 69.99, stock: 75, weight: 0.8 },
    ],
    images: [
      { url: unsplash("photo-1748723594319-142e211b46a9"), alt: "Rain Cloud Aroma Diffuser" },
      { url: unsplash("photo-1664789081413-a5ccc159e4b3"), alt: "Cloud diffuser with mist" },
    ],
    storeIndex: 2,
    isFeatured: true,
    position: 0,
  },
  {
    title: "Sunset Lamp Projector",
    description:
      "360-degree rotating sunset projection lamp that casts a warm golden-hour glow on any wall. USB-powered with adjustable brightness. The viral TikTok lamp.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/sunset-lamp-sunset-projector-mood-light-living-room-bedroom-night-light-room-decor-bar-atmosphere-photography-background-p-1433675268064677888.html",
    supplierProductId: "1433675268064677888",
    baseCost: 7.5,
    category: "Lighting",
    tags: ["sunset-lamp", "projector", "golden-hour", "tiktok", "mood-light"],
    variants: [
      { sku: "NW-SNST-WARM", name: "Warm Sunset", costPrice: 7.5, retailPrice: 29.99, compareAtPrice: 39.99, stock: 120, weight: 0.35 },
      { sku: "NW-SNST-RAIN", name: "Rainbow", costPrice: 8.0, retailPrice: 32.99, compareAtPrice: 42.99, stock: 100, weight: 0.35 },
    ],
    images: [
      { url: unsplash("photo-1760988006589-fdedcc8e0812"), alt: "Sunset Lamp Projector glow" },
      { url: unsplash("photo-1693945026391-85d23d394056"), alt: "Golden hour sunset lamp" },
    ],
    storeIndex: 2,
    isFeatured: true,
    position: 1,
  },
  {
    title: "Mushroom LED Table Lamp",
    description:
      "Retro mushroom-shaped LED lamp with touch-dimming control. Rechargeable with 8-hour battery life. Warm ambient glow for bedside, desk, or living room.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/twisted-mushroom-night-warm-light-touch-bedroom-bedhead-night-light-beech-wood-led-usb-decorative-atmosphere-lamps-home-decor-p-1747195987883462656.html",
    supplierProductId: "1747195987883462656",
    baseCost: 9.0,
    category: "Lighting",
    tags: ["mushroom-lamp", "retro", "led", "rechargeable", "touch-dimming"],
    variants: [
      { sku: "NW-MUSH-WHITE", name: "Cream White", costPrice: 9.0, retailPrice: 34.99, compareAtPrice: 44.99, stock: 90, weight: 0.4 },
      { sku: "NW-MUSH-OLIVE", name: "Olive Green", costPrice: 9.0, retailPrice: 34.99, compareAtPrice: 44.99, stock: 90, weight: 0.4 },
      { sku: "NW-MUSH-AMBER", name: "Amber", costPrice: 9.0, retailPrice: 34.99, compareAtPrice: 44.99, stock: 90, weight: 0.4 },
    ],
    images: [
      { url: unsplash("photo-1759199112433-524fbd7a4fa4"), alt: "Mushroom LED Table Lamp" },
      { url: unsplash("photo-1671061926988-6143d5ed7bc5"), alt: "Retro mushroom lamp glow" },
    ],
    storeIndex: 2,
    isFeatured: true,
    position: 2,
  },
  {
    title: "Floating Cloud Wall Shelf",
    description:
      "Whimsical cloud-shaped floating shelf for nursery, bedroom, or bathroom. Sturdy MDF construction with invisible mounting hardware. Holds up to 10 lbs.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-cloud-floating-shelf.html",
    baseCost: 8.5,
    category: "Wall Decor",
    tags: ["cloud-shelf", "floating", "nursery", "whimsical", "wall-shelf"],
    variants: [
      { sku: "NW-CLSH-WHITE", name: "White", costPrice: 8.5, retailPrice: 29.99, compareAtPrice: 39.99, stock: 80, weight: 0.9 },
      { sku: "NW-CLSH-WOOD", name: "Natural Wood", costPrice: 9.0, retailPrice: 32.99, compareAtPrice: 42.99, stock: 60, weight: 0.95 },
    ],
    images: [
      { url: unsplash("photo-1722811063764-41ecf4aebd59"), alt: "Floating Cloud Wall Shelf" },
      { url: unsplash("photo-1650453950950-5921ac3d0637"), alt: "Cloud shelf with decor" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 3,
  },
  {
    title: "Nordic Knot Throw Pillow",
    description:
      "Handwoven-look knotted decorative pillow in soft jersey fabric. Statement piece for sofas, beds, and reading nooks. Each piece has a unique artisan quality.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/nordic-knot-pillow-decorative-cushion-p-1523456789012345678.html",
    supplierProductId: "1523456789012345678",
    baseCost: 8.0,
    category: "Textiles",
    tags: ["knot-pillow", "nordic", "decorative", "throw-pillow", "cozy"],
    variants: [
      { sku: "NW-KNOT-WHITE", name: "White", costPrice: 8.0, retailPrice: 29.99, compareAtPrice: 39.99, stock: 100, weight: 0.6 },
      { sku: "NW-KNOT-SAGE", name: "Sage Green", costPrice: 8.0, retailPrice: 29.99, compareAtPrice: 39.99, stock: 100, weight: 0.6 },
      { sku: "NW-KNOT-BLUSH", name: "Blush Pink", costPrice: 8.0, retailPrice: 29.99, compareAtPrice: 39.99, stock: 100, weight: 0.6 },
    ],
    images: [
      { url: unsplash("photo-1696774276390-6ce82111140f"), alt: "Nordic Knot Throw Pillow" },
      { url: unsplash("photo-1738235455537-48e009d369a6"), alt: "Knotted pillow on sofa" },
    ],
    storeIndex: 2,
    isFeatured: true,
    position: 4,
  },
  {
    title: "360-Degree Rotating Bookshelf Tower",
    description:
      "Space-saving rotating bookshelf with 4 tiers. Holds books, plants, and decor. Smooth ball-bearing base. Assembly takes 15 minutes. The BookTok essential.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/rotating-bookshelf-tower-4-tier-p-1598234567890123456.html",
    supplierProductId: "1598234567890123456",
    baseCost: 22.0,
    category: "Organization",
    tags: ["bookshelf", "rotating", "space-saving", "booktok", "tower"],
    variants: [
      { sku: "NW-RBOK-WHITE", name: "White", costPrice: 22.0, retailPrice: 64.99, compareAtPrice: 84.99, stock: 40, weight: 4.5 },
      { sku: "NW-RBOK-WOOD", name: "Natural Wood", costPrice: 22.0, retailPrice: 64.99, compareAtPrice: 84.99, stock: 40, weight: 4.5 },
    ],
    images: [
      { url: unsplash("photo-1594085951586-67c71f896e9c"), alt: "Rotating Bookshelf Tower" },
      { url: unsplash("photo-1743357425135-41f4d94ce9b7"), alt: "Bookshelf tower with books" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 5,
  },
  {
    title: "Hand-Knit Chunky Knit Throw Blanket",
    description:
      "Ultra-thick chenille yarn throw blanket with dramatic oversized knit texture. Machine washable. The cozy aesthetic blanket seen in every Pinterest-worthy bedroom.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://www.aliexpress.us/item/3256805809702645.html",
    supplierProductId: "3256805809702645",
    baseCost: 15.0,
    category: "Textiles",
    tags: ["chunky-knit", "blanket", "throw", "cozy", "chenille"],
    variants: [
      { sku: "NW-CKNK-40-CREAM", name: '40x60" - Cream', costPrice: 15.0, retailPrice: 49.99, compareAtPrice: 64.99, stock: 60, weight: 2.0 },
      { sku: "NW-CKNK-40-GREY", name: '40x60" - Grey', costPrice: 15.0, retailPrice: 49.99, compareAtPrice: 64.99, stock: 60, weight: 2.0 },
      { sku: "NW-CKNK-60-CREAM", name: '60x80" - Cream', costPrice: 22.0, retailPrice: 69.99, compareAtPrice: 89.99, stock: 35, weight: 3.2 },
    ],
    images: [
      { url: unsplash("photo-1642853474532-9aca78f70629"), alt: "Chunky Knit Throw Blanket" },
      { url: unsplash("photo-1730098016607-d9b99238e27c"), alt: "Oversized knit blanket" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 6,
  },
  {
    title: "Hand-Poured Soy Candle Set (3 Pack)",
    description:
      "Three artisan soy wax candles in minimalist glass jars. Scents: Cashmere Vanilla, Fresh Linen, and Eucalyptus Mint. 40-hour burn time each. Cotton wicks.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-soy-candle-set-minimalist.html",
    baseCost: 6.5,
    category: "Aromatherapy",
    tags: ["soy-candle", "hand-poured", "gift-set", "minimalist", "scented"],
    variants: [
      { sku: "NW-SOYC-3PK", name: "3-Pack Sampler", costPrice: 6.5, retailPrice: 24.99, compareAtPrice: 34.99, stock: 150, weight: 0.9 },
    ],
    images: [
      { url: unsplash("photo-1571346278539-4ba0417a0ef2"), alt: "Soy Candle Set 3 Pack" },
      { url: unsplash("photo-1615174111664-cbe2de69ed9d"), alt: "Artisan soy candles" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 7,
  },
  {
    title: "Clear Acrylic Desk Organizer Set",
    description:
      "Minimalist transparent acrylic organizer with pen holder, sticky note tray, and accessory compartment. Clean desk, clean mind. Stackable modular design.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/clear-acrylic-desk-organizer-modular-p-1534567890123456789.html",
    supplierProductId: "1534567890123456789",
    baseCost: 5.5,
    category: "Organization",
    tags: ["desk-organizer", "acrylic", "minimalist", "clear", "modular"],
    variants: [
      { sku: "NW-DORG-3PC", name: "3-Piece Set", costPrice: 5.5, retailPrice: 22.99, compareAtPrice: 29.99, stock: 120, weight: 0.45 },
      { sku: "NW-DORG-5PC", name: "5-Piece Set", costPrice: 8.0, retailPrice: 32.99, compareAtPrice: 42.99, stock: 80, weight: 0.7 },
    ],
    images: [
      { url: unsplash("photo-1705417272217-490f4511abeb"), alt: "Acrylic Desk Organizer Set" },
      { url: unsplash("photo-1684061692678-68b081bbe4ef"), alt: "Clear desk organizer" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 8,
  },
  {
    title: "Dried Pampas Grass Bouquet",
    description:
      "Naturally dried fluffy pampas grass stems in a curated bouquet of 30. Adds instant boho-chic warmth to any space. Lasts forever with zero maintenance.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-dried-pampas-grass.html",
    baseCost: 5.0,
    category: "Wall Decor",
    tags: ["pampas-grass", "dried-flowers", "boho", "bouquet", "forever-flowers"],
    variants: [
      { sku: "NW-PAMP-NATRL", name: "Natural (30 stems)", costPrice: 5.0, retailPrice: 19.99, compareAtPrice: 27.99, stock: 140, weight: 0.15 },
      { sku: "NW-PAMP-WHITE", name: "White (30 stems)", costPrice: 5.0, retailPrice: 19.99, compareAtPrice: 27.99, stock: 140, weight: 0.15 },
      { sku: "NW-PAMP-BROWN", name: "Brown (30 stems)", costPrice: 5.0, retailPrice: 19.99, compareAtPrice: 27.99, stock: 140, weight: 0.15 },
    ],
    images: [
      { url: unsplash("photo-1578500383798-3255e44ab1c3"), alt: "Dried Pampas Grass Bouquet" },
      { url: unsplash("photo-1578500494198-246f612d3b3d"), alt: "Fluffy pampas grass stems" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 9,
  },
  {
    title: "Galaxy Star Projector Night Light",
    description:
      "Rotating galaxy projector with nebula clouds, star field, and moon modes. Bluetooth speaker built in. Timer and remote control. Transform any room into a galaxy.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/galaxy-star-projector-night-light-bluetooth-p-1567890123456789012.html",
    supplierProductId: "1567890123456789012",
    baseCost: 11.0,
    category: "Lighting",
    tags: ["star-projector", "galaxy", "night-light", "bluetooth", "bedroom"],
    variants: [
      { sku: "NW-STAR-BLK", name: "Black", costPrice: 11.0, retailPrice: 39.99, compareAtPrice: 54.99, stock: 80, weight: 0.45 },
      { sku: "NW-STAR-WHT", name: "White", costPrice: 11.0, retailPrice: 39.99, compareAtPrice: 54.99, stock: 80, weight: 0.45 },
    ],
    images: [
      { url: unsplash("photo-1767560682053-58aa3db436a7"), alt: "Galaxy Star Projector" },
      { url: unsplash("photo-1603726477468-da922b12b8ce"), alt: "Star projector galaxy effect" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 10,
  },
  {
    title: "Japanese Waffle Weave Bath Towel Set",
    description:
      "Ultra-absorbent, quick-dry waffle-weave towels in the Japanese minimalist style. Set includes 2 bath towels and 2 hand towels. Lightweight and lint-free.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/japanese-waffle-weave-bath-towel-set-p-1589012345678901234.html",
    supplierProductId: "1589012345678901234",
    baseCost: 10.0,
    category: "Textiles",
    tags: ["waffle-towel", "japanese", "bath-towel", "quick-dry", "minimalist"],
    variants: [
      { sku: "NW-WAFL-WHITE", name: "White", costPrice: 10.0, retailPrice: 36.99, compareAtPrice: 49.99, stock: 80, weight: 0.8 },
      { sku: "NW-WAFL-BEIGE", name: "Oat Beige", costPrice: 10.0, retailPrice: 36.99, compareAtPrice: 49.99, stock: 80, weight: 0.8 },
      { sku: "NW-WAFL-SAGE", name: "Sage", costPrice: 10.0, retailPrice: 36.99, compareAtPrice: 49.99, stock: 80, weight: 0.8 },
    ],
    images: [
      { url: unsplash("photo-1737044971301-6f478e2ab753"), alt: "Waffle Weave Bath Towel Set" },
      { url: unsplash("photo-1642680534050-1161e1929729"), alt: "Japanese waffle towels folded" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 11,
  },
  {
    title: "Ceramic Incense Waterfall Burner",
    description:
      "Mesmerizing backflow incense burner where smoke cascades downward like a waterfall. Comes with 50 incense cones. Zen meditation room essential.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-backflow-incense-burner-waterfall.html",
    baseCost: 6.0,
    category: "Aromatherapy",
    tags: ["incense-burner", "waterfall", "backflow", "ceramic", "zen"],
    variants: [
      { sku: "NW-INCW-MOUNT", name: "Mountain Style", costPrice: 6.0, retailPrice: 22.99, compareAtPrice: 32.99, stock: 120, weight: 0.5 },
      { sku: "NW-INCW-LOTUS", name: "Lotus Style", costPrice: 6.5, retailPrice: 24.99, compareAtPrice: 34.99, stock: 100, weight: 0.55 },
    ],
    images: [
      { url: unsplash("photo-1638153604846-9ace1c9186e4"), alt: "Ceramic Incense Waterfall Burner" },
      { url: unsplash("photo-1606128304826-9ff8269c72ce"), alt: "Backflow incense smoke" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 12,
  },
  {
    title: "Minimalist Adhesive Wall Hook Set (8 Pack)",
    description:
      "Damage-free adhesive hooks with a sleek Nordic design. Each holds up to 15 lbs. Perfect for towels, bags, keys, and coats. Renter-friendly, no drilling.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-adhesive-wall-hooks-minimalist.html",
    baseCost: 3.0,
    category: "Organization",
    tags: ["wall-hooks", "adhesive", "minimalist", "renter-friendly", "nordic"],
    variants: [
      { sku: "NW-HOOK-WHITE", name: "White (8 pack)", costPrice: 3.0, retailPrice: 12.99, compareAtPrice: 18.99, stock: 250, weight: 0.2 },
      { sku: "NW-HOOK-BLACK", name: "Black (8 pack)", costPrice: 3.0, retailPrice: 12.99, compareAtPrice: 18.99, stock: 250, weight: 0.2 },
      { sku: "NW-HOOK-WOOD", name: "Wood Grain (8 pack)", costPrice: 3.5, retailPrice: 14.99, compareAtPrice: 19.99, stock: 200, weight: 0.22 },
    ],
    images: [
      { url: unsplash("photo-1702550486768-10275ff853a2"), alt: "Minimalist Wall Hook Set" },
      { url: unsplash("photo-1693592398532-cb18d3b01d07"), alt: "Nordic wall hooks installed" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 13,
  },
  {
    title: "Boho Macrame Round Wall Mirror",
    description:
      "Handwoven cotton macrame frame surrounding a quality round mirror. Adds texture and warmth to entryways, bathrooms, and bedrooms. Bohemian statement piece.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/boho-macrame-round-wall-mirror-handwoven-p-1612345678901234567.html",
    supplierProductId: "1612345678901234567",
    baseCost: 10.0,
    category: "Wall Decor",
    tags: ["macrame", "mirror", "boho", "wall-mirror", "handwoven"],
    variants: [
      { sku: "NW-MACM-SM", name: 'Small (10")', costPrice: 10.0, retailPrice: 34.99, compareAtPrice: 44.99, stock: 70, weight: 0.7 },
      { sku: "NW-MACM-LG", name: 'Large (16")', costPrice: 15.0, retailPrice: 49.99, compareAtPrice: 64.99, stock: 45, weight: 1.2 },
    ],
    images: [
      { url: unsplash("photo-1748914826787-eb70f2bddb10"), alt: "Boho Macrame Wall Mirror" },
      { url: unsplash("photo-1654065428845-e677bfe2ad35"), alt: "Macrame mirror on wall" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 14,
  },
  {
    title: "3D Printed Moon Lamp with Wooden Stand",
    description:
      "3D-printed LED lamp that realistically replicates the moon's surface with craters and topographic detail. Elegant wooden stand, touch-control brightness, and 16 color options. USB rechargeable with 10-hour battery life. The perfect gift.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/3d-moon-lamp-led-night-light-wooden-stand-p-1456789012345678901.html",
    supplierProductId: "1456789012345678901",
    baseCost: 7.5,
    category: "Lighting",
    tags: ["moon-lamp", "3d-print", "led", "gift", "night-light"],
    variants: [
      { sku: "NW-MOON-15CM", name: "15cm", costPrice: 7.5, retailPrice: 29.99, compareAtPrice: 39.99, stock: 120, weight: 0.35 },
      { sku: "NW-MOON-20CM", name: "20cm", costPrice: 10.0, retailPrice: 39.99, compareAtPrice: 49.99, stock: 80, weight: 0.5 },
    ],
    images: [
      { url: unsplash("photo-1532693322450-2cb5c511067d"), alt: "3D Printed Moon Lamp" },
      { url: unsplash("photo-1614026480209-cd9934144671"), alt: "Moon lamp on wooden stand" },
    ],
    storeIndex: 2,
    isFeatured: true,
    position: 15,
  },
  {
    title: "Smart WiFi RGB LED Strip Lights (5m Kit)",
    description:
      "5-meter smart LED strip light kit with WiFi, app control, and Alexa/Google Home voice control. Music sync mode, 16 million RGB colors, timer scheduling, and self-adhesive backing. Cuttable to custom lengths. Transform any room instantly.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/led-strip-lights-rgb-5050-waterproof-flexible-ribbon-p-1390540280897343488.html",
    supplierProductId: "1390540280897343488",
    baseCost: 8.0,
    category: "Lighting",
    tags: ["led-strip", "rgb", "smart-home", "wifi", "ambient"],
    variants: [
      { sku: "NW-LEDS-5M", name: "5m Kit", costPrice: 8.0, retailPrice: 29.99, compareAtPrice: 39.99, stock: 150, weight: 0.25 },
      { sku: "NW-LEDS-10M", name: "10m Kit", costPrice: 12.0, retailPrice: 39.99, compareAtPrice: 54.99, stock: 100, weight: 0.4 },
    ],
    images: [
      { url: unsplash("photo-1614624532983-35ce04bdc80d"), alt: "RGB LED Strip Lights" },
      { url: unsplash("photo-1633113216120-53ca0a7be5bc"), alt: "LED strip room setup" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 16,
  },
  {
    title: "Silent Minimalist Scandinavian Wall Clock",
    description:
      "12-inch modern wall clock with a clean, minimal face in Scandinavian design. Silent quartz movement — no ticking. Available in matte black, white, or wood-tone. Lightweight with single-nail mounting.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-minimalist-wall-clock-silent.html",
    baseCost: 9.0,
    category: "Wall Decor",
    tags: ["wall-clock", "minimalist", "scandinavian", "silent", "modern"],
    variants: [
      { sku: "NW-CLCK-BLACK", name: "Matte Black", costPrice: 9.0, retailPrice: 34.99, compareAtPrice: 44.99, stock: 100, weight: 0.45 },
      { sku: "NW-CLCK-WHITE", name: "White", costPrice: 9.0, retailPrice: 34.99, compareAtPrice: 44.99, stock: 100, weight: 0.45 },
      { sku: "NW-CLCK-WOOD", name: "Wood Tone", costPrice: 9.5, retailPrice: 36.99, compareAtPrice: 46.99, stock: 80, weight: 0.5 },
    ],
    images: [
      { url: unsplash("photo-1563861826100-9cb868fdbe1c"), alt: "Minimalist Scandinavian Wall Clock" },
      { url: unsplash("photo-1507646227500-4d389b0012be"), alt: "Modern wall clock on wall" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 17,
  },
  {
    title: "Boho Macrame Hanging Wall Shelf Set (2 Pack)",
    description:
      "Set of two handwoven macrame rope hanging shelves with natural wood planks. Perfect for plants, candles, crystals, and picture frames. Renter-friendly — minimal wall damage. Available in cream, black, and sage rope.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-macrame-hanging-shelf.html",
    baseCost: 7.5,
    category: "Organization",
    tags: ["macrame-shelf", "hanging", "boho", "renter-friendly", "wall-decor"],
    variants: [
      { sku: "NW-MACS-CREAM", name: "Cream", costPrice: 7.5, retailPrice: 32.99, compareAtPrice: 42.99, stock: 100, weight: 0.6 },
      { sku: "NW-MACS-BLACK", name: "Black", costPrice: 7.5, retailPrice: 32.99, compareAtPrice: 42.99, stock: 100, weight: 0.6 },
      { sku: "NW-MACS-SAGE", name: "Sage", costPrice: 7.5, retailPrice: 32.99, compareAtPrice: 42.99, stock: 80, weight: 0.6 },
    ],
    images: [
      { url: unsplash("photo-1616046229478-9901c5536a45"), alt: "Boho Macrame Hanging Shelf" },
      { url: unsplash("photo-1585128792020-803d29415281"), alt: "Macrame shelf with plants" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 18,
  },
  {
    title: "Faux Eucalyptus in Ceramic Minimalist Planter",
    description:
      "Realistic artificial eucalyptus arrangement in a matte ceramic pot. Maintenance-free greenery that looks fresh year-round. 10-12 inches tall. Perfect for shelves, desks, bathrooms, and windowsills. Ceramic pot has a drainage plug for optional real plant use.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/w/wholesale-faux-eucalyptus-ceramic-planter.html",
    baseCost: 4.5,
    category: "Decor",
    tags: ["faux-plant", "eucalyptus", "ceramic", "minimalist", "greenery"],
    variants: [
      { sku: "NW-EUCL-WHITE", name: "White Pot", costPrice: 4.5, retailPrice: 22.99, compareAtPrice: 29.99, stock: 180, weight: 0.4 },
      { sku: "NW-EUCL-TERRA", name: "Terracotta Pot", costPrice: 4.5, retailPrice: 22.99, compareAtPrice: 29.99, stock: 150, weight: 0.4 },
      { sku: "NW-EUCL-SAGE", name: "Sage Pot", costPrice: 4.5, retailPrice: 22.99, compareAtPrice: 29.99, stock: 150, weight: 0.4 },
    ],
    images: [
      { url: unsplash("photo-1485955900006-10f4d324d411"), alt: "Faux Eucalyptus in Ceramic Planter" },
      { url: unsplash("photo-1459411552884-841db9b3cc2a"), alt: "Eucalyptus arrangement on shelf" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 19,
  },
];

// ─── Main Seed Function ───────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Clean up existing product data ────────────────────
  console.log("  🗑  Clearing existing product data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.storeProduct.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();

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

  // ─── Products ─────────────────────────────────────────
  const storeNames = ["GLOWHAVEN", "AURAE", "NESTWELL"];
  const counts = [0, 0, 0];

  for (const p of products) {
    await prisma.product.create({
      data: {
        title: p.title,
        description: p.description,
        supplierType: p.supplierType,
        supplierUrl: p.supplierUrl,
        supplierProductId: p.supplierProductId,
        baseCost: p.baseCost,
        category: p.category,
        tags: p.tags,
        variants: {
          create: p.variants.map((v) => ({
            sku: v.sku,
            name: v.name,
            costPrice: v.costPrice,
            retailPrice: v.retailPrice,
            compareAtPrice: v.compareAtPrice,
            stock: v.stock,
            weight: v.weight,
          })),
        },
        images: {
          create: p.images.map((img, i) => ({
            url: img.url,
            alt: img.alt,
            position: i,
          })),
        },
        storeProducts: {
          create: [
            {
              storeId: stores[p.storeIndex].id,
              isActive: true,
              isFeatured: p.isFeatured,
              position: p.position,
            },
          ],
        },
      },
    });
    counts[p.storeIndex]++;
  }

  for (let i = 0; i < 3; i++) {
    console.log(`  ✓ ${storeNames[i]}: ${counts[i]} products`);
  }

  console.log(`\n✅ Seed complete! ${products.length} products across 3 stores.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
