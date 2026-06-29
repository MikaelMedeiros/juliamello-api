import { checkRateLimit } from "../rate-limit";
import { validateApiKey } from "../auth";
import { json } from "../response";

export async function createGift(
  request: Request,
  env: Env,
  _params: RegExpMatchArray,
  corsHeaders: HeadersInit
): Promise<Response> {
  const RATE_LIMIT_MAX = Number(env.RATE_LIMIT_MAX ?? 10);
  const RATE_LIMIT_TTL_SECONDS = Number(env.RATE_LIMIT_TTL_SECONDS ?? 300);

  if (!(await checkRateLimit(request, env, RATE_LIMIT_MAX, RATE_LIMIT_TTL_SECONDS))) {
    return json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      corsHeaders,
      429
    );
  }

  if (!validateApiKey(request, env)) {
    return json(
      { error: "Inautorizado!" },
      corsHeaders,
      401
    );
  }

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