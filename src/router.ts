export type RouteHandler = (
  request: Request,
  env: Env,
  params: RegExpMatchArray,
  corsHeaders: HeadersInit
) => Promise<Response>;

export interface Route {
  method: string;
  pattern: RegExp;
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

      if (match) {
        return route.handler(
          request,
          env,
          match,
          corsHeaders
        );
      }
    }

    return null;
  }
}