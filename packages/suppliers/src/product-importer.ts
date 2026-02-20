import { prisma, type SupplierType } from "@shops/db";
import type { SupplierProduct } from "@shops/types";
import type { SupplierAdapter } from "./types";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";

interface ImportOptions {
  adapter: SupplierAdapter;
  productId: string;
  retailPriceMultiplier?: number;
  storeIds?: string[];
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

async function downloadAndUploadImage(
  imageUrl: string,
  productId: string,
  index: number
): Promise<string> {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(response.data);

    // Dynamically import sharp to avoid issues when it's not installed
    let processedBuffer: Buffer;
    try {
      const sharp = (await import("sharp")).default;
      processedBuffer = await sharp(buffer)
        .resize(800, 800, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      processedBuffer = buffer;
    }

    const key = `products/${productId}/${index}.webp`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || "shops-images",
        Key: key,
        Body: processedBuffer,
        ContentType: "image/webp",
      })
    );

    return `${process.env.R2_PUBLIC_URL || ""}/${key}`;
  } catch {
    // If upload fails, return original URL as fallback
    return imageUrl;
  }
}

export async function importProduct(options: ImportOptions) {
  const { adapter, productId, retailPriceMultiplier = 2.5, storeIds = [] } = options;

  // Fetch product from supplier
  const supplierProduct: SupplierProduct =
    await adapter.getProductDetails(productId);

  // Generate a temporary ID for image paths
  const tempId = `${adapter.type}-${productId}`;

  // Download and upload images
  const uploadedImages = await Promise.all(
    supplierProduct.images.map((img, i) =>
      downloadAndUploadImage(img.url, tempId, i).then((url) => ({
        url,
        alt: img.alt || `${supplierProduct.title} - Image ${i + 1}`,
        position: i,
      }))
    )
  );

  // Create product in database
  const product = await prisma.product.create({
    data: {
      title: supplierProduct.title,
      description: supplierProduct.description,
      supplierType: adapter.type as SupplierType,
      supplierProductId: supplierProduct.supplierProductId,
      supplierUrl: supplierProduct.supplierUrl || null,
      baseCost: Math.min(
        ...supplierProduct.variants.map((v) => v.costPrice)
      ),
      category: supplierProduct.category || null,
      tags: supplierProduct.tags,
      variants: {
        create: supplierProduct.variants.map((v, i) => ({
          sku: `${adapter.type.substring(0, 2)}-${productId}-${i}`,
          name: v.name,
          options: v.options,
          costPrice: v.costPrice,
          retailPrice: Number((v.costPrice * retailPriceMultiplier).toFixed(2)),
          stock: v.stock,
          weight: v.weight || null,
          supplierVariantId: v.supplierVariantId,
        })),
      },
      images: {
        create: uploadedImages,
      },
      storeProducts: {
        create: storeIds.map((storeId, i) => ({
          storeId,
          isActive: true,
          position: i,
        })),
      },
    },
    include: {
      variants: true,
      images: true,
      storeProducts: true,
    },
  });

  return product;
}

export async function syncProductInventory(
  adapter: SupplierAdapter,
  supplierProductId: string,
  dbProductId: string
) {
  const inventory = await adapter.getInventory(supplierProductId);

  const updates = await Promise.all(
    inventory.map(async (item) => {
      const variant = await prisma.productVariant.findFirst({
        where: {
          productId: dbProductId,
          supplierVariantId: item.variantId,
        },
      });

      if (!variant) return null;

      return prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          stock: item.stock,
          costPrice: item.costPrice,
          isActive: item.stock > 0,
        },
      });
    })
  );

  return updates.filter(Boolean);
}
