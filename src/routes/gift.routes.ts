import { Route } from "../router";
import { createGift, getGift } from "./gifts";

export const giftRoutes: Route[] = [
  {
    method: "POST",
    pattern: /^\/api\/gifts\/create$/,
    handler: createGift,
  },
  {
    method: "GET",
    pattern: /^\/api\/gifts\/([^/]+)$/,
    handler: getGift,
  },
];

