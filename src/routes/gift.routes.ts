import { Route } from "../router";
import { createGift } from "./gifts";

export const giftRoutes: Route[] = [
  {
    method: "POST",
    pattern: /^\/api\/gifts\/create$/,
    handler: createGift,
  },
];