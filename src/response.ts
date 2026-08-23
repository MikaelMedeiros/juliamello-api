export function json(
  data: unknown,
  headers: HeadersInit,
  status = 200
): Response {
  return Response.json(data, {
    status,
    headers,
  });
}

export function noContent(headers?: HeadersInit): Response {
  return new Response(null, {
    status: 204,
    headers,
  });
}