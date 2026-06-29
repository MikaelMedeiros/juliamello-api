import { validateApiKey } from "../auth";
import { json } from "../response";

import { RequestContext } from "../context";

export async function createGift(
  context: RequestContext
): Promise<Response> {

  const { request, env, corsHeaders } = context;

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
  request: Request,
  env: Env,
  params: RegExpMatchArray,
  corsHeaders: HeadersInit
): Promise<Response> { 

  if (!validateApiKey(request, env)) {
    return json(
      { error: "Inautorizado!" },
      corsHeaders,
      401
    );
  }

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