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