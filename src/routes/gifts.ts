import { json } from "../response";

import { RequestContext } from "../context";
import { ClaimGiftRequest } from "../models/claim-gift.request";
import { Gift } from "../models/gift";
import { KvGiftRepository } from "../repositories/kv-gift.repository";
import { GiftService } from "../services/gift.service";
import { handleError } from "../exceptions/erro.handler";
import { GiftFilterDto } from "../models/gift-filter.dto";

export async function createGift(
  context: RequestContext
): Promise<Response> {

  const { env, corsHeaders } = context;

  const repository = new KvGiftRepository(env);

  const giftId = "GFT-" + crypto.randomUUID().substring(0, 8);

  const gift: Gift = {
    id: giftId,
    createdAt: new Date().toISOString(),
    claimed: false,
    used: false,
    usedAt: null,
    name: null,
    phone: null,
  };

  await repository.save(gift);

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

  const repository = new KvGiftRepository(env);

  const gift = await repository.findById(giftId);

  if (!gift) {
    return json(
      { error: "Esse gift não existe." },
      corsHeaders,
      404
    );
  }

  return json(
    gift,
    corsHeaders
  );
}

export async function listGifts(
  context: RequestContext
): Promise<Response> {

  const { request, corsHeaders } = context;

  const url = new URL(request.url);

  const filter: GiftFilterDto = {
    cursor: url.searchParams.get("cursor") ?? undefined,
    pageSize: Number(url.searchParams.get("pageSize") ?? 20),
    claimed: parseBoolean(url.searchParams.get("claimed")),
    used: parseBoolean(url.searchParams.get("used"))
  };

  const repository = new KvGiftRepository(context.env);

  try {
    const page = await repository.findAll(filter);
  
    return json(page, corsHeaders, 200);
  } catch (error) {
    return handleError(
      error,
      corsHeaders
    );
  }
}

function parseBoolean(value: string | null): boolean | undefined {

  if (value === null) {
    return undefined;
  }

  return value === "true";
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

  const service = new GiftService( new KvGiftRepository(env), Number(env.EXPIRATION_MONTHS ?? 6) );

  try {
    const gift = await service.claim(giftId, body);
    return json(
    gift,
    corsHeaders
    );
  } catch (error) {
    return handleError(
        error,
        corsHeaders
    );
  }  
}

export async function validateGift(
  context: RequestContext
): Promise<Response> {

    const {        
        env,
        params,
        corsHeaders
    } = context;    

    const giftId = params[1];

    const service = new GiftService( new KvGiftRepository(env), Number(env.EXPIRATION_MONTHS ?? 6) );

    try {
      const gift = await service.validate(giftId, new KvGiftRepository(env));
  
      return json(
          gift,
          corsHeaders
      );
    } catch (error) {
      return handleError(
          error,
          corsHeaders
      );
    }  
}
