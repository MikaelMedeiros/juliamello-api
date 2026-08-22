export interface RequestContext<TBody = unknown> {
  request: Request;
  env: Env;
  params: RegExpMatchArray;
  corsHeaders: HeadersInit;
  user?: {
    id: string;
    organizationId: string;
    role: "OWNER" | "ADMIN" | "STAFF";
    organizationSlug: string;
    email: string;
    name: string;
    picture?: string;
  };
  body?: TBody;
}