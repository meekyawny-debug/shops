import axios, { type AxiosInstance } from "axios";
import type { SupplierAdapter } from "./types";
import type {
  SupplierProduct,
  ShippingOption,
  SupplierOrderResult,
  TrackingInfo,
} from "@shops/types";

const CJ_BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";

interface CJConfig {
  apiKey: string;
  email?: string;
}

export class CJDropshippingAdapter implements SupplierAdapter {
  readonly name = "CJ Dropshipping";
  readonly type = "CJ_DROPSHIPPING" as const;
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor(private config: CJConfig) {
    this.client = axios.create({
      baseURL: CJ_BASE_URL,
      headers: { "Content-Type": "application/json" },
    });

    this.client.interceptors.request.use(async (reqConfig) => {
      if (!this.accessToken) {
        await this.authenticate();
      }
      reqConfig.headers["CJ-Access-Token"] = this.accessToken;
      return reqConfig;
    });
  }

  private async authenticate(): Promise<void> {
    const response = await axios.post(
      `${CJ_BASE_URL}/authentication/getAccessToken`,
      { apiKey: this.config.apiKey, email: this.config.email }
    );
    if (response.data?.data?.accessToken) {
      this.accessToken = response.data.data.accessToken;
    } else {
      throw new Error("CJ authentication failed");
    }
  }

  async searchProducts(
    query: string,
    page = 1
  ): Promise<{ products: SupplierProduct[]; totalPages: number }> {
    const response = await this.client.get("/product/list", {
      params: {
        productNameEn: query,
        pageNum: page,
        pageSize: 20,
      },
    });

    const data = response.data?.data;
    if (!data) return { products: [], totalPages: 0 };

    const products: SupplierProduct[] = (data.list || []).map(
      (item: Record<string, unknown>) => this.mapProduct(item)
    );

    return {
      products,
      totalPages: data.pageNum ? Math.ceil((data.total as number) / 20) : 1,
    };
  }

  async getProductDetails(productId: string): Promise<SupplierProduct> {
    const response = await this.client.get("/product/query", {
      params: { pid: productId },
    });

    const item = response.data?.data;
    if (!item) throw new Error(`CJ product ${productId} not found`);

    return this.mapProductDetailed(item);
  }

  async getInventory(
    productId: string
  ): Promise<Array<{ variantId: string; stock: number; costPrice: number }>> {
    const product = await this.getProductDetails(productId);
    return product.variants.map((v) => ({
      variantId: v.supplierVariantId,
      stock: v.stock,
      costPrice: v.costPrice,
    }));
  }

  async getShippingOptions(
    productId: string,
    countryCode: string
  ): Promise<ShippingOption[]> {
    const response = await this.client.post(
      "/logistic/freightCalculate",
      {
        startCountryCode: "CN",
        endCountryCode: countryCode,
        products: [{ quantity: 1, vid: productId }],
      }
    );

    const data = response.data?.data;
    if (!data) return [];

    return (data as Array<Record<string, unknown>>).map(
      (option) => ({
        name: option.logisticName as string,
        cost: Number(option.logisticPrice) || 0,
        estimatedDays: Number(option.logisticAging) || 15,
        trackable: (option.logisticType as string) !== "ordinary",
      })
    );
  }

  async createOrder(params: {
    productId: string;
    variantId: string;
    quantity: number;
    shippingAddress: {
      name: string;
      address1: string;
      address2?: string;
      city: string;
      state: string;
      zip: string;
      country: string;
      phone?: string;
    };
    shippingMethod?: string;
  }): Promise<SupplierOrderResult> {
    const response = await this.client.post(
      "/shopping/order/createOrderV2",
      {
        orderNumber: `ORD-${Date.now()}`,
        shippingZip: params.shippingAddress.zip,
        shippingCountryCode: params.shippingAddress.country,
        shippingCountry: params.shippingAddress.country,
        shippingProvince: params.shippingAddress.state,
        shippingCity: params.shippingAddress.city,
        shippingAddress: params.shippingAddress.address1,
        shippingAddress2: params.shippingAddress.address2 || "",
        shippingCustomerName: params.shippingAddress.name,
        shippingPhone: params.shippingAddress.phone || "",
        products: [
          {
            vid: params.variantId,
            quantity: params.quantity,
          },
        ],
        logisticName: params.shippingMethod || "CJPacket Ordinary",
      }
    );

    const data = response.data?.data;
    return {
      supplierOrderId: data?.orderId || data?.orderNum || "",
      status: "PLACED",
    };
  }

  async getOrderStatus(orderId: string): Promise<TrackingInfo | null> {
    const response = await this.client.get("/logistic/getTrackInfo", {
      params: { orderNum: orderId },
    });

    const data = response.data?.data;
    if (!data) return null;

    return {
      trackingNumber: data.trackingNumber || "",
      carrier: data.logisticName || "",
      trackingUrl: data.trackingUrl || undefined,
      status: data.status || "UNKNOWN",
      events: (data.trackInfo || []).map(
        (event: Record<string, unknown>) => ({
          date: event.date as string,
          location: event.location as string | undefined,
          description: event.info as string,
        })
      ),
    };
  }

  private mapProduct(item: Record<string, unknown>): SupplierProduct {
    return {
      supplierProductId: item.pid as string,
      title: item.productNameEn as string,
      description: (item.description as string) || "",
      images: [
        {
          url: item.productImage as string,
          alt: item.productNameEn as string,
        },
      ],
      variants: [
        {
          supplierVariantId: item.pid as string,
          name: "Default",
          options: {},
          costPrice: Number(item.sellPrice) || 0,
          stock: 999,
        },
      ],
      category: item.categoryName as string | undefined,
      tags: [],
      supplierUrl: `https://cjdropshipping.com/product/${item.pid}`,
    };
  }

  private mapProductDetailed(
    item: Record<string, unknown>
  ): SupplierProduct {
    const variants = (
      (item.variants as Array<Record<string, unknown>>) || []
    ).map((v) => ({
      supplierVariantId: v.vid as string,
      name: (v.variantNameEn as string) || "Default",
      options: (v.variantProperty as Record<string, string>) || {},
      costPrice: Number(v.variantSellPrice) || Number(item.sellPrice) || 0,
      stock: Number(v.variantVolume) || 999,
      weight: Number(v.variantWeight) || undefined,
    }));

    const images = (
      (item.productImageSet as Array<string>) ||
      (item.productImage ? [item.productImage] : [])
    ).map((url, i) => ({
      url: url as string,
      alt: `${item.productNameEn} image ${i + 1}`,
    }));

    return {
      supplierProductId: item.pid as string,
      title: (item.productNameEn as string) || "",
      description: (item.description as string) || "",
      images,
      variants:
        variants.length > 0
          ? variants
          : [
              {
                supplierVariantId: item.pid as string,
                name: "Default",
                options: {},
                costPrice: Number(item.sellPrice) || 0,
                stock: 999,
              },
            ],
      category: item.categoryName as string | undefined,
      tags: ((item.productTags as string) || "")
        .split(",")
        .filter(Boolean),
      supplierUrl: `https://cjdropshipping.com/product/${item.pid}`,
    };
  }
}
