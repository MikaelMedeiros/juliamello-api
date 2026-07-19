import { RequestContext } from "./context";

export type Middleware = (
  context: RequestContext
) => Promise<Response | null>;

export type RouteHandler = (
  context: RequestContext
) => Promise<Response>;

export interface Route {
  method: string;
  pattern: RegExp;
  middlewares?: Middleware[];
  handler: RouteHandler;
}

export class Router {

  constructor(
    private readonly routes: Route[]
  ) {}

  async dispatch(
    request: Request,
    env: Env,
    corsHeaders: HeadersInit
  ): Promise<Response | null> {

    const pathname = new URL(request.url).pathname;

    for (const route of this.routes) {

      if (route.method !== request.method) {
        continue;
      }

      const match = pathname.match(route.pattern);

      if (!match) {
        continue;
      }

      const context: RequestContext = {
        request,
        env,
        params: match,
        corsHeaders,
      };

      if (["POST", "PUT", "PATCH"].includes(request.method)) {

        const contentType =
          request.headers.get("content-type") ?? "";

        if (contentType.includes("application/json")) {
          context.body = await request.json();
        }

      }

      if (route.middlewares) {

        for (const middleware of route.middlewares) {

          const response = await middleware(context);

          if (response) {
            return response;
          }

        }

      }

      return await route.handler(context);

    }

    return null;

  }

}