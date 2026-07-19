import { jwtAuthMiddleware } from "../middlewares/jwt-auth";
import { rateLimitMiddleware } from "../middlewares/rate-limit";
import { Route } from "../router";
import { createGift, getGift, claimGift, validateGift, searchGifts } from "./gifts";

export const giftRoutes: Route[] = [
  {
    method: "POST",
    pattern: /^\/api\/gifts\/create$/,
    middlewares: [
      rateLimitMiddleware, 
      jwtAuthMiddleware,
    ],
    handler: createGift,
  },
  {
    method: "GET",
    pattern: /^\/api\/gifts\/([^/]+)$/,
    middlewares: [jwtAuthMiddleware],
    handler: getGift,
  },
  {
    method: "POST",
    pattern: /^\/api\/gifts\/search$/,
    middlewares: [jwtAuthMiddleware],
    handler: searchGifts,
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
      jwtAuthMiddleware,
    ],
    handler: validateGift,
  }
];

