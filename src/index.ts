import { getCorsHeaders } from "./cors";
import { json } from "./response";
import { Router } from "./router";
import { authRoutes } from "./routes/auth.routes";
import { giftRoutes } from "./routes/gift.routes";

const router = new Router([
  ...giftRoutes,
  ...authRoutes
]);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const corsHeaders = getCorsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    const response = await router.dispatch(
      request,
      env,
      corsHeaders
    );

    if (response) {
      return response;
    }

    return json(
      {
        error: "Not Found",
      },
      corsHeaders,
      404
    );
  },
} satisfies ExportedHandler<Env>;