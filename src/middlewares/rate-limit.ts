import { Middleware } from "../router";
import { checkRateLimit } from "../rate-limit";
import { json } from "../response";
import { RequestContext } from "../context";

export const rateLimitMiddleware: Middleware = async (
  context: RequestContext
) => {

  const { request, env, corsHeaders } = context;
  const max = Number(env.RATE_LIMIT_MAX ?? 10);
  const ttl = Number(env.RATE_LIMIT_TTL_SECONDS ?? 300);

  if (await checkRateLimit(request, env, max, ttl)) {
    return null;
  }

  return json(
    { error: "Muitas tentativas. Tente novamente mais tarde." },
    corsHeaders,
    429
  );
};