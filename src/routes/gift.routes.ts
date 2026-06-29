import { apiKeyMiddleware } from "../middlewares/api-keys";
import { rateLimitMiddleware } from "../middlewares/rate-limit";
import { Route } from "../router";
import { createGift, getGift } from "./gifts";

export const giftRoutes: Route[] = [
  {
    method: "POST",
    pattern: /^\/api\/gifts\/create$/,
    middlewares: [
      apiKeyMiddleware,
      rateLimitMiddleware, 
    ],
    handler: createGift,
  },
  // {
  //   method: "GET",
  //   pattern: /^\/api\/gifts\/([^/]+)$/,
  //   middlewares: [apiKeyMiddleware],
  //   handler: getGift,
  // },
];

