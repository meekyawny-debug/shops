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
  // GLOWHAVEN — Beauty / Skincare (21 products)
  // ═══════════════════════════════════════════════════════════
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
      { url: pexels(24738496), alt: "Ice Roller Face Massager" },
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
      { url: "https://plus.unsplash.com/premium_photo-1661696510702-ffc96ecf6b52?w=800", alt: "Amber dropper bottles with orange slices" },
      { url: "https://images.pexels.com/photos/8140898/pexels-photo-8140898.jpeg?auto=compress&cs=tinysrgb&w=800", alt: "Hands holding amber glass dropper bottle" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 10,
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
      { url: pexels(8129894), alt: "Honey Lip Sleeping Mask pot" },
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
      { url: pexels(10483564), alt: "Silk heatless curling ribbon rod set" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 5,
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

  {
    title: "Silicone Scalp Massager",
    description:
      "Ergonomic handheld scalp massager with soft silicone bristles. Stimulates blood flow, promotes hair growth, and relieves tension headaches. Use in the shower with shampoo for a deep-clean, spa-like scalp scrub. The viral shower routine essential seen on millions of TikTok videos.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/silicone-scalp-massager-shampoo-brush-p-1500000000000000001.html",
    supplierProductId: "1500000000000000001",
    baseCost: 0.8,
    category: "Hair Care",
    tags: ["scalp-massager", "silicone", "shower", "hair-growth", "tiktok-viral"],
    variants: [
      { sku: "GH-SCMS-PINK", name: "Pink", costPrice: 0.8, retailPrice: 8.99, compareAtPrice: 14.99, stock: 500, weight: 0.06 },
      { sku: "GH-SCMS-GREEN", name: "Sage Green", costPrice: 0.8, retailPrice: 8.99, compareAtPrice: 14.99, stock: 500, weight: 0.06 },
      { sku: "GH-SCMS-PURPL", name: "Purple", costPrice: 0.8, retailPrice: 8.99, compareAtPrice: 14.99, stock: 500, weight: 0.06 },
    ],
    images: [
      { url: pexels(5269515), alt: "Woman washing hair in shower with scalp massager" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 15,
  },
  {
    title: "Microneedle Acne Patches (36 Pack)",
    description:
      "Self-dissolving microneedle pimple patches that deliver salicylic acid and niacinamide directly into blemishes. 36 patches per pack. Works overnight on cystic, hormonal, and stubborn acne. The #1 most-sold beauty item on TikTok Shop.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005007500000001.html",
    supplierProductId: "1005007500000001",
    baseCost: 0.8,
    category: "Skincare",
    tags: ["acne-patches", "microneedle", "pimple", "salicylic-acid", "tiktok-viral"],
    variants: [
      { sku: "GH-ACNP-36PK", name: "36 Pack", costPrice: 0.8, retailPrice: 9.99, compareAtPrice: 14.99, stock: 600, weight: 0.02 },
    ],
    images: [
      { url: "https://plus.unsplash.com/premium_photo-1771103348703-05e07bd52672?w=800", alt: "Woman applying pimple patches to face" },
      { url: "https://plus.unsplash.com/premium_photo-1771398422881-2e03a90ad39b?w=800", alt: "Person holding sheet of round acne patches" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 17,
  },
  {
    title: "Rosemary Hair Growth Oil",
    description:
      "Cold-pressed rosemary essential oil blend for hair growth and scalp health. Stimulates follicles, reduces hair loss, and adds shine. Apply to scalp before bed or mix into shampoo. The 'hair growth journey' staple trending across TikTok with millions of before-and-after videos.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005007500000002.html",
    supplierProductId: "1005007500000002",
    baseCost: 2.0,
    category: "Hair Care",
    tags: ["rosemary-oil", "hair-growth", "scalp-care", "essential-oil", "tiktok-viral"],
    variants: [
      { sku: "GH-RSMY-60ML", name: "60ml", costPrice: 2.0, retailPrice: 14.99, compareAtPrice: 22.99, stock: 400, weight: 0.12 },
    ],
    images: [
      { url: pexels(4856564), alt: "Amber glass bottle with green herbs — rosemary oil" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 18,
  },
  {
    title: "DIY Lash Extension Cluster Kit",
    description:
      "Professional-quality lash cluster kit with 72 individual lash segments in mixed lengths (10mm-16mm), bond-and-seal duo, and precision applicator tweezers. Achieve salon-quality lash extensions at home that last 5-7 days. The 'salon lashes at home' trend exploding on TikTok.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005007500000003.html",
    supplierProductId: "1005007500000003",
    baseCost: 2.5,
    category: "Makeup",
    tags: ["lash-clusters", "diy-lashes", "lash-extensions", "at-home", "tiktok-viral"],
    variants: [
      { sku: "GH-LSHK-NATRL", name: "Natural Mix", costPrice: 2.5, retailPrice: 16.99, compareAtPrice: 24.99, stock: 350, weight: 0.05 },
      { sku: "GH-LSHK-DRAMA", name: "Dramatic Mix", costPrice: 2.5, retailPrice: 16.99, compareAtPrice: 24.99, stock: 350, weight: 0.05 },
    ],
    images: [
      { url: pexels(5128316), alt: "Eyelash extension tools and tweezers on gold tray" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 19,
  },
  {
    title: "LED Teeth Whitening Kit",
    description:
      "At-home LED teeth whitening kit with blue light accelerator mouthpiece and 3 whitening gel syringes. Non-sensitive hydrogen peroxide formula whitens up to 8 shades in 7 days. USB rechargeable, 10-minute sessions. The viral smile transformation trending on TikTok.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/led-teeth-whitening-kit-blue-light-p-1500000000000000002.html",
    supplierProductId: "1500000000000000002",
    baseCost: 4.0,
    category: "Oral Care",
    tags: ["teeth-whitening", "led", "smile", "whitening-kit", "tiktok-viral"],
    variants: [
      { sku: "GH-TWHT-KIT", name: "Full Kit", costPrice: 4.0, retailPrice: 19.99, compareAtPrice: 34.99, stock: 200, weight: 0.15 },
    ],
    images: [
      { url: pexels(6529110), alt: "LED blue light teeth whitening treatment" },
    ],
    storeIndex: 0,
    isFeatured: true,
    position: 20,
  },

  // ═══════════════════════════════════════════════════════════
  // AURAE — Jewelry / Accessories (19 products)
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
    position: 7,
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
    position: 6,
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
    position: 8,
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
    position: 12,
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
    position: 13,
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
    position: 14,
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
    position: 15,
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
    position: 17,
  },

  {
    title: "Magnetic Couple Heart Bracelet Set",
    description:
      "Matching his-and-hers bracelets with magnetic heart halves that snap together. Braided leather cord with stainless steel magnetic clasp. The viral 'matching with my bf' couples accessory blowing up on TikTok. Perfect anniversary, Valentine's, or 'just because' gift.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005007600000001.html",
    supplierProductId: "1005007600000001",
    baseCost: 1.5,
    category: "Bracelets",
    tags: ["couple-bracelet", "magnetic", "heart", "matching", "tiktok-viral"],
    variants: [
      { sku: "AU-MGHB-BKWH", name: "Black & White Set", costPrice: 1.5, retailPrice: 16.99, compareAtPrice: 24.99, stock: 400, weight: 0.04 },
      { sku: "AU-MGHB-BKRD", name: "Black & Red Set", costPrice: 1.5, retailPrice: 16.99, compareAtPrice: 24.99, stock: 400, weight: 0.04 },
    ],
    images: [
      { url: pexels(1667850), alt: "Couple holding hands wearing matching bracelets" },
    ],
    storeIndex: 1,
    isFeatured: true,
    position: 16,
  },
  {
    title: "Gold Stackable Rings Set (8 Piece)",
    description:
      "Curated set of 8 dainty gold-plated stacking rings in varying textures — twisted rope, smooth band, CZ accent, hammered, beaded, signet mini, knot, and wave. Mix, match, and stack across all fingers. 18K PVD gold-plated stainless steel, waterproof and tarnish-free. Ring stacking is trending hard on TikTok right now.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005007600000002.html",
    supplierProductId: "1005007600000002",
    baseCost: 2.5,
    category: "Rings",
    tags: ["stacking-rings", "ring-set", "gold", "dainty", "tiktok-viral"],
    variants: [
      { sku: "AU-STKR-6G", name: "Size 6 - Gold", costPrice: 2.5, retailPrice: 14.99, compareAtPrice: 24.99, stock: 300, weight: 0.03 },
      { sku: "AU-STKR-7G", name: "Size 7 - Gold", costPrice: 2.5, retailPrice: 14.99, compareAtPrice: 24.99, stock: 300, weight: 0.03 },
      { sku: "AU-STKR-8G", name: "Size 8 - Gold", costPrice: 2.5, retailPrice: 14.99, compareAtPrice: 24.99, stock: 300, weight: 0.03 },
      { sku: "AU-STKR-6S", name: "Size 6 - Silver", costPrice: 2.5, retailPrice: 14.99, compareAtPrice: 24.99, stock: 250, weight: 0.03 },
      { sku: "AU-STKR-7S", name: "Size 7 - Silver", costPrice: 2.5, retailPrice: 14.99, compareAtPrice: 24.99, stock: 250, weight: 0.03 },
    ],
    images: [
      { url: pexels(1616096), alt: "Collection of gold rings displayed together" },
    ],
    storeIndex: 1,
    isFeatured: true,
    position: 18,
  },

  // ═══════════════════════════════════════════════════════════
  // NESTWELL — Home Decor / Cozy Living (17 products)
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
      { url: pexels(6915261), alt: "Rain cloud diffuser with illuminated mist" },
    ],
    storeIndex: 2,
    isFeatured: true,
    position: 7,
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
      { url: "https://images.unsplash.com/photo-1743192323078-e87254f1a625?w=800&q=80", alt: "Lamp casting warm sunset glow on wall" },
    ],
    storeIndex: 2,
    isFeatured: true,
    position: 0,
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
    isFeatured: false,
    position: 11,
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
    position: 15,
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
    position: 4,
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
    isFeatured: true,
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
    position: 9,
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
    position: 2,
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
    position: 5,
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
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 16,
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
    position: 12,
  },
  {
    title: "Vintage Candle Warmer Lamp",
    description:
      "The viral 'vanilla girl' candle warmer lamp that melts your favorite jar candles without a flame. Dimmable halogen bulb casts a warm golden glow while releasing fragrance slowly and evenly. Safer than burning — no soot, no smoke, no fire risk. Fits standard jar candles up to 4 inches wide.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/vintage-candle-warmer-lamp-dimmable-halogen-p-1800000000000000001.html",
    supplierProductId: "1800000000000000001",
    baseCost: 10.0,
    category: "Lighting",
    tags: ["candle-warmer", "lamp", "vintage", "vanilla-girl", "flameless"],
    variants: [
      { sku: "NW-CWLP-BLACK", name: "Matte Black", costPrice: 10.0, retailPrice: 39.99, compareAtPrice: 54.99, stock: 100, weight: 1.2 },
      { sku: "NW-CWLP-GOLD", name: "Brushed Gold", costPrice: 11.0, retailPrice: 42.99, compareAtPrice: 57.99, stock: 80, weight: 1.2 },
      { sku: "NW-CWLP-MARBLE", name: "Marble White", costPrice: 10.0, retailPrice: 39.99, compareAtPrice: 54.99, stock: 90, weight: 1.2 },
    ],
    images: [
      { url: pexels(35450921), alt: "Vintage candle warmer lamp with warm golden glow" },
    ],
    storeIndex: 2,
    isFeatured: true,
    position: 1,
  },
  {
    title: "Flame Effect Aroma Diffuser",
    description:
      "Mesmerizing flickering flame simulation meets essential oil diffuser. Ultrasonic mist with realistic fire-like LED effect creates an instant spa atmosphere. 7 color modes, whisper-quiet operation, and auto shut-off. USB-powered — perfect for bedside, bathroom, or desk.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005006835217890.html",
    supplierProductId: "1005006835217890",
    baseCost: 9.0,
    category: "Aromatherapy",
    tags: ["diffuser", "flame-effect", "aroma", "essential-oil", "spa"],
    variants: [
      { sku: "NW-FLMD-BLACK", name: "Volcanic Black", costPrice: 9.0, retailPrice: 34.99, compareAtPrice: 47.99, stock: 120, weight: 0.45 },
      { sku: "NW-FLMD-WHITE", name: "Cloud White", costPrice: 9.0, retailPrice: 34.99, compareAtPrice: 47.99, stock: 100, weight: 0.45 },
    ],
    images: [
      { url: pexels(7436112), alt: "Essential oil being added to aroma diffuser" },
    ],
    storeIndex: 2,
    isFeatured: true,
    position: 6,
  },
  {
    title: "Asymmetrical Wavy Wall Mirror",
    description:
      "Statement-making organic wavy mirror with an irregular cloud-like silhouette. Frameless design with polished edges for a clean, modern aesthetic. Shatterproof acrylic backing for safety. Includes keyhole hanging hardware. The Instagrammable accent piece every room needs.",
    supplierType: SupplierType.ALIEXPRESS,
    supplierUrl: "https://www.aliexpress.com/item/1005007456789012.html",
    supplierProductId: "1005007456789012",
    baseCost: 8.0,
    category: "Wall Decor",
    tags: ["mirror", "wavy", "asymmetrical", "aesthetic", "wall-decor"],
    variants: [
      { sku: "NW-WAVM-SM", name: "Small 14\"x10\"", costPrice: 8.0, retailPrice: 29.99, compareAtPrice: 39.99, stock: 120, weight: 0.6 },
      { sku: "NW-WAVM-LG", name: "Large 20\"x14\"", costPrice: 12.0, retailPrice: 44.99, compareAtPrice: 59.99, stock: 80, weight: 1.0 },
    ],
    images: [
      { url: pexels(18177370), alt: "Oval wall-mounted decorative mirror" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 10,
  },
  {
    title: "LED Crystal Vase Lamp",
    description:
      "Stunning crystal-effect vase with built-in LED warm-white fairy lights. Touch-dimmable with 3 brightness levels. USB-C rechargeable with 8-hour battery life. Use as a standalone ambient lamp or fill with dried flowers for a romantic centerpiece. The 'crystal vase lamp' going mega viral on TikTok right now — millions of views and counting.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    supplierUrl: "https://cjdropshipping.com/product/led-crystal-vase-lamp-touch-dimming-p-1800000000000000002.html",
    supplierProductId: "1800000000000000002",
    baseCost: 8.0,
    category: "Lighting",
    tags: ["crystal-vase", "led-lamp", "ambient", "romantic", "tiktok-viral"],
    variants: [
      { sku: "NW-CRVL-CLEAR", name: "Crystal Clear", costPrice: 8.0, retailPrice: 36.99, compareAtPrice: 49.99, stock: 150, weight: 0.55 },
      { sku: "NW-CRVL-PINK", name: "Rose Crystal", costPrice: 8.5, retailPrice: 38.99, compareAtPrice: 52.99, stock: 120, weight: 0.55 },
    ],
    images: [
      { url: pexels(4087825), alt: "Decorative vases with warm glowing lamp on windowsill" },
    ],
    storeIndex: 2,
    isFeatured: true,
    position: 14,
  },
];

// ─── Main Seed Function ───────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Clean up existing product data ────────────────────
  console.log("  🗑  Clearing existing product data...");
  await prisma.review.deleteMany();
  await prisma.coupon.deleteMany();
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

  // ─── Reviews ───────────────────────────────────────────
  console.log("\n📝 Seeding reviews...");

  const reviewNames = [
    "Sarah M.", "Jessica T.", "Emily R.", "Olivia K.", "Sophia L.",
    "Mia C.", "Hannah P.", "Abigail W.", "Isabella J.", "Ava G.",
    "Charlotte N.", "Amelia D.", "Ella B.", "Grace H.", "Lily F.",
    "Chloe V.", "Luna S.", "Aria Z.", "Natalie E.", "Zoey Q.",
    "James R.", "Michael T.", "David K.", "Ryan M.", "Alex B.",
  ];

  type ReviewPool = { bodies: Record<number, string[]>; titles: Record<number, string[]> };

  const beautyReviews: ReviewPool = {
    bodies: {
      5: [
        "Absolutely love this product! My skin has never looked better. Will definitely repurchase.",
        "This is a game-changer for my skincare routine. Noticed results within the first week.",
        "Holy grail product! I've tried so many others but nothing compares to this.",
        "The quality is incredible for the price. My friends keep asking what my secret is!",
        "Best purchase I've made in a while. My skin is glowing and so smooth now.",
        "Exceeded all my expectations! The packaging is beautiful and the product works amazingly.",
      ],
      4: [
        "Really good product overall. Takes a bit to see results but definitely worth it.",
        "Love the texture and how it absorbs quickly. Only wish the bottle was a bit bigger.",
        "Great addition to my routine. Skin feels softer and looks more radiant.",
        "Very pleased with this purchase. The scent is subtle and pleasant too.",
        "Works well for my skin type. Would recommend to friends looking for something gentle.",
      ],
      3: [
        "Decent product but nothing extraordinary. It works but I expected more dramatic results.",
        "Average experience. Works okay for the price point but I've tried better.",
        "Not bad, but not great either. My skin didn't react badly, just didn't see much change.",
      ],
      2: [
        "Didn't really work for my skin type. Caused some irritation after a few days.",
        "The product is okay but way overpriced for what you get. Wouldn't buy again.",
      ],
      1: [
        "Very disappointed. Broke me out terribly and the texture was off-putting.",
        "Would not recommend. Arrived leaking and the formula felt cheap.",
      ],
    },
    titles: {
      5: ["Obsessed!", "Best skincare find!", "Love love love", "My new favorite", "Worth every penny", "Amazing results", "So impressed", "A must-have"],
      4: ["Really good", "Solid product", "Happy with this", "Good quality", "Nice addition", "Would repurchase"],
      3: ["It's okay", "Average", "Decent", "Mixed feelings"],
      2: ["Not for me", "Disappointed", "Meh"],
      1: ["Terrible", "Don't buy", "Waste of money"],
    },
  };

  const jewelryReviews: ReviewPool = {
    bodies: {
      5: [
        "This piece is stunning! I get compliments every time I wear it. The craftsmanship is beautiful.",
        "Bought this as a gift and she absolutely loved it. The gold hasn't tarnished at all.",
        "Perfect everyday piece. I never take it off — shower, gym, everything. Still looks brand new.",
        "The photos don't do it justice! It's even more delicate and beautiful in person.",
        "I've been layering this with my other necklaces and it looks incredible. Such a versatile piece.",
        "Got this for my anniversary and my wife was thrilled. Gorgeous packaging too.",
      ],
      4: [
        "Really pretty piece. Slightly smaller than I expected but still love the look.",
        "Great quality for the price point. The clasp is secure and it sits nicely.",
        "Bought two colors and both are lovely. Would love to see more designs from this brand.",
        "Looks expensive and feels well-made. Happy with this purchase overall.",
        "Nice weight to it, not too heavy. The finish is smooth and polished.",
      ],
      3: [
        "It's cute but the chain is a bit thin for my taste. Decent for the price though.",
        "Looks nice but the clasp is a bit fiddly. Takes a while to put on by myself.",
      ],
      2: [
        "The color started fading after just two weeks. Expected better quality.",
        "Smaller than it looked in photos. Feels a bit cheap in person unfortunately.",
      ],
      1: [
        "Broke within the first week of wearing it. Very poor quality, avoid.",
        "Turned my skin green. Definitely not the material advertised.",
      ],
    },
    titles: {
      5: ["Absolutely gorgeous!", "Best jewelry find", "So elegant", "Love this piece", "Stunning quality", "Perfect gift", "Obsessed with this", "Daily wear essential"],
      4: ["Really pretty", "Nice quality", "Happy with this", "Good value", "Lovely piece"],
      3: ["It's fine", "Average quality", "Okay for the price"],
      2: ["Disappointed", "Not as shown", "Could be better"],
      1: ["Terrible quality", "Broke immediately", "Don't waste your money"],
    },
  };

  const homeReviews: ReviewPool = {
    bodies: {
      5: [
        "This completely transformed my living room! The quality is amazing and it looks so expensive.",
        "Exactly what I was looking for. It ties the whole room together beautifully.",
        "The warm glow from this lamp makes my bedroom feel like a cozy retreat. Love it!",
        "Got so many compliments from guests. Everyone asks where I got it from!",
        "Beautiful piece that adds so much character to our space. The craftsmanship is top-notch.",
        "Packed incredibly well — zero damage. The quality exceeded my expectations for this price.",
      ],
      4: [
        "Really nice addition to our home. The color is slightly warmer than the photos but still gorgeous.",
        "Good quality and well-made. Fits perfectly on our side table. Would buy from this brand again.",
        "Love the aesthetic. Assembly was easy and it looks great in our reading nook.",
        "Very pleased with this purchase. The material feels premium and substantial.",
        "Beautiful design that works with multiple room styles. Happy with the versatility.",
      ],
      3: [
        "Decent quality but the color didn't quite match what I saw online. Still keeping it though.",
        "It's okay for the price. Nothing special but it does the job and looks fine.",
        "Average quality. Expected a bit more based on the product photos.",
      ],
      2: [
        "The material feels cheaper than expected. Looks fine from a distance but not up close.",
        "Arrived with a small scratch on the surface. Customer service was slow to respond.",
      ],
      1: [
        "Arrived damaged and poorly packaged. Returning this immediately.",
        "Looks nothing like the photos. Very cheaply made, total waste of money.",
      ],
    },
    titles: {
      5: ["Room transformation!", "Absolutely love it", "Perfect piece", "So cozy!", "Stunning quality", "Worth every penny", "Best home find", "Gorgeous addition"],
      4: ["Really nice", "Good quality", "Happy with this", "Looks great", "Nice addition"],
      3: ["It's okay", "Decent", "Average", "Fine for the price"],
      2: ["Not impressed", "Disappointed", "Expected more"],
      1: ["Terrible", "Arrived damaged", "Waste of money"],
    },
  };

  const reviewPoolByStore: Record<string, ReviewPool> = {
    glowhaven: beautyReviews,
    aurae: jewelryReviews,
    nestwell: homeReviews,
  };

  // Fetch all products with their store assignments
  const allStoreProducts = await prisma.storeProduct.findMany({
    include: { product: true, store: true },
  });

  let reviewCount = 0;
  for (const sp of allStoreProducts) {
    const pool = reviewPoolByStore[sp.store.slug] || beautyReviews;

    // 3-8 reviews per product
    const numReviews = 3 + Math.floor(Math.random() * 6);
    for (let r = 0; r < numReviews; r++) {
      // Weighted rating: 55% 5-star, 25% 4-star, 12% 3-star, 5% 2-star, 3% 1-star
      const roll = Math.random();
      const rating = roll < 0.55 ? 5 : roll < 0.80 ? 4 : roll < 0.92 ? 3 : roll < 0.97 ? 2 : 1;

      const bodies = pool.bodies[rating]!;
      const titles = pool.titles[rating]!;

      const authorName = reviewNames[Math.floor(Math.random() * reviewNames.length)];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const body = bodies[Math.floor(Math.random() * bodies.length)];
      const verified = Math.random() < 0.65;

      // Random date in last 90 days
      const daysAgo = Math.floor(Math.random() * 90);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      await prisma.review.create({
        data: {
          productId: sp.productId,
          storeId: sp.storeId,
          rating,
          title,
          body,
          authorName,
          authorEmail: `${authorName.toLowerCase().replace(/[^a-z]/g, "")}@example.com`,
          verified,
          createdAt,
        },
      });
      reviewCount++;
    }
  }
  console.log(`  ✓ ${reviewCount} reviews seeded`);

  // ─── Coupons ──────────────────────────────────────────
  console.log("\n🎟  Seeding coupons...");

  const couponTemplates = [
    { code: "WELCOME10", discountType: "PERCENTAGE" as const, value: 10, minOrderAmount: null, maxUses: null },
    { code: "FREESHIP", discountType: "FREE_SHIPPING" as const, value: 0, minOrderAmount: null, maxUses: null },
    { code: "SAVE5", discountType: "FIXED_AMOUNT" as const, value: 5, minOrderAmount: 30, maxUses: 100 },
  ];

  for (const store of stores) {
    for (const tmpl of couponTemplates) {
      await prisma.coupon.create({
        data: {
          storeId: store.id,
          code: tmpl.code,
          discountType: tmpl.discountType,
          value: tmpl.value,
          minOrderAmount: tmpl.minOrderAmount,
          maxUses: tmpl.maxUses,
          isActive: true,
        },
      });
    }
  }
  console.log(`  ✓ ${couponTemplates.length * stores.length} coupons seeded (${couponTemplates.map((c) => c.code).join(", ")})`);

  console.log(`\n✅ Seed complete! ${products.length} products across 3 stores.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
