import { json } from "../response";
import { AppException } from "./app.exception";

export function handleError(
  error: unknown,
  corsHeaders: HeadersInit
): Response {

  if (error instanceof AppException) {
    return json(
      {
        error: error.message
      },
      corsHeaders,
      error.status
    );
  }

  console.error(error);

  return json(
    {
      error: "Erro interno."
    },
    corsHeaders,
    500
  );
}