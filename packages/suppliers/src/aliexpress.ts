import type { SupplierAdapter } from "./types";
import type {
  SupplierProduct,
  ShippingOption,
  SupplierOrderResult,
  TrackingInfo,
} from "@shops/types";

interface AliExpressConfig {
  appKey: string;
  appSecret: string;
  accessToken: string;
}

/**
 * AliExpress Dropshipper adapter.
 *
 * Uses the AliExpress Open Platform API. In production, this would use the
 * `ae_sdk` package. Here we implement the HTTP-based fallback for the key
 * endpoints used by the admin import flow.
 */
export class AliExpressAdapter implements SupplierAdapter {
  readonly name = "AliExpress";
  readonly type = "ALIEXPRESS" as const;

  constructor(private config: AliExpressConfig) {}

  private async callApi(
    method: string,
    params: Record<string, unknown>
  ): Promise<unknown> {
    const url = new URL("https://api-sg.aliexpress.com/sync");
    url.searchParams.set("app_key", this.config.appKey);
    url.searchParams.set("method", method);
    url.searchParams.set("access_token", this.config.accessToken);
    url.searchParams.set("sign_method", "sha256");
    url.searchParams.set("timestamp", Date.now().toString());

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)] as [string, string])
      ),
    });

    const data = await response.json();
    return data;
  }

  async searchProducts(
    query: string,
    page = 1
  ): Promise<{ products: SupplierProduct[]; totalPages: number }> {
    const result = (await this.callApi(
      "aliexpress.ds.product.search",
      {
        keywords: query,
        page_no: page,
        page_size: 20,
        sort: "LAST_VOLUME_DESC",
        ship_to_country: "US",
      }
    )) as Record<string, unknown>;

    const resp = result[
      "aliexpress_ds_product_search_response"
    ] as Record<string, unknown>;
    const data = resp?.result as Record<string, unknown>;
    if (!data?.products) return { products: [], totalPages: 0 };

    const items = (
      (data.products as Record<string, unknown>)
        .product as Array<Record<string, unknown>>
    ).map((item) => ({
      supplierProductId: String(item.product_id),
      title: item.product_title as string,
      description: "",
      images: [
        {
          url: item.product_main_image_url as string,
          alt: item.product_title as string,
        },
      ],
      variants: [
        {
          supplierVariantId: String(item.product_id),
          name: "Default",
          options: {},
          costPrice: Number(item.original_price) || 0,
          stock: 999,
        },
      ],
      category: undefined,
      tags: [],
      supplierUrl: item.product_detail_url as string | undefined,
    }));

    return {
      products: items,
      totalPages: Math.ceil(Number(data.total_record_count) / 20),
    };
  }

  async getProductDetails(productId: string): Promise<SupplierProduct> {
    const result = (await this.callApi(
      "aliexpress.ds.product.get",
      {
        product_id: productId,
        ship_to_country: "US",
        target_currency: "USD",
        target_language: "EN",
      }
    )) as Record<string, unknown>;

    const resp = result[
      "aliexpress_ds_product_get_response"
    ] as Record<string, unknown>;
    const data = resp?.result as Record<string, unknown>;
    if (!data) throw new Error(`AliExpress product ${productId} not found`);

    const skuList = (
      (data.ae_item_sku_info_dtos as Record<string, unknown>)
        ?.ae_item_sku_info_d_t_o as Array<Record<string, unknown>>
    ) || [];

    const variants = skuList.map((sku) => {
      const priceInfo = (
        sku.ae_item_sku_info_dtos as Record<string, unknown>
      ) || sku;
      return {
        supplierVariantId: sku.sku_id as string,
        name: (sku.sku_attr as string) || "Default",
        options: {} as Record<string, string>,
        costPrice:
          Number(
            (priceInfo.offer_sale_price as string) ||
              (priceInfo.sku_price as string) ||
              0
          ),
        stock: Number(sku.sku_available_stock) || 0,
        weight: undefined,
      };
    });

    const imageList = (
      (data.ae_multimedia_info_dto as Record<string, unknown>)
        ?.image_urls as string
    )
      ?.split(";")
      .filter(Boolean) || [];

    return {
      supplierProductId: productId,
      title: (data.subject as string) || "",
      description: (data.detail as string) || "",
      images: imageList.map((url, i) => ({
        url,
        alt: `Product image ${i + 1}`,
      })),
      variants:
        variants.length > 0
          ? variants
          : [
              {
                supplierVariantId: productId,
                name: "Default",
                options: {},
                costPrice: 0,
                stock: 0,
              },
            ],
      category: undefined,
      tags: [],
      supplierUrl: `https://www.aliexpress.com/item/${productId}.html`,
    };
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
    const result = (await this.callApi(
      "aliexpress.ds.shipping.info.query",
      {
        product_id: productId,
        country_code: countryCode,
        quantity: 1,
      }
    )) as Record<string, unknown>;

    const resp = result[
      "aliexpress_ds_shipping_info_query_response"
    ] as Record<string, unknown>;
    const data = (resp?.result as Record<string, unknown>)
      ?.freight_list as Array<Record<string, unknown>>;

    if (!data) return [];

    return data.map((option) => ({
      name: option.service_name as string,
      cost: Number((option.freight as Record<string, unknown>)?.cent || 0) / 100,
      estimatedDays: Number(option.estimated_delivery_time) || 20,
      trackable: (option.tracking as boolean) ?? false,
    }));
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
    const result = (await this.callApi(
      "aliexpress.ds.order.create",
      {
        product_id: params.productId,
        sku_id: params.variantId,
        quantity: params.quantity,
        logistics_address: JSON.stringify({
          full_name: params.shippingAddress.name,
          address: params.shippingAddress.address1,
          address2: params.shippingAddress.address2 || "",
          city: params.shippingAddress.city,
          province: params.shippingAddress.state,
          zip: params.shippingAddress.zip,
          country_code: params.shippingAddress.country,
          phone_number: params.shippingAddress.phone || "",
        }),
      }
    )) as Record<string, unknown>;

    const resp = result[
      "aliexpress_ds_order_create_response"
    ] as Record<string, unknown>;
    const data = resp?.result as Record<string, unknown>;

    return {
      supplierOrderId: String(data?.order_id || ""),
      status: data?.is_success ? "PLACED" : "FAILED",
    };
  }

  async getOrderStatus(orderId: string): Promise<TrackingInfo | null> {
    const result = (await this.callApi(
      "aliexpress.ds.order.tracking.get",
      { order_id: orderId }
    )) as Record<string, unknown>;

    const resp = result[
      "aliexpress_ds_order_tracking_get_response"
    ] as Record<string, unknown>;
    const data = resp?.result as Record<string, unknown>;
    if (!data) return null;

    const events = (
      data.details as Array<Record<string, unknown>> | undefined
    )?.map((e) => ({
      date: e.event_date as string,
      location: e.address as string | undefined,
      description: e.event_desc as string,
    })) || [];

    return {
      trackingNumber: (data.tracking_number as string) || "",
      carrier: (data.logistics_company as string) || "",
      trackingUrl: undefined,
      status: (data.logistics_status as string) || "UNKNOWN",
      events,
    };
  }
}
