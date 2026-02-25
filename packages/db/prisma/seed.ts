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

function pexels(id: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;
}

const products: ProductData[] = [
  // ═══════════════════════════════════════════════════════════
  // GLOWHAVEN — Beauty / Skincare (23 products)
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
      { url: pexels(30968097), alt: "Peeling Exfoliating Serum bottle" },
      { url: pexels(7321723), alt: "Peeling Exfoliating Serum product" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 15,
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
      { url: "https://images.unsplash.com/photo-1720424643388-0a5f72948ea7?w=800&q=80", alt: "Woman wearing LED light therapy face mask at home" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 7,
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
      { url: pexels(5927933), alt: "Ice Roller Face Massager" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 13,
  },
  {
    title: "Rose Quartz Gua Sha & Jade Roller Set",
    description:
      "Premium rose quartz gua sha stone paired with a dual-ended jade roller. Promotes lymphatic drainage, reduces puffiness, and sculpts facial contours. Gift-boxed.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/32917602416.html",
    supplierProductId: "32917602416",
    baseCost: 3.5,
    category: "Tools",
    tags: ["gua-sha", "jade-roller", "rose-quartz", "facial-massage", "gift-set"],
    variants: [
      { sku: "GH-GUAJ-ROSE", name: "Rose Quartz", costPrice: 3.5, retailPrice: 16.99, compareAtPrice: 24.99, stock: 250, weight: 0.22 },
      { sku: "GH-GUAJ-GREEN", name: "Green Jade", costPrice: 3.5, retailPrice: 16.99, compareAtPrice: 24.99, stock: 250, weight: 0.22 },
    ],
    images: [
      { url: pexels(6766261), alt: "Rose Quartz Gua Sha and Jade Roller" },
      { url: pexels(6663592), alt: "Rose quartz jade roller" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 2,
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
      { url: pexels(8945933), alt: "Snail Mucin Essence bottle" },
      { url: pexels(6847858), alt: "Snail Mucin skincare" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 0,
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
      { url: pexels(29977128), alt: "Vitamin C Brightening Serum bottle" },
      { url: pexels(34939744), alt: "Vitamin C serum dropper" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 10,
  },
  {
    title: "Professional Derma Pen Microneedling Device",
    description:
      "Adjustable needle depth (0.25-2.0mm) electric microneedling pen for collagen induction, scar reduction, and product absorption. Includes 12-pin cartridges.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005002839897827.html",
    supplierProductId: "1005002839897827",
    baseCost: 12.0,
    category: "Tools",
    tags: ["derma-pen", "microneedling", "collagen", "anti-aging", "professional"],
    variants: [
      { sku: "GH-DRMP-STD", name: "Device + 3 Cartridges", costPrice: 12.0, retailPrice: 44.99, compareAtPrice: 59.99, stock: 80, weight: 0.25 },
      { sku: "GH-DRMP-PRO", name: "Device + 7 Cartridges", costPrice: 15.0, retailPrice: 59.99, compareAtPrice: 79.99, stock: 50, weight: 0.3 },
    ],
    images: [
      { url: "https://images.unsplash.com/flagged/photo-1570698500117-0c1785821fe1?w=800&q=80", alt: "Derma Pen Microneedling Device" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 21,
  },
  {
    title: "Peel-Off Hydro Jelly Face Mask Kit",
    description:
      "Salon-grade peel-off jelly mask powder kit. Mix, apply, and peel for deeply hydrated, bouncy skin. Includes mixing bowl and spatula. 6 treatments per jar.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005001638446172.html",
    supplierProductId: "1005001638446172",
    baseCost: 4.0,
    category: "Masks",
    tags: ["jelly-mask", "peel-off", "hydrating", "spa", "k-beauty"],
    variants: [
      { sku: "GH-JELY-ROSE", name: "Rose", costPrice: 4.0, retailPrice: 16.99, compareAtPrice: 22.99, stock: 150, weight: 0.35 },
      { sku: "GH-JELY-GOLD", name: "24K Gold", costPrice: 4.5, retailPrice: 18.99, compareAtPrice: 24.99, stock: 150, weight: 0.35 },
      { sku: "GH-JELY-LAVEN", name: "Lavender", costPrice: 4.0, retailPrice: 16.99, compareAtPrice: 22.99, stock: 150, weight: 0.35 },
    ],
    images: [
      { url: pexels(6621339), alt: "Jelly mask powder in mixing bowl with spatula and tools" },
      { url: pexels(32565175), alt: "Face mask jar product in soft natural light" },
      { url: pexels(5069494), alt: "Jelly mask facial treatment application" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 11,
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
      { url: pexels(9775328), alt: "Silicone Face Cleansing Brush" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 17,
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
      { url: pexels(8140902), alt: "Retinol Anti-Aging Night Cream" },
      { url: pexels(3785147), alt: "Night cream jar on vanity" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 18,
  },
  {
    title: "Honey Lip Sleeping Mask",
    description:
      "Overnight lip repair mask with berry complex, vitamin C, and shea butter. Wake up to soft, plump, hydrated lips. K-beauty dupe for the viral lip mask trend.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005004042385810.html",
    supplierProductId: "1005004042385810",
    baseCost: 2.2,
    category: "Skincare",
    tags: ["lip-mask", "overnight", "honey", "lip-care", "k-beauty"],
    variants: [
      { sku: "GH-LIPM-HONEY", name: "Honey", costPrice: 2.2, retailPrice: 9.99, compareAtPrice: 14.99, stock: 400, weight: 0.08 },
      { sku: "GH-LIPM-BERRY", name: "Mixed Berry", costPrice: 2.2, retailPrice: 9.99, compareAtPrice: 14.99, stock: 400, weight: 0.08 },
    ],
    images: [
      { url: pexels(3373740), alt: "Honey Lip Sleeping Mask pot" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 9,
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
      { url: pexels(7530717), alt: "Gold Collagen Under-Eye Patches" },
      { url: pexels(6977651), alt: "Eye patches in jar" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 4,
  },
  {
    title: "Korean Exfoliating Body Scrub Glove",
    description:
      "Authentic Korean Italy towel exfoliating mitt. Removes dead skin, keratosis pilaris, and ingrown hairs. The viral skin-peeling glove that shows instant results.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005006278309981.html",
    supplierProductId: "1005006278309981",
    baseCost: 1.5,
    category: "Body Care",
    tags: ["body-scrub", "exfoliating-glove", "korean", "kp", "body-care"],
    variants: [
      { sku: "GH-EXGL-3PK", name: "3-Pack", costPrice: 1.5, retailPrice: 7.99, compareAtPrice: 11.99, stock: 500, weight: 0.06 },
      { sku: "GH-EXGL-6PK", name: "6-Pack", costPrice: 2.8, retailPrice: 12.99, compareAtPrice: 18.99, stock: 300, weight: 0.12 },
    ],
    images: [
      { url: pexels(10155377), alt: "Exfoliating Body Scrub Glove" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 14,
  },
  {
    title: "Spa Headband & Wrist Washband Set",
    description:
      "Fluffy microfiber spa headband with matching wrist towels. Keeps hair dry and prevents water from running down arms during skincare routine.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005005984083613.html",
    supplierProductId: "1005005984083613",
    baseCost: 2.5,
    category: "Accessories",
    tags: ["headband", "spa", "wristband", "skincare-accessory", "aesthetic"],
    variants: [
      { sku: "GH-SPAH-PINK", name: "Pink", costPrice: 2.5, retailPrice: 11.99, compareAtPrice: 16.99, stock: 350, weight: 0.1 },
      { sku: "GH-SPAH-WHITE", name: "White", costPrice: 2.5, retailPrice: 11.99, compareAtPrice: 16.99, stock: 350, weight: 0.1 },
      { sku: "GH-SPAH-LAVEN", name: "Lavender", costPrice: 2.5, retailPrice: 11.99, compareAtPrice: 16.99, stock: 350, weight: 0.1 },
    ],
    images: [
      { url: pexels(5927784), alt: "Woman wearing spa headband with clay face mask" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 16,
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
      { url: pexels(8157581), alt: "Glass Skin SPF 50 Sunscreen" },
      { url: pexels(5202453), alt: "Dewy sunscreen tube" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 3,
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
      { url: pexels(6915261), alt: "Nano ionic facial steamer device with mist" },
      { url: pexels(3738349), alt: "Woman receiving facial steamer treatment" },
      { url: pexels(6811364), alt: "Facial steam treatment with visible mist" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 20,
  },
  {
    title: "Silk Heatless Curling Ribbon Set",
    description:
      "Premium satin heatless curling ribbon with scrunchies and styling clips. Wrap damp hair before bed and wake up with bouncy, defined curls — zero heat damage. Includes silk scrunchie, curling rod, and clips in a reusable pouch.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005002478107549.html",
    supplierProductId: "1005002478107549",
    baseCost: 3.0,
    category: "Hair Care",
    tags: ["heatless-curls", "silk", "curling-ribbon", "hair-care", "no-damage"],
    variants: [
      { sku: "GH-CURL-PINK", name: "Pink", costPrice: 3.0, retailPrice: 22.99, compareAtPrice: 29.99, stock: 250, weight: 0.1 },
      { sku: "GH-CURL-BLACK", name: "Black", costPrice: 3.0, retailPrice: 22.99, compareAtPrice: 29.99, stock: 250, weight: 0.1 },
      { sku: "GH-CURL-CHAMP", name: "Champagne", costPrice: 3.0, retailPrice: 22.99, compareAtPrice: 29.99, stock: 250, weight: 0.1 },
    ],
    images: [
      { url: "https://ae01.alicdn.com/kf/H49d9bf2d6b92412ea68b4b8983f33c3ev.jpg", alt: "Silk heatless curling ribbon rod set" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 5,
  },
  {
    title: "22-Momme Mulberry Silk Beauty Pillowcase",
    description:
      "100% Grade 6A mulberry silk pillowcase in 22-momme weight with hidden zipper closure. Reduces hair breakage, prevents sleep creases, and helps skin retain moisture overnight. Hypoallergenic and temperature-regulating.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005002352814506.html",
    supplierProductId: "1005002352814506",
    baseCost: 6.5,
    category: "Beauty Sleep",
    tags: ["silk-pillowcase", "mulberry-silk", "beauty-sleep", "anti-wrinkle", "hair-care"],
    variants: [
      { sku: "GH-SILK-IVORY", name: "Ivory - Standard", costPrice: 6.5, retailPrice: 34.99, compareAtPrice: 44.99, stock: 150, weight: 0.2 },
      { sku: "GH-SILK-BLUSH", name: "Blush - Standard", costPrice: 6.5, retailPrice: 34.99, compareAtPrice: 44.99, stock: 150, weight: 0.2 },
      { sku: "GH-SILK-CHARCOAL", name: "Charcoal - Standard", costPrice: 6.5, retailPrice: 34.99, compareAtPrice: 44.99, stock: 150, weight: 0.2 },
    ],
    images: [
      { url: pexels(8465948), alt: "Smooth cream silk satin fabric" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 19,
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
      { url: pexels(6621355), alt: "Ultrasonic Facial Skin Scrubber" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 22,
  },
  {
    title: "Hydra-Plump Crystal Lip Oil",
    description:
      "Moisturizing lip oil with a crystal-clear, non-sticky finish that hydrates, plumps, and adds a glass-like shine. Infused with vitamin E, jojoba oil, and hyaluronic acid. The affordable dupe for the viral Dior Lip Oil trend.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/4001231725027.html",
    supplierProductId: "4001231725027",
    baseCost: 1.5,
    category: "Skincare",
    tags: ["lip-oil", "plumping", "hydrating", "glass-lips", "clean-girl"],
    variants: [
      { sku: "GH-LIPO-CLEAR", name: "Crystal Clear", costPrice: 1.5, retailPrice: 12.99, compareAtPrice: 16.99, stock: 500, weight: 0.04 },
      { sku: "GH-LIPO-ROSE", name: "Rose Tint", costPrice: 1.5, retailPrice: 12.99, compareAtPrice: 16.99, stock: 500, weight: 0.04 },
      { sku: "GH-LIPO-BERRY", name: "Berry Tint", costPrice: 1.5, retailPrice: 12.99, compareAtPrice: 16.99, stock: 500, weight: 0.04 },
    ],
    images: [
      { url: pexels(27393232), alt: "Lip oil bottle" },
      { url: pexels(12829921), alt: "Lip oil application" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 6,
  },
  {
    title: "Dewy Lip & Cheek Tint",
    description:
      "Multi-use lip and cheek tint with a dewy, buildable finish. The lightweight gel formula melts into skin for a natural flush that lasts all day. The viral clean girl aesthetic in a tube — perfect for the 'no-makeup makeup' look trending on TikTok and Instagram.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005007291834562.html",
    supplierProductId: "1005007291834562",
    baseCost: 1.2,
    category: "Lips",
    tags: ["lip-tint", "cheek-tint", "clean-girl", "multi-use", "dewy"],
    variants: [
      { sku: "GH-LTNT-ROSE", name: "Rose", costPrice: 1.2, retailPrice: 11.99, compareAtPrice: 15.99, stock: 450, weight: 0.03 },
      { sku: "GH-LTNT-PECH", name: "Peach", costPrice: 1.2, retailPrice: 11.99, compareAtPrice: 15.99, stock: 450, weight: 0.03 },
      { sku: "GH-LTNT-BERY", name: "Berry", costPrice: 1.2, retailPrice: 11.99, compareAtPrice: 15.99, stock: 450, weight: 0.03 },
      { sku: "GH-LTNT-CORL", name: "Coral", costPrice: 1.2, retailPrice: 11.99, compareAtPrice: 15.99, stock: 450, weight: 0.03 },
    ],
    images: [
      { url: pexels(12587070), alt: "Cosmetic tint tube product shot" },
      { url: pexels(13153662), alt: "Woman wearing dewy lip tint" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 1,
  },
  {
    title: "Cream Blush Stick",
    description:
      "Creamy, blendable blush stick that glides on for an instant healthy glow. Buildable, lightweight formula with a dewy satin finish. Doubles as a lip color for on-the-go touch-ups. The one-swipe blush hack going viral on beauty TikTok.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005007291847293.html",
    supplierProductId: "1005007291847293",
    baseCost: 1.8,
    category: "Makeup",
    tags: ["blush", "cream-blush", "stick", "clean-girl", "dewy"],
    variants: [
      { sku: "GH-BLSH-PINK", name: "Soft Pink", costPrice: 1.8, retailPrice: 13.99, compareAtPrice: 18.99, stock: 400, weight: 0.04 },
      { sku: "GH-BLSH-PECH", name: "Warm Peach", costPrice: 1.8, retailPrice: 13.99, compareAtPrice: 18.99, stock: 400, weight: 0.04 },
      { sku: "GH-BLSH-MAUV", name: "Mauve", costPrice: 1.8, retailPrice: 13.99, compareAtPrice: 18.99, stock: 400, weight: 0.04 },
    ],
    images: [
      { url: pexels(10126006), alt: "Cream blush makeup product" },
      { url: pexels(7510154), alt: "Blush application on cheek" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 8,
  },
  {
    title: "Tinted Brow Styling Gel",
    description:
      "Tinted brow gel that shapes, sets, and fills brows in one swipe. Long-lasting, flake-free formula gives a laminated brow look without the salon visit. Micro-fibers add natural fullness while the flexible hold keeps brows feathered all day.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005007291853671.html",
    supplierProductId: "1005007291853671",
    baseCost: 1.5,
    category: "Brows",
    tags: ["brow-gel", "brow-styling", "tinted", "clean-girl", "laminated-brows"],
    variants: [
      { sku: "GH-BROW-CLER", name: "Clear", costPrice: 1.5, retailPrice: 12.99, compareAtPrice: 16.99, stock: 400, weight: 0.03 },
      { sku: "GH-BROW-LTBR", name: "Light Brown", costPrice: 1.5, retailPrice: 12.99, compareAtPrice: 16.99, stock: 400, weight: 0.03 },
      { sku: "GH-BROW-DKBR", name: "Dark Brown", costPrice: 1.5, retailPrice: 12.99, compareAtPrice: 16.99, stock: 400, weight: 0.03 },
    ],
    images: [
      { url: pexels(4889707), alt: "Brow gel tube with spoolie wand applicator" },
      { url: pexels(7588357), alt: "Close-up of groomed laminated brows" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 12,
  },

  // ═══════════════════════════════════════════════════════════
  // AURAE — Jewelry / Accessories (22 products)
  // ═══════════════════════════════════════════════════════════
  {
    title: "Herringbone CZ Pendant Necklace",
    description:
      "Delicate herringbone chain with a sparkling cubic zirconia stone accent. 316L stainless steel with 18K gold PVD plating for a waterproof, tarnish-proof finish. The flat herringbone drape catches light beautifully — the trending chain style of the season.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005003751674364.html",
    supplierProductId: "1005003751674364",
    baseCost: 4.22,
    category: "Necklaces",
    tags: ["necklace", "herringbone", "cz", "gold", "waterproof", "trending"],
    variants: [
      { sku: "AU-HBCZ-EMRLD", name: "Emerald", costPrice: 4.22, retailPrice: 27.99, compareAtPrice: 38.99, stock: 200, weight: 0.04 },
      { sku: "AU-HBCZ-CLEAR", name: "Diamond Clear", costPrice: 4.22, retailPrice: 27.99, compareAtPrice: 38.99, stock: 200, weight: 0.04 },
      { sku: "AU-HBCZ-PINK", name: "Pink", costPrice: 4.22, retailPrice: 27.99, compareAtPrice: 38.99, stock: 200, weight: 0.04 },
      { sku: "AU-HBCZ-PURPL", name: "Purple", costPrice: 4.22, retailPrice: 27.99, compareAtPrice: 38.99, stock: 200, weight: 0.04 },
    ],
    images: [
      { url: "https://cdn.shopify.com/s/files/1/0549/8090/3141/files/cz_charm_herringbone_necklace_1.jpg?v=1730405380", alt: "Herringbone CZ pendant necklace gold" },
      { url: "https://cdn.shopify.com/s/files/1/0549/8090/3141/products/herringbone-zircon-necklace-babeina-jewelry-8.jpg?v=1678130712", alt: "Herringbone chain necklace with CZ stone" },
    ],
    storeIndex: 1,
    isFeatured: true,
    position: 0,
  },
  {
    title: "18K Gold-Plated Chunky Hoop Earrings",
    description:
      "Bold, lightweight 18K gold-plated hoops that elevate any outfit. Tarnish-resistant with a high-polish finish. The everyday hoop that goes with everything.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005002740712774.html",
    supplierProductId: "1005002740712774",
    baseCost: 3.5,
    category: "Earrings",
    tags: ["hoops", "gold", "chunky", "everyday", "tarnish-resistant"],
    variants: [
      { sku: "AU-HOOP-25MM", name: "25mm - Gold", costPrice: 3.5, retailPrice: 16.99, compareAtPrice: 22.99, stock: 300, weight: 0.02 },
      { sku: "AU-HOOP-35MM", name: "35mm - Gold", costPrice: 3.8, retailPrice: 18.99, compareAtPrice: 24.99, stock: 250, weight: 0.03 },
      { sku: "AU-HOOP-25SLV", name: "25mm - Silver", costPrice: 3.5, retailPrice: 16.99, compareAtPrice: 22.99, stock: 300, weight: 0.02 },
    ],
    images: [
      { url: pexels(12144990), alt: "Gold Chunky Hoop Earrings" },
    ],
    storeIndex: 1,
    isFeatured: true,
    position: 1,
  },
  {
    title: "Dainty Birth Flower Pendant Necklace",
    description:
      "Delicate gold-plated pendant engraved with your birth month flower. Adjustable 16-18 inch chain. The perfect personalized gift for birthdays and anniversaries.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005002905544365.html",
    supplierProductId: "1005002905544365",
    baseCost: 3.0,
    category: "Necklaces",
    tags: ["birth-flower", "pendant", "personalized", "gift", "dainty"],
    variants: [
      { sku: "AU-BFLR-GOLD", name: "Gold", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 22.99, stock: 400, weight: 0.02 },
      { sku: "AU-BFLR-SILVER", name: "Silver", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 22.99, stock: 400, weight: 0.02 },
      { sku: "AU-BFLR-ROSE", name: "Rose Gold", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 22.99, stock: 400, weight: 0.02 },
    ],
    images: [
      { url: pexels(13292666), alt: "Birth Flower Pendant Necklace" },
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
    supplierUrl: "https://www.aliexpress.com/item/1005008802889794.html",
    supplierProductId: "1005008802889794",
    baseCost: 2.5,
    category: "Rings",
    tags: ["signet", "vintage", "stackable", "old-money", "minimalist"],
    variants: [
      { sku: "AU-SGNT-6G", name: "Size 6 - Gold", costPrice: 2.5, retailPrice: 12.99, compareAtPrice: 18.99, stock: 200, weight: 0.01 },
      { sku: "AU-SGNT-7G", name: "Size 7 - Gold", costPrice: 2.5, retailPrice: 12.99, compareAtPrice: 18.99, stock: 200, weight: 0.01 },
      { sku: "AU-SGNT-8G", name: "Size 8 - Gold", costPrice: 2.5, retailPrice: 12.99, compareAtPrice: 18.99, stock: 200, weight: 0.01 },
    ],
    images: [
      { url: pexels(10944883), alt: "Vintage Gold Signet Ring" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 3,
  },
  {
    title: "3-Layer Gold Chain Necklace Set",
    description:
      "Pre-layered set with a choker, pendant chain, and long paperclip chain. No tangling, no fuss. Instant effortless-chic layered look in seconds.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/33032557482.html",
    supplierProductId: "33032557482",
    baseCost: 5.0,
    category: "Necklaces",
    tags: ["layered", "chain", "necklace-set", "choker", "paperclip"],
    variants: [
      { sku: "AU-LAYR-GOLD", name: "Gold", costPrice: 5.0, retailPrice: 24.99, compareAtPrice: 34.99, stock: 180, weight: 0.04 },
      { sku: "AU-LAYR-SILVER", name: "Silver", costPrice: 5.0, retailPrice: 24.99, compareAtPrice: 34.99, stock: 180, weight: 0.04 },
    ],
    images: [
      { url: pexels(6467618), alt: "3-Layer Gold Chain Necklace Set" },
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
    supplierUrl: "https://www.aliexpress.com/item/1005002428663592.html",
    supplierProductId: "1005002428663592",
    baseCost: 2.2,
    category: "Hair Accessories",
    tags: ["claw-clip", "pearl", "hair-clip", "clean-girl", "oversized"],
    variants: [
      { sku: "AU-PCLW-CREAM", name: "Cream", costPrice: 2.2, retailPrice: 11.99, compareAtPrice: 16.99, stock: 350, weight: 0.04 },
      { sku: "AU-PCLW-BLACK", name: "Black Pearl", costPrice: 2.2, retailPrice: 11.99, compareAtPrice: 16.99, stock: 350, weight: 0.04 },
    ],
    images: [
      { url: "https://plus.unsplash.com/premium_photo-1661645487449-e20bf088390f?w=800&q=80", alt: "Pearl claw clip and hair accessories" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 5,
  },
  {
    title: "CZ Diamond Tennis Bracelet - Waterproof",
    description:
      "Sparkling cubic zirconia tennis bracelet with waterproof PVD gold plating. Shower-safe, sweat-proof, never tarnishes. Luxury look at a fraction of the price.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005003625607397.html",
    supplierProductId: "1005003625607397",
    baseCost: 6.0,
    category: "Bracelets",
    tags: ["tennis-bracelet", "cz", "waterproof", "pvd", "diamond"],
    variants: [
      { sku: "AU-TENB-GOLD", name: "Gold", costPrice: 6.0, retailPrice: 26.99, compareAtPrice: 39.99, stock: 150, weight: 0.03 },
      { sku: "AU-TENB-SILVER", name: "Silver", costPrice: 6.0, retailPrice: 26.99, compareAtPrice: 39.99, stock: 150, weight: 0.03 },
    ],
    images: [
      { url: pexels(12194325), alt: "CZ Diamond Tennis Bracelet" },
    ],
    storeIndex: 1,
    isFeatured: true,
    position: 3,
  },
  {
    title: "Mini Huggie Earring Set (4 Pairs)",
    description:
      "Curated set of four mini huggie hoops: plain, CZ-encrusted, twisted, and beaded. Mix-and-match for stacked ear looks. Hypoallergenic, nickel-free.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005007663009947.html",
    supplierProductId: "1005007663009947",
    baseCost: 4.5,
    category: "Earrings",
    tags: ["huggie", "earring-set", "stacking", "hypoallergenic", "mini"],
    variants: [
      { sku: "AU-HUGG-GOLD", name: "Gold Set", costPrice: 4.5, retailPrice: 19.99, compareAtPrice: 28.99, stock: 200, weight: 0.02 },
      { sku: "AU-HUGG-SILVER", name: "Silver Set", costPrice: 4.5, retailPrice: 19.99, compareAtPrice: 28.99, stock: 200, weight: 0.02 },
    ],
    images: [
      { url: pexels(15785528), alt: "Mini Huggie Earring Set" },
    ],
    storeIndex: 1,
    isFeatured: true,
    position: 6,
  },
  {
    title: "18K Gold Croissant Dome Ring",
    description:
      "The viral croissant ring with a bold twisted dome design. Comfortable fit, solid weight, luxurious look. The quiet-luxury ring that goes with everything.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005002796150617.html",
    supplierProductId: "1005002796150617",
    baseCost: 3.2,
    category: "Rings",
    tags: ["croissant", "dome-ring", "quiet-luxury", "bold", "statement"],
    variants: [
      { sku: "AU-CRST-6G", name: "Size 6 - Gold", costPrice: 3.2, retailPrice: 14.99, compareAtPrice: 21.99, stock: 200, weight: 0.02 },
      { sku: "AU-CRST-7G", name: "Size 7 - Gold", costPrice: 3.2, retailPrice: 14.99, compareAtPrice: 21.99, stock: 200, weight: 0.02 },
      { sku: "AU-CRST-8G", name: "Size 8 - Gold", costPrice: 3.2, retailPrice: 14.99, compareAtPrice: 21.99, stock: 200, weight: 0.02 },
    ],
    images: [
      { url: pexels(7453893), alt: "18K Gold Croissant Dome Ring" },
    ],
    storeIndex: 1,
    isFeatured: true,
    position: 5,
  },
  {
    title: "Dainty Butterfly Charm Anklet",
    description:
      "Delicate gold chain anklet with tiny butterfly charms that catch the light. Adjustable length with 2-inch extender. Summer essential for sandal season.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005007038704036.html",
    supplierProductId: "1005007038704036",
    baseCost: 2.0,
    category: "Bracelets",
    tags: ["anklet", "butterfly", "dainty", "summer", "charm"],
    variants: [
      { sku: "AU-BFLY-GOLD", name: "Gold", costPrice: 2.0, retailPrice: 9.99, compareAtPrice: 14.99, stock: 400, weight: 0.01 },
      { sku: "AU-BFLY-SILVER", name: "Silver", costPrice: 2.0, retailPrice: 9.99, compareAtPrice: 14.99, stock: 400, weight: 0.01 },
    ],
    images: [
      { url: pexels(9024872), alt: "Dainty Butterfly Charm Anklet" },
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
    supplierUrl: "https://cjdropshipping.com/product/fashion-26-bubble-letter-necklace-gold-necklace-p-2410130742481604100.html",
    supplierProductId: "2410130742481604100",
    baseCost: 3.5,
    category: "Necklaces",
    tags: ["initial", "bubble-letter", "personalized", "gift", "pendant"],
    variants: [
      { sku: "AU-BUBL-GOLD", name: "Gold", costPrice: 3.5, retailPrice: 16.99, compareAtPrice: 24.99, stock: 300, weight: 0.02 },
      { sku: "AU-BUBL-SILVER", name: "Silver", costPrice: 3.5, retailPrice: 16.99, compareAtPrice: 24.99, stock: 300, weight: 0.02 },
    ],
    images: [
      { url: pexels(19869445), alt: "Bubble Letter Initial Necklace" },
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
    supplierUrl: "https://www.aliexpress.com/item/1005003690809306.html",
    supplierProductId: "1005003690809306",
    baseCost: 3.8,
    category: "Hair Accessories",
    tags: ["silk", "scrunchie", "mulberry", "hair-care", "anti-breakage"],
    variants: [
      { sku: "AU-SLKS-NEUT", name: "Neutral Tones", costPrice: 3.8, retailPrice: 18.99, compareAtPrice: 26.99, stock: 250, weight: 0.05 },
      { sku: "AU-SLKS-JEWL", name: "Jewel Tones", costPrice: 3.8, retailPrice: 18.99, compareAtPrice: 26.99, stock: 250, weight: 0.05 },
    ],
    images: [
      { url: "https://plus.unsplash.com/premium_photo-1674625942746-313ba29066ba?w=800&q=80", alt: "Silk scrunchie set" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 11,
  },
  {
    title: "Evil Eye Protection Charm Bracelet",
    description:
      "Handcrafted evil eye bracelet with genuine cubic zirconia halo. Adjustable slider clasp fits all wrists. Meaningful gift symbolizing protection and good luck.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005003632523884.html",
    supplierProductId: "1005003632523884",
    baseCost: 3.0,
    category: "Bracelets",
    tags: ["evil-eye", "charm", "protection", "adjustable", "gift"],
    variants: [
      { sku: "AU-EVIL-GOLD", name: "Gold", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 19.99, stock: 250, weight: 0.02 },
      { sku: "AU-EVIL-SILVER", name: "Silver", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 19.99, stock: 250, weight: 0.02 },
      { sku: "AU-EVIL-ROSE", name: "Rose Gold", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 19.99, stock: 250, weight: 0.02 },
    ],
    images: [
      { url: pexels(16274920), alt: "Evil Eye Charm Bracelet" },
    ],
    storeIndex: 1,
    isFeatured: true,
    position: 7,
  },
  {
    title: "18K Gold Twist Chunky Hoop Earrings",
    description:
      "Bold twist-texture chunky hoops in waterproof 18K gold-plated stainless steel. Lightweight yet statement-making with a braided rope texture. Hypoallergenic and fade-resistant — the everyday hoop that survives showers, pools, and workouts.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005002009200911.html",
    supplierProductId: "1005002009200911",
    baseCost: 6.49,
    category: "Earrings",
    tags: ["earrings", "hoops", "twist", "chunky", "gold", "waterproof"],
    variants: [
      { sku: "AU-TWST-GOLD", name: "Gold", costPrice: 6.49, retailPrice: 22.99, compareAtPrice: 32.99, stock: 250, weight: 0.02 },
      { sku: "AU-TWST-SILVER", name: "Silver", costPrice: 6.49, retailPrice: 22.99, compareAtPrice: 32.99, stock: 250, weight: 0.02 },
    ],
    images: [
      { url: "https://cdn.shopify.com/s/files/1/0636/6180/1725/files/chunky-twist2.jpg?v=1738722770", alt: "18K gold twist chunky hoop earrings" },
      { url: "https://cdn.shopify.com/s/files/1/0636/6180/1725/files/chunky-twist-earrings-worn2.jpg?v=1738722770", alt: "Gold twist hoop earrings worn" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 13,
  },
  {
    title: "Flat Herringbone Chain Necklace",
    description:
      "Sleek, flat herringbone chain with a liquid-gold drape. The sophisticated everyday necklace that layers beautifully or stuns alone. PVD waterproof coating.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005004260243887.html",
    supplierProductId: "1005004260243887",
    baseCost: 4.5,
    category: "Necklaces",
    tags: ["herringbone", "chain", "flat", "waterproof", "everyday"],
    variants: [
      { sku: "AU-HERB-16G", name: '16" - Gold', costPrice: 4.5, retailPrice: 21.99, compareAtPrice: 29.99, stock: 180, weight: 0.03 },
      { sku: "AU-HERB-18G", name: '18" - Gold', costPrice: 5.0, retailPrice: 23.99, compareAtPrice: 32.99, stock: 180, weight: 0.04 },
      { sku: "AU-HERB-16S", name: '16" - Silver', costPrice: 4.5, retailPrice: 21.99, compareAtPrice: 29.99, stock: 180, weight: 0.03 },
    ],
    images: [
      { url: pexels(1454168), alt: "Flat Herringbone Chain Necklace" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 14,
  },
  {
    title: "Baroque Freshwater Pearl Pendant Necklace",
    description:
      "A single organic-shaped baroque freshwater pearl pendant on a dainty gold-plated stainless steel chain. Each pearl is unique in shape, making every piece one-of-a-kind. Minimalist elegance inspired by the Vivienne Westwood pearl trend.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/32857431052.html",
    supplierProductId: "32857431052",
    baseCost: 2.5,
    category: "Necklaces",
    tags: ["pearl", "baroque", "freshwater", "pendant", "minimalist"],
    variants: [
      { sku: "AU-BPRL-GOLD", name: "Gold Chain", costPrice: 2.5, retailPrice: 22.99, compareAtPrice: 29.99, stock: 250, weight: 0.02 },
      { sku: "AU-BPRL-SILVER", name: "Silver Chain", costPrice: 2.5, retailPrice: 22.99, compareAtPrice: 29.99, stock: 250, weight: 0.02 },
    ],
    images: [
      { url: pexels(8776984), alt: "Baroque Pearl Pendant Necklace" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 15,
  },
  {
    title: "Chunky Gold Dome Adjustable Ring",
    description:
      "Minimalist chunky dome ring in 18K gold-plated 316L stainless steel. The adjustable open-band design fits all sizes — no more sizing guesswork. Waterproof and scratch-resistant with a bold, modern silhouette that stacks beautifully.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005002494538148.html",
    supplierProductId: "1005002494538148",
    baseCost: 2.91,
    category: "Rings",
    tags: ["ring", "dome", "chunky", "adjustable", "gold", "stacking"],
    variants: [
      { sku: "AU-DOME-GOLD", name: "Gold", costPrice: 2.91, retailPrice: 16.99, compareAtPrice: 24.99, stock: 300, weight: 0.02 },
      { sku: "AU-DOME-SILVER", name: "Silver", costPrice: 2.91, retailPrice: 16.99, compareAtPrice: 24.99, stock: 300, weight: 0.02 },
    ],
    images: [
      { url: "https://cdn.shopify.com/s/files/1/0277/8778/8427/products/14k-gold-filled-rings-dome-ring-linkd-31221669363851.jpg?v=1669509313", alt: "Chunky gold dome adjustable ring" },
      { url: "https://cdn.shopify.com/s/files/1/0277/8778/8427/products/14k-gold-filled-rings-dome-ring-linkd-29292161564811.jpg?v=1674255533", alt: "Gold dome ring alternate view" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 16,
  },
  {
    title: "Zodiac Constellation Layering Necklace Set",
    description:
      "Two-piece necklace set featuring a zodiac sign pendant on a shorter chain and a constellation star-map disc on a longer chain. Gold-plated stainless steel with engraved details. Wear layered or separately. All 12 signs available.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/32872585584.html",
    supplierProductId: "32872585584",
    baseCost: 3.0,
    category: "Necklaces",
    tags: ["zodiac", "constellation", "layering-set", "astrology", "personalized"],
    variants: [
      { sku: "AU-ZODC-GOLD", name: "Gold", costPrice: 3.0, retailPrice: 24.99, compareAtPrice: 34.99, stock: 250, weight: 0.03 },
      { sku: "AU-ZODC-SILVER", name: "Silver", costPrice: 3.0, retailPrice: 24.99, compareAtPrice: 34.99, stock: 250, weight: 0.03 },
    ],
    images: [
      { url: pexels(7679654), alt: "Zodiac Constellation Necklace Set" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 17,
  },
  {
    title: "Cuban Link Chain Bracelet - Unisex",
    description:
      "Bold Cuban link chain bracelet in 18K PVD gold-plated stainless steel. Unisex design with a secure fold-over clasp. Waterproof and built for everyday wear. Available in 5mm and 8mm widths for subtle or statement styling.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005001540897377.html",
    supplierProductId: "1005001540897377",
    baseCost: 2.8,
    category: "Bracelets",
    tags: ["cuban-link", "chain", "unisex", "waterproof", "streetwear"],
    variants: [
      { sku: "AU-CUBN-5G", name: "5mm - Gold", costPrice: 2.8, retailPrice: 19.99, compareAtPrice: 26.99, stock: 200, weight: 0.03 },
      { sku: "AU-CUBN-8G", name: "8mm - Gold", costPrice: 3.5, retailPrice: 24.99, compareAtPrice: 32.99, stock: 150, weight: 0.05 },
      { sku: "AU-CUBN-5S", name: "5mm - Silver", costPrice: 2.8, retailPrice: 19.99, compareAtPrice: 26.99, stock: 200, weight: 0.03 },
    ],
    images: [
      { url: pexels(8184263), alt: "Cuban Link Chain Bracelet" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 18,
  },
  {
    title: "18K Gold Layered Waist Chain",
    description:
      "Double-layer body chain in 18K PVD gold-plated stainless steel. Adjustable lobster-clasp closure fits over clothing or on bare skin. Waterproof, tarnish-free, and lightweight enough for all-day festival or beach wear.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005006123456789.html",
    supplierProductId: "1005006123456789",
    baseCost: 3.5,
    category: "Body Jewelry",
    tags: ["waist-chain", "body-chain", "gold", "layered", "festival"],
    variants: [
      { sku: "AU-WSTC-SG", name: "Small - Gold", costPrice: 3.5, retailPrice: 19.99, compareAtPrice: 29.99, stock: 200, weight: 0.04 },
      { sku: "AU-WSTC-MG", name: "Medium - Gold", costPrice: 3.5, retailPrice: 19.99, compareAtPrice: 29.99, stock: 200, weight: 0.04 },
      { sku: "AU-WSTC-LG", name: "Large - Gold", costPrice: 3.5, retailPrice: 19.99, compareAtPrice: 29.99, stock: 200, weight: 0.04 },
      { sku: "AU-WSTC-SS", name: "Small - Silver", costPrice: 3.5, retailPrice: 19.99, compareAtPrice: 29.99, stock: 150, weight: 0.04 },
      { sku: "AU-WSTC-MS", name: "Medium - Silver", costPrice: 3.5, retailPrice: 19.99, compareAtPrice: 29.99, stock: 150, weight: 0.04 },
      { sku: "AU-WSTC-LS", name: "Large - Silver", costPrice: 3.5, retailPrice: 19.99, compareAtPrice: 29.99, stock: 150, weight: 0.04 },
    ],
    images: [
      { url: "https://cdn.shopify.com/s/files/1/0478/0847/9387/files/two-layer-dainty-waist-chain-in-gold-n231-685693.jpg", alt: "18K Gold Layered Waist Chain front view" },
      { url: "https://cdn.shopify.com/s/files/1/0478/0847/9387/files/two-layer-dainty-waist-chain-in-gold-n231-374512.jpg", alt: "18K Gold Layered Waist Chain side view" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 19,
  },
  {
    title: "Pearl Bow Bag Charm",
    description:
      "Elegant pearl and bow keychain charm with gold-tone hardware. Clip onto handbags, tote bags, or use as a statement keyring. Faux-pearl beads with a satin ribbon bow — the perfect finishing touch to any outfit.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005006234567890.html",
    supplierProductId: "1005006234567890",
    baseCost: 2.0,
    category: "Accessories",
    tags: ["bag-charm", "pearl", "bow", "keychain", "handbag"],
    variants: [
      { sku: "AU-PBCH-PGB", name: "Pearl & Gold Bow", costPrice: 2.0, retailPrice: 14.99, compareAtPrice: 22.99, stock: 300, weight: 0.03 },
      { sku: "AU-PBCH-PHB", name: "Pearl Heart & Bow", costPrice: 2.0, retailPrice: 14.99, compareAtPrice: 22.99, stock: 300, weight: 0.03 },
    ],
    images: [
      { url: "https://cdn.shopify.com/s/files/1/1768/7757/files/22715307_08a715ad-446a-47e1-b41a-99e485a8e451.jpg?v=1734029171", alt: "Pearl Bow Bag Charm on handbag" },
      { url: "https://cdn.shopify.com/s/files/1/1768/7757/files/22715307_46b90e48-fe78-4477-a3cf-68c816ecdacb.jpg?v=1734029171", alt: "Pearl Bow Bag Charm close-up" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 20,
  },
  {
    title: "Pearl & Crystal Bobby Pin Set — 18 Pieces",
    description:
      "Luxe set of 18 decorative bobby pins featuring faux pearls, tiny crystals, and minimalist gold-tone clips. Mix and match styles for bridal updos, everyday half-up looks, or accent braids. Comes in a velvet pouch.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/32850636511.html",
    supplierProductId: "32850636511",
    baseCost: 1.85,
    category: "Hair Accessories",
    tags: ["bobby-pins", "pearl", "crystal", "bridal", "hair-clips"],
    variants: [
      { sku: "AU-BPIN-GOLD", name: "Gold Set", costPrice: 1.85, retailPrice: 16.99, compareAtPrice: 24.99, stock: 250, weight: 0.05 },
      { sku: "AU-BPIN-SILVER", name: "Silver Set", costPrice: 1.85, retailPrice: 16.99, compareAtPrice: 24.99, stock: 250, weight: 0.05 },
      { sku: "AU-BPIN-ROSE", name: "Rose Gold Set", costPrice: 1.85, retailPrice: 16.99, compareAtPrice: 24.99, stock: 250, weight: 0.05 },
    ],
    images: [
      { url: "https://cdn.shopify.com/s/files/1/0286/8926/8867/products/Nume-Clips9987_1.jpg", alt: "Pearl & Crystal Bobby Pin Set arranged" },
      { url: "https://cdn.shopify.com/s/files/1/0286/8926/8867/products/NUME-CLIPS-FINAL3569_1.jpg", alt: "Pearl & Crystal Bobby Pin Set in hair" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 21,
  },

  // ═══════════════════════════════════════════════════════════
  // NESTWELL — Home Decor / Cozy Living (19 products)
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
      { url: "https://s.alicdn.com/@sc04/kf/Hb17fb622d4374b07945fede1cc07ad5cs.jpg_960x960.jpg", alt: "Rain cloud diffuser with illuminated mist" },
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
      { url: "https://s.alicdn.com/@sc04/kf/H4b8996486e09469f99fcc652e985d17as.jpg_960x960.jpg", alt: "Sunset lamp projector casting warm orange glow" },
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
      { url: "https://images.unsplash.com/photo-1756474215990-a18a9a0521d5?w=800&q=80", alt: "Mushroom shaped LED table lamp" },
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
    supplierUrl: "https://www.aliexpress.com/item/1005005113246946.html",
    supplierProductId: "1005005113246946",
    baseCost: 8.5,
    category: "Wall Decor",
    tags: ["cloud-shelf", "floating", "nursery", "whimsical", "wall-shelf"],
    variants: [
      { sku: "NW-CLSH-WHITE", name: "White", costPrice: 8.5, retailPrice: 29.99, compareAtPrice: 39.99, stock: 80, weight: 0.9 },
      { sku: "NW-CLSH-WOOD", name: "Natural Wood", costPrice: 9.0, retailPrice: 32.99, compareAtPrice: 42.99, stock: 60, weight: 0.95 },
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1745636624902-0c11c981d71e?w=800&q=80", alt: "Cloud shelf in cozy nursery" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 3,
  },
  {
    title: "Nordic Knot Throw Pillow",
    description:
      "Handwoven-look knotted decorative pillow in soft jersey fabric. Statement piece for sofas, beds, and reading nooks. Each piece has a unique artisan quality.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005004413149004.html",
    supplierProductId: "1005004413149004",
    baseCost: 8.0,
    category: "Textiles",
    tags: ["knot-pillow", "nordic", "decorative", "throw-pillow", "cozy"],
    variants: [
      { sku: "NW-KNOT-WHITE", name: "White", costPrice: 8.0, retailPrice: 29.99, compareAtPrice: 39.99, stock: 100, weight: 0.6 },
      { sku: "NW-KNOT-SAGE", name: "Sage Green", costPrice: 8.0, retailPrice: 29.99, compareAtPrice: 39.99, stock: 100, weight: 0.6 },
      { sku: "NW-KNOT-BLUSH", name: "Blush Pink", costPrice: 8.0, retailPrice: 29.99, compareAtPrice: 39.99, stock: 100, weight: 0.6 },
    ],
    images: [
      { url: pexels(4635231), alt: "Nordic Knot Throw Pillow" },
    ],
    storeIndex: 2,
    isFeatured: true,
    position: 4,
  },
  {
    title: "Hand-Knit Chunky Knit Throw Blanket",
    description:
      "Ultra-thick chenille yarn throw blanket with dramatic oversized knit texture. Machine washable. The cozy aesthetic blanket seen in every Pinterest-worthy bedroom.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/3256805809702645.html",
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
      { url: pexels(6843263), alt: "Knitted fabric texture" },
      { url: pexels(1831248), alt: "White cozy blanket" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 5,
  },
  {
    title: "Hand-Poured Soy Candle Set (3 Pack)",
    description:
      "Three artisan soy wax candles in minimalist glass jars. Scents: Cashmere Vanilla, Fresh Linen, and Eucalyptus Mint. 40-hour burn time each. Cotton wicks.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005002189827420.html",
    supplierProductId: "1005002189827420",
    baseCost: 6.5,
    category: "Aromatherapy",
    tags: ["soy-candle", "hand-poured", "gift-set", "minimalist", "scented"],
    variants: [
      { sku: "NW-SOYC-3PK", name: "3-Pack Sampler", costPrice: 6.5, retailPrice: 24.99, compareAtPrice: 34.99, stock: 150, weight: 0.9 },
    ],
    images: [
      { url: pexels(3066868), alt: "Hand-Poured Soy Candle Set" },
    ],
    storeIndex: 2,
    isFeatured: true,
    position: 7,
  },
  {
    title: "Dried Pampas Grass Bouquet",
    description:
      "Naturally dried fluffy pampas grass stems in a curated bouquet of 30. Adds instant boho-chic warmth to any space. Lasts forever with zero maintenance.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/4000210990886.html",
    supplierProductId: "4000210990886",
    baseCost: 5.0,
    category: "Wall Decor",
    tags: ["pampas-grass", "dried-flowers", "boho", "bouquet", "forever-flowers"],
    variants: [
      { sku: "NW-PAMP-NATRL", name: "Natural (30 stems)", costPrice: 5.0, retailPrice: 19.99, compareAtPrice: 27.99, stock: 140, weight: 0.15 },
      { sku: "NW-PAMP-WHITE", name: "White (30 stems)", costPrice: 5.0, retailPrice: 19.99, compareAtPrice: 27.99, stock: 140, weight: 0.15 },
      { sku: "NW-PAMP-BROWN", name: "Brown (30 stems)", costPrice: 5.0, retailPrice: 19.99, compareAtPrice: 27.99, stock: 140, weight: 0.15 },
    ],
    images: [
      { url: pexels(9566054), alt: "Dried pampas grass bouquet in white vase" },
      { url: pexels(13462700), alt: "Pampas grass by mirror" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 8,
  },
  {
    title: "Galaxy Star Projector Night Light",
    description:
      "Rotating galaxy projector with nebula clouds, star field, and moon modes. Bluetooth speaker built in. Timer and remote control. Transform any room into a galaxy.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/car-led-starry-sky-night-light-usb-powered-galaxy-star-projector-lamp-for-car-roof-room-ceiling-decor-plug-and-play-p-1597539041078562816.html",
    supplierProductId: "1597539041078562816",
    baseCost: 11.0,
    category: "Lighting",
    tags: ["star-projector", "galaxy", "night-light", "bluetooth", "bedroom"],
    variants: [
      { sku: "NW-STAR-BLK", name: "Black", costPrice: 11.0, retailPrice: 39.99, compareAtPrice: 54.99, stock: 80, weight: 0.45 },
      { sku: "NW-STAR-WHT", name: "White", costPrice: 11.0, retailPrice: 39.99, compareAtPrice: 54.99, stock: 80, weight: 0.45 },
    ],
    images: [
      { url: pexels(18127557), alt: "Purple and blue galaxy lights projected in dark room" },
    ],
    storeIndex: 2,
    isFeatured: true,
    position: 5,
  },
  {
    title: "Japanese Waffle Weave Bath Towel Set",
    description:
      "Ultra-absorbent, quick-dry waffle-weave towels in the Japanese minimalist style. Set includes 2 bath towels and 2 hand towels. Lightweight and lint-free.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005002476918030.html",
    supplierProductId: "1005002476918030",
    baseCost: 10.0,
    category: "Textiles",
    tags: ["waffle-towel", "japanese", "bath-towel", "quick-dry", "minimalist"],
    variants: [
      { sku: "NW-WAFL-WHITE", name: "White", costPrice: 10.0, retailPrice: 36.99, compareAtPrice: 49.99, stock: 80, weight: 0.8 },
      { sku: "NW-WAFL-BEIGE", name: "Oat Beige", costPrice: 10.0, retailPrice: 36.99, compareAtPrice: 49.99, stock: 80, weight: 0.8 },
      { sku: "NW-WAFL-SAGE", name: "Sage", costPrice: 10.0, retailPrice: 36.99, compareAtPrice: 49.99, stock: 80, weight: 0.8 },
    ],
    images: [
      { url: pexels(12679), alt: "Waffle Weave Bath Towel Set" },
      { url: pexels(271711), alt: "Stack of towels on rack" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 10,
  },
  {
    title: "Ceramic Incense Waterfall Burner",
    description:
      "Mesmerizing backflow incense burner where smoke cascades downward like a waterfall. Comes with 50 incense cones. Zen meditation room essential.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/4000271762148.html",
    supplierProductId: "4000271762148",
    baseCost: 6.0,
    category: "Aromatherapy",
    tags: ["incense-burner", "waterfall", "backflow", "ceramic", "zen"],
    variants: [
      { sku: "NW-INCW-MOUNT", name: "Mountain Style", costPrice: 6.0, retailPrice: 22.99, compareAtPrice: 32.99, stock: 120, weight: 0.5 },
      { sku: "NW-INCW-LOTUS", name: "Lotus Style", costPrice: 6.5, retailPrice: 24.99, compareAtPrice: 34.99, stock: 100, weight: 0.55 },
    ],
    images: [
      { url: pexels(6954562), alt: "Ceramic Incense Waterfall Burner with smoke" },
      { url: pexels(3822622), alt: "Candles and incense for meditation" },
    ],
    storeIndex: 2,
    isFeatured: true,
    position: 6,
  },
  {
    title: "Minimalist Adhesive Wall Hook Set (8 Pack)",
    description:
      "Damage-free adhesive hooks with a sleek Nordic design. Each holds up to 15 lbs. Perfect for towels, bags, keys, and coats. Renter-friendly, no drilling.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005005250267247.html",
    supplierProductId: "1005005250267247",
    baseCost: 3.0,
    category: "Organization",
    tags: ["wall-hooks", "adhesive", "minimalist", "renter-friendly", "nordic"],
    variants: [
      { sku: "NW-HOOK-WHITE", name: "White (8 pack)", costPrice: 3.0, retailPrice: 12.99, compareAtPrice: 18.99, stock: 250, weight: 0.2 },
      { sku: "NW-HOOK-BLACK", name: "Black (8 pack)", costPrice: 3.0, retailPrice: 12.99, compareAtPrice: 18.99, stock: 250, weight: 0.2 },
      { sku: "NW-HOOK-WOOD", name: "Wood Grain (8 pack)", costPrice: 3.5, retailPrice: 14.99, compareAtPrice: 19.99, stock: 200, weight: 0.22 },
    ],
    images: [
      { url: pexels(4846383), alt: "Minimalist Adhesive Wall Hooks" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 12,
  },
  {
    title: "Boho Macrame Round Wall Mirror",
    description:
      "Handwoven cotton macrame frame surrounding a quality round mirror. Adds texture and warmth to entryways, bathrooms, and bedrooms. Bohemian statement piece.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005005939599602.html",
    supplierProductId: "1005005939599602",
    baseCost: 10.0,
    category: "Wall Decor",
    tags: ["macrame", "mirror", "boho", "wall-mirror", "handwoven"],
    variants: [
      { sku: "NW-MACM-SM", name: 'Small (10")', costPrice: 10.0, retailPrice: 34.99, compareAtPrice: 44.99, stock: 70, weight: 0.7 },
      { sku: "NW-MACM-LG", name: 'Large (16")', costPrice: 15.0, retailPrice: 49.99, compareAtPrice: 64.99, stock: 45, weight: 1.2 },
    ],
    images: [
      { url: pexels(905198), alt: "Boho Macrame Wall Mirror" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 13,
  },
  {
    title: "3D Printed Moon Lamp with Wooden Stand",
    description:
      "3D-printed LED lamp that realistically replicates the moon's surface with craters and topographic detail. Elegant wooden stand, touch-control brightness, and 16 color options. USB rechargeable with 10-hour battery life. The perfect gift.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/rambery-moon-lamp-3d-print-night-light-rechargeable-3-color-tap-control-lamp-lights-p-1DC11DAB-FAC4-492D-B532-4A69EC8C512D.html",
    supplierProductId: "1DC11DAB-FAC4-492D-B532-4A69EC8C512D",
    baseCost: 7.5,
    category: "Lighting",
    tags: ["moon-lamp", "3d-print", "led", "gift", "night-light"],
    variants: [
      { sku: "NW-MOON-15CM", name: "15cm", costPrice: 7.5, retailPrice: 29.99, compareAtPrice: 39.99, stock: 120, weight: 0.35 },
      { sku: "NW-MOON-20CM", name: "20cm", costPrice: 10.0, retailPrice: 39.99, compareAtPrice: 49.99, stock: 80, weight: 0.5 },
    ],
    images: [
      { url: pexels(4101864), alt: "Moon lamp glowing in dark" },
      { url: "https://images.unsplash.com/photo-1549858670-d4fb4a5e0e18?w=800&q=80", alt: "Holding moon lamp" },
    ],
    storeIndex: 2,
    isFeatured: true,
    position: 14,
  },
  {
    title: "Smart WiFi RGB LED Strip Lights (16ft / 5m Kit)",
    description:
      "16.4ft (5m) smart LED strip light kit with WiFi, app control, and Alexa/Google Home voice control. Music sync mode, 16 million RGB colors, timer scheduling, and self-adhesive backing. Cuttable to custom lengths. Transform any room instantly.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/15m-2835rgb-led-strip-lights-smart-home-wifi-strip-light-app-control-waterproof-p-1505160812912840704.html",
    supplierProductId: "1505160812912840704",
    baseCost: 8.0,
    category: "Lighting",
    tags: ["led-strip", "rgb", "smart-home", "wifi", "ambient"],
    variants: [
      { sku: "NW-LEDS-5M", name: "16.4ft / 5m Kit", costPrice: 8.0, retailPrice: 29.99, compareAtPrice: 39.99, stock: 150, weight: 0.25 },
      { sku: "NW-LEDS-10M", name: "32.8ft / 10m Kit", costPrice: 12.0, retailPrice: 39.99, compareAtPrice: 54.99, stock: 100, weight: 0.4 },
    ],
    images: [
      { url: "https://plus.unsplash.com/premium_photo-1764687707857-966ab86c71dc?w=800&q=80", alt: "Room with LED ambient lighting" },
      { url: "https://images.unsplash.com/photo-1760999896198-b7e780e42500?w=800&q=80", alt: "RGB gaming setup" },
      { url: "https://s.alicdn.com/@sc04/kf/H0e73034028f24223a5c0262191618242o.jpg_960x960.jpg", alt: "RGB COB LED strip light tape close-up" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 15,
  },
  {
    title: "Silent Minimalist Scandinavian Wall Clock",
    description:
      "12-inch modern wall clock with a clean, minimal face in Scandinavian design. Silent quartz movement — no ticking. Available in matte black, white, or wood-tone. Lightweight with single-nail mounting.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/4000074356330.html",
    supplierProductId: "4000074356330",
    baseCost: 9.0,
    category: "Wall Decor",
    tags: ["wall-clock", "minimalist", "scandinavian", "silent", "modern"],
    variants: [
      { sku: "NW-CLCK-BLACK", name: "Matte Black", costPrice: 9.0, retailPrice: 34.99, compareAtPrice: 44.99, stock: 100, weight: 0.45 },
      { sku: "NW-CLCK-WHITE", name: "White", costPrice: 9.0, retailPrice: 34.99, compareAtPrice: 44.99, stock: 100, weight: 0.45 },
      { sku: "NW-CLCK-WOOD", name: "Wood Tone", costPrice: 9.5, retailPrice: 36.99, compareAtPrice: 46.99, stock: 80, weight: 0.5 },
    ],
    images: [
      { url: pexels(29791985), alt: "Minimalist Scandinavian Wall Clock" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 16,
  },
  {
    title: "Boho Macrame Hanging Wall Shelf Set (2 Pack)",
    description:
      "Set of two handwoven macrame rope hanging shelves with natural wood planks. Perfect for plants, candles, crystals, and picture frames. Renter-friendly — minimal wall damage. Available in cream, black, and sage rope.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005003621128632.html",
    supplierProductId: "1005003621128632",
    baseCost: 7.5,
    category: "Organization",
    tags: ["macrame-shelf", "hanging", "boho", "renter-friendly", "wall-decor"],
    variants: [
      { sku: "NW-MACS-CREAM", name: "Cream", costPrice: 7.5, retailPrice: 32.99, compareAtPrice: 42.99, stock: 100, weight: 0.6 },
      { sku: "NW-MACS-BLACK", name: "Black", costPrice: 7.5, retailPrice: 32.99, compareAtPrice: 42.99, stock: 100, weight: 0.6 },
      { sku: "NW-MACS-SAGE", name: "Sage", costPrice: 7.5, retailPrice: 32.99, compareAtPrice: 42.99, stock: 80, weight: 0.6 },
    ],
    images: [
      { url: "https://s.alicdn.com/@sc04/kf/H491b7c6ee6da47869fc76fd8ff3eaf2eN.jpg_960x960.jpg", alt: "Boho Macrame Hanging Wall Shelf with plants" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 17,
  },
  {
    title: "Faux Eucalyptus in Ceramic Minimalist Planter",
    description:
      "Realistic artificial eucalyptus arrangement in a matte ceramic pot. Maintenance-free greenery that looks fresh year-round. 10-12 inches tall. Perfect for shelves, desks, bathrooms, and windowsills. Ceramic pot has a drainage plug for optional real plant use.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005007279089743.html",
    supplierProductId: "1005007279089743",
    baseCost: 4.5,
    category: "Decor",
    tags: ["faux-plant", "eucalyptus", "ceramic", "minimalist", "greenery"],
    variants: [
      { sku: "NW-EUCL-WHITE", name: "White Pot", costPrice: 4.5, retailPrice: 22.99, compareAtPrice: 29.99, stock: 180, weight: 0.4 },
      { sku: "NW-EUCL-TERRA", name: "Terracotta Pot", costPrice: 4.5, retailPrice: 22.99, compareAtPrice: 29.99, stock: 150, weight: 0.4 },
      { sku: "NW-EUCL-SAGE", name: "Sage Pot", costPrice: 4.5, retailPrice: 22.99, compareAtPrice: 29.99, stock: 150, weight: 0.4 },
    ],
    images: [
      { url: pexels(2092553), alt: "Minimalist ceramic planter with greenery" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 18,
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
