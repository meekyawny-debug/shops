import { router } from "./trpc";
import { storeRouter } from "./routers/store";
import { productRouter } from "./routers/product";
import { orderRouter } from "./routers/order";
import { analyticsRouter } from "./routers/analytics";
import { supplierRouter } from "./routers/supplier";

export const appRouter = router({
  store: storeRouter,
  product: productRouter,
  order: orderRouter,
  analytics: analyticsRouter,
  supplier: supplierRouter,
});

export type AppRouter = typeof appRouter;
