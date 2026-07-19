import { json } from "../response";

import { RequestContext } from "../context";
import { ClaimGiftRequest } from "../models/claim-gift.request";
import { Gift } from "../models/gift";
import { GiftFilterDto } from "../models/gift-filter.dto";
import { D1GiftRepository } from "../repositories/d1-gift.repository";
import { GiftService } from "../services/gift.service";
import { handleError } from "../exceptions/erro.handler";
import { GiftSearchValidator } from "../validator/gift-search.validator";

export async function createGift(
  context: RequestContext
): Promise<Response> {

  const { env, corsHeaders } = context;

  const repository = new D1GiftRepository(env);

  const giftId = "GFT-" + crypto.randomUUID().substring(0, 8);

  const gift: Gift = {
    id: giftId,
    createdAt: new Date().toISOString(),
    claimed: false,
    claimedAt: null,
    used: false,
    usedAt: null,
    expiresAt: null,
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

  const repository = new D1GiftRepository(env);

  const gift = await repository.findById(params[1]);

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

export async function searchGifts(
  context: RequestContext
): Promise<Response> {

  const { env, corsHeaders } = context;

  
  const repository = new D1GiftRepository(env);
  
  const filter = context.body as GiftFilterDto;
  
  try {

    GiftSearchValidator.validate(filter);

    const page = await repository.findAll(filter);

    return json(
      page,
      corsHeaders,
      200
    );

  } catch (error) {

    return handleError(
      error,
      corsHeaders
    );

  }
}

export async function claimGift(
  context: RequestContext
): Promise<Response> {

  const {
    env,
    params,
    corsHeaders
  } = context;

  const repository = new D1GiftRepository(env);

  const service = new GiftService(
    repository,
    Number(env.EXPIRATION_MONTHS ?? 6)
  );

  const body = context.body as ClaimGiftRequest;

  try {

    const gift = await service.claim(
      params[1],
      body
    );

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

  const repository = new D1GiftRepository(env);

  const service = new GiftService(
    repository,
    Number(env.EXPIRATION_MONTHS ?? 6)
  );

  try {

    const gift = await service.validate(
      params[1]
    );

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