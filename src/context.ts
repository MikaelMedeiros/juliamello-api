export interface RequestContext {
  request: Request;
  env: Env;
  params: RegExpMatchArray;
  corsHeaders: HeadersInit;
}