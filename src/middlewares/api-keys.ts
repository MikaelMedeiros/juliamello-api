import { RequestContext } from "../context";
import { json } from "../response";
import { Middleware } from "../router";

export const apiKeyMiddleware: Middleware = async (
  context: RequestContext
) => {

  const { request, env, corsHeaders } = context;

  const key = request.headers.get("x-api-key");

  if (key === env.SECRET_KEY) {
    return null;
  }

  return json(
    { error: "Unauthorized!" },
    corsHeaders,
    401
  );
};