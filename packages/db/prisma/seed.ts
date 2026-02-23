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
  // GLOWHAVEN — Beauty / Skincare (15 products)
  // ═══════════════════════════════════════════════════════════
  {
    title: "Peeling Exfoliating Serum",
    description:
      "Gentle AHA/BHA peeling serum for smooth, radiant skin. Removes dead skin cells and unclogs pores for a glass-skin finish.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    baseCost: 4.5,
    category: "Skincare",
    tags: ["serum", "exfoliant", "glass-skin", "aha", "bha"],
    variants: [
      { sku: "GH-PEEL-30ML", name: "30ml", costPrice: 4.5, retailPrice: 24.99, compareAtPrice: 32.99, stock: 100, weight: 0.15 },
    ],
    images: [
      { url: unsplash("photo-1611930022073-b7a4ba5fcccd"), alt: "Peeling Exfoliating Serum bottle" },
      { url: unsplash("photo-1556228578-0d85b1a4d571"), alt: "Peeling Exfoliating Serum product" },
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
    baseCost: 18.0,
    category: "Tools",
    tags: ["led", "face-mask", "anti-aging", "therapy", "device"],
    variants: [
      { sku: "GH-LED-MASK", name: "Standard", costPrice: 18.0, retailPrice: 69.99, compareAtPrice: 89.99, stock: 50, weight: 0.45 },
    ],
    images: [
      { url: unsplash("photo-1596944924616-7b38e7cfac36"), alt: "LED Light Therapy Face Mask" },
      { url: unsplash("photo-1631729371254-42c2892f0e6e"), alt: "LED Face Mask glowing" },
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
    baseCost: 2.8,
    category: "Tools",
    tags: ["ice-roller", "de-puff", "facial-tool", "cryo", "skincare-tool"],
    variants: [
      { sku: "GH-ICER-PINK", name: "Pink", costPrice: 2.8, retailPrice: 12.99, compareAtPrice: 18.99, stock: 300, weight: 0.18 },
      { sku: "GH-ICER-WHITE", name: "White", costPrice: 2.8, retailPrice: 12.99, compareAtPrice: 18.99, stock: 300, weight: 0.18 },
    ],
    images: [
      { url: unsplash("photo-1620916566398-39f1143ab7be"), alt: "Ice Roller Face Massager" },
      { url: unsplash("photo-1556228720-195a672e8a03"), alt: "Ice Roller skincare tool" },
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
    baseCost: 3.5,
    category: "Tools",
    tags: ["gua-sha", "jade-roller", "rose-quartz", "facial-massage", "gift-set"],
    variants: [
      { sku: "GH-GUAJ-ROSE", name: "Rose Quartz", costPrice: 3.5, retailPrice: 16.99, compareAtPrice: 24.99, stock: 250, weight: 0.22 },
      { sku: "GH-GUAJ-GREEN", name: "Green Jade", costPrice: 3.5, retailPrice: 16.99, compareAtPrice: 24.99, stock: 250, weight: 0.22 },
    ],
    images: [
      { url: unsplash("photo-1612817288484-6f916006741a"), alt: "Rose Quartz Gua Sha and Jade Roller" },
      { url: unsplash("photo-1598560917505-59a3ad559071"), alt: "Gua Sha stone close-up" },
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
    baseCost: 5.2,
    category: "Skincare",
    tags: ["snail-mucin", "essence", "k-beauty", "glass-skin", "hydrating"],
    variants: [
      { sku: "GH-SNML-100ML", name: "100ml", costPrice: 5.2, retailPrice: 22.99, compareAtPrice: 29.99, stock: 180, weight: 0.18 },
    ],
    images: [
      { url: unsplash("photo-1608248543803-ba4f8c70ae0b"), alt: "Snail Mucin Essence bottle" },
      { url: unsplash("photo-1598440947619-2c35fc9aa908"), alt: "Snail Mucin skincare" },
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
    baseCost: 3.8,
    category: "Skincare",
    tags: ["vitamin-c", "brightening", "serum", "dark-spots", "anti-aging"],
    variants: [
      { sku: "GH-VITC-30ML", name: "30ml", costPrice: 3.8, retailPrice: 18.99, compareAtPrice: 24.99, stock: 200, weight: 0.12 },
      { sku: "GH-VITC-60ML", name: "60ml", costPrice: 5.5, retailPrice: 28.99, compareAtPrice: 36.99, stock: 120, weight: 0.2 },
    ],
    images: [
      { url: unsplash("photo-1643379850623-7eb6442cd262"), alt: "Vitamin C Brightening Serum bottle" },
      { url: unsplash("photo-1643379850274-77d2e3703ef9"), alt: "Vitamin C serum dropper" },
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
    baseCost: 12.0,
    category: "Tools",
    tags: ["derma-pen", "microneedling", "collagen", "anti-aging", "professional"],
    variants: [
      { sku: "GH-DRMP-STD", name: "Device + 3 Cartridges", costPrice: 12.0, retailPrice: 44.99, compareAtPrice: 59.99, stock: 80, weight: 0.25 },
      { sku: "GH-DRMP-PRO", name: "Device + 7 Cartridges", costPrice: 15.0, retailPrice: 59.99, compareAtPrice: 79.99, stock: 50, weight: 0.3 },
    ],
    images: [
      { url: unsplash("photo-1711504039975-47a6f424d8b4"), alt: "Derma Pen Microneedling Device" },
      { url: unsplash("photo-1711504041983-26992adf63bc"), alt: "Microneedling pen with cartridges" },
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
      { url: unsplash("photo-1670201203270-7bc9b329d2eb"), alt: "Jelly mask application" },
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
    baseCost: 6.5,
    category: "Tools",
    tags: ["cleansing-brush", "sonic", "silicone", "pore-cleaner", "electric"],
    variants: [
      { sku: "GH-CLBR-PINK", name: "Pink", costPrice: 6.5, retailPrice: 24.99, compareAtPrice: 34.99, stock: 120, weight: 0.15 },
      { sku: "GH-CLBR-MINT", name: "Mint", costPrice: 6.5, retailPrice: 24.99, compareAtPrice: 34.99, stock: 120, weight: 0.15 },
    ],
    images: [
      { url: unsplash("photo-1712481695743-510ab876c629"), alt: "Silicone Face Cleansing Brush" },
      { url: unsplash("photo-1712482937664-5697b56ed6f1"), alt: "Electric cleansing brush pink" },
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
    baseCost: 4.8,
    category: "Skincare",
    tags: ["retinol", "anti-aging", "night-cream", "peptides", "firming"],
    variants: [
      { sku: "GH-RETN-50ML", name: "50ml", costPrice: 4.8, retailPrice: 19.99, compareAtPrice: 28.99, stock: 160, weight: 0.18 },
    ],
    images: [
      { url: unsplash("photo-1638301868496-43577744a46c"), alt: "Retinol Anti-Aging Night Cream" },
      { url: unsplash("photo-1643379852776-308d9bbf8645"), alt: "Night cream jar on vanity" },
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
    baseCost: 2.2,
    category: "Skincare",
    tags: ["lip-mask", "overnight", "honey", "lip-care", "k-beauty"],
    variants: [
      { sku: "GH-LIPM-HONEY", name: "Honey", costPrice: 2.2, retailPrice: 9.99, compareAtPrice: 14.99, stock: 400, weight: 0.08 },
      { sku: "GH-LIPM-BERRY", name: "Mixed Berry", costPrice: 2.2, retailPrice: 9.99, compareAtPrice: 14.99, stock: 400, weight: 0.08 },
    ],
    images: [
      { url: unsplash("photo-1622399638175-b1d4457118e1"), alt: "Honey Lip Sleeping Mask pot" },
      { url: unsplash("photo-1560249406-bbb118c4f6db"), alt: "Lip mask application" },
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
    baseCost: 3.0,
    category: "Masks",
    tags: ["eye-patches", "collagen", "gold", "dark-circles", "hydrogel"],
    variants: [
      { sku: "GH-EYEP-GOLD", name: "24K Gold (30 pairs)", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 19.99, stock: 250, weight: 0.2 },
    ],
    images: [
      { url: unsplash("photo-1670201202784-ec638a82bca8"), alt: "Gold Collagen Under-Eye Patches" },
      { url: unsplash("photo-1670201202794-b589d5d7e9da"), alt: "Eye patches in jar" },
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
    baseCost: 1.5,
    category: "Body Care",
    tags: ["body-scrub", "exfoliating-glove", "korean", "kp", "body-care"],
    variants: [
      { sku: "GH-EXGL-3PK", name: "3-Pack", costPrice: 1.5, retailPrice: 7.99, compareAtPrice: 11.99, stock: 500, weight: 0.06 },
      { sku: "GH-EXGL-6PK", name: "6-Pack", costPrice: 2.8, retailPrice: 12.99, compareAtPrice: 18.99, stock: 300, weight: 0.12 },
    ],
    images: [
      { url: unsplash("photo-1593360885059-85b63a3ac768"), alt: "Exfoliating Body Scrub Glove" },
      { url: unsplash("photo-1609357912334-e96886c0212b"), alt: "Korean scrub mitt" },
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
    baseCost: 2.5,
    category: "Accessories",
    tags: ["headband", "spa", "wristband", "skincare-accessory", "aesthetic"],
    variants: [
      { sku: "GH-SPAH-PINK", name: "Pink", costPrice: 2.5, retailPrice: 11.99, compareAtPrice: 16.99, stock: 350, weight: 0.1 },
      { sku: "GH-SPAH-WHITE", name: "White", costPrice: 2.5, retailPrice: 11.99, compareAtPrice: 16.99, stock: 350, weight: 0.1 },
      { sku: "GH-SPAH-LAVEN", name: "Lavender", costPrice: 2.5, retailPrice: 11.99, compareAtPrice: 16.99, stock: 350, weight: 0.1 },
    ],
    images: [
      { url: unsplash("photo-1627945861767-826948871673"), alt: "Spa Headband and Wrist Set" },
      { url: unsplash("photo-1595846398252-213927165ffb"), alt: "Fluffy spa headband" },
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
    baseCost: 4.0,
    category: "Skincare",
    tags: ["sunscreen", "spf50", "glass-skin", "k-beauty", "dewy"],
    variants: [
      { sku: "GH-SPF-50ML", name: "50ml", costPrice: 4.0, retailPrice: 18.99, compareAtPrice: 26.99, stock: 200, weight: 0.12 },
    ],
    images: [
      { url: unsplash("photo-1683488780092-1643c389aace"), alt: "Glass Skin SPF 50 Sunscreen" },
      { url: unsplash("photo-1584551012472-5fa498c9f86e"), alt: "Dewy sunscreen tube" },
    ],
    storeIndex: 0,
    isFeatured: false,
    position: 14,
  },

  // ═══════════════════════════════════════════════════════════
  // AURAE — Jewelry / Accessories (15 products)
  // ═══════════════════════════════════════════════════════════
  {
    title: "Hidden Love Projection Necklace",
    description:
      'Elegant gold-plated necklace with a hidden photo projection. Light shines through the pendant to reveal a custom "I Love You" message.',
    supplierType: SupplierType.CJ_DROPSHIPPING,
    baseCost: 4.0,
    category: "Necklaces",
    tags: ["necklace", "projection", "gift", "love", "gold"],
    variants: [
      { sku: "AU-PROJ-GOLD", name: "Gold", costPrice: 4.0, retailPrice: 29.99, compareAtPrice: 39.99, stock: 200, weight: 0.05 },
      { sku: "AU-PROJ-SILVER", name: "Silver", costPrice: 4.0, retailPrice: 29.99, compareAtPrice: 39.99, stock: 200, weight: 0.05 },
    ],
    images: [
      { url: unsplash("photo-1598009632415-1b42a2c686b6"), alt: "Hidden Love Projection Necklace" },
      { url: unsplash("photo-1758995115543-983c55f98a33"), alt: "Gold projection pendant" },
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
    baseCost: 3.5,
    category: "Earrings",
    tags: ["hoops", "gold", "chunky", "everyday", "tarnish-resistant"],
    variants: [
      { sku: "AU-HOOP-25MM", name: "25mm - Gold", costPrice: 3.5, retailPrice: 16.99, compareAtPrice: 22.99, stock: 300, weight: 0.02 },
      { sku: "AU-HOOP-35MM", name: "35mm - Gold", costPrice: 3.8, retailPrice: 18.99, compareAtPrice: 24.99, stock: 250, weight: 0.03 },
      { sku: "AU-HOOP-25SLV", name: "25mm - Silver", costPrice: 3.5, retailPrice: 16.99, compareAtPrice: 22.99, stock: 300, weight: 0.02 },
    ],
    images: [
      { url: unsplash("photo-1763628212781-7d52844cf358"), alt: "Gold Chunky Hoop Earrings" },
      { url: unsplash("photo-1708389828544-b394501c5700"), alt: "18K hoop earrings pair" },
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
    baseCost: 3.0,
    category: "Necklaces",
    tags: ["birth-flower", "pendant", "personalized", "gift", "dainty"],
    variants: [
      { sku: "AU-BFLR-GOLD", name: "Gold", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 22.99, stock: 400, weight: 0.02 },
      { sku: "AU-BFLR-SILVER", name: "Silver", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 22.99, stock: 400, weight: 0.02 },
      { sku: "AU-BFLR-ROSE", name: "Rose Gold", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 22.99, stock: 400, weight: 0.02 },
    ],
    images: [
      { url: unsplash("photo-1771515411694-57fb626159d1"), alt: "Birth Flower Pendant Necklace" },
      { url: unsplash("photo-1767391255584-763f98ced9d0"), alt: "Dainty gold flower pendant" },
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
    baseCost: 2.5,
    category: "Rings",
    tags: ["signet", "vintage", "stackable", "old-money", "minimalist"],
    variants: [
      { sku: "AU-SGNT-6G", name: "Size 6 - Gold", costPrice: 2.5, retailPrice: 12.99, compareAtPrice: 18.99, stock: 200, weight: 0.01 },
      { sku: "AU-SGNT-7G", name: "Size 7 - Gold", costPrice: 2.5, retailPrice: 12.99, compareAtPrice: 18.99, stock: 200, weight: 0.01 },
      { sku: "AU-SGNT-8G", name: "Size 8 - Gold", costPrice: 2.5, retailPrice: 12.99, compareAtPrice: 18.99, stock: 200, weight: 0.01 },
    ],
    images: [
      { url: unsplash("photo-1728381031272-ba3f537feadd"), alt: "Vintage Gold Signet Ring" },
      { url: unsplash("photo-1677578329568-0fa5aafd022e"), alt: "Gold pinky ring close-up" },
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
    baseCost: 5.0,
    category: "Necklaces",
    tags: ["layered", "chain", "necklace-set", "choker", "paperclip"],
    variants: [
      { sku: "AU-LAYR-GOLD", name: "Gold", costPrice: 5.0, retailPrice: 24.99, compareAtPrice: 34.99, stock: 180, weight: 0.04 },
      { sku: "AU-LAYR-SILVER", name: "Silver", costPrice: 5.0, retailPrice: 24.99, compareAtPrice: 34.99, stock: 180, weight: 0.04 },
    ],
    images: [
      { url: unsplash("photo-1659682695085-6b66aa8bfef2"), alt: "3-Layer Gold Chain Necklace Set" },
      { url: unsplash("photo-1758995115560-59c10d6cc28f"), alt: "Layered gold chains" },
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
    baseCost: 2.2,
    category: "Hair Accessories",
    tags: ["claw-clip", "pearl", "hair-clip", "clean-girl", "oversized"],
    variants: [
      { sku: "AU-PCLW-CREAM", name: "Cream", costPrice: 2.2, retailPrice: 11.99, compareAtPrice: 16.99, stock: 350, weight: 0.04 },
      { sku: "AU-PCLW-BLACK", name: "Black Pearl", costPrice: 2.2, retailPrice: 11.99, compareAtPrice: 16.99, stock: 350, weight: 0.04 },
    ],
    images: [
      { url: unsplash("photo-1715781055906-79a70879eeea"), alt: "Oversized Pearl Claw Clip" },
      { url: unsplash("photo-1762337379880-399126a1d27c"), alt: "Pearl hair clip styling" },
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
    baseCost: 6.0,
    category: "Bracelets",
    tags: ["tennis-bracelet", "cz", "waterproof", "pvd", "diamond"],
    variants: [
      { sku: "AU-TENB-GOLD", name: "Gold", costPrice: 6.0, retailPrice: 26.99, compareAtPrice: 39.99, stock: 150, weight: 0.03 },
      { sku: "AU-TENB-SILVER", name: "Silver", costPrice: 6.0, retailPrice: 26.99, compareAtPrice: 39.99, stock: 150, weight: 0.03 },
    ],
    images: [
      { url: unsplash("photo-1663243818736-2b7148eeb2f5"), alt: "CZ Diamond Tennis Bracelet" },
      { url: unsplash("photo-1705873222806-ba76ecb02430"), alt: "Waterproof tennis bracelet" },
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
    baseCost: 4.5,
    category: "Earrings",
    tags: ["huggie", "earring-set", "stacking", "hypoallergenic", "mini"],
    variants: [
      { sku: "AU-HUGG-GOLD", name: "Gold Set", costPrice: 4.5, retailPrice: 19.99, compareAtPrice: 28.99, stock: 200, weight: 0.02 },
      { sku: "AU-HUGG-SILVER", name: "Silver Set", costPrice: 4.5, retailPrice: 19.99, compareAtPrice: 28.99, stock: 200, weight: 0.02 },
    ],
    images: [
      { url: unsplash("photo-1727791762060-978deff14028"), alt: "Mini Huggie Earring Set" },
      { url: unsplash("photo-1708389827899-990e74c0cc6c"), alt: "Gold huggie hoops set" },
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
    baseCost: 3.2,
    category: "Rings",
    tags: ["croissant", "dome-ring", "quiet-luxury", "bold", "statement"],
    variants: [
      { sku: "AU-CRST-6G", name: "Size 6 - Gold", costPrice: 3.2, retailPrice: 14.99, compareAtPrice: 21.99, stock: 200, weight: 0.02 },
      { sku: "AU-CRST-7G", name: "Size 7 - Gold", costPrice: 3.2, retailPrice: 14.99, compareAtPrice: 21.99, stock: 200, weight: 0.02 },
      { sku: "AU-CRST-8G", name: "Size 8 - Gold", costPrice: 3.2, retailPrice: 14.99, compareAtPrice: 21.99, stock: 200, weight: 0.02 },
    ],
    images: [
      { url: unsplash("photo-1758995116383-f51775896add"), alt: "18K Gold Croissant Dome Ring" },
      { url: unsplash("photo-1679019937172-0b2ef456a29d"), alt: "Gold dome ring on hand" },
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
    baseCost: 2.0,
    category: "Bracelets",
    tags: ["anklet", "butterfly", "dainty", "summer", "charm"],
    variants: [
      { sku: "AU-BFLY-GOLD", name: "Gold", costPrice: 2.0, retailPrice: 9.99, compareAtPrice: 14.99, stock: 400, weight: 0.01 },
      { sku: "AU-BFLY-SILVER", name: "Silver", costPrice: 2.0, retailPrice: 9.99, compareAtPrice: 14.99, stock: 400, weight: 0.01 },
    ],
    images: [
      { url: unsplash("photo-1705326452395-1d35e6add570"), alt: "Dainty Butterfly Charm Anklet" },
      { url: unsplash("photo-1758297679736-2e6ff92d2021"), alt: "Gold butterfly anklet" },
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
    baseCost: 3.5,
    category: "Necklaces",
    tags: ["initial", "bubble-letter", "personalized", "gift", "pendant"],
    variants: [
      { sku: "AU-BUBL-GOLD", name: "Gold", costPrice: 3.5, retailPrice: 16.99, compareAtPrice: 24.99, stock: 300, weight: 0.02 },
      { sku: "AU-BUBL-SILVER", name: "Silver", costPrice: 3.5, retailPrice: 16.99, compareAtPrice: 24.99, stock: 300, weight: 0.02 },
    ],
    images: [
      { url: unsplash("photo-1671663906664-9586041c3aa1"), alt: "Bubble Letter Initial Necklace" },
      { url: unsplash("photo-1733761013921-89d19f4a2194"), alt: "Gold bubble letter pendant" },
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
    baseCost: 3.8,
    category: "Hair Accessories",
    tags: ["silk", "scrunchie", "mulberry", "hair-care", "anti-breakage"],
    variants: [
      { sku: "AU-SLKS-NEUT", name: "Neutral Tones", costPrice: 3.8, retailPrice: 18.99, compareAtPrice: 26.99, stock: 250, weight: 0.05 },
      { sku: "AU-SLKS-JEWL", name: "Jewel Tones", costPrice: 3.8, retailPrice: 18.99, compareAtPrice: 26.99, stock: 250, weight: 0.05 },
    ],
    images: [
      { url: unsplash("photo-1701559459709-423baf04e60f"), alt: "Silk Scrunchie Set 6 Pack" },
      { url: unsplash("photo-1762114469204-0aa2cbfa609d"), alt: "Mulberry silk scrunchies" },
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
    baseCost: 3.0,
    category: "Bracelets",
    tags: ["evil-eye", "charm", "protection", "adjustable", "gift"],
    variants: [
      { sku: "AU-EVIL-GOLD", name: "Gold", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 19.99, stock: 250, weight: 0.02 },
      { sku: "AU-EVIL-SILVER", name: "Silver", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 19.99, stock: 250, weight: 0.02 },
      { sku: "AU-EVIL-ROSE", name: "Rose Gold", costPrice: 3.0, retailPrice: 14.99, compareAtPrice: 19.99, stock: 250, weight: 0.02 },
    ],
    images: [
      { url: unsplash("photo-1615920887486-dc0c3a035405"), alt: "Evil Eye Charm Bracelet" },
      { url: unsplash("photo-1626122738142-bbd66f671eca"), alt: "Evil eye bracelet close-up" },
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
    baseCost: 2.8,
    category: "Earrings",
    tags: ["ear-cuff", "no-piercing", "clip-on", "stacking", "set"],
    variants: [
      { sku: "AU-ECUF-GOLD", name: "Gold (5-piece)", costPrice: 2.8, retailPrice: 13.99, compareAtPrice: 19.99, stock: 300, weight: 0.02 },
      { sku: "AU-ECUF-SILVER", name: "Silver (5-piece)", costPrice: 2.8, retailPrice: 13.99, compareAtPrice: 19.99, stock: 300, weight: 0.02 },
    ],
    images: [
      { url: unsplash("photo-1643387774154-4ec59518f9a5"), alt: "Gold Ear Cuff Set" },
      { url: unsplash("photo-1614606140905-6a5e931e5c39"), alt: "Ear cuffs on ear" },
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
    baseCost: 4.5,
    category: "Necklaces",
    tags: ["herringbone", "chain", "flat", "waterproof", "everyday"],
    variants: [
      { sku: "AU-HERB-16G", name: '16" - Gold', costPrice: 4.5, retailPrice: 21.99, compareAtPrice: 29.99, stock: 180, weight: 0.03 },
      { sku: "AU-HERB-18G", name: '18" - Gold', costPrice: 5.0, retailPrice: 23.99, compareAtPrice: 32.99, stock: 180, weight: 0.04 },
      { sku: "AU-HERB-16S", name: '16" - Silver', costPrice: 4.5, retailPrice: 21.99, compareAtPrice: 29.99, stock: 180, weight: 0.03 },
    ],
    images: [
      { url: unsplash("photo-1725033796879-f8c3a3309c0c"), alt: "Flat Herringbone Chain Necklace" },
      { url: unsplash("photo-1769909953707-31840816c5b3"), alt: "Gold herringbone chain" },
    ],
    storeIndex: 1,
    isFeatured: false,
    position: 14,
  },

  // ═══════════════════════════════════════════════════════════
  // NESTWELL — Home Decor (15 products)
  // ═══════════════════════════════════════════════════════════
  {
    title: "Rain Cloud Aroma Diffuser",
    description:
      "Mesmerizing rain cloud humidifier with water dripping effect. Includes essential oil diffuser, LED mood light, and whisper-quiet operation.",
    supplierType: SupplierType.CJ_DROPSHIPPING,
    baseCost: 17.0,
    category: "Aromatherapy",
    tags: ["diffuser", "humidifier", "rain-cloud", "aroma", "aesthetic"],
    variants: [
      { sku: "NW-RAIN-WHITE", name: "White", costPrice: 17.0, retailPrice: 54.99, compareAtPrice: 69.99, stock: 75, weight: 0.8 },
    ],
    images: [
      { url: unsplash("photo-1607713109008-d00372938c2d"), alt: "Rain Cloud Aroma Diffuser" },
      { url: unsplash("photo-1636714507452-48716cfa1818"), alt: "Cloud diffuser with mist" },
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
    baseCost: 7.5,
    category: "Lighting",
    tags: ["sunset-lamp", "projector", "golden-hour", "tiktok", "mood-light"],
    variants: [
      { sku: "NW-SNST-WARM", name: "Warm Sunset", costPrice: 7.5, retailPrice: 29.99, compareAtPrice: 39.99, stock: 120, weight: 0.35 },
      { sku: "NW-SNST-RAIN", name: "Rainbow", costPrice: 8.0, retailPrice: 32.99, compareAtPrice: 42.99, stock: 100, weight: 0.35 },
    ],
    images: [
      { url: unsplash("photo-1764530926841-4ffd875b97c2"), alt: "Sunset Lamp Projector glow" },
      { url: unsplash("photo-1761083042094-988fd3a3ae69"), alt: "Golden hour sunset lamp" },
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
    baseCost: 9.0,
    category: "Lighting",
    tags: ["mushroom-lamp", "retro", "led", "rechargeable", "touch-dimming"],
    variants: [
      { sku: "NW-MUSH-WHITE", name: "Cream White", costPrice: 9.0, retailPrice: 34.99, compareAtPrice: 44.99, stock: 90, weight: 0.4 },
      { sku: "NW-MUSH-OLIVE", name: "Olive Green", costPrice: 9.0, retailPrice: 34.99, compareAtPrice: 44.99, stock: 90, weight: 0.4 },
      { sku: "NW-MUSH-AMBER", name: "Amber", costPrice: 9.0, retailPrice: 34.99, compareAtPrice: 44.99, stock: 90, weight: 0.4 },
    ],
    images: [
      { url: unsplash("photo-1761083042130-3875fe970bd5"), alt: "Mushroom LED Table Lamp" },
      { url: unsplash("photo-1761634731333-9cca08c77eae"), alt: "Retro mushroom lamp glow" },
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
    baseCost: 8.5,
    category: "Wall Decor",
    tags: ["cloud-shelf", "floating", "nursery", "whimsical", "wall-shelf"],
    variants: [
      { sku: "NW-CLSH-WHITE", name: "White", costPrice: 8.5, retailPrice: 29.99, compareAtPrice: 39.99, stock: 80, weight: 0.9 },
      { sku: "NW-CLSH-WOOD", name: "Natural Wood", costPrice: 9.0, retailPrice: 32.99, compareAtPrice: 42.99, stock: 60, weight: 0.95 },
    ],
    images: [
      { url: unsplash("photo-1719941032639-fb6c2d163cb0"), alt: "Floating Cloud Wall Shelf" },
      { url: unsplash("photo-1677362486085-05e9ae48d2bc"), alt: "Cloud shelf with decor" },
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
    baseCost: 8.0,
    category: "Textiles",
    tags: ["knot-pillow", "nordic", "decorative", "throw-pillow", "cozy"],
    variants: [
      { sku: "NW-KNOT-WHITE", name: "White", costPrice: 8.0, retailPrice: 29.99, compareAtPrice: 39.99, stock: 100, weight: 0.6 },
      { sku: "NW-KNOT-SAGE", name: "Sage Green", costPrice: 8.0, retailPrice: 29.99, compareAtPrice: 39.99, stock: 100, weight: 0.6 },
      { sku: "NW-KNOT-BLUSH", name: "Blush Pink", costPrice: 8.0, retailPrice: 29.99, compareAtPrice: 39.99, stock: 100, weight: 0.6 },
    ],
    images: [
      { url: unsplash("photo-1767193959809-1df4e34c69f9"), alt: "Nordic Knot Throw Pillow" },
      { url: unsplash("photo-1670080589800-6416c8ce8a14"), alt: "Knotted pillow on sofa" },
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
    baseCost: 22.0,
    category: "Organization",
    tags: ["bookshelf", "rotating", "space-saving", "booktok", "tower"],
    variants: [
      { sku: "NW-RBOK-WHITE", name: "White", costPrice: 22.0, retailPrice: 64.99, compareAtPrice: 84.99, stock: 40, weight: 4.5 },
      { sku: "NW-RBOK-WOOD", name: "Natural Wood", costPrice: 22.0, retailPrice: 64.99, compareAtPrice: 84.99, stock: 40, weight: 4.5 },
    ],
    images: [
      { url: unsplash("photo-1517562652858-8d863a9e0931"), alt: "Rotating Bookshelf Tower" },
      { url: unsplash("photo-1648190627457-d2299e8a904b"), alt: "Bookshelf tower with books" },
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
    baseCost: 15.0,
    category: "Textiles",
    tags: ["chunky-knit", "blanket", "throw", "cozy", "chenille"],
    variants: [
      { sku: "NW-CKNK-40-CREAM", name: '40x60" - Cream', costPrice: 15.0, retailPrice: 49.99, compareAtPrice: 64.99, stock: 60, weight: 2.0 },
      { sku: "NW-CKNK-40-GREY", name: '40x60" - Grey', costPrice: 15.0, retailPrice: 49.99, compareAtPrice: 64.99, stock: 60, weight: 2.0 },
      { sku: "NW-CKNK-60-CREAM", name: '60x80" - Cream', costPrice: 22.0, retailPrice: 69.99, compareAtPrice: 89.99, stock: 35, weight: 3.2 },
    ],
    images: [
      { url: unsplash("photo-1674475760738-8c7af859f821"), alt: "Chunky Knit Throw Blanket" },
      { url: unsplash("photo-1634208006016-07c6d95cfac8"), alt: "Oversized knit blanket" },
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
    baseCost: 6.5,
    category: "Aromatherapy",
    tags: ["soy-candle", "hand-poured", "gift-set", "minimalist", "scented"],
    variants: [
      { sku: "NW-SOYC-3PK", name: "3-Pack Sampler", costPrice: 6.5, retailPrice: 24.99, compareAtPrice: 34.99, stock: 150, weight: 0.9 },
    ],
    images: [
      { url: unsplash("photo-1587147676188-5cc4b94fa62f"), alt: "Soy Candle Set 3 Pack" },
      { url: unsplash("photo-1621939966598-64ff8f12349d"), alt: "Artisan soy candles" },
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
    baseCost: 5.5,
    category: "Organization",
    tags: ["desk-organizer", "acrylic", "minimalist", "clear", "modular"],
    variants: [
      { sku: "NW-DORG-3PC", name: "3-Piece Set", costPrice: 5.5, retailPrice: 22.99, compareAtPrice: 29.99, stock: 120, weight: 0.45 },
      { sku: "NW-DORG-5PC", name: "5-Piece Set", costPrice: 8.0, retailPrice: 32.99, compareAtPrice: 42.99, stock: 80, weight: 0.7 },
    ],
    images: [
      { url: unsplash("photo-1640520813040-b0d23ec11ec6"), alt: "Acrylic Desk Organizer Set" },
      { url: unsplash("photo-1715093973769-b3c0f9af8e3a"), alt: "Clear desk organizer" },
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
    baseCost: 5.0,
    category: "Wall Decor",
    tags: ["pampas-grass", "dried-flowers", "boho", "bouquet", "forever-flowers"],
    variants: [
      { sku: "NW-PAMP-NATRL", name: "Natural (30 stems)", costPrice: 5.0, retailPrice: 19.99, compareAtPrice: 27.99, stock: 140, weight: 0.15 },
      { sku: "NW-PAMP-WHITE", name: "White (30 stems)", costPrice: 5.0, retailPrice: 19.99, compareAtPrice: 27.99, stock: 140, weight: 0.15 },
      { sku: "NW-PAMP-BROWN", name: "Brown (30 stems)", costPrice: 5.0, retailPrice: 19.99, compareAtPrice: 27.99, stock: 140, weight: 0.15 },
    ],
    images: [
      { url: unsplash("photo-1637428289615-af608fb697ae"), alt: "Dried Pampas Grass Bouquet" },
      { url: unsplash("photo-1747670609859-c0ee3e4afbad"), alt: "Fluffy pampas grass stems" },
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
    baseCost: 11.0,
    category: "Lighting",
    tags: ["star-projector", "galaxy", "night-light", "bluetooth", "bedroom"],
    variants: [
      { sku: "NW-STAR-BLK", name: "Black", costPrice: 11.0, retailPrice: 39.99, compareAtPrice: 54.99, stock: 80, weight: 0.45 },
      { sku: "NW-STAR-WHT", name: "White", costPrice: 11.0, retailPrice: 39.99, compareAtPrice: 54.99, stock: 80, weight: 0.45 },
    ],
    images: [
      { url: unsplash("photo-1761083042195-9e0e85189e2e"), alt: "Galaxy Star Projector" },
      { url: unsplash("photo-1768051313568-b35886b9a093"), alt: "Star projector galaxy effect" },
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
    baseCost: 10.0,
    category: "Textiles",
    tags: ["waffle-towel", "japanese", "bath-towel", "quick-dry", "minimalist"],
    variants: [
      { sku: "NW-WAFL-WHITE", name: "White", costPrice: 10.0, retailPrice: 36.99, compareAtPrice: 49.99, stock: 80, weight: 0.8 },
      { sku: "NW-WAFL-BEIGE", name: "Oat Beige", costPrice: 10.0, retailPrice: 36.99, compareAtPrice: 49.99, stock: 80, weight: 0.8 },
      { sku: "NW-WAFL-SAGE", name: "Sage", costPrice: 10.0, retailPrice: 36.99, compareAtPrice: 49.99, stock: 80, weight: 0.8 },
    ],
    images: [
      { url: unsplash("photo-1760445799125-b7441f91cc07"), alt: "Waffle Weave Bath Towel Set" },
      { url: unsplash("photo-1770053506723-c96a4379873b"), alt: "Japanese waffle towels folded" },
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
    baseCost: 6.0,
    category: "Aromatherapy",
    tags: ["incense-burner", "waterfall", "backflow", "ceramic", "zen"],
    variants: [
      { sku: "NW-INCW-MOUNT", name: "Mountain Style", costPrice: 6.0, retailPrice: 22.99, compareAtPrice: 32.99, stock: 120, weight: 0.5 },
      { sku: "NW-INCW-LOTUS", name: "Lotus Style", costPrice: 6.5, retailPrice: 24.99, compareAtPrice: 34.99, stock: 100, weight: 0.55 },
    ],
    images: [
      { url: unsplash("photo-1632146639278-c2203c404d89"), alt: "Ceramic Incense Waterfall Burner" },
      { url: unsplash("photo-1580882268364-19e133712e20"), alt: "Backflow incense smoke" },
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
    baseCost: 3.0,
    category: "Organization",
    tags: ["wall-hooks", "adhesive", "minimalist", "renter-friendly", "nordic"],
    variants: [
      { sku: "NW-HOOK-WHITE", name: "White (8 pack)", costPrice: 3.0, retailPrice: 12.99, compareAtPrice: 18.99, stock: 250, weight: 0.2 },
      { sku: "NW-HOOK-BLACK", name: "Black (8 pack)", costPrice: 3.0, retailPrice: 12.99, compareAtPrice: 18.99, stock: 250, weight: 0.2 },
      { sku: "NW-HOOK-WOOD", name: "Wood Grain (8 pack)", costPrice: 3.5, retailPrice: 14.99, compareAtPrice: 19.99, stock: 200, weight: 0.22 },
    ],
    images: [
      { url: unsplash("photo-1762606368623-81bb2d5f5778"), alt: "Minimalist Wall Hook Set" },
      { url: unsplash("photo-1771817246645-360636939b40"), alt: "Nordic wall hooks installed" },
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
    baseCost: 10.0,
    category: "Wall Decor",
    tags: ["macrame", "mirror", "boho", "wall-mirror", "handwoven"],
    variants: [
      { sku: "NW-MACM-SM", name: 'Small (10")', costPrice: 10.0, retailPrice: 34.99, compareAtPrice: 44.99, stock: 70, weight: 0.7 },
      { sku: "NW-MACM-LG", name: 'Large (16")', costPrice: 15.0, retailPrice: 49.99, compareAtPrice: 64.99, stock: 45, weight: 1.2 },
    ],
    images: [
      { url: unsplash("photo-1752581827072-e831c6234720"), alt: "Boho Macrame Wall Mirror" },
      { url: unsplash("photo-1662903823294-ff3cfee674c4"), alt: "Macrame mirror on wall" },
    ],
    storeIndex: 2,
    isFeatured: false,
    position: 14,
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
