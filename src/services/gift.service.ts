import { Gift } from "../models/gift";

export function createGift(): Gift {
  const giftId = "GFT-" + crypto.randomUUID().substring(0, 8);

  return {
    id: giftId,
    createdAt: new Date().toISOString(),
    claimed: false,
    used: false,
    usedAt: null,
    name: null,
    phone: null,
  };
}