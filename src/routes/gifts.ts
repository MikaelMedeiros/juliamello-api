import { json } from "../response";

import { RequestContext } from "../context";
import { ClaimGiftRequest } from "../models/claim-gift.request";

export async function createGift(
  context: RequestContext
): Promise<Response> {

  const { env, corsHeaders } = context;

  const giftId = "GFT-" + crypto.randomUUID().substring(0, 8);

  const gift = {
    id: giftId,
    createdAt: new Date().toISOString(),
    claimed: false,
    used: false,
    usedAt: null,
    name: null,
    phone: null,
  };

  await env.GIFTS.put(
    `gift:${giftId}`,
    JSON.stringify(gift)
  );

  return json(
    {
      giftId,
      claimUrl: `/claim/${giftId}`,
    },
    corsHeaders,
    201
  );
}

export async function getGift(
  context: RequestContext
): Promise<Response> {

  const { params, env, corsHeaders } = context;   

  const giftId = params[1];

  const gift = await env.GIFTS.get(`gift:${giftId}`);

  if (!gift) {
    return json(
      { error: "Esse gift não existe." },
      corsHeaders,
      404
    );
  }

  return json(
    JSON.parse(gift),
    corsHeaders
  );
}

export async function claimGift(
  context: RequestContext
): Promise<Response> {

    const {
        env,
        params,
        corsHeaders
    } = context;

    const body = context.body as ClaimGiftRequest;

    const giftId = params[1];

    if (!body?.name?.trim()) {
        return json(
        { error: "Faltou informar o nome :(" },
        corsHeaders,
        400
        );
    }

    if (!body?.phone?.trim()) {
        return json(
        { error: "Esqueceu de digitar seu WhatsApp u_u" },
        corsHeaders,
        400
        );
    }

    const giftRaw = await env.GIFTS.get(`gift:${giftId}`);

    if (!giftRaw) {
        return json(
            { error: "Esse gift não existe e_e" },
            corsHeaders,
            404
        );
    }

    const gift = JSON.parse(giftRaw);

    if (gift.used) {
        return json(
            { error: "Esse gift já foi utilizado e-e" },
            corsHeaders,
            409
        );
    }

    if (gift.claimed) {
        return json(
            { error: "Já resgataram esse, hein e-e" },
            corsHeaders,
            409
        );
    }

    gift.claimed = true;
    gift.claimedAt = new Date().toISOString();
    gift.name = body.name;
    gift.phone = body.phone.replace(/\D/g, "");
    gift.used = false;
    gift.usedAt = null;

    const expirationMonths = Number(env.EXPIRATION_MONTHS ?? 6);
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + expirationMonths);

    gift.expiresAt = expiresAt.toISOString();

    await env.GIFTS.put(
        `gift:${giftId}`,
        JSON.stringify(gift)
    );

    return json(
        gift,
        corsHeaders
    );
}