import { apiKeyMiddleware } from "../middlewares/api-keys";
import { rateLimitMiddleware } from "../middlewares/rate-limit";
import { Route } from "../router";
import { createGift, getGift, claimGift, validateGift, listGifts } from "./gifts";

export const giftRoutes: Route[] = [
  {
    method: "POST",
    pattern: /^\/api\/gifts\/create$/,
    middlewares: [
      rateLimitMiddleware, 
      apiKeyMiddleware,
    ],
    handler: createGift,
  },
  {
    method: "GET",
    pattern: /^\/api\/gifts\/([^/]+)$/,
    middlewares: [apiKeyMiddleware],
    handler: getGift,
  },
  {
    method: "GET",
    pattern: /^\/api\/gifts$/,
    middlewares: [apiKeyMiddleware],
    handler: listGifts,
  },
  {
    method: "POST",
    pattern: /^\/api\/gifts\/([^/]+)\/claim$/,
    middlewares: [rateLimitMiddleware],
    handler: claimGift,
  },
  {
    method: "POST",
    pattern: /^\/api\/gifts\/([^/]+)\/validate$/,
    middlewares: [
      rateLimitMiddleware,
      apiKeyMiddleware,
    ],
    handler: validateGift,
  }
];

