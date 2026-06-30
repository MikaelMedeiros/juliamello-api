export interface RequestContext<TBody = unknown> {
  request: Request;
  env: Env;
  params: RegExpMatchArray;
  corsHeaders: HeadersInit;
  body?: TBody;
}