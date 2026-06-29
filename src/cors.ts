export function getCorsHeaders(origin: string | null) {
  const allowedOrigins = [
    "http://192.168.0.109:4300",
    "http://localhost:4300",
    "https://orctattoo.com.br",
    "https://www.orctattoo.com.br",
    "https://juliamellotattoo.com.br",
    "https://www.juliamellotattoo.com.br",
  ];

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}