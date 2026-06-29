export async function checkRateLimit(
  request: Request,
  env: Env,
  max: number,
  ttlSeconds: number
): Promise<boolean> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";

  const key = `ratelimit:${ip}`;

  const current = Number((await env.GIFTS.get(key)) ?? 0);

  if (current >= max) {
    return false;
  }

  await env.GIFTS.put(key, String(current + 1), {
    expirationTtl: ttlSeconds,
  });

  return true;
}