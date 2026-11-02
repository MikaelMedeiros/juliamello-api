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

  if (
    error instanceof Error &&
    "expose" in error &&
    error.expose === true &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status <= 599
  ) {
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