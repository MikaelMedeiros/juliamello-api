export function validateApiKey(request: Request, env: Env): boolean {
  const key = request.headers.get("x-api-key");

  return key === env.SECRET_KEY;
}