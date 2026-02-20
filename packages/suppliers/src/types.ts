import type {
  SupplierProduct,
  ShippingOption,
  SupplierOrderResult,
  TrackingInfo,
} from "@shops/types";

export interface SupplierAdapter {
  readonly name: string;
  readonly type: "CJ_DROPSHIPPING" | "ALIEXPRESS";

  /** Search products by keyword */
  searchProducts(query: string, page?: number): Promise<{
    products: SupplierProduct[];
    totalPages: number;
  }>;

  /** Get full product details by supplier product ID */
  getProductDetails(productId: string): Promise<SupplierProduct>;

  /** Get current inventory/stock for a product */
  getInventory(productId: string): Promise<
    Array<{
      variantId: string;
      stock: number;
      costPrice: number;
    }>
  >;

  /** Get available shipping options for a product to a country */
  getShippingOptions(
    productId: string,
    countryCode: string
  ): Promise<ShippingOption[]>;

  /** Place an order with the supplier */
  createOrder(params: {
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
  }): Promise<SupplierOrderResult>;

  /** Get order status and tracking info */
  getOrderStatus(orderId: string): Promise<TrackingInfo | null>;
}
